import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import {
  fetchBill,
  fetchBillPayments,
  createBillPayment,
  deleteBillPayment,
} from "../../../api/shops";
import Swal from "sweetalert2";
import { toast, Toaster } from "react-hot-toast";
import { motion } from "framer-motion";
// Reference to satisfy ESLint in some configs when using <motion.*> JSX
const __MOTION_REF__ = motion;

export default function BillPaymentsPage() {
  const { shopId, billId } = useParams();
  const { auth } = useAuth();
  const token = auth?.token;
  const navigate = useNavigate();

  const [bill, setBill] = useState(null);
  const [payments, setPayments] = useState([]);
  const [formData, setFormData] = useState({
    amount: "",
    method: "cash",
    chequeNumber: "",
    note: "",
    date: new Date().toISOString().split("T")[0],
  });

  const loadData = useCallback(async () => {
    try {
      const [billRes, paymentsRes] = await Promise.all([
        fetchBill(token, shopId, billId),
        fetchBillPayments(token, shopId, billId),
      ]);
      const billData = billRes.data;
      const payData = paymentsRes.data || [];
      setBill(billData);
      setPayments(payData);

      // Compute original grand from bill items - discount (independent from payments)
      const subtotal = (billData?.items || []).reduce(
        (s, it) => s + (Number(it.quantity) * Number(it.unitPrice) || 0),
        0
      );
      const discount = Number(billData?.discount || 0);
      const originalGrand = subtotal - discount;
      const totalPaid = payData.reduce((a, p) => a + Number(p.amount || 0), 0);
      const remaining = Math.max(
        0,
        Number((originalGrand - totalPaid).toFixed(2))
      );
      setFormData((prev) => ({
        ...prev,
        amount: remaining > 0 ? String(remaining) : "",
      }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load data");
    }
  }, [token, shopId, billId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createBillPayment(token, shopId, billId, formData);
      toast.success("Payment added successfully!");
      setFormData({
        amount: "",
        method: "cash",
        chequeNumber: "",
        note: "",
        date: new Date().toISOString().split("T")[0],
      });
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create payment");
    }
  };

  const handleDelete = async (paymentId) => {
    const result = await Swal.fire({
      title: "Delete this payment?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
      backdrop: "rgba(0,0,0,0.4)",
    });
    if (!result.isConfirmed) return;

    try {
      await deleteBillPayment(token, shopId, billId, paymentId);
      toast.success("Payment deleted successfully!");
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete payment");
    }
  };

  if (!bill)
    return (
      <p className="p-6 text-gray-600 animate-pulse">
        Loading bill and payments...
      </p>
    );

  // Always compute the original grand total from items and discount
  const subtotal = (bill.items || []).reduce(
    (s, it) => s + (Number(it.quantity) * Number(it.unitPrice) || 0),
    0
  );
  const originalGrand = subtotal - Number(bill.discount || 0);
  const totalPaid = payments.reduce((a, b) => a + Number(b.amount || 0), 0);
  const remainingBalance = Number((originalGrand - totalPaid).toFixed(2));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 bg-gradient-to-br from-yellow-50 via-white to-yellow-100 min-h-screen"
    >
      <Toaster position="top-right" reverseOrder={false} />
      <div className="max-w-5xl mx-auto bg-white p-6 rounded-2xl shadow-lg border border-yellow-200">
        <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-amber-600 to-yellow-700 drop-shadow-md mb-2">
          Payments for Bill #{bill.number}
        </h1>

        <p className="text-gray-600 mb-4">
          <strong>Grand Total:</strong> {originalGrand.toFixed(2)} <br />
          <strong>Total Paid:</strong> {totalPaid.toFixed(2)} <br />
          <strong>Remaining Balance:</strong> {remainingBalance.toFixed(2)}
        </p>

        {/* Payment Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4 border-t pt-4 mt-4"
        >
          <h2 className="text-lg font-semibold mb-2">Add Payment</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Amount</label>
              <input
                type="number"
                required
                step="0.01"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-amber-400 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Method</label>
              <select
                value={formData.method}
                onChange={(e) =>
                  setFormData({ ...formData, method: e.target.value })
                }
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-amber-400 outline-none"
              >
                <option value="cash">Cash</option>
                <option value="cheque">Cheque</option>
              </select>
            </div>
            {formData.method === "cheque" && (
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium">
                  Cheque Number
                </label>
                <input
                  type="text"
                  value={formData.chequeNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, chequeNumber: e.target.value })
                  }
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-amber-400 outline-none"
                />
              </div>
            )}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium">Note</label>
              <textarea
                value={formData.note}
                onChange={(e) =>
                  setFormData({ ...formData, note: e.target.value })
                }
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-amber-400 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-amber-400 outline-none"
              />
            </div>
          </div>

          <motion.button
            whileHover={{
              scale: 1.05,
              boxShadow: "0px 4px 15px rgba(34,197,94,0.4)",
            }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="relative mt-3 px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-green-500 to-green-600 overflow-hidden"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 hover:opacity-60 translate-x-[-100%] hover:translate-x-[100%] transition-all duration-[1.2s] rounded-xl"></span>
            <span className="relative z-10">💰 Add Payment</span>
          </motion.button>
        </motion.form>

        {/* Payment List */}
        <h2 className="text-lg font-semibold mt-6 mb-2">Previous Payments</h2>
        {payments.length === 0 ? (
          <p className="text-gray-600">No payments found.</p>
        ) : (
          <div className="overflow-x-auto border rounded-xl shadow-sm">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-yellow-50">
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-left">Amount</th>
                  <th className="p-3 text-left">Method</th>
                  <th className="p-3 text-left">Cheque #</th>
                  <th className="p-3 text-left">Note</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p._id} className="border-t">
                    <td className="p-2">
                      {new Date(p.date).toLocaleDateString()}
                    </td>
                    <td className="p-2">{p.amount}</td>
                    <td className="p-2 capitalize">{p.method}</td>
                    <td className="p-2">{p.chequeNumber || "-"}</td>
                    <td className="p-2">{p.note || "-"}</td>
                    <td className="p-2 text-center">
                      <button
                        onClick={() => handleDelete(p._id)}
                        className="text-red-500 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(`/admin/shops/${shopId}/bills/${billId}`)}
          className="mt-4 px-5 py-2 rounded-xl font-semibold bg-gray-600 text-white hover:bg-gray-700 transition-all shadow"
        >
          ← Back to Bill
        </motion.button>
      </div>
    </motion.div>
  );
}
