import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ShopAuthProvider } from "./context/ShopAuthContext";
import AdminLogin from "./pages/Admin/Profile/AdminLogin";
import AdminDashboard from "./pages/Admin/Dashboard/AdminDashboard";
import MasterItemsPage from "./pages/Admin/Dashboard/MasterItemsPage";

import AdminProfile from "./pages/Admin/Profile/AdminProfile";
import AdminLayout from "./layout/AdminLayout";
import ForgotPassword from "./pages/Admin/Profile/ForgotPassword";
import ResetPassword from "./pages/Admin/Profile/ResetPassword";

import SuppliersPage from "./pages/Admin/Supplier/SuppliersPage";
import SupplierDetail from "./pages/Admin/Supplier/SupplierDetail";
import InvoicePage from "./pages/Admin/Supplier/InvoicePage";
import InvoicePaymentsPage from "./pages/Admin/Supplier/InvoicePaymentsPage";
import ItemsPage from "./pages/Admin/Items/ItemsPage";
import ItemDetail from "./pages/Admin/Items/ItemDetail";
import ItemForm from "./pages/Admin/Items/ItemForm";

import OfferPage from "./pages/Admin/Offers/OffersPage";
import OfferForm from "./pages/Admin/Offers/OfferForm";
import OfferDetail from "./pages/Admin/Offers/OfferDetail";

import ShopsPage from "./pages/Admin/shop/ShopsPage";
import ShopDetail from "./pages/Admin/shop/ShopDetail";
import BillPage from "./pages/Admin/shop/BillPage";
import BillPaymentsPage from "./pages/Admin/shop/BillPaymentsPage";

import RepairsPage from "./pages/Admin/Repair/RepairsPage";
import RepairForm from "./pages//Admin/Repair/RepairForm";
import RepairDetail from "./pages/Admin/Repair/RepairDetail";

import DailyStockList from "./pages/Admin/DailyStocks/DailyStockList";
import DailyStockForm from "./pages/Admin/DailyStocks/DailyStockForm";
import AdminDailyStockDetail from "./pages/Admin/DailyStocks/AdminDailyStockDetail";
import CriticalCasesPage from "./pages/Admin/CriticalCases/CriticalCasesPage";
import AdminCriticalCaseDetail from "./pages/Admin/CriticalCases/AdminCriticalCaseDetail";
import ExpensesList from "./pages/Admin/Expenses/ExpensesList";
import ExpensesForm from "./pages/Admin/Expenses/ExpensesForm";
import AdminExpenseDetail from "./pages/Admin/Expenses/AdminExpenseDetail";
import IncomesList from "./pages/Admin/AdditionalIncome/IncomesList";
import IncomesForm from "./pages/Admin/AdditionalIncome/IncomesForm";
import AdminIncomeDetail from "./pages/Admin/AdditionalIncome/AdminIncomeDetail";
import NotesList from "./pages/Admin/Notes/NotesList";
import NoteForm from "./pages/Admin/Notes/NoteForm";
import AdminNoteDetail from "./pages/Admin/Notes/AdminNoteDetail";
import StockPage from "./pages/Admin/Stock/StockPage";
import ReportsPage from "./pages/Admin/Reports/ReportsPage";

import ShopLogin from "./pages/ShopOwner/Profile/ShopLogin";
import ShopForgotPassword from "./pages/ShopOwner/Profile/ShopForgotPassword";
import ShopResetPassword from "./pages/ShopOwner/Profile/ShopResetPassword";
import ShopProfile from "./pages/ShopOwner/Profile/ShopProfile";
import ShopLayout from "./layout/ShopLayout";
import ShopItems from "./pages/ShopOwner/Items/ShopItems";
import ShopOffers from "./pages/ShopOwner/Offers/ShopOffers";
import ShopRepairs from "./pages/ShopOwner/Warranties/ShopRepairs";
import ShopRepairForm from "./pages/ShopOwner/Warranties/ShopRepairForm";
import ShopRepairDetail from "./pages/ShopOwner/Warranties/ShopRepairDetail";

