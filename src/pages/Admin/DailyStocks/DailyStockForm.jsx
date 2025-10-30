import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  createDailyStock,
  updateDailyStock,
  fetchDailyStocks,
} from "../../../api/dailyStock";
import { fetchItems } from "../../../api/item";
import { useAuth } from "../../../context/AuthContext";
import { motion } from "framer-motion";
import { toast, Toaster } from "react-hot-toast";

// Reference for eslint when using <motion.*>
const __MOTION_REF__ = motion;

export default function DailyStockForm() {
  const { stockId } = useParams();
  const { auth } = useAuth();
  const token = auth?.token;
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    note: "",
    items: [
      {
        itemId: "",
        itemName: "",
        broughtOutQty: "",
        soldQty: "",
        actualRemaining: "",
      },
    ],
  });

  // ✅ Load items + existing stock data
  const loadData = async () => {
    try {
      const itemRes = await fetchItems(token);
      setItems(itemRes.data);

      if (stockId) {
        const res = await fetchDailyStocks(token);
        const existing = res.data.find((x) => x._id === stockId);

        if (existing) {
          const mappedItems = existing.items.map((i) => {
            const matched = itemRes.data.find(
              (itm) => itm.name === i.productName
            );
            return {
              itemId: matched?._id || "",
              itemName: i.productName || matched?.name || "",
              broughtOutQty: i.startingQty,
              soldQty: i.soldQty,
              actualRemaining: i.actualRemainingQty,
            };
          });

          setFormData({
            date: existing.date.split("T")[0],
            note: existing.note || "",
            items: mappedItems.length ? mappedItems : formData.items,
          });
        }
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load data");
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stockId]);

  // ✅ Handle field changes
  const handleChange = (e, index) => {
    const { name, value } = e.target;
    const updatedItems = [...formData.items];
    updatedItems[index][name] = value;
    // Clear stale itemId when user types a custom name
    if (name === "itemName") {
      updatedItems[index].itemId = "";
    }
    setFormData({ ...formData, items: updatedItems });
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          itemId: "",
          itemName: "",
          broughtOutQty: "",
          soldQty: "",
          actualRemaining: "",
        },
      ],
    });
  };

  const handleRemoveItem = (index) => {
    const updated = [...formData.items];
    updated.splice(index, 1);
    setFormData({ ...formData, items: updated });
  };

  // ✅ Submit data
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        date: formData.date,
        note: formData.note,
        items: formData.items.map((i) => ({
          productName:
            items.find((x) => x._id === i.itemId)?.name || i.itemName || "",
          startingQty: Number(i.broughtOutQty),
          soldQty: Number(i.soldQty),
          actualRemainingQty: Number(i.actualRemaining),
        })),
      };

      if (stockId) {
        await updateDailyStock(token, stockId, payload);
        toast.success("Daily stock updated");
      } else {
        await createDailyStock(token, payload);
        toast.success("Daily stock created");
      }
      navigate("/admin/dailystocks");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error saving daily stock");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100"
    >
      <Toaster position="top-right" />
      <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-4 mb-4">
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
              {stockId ? "Edit Daily Stock" : "Add Daily Stock"}
            </h1>
            <p className="text-gray-500 text-sm">
              Record daily stock movements
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            to="/admin/dailystocks"
            className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            Back
          </Link>
          {stockId && (
            <Link
              to={`/admin/dailystocks/${stockId}/detail`}
              className="px-4 py-2 rounded-xl bg-yellow-600 text-white hover:bg-yellow-700"
            >
              View
            </Link>
          )}
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-4xl mx-auto space-y-4 bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-yellow-200"
      >
        <div>
          <label className="block text-sm font-medium">Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        {formData.items.map((item, index) => {
          const expectedRemaining =
            item.broughtOutQty && item.soldQty
              ? item.broughtOutQty - item.soldQty
              : 0;
          const statusMatched =
            parseInt(item.actualRemaining) === expectedRemaining;

          return (
            <div
              key={index}
              className="border p-4 rounded-lg bg-yellow-50/40 space-y-3 border-yellow-200"
            >
              <div className="flex justify-between items-center">
                <h2 className="font-semibold text-lg text-gray-700">
                  Item {index + 1}
                </h2>
                {formData.items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="text-red-600 text-sm hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="relative">
                <label className="block text-sm font-medium">Item</label>
                <input
                  type="text"
                  name="itemName"
                  value={item.itemName}
                  onChange={(e) => handleChange(e, index)}
                  className="w-full border p-2 rounded"
                  placeholder="Type item name..."
                  autoComplete="off"
                />
                {/* Suggestions */}
                {item.itemName?.trim() && (
                  <div className="absolute z-10 mt-1 w-full bg-white border rounded shadow max-h-60 overflow-auto">
                    {items
                      .filter((opt) =>
                        String(opt.name || "")
                          .toLowerCase()
                          .includes(item.itemName.trim().toLowerCase())
                      )
                      .slice(0, 8)
                      .map((opt) => (
                        <button
                          key={opt._id}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            const updated = [...formData.items];
                            updated[index].itemId = opt._id;
                            updated[index].itemName = opt.name;
                            setFormData({ ...formData, items: updated });
                          }}
                          className="block w-full text-left px-3 py-2 hover:bg-yellow-50"
                        >
                          {opt.name}
                        </button>
                      ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium">
                    Brought Out
                  </label>
                  <input
                    type="number"
                    name="broughtOutQty"
                    value={item.broughtOutQty}
                    onChange={(e) => handleChange(e, index)}
                    className="w-full border p-2 rounded"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium">Sold</label>
                  <input
                    type="number"
                    name="soldQty"
                    value={item.soldQty}
                    onChange={(e) => handleChange(e, index)}
                    className="w-full border p-2 rounded"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium">
                    Actual Remaining
                  </label>
                  <input
                    type="number"
                    name="actualRemaining"
                    value={item.actualRemaining}
                    onChange={(e) => handleChange(e, index)}
                    className="w-full border p-2 rounded"
                    required
                  />
                </div>
              </div>

              <div className="p-2 bg-white/70 rounded border text-sm">
                <p>
                  Expected Remaining:{" "}
                  <span className="font-semibold text-blue-600">
                    {expectedRemaining}
                  </span>
                </p>
                {item.actualRemaining && (
                  <p
                    className={`font-semibold ${
                      statusMatched ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    Status: {statusMatched ? "Matched ✅" : "Mismatch ❌"}
                  </p>
                )}
              </div>
            </div>
          );
        })}

        <button
          type="button"
          onClick={handleAddItem}
          className="mt-3 px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200"
        >
          ➕ Add Another Item
        </button>

        <div>
          <label className="block text-sm font-medium mt-4">Note</label>
          <textarea
            name="note"
            value={formData.note}
            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
            className="w-full border p-2 rounded"
            rows="3"
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => navigate("/admin/dailystocks")}
            className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 rounded-xl bg-yellow-600 text-white hover:bg-yellow-700 shadow"
          >
            {stockId ? "Update" : "Add"}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
