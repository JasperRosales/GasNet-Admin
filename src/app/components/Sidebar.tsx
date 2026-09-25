import { Bell, Home, BarChart3, Database, Settings, X } from "lucide-react";
import { useState } from "react";
import { NavLink, useNavigate } from "react-router";
import { useAuth } from "../utils/auth";

export function Sidebar() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [logoutError, setLogoutError] = useState("");
  const [inboxOpen, setInboxOpen] = useState(false);
  const [unread, setUnread] = useState(true);
  const playNotificationSound = () => {
    try {
      const context = new AudioContext();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(740, context.currentTime);
      gain.gain.setValueAtTime(0.0001, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.12, context.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.28);
      oscillator.connect(gain); gain.connect(context.destination);
      oscillator.start(); oscillator.stop(context.currentTime + 0.3);
    } catch { /* Audio is optional and may be blocked by the browser. */ }
  };
  
  const navItems = [
    { icon: Home, label: "Home", path: "/admin-home" },
    { icon: BarChart3, label: "Analytics", path: "/admin-home/analytics" },
    { icon: Database, label: "Distribution", path: "/admin-home/data" },
    { icon: Settings, label: "Settings", path: "/admin-home/settings" },
  ];

  const handleLogout = async () => {
    setLogoutError("");
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      setLogoutError(
        error instanceof Error ? error.message : "Unable to sign out.",
      );
    }
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
        <div className="relative">
          {inboxOpen && <div className="absolute bottom-16 left-0 w-72 rounded-2xl bg-[#FFFDF1] p-4 text-[#1B211A]" style={{ boxShadow: "0 12px 32px rgba(0,0,0,.35)" }}>
            <div className="flex items-center justify-between mb-3"><h3 className="font-semibold">Notifications</h3><button onClick={() => setInboxOpen(false)} aria-label="Close notifications"><X className="h-4 w-4 text-[#628141]" /></button></div>
            <div className="min-h-24 rounded-xl bg-[#EBD5AB]/15 p-4 text-center text-sm text-[#628141]">No notifications yet.</div>
          </div>}
          <button onClick={() => { playNotificationSound(); setInboxOpen((open) => !open); setUnread(false); }} className="relative flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-[#EBD5AB] transition hover:bg-[#628141]/20" style={{ boxShadow: "inset 0 2px 8px rgba(0,0,0,.2)" }} aria-label="Open notification inbox"><Bell className="h-5 w-5" /><span className="text-sm">Notifications</span>{unread && <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-[#EBD5AB] px-1 text-xs font-bold text-[#1B211A]">1</span>}</button>
        </div>
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
