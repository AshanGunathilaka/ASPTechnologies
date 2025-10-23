import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { adminGetOrder, adminDeleteOrder } from "../../../api/orders";
import Swal from "sweetalert2";
import { toast, Toaster } from "react-hot-toast";
import { motion } from "framer-motion";
// Reference to satisfy certain ESLint configs that don't detect <motion.*> usage
const __MOTION_REF__ = motion;

export default function AdminOrderDetail() {
  const { orderId } = useParams();
  const { auth } = useAuth();
  const token = auth?.token;
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const res = await adminGetOrder(token, orderId);
        setOrder(res.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token, orderId]);

  const onDelete = async () => {
    const result = await Swal.fire({
      title: "Delete this order?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
      background: "#f9fafb",
      backdrop: `rgba(0,0,0,0.4)`,
    });
    if (!result.isConfirmed) return;
    try {
      await adminDeleteOrder(token, orderId);
      toast.success("Order deleted");
      navigate("/admin/orders");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed");
    }
  };

  const label = (t) => <span className="text-gray-500 text-sm">{t}</span>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100"
    >
      <Toaster position="top-right" />
      <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-yellow-400 to-yellow-600 p-3 rounded-full shadow-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="white"
              className="w-7 h-7"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 7.5h18M3 12h18M3 16.5h18"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-amber-600 to-yellow-700 tracking-tight">
              Order Details
            </h1>
            <p className="text-gray-500 text-sm">
              Review order info and edit if needed
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            to="/admin/orders"
            className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            Back
          </Link>
          {order && (
            <Link
              to={`/admin/orders/${order._id}`}
              className="px-4 py-2 rounded-xl bg-yellow-600 text-white hover:bg-yellow-700"
            >
              Edit
            </Link>
          )}
          <button
            onClick={onDelete}
            className="px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-yellow-200 p-5">
        {loading && <div className="text-gray-500">Loading...</div>}
        {!loading && !order && <div className="text-gray-500">Not found</div>}
        {order && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              {label("Order Number")}
              <div className="text-lg font-semibold">
                {order.orderNumber || "-"}
              </div>
            </div>
            <div>
              {label("Status")}
              <div className="capitalize inline-flex px-2 py-1 rounded bg-yellow-50 text-yellow-700 border border-yellow-200">
                {order.status}
              </div>
            </div>
            <div>
              {label("Type")}
              <div className="capitalize">{order.type}</div>
            </div>
            <div>
              {label("Shop")}
              <div>{order.shop?.name || "-"}</div>
            </div>
            {order.type === "item" ? (
              <div className="sm:col-span-2">
                {label("Item")}
                <div className="flex items-center gap-3">
                  {order.item?.image && (
                    <img
                      src={order.item.image}
                      alt={order.item.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  )}
                  <div>
                    <div className="font-medium">
                      {order.item?.name || order.item}
                    </div>
                    {order.item?.description && (
                      <div className="text-sm text-gray-500 line-clamp-2">
                        {order.item.description}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="sm:col-span-2">
                {label("Offer")}
                <div className="flex items-center gap-3">
                  {order.offer?.images?.[0] && (
                    <img
                      src={order.offer.images[0]}
                      alt={order.offer.title}
                      className="w-12 h-12 object-cover rounded"
                    />
                  )}
                  <div>
                    <div className="font-medium">
                      {order.offer?.title || order.offer}
                    </div>
                    {order.offer?.description && (
                      <div className="text-sm text-gray-500 line-clamp-2">
                        {order.offer.description}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            <div>
              {label("Quantity")}
              <div>{order.quantity}</div>
            </div>
            <div>
              {label("Price")}
              <div>
                {order.price != null ? Number(order.price).toFixed(2) : "-"}
              </div>
            </div>
            <div className="sm:col-span-2">
              {label("Note")}
              <div className="whitespace-pre-wrap text-gray-700">
                {order.note || "-"}
              </div>
            </div>
            <div>
              {label("Created")}
              <div>{new Date(order.createdAt).toLocaleString()}</div>
            </div>
            <div>
              {label("Updated")}
              <div>{new Date(order.updatedAt).toLocaleString()}</div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
