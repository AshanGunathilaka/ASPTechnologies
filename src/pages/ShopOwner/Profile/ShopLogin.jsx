import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useShopAuth } from "../../../hooks/useShopAuth";
import { Toaster, toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import bgImage from "../../../assets/Logo.svg";

// eslint workaround for motion usage in JSX
const __MOTION_REF__ = motion;

const ShopLogin = () => {
  const { login, loading } = useShopAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(username, password);
      toast.success("Welcome back!", {
        duration: 2000,
        style: { background: "#16a34a", color: "#fff", fontWeight: "bold" },
      });
      setTimeout(() => navigate("/shop"), 1000);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Login failed", {
        duration: 2500,
        style: { background: "#dc2626", color: "#fff", fontWeight: "bold" },
      });
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <Toaster position="top-center" reverseOrder={false} />

      {/* LEFT SIDE — FULL HALF BACKGROUND IMAGE */}
      <motion.div
        className="flex-1 h-screen bg-no-repeat bg-center bg-cover"
        style={{ backgroundImage: `url(${bgImage})` }}
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />

      {/* RIGHT SIDE — LOGIN FORM */}
      <motion.div
        className="flex-1 relative flex items-center justify-center bg-gradient-to-br from-yellow-50 to-white h-screen"
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Small corner button to go to Admin Login */}
        <div className="absolute right-4 top-4 z-20">
          <Link
            to="/admin/login"
            className="text-xs bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full shadow-sm hover:bg-yellow-200 transition-colors duration-150 border border-yellow-200"
            aria-label="Go to Admin Login"
          >
            Admin login
          </Link>
        </div>
        <motion.form
          onSubmit={onSubmit}
          className="bg-white shadow-2xl rounded-2xl p-8 sm:p-10 w-80 sm:w-96 mx-4 sm:mx-0 transform hover:scale-[1.02] transition-transform duration-300 border border-yellow-100"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-3xl font-bold text-center mb-6 text-yellow-700 drop-shadow-sm">
            Shop Login
          </h2>

          <input
            type="text"
            placeholder="Email or Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="border border-yellow-300 rounded-lg w-full p-3 mb-4 focus:outline-none focus:ring-4 focus:ring-yellow-400/70 shadow-sm focus:shadow-yellow-200 transition-all duration-300"
          />

          <div className="relative mb-2">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-yellow-300 rounded-lg w-full p-3 pr-10 focus:outline-none focus:ring-4 focus:ring-yellow-400/70 shadow-sm focus:shadow-yellow-200 transition-all duration-300"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-3.5 text-yellow-600 hover:text-yellow-800"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div className="text-right mb-4">
            <Link
              to="/shop/forgot-password"
              className="text-sm text-yellow-600 hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white font-semibold w-full py-3 rounded-lg shadow-md hover:shadow-yellow-300 hover:shadow-xl active:scale-95 transition-transform duration-200 hover:ring-2 hover:ring-yellow-300 focus:ring-4 focus:ring-yellow-400 disabled:opacity-50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {loading ? "Logging in..." : "Login"}
          </motion.button>
        </motion.form>
      </motion.div>
    </div>
  );
};

export default ShopLogin;
