import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import { shopForgotVerify } from "../../../api/shop";
import { motion } from "framer-motion";
import bgImage from "../../../assets/Logo.svg";
// eslint workaround for motion usage in JSX
const __MOTION_REF__ = motion;

const ShopForgotPassword = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "" });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.username.trim() || !form.email.trim()) {
      toast.error("Please enter both username and email");
      return;
    }
    setLoading(true);
    try {
      const res = await shopForgotVerify({
        username: form.username.trim(),
        email: form.email.trim(),
      });
      const token = res.data?.resetToken;
      if (!token) throw new Error("No reset token returned");
      toast.success("Verification successful! Proceed to reset password.", {
        duration: 2000,
        style: { background: "#16a34a", color: "#fff", fontWeight: "bold" },
      });
      setTimeout(
        () =>
          navigate(`/shop/reset-password?token=${encodeURIComponent(token)}`),
        800
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Verification failed", {
        duration: 2500,
        style: { background: "#dc2626", color: "#fff", fontWeight: "bold" },
      });
    } finally {
      setLoading(false);
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

      {/* RIGHT SIDE — FORGOT PASSWORD FORM */}
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
            Forgot Password
          </h2>

          <p className="text-center text-sm text-yellow-700 mb-6">
            Enter your username and email to verify your identity.
          </p>

          {/* USERNAME INPUT */}
          <input
            type="text"
            placeholder="Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            className="border border-yellow-300 rounded-lg w-full p-3 mb-4 focus:outline-none focus:ring-4 focus:ring-yellow-400/70 shadow-sm focus:shadow-yellow-200 transition-all duration-300"
            required
          />

          {/* EMAIL INPUT */}
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="border border-yellow-300 rounded-lg w-full p-3 mb-4 focus:outline-none focus:ring-4 focus:ring-yellow-400/70 shadow-sm focus:shadow-yellow-200 transition-all duration-300"
            required
          />

          {/* VERIFY BUTTON */}
          <motion.button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white font-semibold w-full py-3 rounded-lg shadow-md hover:shadow-yellow-300 hover:shadow-xl active:scale-95 transition-transform duration-200 hover:ring-2 hover:ring-yellow-300 focus:ring-4 focus:ring-yellow-400 disabled:opacity-50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {loading ? "Verifying..." : "Verify"}
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

export default ShopForgotPassword;
