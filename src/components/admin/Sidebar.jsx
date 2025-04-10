import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, Boxes } from "lucide-react";

const navItems = [
  { name: "Dashboard", path: "/admin/dashboard", icon: <LayoutDashboard size={18} /> },
  { name: "Users", path: "/admin/users", icon: <Users size={18} /> },
  { name: "Products", path: "/admin/products", icon: <Boxes size={18} /> }
];

export default function Sidebar() {
  return (
    <aside className="w-60 bg-white border-r h-full shadow-sm">
      <div className="p-6 font-bold text-xl text-blue-700">
        Admin Panel
      </div>
      <nav className="flex flex-col px-4 gap-2">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md font-medium transition 
               ${isActive ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-100"}`
            }
          >
            {item.icon}
            {item.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
