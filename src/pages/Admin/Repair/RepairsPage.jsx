import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { fetchRepairs, deleteRepair } from "../../../api/repair";
import Swal from "sweetalert2";
import { Toaster, toast } from "react-hot-toast";

// Reference for ESLint framer-motion usage
const __MOTION_REF__ = motion;

export default function RepairsPage() {
  const { auth } = useAuth();
  const token = auth?.token;
  const navigate = useNavigate();

  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchImei, setSearchImei] = useState("");

  const loadRepairs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchRepairs(token);
      setRepairs(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch repairs");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadRepairs();
  }, [loadRepairs]);

  const resetList = async () => {
    setSearchImei("");
    await loadRepairs();
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete this repair?",
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
      await deleteRepair(token, id);
      toast.success("Repair deleted successfully!");
      loadRepairs();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete repair");
    }
  };

  if (loading)
    return (
      <div className="p-6">
        <Toaster position="top-right" />
        Loading repairs...
      </div>
    );

  // Precompute filtered repairs once for use in both table and cards
  const filteredRepairs = repairs.filter((r) => {
    const q = searchImei.trim().toLowerCase();
    if (!q) return true;
    const imei = String(r.imei || "").toLowerCase();
    return imei.includes(q);
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100"
    >
      <Toaster position="top-right" />
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-4 mb-5">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="bg-gradient-to-tr from-yellow-400 to-yellow-600 p-3 rounded-full shadow-md"
            >
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
                  d="M4 7h16M4 12h16M7 21l3-3m0 0l3 3m-3-3V3"
                />
              </svg>
            </motion.div>
            <div>
              <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-amber-600 to-yellow-700 tracking-tight">
                Repairs
              </h1>
              <p className="text-gray-500 text-sm">Manage device repair jobs</p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              <input
                type="text"
                placeholder="Search IMEI..."
                value={searchImei}
                onChange={(e) => setSearchImei(e.target.value)}
                className="border rounded-lg px-3 py-2 w-full sm:w-56 focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
              />
              <button
                type="button"
                onClick={resetList}
                className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300"
              >
                Reset
              </button>
            </form>
            <button
              onClick={() => navigate("/admin/repairs/add")}
              className="relative overflow-hidden px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 text-white hover:from-yellow-500 hover:to-amber-500 shadow"
            >
              Add Repair
            </button>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-yellow-200 overflow-hidden">
          {filteredRepairs.length === 0 ? (
            <p className="p-6 text-gray-600">No repairs found.</p>
          ) : (
            <>
              {/* Mobile card list */}
              <div className="md:hidden divide-y">
                {filteredRepairs.map((r) => (
                  <div key={r._id} className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => navigate(`/admin/repairs/${r._id}`)}
                        className="text-amber-700 font-semibold hover:underline"
                        title="View details"
                      >
                        #{r.jobSheetNumber}
                      </button>
                      <span
                        className={
                          "px-2 py-0.5 rounded-full text-xs border " +
                          (r.status === "Completed"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : r.status === "Delivered"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : r.status === "Sent"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-blue-50 text-blue-700 border-blue-200")
                        }
                      >
                        {r.status}
                      </span>
                    </div>

                    <div className="mt-2 grid grid-cols-1 gap-1 text-sm text-gray-700">
                      <div>
                        <span className="text-gray-500">Shop: </span>
                        {r.shop?.name || "-"}
                      </div>
                      <div>
                        <span className="text-gray-500">Customer: </span>
                        {r.customerName}
                      </div>
                      <div>
                        <span className="text-gray-500">Phone: </span>
                        {r.phoneModel}
                      </div>
                      <div>
                        <span className="text-gray-500">IMEI: </span>
                        {r.imei || "-"}
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-4">
                      <button
                        onClick={() => navigate(`/admin/repairs/edit/${r._id}`)}
                        className="text-blue-600 font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(r._id)}
                        className="text-red-600 font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-700">
                      <th className="p-3 text-left">Job Sheet #</th>
                      <th className="p-3 text-left">Shop</th>
                      <th className="p-3 text-left">Customer</th>
                      <th className="p-3 text-left">Phone Model</th>
                      <th className="p-3 text-left">IMEI</th>
                      <th className="p-3 text-left">Status</th>
                      <th className="p-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRepairs.map((r, i) => (
                      <tr
                        key={r._id}
                        className={i % 2 ? "bg-white" : "bg-gray-50 border-t"}
                      >
                        <td className="p-3 font-medium text-gray-800">
                          <button
                            type="button"
                            onClick={() => navigate(`/admin/repairs/${r._id}`)}
                            className="text-amber-700 hover:underline font-semibold"
                            title="View details"
                          >
                            {r.jobSheetNumber}
                          </button>
                        </td>
                        <td className="p-3">{r.shop?.name || "-"}</td>
                        <td className="p-3">{r.customerName}</td>
                        <td className="p-3">{r.phoneModel}</td>
                        <td className="p-3">{r.imei || "-"}</td>
                        <td className="p-3">
                          <span
                            className={
                              "px-2 py-0.5 rounded-full text-xs border " +
                              (r.status === "Completed"
                                ? "bg-green-50 text-green-700 border-green-200"
                                : r.status === "Delivered"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : r.status === "Sent"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-blue-50 text-blue-700 border-blue-200")
                            }
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-3">
                            <button
                              onClick={() =>
                                navigate(`/admin/repairs/edit/${r._id}`)
                              }
                              className="text-blue-600 hover:underline"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(r._id)}
                              className="text-red-600 hover:underline"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
