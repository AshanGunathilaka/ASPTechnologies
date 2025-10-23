import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useShopAuth } from "../../../hooks/useShopAuth";
import { fetchShopBill } from "../../../api/shop";
import { toast, Toaster } from "react-hot-toast";
import { motion } from "framer-motion";

const fmt = (n) => Number(n || 0).toFixed(2);

const ShopBillDetail = () => {
  const __MOTION_REF__ = motion;
  const { auth } = useShopAuth();
  const { billId } = useParams();
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { data } = await fetchShopBill(auth.token, billId);
        setBill(data);
      } catch (e) {
        toast.error(e?.response?.data?.message || "Failed to load bill");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [auth?.token, billId]);

  const subTotal =
    bill?.subTotal ??
    (bill?.items || []).reduce(
      (s, it) => s + (Number(it.quantity) * Number(it.unitPrice) || 0),
      0
    );
  const discount = Number(bill?.discount || 0);
  const initialGrand = Number(subTotal) - discount;
  const remaining = Number(bill?.remaining || bill?.grandTotal || 0);
  const paid = Math.max(0, initialGrand - remaining);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100"
    >
      <Toaster position="top-right" />
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-amber-600 to-yellow-700 tracking-tight">
            Bill Detail
          </h1>
          <Link
            to="/shop/bills"
            className="px-4 py-2 rounded-xl bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
          >
            Back
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-10 bg-yellow-100/60 rounded-2xl" />
            <div className="h-40 bg-yellow-100/60 rounded-2xl" />
          </div>
        ) : bill ? (
          <div className="space-y-4">
            {(() => {
              // compute due date and remaining days if bill is credit
              const creditDays = Number(bill?.creditPeriodDays || 0);
              const isCredit =
                String(bill?.paymentType || "").toLowerCase() === "credit";
              let _due = null;
              let _days = null;
              if (isCredit && creditDays && bill?.date) {
                const base = new Date(bill.date);
                if (!isNaN(base.getTime())) {
                  const due = new Date(base);
                  due.setDate(due.getDate() + creditDays);
                  const today = new Date();
                  const start = new Date(
                    today.getFullYear(),
                    today.getMonth(),
                    today.getDate()
                  );
                  const end = new Date(
                    due.getFullYear(),
                    due.getMonth(),
                    due.getDate()
                  );
                  const msPerDay = 24 * 60 * 60 * 1000;
                  const diff = Math.round((end - start) / msPerDay);
                  _due = due;
                  _days = diff;
                }
              }
              // attach to bill object for downstream render via closure variables
              bill.__dueInfo = _due ? { due: _due, days: _days } : null;
              return null;
            })()}
            {/* Overview / Payment / Totals */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-white/80 rounded-2xl shadow-sm border border-yellow-200">
                <h3 className="font-semibold text-yellow-800 mb-2">Overview</h3>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Bill #</span>
                  <span className="font-medium">{bill.number}</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Date</span>
                  <span className="font-medium">
                    {String(bill.date).slice(0, 10)}
                  </span>
                </div>
                {bill.salesMan && (
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Salesman</span>
                    <span className="font-medium">{bill.salesMan}</span>
                  </div>
                )}
                {bill.status && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Status</span>
                    <span className="px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-700 border border-amber-200">
                      {bill.status}
                    </span>
                  </div>
                )}
              </div>

              <div className="p-4 bg-white/80 rounded-2xl shadow-sm border border-yellow-200">
                <h3 className="font-semibold text-yellow-800 mb-2">Payment</h3>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Type</span>
                  <span className="font-medium">{bill.paymentType || "-"}</span>
                </div>
                {bill.paymentType === "credit" && (
                  <>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Credit Option</span>
                      <span className="font-medium">
                        {bill.creditOption || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        Credit Period (days)
                      </span>
                      <span className="font-medium">
                        {bill.creditPeriodDays || 0}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-gray-600">Due date</span>
                      <span className="font-medium">
                        {bill.__dueInfo?.due
                          ? bill.__dueInfo.due.toISOString().slice(0, 10)
                          : "-"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Time to due</span>
                      <span
                        className={`font-medium ${
                          bill.__dueInfo && bill.__dueInfo.days < 0
                            ? "text-rose-700"
                            : "text-gray-800"
                        }`}
                      >
                        {bill.__dueInfo
                          ? bill.__dueInfo.days > 0
                            ? `in ${bill.__dueInfo.days}d`
                            : bill.__dueInfo.days === 0
                            ? "today"
                            : `${Math.abs(bill.__dueInfo.days)}d late`
                          : "-"}
                      </span>
                    </div>
                  </>
                )}
              </div>

              <div className="p-4 bg-white/80 rounded-2xl shadow-sm border border-yellow-200">
                <h3 className="font-semibold text-yellow-800 mb-2">Totals</h3>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Sub Total</span>
                  <span className="font-medium">{fmt(subTotal)}</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Discount</span>
                  <span className="font-medium">{fmt(discount)}</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Grand Total</span>
                  <span className="font-semibold">{fmt(initialGrand)}</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Paid</span>
                  <span className="font-semibold text-emerald-700">
                    {fmt(paid)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Remaining</span>
                  <span className="font-semibold text-amber-700">
                    {fmt(remaining)}
                  </span>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="rounded-2xl border border-yellow-200 bg-white/80 p-4 shadow-sm">
              <h3 className="font-semibold text-yellow-800 mb-2">Items</h3>
              {bill.items?.length ? (
                <>
                  {/* Desktop/tablet table */}
                  <div className="overflow-x-auto hidden md:block">
                    <table className="w-full text-sm border border-yellow-200 rounded-xl overflow-hidden">
                      <thead className="bg-yellow-50 text-yellow-800">
                        <tr>
                          <th className="text-left p-3">Description</th>
                          <th className="text-right p-3">Qty</th>
                          <th className="text-right p-3">Unit Price</th>
                          <th className="text-right p-3">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bill.items.map((it, idx) => {
                          const qty = Number(it.quantity || 0);
                          const price = Number(it.unitPrice || 0);
                          const amount =
                            it.amount != null ? Number(it.amount) : qty * price;
                          return (
                            <tr
                              key={idx}
                              className="border-t border-yellow-100"
                            >
                              <td className="p-3">{it.description}</td>
                              <td className="p-3 text-right">{qty}</td>
                              <td className="p-3 text-right">{fmt(price)}</td>
                              <td className="p-3 text-right font-semibold text-amber-700">
                                {fmt(amount)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile stacked list */}
                  <div className="space-y-3 md:hidden">
                    {bill.items.map((it, idx) => {
                      const qty = Number(it.quantity || 0);
                      const price = Number(it.unitPrice || 0);
                      const amount =
                        it.amount != null ? Number(it.amount) : qty * price;
                      return (
                        <div
                          key={idx}
                          className="rounded-xl border border-yellow-200 bg-white/70 p-3"
                        >
                          <div className="font-medium text-yellow-800 mb-1 truncate">
                            {it.description}
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Qty</span>
                            <span className="font-medium">{qty}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Unit Price</span>
                            <span className="font-medium">{fmt(price)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Amount</span>
                            <span className="font-semibold text-amber-700">
                              {fmt(amount)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="text-sm text-gray-500">No items</div>
              )}
            </div>

            {bill.notes ? (
              <div className="rounded-2xl border border-yellow-200 bg-white/80 p-4 shadow-sm">
                <h3 className="font-semibold text-yellow-800 mb-2">Notes</h3>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {bill.notes}
                </p>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="text-center text-gray-500 bg-white/60 border border-yellow-200 rounded-2xl p-10">
            <div className="text-lg font-semibold mb-1">Bill not found</div>
            <div className="text-sm">It may have been removed.</div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ShopBillDetail;
