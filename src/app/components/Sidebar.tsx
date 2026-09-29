import { Bell, Home, BarChart3, Database, Settings, X } from "lucide-react";
import { useEffect, useState } from "react";
import { appService, type NotificationDTO } from "../services/appService";
import { NavLink, useNavigate } from "react-router";
import { useAuth } from "../utils/auth";

export function Sidebar() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [logoutError, setLogoutError] = useState("");
  const [inboxOpen, setInboxOpen] = useState(false);
  const [unread, setUnread] = useState(false);
  const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
  const [selectedNotifications, setSelectedNotifications] = useState<number[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<NotificationDTO | null>(null);
  const [notificationPage, setNotificationPage] = useState(1);
  const [windowPosition, setWindowPosition] = useState({ x: 0, y: 0 });
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
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.3);
    } catch {
      /* Audio is optional and may be blocked by the browser. */
    }
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
      setLogoutError(error instanceof Error ? error.message : "Unable to sign out.");
    }
  };

  useEffect(() => {
    void appService.notifications
      .list()
      .then((rows) => {
        setNotifications(rows);
        setUnread(rows.some((item) => !item.isRead));
      })
      .catch(() => {
        setNotifications([]);
        setUnread(false);
      });
  }, [inboxOpen]);
  const toggleNotification = (id: number) =>
    setSelectedNotifications((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  const deleteSelected = async () => {
    if (!selectedNotifications.length) return;
    await appService.notifications.delete(selectedNotifications);
    setNotifications((current) =>
      current.filter((item) => !selectedNotifications.includes(item.id))
    );
    setSelectedNotifications([]);
  };

  const setNotificationsRead = async (isRead: boolean) => {
    if (!selectedNotifications.length) return;
    await appService.notifications.markRead(selectedNotifications, isRead);
    setNotifications((current) =>
      current.map((item) => (selectedNotifications.includes(item.id) ? { ...item, isRead } : item))
    );
    setSelectedNotifications([]);
  };
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(notifications.length / pageSize));
  const visibleNotifications = notifications.slice(
    (notificationPage - 1) * pageSize,
    notificationPage * pageSize
  );

  return (
    <aside className="w-64 h-full shrink-0 bg-[#1B211A] p-6 flex flex-col overflow-y-auto">
      {/* Logo/Header */}
      <div className="mb-8">
        <div
          className="p-6 rounded-3xl"
          style={{
            background: "linear-gradient(135deg, #628141 0%, #8BAE66 100%)",
            boxShadow:
              "0 8px 32px rgba(98, 129, 65, 0.3), inset 0 2px 8px rgba(255, 255, 255, 0.2), inset 0 -2px 8px rgba(0, 0, 0, 0.1)",
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
                    boxShadow:
                      "0 6px 24px rgba(98, 129, 65, 0.4), inset 0 2px 6px rgba(255, 255, 255, 0.2), inset 0 -2px 6px rgba(0, 0, 0, 0.15)",
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
          {inboxOpen && (
            <div
              className="fixed inset-0 z-50 bg-[#1B211A]/50 p-4"
              onClick={() => setInboxOpen(false)}
            >
              <div
                className="absolute left-1/2 top-1/2 flex h-[min(680px,calc(100vh-2rem))] w-[min(680px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 flex-col rounded-3xl bg-[#FFFDF1] p-6 text-[#1B211A]"
                onClick={(event) => event.stopPropagation()}
                style={{ boxShadow: "0 20px 60px rgba(0,0,0,.4)" }}
              >
                <div className="mb-5 flex items-center justify-between">
                  <h3 className="text-xl font-semibold">Notifications</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setInboxOpen(false)}
                      aria-label="Close notifications"
                      className="rounded-xl bg-gradient-to-r from-[#628141] to-[#8BAE66] px-3 py-2 text-[#FFFDF1]"
                      style={{
                        boxShadow:
                          "0 4px 12px rgba(98,129,65,.3), inset 0 2px 6px rgba(255,255,255,.2)",
                      }}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="mb-3 flex items-center justify-between text-sm text-[#628141]">
                  <span>Notifications</span>
                </div>
                <div className="flex-1 min-h-0 overflow-auto rounded-2xl border border-[#EBD5AB]/50">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-[#628141] to-[#8BAE66]">
                      <tr>
                        <th className="w-12 px-5 py-3" />
                        <th className="px-5 py-3 text-left text-[#FFFDF1]">Message</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleNotifications.length ? (
                        visibleNotifications.map((item) => (
                          <tr key={item.id} className="border-b border-[#EBD5AB]/40">
                            <td className="px-5 py-3">
                              <input
                                type="checkbox"
                                checked={selectedNotifications.includes(item.id)}
                                onChange={() => toggleNotification(item.id)}
                              />
                            </td>
                            <td className="px-5 py-3">
                              <button
                                onClick={() => {
                                  setSelectedMessage(item);
                                  void appService.notifications.markRead([item.id], true);
                                  setNotifications((current) =>
                                    current.map((row) =>
                                      row.id === item.id ? { ...row, isRead: true } : row
                                    )
                                  );
                                  setUnread(false);
                                }}
                                className="block max-w-md truncate text-left font-medium hover:text-[#628141]"
                                title={item.message}
                              >
                                {item.message}
                              </button>
                            </td>
                            <td className="px-5 py-3 text-sm">{item.isRead ? "Read" : "Unread"}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="px-5 py-10 text-center text-sm text-[#628141]">
                            No notifications yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-[#628141]">
                    {notificationPage} / {totalPages}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setSelectedNotifications(
                          selectedNotifications.length === notifications.length
                            ? []
                            : notifications.map((item) => item.id)
                        )
                      }
                      disabled={!notifications.length}
                      className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-[#628141] disabled:cursor-not-allowed disabled:opacity-40"
                      style={{
                        boxShadow:
                          "0 4px 12px rgba(98,129,65,.18), inset 0 2px 6px rgba(255,255,255,.8)",
                      }}
                    >
                      {selectedNotifications.length === notifications.length && notifications.length
                        ? "Unselect all"
                        : "Select all"}
                    </button>
                    <button
                      onClick={() => setNotificationPage((page) => Math.max(1, page - 1))}
                      disabled={notificationPage === 1}
                      className="rounded-lg border border-[#628141]/30 px-3 py-1.5 text-xs text-[#628141] disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setNotificationPage((page) => Math.min(totalPages, page + 1))}
                      disabled={notificationPage === totalPages}
                      className="rounded-lg border border-[#628141]/30 px-3 py-1.5 text-xs text-[#628141] disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <button
                    onClick={() => void setNotificationsRead(true)}
                    disabled={!selectedNotifications.length}
                    className="rounded-xl bg-gradient-to-r from-[#628141] to-[#8BAE66] px-4 py-2 text-xs font-semibold text-[#FFFDF1] disabled:cursor-not-allowed disabled:opacity-40"
                    style={{
                      boxShadow:
                        "0 4px 12px rgba(98,129,65,.3), inset 0 2px 6px rgba(255,255,255,.2)",
                    }}
                  >
                    Read
                  </button>
                  <button
                    onClick={() => void setNotificationsRead(false)}
                    disabled={!selectedNotifications.length}
                    className="rounded-xl bg-gradient-to-r from-[#628141] to-[#8BAE66] px-4 py-2 text-xs font-semibold text-[#FFFDF1] disabled:cursor-not-allowed disabled:opacity-40"
                    style={{
                      boxShadow:
                        "0 4px 12px rgba(98,129,65,.3), inset 0 2px 6px rgba(255,255,255,.2)",
                    }}
                  >
                    Unread
                  </button>
                  <button
                    onClick={() => void deleteSelected()}
                    disabled={!selectedNotifications.length}
                    className="rounded-xl bg-gradient-to-r from-[#628141] to-[#8BAE66] px-4 py-2 text-xs font-semibold text-[#FFFDF1] disabled:cursor-not-allowed disabled:opacity-40"
                    style={{
                      boxShadow:
                        "0 4px 12px rgba(98,129,65,.3), inset 0 2px 6px rgba(255,255,255,.2)",
                    }}
                  >
                    Delete
                  </button>
                </div>
                {selectedMessage && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center rounded-3xl bg-[#1B211A]/30 p-6">
                    <div
                      className="w-full rounded-2xl bg-white p-5"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <h4 className="font-semibold">{selectedMessage.title}</h4>
                        <button onClick={() => setSelectedMessage(null)} aria-label="Close message">
                          <X className="h-4 w-4 text-[#628141]" />
                        </button>
                      </div>
                      <p className="whitespace-pre-wrap text-sm text-[#1B211A]">
                        {selectedMessage.message}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          <button
            onClick={() => {
              playNotificationSound();
              setWindowPosition({ x: 0, y: 0 });
              setInboxOpen((open) => !open);
              setUnread(false);
            }}
            className="relative flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-[#EBD5AB] transition hover:bg-[#628141]/20"
            style={{ boxShadow: "inset 0 2px 8px rgba(0,0,0,.2)" }}
            aria-label="Open notification inbox"
          >
            <Bell className="h-5 w-5" />
            <span className="text-sm">Notifications</span>
            {unread && (
              <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-[#EBD5AB] px-1 text-xs font-bold text-[#1B211A]">
                1
              </span>
            )}
          </button>
        </div>
        {logoutError && <p className="text-xs text-red-200">{logoutError}</p>}
        <button
          onClick={handleLogout}
          className="w-full p-4 rounded-2xl bg-[#628141]/10 hover:bg-[#628141]/20 transition-colors cursor-pointer"
          style={{
            boxShadow: "inset 0 2px 8px rgba(0, 0, 0, 0.2)",
          }}
        >
          <p className="text-[#8BAE66] text-sm">Want a break?</p>
          <p className="text-[#EBD5AB] text-xs mt-1 underline underline-offset-4">
            Click here to logout!
          </p>
        </button>
      </div>
    </aside>
  );
}
