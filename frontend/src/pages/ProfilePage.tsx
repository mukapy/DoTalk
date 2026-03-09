import { Edit3, UserPlus, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const displayName = user?.username || user?.first_name || user?.email?.split("@")[0] || "User";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Profile header */}
      <div className="bg-surface-900 border border-surface-700 rounded-2xl overflow-hidden">
        {/* Banner */}
        {user?.banner ? (
          <img
            src={user.banner}
            alt="Profile banner"
            className="w-full h-32 object-cover"
          />
        ) : (
          <div className="h-32 bg-gradient-to-r from-primary-600 to-accent" />
        )}

        <div className="px-6 pb-6">
          {/* Avatar + actions */}
          <div className="flex items-end justify-between -mt-12">
            <div className="w-24 h-24 rounded-full bg-primary-700 border-4 border-surface-900 flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
              {user?.profile_img ? (
                <img
                  src={user.profile_img}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                initial
              )}
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => navigate("/profile/edit")}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-800 hover:bg-surface-700 text-surface-200 text-sm rounded-lg transition-colors cursor-pointer border border-surface-600"
              >
                <Edit3 size={14} />
                Edit Profile
              </button>
              <button
                onClick={() => navigate("/settings")}
                className="p-1.5 bg-surface-800 hover:bg-surface-700 text-surface-400 rounded-lg transition-colors cursor-pointer border border-surface-600"
              >
                <Settings size={16} />
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="mt-4">
            <h1 className="text-xl font-bold text-surface-100">
              {displayName}
            </h1>
            {user?.username && (
              <p className="text-surface-400 text-sm">@{user.username}</p>
            )}
            {(user?.first_name || user?.last_name) && (
              <p className="text-surface-300 text-sm mt-1">
                {user.first_name} {user.last_name}
              </p>
            )}
            <p className="text-surface-500 text-sm mt-1">
              {user?.email}
            </p>
            {user?.bio && (
              <p className="text-surface-300 text-sm mt-2">{user.bio}</p>
            )}
          </div>

          {/* Stats */}
          <div className="flex gap-6 mt-4">
            {user?.rating !== undefined && (
              <div>
                <span className="text-surface-100 font-semibold">{user.rating}</span>
                <span className="text-surface-500 text-sm ml-1">rating</span>
              </div>
            )}
          </div>

          {/* Birth date */}
          {user?.birth_date && (
            <div className="mt-4">
              <span className="text-surface-500 text-sm">
                Born: {new Date(user.birth_date).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Invite section */}
      <div className="bg-surface-900 border border-surface-700 rounded-xl p-6">
        <div className="flex items-center gap-3">
          <UserPlus size={20} className="text-primary-400" />
          <div>
            <h3 className="text-surface-100 font-medium">Invite Friends</h3>
            <p className="text-surface-500 text-sm">
              Invite others to join DoTalk and start chatting
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
