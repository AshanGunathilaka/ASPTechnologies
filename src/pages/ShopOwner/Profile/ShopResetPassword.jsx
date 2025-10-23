import React, { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import { shopResetPassword } from "../../../api/shop";
import { motion } from "framer-motion";
import bgImage from "../../../assets/Logo.svg";
import { Eye, EyeOff } from "lucide-react";

// eslint workaround for motion usage in JSX
const __MOTION_REF__ = motion;

const ShopResetPassword = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = useMemo(() => params.get("token"), [params]);

  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error("Missing reset token. Start again.");
      return;
    }
    if (!form.password || form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await shopResetPassword({ resetToken: token, ...form });
      toast.success("Password reset successful! You can now log in.", {
        duration: 2200,
        style: { background: "#16a34a", color: "#fff", fontWeight: "bold" },
      });
      setTimeout(() => navigate("/shop/login"), 1200);
    } catch (err) {
      toast.error(err.response?.data?.message || "Password reset failed", {
        duration: 2500,
        style: { background: "#dc2626", color: "#fff", fontWeight: "bold" },
      });
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-yellow-50 to-white">
        <Toaster position="top-center" reverseOrder={false} />
        <div className="bg-white shadow-2xl rounded-2xl p-8 sm:p-10 w-80 sm:w-96 border border-yellow-100 text-center">
          <h2 className="text-3xl font-bold text-yellow-700 mb-4">
            Reset Password
          </h2>
          <p className="text-yellow-700 mb-6">
            Reset token is missing or invalid. Please verify again.
          </p>
          <button
            onClick={() => navigate("/shop/forgot-password")}
            className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white font-semibold w-full py-3 rounded-lg shadow-md hover:shadow-yellow-300 hover:shadow-xl active:scale-95 transition-transform duration-200 hover:ring-2 hover:ring-yellow-300 focus:ring-4 focus:ring-yellow-400"
          >
            Go to Forgot Password
          </button>
        </div>
      </div>
    );
  }

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

      {/* RIGHT SIDE — RESET FORM */}
      <motion.div
        className="flex-1 flex items-center justify-center bg-gradient-to-br from-yellow-50 to-white h-screen"
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.form
          onSubmit={onSubmit}
          className="bg-white shadow-2xl rounded-2xl p-8 sm:p-10 w-80 sm:w-96 mx-4 sm:mx-0 transform hover:scale-[1.02] transition-transform duration-300 border border-yellow-100"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-3xl font-bold text-center mb-6 text-yellow-700 drop-shadow-sm">
            Set New Password
          </h2>

          <div className="relative mb-4">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="New Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="border border-yellow-300 rounded-lg w-full p-3 pr-10 focus:outline-none focus:ring-4 focus:ring-yellow-400/70 shadow-sm focus:shadow-yellow-200 transition-all duration-300"
              minLength={6}
              required
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
          <div className="relative mb-4">
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm New Password"
              value={form.confirmPassword}
              onChange={(e) =>
                setForm({ ...form, confirmPassword: e.target.value })
              }
              className="border border-yellow-300 rounded-lg w-full p-3 pr-10 focus:outline-none focus:ring-4 focus:ring-yellow-400/70 shadow-sm focus:shadow-yellow-200 transition-all duration-300"
              minLength={6}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirm((s) => !s)}
              className="absolute right-3 top-3.5 text-yellow-600 hover:text-yellow-800"
              aria-label={showConfirm ? "Hide password" : "Show password"}
            >
              {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white font-semibold w-full py-3 rounded-lg shadow-md hover:shadow-yellow-300 hover:shadow-xl active:scale-95 transition-transform duration-200 hover:ring-2 hover:ring-yellow-300 focus:ring-4 focus:ring-yellow-400 disabled:opacity-50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </motion.button>

          <div className="text-center mt-4">
            <button
              onClick={() => navigate("/shop/login")}
              className="text-sm text-yellow-600 hover:underline"
            >
              ← Back to Login
            </button>
          </div>
        </motion.form>
      </motion.div>
    </div>
  );
};

export default ShopResetPassword;
