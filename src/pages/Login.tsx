import { FcGoogle } from "react-icons/fc";
import { loginWithGoogle } from "../firebaseAuth";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user != null) {
        navigate("/");
      }
    });
  }, []);

  const _loginWithGoogle = async () => {
    const user = await loginWithGoogle();
    console.log(user);
    if (user != null) {
      navigate("/");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <div>
        <button
          onClick={() => _loginWithGoogle()}
          className="flex items-center gap-4 bg-slate-800 p-4 rounded text-xl hover:scale-[1.05] hover:-translate-y-1 duration-300"
        >
          <FcGoogle />
          <div className="w-[2px] bg-slate-500 self-stretch" />
          <span>Login With Google</span>
        </button>
      </div>
    </div>
  );
};

export default Login;
