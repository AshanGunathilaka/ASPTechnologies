import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  fetchCriticalCases,
  deleteCriticalCase,
} from "../../../api/criticalCase";
import CriticalCaseForm from "./CriticalCaseForm";
import CriticalCaseList from "./CriticalCaseList";
import { useAuth } from "../../../context/AuthContext";
import Swal from "sweetalert2";
import { toast, Toaster } from "react-hot-toast";
import { motion } from "framer-motion";

// Reference for eslint when using <motion.*>
const __MOTION_REF__ = motion;

export default function CriticalCasesPage() {
  const [cases, setCases] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const { auth } = useAuth();
  const token = auth?.token;

  const loadCases = async () => {
    if (!token) return;
    try {
      const res = await fetchCriticalCases(token);
      setCases(res.data || []);
    } catch (error) {
      console.error("Error fetching cases:", error);
    }
  };

  useEffect(() => {
    loadCases();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleDelete = async (id) => {
    if (!token) return;
    const result = await Swal.fire({
      title: "Delete this critical case?",
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
      await deleteCriticalCase(token, id);
      toast.success("Critical case deleted");
      loadCases();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Delete failed");
    }
  };

  const handleEdit = (c) => {
    setSelectedCase(c);
    setShowForm(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100"
    >
      <Toaster position="top-right" />

      {!showForm ? (
        <>
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
                  Critical Cases
                </h1>
                <p className="text-gray-500 text-sm">
                  Manage flagged critical cases
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowForm(true)}
                className="px-4 py-2 rounded-xl bg-yellow-600 text-white hover:bg-yellow-700 shadow"
              >
                + Create Case
              </button>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-yellow-200 overflow-x-auto">
            <CriticalCaseList
              cases={cases}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        </>
      ) : (
        <CriticalCaseForm
          existingCase={selectedCase}
          onCancel={() => {
            setShowForm(false);
            setSelectedCase(null);
            loadCases();
          }}
          onSaved={() => {
            setShowForm(false);
            setSelectedCase(null);
            loadCases();
          }}
        />
      )}
    </motion.div>
  );
}
