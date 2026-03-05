import { useGoogleLogin } from "@react-oauth/google";
import { useState } from "react";
import { authService, fetch_User } from "../api/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { useQueryClient } from "@tanstack/react-query";
const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient(); // Add this

  const responseGoogle = async (authResult) => {
    setLoading(true);
    try {
      const result = await authService.post(`/api/auth/login`, {
        code: authResult["code"],
      });
      queryClient.invalidateQueries({ queryKey: ["user"] });
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
    <>
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-sm space-y-6">
          <h1 className="text-center text-3xl font-bold bg-white px-4 text-[#E23774]">
            Tomato
          </h1>
          <p className="text-center text-sm text-[#E23774]">
            Log in or sign up to continue
          </p>

          <button
            onClick={googleLogin}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-x1 border border-gray-300"
          >
            <FcGoogle size={20} />
            {loading ? "signing in ..." : "continue with Google"}
          </button>
          <p className="text-center text-xs text-gray-400">
            By Continue , you agree with our <span className="text-blue-500 cursor-pointer">Terms of Services {" "}</span> and{" "}
            <span className="text-blue-500 cursor-pointer">Privacy & Policy</span>
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;