import AdminTickets from "./pages/Admin/Ticket/AdminTickets";
import AdminTicketForm from "./pages/Admin/Ticket/AdminTicketForm";
import AdminTicketDetail from "./pages/Admin/Ticket/AdminTicketDetail";

import ShopTickets from "./pages/ShopOwner/Ticket/ShopTickets";
import ShopTicketForm from "./pages/ShopOwner/Ticket/ShopTicketForm";

import AdminWarnings from "./pages/Admin/Warnings/AdminWarnings";
import AdminWarningForm from "./pages/Admin/Warnings/AdminWarningForm";

import ShopWarnings from "./pages/ShopOwner/Warnings/ShopWarnings";

import AdminWarningDetail from "./pages/Admin/Warnings/AdminWarningDetail";

import AdminOrders from "./pages/Admin/Order/AdminOrders";
import AdminOrderForm from "./pages/Admin/Order/AdminOrderForm";
import AdminOrderDetail from "./pages/Admin/Order/AdminOrderDetail";

import ShopItemDetail from "./pages/ShopOwner/Items/ShopItemDetail";
import ShopOfferDetail from "./pages/ShopOwner/Offers/ShopOfferDetail";
import ShopOrders from "./pages/ShopOwner/Order/ShopOrders";
import ShopDashboard from "./pages/ShopOwner/Profile/ShopDashboard";
import ShopBills from "./pages/ShopOwner/Bill/ShopBills";
import ShopBillDetail from "./pages/ShopOwner/Bill/ShopBillDetail";

/** 🔒 Protected route wrapper */
const ProtectedRoute = ({ children }) => {
  const { auth } = useAuth();
  return auth?.token ? children : <Navigate to="/admin/login" replace />;
};

