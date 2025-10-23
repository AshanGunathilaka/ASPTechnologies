import { Link } from "react-router-dom";

export default function CriticalCaseList({ cases, onEdit, onDelete }) {
  if (!cases.length)
    return <p className="text-gray-500 p-3">No critical cases found.</p>;

  const severityBadge = (s) => {
    const m = String(s || "N/A").toLowerCase();
    const styles = {
      critical: { bg: "#FEF2F2", color: "#B91C1C", border: "#FECACA" },
      high: { bg: "#FEF2F2", color: "#B91C1C", border: "#FECACA" },
      medium: { bg: "#FFFBEB", color: "#92400E", border: "#FDE68A" },
      low: { bg: "#ECFDF5", color: "#065F46", border: "#A7F3D0" },
      na: { bg: "#F3F4F6", color: "#374151", border: "#E5E7EB" },
    };
    const t = styles[m] || styles.na;
    return (
      <span
        className="inline-flex px-2 py-1 rounded text-xs border capitalize"
        style={{ backgroundColor: t.bg, color: t.color, borderColor: t.border }}
      >
        {s || "N/A"}
      </span>
    );
  };

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="bg-yellow-50 text-yellow-800">
          <th className="text-left p-3">#</th>
          <th className="text-left p-3">Description</th>
          <th className="text-left p-3">Severity</th>
          <th className="text-left p-3">Shops</th>
          <th className="text-left p-3">Bills</th>
          <th className="p-3 w-40">Actions</th>
        </tr>
      </thead>
      <tbody>
        {cases.map((c, index) => (
          <tr
            key={c._id}
            className="border-t border-yellow-100 hover:bg-yellow-50/50"
          >
            <td className="p-3">{index + 1}</td>
            <td className="p-3">
              <Link
                to={`/admin/criticalcases/${c._id}/detail`}
                className="text-yellow-700 hover:underline font-medium"
              >
                {c.description}
              </Link>
            </td>
            <td className="p-3">{severityBadge(c.severity)}</td>
            <td className="p-3">{c.shops?.length || 0}</td>
            <td className="p-3">{c.bills?.length || 0}</td>
            <td className="p-3 flex gap-2">
              <button
                onClick={() => onEdit(c)}
                className="px-3 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(c._id)}
                className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600 text-xs"
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
