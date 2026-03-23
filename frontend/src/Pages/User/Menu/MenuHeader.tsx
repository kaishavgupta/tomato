// src/pages/menu/menuComponents/MenuHeader.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Changes vs previous version:
//   • New `restaurantImage` prop — the restaurant's logo/cover URL
//   • In restaurant mode: renders a prominent identity strip (logo + name + city
//     + item count + closed badge) between the nav row and the search bar.
//     This is the banner the user sees when they tap "Full menu".
//   • Closed state: dark-hero pill badge + subtle warning bar below search,
//     same as before but the identity strip also dims the logo to reinforce it.
// ─────────────────────────────────────────────────────────────────────────────

import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiShoppingCart, FiGrid, FiList, FiMapPin } from "react-icons/fi";
import { DarkHero, GradText } from "../../../components/menuShared";

interface MenuHeaderProps {
  restaurantId?:    string;
  restaurantName?:  string;   // populated from first menu item's restaurant
  restaurantImage?: string;   // logo / cover image URL
  restaurantCity?:  string;   // optional city
  totalItems?:      number;   // total available item count (for the identity strip)
  isOpen?:          boolean;  // undefined = loading, false = closed, true = open
  totalCount:       number;   // shown in subtitle "N items available"
  isInitialLoad:    boolean;
  cartQuantity:     number;
  search:           string;
  setSearch:        (v: string) => void;
  vegOnly:          boolean;
  setVegOnly:       (v: boolean) => void;
  view:             "grid" | "list";
  setView:          (v: "grid" | "list") => void;
}

