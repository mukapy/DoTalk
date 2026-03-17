import { Edit3, UserPlus, Settings } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useRoomStore } from "../store/roomStore";
import { useEffect, useState } from "react";
import type { Room } from "../types";
import RoomCard from "../components/RoomCard";
import api from "../api/axios";

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [userRooms, setUserRooms] = useState<Room[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(true);

  const displayName = user?.username || user?.first_name || user?.email?.split("@")[0] || "User";
  const initial = displayName.charAt(0).toUpperCase();

  useEffect(() => {
    const loadUserRooms = async () => {
      if (user?.id) {
        setRoomsLoading(true);
        try {
          const allRooms = await api.get<Room[]>("rooms/");
          const filteredRooms = allRooms.data.filter(room => room.creator === user.id);
          setUserRooms(filteredRooms);
        } catch (error) {
          console.error("Failed to fetch user rooms:", error);
        } finally {
          setRoomsLoading(false);
        }
      }
    };
    loadUserRooms();
  }, [user?.id]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Banner */}
      <div className="w-full h-56 md:h-72 rounded-xl overflow-hidden bg-surface-800">
        {user?.banner ? (
          <img
            src={user.banner}
            alt="Profile banner"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-primary-600 to-accent flex items-center justify-center">
            <span className="text-white text-4xl font-bold opacity-50">DoTalk Channel</span>
          </div>
        )}
      </div>

      {/* Profile Info Section */}
      <div className="px-4 md:px-8 pb-4">
        <div className="flex flex-col md:flex-row items-start gap-6">
          {/* Avatar */}
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-surface-950 bg-surface-800 flex-shrink-0 -mt-16 md:-mt-20 overflow-hidden">
            {user?.profile_img ? (
              <img
                src={user.profile_img}
                alt={displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-primary-700 flex items-center justify-center text-white text-5xl font-bold">
                {initial}
              </div>
            )}
          </div>

          {/* Info & Actions */}
          <div className="flex-1 min-w-0 pt-2 w-full">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-surface-100">{displayName}</h1>
                <div className="flex flex-wrap items-center gap-2 text-surface-400 mt-1 text-sm">
                  {user?.username && <span>@{user.username}</span>}
                  <span>•</span>
                  <span>{userRooms.length} rooms</span>
                  {user?.rating !== undefined && (
                    <>
                      <span>•</span>
                      <span>{user.rating} rating</span>
                    </>
                  )}
                </div>
                {user?.bio && (
                  <p className="text-surface-300 mt-3 max-w-2xl text-sm leading-relaxed">
                    {user.bio}
                  </p>
                )}
                {user?.birth_date && (
                  <p className="text-surface-500 text-xs mt-2">
                    Joined {new Date(user.birth_date).getFullYear()}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <Link
                  to="/profile/edit"
                  className="flex items-center gap-2 px-4 py-2 bg-surface-800 hover:bg-surface-700 text-surface-100 text-sm font-medium rounded-full transition-colors border border-surface-600 no-underline"
                >
                  <Edit3 size={16} />
                  Customize profile
                </Link>
                <Link
                  to="/settings"
                  className="p-2 bg-surface-800 hover:bg-surface-700 text-surface-100 rounded-full transition-colors border border-surface-600 no-underline"
                >
                  <Settings size={20} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs / Separator */}
      <div className="border-b border-surface-700 mx-4 md:mx-8">
        <div className="flex gap-8">
          <button className="px-2 py-3 text-surface-100 font-medium border-b-2 border-surface-100">
            Rooms
          </button>
          <button className="px-2 py-3 text-surface-400 font-medium hover:text-surface-200 transition-colors bg-transparent border-none cursor-pointer">
            About
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 md:px-8 pb-12">
        <h2 className="text-lg font-bold text-surface-100 mb-4">Latest Rooms</h2>
        {roomsLoading ? (
          <div className="text-surface-500 text-sm">Loading content...</div>
        ) : userRooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-surface-900/50 rounded-xl border border-surface-700/50">
            <div className="w-16 h-16 bg-surface-800 rounded-full flex items-center justify-center mb-4 text-surface-500">
              <UserPlus size={32} />
            </div>
            <h3 className="text-surface-100 font-medium text-lg">Create content</h3>
            <p className="text-surface-400 mt-1 max-w-sm">
              You haven't created any rooms yet. Start a conversation to engage with the community.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {userRooms.map((room) => (
              <RoomCard key={room.uuid} room={room} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
