import { useNavigate } from "react-router-dom";
import { Video, Mic, MessageCircle, Users, Hash } from "lucide-react";
import type { Room } from "../types";
import RoomTimer from "./RoomTimer";

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

interface RoomCardProps {
  room: Room;
}

export default function RoomCard({ room }: RoomCardProps) {
  const navigate = useNavigate();
  const Icon = typeIcon[room.type] || MessageCircle;

  return (
    <div
      key={room.uuid}
      onClick={() => navigate(`/rooms/${room.uuid}`)}
      className="bg-surface-900 border border-surface-700 rounded-xl p-4 hover:border-surface-600 transition-colors cursor-pointer h-full flex flex-col justify-between"
    >
      <div>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-surface-100 font-medium">{room.name}</h3>
            <p className="text-surface-500 text-sm mt-1">
              {room.category?.name}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-xs text-surface-400">
              <Users size={14} />
              {room.capacity}
            </span>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                typeStyle[room.type] || "bg-blue-500/20 text-blue-400"
              }`}
            >
              <Icon size={12} />
              {room.type.toLowerCase()}
            </span>
          </div>
        </div>
        {room.description && (
          <p className="text-surface-400 text-sm mt-2">
            {room.description.slice(0, 80)}...
          </p>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2 mt-3">
        {room.topic.map((t) => (
          <span
            key={t.id}
            className="px-2 py-1 bg-surface-800 rounded-full text-xs text-surface-300"
          >
            <Hash size={10} className="inline-block mr-1" />
            {t.name}
          </span>
        ))}
        <RoomTimer status={room.status} startTime={room.start_time} createdAt={room.created_at} />
      </div>
    </div>
  );
}
