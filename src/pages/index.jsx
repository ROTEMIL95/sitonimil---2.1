import Layout from "./Layout.jsx";

import Home from "./Home";
import Products from "./Products.jsx";
import Product from "./Product";
import SupplierDashboard from "./SupplierDashboard";
import UploadProduct from "./UploadProduct";
import Supplier from "./Supplier";
import Suppliers from "./Suppliers";
import Auth from "./Auth";
import Messages from "./Messages";
import Profile from "./Profile";
import MyProducts from "./MyProducts";
import Help from "./Help";
import Privacy from "./Privacy";
import Terms from "./Terms";
import AccessibilityStatement from "./AccessibilityStatement";

import AdminLayout from "./admin/AdminLayout";
import AdminDashboard from "./admin/Dashboard";
import Users from "./admin/Users";
import AdminProducts from "./admin/AdminProducts";
import EditUser from "./admin/EditUser";
import EditProduct from "./admin/EditProduct";
import Categories from "./admin/Categories";

import ScrollToTop from "@/components/ScrollToTop";
import NotFound from "@/components/NotFound";

import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
  Navigate,
} from "react-router-dom";

// קביעת עמוד נוכחי (לשימוש ב־Layout)
function _getCurrentPage(url) {
  if (url.endsWith("/")) url = url.slice(0, -1);
  let urlLastPart = url.split("/").pop();
  if (urlLastPart.includes("?")) {
    urlLastPart = urlLastPart.split("?")[0];
  }
  return urlLastPart;
}

function PagesContent() {
  const location = useLocation();
  const currentPage = _getCurrentPage(location.pathname);

  return (
    <Layout currentPageName={currentPage}>
      <ScrollToTop />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/Home" element={<Navigate to="/" />} />
        <Route path="/Products" element={<Products />} />
        <Route path="/Product" element={<Product />} />
        <Route path="/Dashboard" element={<SupplierDashboard />} />
        <Route path="/UploadProduct" element={<UploadProduct />} />
        <Route path="/Supplier" element={<Supplier />} />
        <Route path="/Suppliers" element={<Suppliers />} />
        <Route path="/Auth" element={<Auth />} />
        <Route path="/Messages" element={<Messages />} />
        <Route path="/Profile" element={<Profile />} />
        <Route path="/MyProducts" element={<MyProducts />} />
        <Route path="/Help" element={<Help />} />
        <Route path="/Privacy" element={<Privacy />} />
        <Route path="/Terms" element={<Terms />} />
        <Route path="/AccessibilityStatement" element={<AccessibilityStatement />} />
        <Route path="/AdminDashboard" element={<Navigate to="/admin/dashboard" />} />

        {/* Admin Routes - עטופים ב־AdminLayout */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="users/edit/:id" element={<EditUser />} />
          <Route path="AdminProducts" element={<AdminProducts />} />
          <Route path="AdminProducts/edit/:id" element={<EditProduct />} />
          <Route path="categories" element={<Categories />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}

export default function Pages() {
  return (
    <Router>
      <PagesContent />
    </Router>
  );
}
