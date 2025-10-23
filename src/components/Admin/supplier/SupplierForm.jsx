import React, { useState } from "react";
import { motion } from "framer-motion";

export default function SupplierForm({ initial = {}, onSubmit }) {
  const [form, setForm] = useState({
    name: initial.name || "",
    address: initial.address || "",
    mobile: initial.mobile || "",
    email: initial.email || "",
    notes: initial.notes || "",
  });

  const submit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <motion.form
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      onSubmit={submit}
      className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-yellow-100 mt-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input
          required
          placeholder="Supplier Name *"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none transition"
        />
        <input
          placeholder="Mobile"
          value={form.mobile}
          onChange={(e) => setForm({ ...form, mobile: e.target.value })}
          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none transition"
        />
        <input
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none transition"
        />
        <input
          placeholder="Address"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none transition"
        />
      </div>

      <textarea
        placeholder="Notes"
        value={form.notes}
        onChange={(e) => setForm({ ...form, notes: e.target.value })}
        className="w-full mt-4 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none transition"
      />

      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        type="submit"
        className="mt-5 w-full bg-yellow-500 text-gray-800 font-semibold py-3 rounded-xl shadow-md hover:bg-yellow-400 transition-all"
      >
        💾 Save Supplier
      </motion.button>
    </motion.form>
  );
}
