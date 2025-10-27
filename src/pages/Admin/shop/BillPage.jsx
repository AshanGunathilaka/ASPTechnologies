import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import {
  fetchBill,
  fetchBillPayments,
  updateBill,
  createBill,
} from "../../../api/shops";
import BillForm from "../../../components/Admin/shop/BillForm";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import { toast, Toaster } from "react-hot-toast";

// Reference to satisfy ESLint in some configs when using <motion.*> JSX
const __MOTION_REF__ = motion;

export default function BillPage() {
  const { shopId, billId } = useParams();
  const { auth } = useAuth();
  const token = auth?.token;
  const navigate = useNavigate();

  const [bill, setBill] = useState(null);
  const [payments, setPayments] = useState([]);
  const [mode, setMode] = useState(billId ? "view" : "create");

  useEffect(() => {
    const loadBill = async () => {
      try {
        if (billId) {
          // fetch bill and payments in parallel
          const [res, paymentsRes] = await Promise.all([
            fetchBill(token, shopId, billId),
            fetchBillPayments(token, shopId, billId),
          ]);
          setBill(res.data);
          setPayments(paymentsRes.data || []);
        }
      } catch (err) {
        console.error(err);
        toast.error(err.response?.data?.message || "Failed to load bill");
      }
    };
    loadBill();
  }, [billId, shopId, token]);

  const handleSave = async (data) => {
    try {
      if (mode === "create") {
        await createBill(token, shopId, data);
        await Swal.fire({
          icon: "success",
          title: "Bill Created!",
          text: "New bill created successfully.",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        await updateBill(token, shopId, billId, data);
        await Swal.fire({
          icon: "success",
          title: "Bill Updated!",
          text: "Bill updated successfully.",
          timer: 1500,
          showConfirmButton: false,
        });
      }
      navigate(`/admin/shops/${shopId}`);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to save bill");
    }
  };

  if (billId && !bill)
    return (
      <div className="flex items-center justify-center h-screen text-gray-600 animate-pulse">
        Loading bill...
      </div>
    );

  // Compute totals from bill items/discount and payments
  const computedSubtotal = (bill?.items || []).reduce(
    (s, it) => s + (Number(it.quantity) * Number(it.unitPrice) || 0),
    0
  );

  // Prefer persisted values when available for displayed sub total and discount
  const subTotal =
    bill?.subTotal !== undefined ? Number(bill.subTotal) : computedSubtotal;
  const discount = Number(bill?.discount || 0);
  const originalGrand = subTotal - discount;

  const totalPaid = payments.reduce((a, p) => a + Number(p.amount || 0), 0);
  const remainingBalance = Math.max(
    0,
    Number((originalGrand - totalPaid).toFixed(2))
  );

  // Derive status (align with ShopBills and other pages)
  const billStatus =
    remainingBalance <= 0
      ? "paid"
      : totalPaid > 0
      ? "partially paid"
      : "unpaid";

  const statusCounts = {
    paid: billStatus === "paid" ? 1 : 0,
    partial: billStatus === "partially paid" ? 1 : 0,
    unpaid: billStatus === "unpaid" ? 1 : 0,
  };

  const fmt = (n) => Number(n || 0).toFixed(2);
  const numberFmt = (n) => Number(n || 0).toLocaleString();

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="p-6 min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100"
    >
      <Toaster position="top-right" reverseOrder={false} />

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto bg-white p-6 rounded-2xl shadow-lg"
      >
        {/* Back Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(`/admin/shops/${shopId}`)}
          className="mb-4 px-4 py-2 font-semibold rounded-xl shadow text-white bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 hover:from-yellow-600 hover:via-amber-600 hover:to-yellow-700 transition-all"
        >
          ← Back to Shop
        </motion.button>

        {/* Header */}
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-amber-600 to-yellow-700 mb-4"
        >
          {mode === "create"
            ? "New Bill"
            : `Bill #${bill.number} — ${new Date(
                bill.date
              ).toLocaleDateString()}`}
        </motion.h1>

        {/* Bill Details or Form */}
        {mode === "view" && bill ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {/* Summary (like ShopBills) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="rounded-2xl p-4 shadow-sm border border-yellow-200 bg-white/80">
                <div className="text-xs text-gray-500">Bills</div>
                <div className="mt-1 text-xl font-semibold text-yellow-800">
                  1
                </div>
              </div>
              <div className="rounded-2xl p-4 shadow-sm border border-yellow-200 bg-white/80">
                <div className="text-xs text-gray-500">Total</div>
                <div className="mt-1 text-xl font-semibold text-yellow-800">
                  Rs. {numberFmt(originalGrand)}
                </div>
              </div>
              <div className="rounded-2xl p-4 shadow-sm border border-yellow-200 bg-white/80">
                <div className="text-xs text-gray-500">Outstanding</div>
                <div className="mt-1 text-xl font-semibold text-rose-700">
                  Rs. {numberFmt(remainingBalance)}
                </div>
              </div>
              <div className="rounded-2xl p-4 shadow-sm border border-yellow-200 bg-white/80">
                <div className="text-xs text-gray-500">Cleared</div>
                <div className="mt-1 text-xl font-semibold text-emerald-700">
                  Rs. {numberFmt(originalGrand - remainingBalance)}
                </div>
              </div>
            </div>

            {/* Quick status snapshot */}
            <div className="grid grid-cols-3 gap-3">
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

            {/* Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-yellow-50 rounded-xl shadow-sm border border-yellow-200">
                <h3 className="font-semibold text-amber-700 mb-2">Overview</h3>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">Bill #</span>
                  <span>{bill.number}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">Date</span>
                  <span>{new Date(bill.date).toLocaleDateString()}</span>
                </div>
                {bill.salesMan && (
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">Salesman</span>
                    <span>{bill.salesMan}</span>
                  </div>
                )}
                {bill.status && (
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Status</span>
                    <span className="px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-700 border border-amber-200">
                      {bill.status}
                    </span>
                  </div>
                )}
              </div>

              {/* Payment Info */}
              <div className="p-4 bg-yellow-50 rounded-xl shadow-sm border border-yellow-200">
                <h3 className="font-semibold text-amber-700 mb-2">Payment</h3>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">Type</span>
                  <span>{bill.paymentType || "-"}</span>
                </div>
                {bill.paymentType === "credit" && (
                  <>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold">Credit Option</span>
                      <span>{bill.creditOption || "-"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">
                        Credit Period (days)
                      </span>
                      <span>{bill.creditPeriodDays || 0}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Totals */}
              <div className="p-4 bg-yellow-50 rounded-xl shadow-sm border border-yellow-200">
                <h3 className="font-semibold text-amber-700 mb-2">Totals</h3>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">Sub Total</span>
                  <span>{fmt(subTotal)}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">Discount</span>
                  <span>{fmt(discount)}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">Grand Total</span>
                  <span className="font-semibold">{fmt(originalGrand)}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">Paid</span>
                  <span className="text-green-600 font-semibold">
                    {fmt(totalPaid)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Remaining</span>
                  <span className="text-amber-600 font-semibold">
                    {fmt(remainingBalance)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-md border border-yellow-200 overflow-x-auto">
              <h3 className="font-semibold mb-3">Items</h3>
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-600 border-b">
                    <th className="py-2 pr-4">Description</th>
                    <th className="py-2 pr-4">Qty</th>
                    <th className="py-2 pr-4">Unit Price</th>
                    <th className="py-2 pr-4">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {(bill.items || []).map((item, idx) => {
                    const qty = Number(item.quantity || 0);
                    const price = Number(item.unitPrice || 0);
                    const amount =
                      item.amount !== undefined
                        ? Number(item.amount)
                        : qty * price;
                    return (
                      <tr key={idx} className="border-b last:border-0">
                        <td className="py-2 pr-4">{item.description}</td>
                        <td className="py-2 pr-4">{qty}</td>
                        <td className="py-2 pr-4">{fmt(price)}</td>
                        <td className="py-2 pr-4 font-semibold text-amber-700">
                          {fmt(amount)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {bill.notes ? (
              <div className="bg-white p-4 rounded-xl shadow-md border border-yellow-200">
                <h3 className="font-semibold mb-2">Notes</h3>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {bill.notes}
                </p>
              </div>
            ) : null}

            <div className="flex gap-3 mt-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setMode("edit")}
                className="px-4 py-2 bg-yellow-500 text-white rounded-xl shadow hover:bg-yellow-600 transition-all"
              >
                Edit Bill
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() =>
                  navigate(`/admin/shops/${shopId}/bills/${billId}/payments`)
                }
                className="px-4 py-2 bg-green-500 text-white rounded-xl shadow hover:bg-green-600 transition-all"
              >
                View Payments
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mt-4"
          >
            <BillForm initial={bill || {}} onSubmit={handleSave} />
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
