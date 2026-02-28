import { NavLink, Link } from "react-router-dom";
import {
  Home,
  Compass,
  MessageCircle,
  User,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { useUIStore } from "../store/uiStore";

const navItems = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/explore", icon: Compass, label: "Explore" },
  { to: "/chats", icon: MessageCircle, label: "Chats" },
  { to: "/profile", icon: User, label: "Profile" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export default function Sidebar() {
  const logout = useAuthStore((s) => s.logout);
  const { sidebarOpen, toggleSidebar } = useUIStore();

  return (
    <aside
      className={`${
        sidebarOpen ? "w-64" : "w-20"
      } h-screen sticky top-0 bg-surface-900 border-r border-surface-700 flex flex-col transition-all duration-300`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-surface-700">
        <Link to="/" className="flex items-center gap-2 no-underline">
          <div className="w-9 h-9 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
            D
          </div>
          {sidebarOpen && (
            <span className="text-lg font-bold text-surface-100">DoTalk</span>
          )}
        </Link>
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg hover:bg-surface-700 text-surface-400 hover:text-surface-100 transition-colors bg-transparent border-none"
        >
          {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors no-underline ${
                isActive
                  ? "bg-primary-600/20 text-primary-400"
                  : "text-surface-400 hover:bg-surface-800 hover:text-surface-100"
              }`
            }
          >
            <Icon size={20} className="shrink-0" />
            {sidebarOpen && <span className="text-sm font-medium">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-surface-700">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-surface-400 hover:bg-red-500/10 hover:text-red-400 transition-colors w-full bg-transparent border-none cursor-pointer"
        >
          <LogOut size={20} className="shrink-0" />
          {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
