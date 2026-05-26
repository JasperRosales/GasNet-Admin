import { Home, BarChart3, Database, Settings } from "lucide-react";
import { useState } from "react";
import { NavLink, useNavigate } from "react-router";
import { supabase } from "../utils/supabase";

export function Sidebar() {
  const navigate = useNavigate();
  const [logoutError, setLogoutError] = useState("");
  
  const navItems = [
    { icon: Home, label: "Home", path: "/admin-home" },
    { icon: BarChart3, label: "Analytics", path: "/admin-home/analytics" },
    { icon: Database, label: "Distribution", path: "/admin-home/data" },
    { icon: Settings, label: "Settings", path: "/admin-home/settings" },
  ];

  const handleLogout = async () => {
    setLogoutError("");
    const { error } = await supabase.auth.signOut();
    if (error) {
      setLogoutError(error.message);
      return;
    }
    navigate("/");
  };

  return (
    <aside className="w-64 h-full bg-[#1B211A] p-6 flex flex-col overflow-y-auto">
      {/* Logo/Header */}
      <div className="mb-8">
        <div 
          className="p-6 rounded-3xl"
          style={{
            background: 'linear-gradient(135deg, #628141 0%, #8BAE66 100%)',
            boxShadow: '0 8px 32px rgba(98, 129, 65, 0.3), inset 0 2px 8px rgba(255, 255, 255, 0.2), inset 0 -2px 8px rgba(0, 0, 0, 0.1)',
          }}
        >
          <h1 className="text-[#FFFDF1] tracking-wider">CJG TRADING</h1>
          <p className="text-[#EBD5AB] text-sm mt-1">Admin Dashboard</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-3">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/admin-home"}
            className={({ isActive }) =>
              `flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${
                isActive
                  ? "bg-gradient-to-r from-[#628141] to-[#8BAE66] text-[#FFFDF1]"
                  : "text-[#EBD5AB] hover:bg-[#628141]/20"
              }`
            }
            style={({ isActive }) =>
              isActive
                ? {
                    boxShadow: '0 6px 24px rgba(98, 129, 65, 0.4), inset 0 2px 6px rgba(255, 255, 255, 0.2), inset 0 -2px 6px rgba(0, 0, 0, 0.15)',
                  }
                : {}
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer Info */}
      <div className="mt-auto pt-6 border-t border-[#628141]/30 space-y-3">
        {logoutError && (
          <p className="text-xs text-red-200">{logoutError}</p>
        )}
        <button 
          onClick={handleLogout}
          className="w-full p-4 rounded-2xl bg-[#628141]/10 hover:bg-[#628141]/20 transition-colors cursor-pointer"
          style={{
            boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.2)',
          }}
        >
          <p className="text-[#8BAE66] text-sm">Want a break?</p>
          <p className="text-[#EBD5AB] text-xs mt-1 underline underline-offset-4">Click here to logout!</p>
        </button>
      </div>
    </aside>
  );
}
