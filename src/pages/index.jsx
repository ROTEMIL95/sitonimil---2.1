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

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

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
            <Routes>            
                <Route path="/" element={<Home />} />
                <Route path="/Home" element={<Home />} />
                <Route path="/Search" element={<Search />} />
                <Route path="/Product" element={<Product />} />
                <Route path="/Dashboard" element={<Dashboard />} />
                <Route path="/UploadProduct" element={<UploadProduct />} />
                <Route path="/Supplier" element={<Supplier />} />
                <Route path="/Suppliers" element={<Suppliers />} />
                <Route path="/Auth" element={<Auth />} />
                <Route path="/AdminDashboard" element={<AdminDashboard />} />
                <Route path="/Messages" element={<Messages />} />
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