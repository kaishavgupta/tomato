// src/pages/Cart.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Key fixes vs previous version:
//   • cartData is now a flat items array (AppProvider extracts cartDoc.items)
//   • isOpen and restaurantId sourced from cartDoc / cartMeta, not cartData[0]
//   • subtotal computed from item.price * quantity (ICart items store price directly)
//   • useDeliveryInfo reads restaurantId from cartMeta
//   • handlePlaceOrder wired and ready (uncomment place_order call when API ready)
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useUser from "../../Hooks/useUser";
import toast from "react-hot-toast";
import type { DeliveryInfo } from "./Cart/BillSummary";
import type { UserAddress } from "../../api/api.address";
import { useAddress } from "../../Hooks/useAddresses";

import { CartLoading } from "./Cart/Cartloading";
import { CartEmpty } from "./Cart/CartEmpty";
import { DeliveryAddress } from "./Cart/DeliveryAddress";
import { PaymentMethod } from "./Cart/PaymentMethod";
import { BillSummary } from "./Cart/BillSummary";
import { PlaceOrderButton } from "./Cart/PlaceOrderButton";
import { CartItemRow } from "./Cart/CartItemRow";
import { RestaurantBanner } from "./Cart/RestaurentBanner";
import { StickyHeader } from "./Cart/StickyHeader";
import { MoreFromRestaurant } from "./Cart/MoreFromRestaurant";
import { useEffect } from "react";
import useOrder from "../../Hooks/useOrder";

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');

    @keyframes fadeUp   { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
    @keyframes popIn    { from{opacity:0;transform:scale(0.9)}        to{opacity:1;transform:scale(1)}    }
    @keyframes shimmer  { from{background-position:-200% 0}           to{background-position:200% 0}      }
    @keyframes slideIn  { from{opacity:0;transform:translateX(-10px)} to{opacity:1;transform:translateX(0)} }
    @keyframes s-fadeUp { from{opacity:0;transform:translateY(16px)}  to{opacity:1;transform:translateY(0)} }
    @keyframes spin     { to{transform:rotate(360deg)} }
    @keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:0.5} }

    .cart-item-row { transition: box-shadow 0.2s, transform 0.2s; }
    .cart-item-row:hover { box-shadow: 0 6px 24px rgba(226,55,116,0.10); transform: translateY(-1px); }

    .qty-btn { transition: transform 0.15s, opacity 0.15s; }
    .qty-btn:hover:not(:disabled) { transform: scale(1.12); }
    .qty-btn:disabled { opacity: 0.45; cursor: not-allowed; }

    .place-btn { transition: transform 0.18s, box-shadow 0.18s, background 0.25s; }
    .place-btn:not(:disabled):hover  { transform: translateY(-2px); box-shadow: 0 10px 32px rgba(226,55,116,0.45) !important; }
    .place-btn:not(:disabled):active { transform: scale(0.98); }
  `}</style>
);

function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// restaurantMeta is whatever your cartMeta.restaurant object looks like
function useDeliveryInfo(restaurantMeta: any): DeliveryInfo {
  const [info, setInfo] = useState<DeliveryInfo>({
    fee: 40,
    distanceKm: null,
    etaMin: null,
    loading: true,
    source: "fallback",
  });

  useEffect(() => {
    if (!restaurantMeta) {
      setInfo({
        fee: 0,
        distanceKm: null,
        etaMin: null,
        loading: false,
        source: "fallback",
      });
      return;
    }

    // Support both GeoJSON [lng,lat] coordinates array and lat/lng flat fields
    const rLat: number | undefined =
      restaurantMeta?.autoLocation?.coordinates?.[1] ??
      restaurantMeta?.autoLocation?.lat ??
      restaurantMeta?.lat;
    const rLon: number | undefined =
      restaurantMeta?.autoLocation?.coordinates?.[0] ??
      restaurantMeta?.autoLocation?.lng ??
      restaurantMeta?.autoLocation?.lon ??
      restaurantMeta?.lng;

    if (
      typeof rLat !== "number" ||
      typeof rLon !== "number" ||
      !navigator.geolocation
    ) {
      setInfo({
        fee: 40,
        distanceKm: null,
        etaMin: null,
        loading: false,
        source: "fallback",
      });
      return;
    }

    setInfo((prev) => ({ ...prev, loading: true }));
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const km = haversineKm(
          pos.coords.latitude,
          pos.coords.longitude,
          rLat,
          rLon,
        );
        const fee = Math.min(80, Math.round((20 + km * 8) / 5) * 5);
        setInfo({
          fee,
          distanceKm: parseFloat(km.toFixed(1)),
          etaMin: Math.ceil(10 + km * 3),
          loading: false,
          source: "geo",
        });
      },
      () =>
        setInfo({
          fee: 40,
          distanceKm: null,
          etaMin: null,
          loading: false,
          source: "fallback",
        }),
      { timeout: 6000, maximumAge: 60_000 },
    );
    // Re-run only when the restaurant actually changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantMeta?._id ?? restaurantMeta?.name]);

  return info;
}

const Cart = () => {
  const navigate = useNavigate();
  // cartData = ICart["items"][] (flat array of cart line items)
  // cartDoc  = full ICart document (has totalQty, totalAmount, restaurantId, restaurant)
  // cartMeta = { restaurant, restaurantId } shortcut
  const {
    cartData: items,
    cartDoc,
    cartMeta,
    cartLoading,
    clearCart,
  } = useUser();
  const { makeOrder } = useOrder();
  const { hasAddresses, isLoading: addressLoading } = useAddress();

  const [selectedAddress, setSelectedAddress] = useState<UserAddress | null>(
    null,
  );
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "stripe">(
    "razorpay",
  );
  const [placing, setPlacing] = useState(false);

  // Delivery info driven by restaurant metadata from cartDoc
  const delivery = useDeliveryInfo(cartMeta?.restaurant ?? null);

  const platformFee = 2;

  // isOpen: sourced from cartDoc's populated restaurant data if available
  // cartDoc.restaurant currently only stores { name, logo } (set at add-to-cart time),
  // so isOpen defaults to true unless your backend populates it further.
  // If you later populate restaurantId on viewcart, switch to cartDoc?.restaurantId?.isOpen
  // restaurantId is populated: { _id, isOpen } — read isOpen directly
  const isOpen: boolean = (cartDoc?.restaurantId as any)?.isOpen ?? true;

  // subtotal: ICart items already store the effective price at add-to-cart time
  const subtotal = (items ?? []).reduce(
    (sum: number, ci: any) => sum + (ci.price ?? 0) * (ci.quantity ?? 1),
    0,
  );
  const total = subtotal + delivery.fee + platformFee;

  // ── order handler ────────────────────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    if (!isOpen) {
      toast.error(
        "This restaurant is currently closed. Please try again later.",
      );
      return;
    }
    if (!hasAddresses || !selectedAddress) {
      toast.error("Please add a delivery address first.");
      navigate("/settings/address");
      return;
    }
    if (!items || items.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    setPlacing(true);
    try {
      // ── Uncomment when order API is ready ──────────────────────────────────
      // await place_order({
      //   deliveryAddressId: selectedAddress._id,
      //   deliveryAddress:   selectedAddress.userAddress.formatedAddress,
      //   phone:             selectedAddress.phone,
      //   paymentMethod,
      // });
      makeOrder.mutate({
        addressId: selectedAddress._id, // no need stringify
        paymentMethod: paymentMethod,
      });
    } catch (err: any) {
      toast.error(err?.msg || "Failed to place order. Try again.");
    } finally {
      setPlacing(false);
    }
  };

  const canPlace = isOpen && hasAddresses && !!selectedAddress;

  const itemList = items ?? [];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#FFF8F0",
        fontFamily: "'DM Sans',sans-serif",
      }}
    >
      <GlobalStyles />

      <StickyHeader clearCart={clearCart} items={itemList} isOpen={isOpen} />

      <div
        style={{ padding: "16px 16px 40px", maxWidth: 520, margin: "0 auto" }}
      >
        {cartLoading && <CartLoading />}

        {!cartLoading && itemList.length === 0 && <CartEmpty />}

        {!cartLoading && itemList.length > 0 && (
          <>
            {/* RestaurantBanner receives cartMeta for name/logo/isOpen */}
            <RestaurantBanner cartDoc={cartDoc} />

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                marginBottom: 24,
              }}
            >
              {itemList.map((ci: any, i: number) => (
                <CartItemRow
                  key={ci._id ?? ci.itemId ?? i}
                  cartItem={ci}
                  delay={i * 0.04}
                />
              ))}
            </div>

            {cartMeta?.restaurantId && (
              <MoreFromRestaurant
                restaurantId={cartMeta?.restaurantId as string}
                cartItems={itemList}
                isOpen={isOpen}
              />
            )}

            <DeliveryAddress
              selectedAddress={selectedAddress}
              onSelect={setSelectedAddress}
              isOpen={isOpen}
            />

            <PaymentMethod
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
            />

            <BillSummary
              platformfee={platformFee}
              subtotal={subtotal}
              delivery={delivery}
              isOpen={isOpen}
            />

            <PlaceOrderButton
              total={subtotal}
              placing={placing}
              deliveryLoading={false}
              isOpen={canPlace}
              onPlaceOrder={handlePlaceOrder}
              noAddress={!hasAddresses}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Cart;