export const MenuHeader = ({
  restaurantId, restaurantName, restaurantImage, restaurantCity,
  totalItems, isOpen,
  totalCount, isInitialLoad, cartQuantity,
  search, setSearch, vegOnly, setVegOnly, view, setView,
}: MenuHeaderProps) => {
  const navigate = useNavigate();
  const isClosed = restaurantId != null && isOpen === false;
  const [imgErr, setImgErr] = React.useState(false);

  console.log(restaurantId,restaurantName,restaurantImage,restaurantCity,isOpen);
  

  return (
    <DarkHero>
      <div style={{ padding: "36px 20px 44px", maxWidth: 680, margin: "0 auto" }}>

        {/* ── Row 1: back + title + cart ─────────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: restaurantId ? 20 : 22 }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              width: 38, height: 38, borderRadius: 12,
              background: "rgba(226,55,116,0.12)", border: "1px solid rgba(226,55,116,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "#E23774", flexShrink: 0,
            }}
          >
            <FiArrowLeft size={16} />
          </button>

          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <h1 style={{
                fontFamily: "'Playfair Display',serif",
                fontSize: "clamp(22px,5vw,32px)",
                fontWeight: 900, color: "#FEF3C7", lineHeight: 1.05,
              }}>
                {restaurantId
                  ? <><GradText>Menu</GradText></>
                  : <>Explore <GradText>Dishes</GradText></>}
              </h1>
              {isClosed && (
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 4,
                  padding: "3px 9px", borderRadius: 99,
                  background: "rgba(176,0,0,0.5)", backdropFilter: "blur(4px)",
                  fontSize: 9, fontWeight: 800, color: "#ffaaaa",
                  letterSpacing: "0.07em", textTransform: "uppercase",
                }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#ff8080", display: "inline-block" }} />
                  Closed
                </span>
              )}
            </div>
            <p style={{ fontSize: 12, color: "rgba(254,243,199,0.4)", marginTop: 2 }}>
              {isInitialLoad
                ? "Loading…"
                : `${totalCount} ${restaurantId ? "items" : "restaurants"} available`}
            </p>
          </div>

          <button
            onClick={() => navigate("/cart")}
            style={{
              width: 42, height: 42, borderRadius: 14,
              background: "linear-gradient(135deg,#E23774,#FF6B35)",
              border: "none", display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", position: "relative", flexShrink: 0,
            }}
          >
            <FiShoppingCart size={17} color="white" />
            {cartQuantity > 0 && (
              <span style={{
                position: "absolute", top: -5, right: -5, width: 18, height: 18,
                borderRadius: "50%", background: "#1A0A00", color: "white",
                fontSize: 10, fontWeight: 900,
                display: "flex", alignItems: "center", justifyContent: "center",
                animation: "s-popIn 0.3s ease both",
              }}>
                {cartQuantity > 9 ? "9+" : cartQuantity}
              </span>
            )}
          </button>
        </div>

        {/* ── Row 2: Restaurant identity strip (restaurant mode only) ─────── */}
        {restaurantId && (
          <div style={{
            display: "flex", alignItems: "center", gap: 14, marginBottom: 20,
            padding: "14px 16px", borderRadius: 20,
            background: "rgba(255,248,240,0.06)",
            border: `1.5px solid ${isClosed ? "rgba(176,0,0,0.30)" : "rgba(226,55,116,0.22)"}`,
            backdropFilter: "blur(8px)",
            animation: "s-fadeUp 0.35s ease both",
          }}>
            {/* Logo */}
            <div style={{
              width: 56, height: 56, borderRadius: 16, flexShrink: 0,
              overflow: "hidden",
              background: "linear-gradient(135deg,rgba(226,55,116,0.18),rgba(255,107,53,0.18))",
              border: `1.5px solid ${isClosed ? "rgba(176,0,0,0.28)" : "rgba(226,55,116,0.28)"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {restaurantImage && !imgErr
                ? <img
                    src={restaurantImage}
                    alt={restaurantName}
                    style={{
                      width: "100%", height: "100%", objectFit: "cover",
                      filter: isClosed ? "grayscale(60%) brightness(0.75)" : "none",
                    }}
                    onError={() => setImgErr(true)}
                  />
                : <span style={{ fontSize: 26, filter: isClosed ? "grayscale(60%)" : "none" }}>🍽️</span>
              }
            </div>

            {/* Name + meta */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                <p style={{
                  fontFamily: "'Playfair Display',serif",
                  fontSize: 18, fontWeight: 900,
                  color: isClosed ? "rgba(254,243,199,0.5)" : "#FEF3C7",
                  lineHeight: 1.1,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {restaurantName ?? "Restaurant"}
                </p>
                {isClosed && (
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 4,
                    padding: "3px 9px", borderRadius: 99,
                    background: "rgba(176,0,0,0.55)", border: "1px solid rgba(255,100,100,0.3)",
                    fontSize: 9, fontWeight: 800, color: "#ffaaaa",
                    letterSpacing: "0.07em", textTransform: "uppercase", flexShrink: 0,
                  }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#ff8080", display: "inline-block" }} />
                    Closed
                  </span>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                {restaurantCity && (
                  <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "rgba(254,243,199,0.45)" }}>
                    <FiMapPin size={10} style={{ color: isClosed ? "rgba(255,150,150,0.5)" : "#E23774", flexShrink: 0 }} />
                    {restaurantCity}
                  </span>
                )}
                {totalItems != null && (
                  <span style={{
                    fontSize: 11, fontWeight: 700,
                    color: isClosed ? "rgba(254,243,199,0.35)" : "rgba(226,55,116,0.85)",
                  }}>
                    {totalItems} items
                  </span>
                )}
              </div>
            </div>

            {/* Open / Closed status dot */}
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flexShrink: 0,
            }}>
              <span style={{
                width: 10, height: 10, borderRadius: "50%", display: "inline-block",
                background: isClosed ? "#b00" : "#22c55e",
                boxShadow: isClosed
                  ? "0 0 0 3px rgba(176,0,0,0.25)"
                  : "0 0 0 3px rgba(34,197,94,0.25)",
              }} />
              <span style={{
                fontSize: 9, fontWeight: 800, letterSpacing: "0.07em", textTransform: "uppercase",
                color: isClosed ? "rgba(255,150,150,0.7)" : "rgba(134,239,172,0.8)",
              }}>
                {isClosed ? "Closed" : "Open"}
              </span>
            </div>
          </div>
        )}

        {/* ── Row 3: Search + veg toggle + view toggle ────────────────────── */}
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{
            flex: 1, display: "flex", alignItems: "center",
            background: "rgba(255,248,240,0.06)",
            border: "1.5px solid rgba(226,55,116,0.22)",
            borderRadius: 14, overflow: "hidden",
          }}>
            <span style={{ padding: "0 12px", color: "rgba(226,55,116,0.5)", flexShrink: 0 }}>🔍</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={restaurantId ? "Search dishes…" : "Search restaurants or dishes…"}
              style={{
                flex: 1, background: "transparent", border: "none", outline: "none",
                padding: "11px 0", fontSize: 13, color: "#FEF3C7",
                fontFamily: "'DM Sans',sans-serif",
              }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                style={{
                  margin: 4, padding: "6px 10px", background: "rgba(226,55,116,0.15)",
                  border: "none", borderRadius: 10, color: "#E23774",
                  fontSize: 11, fontWeight: 700, cursor: "pointer",
                }}
              >
                ✕
              </button>
            )}
          </div>
          <button
            onClick={() => setVegOnly(v => !v)}
            style={{
              padding: "0 14px", borderRadius: 14,
              background: vegOnly ? "rgba(22,163,74,0.15)" : "rgba(255,248,240,0.06)",
              border: `1.5px solid ${vegOnly ? "rgba(22,163,74,0.4)" : "rgba(226,55,116,0.22)"}`,
              color: vegOnly ? "#4ade80" : "rgba(254,243,199,0.5)",
              fontSize: 11, fontWeight: 700, cursor: "pointer",
              flexShrink: 0, fontFamily: "'DM Sans',sans-serif",
            }}
          >
            🌿 Veg
          </button>
          {restaurantId && (
            <button
              onClick={() => setView(view === "grid" ? "list" : "grid")}
              style={{
                width: 42, borderRadius: 14,
                background: "rgba(255,248,240,0.06)",
                border: "1.5px solid rgba(226,55,116,0.22)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: "rgba(254,243,199,0.5)", flexShrink: 0,
              }}
            >
              {view === "grid" ? <FiList size={16} /> : <FiGrid size={16} />}
            </button>
          )}
        </div>

        {/* ── Row 4: Closed warning (restaurant mode only) ─────────────────── */}
        {isClosed && (
          <div style={{
            marginTop: 14,
            display: "flex", alignItems: "flex-start", gap: 10,
            padding: "11px 14px", borderRadius: 14,
            background: "rgba(176,0,0,0.18)",
            border: "1px solid rgba(255,100,100,0.25)",
          }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>🔒</span>
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#ff9090", marginBottom: 2 }}>
                {restaurantName ? `${restaurantName} is currently closed` : "This restaurant is currently closed"}
              </p>
              <p style={{ fontSize: 11, color: "rgba(255,170,170,0.75)", lineHeight: 1.4 }}>
                You can still browse items and add them to your cart. Ordering opens when they reopen.
              </p>
            </div>
          </div>
        )}
      </div>
    </DarkHero>
  );
};

// React import needed for useState inside this file
import React from "react";