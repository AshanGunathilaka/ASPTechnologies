import React, { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext";
import { adminLogin } from "../../../api/auth";
import { motion } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";
import bgImage from "../../../assets/Logo.svg";

const AdminLogin = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await adminLogin(form);
      login(res.data);

      toast.success("Welcome back, Admin!", {
        duration: 2500,
        style: {
          background: "#16a34a", // ✅ Green background
          color: "#fff", // ✅ White text
          fontWeight: "bold",
        },
        iconTheme: {
          primary: "#fff",
          secondary: "#15803d",
        },
      });

      setTimeout(() => navigate("/admin/dashboard"), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed", {
        duration: 2500,
        style: {
          background: "#dc2626", // ✅ Red background
          color: "#fff", // ✅ White text
          fontWeight: "bold",
        },
        iconTheme: {
          primary: "#fff",
          secondary: "#b91c1c",
        },
      });
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <Toaster position="top-center" reverseOrder={false} />

      {/* LEFT SIDE — FULL HALF BACKGROUND IMAGE */}
      <motion.div
        className="flex-1 h-screen bg-no-repeat bg-center bg-cover"
        style={{
          backgroundImage: `url(${bgImage})`,
        }}
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />

      {/* RIGHT SIDE — LOGIN FORM */}
      <motion.div
        className="flex-1 flex items-center justify-center bg-gradient-to-br from-yellow-50 to-white h-screen"
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.form
          onSubmit={handleSubmit}
          className="bg-white shadow-2xl rounded-2xl p-8 sm:p-10 w-80 sm:w-96 mx-4 sm:mx-0 transform hover:scale-[1.02] transition-transform duration-300 border border-yellow-100"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-3xl font-bold text-center mb-6 text-yellow-700 drop-shadow-sm">
            Admin Login
          </h2>

          {/* EMAIL */}
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="border border-yellow-300 rounded-lg w-full p-3 mb-4 focus:outline-none focus:ring-4 focus:ring-yellow-400/70 shadow-sm focus:shadow-yellow-200 transition-all duration-300"
          />

          {/* PASSWORD */}
          <div className="relative mb-4">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="border border-yellow-300 rounded-lg w-full p-3 pr-10 focus:outline-none focus:ring-4 focus:ring-yellow-400/70 shadow-sm focus:shadow-yellow-200 transition-all duration-300"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3.5 text-yellow-600 hover:text-yellow-800"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div className="text-right mb-4">
            <Link
              to="/admin/forgot-password"
              className="text-sm text-yellow-600 hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          {/* LOGIN BUTTON */}
          <motion.button
            type="submit"
            className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white font-semibold w-full py-3 rounded-lg shadow-md hover:shadow-yellow-300 hover:shadow-xl active:scale-95 transition-transform duration-200 hover:ring-2 hover:ring-yellow-300 focus:ring-4 focus:ring-yellow-400"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Login
          </motion.button>
        </motion.form>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
