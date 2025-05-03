import { FcGoogle } from "react-icons/fc";
import { loginWithGoogle } from "../firebaseAuth";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

const Login = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user != null) {
        navigate("/");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const _loginWithGoogle = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const user = await loginWithGoogle();
      if (user != null) {
        navigate("/");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Failed to login with Google");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-slate-950">
      <div className="bg-slate-900 p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-center text-white">CIF Guardian Care</h1>
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500 rounded text-red-500 text-sm">
            {error}
          </div>
        )}
        <button
          onClick={_loginWithGoogle}
          disabled={isLoading}
          className="flex items-center gap-4 bg-slate-800 p-4 rounded text-xl hover:scale-[1.05] hover:-translate-y-1 duration-300 disabled:opacity-50 disabled:cursor-not-allowed w-full justify-center"
        >
          <FcGoogle />
          <div className="w-[2px] bg-slate-500 self-stretch" />
          <span>{isLoading ? "Logging in..." : "Login With Google"}</span>
        </button>
      </div>
    </div>
  );
};

export default Login;
