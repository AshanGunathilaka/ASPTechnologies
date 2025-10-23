import React, { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { getAdminProfile, updateAdminProfile } from "../../../api/auth";
import { Toaster, toast } from "react-hot-toast";

const AdminProfile = () => {
  const { auth, login } = useAuth();
  const token = auth?.token;
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await getAdminProfile(token);
      const { name, email, phone = "" } = res.data || {};
      setForm({ name: name || "", email: email || "", phone: phone || "" });
    } catch (e) {
      console.error(e);
      toast.error(e.response?.data?.message || "Failed to load profile", {
        duration: 2500,
        style: { background: "#dc2626", color: "#fff", fontWeight: "bold" },
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [token]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;
    setLoading(true);
    try {
      const payload = { name: form.name, email: form.email, phone: form.phone };
      if (form.password && form.password.length >= 6)
        payload.password = form.password;
      const res = await updateAdminProfile(token, payload);
      const { name, email, phone } = res.data;
      login({ ...auth, name, email, phone });
      toast.success(res.data?.message || "Profile updated", {
        duration: 2500,
        style: { background: "#16a34a", color: "#fff", fontWeight: "bold" },
      });
      setForm((f) => ({ ...f, password: "" }));
    } catch (e) {
      console.error(e);
      toast.error(e.response?.data?.message || "Update failed", {
        duration: 2500,
        style: { background: "#dc2626", color: "#fff", fontWeight: "bold" },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-white to-yellow-100 p-4">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-yellow-200">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          My Profile
        </h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-yellow-200 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-300 rounded-xl px-3 py-2 outline-none transition-all duration-200"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-yellow-200 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-300 rounded-xl px-3 py-2 outline-none transition-all duration-200"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Phone
            </label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="e.g. +94 77 123 4567"
              className="w-full border border-yellow-200 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-300 rounded-xl px-3 py-2 outline-none transition-all duration-200"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-yellow-500 to-yellow-700 text-white font-semibold py-2.5 rounded-2xl shadow-md hover:scale-105 transition-transform duration-200 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminProfile;
