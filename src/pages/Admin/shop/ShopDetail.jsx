import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import {
  fetchShop,
  fetchBills,
  createBill,
  updateShop,
  deleteBill,
  fetchBillPayments,
} from "../../../api/shops";
import ShopForm from "../../../components/Admin/shop/ShopForm";
import BillForm from "../../../components/Admin/shop/BillForm";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import { toast, Toaster } from "react-hot-toast";

// Reference to satisfy certain ESLint configs that don't detect <motion.*> usage
const __MOTION_REF__ = motion;

export default function ShopDetail() {
  const { shopId } = useParams();
  const { auth } = useAuth();
  const token = auth?.token;
  const navigate = useNavigate();

  const [shop, setShop] = useState(null);
  const [bills, setBills] = useState([]);
  const [editing, setEditing] = useState(false);
  const [showBillForm, setShowBillForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paidTotals, setPaidTotals] = useState({}); // billId -> sum(amount)
  const [billFilter, setBillFilter] = useState("all"); // all | paid | unpaid

  // number formatter like ShopBills
  const numberFmt = (n) => Number(n || 0).toLocaleString();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const s = await fetchShop(token, shopId);
      setShop(s.data);
      const b = await fetchBills(token, shopId);
      const billList = Array.isArray(b.data) ? b.data : [];
      setBills(billList);

      // fetch payments totals per bill in parallel
      const totalsEntries = await Promise.all(
        billList.map(async (bill) => {
          try {
            const res = await fetchBillPayments(token, shopId, bill._id);
            const totalPaid = (res.data || []).reduce(
              (acc, p) => acc + Number(p.amount || 0),
              0
            );
            return [bill._id, Number(totalPaid.toFixed(2))];
          } catch {
            return [bill._id, 0];
          }
        })
      );
      setPaidTotals(Object.fromEntries(totalsEntries));
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [token, shopId]);

  useEffect(() => {
    if (token) load();
  }, [token, load]);

  const handleUpdate = async (data) => {
    try {
      await updateShop(token, shopId, data);
      await Swal.fire({
        icon: "success",
        title: "Shop Updated!",
        text: "Shop details updated successfully.",
        timer: 1500,
        showConfirmButton: false,
      });
      setEditing(false);
      load();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  const handleCreateBill = async (data) => {
    try {
      await createBill(token, shopId, data);
      toast.success("Bill created successfully!");
      setShowBillForm(false);
      load();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Bill create failed");
    }
  };

  const handleDeleteBill = async (billId) => {
    const result = await Swal.fire({
      title: "Delete this bill?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
      background: "#f9fafb",
    });

    if (!result.isConfirmed) return;

    try {
      await deleteBill(token, shopId, billId);
      await Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Bill deleted successfully.",
        timer: 1500,
        showConfirmButton: false,
      });
      load();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  if (!shop)
    return (
      <div className="flex items-center justify-center h-screen text-gray-600 animate-pulse">
        Loading shop details...
      </div>
    );

  // Build derived bill data with payments and status
  const derivedBills = (bills || []).map((bill) => {
    const subtotal = (bill.items || []).reduce(
      (s, it) => s + (Number(it.quantity) * Number(it.unitPrice) || 0),
      0
    );
    const originalGrand = subtotal - Number(bill.discount || 0);
    const totalPaid = Number((paidTotals[bill._id] || 0).toFixed(2));
    const remaining = Number((originalGrand - totalPaid).toFixed(2));
    const isPaid = remaining <= 0;

    const creditDays = Number(bill.creditPeriodDays || 0);
    const billDate = new Date(bill.date);
    const daysSince = Math.floor(
      (new Date().setHours(0, 0, 0, 0) - billDate.setHours(0, 0, 0, 0)) /
        (1000 * 60 * 60 * 24)
    );
    const remainingDays = creditDays - (isNaN(daysSince) ? 0 : daysSince);

    return {
      bill,
      originalGrand,
      totalPaid,
      remaining,
      isPaid,
      creditDays,
      remainingDays,
    };
  });

  // Apply current filter
  const filteredBills = derivedBills.filter((x) =>
    billFilter === "all" ? true : billFilter === "paid" ? x.isPaid : !x.isPaid
  );

  // Summary totals and status counts (like ShopBills)
  const totals = filteredBills.reduce(
    (acc, x) => ({
      grand: acc.grand + Number(x.originalGrand || 0),
      remaining: acc.remaining + Math.max(0, Number(x.remaining || 0)),
    }),
    { grand: 0, remaining: 0 }
  );

  const statusCounts = filteredBills.reduce(
    (acc, x) => {
      if (x.isPaid) acc.paid += 1;
      else if (Number(x.totalPaid || 0) > 0) acc.partial += 1;
      else acc.unpaid += 1;
      return acc;
    },
    { paid: 0, partial: 0, unpaid: 0 }
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="p-6 min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100"
    >
      <Toaster position="top-right" reverseOrder={false} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-amber-600 to-yellow-700 drop-shadow-md tracking-tight mb-1 leading-[1.3] pb-1">
            {shop.name || "Shop Detail"}
          </h2>
          <p className="text-gray-500 text-sm mt-0">
            Manage bills and update shop information ✨
          </p>
        </motion.div>

        {/* Buttons */}
        <div className="flex flex-wrap gap-3">
          <motion.button
            whileHover={{
              scale: 1.07,
              boxShadow: "0px 4px 15px rgba(250, 204, 21, 0.4)",
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setEditing((e) => !e)}
            className={`relative overflow-hidden px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 ${
              editing
                ? "bg-gradient-to-r from-red-500 to-red-600 text-white"
                : "bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 text-gray-900"
            }`}
          >
            {editing ? "✖ Close Edit" : "✏️ Edit Shop"}
          </motion.button>

          <motion.button
            whileHover={{
              scale: 1.07,
              boxShadow: "0px 4px 15px rgba(16, 185, 129, 0.4)",
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowBillForm((s) => !s)}
            className={`relative overflow-hidden px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 ${
              showBillForm
                ? "bg-gradient-to-r from-red-500 to-red-600 text-white"
                : "bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 text-white"
            }`}
          >
            {showBillForm ? "✖ Close Bill Form" : "➕ Create Bill"}
          </motion.button>
        </div>
      </div>

      {/* Forms */}
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: editing ? 1 : 0, height: editing ? "auto" : 0 }}
        transition={{ duration: 0.4 }}
      >
        {editing && (
          <div className="bg-white p-5 rounded-2xl shadow-md mb-6">
            <ShopForm initial={shop} onSubmit={handleUpdate} />
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{
          opacity: showBillForm ? 1 : 0,
          height: showBillForm ? "auto" : 0,
        }}
        transition={{ duration: 0.4 }}
      >
        {showBillForm && (
          <div className="bg-white p-5 rounded-2xl shadow-md mb-6">
            <BillForm
              onSubmit={handleCreateBill}
              existingNumbers={(bills || []).map((b) =>
                String(b.number || "").trim()
              )}
            />
          </div>
        )}
      </motion.div>

      {/* Summary (like ShopBills) */}
      {(bills || []).length > 0 && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="rounded-2xl p-4 shadow-sm border border-yellow-200 bg-white/80">
              <div className="text-xs text-gray-500">Bills</div>
              <div className="mt-1 text-xl font-semibold text-yellow-800">
                {filteredBills.length}
              </div>
            </div>
            <div className="rounded-2xl p-4 shadow-sm border border-yellow-200 bg-white/80">
              <div className="text-xs text-gray-500">Total</div>
              <div className="mt-1 text-xl font-semibold text-yellow-800">
                Rs. {numberFmt(totals.grand)}
              </div>
            </div>
            <div className="rounded-2xl p-4 shadow-sm border border-yellow-200 bg-white/80">
              <div className="text-xs text-gray-500">Outstanding</div>
              <div className="mt-1 text-xl font-semibold text-rose-700">
                Rs. {numberFmt(totals.remaining)}
              </div>
            </div>
            <div className="rounded-2xl p-4 shadow-sm border border-yellow-200 bg-white/80">
              <div className="text-xs text-gray-500">Cleared</div>
              <div className="mt-1 text-xl font-semibold text-emerald-700">
                Rs. {numberFmt(totals.grand - totals.remaining)}
              </div>
            </div>
          </div>

          {/* Quick status snapshot */}
          <div className="grid grid-cols-3 gap-3 mb-2">
            <div className="rounded-2xl p-3 shadow-sm border border-emerald-200 bg-emerald-50/60 text-center">
              <div className="text-xs text-emerald-700">Paid</div>
              <div className="text-lg font-semibold text-emerald-800">
                {statusCounts.paid}
              </div>
            </div>
            <div className="rounded-2xl p-3 shadow-sm border border-amber-200 bg-amber-50/60 text-center">
              <div className="text-xs text-amber-700">Partial</div>
              <div className="text-lg font-semibold text-amber-800">
                {statusCounts.partial}
              </div>
            </div>
            <div className="rounded-2xl p-3 shadow-sm border border-gray-200 bg-gray-50/60 text-center">
              <div className="text-xs text-gray-700">Unpaid</div>
              <div className="text-lg font-semibold text-gray-800">
                {statusCounts.unpaid}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Bills Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <motion.h3
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-yellow-700"
        >
          Bills
        </motion.h3>

        {/* Filter toggle: All / Paid / Unpaid */}
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex rounded-xl border border-yellow-200 bg-white overflow-hidden shadow-sm"
        >
          <button
            onClick={() => setBillFilter("all")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              billFilter === "all"
                ? "bg-amber-500 text-white"
                : "text-gray-700 hover:bg-yellow-50"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setBillFilter("paid")}
            className={`px-4 py-2 text-sm font-medium transition-colors border-l ${
              billFilter === "paid"
                ? "bg-emerald-500 text-white border-l-0"
                : "text-gray-700 hover:bg-emerald-50"
            }`}
          >
            Paid
          </button>
          <button
            onClick={() => setBillFilter("unpaid")}
            className={`px-4 py-2 text-sm font-medium transition-colors border-l ${
              billFilter === "unpaid"
                ? "bg-rose-500 text-white border-l-0"
                : "text-gray-700 hover:bg-rose-50"
            }`}
          >
            Unpaid
          </button>
        </motion.div>
      </div>

      {loading ? (
        <p className="text-gray-600 text-center mt-10 animate-pulse">
          Loading bills...
        </p>
      ) : (bills || []).length === 0 ? (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-gray-600 text-center mt-10"
        >
          No bills available for this shop 😔
        </motion.p>
      ) : filteredBills.length === 0 ? (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-gray-600 text-center mt-10"
        >
          No {billFilter} bills match your filter.
        </motion.p>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4"
        >
          {filteredBills.map((x, index) => {
            const {
              bill,
              originalGrand,
              totalPaid,
              remaining,
              creditDays,
              remainingDays,
              isPaid,
            } = x;
            return (
              <motion.div
                key={bill._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-yellow-200"
              >
                <h4 className="text-lg font-semibold text-amber-700">
                  Bill #{bill.number}
                </h4>
                <p className="text-gray-600 text-sm">
                  Date: {new Date(bill.date).toLocaleDateString()}
                </p>
                <p className="text-gray-700 mt-2">
                  💰 Grand Total:{" "}
                  <span className="font-semibold text-amber-600">
                    {originalGrand.toFixed(2)}
                  </span>
                </p>
                <p className="text-gray-700">
                  Paid: {totalPaid.toFixed(2)} | Remaining:{" "}
                  {remaining.toFixed(2)}
                </p>
                <p className="text-gray-700">
                  Credit Days: {creditDays} | Remaining Days:{" "}
                  <span
                    className={
                      remainingDays < 0 ? "text-red-600 font-semibold" : ""
                    }
                  >
                    {remainingDays}
                  </span>
                </p>
                <p className="mt-1">
                  Status:{" "}
                  <span
                    className={
                      isPaid
                        ? "text-green-600 font-semibold"
                        : "text-red-600 font-semibold"
                    }
                  >
                    {isPaid ? "Payment Completed" : "Not Paid"}
                  </span>
                </p>

                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() =>
                      navigate(`/admin/shops/${shopId}/bills/${bill._id}`)
                    }
                    className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-all shadow-sm"
                  >
                    Open
                  </button>
                  <button
                    onClick={() => handleDeleteBill(bill._id)}
                    className="px-3 py-1.5 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-all shadow-sm"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
}
