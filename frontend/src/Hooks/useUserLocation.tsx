import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getUserLocation, updateUserLocation } from "../api/api.location";
import { useEffect, useState } from "react";

export const useUserLocation = () => {
  const [coords, setCoords] = useState<{ lat: number; long: number } | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    // ✅ Ask for location permission as soon as hook mounts
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude,
          long: pos.coords.longitude,
        });
      },
      (err) => {
        console.log("Location permission denied:", err.message);
        setPermissionDenied(true);
      }
    );
  }, []);

  const queryClient = useQueryClient();

  const locationQuery = useQuery({
    queryKey: ["userLocation", coords?.lat, coords?.long],
    queryFn: () => getUserLocation(coords!.lat, coords!.long),
    enabled: !!coords,           // only runs after coords are available
    staleTime: 1000 * 60 * 10,  // cache location for 10 min
    retry: false,
  });

  const locationMutation = useMutation({
    mutationFn: updateUserLocation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userLocation"] });
    },
  });

  // Extract city name from Nominatim response
  const cityName =
    locationQuery.data?.address?.city ||
    locationQuery.data?.address?.town ||
    locationQuery.data?.address?.village ||
    locationQuery.data?.address?.county ||
    "Detecting...";

    const residential = locationQuery.data?.address?.residential||"";

  return {
    locationData: locationQuery.data,
    cityName,
    residential,                              // ✅ ready-to-display city string
    locationLoading: locationQuery.isLoading || (!coords && !permissionDenied),
    locationError: locationQuery.isError || permissionDenied,
    permissionDenied,
    changeLocation: locationMutation.mutate,
    locationUpdating: locationMutation.isPending,
  };
};