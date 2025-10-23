import React from "react";
import { useAuth } from "../../context/AuthContext";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

const Topbar = () => {
  const { auth, logout } = useAuth();
  const adminName = auth?.name || "Admin";

  const handleLogout = () => {
    MySwal.fire({
      title: "Are you sure?",
      text: "Do you want to logout?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#9ca3af",
      confirmButtonText: "Yes, Logout",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        MySwal.fire({
          title: "Logged Out!",
          text: "You have been logged out successfully.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  };

  return (
    <div className="hidden lg:flex justify-between items-center bg-gradient-to-r from-blue-700 to-slate-600 shadow-md px-6 py-3 text-white sticky top-0 z-40">
      <h2 className="text-xl font-semibold">Welcome, {adminName}</h2>
      <button
        onClick={handleLogout}
        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 shadow-md transition-all duration-200 active:scale-95"
      >
        Logout
      </button>
    </div>
  );
};

export default Topbar;
