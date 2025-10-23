import React, { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Topbar from "./Topbar";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { name: "Dashboard", path: "/admin/dashboard" },
    { name: "Suppliers", path: "/admin/suppliers" },
    { name: "Shops", path: "/admin/shops" },
    { name: "Repair Items", path: "/admin/repairs" },
    { name: "Items", path: "/admin/items" },
    { name: "Offers", path: "/admin/offer" },
    { name: "Orders", path: "/admin/orders" },
    { name: "Reports", path: "/admin/reports" },
    { name: "Warnings", path: "/admin/warnings" },
    { name: "Tickets", path: "/admin/tickets" },
    { name: "Critical Cases", path: "/admin/criticalcases" },
    { name: "Daily Stocks", path: "/admin/dailystocks" },
    { name: "Expenses", path: "/admin/expenses" },
    { name: "Additional Income", path: "/admin/incomes" },
    { name: "Notes", path: "/admin/notes" },
    { name: "Stock", path: "/admin/stock" },
    { name: "Profile", path: "/admin/profile" },
  ];

  return (
    <div className="flex">
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-screen w-64 bg-gradient-to-b from-slate-600 to-blue-700 text-white shadow-md overflow-y-auto z-50 sidebar-scrollbar-hide
    transform lg:translate-x-0 transition-transform duration-300
    ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0
  `}
      >
        {/* Logo */}
        <div className="p-6 text-2xl font-bold border-b border-gray-300 sticky top-0 bg-gradient-to-b from-slate-600 to-blue-700 text-white z-50">
          ASP Tech
        </div>

        {/* Menu */}

        <nav className="mt-4">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `block py-3 px-6 text-lg rounded-md my-1 transition-all duration-200
         ${
           isActive
             ? "bg-gradient-to-r from-green-400 to-blue-400 font-semibold text-white"
             : "hover:bg-gradient-to-r hover:from-yellow-200 hover:to-yellow-800 text-white"
         }`
              }
              onClick={() => setSidebarOpen(false)}
            >
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Mobile Topbar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-gradient-to-r from-slate-600 to-blue-700 text-white flex items-center justify-between px-4 py-3 z-40 shadow-md">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded hover:bg-yellow-500 transition"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      {/* Main Content */}
      <div className="flex-1 lg:ml-64 min-h-screen bg-gray-50"></div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;