/** 🚀 Main App */
function App() {
  return (
    <AuthProvider>
      <ShopAuthProvider>
        <Router>
          <Routes>
            {/* ---------- Public Routes ---------- */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/forgot-password" element={<ForgotPassword />} />
            <Route path="/admin/reset-password" element={<ResetPassword />} />

            {/* ---------- Protected Admin Routes ---------- */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              {/* Default redirect when visiting /admin */}
              <Route index element={<Navigate to="dashboard" replace />} />

              {/* Admin pages */}
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="profile" element={<AdminProfile />} />

              <Route path="suppliers" element={<SuppliersPage />} />
              <Route path="items" element={<ItemsPage />} />
              <Route path="items/new" element={<ItemForm />} />
              <Route path="items/:itemId" element={<ItemDetail />} />
              <Route path="items/:itemId/edit" element={<ItemForm />} />
              <Route path="master-items" element={<MasterItemsPage />} />
              {/* Offers (keep legacy '/admin/offer' route for compatibility) */}
              <Route path="offer" element={<OfferPage />} />
              <Route path="offers" element={<OfferPage />} />
              <Route path="offers/new" element={<OfferForm />} />
              <Route path="offers/:offerId" element={<OfferForm />} />
              <Route path="offers/:offerId/detail" element={<OfferDetail />} />

              <Route path="repairs" element={<RepairsPage />} />
              <Route path="repairs/add" element={<RepairForm />} />
              <Route path="repairs/edit/:repairId" element={<RepairForm />} />
              <Route path="repairs/:repairId" element={<RepairDetail />} />

              <Route
                path="suppliers/:supplierId"
                element={<SupplierDetail />}
              />
              <Route
                path="suppliers/:supplierId/invoices/:invoiceId"
                element={<InvoicePage />}
              />
              <Route
                path="suppliers/:supplierId/invoices/:invoiceId/payments"
                element={<InvoicePaymentsPage />}
              />

              {/* New Shops / Bills routes */}
              <Route path="shops" element={<ShopsPage />} />
              <Route path="shops/:shopId" element={<ShopDetail />} />
              <Route
                path="shops/:shopId/bills/:billId"
                element={<BillPage />}
              />
              <Route
                path="shops/:shopId/bills/:billId/payments"
                element={<BillPaymentsPage />}
              />

              <Route path="/admin/dailystocks" element={<DailyStockList />} />
              <Route
                path="/admin/dailystocks/new"
                element={<DailyStockForm />}
              />
              <Route
                path="/admin/dailystocks/edit/:stockId"
                element={<DailyStockForm />}
              />
              <Route
                path="/admin/dailystocks/:stockId/detail"
                element={<AdminDailyStockDetail />}
              />

              <Route
                path="/admin/criticalcases"
                element={<CriticalCasesPage />}
              />
              <Route
                path="/admin/criticalcases/:caseId/detail"
                element={<AdminCriticalCaseDetail />}
              />

              <Route path="/admin/expenses" element={<ExpensesList />} />
              <Route path="/admin/expenses/new" element={<ExpensesForm />} />
              <Route
                path="/admin/expenses/edit/:expenseId"
                element={<ExpensesForm />}
              />
              <Route
                path="/admin/expenses/:expenseId/detail"
                element={<AdminExpenseDetail />}
              />

              <Route path="/admin/incomes" element={<IncomesList />} />
              <Route path="/admin/incomes/new" element={<IncomesForm />} />
              <Route
                path="/admin/incomes/edit/:incomeId"
                element={<IncomesForm />}
              />
              <Route
                path="/admin/incomes/:incomeId/detail"
                element={<AdminIncomeDetail />}
              />

              <Route path="/admin/notes" element={<NotesList />} />
              <Route path="/admin/notes/new" element={<NoteForm />} />
              <Route path="/admin/notes/edit/:noteId" element={<NoteForm />} />
              <Route
                path="/admin/notes/:noteId/detail"
                element={<AdminNoteDetail />}
              />

              <Route path="/admin/stock" element={<StockPage />} />
              <Route path="/admin/reports" element={<ReportsPage />} />
              <Route path="/admin/tickets" element={<AdminTickets />} />
              <Route path="/admin/tickets/new" element={<AdminTicketForm />} />
              <Route
                path="/admin/tickets/:ticketId"
                element={<AdminTicketForm />}
              />
              <Route
                path="/admin/tickets/:ticketId/detail"
                element={<AdminTicketDetail />}
              />
              <Route path="/admin/warnings" element={<AdminWarnings />} />
              <Route
                path="/admin/warnings/new"
                element={<AdminWarningForm />}
              />
              <Route
                path="/admin/warnings/:warningId"
                element={<AdminWarningForm />}
              />
              <Route
                path="/admin/warnings/:warningId/detail"
                element={<AdminWarningDetail />}
              />
              <Route path="/admin/orders" element={<AdminOrders />} />
              <Route path="/admin/orders/new" element={<AdminOrderForm />} />
              <Route
                path="/admin/orders/:orderId"
                element={<AdminOrderForm />}
              />
              <Route
                path="/admin/orders/:orderId/detail"
                element={<AdminOrderDetail />}
              />
            </Route>

            {/* Shop portal */}
            <Route path="/shop/login" element={<ShopLogin />} />
            <Route
              path="/shop/forgot-password"
              element={<ShopForgotPassword />}
            />
            <Route
              path="/shop/reset-password"
              element={<ShopResetPassword />}
            />
            <Route path="/shop" element={<ShopLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<ShopDashboard />} />
              <Route path="items" element={<ShopItems />} />
              <Route path="items/:id" element={<ShopItemDetail />} />
              <Route path="offers" element={<ShopOffers />} />
              <Route path="offers/:id" element={<ShopOfferDetail />} />
              <Route path="bills" element={<ShopBills />} />
              <Route path="bills/:billId" element={<ShopBillDetail />} />
              <Route path="orders" element={<ShopOrders />} />
              <Route path="warnings" element={<ShopWarnings />} />
              <Route path="tickets" element={<ShopTickets />} />
              <Route path="tickets/new" element={<ShopTicketForm />} />
              <Route path="repairs" element={<ShopRepairs />} />
              <Route path="repairs/new" element={<ShopRepairForm />} />
              <Route path="repairs/:id" element={<ShopRepairDetail />} />
              <Route path="profile" element={<ShopProfile />} />
            </Route>

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/shop/login" replace />} />
          </Routes>
        </Router>
      </ShopAuthProvider>
    </AuthProvider>
  );
}

export default App;
