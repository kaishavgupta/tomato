import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { user_logOut } from "../../api/api.user";
import { useQueryClient } from "@tanstack/react-query";
import { useRestaurant } from "../../Hooks/useRestaurant";
import toast from "react-hot-toast";
import {
  FiGrid,
  FiList,
  FiShoppingBag,
  FiSettings,
  FiChevronDown,
  FiToggleLeft,
  FiToggleRight,
  FiBarChart2,
} from "react-icons/fi";
import useUser from "../../Hooks/useUser";
import Logo from "./Logo";

const RestaurantNavbar = () => {
  const context = useUser();
  const { restaurantData,setOpenClose,isOpen } = useRestaurant();
  const userData = context?.userData;

  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [avatarErr, setAvatarErr] = useState(false);


  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    const response = await user_logOut();
    if (response.data.success) {
      queryClient.clear();
      toast.success("Logged out!");
      navigate("/login");
    }
  };

  const navLinks = [
    { label: "Dashboard", to: "/restaurant", icon: <FiGrid size={14} /> },
    { label: "Menu", to: "/restaurant/menu", icon: <FiList size={14} /> },
    {
      label: "Orders",
      to: "/restaurant/orders",
      icon: <FiShoppingBag size={14} />,
    },
    {
      label: "Analytics",
      to: "/restaurant/analytics",
      icon: <FiBarChart2 size={14} />,
    },
    {
      label: "Settings",
      to: "/restaurant/settings",
      icon: <FiSettings size={14} />,
    },
  ];

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
          {/* logo + restaurant badge */}
          {/* <NavLink
            to="/restaurant"
            className="flex items-center gap-2 select-none flex-shrink-0"
            style={{ textDecoration: "none" }}
          >
            <span
              className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
              style={{ background: "linear-gradient(135deg,#E23774,#FF6B35)" }}
            >
              🍅
            </span>
            <div className="flex flex-col leading-none">
              <span
                className="text-2xl tracking-widest"
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  color: "#E23774",
                  lineHeight: 1,
                }}
              >
                Tomato
              </span>
              <span
                className="text-[9px] font-bold uppercase tracking-[0.18em]"
                style={{ color: "#FF6B35", lineHeight: 1, marginTop: 1 }}
              >
                Restaurant
              </span>
            </div>
          </NavLink> */}
          <Logo/>

          {/* desktop nav — absolutely centered */}
          <ul className="hidden min-[1208px]:flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
            {navLinks.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.to === "/restaurant"}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                  style={({ isActive }) => ({
                    color: isActive ? "#E23774" : "#555",
                    background: isActive
                      ? "rgba(226,55,116,0.08)"
                      : "transparent",
                    textDecoration: "none",
                  })}
                >
                  {link.icon}
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* right side */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* open / closed toggle */}
            <button
              onClick={() => setOpenClose.mutate(!isOpen)}
              className="hidden md:flex items-center gap-2 px-3 py-2 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all duration-300"
              style={{
                background: isOpen
                  ? "rgba(34,197,94,0.10)"
                  : "rgba(226,55,116,0.08)",
                color: isOpen ? "#16a34a" : "#E23774",
                border: `1.5px solid ${isOpen ? "rgba(34,197,94,0.25)" : "rgba(226,55,116,0.20)"}`,
                cursor: "pointer",
              }}
            >
              {isOpen ? (
                <FiToggleRight size={16} />
              ) : (
                <FiToggleLeft size={16} />
              )}
              {isOpen ? "Open" : "Closed"}
            </button>

            {/* restaurant avatar / profile */}
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
                  {/* restaurant image > user avatar > initial */}
                  {restaurantData?.image ? (
                    <img
                      src={restaurantData.image?.url || userData.image}
                      alt={restaurantData.name}
                      className="w-8 h-8 rounded-xl object-cover"
                    />
                  ) : !avatarErr && userData.image ? (
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
                      {(restaurantData?.name ??
                        userData.name)?.[0]?.toUpperCase() ?? "R"}
                    </span>
                  )}
                  <div className="hidden md:flex flex-col items-start leading-none pr-1">
                    <span
                      className="text-sm font-semibold truncate max-w-[96px]"
                      style={{ color: "#1A0A00" }}
                    >
                      {restaurantData?.name ?? userData.name?.split(" ")[0]}
                    </span>
                    <span
                      className="text-[10px] font-bold uppercase tracking-widest"
                      style={{ color: "#E23774" }}
                    >
                      Restaurant
                    </span>
                  </div>
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
                      className="absolute right-0 mt-2 w-56 rounded-2xl overflow-hidden"
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
                      {/* restaurant info header */}
                      <div
                        className="px-4 py-3 border-b"
                        style={{ borderColor: "rgba(226,55,116,0.08)" }}
                      >
                        <p
                          className="text-sm font-semibold truncate"
                          style={{ color: "#1A0A00" }}
                        >
                          {restaurantData?.name ?? "My Restaurant"}
                        </p>
                        <p
                          className="text-xs mt-0.5 truncate"
                          style={{ color: "#aaa" }}
                        >
                          {restaurantData?.email ?? userData.email}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span
                            className="inline-block text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                            style={{
                              background: "rgba(226,55,116,0.1)",
                              color: "#E23774",
                            }}
                          >
                            Restaurant
                          </span>
                          {/* live status dot */}
                          <span
                            className="flex items-center gap-1 text-[10px] font-semibold"
                            style={{ color: isOpen ? "#16a34a" : "#aaa" }}
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{
                                background: isOpen ? "#22c55e" : "#ddd",
                                boxShadow: isOpen
                                  ? "0 0 0 2px rgba(34,197,94,0.25)"
                                  : "none",
                              }}
                            />
                            {isOpen ? "Open" : "Closed"}
                          </span>
                        </div>
                      </div>

                      {[
                        {
                          icon: "🏪",
                          label: "My Restaurant",
                          to: "/restaurant",
                        },
                        {
                          icon: "📋",
                          label: "Manage Menu",
                          to: "/restaurant/menu",
                        },
                        {
                          icon: "📦",
                          label: "Orders",
                          to: "/restaurant/orders",
                        },
                        {
                          icon: "⚙️",
                          label: "Settings",
                          to: "/restaurant/settings",
                        },
                      ].map((item) => (
                        <button
                          key={item.label}
                          onClick={() => {
                            navigate(item.to);
                            setProfileOpen(false);
                          }}
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
            ) : null}

            {/* mobile hamburger */}
            <button
              className="md:hidden flex flex-col gap-1.5 p-2 rounded-xl"
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

        {/* ── status bar row ── */}
        <div
          className="px-6 md:px-10 pb-2.5 pt-1 flex items-center justify-between gap-4"
          style={{ borderTop: "1px solid rgba(226,55,116,0.06)" }}
        >
          {/* restaurant address pill */}
          <div
            className="flex items-center gap-1.5 text-xs truncate"
            style={{ color: "#aaa", maxWidth: "60%" }}
          >
            <span>📍</span>
            <span className="truncate">
              {restaurantData?.autoLocation?.formatedAddress ??
                "No address set"}
            </span>
          </div>

          {/* quick stats */}
          <div className="hidden md:flex items-center gap-4">
            {[
              { label: "Today's Orders", value: "—" },
              { label: "Revenue", value: "—" },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-1.5">
                <span
                  className="text-[11px] font-medium"
                  style={{ color: "#ccc" }}
                >
                  {stat.label}
                </span>
                <span
                  className="text-[11px] font-bold"
                  style={{ color: "#E23774" }}
                >
                  {stat.value}
                </span>
              </div>
            ))}

            {/* mobile open toggle (shown in status bar on mobile) */}
            <button
              onClick={() => setOpenClose.mutate(!isOpen)}
              className="md:hidden flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold uppercase tracking-widest"
              style={{
                background: isOpen
                  ? "rgba(34,197,94,0.10)"
                  : "rgba(226,55,116,0.08)",
                color: isOpen ? "#16a34a" : "#E23774",
                border: `1.5px solid ${isOpen ? "rgba(34,197,94,0.25)" : "rgba(226,55,116,0.20)"}`,
                cursor: "pointer",
              }}
            >
              {isOpen ? (
                <FiToggleRight size={13} />
              ) : (
                <FiToggleLeft size={13} />
              )}
              {isOpen ? "Open" : "Closed"}
            </button>
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
            {/* restaurant info */}
            <div
              className="px-5 py-3 flex items-center gap-3"
              style={{ borderBottom: "1px solid rgba(226,55,116,0.08)" }}
            >
              {restaurantData?.image ? (
                <img
                  src={restaurantData.image?.url}
                  alt={restaurantData.name}
                  className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
                />
              ) : (
                <span
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0"
                  style={{
                    background: "linear-gradient(135deg,#E23774,#FF6B35)",
                  }}
                >
                  {restaurantData?.name?.[0]?.toUpperCase() ?? "R"}
                </span>
              )}
              <div>
                <p
                  className="text-sm font-semibold"
                  style={{ color: "#1A0A00" }}
                >
                  {restaurantData?.name ?? "My Restaurant"}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: isOpen ? "#22c55e" : "#ddd" }}
                  />
                  <span
                    className="text-xs"
                    style={{ color: isOpen ? "#16a34a" : "#aaa" }}
                  >
                    {isOpen ? "Open" : "Closed"}
                  </span>
                </div>
              </div>
            </div>

            <ul className="py-2">
              {navLinks.map((link) => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    end={link.to === "/restaurant"}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-5 py-3 text-sm font-medium"
                    style={({ isActive }) => ({
                      color: isActive ? "#E23774" : "#555",
                      background: isActive
                        ? "rgba(226,55,116,0.06)"
                        : "transparent",
                      textDecoration: "none",
                    })}
                  >
                    {link.icon}
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

      {/* spacer — matches two-row navbar height */}
      <div style={{ height: 108 }} />

      <style>{`
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>
  );
};

export default RestaurantNavbar;
