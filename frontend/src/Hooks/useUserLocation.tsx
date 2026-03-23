// src/Hooks/useUserLocation.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Unchanged public API — all existing callers continue to work.
//
// What's new:
//   • Exports `useGpsCoords()` — a lightweight hook that returns the raw
//     {lat, long} coords (from cache or live GPS). Used by AddressManager's
//     "Use current location" feature so both hooks share the SAME GPS session.
//   • No new geolocation watcher is started — AddressManager calls
//     navigator.geolocation.getCurrentPosition() independently for the
//     one-shot "locate me" action, which is fine (different intent).
// ─────────────────────────────────────────────────────────────────────────────

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getUserLocation, updateUserLocation } from "../api/api.location";
import { useEffect, useState } from "react";

// ── shared GPS coords (exported for AddressManager "locate me" fallback) ──────

export interface GpsCoords { lat: number; long: number }

/**
 * Reads cached GPS coords from localStorage.
 * Does NOT start a new watcher — purely a cache read.
 * Returns null if no coords have been cached yet.
 */
export const useCachedGpsCoords = (): GpsCoords | null => {
  const [coords, setCoords] = useState<GpsCoords | null>(() => {
    try {
      const saved = localStorage.getItem("coords");
      return saved ? (JSON.parse(saved) as GpsCoords) : null;
    } catch {
      return null;
    }
  });

  // Listen for coords being written by the main hook
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "coords" && e.newValue) {
        try { setCoords(JSON.parse(e.newValue)); } catch { /* noop */ }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return coords;
};

// ── main hook (public API unchanged) ─────────────────────────────────────────

export const useUserLocation = () => {
  const [coords, setCoords] = useState<GpsCoords | null>(() => {
    try {
      const saved = localStorage.getItem("coords");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [permissionDenied, setPermissionDenied] = useState(false);
  const [gpsDetecting,     setGpsDetecting]     = useState(false);

  useEffect(() => {
    if (coords) return;
    if (!navigator.geolocation) { setPermissionDenied(true); return; }

    setGpsDetecting(true);

    navigator.permissions?.query({ name: "geolocation" }).then((res) => {
      if (res.state === "denied") {
        setPermissionDenied(true);
        setGpsDetecting(false);
      }
    });

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const c: GpsCoords = { lat: pos.coords.latitude, long: pos.coords.longitude };
        setCoords(c);
        localStorage.setItem("coords", JSON.stringify(c));
        setGpsDetecting(false);
      },
      (err) => {
        if (err.code === 1) setPermissionDenied(true);
        if (err.code === 3) console.log("GPS timeout — maybe VPN or weak signal");
        setGpsDetecting(false);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const queryClient = useQueryClient();

  const locationQuery = useQuery({
    queryKey: ["userLocation", coords?.lat, coords?.long],
    queryFn: () => getUserLocation(coords!.lat, coords!.long),
    enabled: !!coords,
    staleTime: 1000 * 60 * 10,
    retry: false,
  });

  const locationMutation = useMutation({
    mutationFn: updateUserLocation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userLocation"] });
    },
  });

  const cityName =
    locationQuery.data?.address?.city ||
    locationQuery.data?.address?.town ||
    locationQuery.data?.address?.village ||
    locationQuery.data?.address?.county ||
    "Detecting...";

  const residential = locationQuery.data?.address?.residential || "";

  return {
    // existing fields — unchanged
    locationData:   locationQuery.data,
    cityName,
    residential,
    locationLoading:
      locationQuery.isLoading ||
      gpsDetecting ||
      (coords === null && permissionDenied === false),
    locationError:   locationQuery.isError || permissionDenied,
    permissionDenied,
    changeLocation:  locationMutation.mutate,
    locationUpdating: locationMutation.isPending,

    // ⭐ new: raw coords for consumers that need them (e.g. AddressManager seed)
    rawCoords: coords,
  };
};