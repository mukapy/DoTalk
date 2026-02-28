import { useEffect, useState } from "react";
import { MessageCircle, Video, Mic, Plus, Users } from "lucide-react";
import api from "../api/axios";
import type { Room, PaginatedResponse } from "../types";

const typeIcon = {
  VIDEO: Video,
  VOICE: Mic,
  CHAT: MessageCircle,
};

const typeStyle = {
  VIDEO: "bg-red-500/20 text-red-400",
  VOICE: "bg-green-500/20 text-green-400",
  CHAT: "bg-blue-500/20 text-blue-400",
};

type FilterType = "all" | "VIDEO" | "VOICE" | "CHAT";

export default function ChatsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await api.get<PaginatedResponse<Room> | Room[]>("rooms/");
        const data = Array.isArray(res.data) ? res.data : res.data.results;
        setRooms(data);
      } catch {
        // API not available
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  const filteredRooms =
    filter === "all" ? rooms : rooms.filter((r) => r.type === filter);

  const filters: { label: string; value: FilterType }[] = [
    { label: "All", value: "all" },
    { label: "Video", value: "VIDEO" },
    { label: "Voice", value: "VOICE" },
    { label: "Text", value: "CHAT" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-100">Rooms</h1>
          <p className="text-surface-400 mt-1">
            Browse and join available rooms
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer border-none">
          <Plus size={16} />
          New Room
        </button>
      </div>

      {/* Chat type filters */}
      <div className="flex gap-2">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer border-none ${
              filter === f.value
                ? "bg-primary-600/20 text-primary-400"
                : "bg-surface-800 text-surface-400 hover:text-surface-200"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Room list */}
      {loading ? (
        <div className="text-surface-500 text-sm">Loading rooms...</div>
      ) : filteredRooms.length === 0 ? (
        <div className="bg-surface-900 border border-surface-700 rounded-xl p-8 text-center">
          <p className="text-surface-400">
            {filter === "all"
              ? "No rooms available yet. Create the first one!"
              : `No ${filter.toLowerCase()} rooms available`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRooms.map((room) => {
            const Icon = typeIcon[room.type] || MessageCircle;
            return (
              <div
                key={room.uuid}
                className="bg-surface-900 border border-surface-700 rounded-xl p-4 hover:border-surface-600 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      typeStyle[room.type] || "bg-blue-500/20 text-blue-400"
                    }`}
                  >
                    <Icon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-surface-100 font-medium truncate">
                        {room.name}
                      </h3>
                      <span className="flex items-center gap-1 text-xs text-surface-400 shrink-0 ml-2">
                        <Users size={14} />
                        {room.capacity}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-surface-500 text-sm truncate">
                        {room.category?.name}
                        {room.description && ` - ${room.description.slice(0, 50)}`}
                      </p>
                      <span
                        className={`px-1.5 py-0.5 rounded text-xs shrink-0 ${
                          room.status === "active"
                            ? "bg-green-500/20 text-green-400"
                            : room.status === "upcoming"
                            ? "bg-amber-500/20 text-amber-400"
                            : "bg-surface-700 text-surface-400"
                        }`}
                      >
                        {room.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
