import React, { useEffect, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { fetchShopMe } from "../../../api/shop";
import { useShopAuth } from "../../../hooks/useShopAuth";

const ShopProfile = () => {
  const { auth } = useShopAuth();
  const token = auth?.token;
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    ownerName: "",
    email: "",
    phone: "",
    additionalPhone: "",
  });

  const load = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetchShopMe(token);
      const {
        name,
        ownerName = "",
        email = "",
        phone = "",
        additionalPhone = "",
      } = res.data || {};
      setForm((f) => ({
        ...f,
        name: name || "",
        ownerName: ownerName || "",
        email: email || "",
        phone: phone || "",
        additionalPhone: additionalPhone || "",
      }));
    } catch (e) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-white to-yellow-100 p-4">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-6 sm:p-8 border border-yellow-200">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-6 text-center">
          My Profile
        </h1>
        <div className="space-y-4">
          <div>
            <div className="text-xs text-gray-500">Shop Name</div>
            <div className="mt-1 font-medium text-gray-800 break-words">
              {form.name || "-"}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-gray-500">Owner Name</div>
              <div className="mt-1 font-medium text-gray-800 break-words">
                {form.ownerName || "-"}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Email</div>
              <div className="mt-1 font-medium text-gray-800 break-words">
                {form.email || "-"}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-gray-500">Phone</div>
              <div className="mt-1 font-medium text-gray-800 break-words">
                {form.phone || "-"}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Whatsapp Number</div>
              <div className="mt-1 font-medium text-gray-800 break-words">
                {form.additionalPhone || "-"}
              </div>
            </div>
          </div>
          {loading && (
            <div className="text-center text-sm text-gray-500">Loading...</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopProfile;
