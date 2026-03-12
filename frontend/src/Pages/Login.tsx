import { useGoogleLogin } from "@react-oauth/google";
import { useState } from "react";
import { authService, fetch_User } from "../api/api.user";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { useQueryClient } from "@tanstack/react-query";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const responseGoogle = async (authResult: any) => {
    setLoading(true);
    try {
      const result = await authService.post(`/api/auth/login`, {
        code: authResult["code"],
      });
      await queryClient.invalidateQueries({ queryKey: ["user"] });
      toast.success(result.data.msg);
      setLoading(false);
      fetch_User();
      navigate("/");
    } catch (error) {
      console.log(error);
      toast.error("Unable to login");
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: responseGoogle,
    onError: responseGoogle,
    flow: "auth-code",
  });

  return (
    <div
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: "#FFF8F0", fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* ── background decorations ── */}
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
        {/* diagonal stripe */}
        <div
          className="absolute top-0 right-0 w-[55%] h-full opacity-[0.07]"
          style={{
            background: "linear-gradient(135deg, #E23774 0%, #FF6B35 100%)",
            clipPath: "polygon(15% 0%, 100% 0%, 100% 100%, 0% 100%)",
          }}
        />
        {/* blobs */}
        <div className="absolute rounded-full opacity-[0.07]" style={{ width: 340, height: 340, top: -110, left: -90, background: "#E23774" }} />
        <div className="absolute rounded-full opacity-[0.07]" style={{ width: 200, height: 200, bottom: 30, right: 50, background: "#FF6B35" }} />
        <div className="absolute rounded-full opacity-[0.07]" style={{ width: 70, height: 70, top: "38%", left: "8%", background: "#E23774" }} />
        {/* floating food emojis */}
        {[
          { emoji: "🍕", top: "12%", left: "7%",  size: 36, rotate: "-12deg", delay: "0s" },
          { emoji: "🍔", top: "70%", left: "5%",  size: 30, rotate: "8deg",   delay: "0.4s" },
          { emoji: "🌮", top: "20%", right: "6%", size: 32, rotate: "14deg",  delay: "0.2s" },
          { emoji: "🍜", top: "65%", right: "7%", size: 28, rotate: "-8deg",  delay: "0.6s" },
          { emoji: "🧁", top: "44%", left: "3%",  size: 26, rotate: "5deg",   delay: "0.8s" },
        ].map((f, i) => (
          <span
            key={i}
            className="absolute select-none"
            style={{
              top: f.top,
              left: (f as any).left,
              right: (f as any).right,
              fontSize: f.size,
              transform: `rotate(${f.rotate})`,
              opacity: 0.18,
              animation: `floatY 4s ease-in-out ${f.delay} infinite alternate`,
            }}
          >
            {f.emoji}
          </span>
        ))}
      </div>

      {/* ── card ── */}
      <div
        className="relative z-10 w-full max-w-sm mx-4 rounded-[28px] px-10 py-12"
        style={{
          background: "white",
          boxShadow: "0 24px 64px rgba(226,55,116,0.10), 0 4px 16px rgba(0,0,0,0.06)",
        }}
      >
        {/* logo */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 text-3xl"
            style={{ background: "linear-gradient(135deg,#E23774,#FF6B35)" }}
          >
            🍅
          </div>
          <h1
            className="text-5xl tracking-widest"
            style={{ fontFamily: "'Bebas Neue', sans-serif", color: "#E23774" }}
          >
            Tomato
          </h1>
          <p className="mt-1 text-[13px] tracking-widest uppercase font-semibold" style={{ color: "#FF6B35", letterSpacing: "0.18em" }}>
            Food Delivery
          </p>
        </div>

        {/* headline */}
        <div className="text-center mb-8">
          <h2
            className="text-4xl leading-tight"
            style={{ fontFamily: "'Bebas Neue', sans-serif", color: "#1A0A00" }}
          >
            Hungry?<br />Let's fix that.
          </h2>
          <p className="mt-2 text-sm" style={{ color: "#aaa" }}>
            Sign in to order, deliver, or manage your restaurant.
          </p>
        </div>

        {/* divider */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px" style={{ background: "#f0e8e8" }} />
          <span className="text-xs font-medium" style={{ color: "#ccc" }}>continue with</span>
          <div className="flex-1 h-px" style={{ background: "#f0e8e8" }} />
        </div>

        {/* Google button */}
        <button
          onClick={() => googleLogin()}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 rounded-2xl border-2 transition-all duration-300 font-medium text-[15px]"
          style={{
            borderColor: loading ? "#f0e8e8" : "#E23774",
            color: "#1A0A00",
            padding: "14px 24px",
            background: "white",
            boxShadow: loading ? "none" : "0 4px 20px rgba(226,55,116,0.12)",
            opacity: loading ? 0.6 : 1,
            cursor: loading ? "not-allowed" : "pointer",
          }}
          onMouseEnter={e => {
            if (!loading) {
              (e.currentTarget as HTMLButtonElement).style.background = "linear-gradient(135deg,#E23774,#FF6B35)";
              (e.currentTarget as HTMLButtonElement).style.color = "white";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "transparent";
            }
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = "white";
            (e.currentTarget as HTMLButtonElement).style.color = "#1A0A00";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "#E23774";
          }}
        >
          {loading ? (
            <>
              <span
                className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: "#E23774", borderTopColor: "transparent" }}
              />
              Signing in...
            </>
          ) : (
            <>
              <FcGoogle size={22} />
              Continue with Google
            </>
          )}
        </button>

        {/* terms */}
        <p className="mt-6 text-center text-[11px] leading-relaxed" style={{ color: "#bbb" }}>
          By continuing, you agree to our{" "}
          <span className="cursor-pointer font-medium" style={{ color: "#E23774" }}>Terms of Service</span>
          {" "}and{" "}
          <span className="cursor-pointer font-medium" style={{ color: "#E23774" }}>Privacy Policy</span>
        </p>
      </div>

      {/* float animation */}
      <style>{`
        @keyframes floatY {
          from { transform: translateY(0px) rotate(var(--r, 0deg)); }
          to   { transform: translateY(-14px) rotate(var(--r, 0deg)); }
        }
      `}</style>
    </div>
  );
};

export default Login;