import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { authService } from "../api/api.user";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  FiSearch,
  FiMapPin,
  FiShoppingCart,
  FiChevronDown,
} from "react-icons/fi";
import { useUserLocation } from "../Hooks/useUserLocation";
import { useRestaurant } from "../Hooks/useRestaurant";
import RestaurantNavbar from "./Restaurant/RestaurantNavbar";
import useUser from "../Hooks/useUser";

const Navbar = () => {
  const {userData,cartQuantity,cartLoading} = useUser();
  console.log(cartLoading);
  
  const { isRestaurantExist } = useRestaurant();

  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [avatarErr, setAvatarErr] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const pathlocation=useLocation()
  const queryClient = useQueryClient();

  // ✅ location hook — auto-requests permission and fetches city
  const { cityName, residential, locationLoading, permissionDenied } =
    useUserLocation();

  const handleLogout = async () => {
    try {
      await authService.post("/api/auth/logout");
    } catch (error) {
      console.log(error);   
    }
    queryClient.clear();
    toast.success("Logged out!");
    navigate("/login");
  };

  const navLinks = [
    { label: "Home", to: "/" },
    { label: "Menu", to: "/menu" },
    { label: "Orders", to: "/orders" },
    { label: "Track", to: "/track" },
  ];
  console.log(residential);

  // City label shown in the pill
  const cityLabel = permissionDenied
    ? "Location off"
    : locationLoading
      ? "Detecting..."
      : `${residential} ${cityName}`;

  if (isRestaurantExist || pathlocation.pathname === "/restaurant/create") {
    return <RestaurantNavbar />;
  }
  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          background: "rgba(255,248,240,0.92)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1.5px solid rgba(226,55,116,0.10)",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {/* ── top row ── */}
        <div
          className="flex items-center justify-between px-6 md:px-10"
          style={{ height: 64 }}
        >
          {/* logo */}
          <NavLink
            to="/"
            className="flex items-center gap-2 select-none flex-shrink-0"
            style={{ textDecoration: "none" }}
          >
            <span
              className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
              style={{ background: "linear-gradient(135deg,#E23774,#FF6B35)" }}
            >
              🍅
            </span>
            <span
              className="text-3xl tracking-widest"
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                color: "#E23774",
              }}
            >
              Tomato
            </span>
          </NavLink>

          {/* desktop nav — absolutely centered */}
          <ul className="hidden lg:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
            {navLinks.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end
                  className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                  style={({ isActive }) => ({
                    color: isActive ? "#E23774" : "#555",
                    background: isActive
                      ? "rgba(226,55,116,0.08)"
                      : "transparent",
                    textDecoration: "none",
                  })}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* right side */}
          <div className="flex items-center gap-3 shrink-0">
            {/* cart */}
            <NavLink
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-semibold"
              style={{
                background: "linear-gradient(135deg,#E23774,#FF6B35)",
                color: "white",
                boxShadow: "0 4px 16px rgba(226,55,116,0.25)",
                border: "none",
                cursor: "pointer",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.boxShadow =
                  "0 6px 24px rgba(226,55,116,0.4)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.boxShadow =
                  "0 4px 16px rgba(226,55,116,0.25)")
              }
              to={'/cart'}
            >
              <FiShoppingCart size={16} />
              <span>Cart</span>
              <span
                className="w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold"
                style={{ background: "rgba(255,255,255,0.3)" }}
              >
                {!cartLoading ? cartQuantity || 0:(
                      <><span className="w-3.5 h-3.5 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "#E23774", borderTopColor: "transparent" }} /></>
                    )}
              </span>
            </NavLink>

            {/* avatar / sign in */}
            {userData ? (
              <div className="relative" style={{ zIndex: 100 }}>
                <button
                  onClick={() => setProfileOpen((p) => !p)}
                  className="flex items-center gap-2 rounded-2xl px-2 py-1.5 transition-all duration-200"
                  style={{
                    border: "2px solid rgba(226,55,116,0.2)",
                    background: profileOpen ? "rgba(226,55,116,0.06)" : "white",
                    cursor: "pointer",
                  }}
                >
                  {!avatarErr && userData.image ? (
                    <img
                      src={userData.image}
                      alt={userData.name}
                      referrerPolicy="no-referrer"
                      onError={() => setAvatarErr(true)}
                      className="w-8 h-8 rounded-xl object-cover"
                    />
                  ) : (
                    <span
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-bold"
                      style={{
                        background: "linear-gradient(135deg,#E23774,#FF6B35)",
                      }}
                    >
                      {userData.name?.[0]?.toUpperCase() ?? "U"}
                    </span>
                  )}
                  <span
                    className="hidden md:block text-sm font-medium pr-1"
                    style={{
                      color: "#1A0A00",
                      maxWidth: 90,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {userData.name?.split(" ")[0]}
                  </span>
                  <FiChevronDown
                    size={13}
                    color="#E23774"
                    style={{
                      transition: "transform 0.2s",
                      transform: profileOpen
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
                    }}
                  />
                </button>

                {profileOpen && (
                  <>
                    <div
                      className="fixed inset-0"
                      style={{ zIndex: 90 }}
                      onClick={() => setProfileOpen(false)}
                    />
                    <div
                      className="absolute right-0 mt-2 w-52 rounded-2xl overflow-hidden"
                      style={{
                        zIndex: 101,
                        background: "white",
                        boxShadow:
                          "0 16px 48px rgba(226,55,116,0.18), 0 2px 8px rgba(0,0,0,0.08)",
                        border: "1.5px solid rgba(226,55,116,0.12)",
                        animation:
                          "dropIn 0.18s cubic-bezier(0.34,1.56,0.64,1) both",
                      }}
                    >
                      <div
                        className="px-4 py-3 border-b"
                        style={{ borderColor: "rgba(226,55,116,0.08)" }}
                      >
                        <p
                          className="text-sm font-semibold"
                          style={{ color: "#1A0A00" }}
                        >
                          {userData.name}
                        </p>
                        <p
                          className="text-xs mt-0.5 truncate"
                          style={{ color: "#aaa" }}
                        >
                          {userData.email}
                        </p>
                        {userData.role && (
                          <span
                            className="mt-1.5 inline-block text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                            style={{
                              background: "rgba(226,55,116,0.1)",
                              color: "#E23774",
                            }}
                          >
                            {userData.role}
                          </span>
                        )}
                      </div>
                      {[
                        { icon: "👤", label: "Profile" ,url:'/profile' },
                        { icon: "📦", label: "My Orders"  ,url:'/orders'},
                        { icon: "⚙️", label: "Settings"  ,url:'/Settings'},
                      ].map((item) => (
                        <button
                          key={item.label}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left"
                          style={{
                            color: "#444",
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background =
                              "rgba(226,55,116,0.05)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "transparent")
                          }
                          onClick={()=>navigate(item.url)}
                        >
                          <span>{item.icon}</span>
                          {item.label}
                        </button>
                      ))}
                      <div
                        style={{
                          borderTop: "1.5px solid rgba(226,55,116,0.08)",
                        }}
                      >
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-left"
                          style={{
                            color: "#E23774",
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background =
                              "rgba(226,55,116,0.06)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "transparent")
                          }
                        >
                          🚪 Logout
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <NavLink
                to="/login"
                className="px-5 py-2 rounded-2xl text-sm font-semibold"
                style={{
                  background: "linear-gradient(135deg,#E23774,#FF6B35)",
                  color: "white",
                  textDecoration: "none",
                  boxShadow: "0 4px 16px rgba(226,55,116,0.25)",
                }}
              >
                Sign In
              </NavLink>
            )}

            {/* mobile hamburger */}
            <button
              className="lg:hidden flex flex-col gap-1.5 p-2 rounded-xl"
              style={{
                background: "rgba(226,55,116,0.08)",
                border: "none",
                cursor: "pointer",
              }}
              onClick={() => setMobileOpen((p) => !p)}
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="block rounded-full transition-all duration-300"
                  style={{
                    width: 20,
                    height: 2,
                    background: "#E23774",
                    transform:
                      mobileOpen && i === 0
                        ? "rotate(45deg) translate(3px,3px)"
                        : mobileOpen && i === 1
                          ? "scaleX(0)"
                          : mobileOpen && i === 2
                            ? "rotate(-45deg) translate(3px,-3px)"
                            : "none",
                  }}
                />
              ))}
            </button>
          </div>
        </div>

        {/* ── search bar row ── */}
        <div
          className="px-6 md:px-10 pb-3 pt-1"
          style={{ borderTop: "1px solid rgba(226,55,116,0.06)" }}
        >
          <div className="flex items-center gap-3 max-w-2xl mx-auto">
            {/* ✅ city pill — shows real detected city */}
            <button
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap flex-shrink-0 transition-all duration-200"
              style={{
                background: permissionDenied
                  ? "rgba(200,200,200,0.1)"
                  : "rgba(226,55,116,0.07)",
                color: permissionDenied ? "#aaa" : "#E23774",
                border: `1.5px solid ${permissionDenied ? "rgba(200,200,200,0.3)" : "rgba(226,55,116,0.15)"}`,
                cursor: "pointer",
              }}
              onMouseEnter={(e) =>
                !permissionDenied &&
                (e.currentTarget.style.background = "rgba(226,55,116,0.13)")
              }
              onMouseLeave={(e) =>
                !permissionDenied &&
                (e.currentTarget.style.background = "rgba(226,55,116,0.07)")
              }
            >
              <FiMapPin size={14} />
              {/* pulse dot while detecting */}
              {locationLoading && !permissionDenied ? (
                <span className="flex items-center gap-1.5">
                  <span
                    className="w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{ background: "#E23774" }}
                  />
                  {cityLabel}
                </span>
              ) : (
                <span>{cityLabel}</span>
              )}
              <FiChevronDown size={12} />
            </button>

            {/* search input */}
            <div className="flex-1 relative flex items-center">
              <FiSearch
                size={16}
                className="absolute left-3.5 pointer-events-none"
                style={{ color: "#ccc" }}
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder='Search for "Biryani", "Pizza", "Burger"...'
                className="w-full rounded-2xl text-sm outline-none transition-all duration-200"
                style={{
                  paddingLeft: 38,
                  paddingRight: search ? 84 : 16,
                  paddingTop: 10,
                  paddingBottom: 10,
                  background: "white",
                  border: "1.5px solid rgba(226,55,116,0.15)",
                  color: "#1A0A00",
                  boxShadow: "0 2px 8px rgba(226,55,116,0.05)",
                  fontFamily: "'DM Sans', sans-serif",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#E23774")}
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor = "rgba(226,55,116,0.15)")
                }
              />
              {search && (
                <button
                  className="absolute right-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white"
                  style={{
                    background: "linear-gradient(135deg,#E23774,#FF6B35)",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Search
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* mobile drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="absolute left-0 right-0 mx-4 rounded-2xl overflow-hidden"
            style={{
              top: 64,
              background: "white",
              boxShadow: "0 16px 48px rgba(226,55,116,0.15)",
              border: "1.5px solid rgba(226,55,116,0.10)",
              animation: "dropIn 0.2s cubic-bezier(0.34,1.56,0.64,1) both",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <ul className="py-2">
              {navLinks.map((link) => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    end
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center px-5 py-3 text-sm font-medium"
                    style={({ isActive }) => ({
                      color: isActive ? "#E23774" : "#555",
                      background: isActive
                        ? "rgba(226,55,116,0.06)"
                        : "transparent",
                      textDecoration: "none",
                    })}
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
            <div
              style={{ borderTop: "1.5px solid rgba(226,55,116,0.08)" }}
              className="px-5 py-3"
            >
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 text-sm font-semibold py-2"
                style={{
                  color: "#E23774",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ height: 120 }} />

      <style>{`
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        input::placeholder { color: #ccc; }
      `}</style>
    </>
  );
};

export default Navbar;
