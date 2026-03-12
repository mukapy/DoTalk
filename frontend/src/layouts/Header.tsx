import { Link } from "react-router-dom";
import { Search, Bell } from "lucide-react";
import { useAuthStore } from "../store/authStore";

/** Returns the best display name from a User object */
function displayName(user: { username?: string; first_name?: string; last_name?: string; email?: string } | null): string {
  if (!user) return "User";
  if (user.username) return user.username;
  if (user.first_name) return user.first_name;
  if (user.email) return user.email.split("@")[0];
  return "User";
}

function displayInitial(user: { username?: string; first_name?: string; email?: string } | null): string {
  if (!user) return "U";
  if (user.username) return user.username.charAt(0).toUpperCase();
  if (user.first_name) return user.first_name.charAt(0).toUpperCase();
  if (user.email) return user.email.charAt(0).toUpperCase();
  return "U";
}

export default function Header() {
  const user = useAuthStore((s) => s.user);

  return (
    <header className="h-16 bg-surface-900 border-b border-surface-700 flex items-center justify-between px-6 sticky top-0 z-10">
      {/* Search */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500"
          />
          <input
            type="text"
            placeholder="Search topics, chats, people..."
            className="w-full pl-10 pr-4 py-2 bg-surface-800 border border-surface-700 rounded-lg text-surface-100 placeholder-surface-500 text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
          />
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-4 ml-4">
        <button className="relative p-2 rounded-lg hover:bg-surface-800 text-surface-400 hover:text-surface-100 transition-colors bg-transparent border-none cursor-pointer">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-primary-500 rounded-full" />
        </button>

        <Link to="/profile" className="flex items-center gap-3 no-underline">
          <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-medium">
            {displayInitial(user)}
          </div>
          <span className="text-sm font-medium text-surface-200 hidden sm:block">
            {displayName(user)}
          </span>
        </Link>
      </div>
    </header>
  );
}
