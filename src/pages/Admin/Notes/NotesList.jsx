import React, { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { fetchNotes, deleteNote } from "../../../api/notes";
import Swal from "sweetalert2";
import { toast, Toaster } from "react-hot-toast";
import { motion } from "framer-motion";

// Reference for eslint when using <motion.*>
const __MOTION_REF__ = motion;

export default function NotesList() {
  const { auth } = useAuth();
  const token = auth?.token;
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchNotes(token, q ? { q } : {});
      setNotes(res.data || []);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to load notes");
    } finally {
      setLoading(false);
    }
  }, [token, q]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (id) => {
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
      await deleteNote(token, id);
      toast.success("Note deleted");
      load();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Delete failed");
    }
  };

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
              Notes
            </h1>
            <p className="text-gray-500 text-sm">
              Manage your notes with links to shops/bills
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <input
            className="border p-2 rounded"
            placeholder="Search..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button
            onClick={() => navigate("/admin/notes/new")}
            className="px-4 py-2 rounded-xl bg-yellow-600 text-white hover:bg-yellow-700 shadow"
          >
            + Add Note
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-yellow-200">
        {loading ? (
          <p>Loading...</p>
        ) : notes.length === 0 ? (
          <p>No notes found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-yellow-50 text-yellow-800">
                <th className="text-left px-4 py-2">Date</th>
                <th className="text-left px-4 py-2">Title</th>
                <th className="text-left px-4 py-2">Content</th>
                <th className="text-left px-4 py-2">Shop</th>
                <th className="text-left px-4 py-2">Bill</th>
                <th className="text-left px-4 py-2">Tags</th>
                <th className="text-left px-4 py-2">Priority</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {notes.map((n) => (
                <tr
                  key={n._id}
                  className="border-t border-yellow-100 hover:bg-yellow-50/40"
                >
                  <td className="px-4 py-2">
                    {new Date(n.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2">
                    <Link
                      to={`/admin/notes/${n._id}/detail`}
                      className="text-yellow-700 font-medium hover:underline"
                    >
                      {n.title || "(untitled)"}
                    </Link>
                  </td>
                  <td className="px-4 py-2 max-w-lg truncate" title={n.content}>
                    {n.content}
                  </td>
                  <td className="px-4 py-2">{n.shop?.name || "-"}</td>
                  <td className="px-4 py-2">
                    {n.bill ? `#${n.bill.number}` : "-"}
                  </td>
                  <td className="px-4 py-2">
                    {(n.tags || []).length === 0 ? (
                      <span className="text-gray-400">-</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {(n.tags || []).map((t, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 text-xs"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={
                        `px-2 py-0.5 rounded-full text-xs ` +
                        (n.priority === "High"
                          ? "bg-red-100 text-red-700"
                          : n.priority === "Medium"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-emerald-100 text-emerald-700")
                      }
                    >
                      {n.priority || "Low"}
                    </span>
                  </td>
                  <td className="px-4 py-2 space-x-2 text-right whitespace-nowrap">
                    <button
                      onClick={() => navigate(`/admin/notes/${n._id}/detail`)}
                      className="px-3 py-1 rounded-xl bg-yellow-600 text-white hover:bg-yellow-700 text-xs shadow inline-flex items-center gap-1"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-4 h-4"
                      >
                        <path d="M12 5c-7.633 0-11 7-11 7s3.367 7 11 7 11-7 11-7-3.367-7-11-7Zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10Z" />
                        <path d="M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
                      </svg>
                      View
                    </button>
                    <button
                      onClick={() => navigate(`/admin/notes/edit/${n._id}`)}
                      className="px-3 py-1 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs shadow inline-flex items-center gap-1 border border-gray-200"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-4 h-4"
                      >
                        <path d="M16.862 3.487a2.5 2.5 0 1 1 3.536 3.536l-11.07 11.07a4 4 0 0 1-1.592.966l-3.236.97a.75.75 0 0 1-.93-.93l.97-3.236a4 4 0 0 1 .966-1.592l11.07-11.07Z" />
                        <path d="M5.5 19h13a1.5 1.5 0 0 1 0 3h-13a1.5 1.5 0 0 1 0-3Z" />
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(n._id)}
                      className="px-3 py-1 rounded-xl bg-red-500 text-white hover:bg-red-600 text-xs shadow inline-flex items-center gap-1"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="w-4 h-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673A2.25 2.25 0 0 1 15.917 21.75H8.083A2.25 2.25 0 0 1 5.84 19.673L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0A48.11 48.11 0 0 1 8.28 5.25m4.477 0c1.518 0 3.014.052 4.477.153M4.772 5.79L4.5 9m0 0h15m-15 0h15"
                        />
                      </svg>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </motion.div>
  );
}
