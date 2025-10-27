import React, { useState } from "react";
import { Outlet, Navigate, NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useShopAuth } from "../hooks/useShopAuth";

const ShopLayout = () => {
  const { auth, logout } = useShopAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!auth?.token) return <Navigate to="/shop/login" replace />;

  const shop = auth?.shop || {};
  const shopName = shop?.name || "Shop";

  // Company brand logo for sidebar only
  const companyLogo = "/Logo.svg";

  // Logged-in shop's logo for topbars
  const shopLogoSrc =
    (shop?.logo && (shop.logo.url || shop.logo.secure_url)) ||
    shop?.logoUrl ||
    shop?.image ||
    null;

  const menuItems = [
    { name: "Dashboard", path: "/shop/dashboard" },
    { name: "Items", path: "/shop/items" },
    { name: "Offers", path: "/shop/offers" },
    { name: "Bills", path: "/shop/bills" },
    { name: "Orders", path: "/shop/orders" },
    { name: "Warnings", path: "/shop/warnings" },
    { name: "Tickets", path: "/shop/tickets" },
    { name: "Warranties", path: "/shop/repairs" },
    { name: "Profile", path: "/shop/profile" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-gradient-to-b from-slate-600 to-blue-700 text-white shadow-md overflow-y-auto z-50 sidebar-scrollbar-hide transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* Brand */}
        {/* Brand */}
        <div className="flex flex-col items-center justify-center p-6 border-b border-white/20 bg-gradient-to-b from-slate-600 to-blue-700 sticky top-0 z-50">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-yellow-300 shadow-md flex items-center justify-center bg-black">
            <img
              src={companyLogo}
              alt="Company Logo"
              className="w-full h-full object-cover"
              onError={(e) => (e.currentTarget.src = "/Logo.svg")}
            />
          </div>
          <div className="font-bold text-lg text-white mt-3 text-center">
            ASP Technologies
          </div>
        </div>

        {/* Menu */}
        <nav className="mt-2 pb-20">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `block py-3 px-5 text-base rounded-md mx-2 my-1 transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-green-400 to-blue-400 font-semibold text-white"
                    : "hover:bg-white/10 text-white"
                }`
              }
              onClick={() => setSidebarOpen(false)}
            >
              {item.name}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Mobile Topbar */}
      <div className="lg:hidden fixed top-0 inset-x-0 flex items-center justify-between bg-gradient-to-r from-blue-700 to-slate-600 text-white px-4 py-3 z-40 shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen((s) => !s)}
            className="p-1 rounded hover:bg-white/10 active:scale-95"
            aria-label={sidebarOpen ? "Close menu" : "Open menu"}
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div className="flex items-center gap-2">
            {shopLogoSrc ? (
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden border-2 border-yellow-300 shadow-sm bg-white flex items-center justify-center">
                <img
                  src={shopLogoSrc}
                  alt={`${shopName} Logo`}
                  className="h-16 w-2 rounded-full object-cover border border-yellow-300 shadow-sm"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              </div>
            ) : null}
            <span className="font-semibold text-yellow-200">{shopName}</span>
          </div>
        </div>
        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1.5 rounded-md shadow"
        >
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-64">
        {/* Desktop Topbar */}
        <div className="hidden lg:flex sticky top-0 z-40 items-center justify-between bg-gradient-to-r from-blue-700 to-slate-600 text-white px-6 py-3 shadow-md">
          <div className="flex items-center gap-3">
            {shopLogoSrc ? (
              <img
                src={shopLogoSrc}
                alt={`${shopName} Logo`}
                className="h-12 w-13 rounded-full object-cover border border-yellow-300 shadow-sm"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            ) : null}
            <div className="leading-tight">
              <div className="text-lg font-semibold">{shopName}</div>
              <div className="text-xs opacity-80 truncate">Shop Portal</div>
            </div>
          </div>
          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-md transition-all active:scale-95"
          >
            Logout
          </button>
        </div>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 pt-20 lg:pt-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default ShopLayout;
