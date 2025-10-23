import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { getNote, deleteNote } from "../../../api/notes";
import Swal from "sweetalert2";
import { toast, Toaster } from "react-hot-toast";
import { motion } from "framer-motion";

// Reference for eslint when using <motion.*>
const __MOTION_REF__ = motion;

export default function AdminNoteDetail() {
  const { auth } = useAuth();
  const token = auth?.token;
  const navigate = useNavigate();
  const { noteId } = useParams();

  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const res = await getNote(token, noteId);
        setNote(res.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token, noteId]);

  const onDelete = async () => {
    const result = await Swal.fire({
      title: "Delete this note?",
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
      await deleteNote(token, noteId);
      toast.success("Note deleted");
      navigate("/admin/notes");
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
              Note Details
            </h1>
            <p className="text-gray-500 text-sm">
              Review note content and links
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            to="/admin/notes"
            className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            Back
          </Link>
          {note && (
            <Link
              to={`/admin/notes/edit/${note._id}`}
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
        {!loading && !note && <div className="text-gray-500">Not found</div>}
        {note && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              {label("Date")}
              <div className="text-lg font-semibold">
                {new Date(note.date).toLocaleDateString()}
              </div>
            </div>
            <div>
              {label("Title")}
              <div className="font-medium">{note.title || "(untitled)"}</div>
            </div>
            <div className="sm:col-span-2">
              {label("Content")}
              <div className="mt-1 whitespace-pre-wrap bg-white/60 rounded p-3 border">
                {note.content}
              </div>
            </div>
            <div>
              {label("Priority")}
              <div>
                <span
                  className={
                    `px-2 py-0.5 rounded-full text-xs ` +
                    (note.priority === "High"
                      ? "bg-red-100 text-red-700"
                      : note.priority === "Medium"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-emerald-100 text-emerald-700")
                  }
                >
                  {note.priority || "Low"}
                </span>
              </div>
            </div>
            <div>
              {label("Shop")}
              <div>{note.shop?.name || "-"}</div>
            </div>
            <div>
              {label("Bill")}
              <div>{note.bill ? `#${note.bill.number}` : "-"}</div>
            </div>
            <div className="sm:col-span-2">
              {label("Tags")}
              <div className="mt-1 flex flex-wrap gap-1">
                {(note.tags || []).length === 0 ? (
                  <span className="text-gray-400">-</span>
                ) : (
                  (note.tags || []).map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 text-xs"
                    >
                      {t}
                    </span>
                  ))
                )}
              </div>
            </div>
            <div>
              {label("Created")}
              <div>{new Date(note.createdAt).toLocaleString()}</div>
            </div>
            <div>
              {label("Updated")}
              <div>{new Date(note.updatedAt).toLocaleString()}</div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
