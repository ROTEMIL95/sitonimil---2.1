import Layout from "./Layout.jsx";

import Home from "./Home";

import Search from "./Search";

import Product from "./Product";

import Dashboard from "./Dashboard";

import UploadProduct from "./UploadProduct";

import Supplier from "./Supplier";

import Suppliers from "./Suppliers";

import Auth from "./Auth";

import AdminDashboard from "./AdminDashboard";

import Messages from "./Messages";

import Profile from "./Profile";

import MyProducts from "./MyProducts";

import Help from "./Help";

import Privacy from "./Privacy";

import Terms from "./Terms";

import AccessibilityStatement from "./AccessibilityStatement";

import ScrollToTop from "@/components/ScrollToTop";

import { BrowserRouter as Router, Route, Routes, useLocation , Navigate  } from 'react-router-dom';

const PAGES = {
    
    Home: Home,
    
    Search: Search,
    
    Product: Product,
    
    Dashboard: Dashboard,
    
    UploadProduct: UploadProduct,
    
    Supplier: Supplier,
    
    Suppliers: Suppliers,
    
    Auth: Auth,
    
    AdminDashboard: AdminDashboard,
    
    Messages: Messages,
    
    Profile: Profile,
    
    MyProducts: MyProducts,
    
    Help: Help,
    
    Privacy: Privacy,
    
    Terms: Terms,
    
    AccessibilityStatement: AccessibilityStatement,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <ScrollToTop />
            <Routes>            
                <Route path="/" element={<Home />} />
                <Route path="/Home" element={<Navigate to="/" />} />
                <Route path="/Search" element={<Search />} />
                <Route path="/Product" element={<Product />} />
                <Route path="/Dashboard" element={<Dashboard />} />
                <Route path="/UploadProduct" element={<UploadProduct />} />
                <Route path="/Supplier" element={<Supplier />} />
                <Route path="/Suppliers" element={<Suppliers />} />
                <Route path="/Auth" element={<Auth />} />
                <Route path="/AdminDashboard" element={<AdminDashboard />} />
                <Route path="/Messages" element={<Messages />} />
                <Route path="/Profile" element={<Profile />} />
                <Route path="/MyProducts" element={<MyProducts />} />
                <Route path="/Help" element={<Help />} />
                <Route path="/Privacy" element={<Privacy />} />
                <Route path="/Terms" element={<Terms />} />
                <Route path="/AccessibilityStatement" element={<AccessibilityStatement />} />
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