import React, { useState } from "react";
import { motion } from "framer-motion";

export default function ShopForm({ initial = {}, onSubmit }) {
  const [form, setForm] = useState({
    name: initial.name || "",
    ownerName: initial.ownerName || "",
    nic: initial.nic || "",
    address: initial.address || "",
    district: initial.district || "",
    area: initial.area || "",
    email: initial.email || "",
    phone: initial.phone || "",
    whatsapp: initial.whatsapp || initial.additionalPhone || "",
    username: initial.username || "",
    password: initial.password || "",
    notes: initial.notes || "",
  });

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(
    initial.logoUrl ||
      (typeof initial.logo === "string" ? initial.logo : initial.logo?.url) ||
      ""
  );
  const [errors, setErrors] = useState({});

  const districts = [
    "Colombo",
    "Gampaha",
    "Kalutara",
    "Kandy",
    "Matale",
    "Nuwara Eliya",
    "Galle",
    "Matara",
    "Hambantota",
    "Jaffna",
    "Kilinochchi",
    "Mannar",
    "Vavuniya",
    "Mullaitivu",
    "Batticaloa",
    "Ampara",
    "Trincomalee",
    "Kurunegala",
    "Puttalam",
    "Anuradhapura",
    "Polonnaruwa",
    "Badulla",
    "Monaragala",
    "Ratnapura",
    "Kegalle",
  ];

  const townsByDistrict = {
    Colombo: [
      "Colombo 01",
      "Dehiwala",
      "Moratuwa",
      "Kotte",
      "Nugegoda",
      "Maharagama",
      "Homagama",
      "Kaduwela",
    ],
    Gampaha: [
      "Gampaha",
      "Negombo",
      "Wattala",
      "Ja-Ela",
      "Ragama",
      "Kadawatha",
      "Minuwangoda",
    ],
    Kandy: ["Kandy", "Peradeniya", "Gampola", "Nawalapitiya"],
    Galle: ["Galle", "Hikkaduwa", "Ambalangoda", "Elpitiya"],
    Matara: ["Matara", "Weligama", "Hakmana", "Dikwella"],
    Ratnapura: ["Ratnapura", "Balangoda", "Embilipitiya"],
    Kegalle: ["Kegalle", "Mawanella", "Warakapola"],

    // ✅ Expanded and complete list
    Kurunegala: [
      "Kurunegala",
      "Kuliyapitiya",
      "Pannala",
      "Narammala",
      "Wariyapola",
      "Polgahawela",
      "Alawwa",
      "Giriulla",
      "Ibbagamuwa",
      "Mawathagama",
      "Bingiriya",
      "Galgamuwa",
      "Hettipola",
      "Nikaweratiya",
      "Udubaddawa",
      "Weerambugedara",
      "Mallawapitiya",
      "Rideegama",
      "Ambanpola",
      "Maspotha",
    ],

    Puttalam: [
      "Puttalam",
      "Chilaw",
      "Wennappuwa",
      "Nattandiya",
      "Marawila",
      "Dankotuwa",
      "Anamaduwa",
      "Mundalama",
      "Kalpitiya",
      "Vanathavilluwa",
      "Battuluoya",
      "Palaviya",
      "Madampe",
      "Arachchikattuwa",
      "Mahakumbukkadawala",
      "Karuwalagaswewa",
      "Saliyawewa",
      "Serupara",
      "Eluvankulam",
      "Thillayadi",
    ],
  };

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidNIC = (nic) => /^(?:\d{9}[vVxX]|\d{12})$/.test(nic);
  const isValidPhone = (p) => {
    const digits = (p || "").replace(/\D/g, "");
    return digits.length >= 9 && digits.length <= 12;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = "Shop name is required";
    if (!form.ownerName.trim()) nextErrors.ownerName = "Owner name is required";
    if (!form.nic || !isValidNIC(form.nic))
      nextErrors.nic = "Valid NIC required (old/new format)";
    if (!form.address.trim()) nextErrors.address = "Address is required";
    if (!form.district) nextErrors.district = "District is required";
    if (!form.area) nextErrors.area = "Town is required";
    if (!form.email || !isValidEmail(form.email))
      nextErrors.email = "Valid email required";
    if (!form.phone || !isValidPhone(form.phone))
      nextErrors.phone = "Valid phone number required";
    if (!form.whatsapp || !isValidPhone(form.whatsapp))
      nextErrors.whatsapp = "Valid WhatsApp number required";
    if (!form.username.trim()) nextErrors.username = "Username is required";
    if (!initial._id && !form.password)
      nextErrors.password = "Password is required";
    if (!form.notes.trim()) nextErrors.notes = "Notes are required";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    let payload;
    if (logoFile) {
      payload = new FormData();
      Object.entries({ ...form, additionalPhone: form.whatsapp }).forEach(
        ([k, v]) => payload.append(k, v)
      );
      payload.append("logo", logoFile);
    } else {
      payload = { ...form, additionalPhone: form.whatsapp };
    }

    onSubmit(payload);
  };

  return (
    <motion.form
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSubmit}
      className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-yellow-100 mt-4"
    >
      {/* Logo Upload */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Shop Logo *
        </label>
        {logoPreview && (
          <img
            src={logoPreview}
            alt="Logo Preview"
            className="w-24 h-24 object-cover rounded-lg border border-yellow-200 mb-2"
          />
        )}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const f = e.target.files?.[0];
            setLogoFile(f || null);
            if (f) setLogoPreview(URL.createObjectURL(f));
          }}
          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none transition bg-white"
          required={!initial._id && !logoPreview}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Basic Info */}
        {[
          { key: "name", placeholder: "Shop Name *" },
          { key: "ownerName", placeholder: "Owner Name *" },
          { key: "nic", placeholder: "NIC *" },
          { key: "email", placeholder: "Email *", type: "email" },
          { key: "phone", placeholder: "Phone *" },
          { key: "whatsapp", placeholder: "WhatsApp *" },
          { key: "username", placeholder: "Username *" },
        ].map(({ key, placeholder, type }) => (
          <div key={key}>
            <input
              type={type || "text"}
              placeholder={placeholder}
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none transition"
              required
            />
            {errors[key] && (
              <p className="text-red-600 text-sm mt-1">{errors[key]}</p>
            )}
          </div>
        ))}

        {/* Password (only for new) */}
        {!initial._id && (
          <div>
            <input
              type="password"
              placeholder="Password *"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none transition"
              required
            />
            {errors.password && (
              <p className="text-red-600 text-sm mt-1">{errors.password}</p>
            )}
          </div>
        )}

        {/* District */}
        <div>
          <select
            value={form.district}
            onChange={(e) =>
              setForm({ ...form, district: e.target.value, area: "" })
            }
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none transition bg-white"
            required
          >
            <option value="">Select District *</option>
            {districts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          {errors.district && (
            <p className="text-red-600 text-sm mt-1">{errors.district}</p>
          )}
        </div>

        {/* Town */}
        <div>
          <select
            value={form.area}
            onChange={(e) => setForm({ ...form, area: e.target.value })}
            disabled={!form.district}
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none transition bg-white disabled:opacity-60"
            required
          >
            <option value="">
              {form.district ? "Select Town *" : "Select District first"}
            </option>
            {(townsByDistrict[form.district] || []).map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          {errors.area && (
            <p className="text-red-600 text-sm mt-1">{errors.area}</p>
          )}
        </div>
      </div>

      {/* Address */}
      <textarea
        placeholder="Address *"
        value={form.address}
        onChange={(e) => setForm({ ...form, address: e.target.value })}
        className="w-full mt-4 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none transition"
        required
      />
      {errors.address && (
        <p className="text-red-600 text-sm">{errors.address}</p>
      )}

      {/* Notes */}
      <textarea
        placeholder="Notes"
        value={form.notes}
        onChange={(e) => setForm({ ...form, notes: e.target.value })}
        className="w-full mt-4 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none transition"
      />
      {errors.notes && <p className="text-red-600 text-sm">{errors.notes}</p>}

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
        type="submit"
        className="mt-6 w-full bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-semibold py-3 rounded-xl shadow-md transition-all"
      >
        💾 Save Shop
      </motion.button>
    </motion.form>
  );
}
