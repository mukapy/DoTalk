import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Video,
  Mic,
  MessageCircle,
  Users,
  Hash,
  ArrowLeft,
  Edit,
  Trash2,
} from "lucide-react";
import { useRoomStore } from "../store/roomStore";
import { useAuthStore } from "../store/authStore";
import RoomTimer from "../components/RoomTimer";

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

const statusStyle: Record<string, string> = {
  active: "bg-green-500/20 text-green-400",
  upcoming: "bg-amber-500/20 text-amber-400",
  inactive: "bg-surface-500/20 text-surface-400",
};

export default function RoomDetailPage() {
  const { uuid } = useParams<{ uuid: string }>();
  const navigate = useNavigate();
  const { currentRoom, isLoading, error, fetchRoom, deleteRoom } =
    useRoomStore();
  const user = useAuthStore((s) => s.user);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (uuid) fetchRoom(uuid);
  }, [uuid, fetchRoom]);

  const isCreator = user && currentRoom && user.id === currentRoom.creator;

  const handleDelete = async () => {
    if (!uuid) return;
    try {
      await deleteRoom(uuid);
      navigate("/chats");
    } catch {
      // error in store
    }
  };

  const handleTopicClick = (topicSlug: string) => {
    navigate(`/?topic=${topicSlug}`);
  };

  if (isLoading && !currentRoom) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-surface-500 text-sm">Loading room...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="bg-danger/10 border border-danger/30 text-danger rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
        <button
          onClick={() => navigate("/chats")}
          className="flex items-center gap-2 text-surface-400 hover:text-surface-200 text-sm transition-colors cursor-pointer bg-transparent border-none"
        >
          <ArrowLeft size={16} />
          Back to rooms
        </button>
      </div>
    );
  }

  if (!currentRoom) return null;

  const Icon = typeIcon[currentRoom.type] || MessageCircle;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back + actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/chats")}
          className="flex items-center gap-2 text-surface-400 hover:text-surface-200 text-sm transition-colors cursor-pointer bg-transparent border-none"
        >
          <ArrowLeft size={16} />
          Back to rooms
        </button>
        {isCreator && (
          <div className="flex items-center gap-2">
            <Link
              to={`/rooms/${currentRoom.uuid}/edit`}
              className="flex items-center gap-2 px-3 py-1.5 bg-surface-800 hover:bg-surface-700 text-surface-300 text-sm rounded-lg transition-colors border border-surface-600 no-underline"
            >
              <Edit size={14} />
              Edit
            </Link>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-danger/10 hover:bg-danger/20 text-danger text-sm rounded-lg transition-colors cursor-pointer border border-danger/30"
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Banner */}
      {currentRoom.banner && (
        <img
          src={currentRoom.banner}
          alt={`${currentRoom.name} banner`}
          className="w-full h-56 object-cover rounded-2xl border border-surface-700"
        />
      )}

      {/* Room header */}
      <div className="flex items-start gap-4">
        {currentRoom.image ? (
          <img
            src={currentRoom.image}
            alt={currentRoom.name}
            className="w-20 h-20 rounded-xl object-cover border border-surface-700 shrink-0"
          />
        ) : (
          <div
            className={`w-20 h-20 rounded-xl flex items-center justify-center shrink-0 ${
              typeStyle[currentRoom.type]
            }`}
          >
            <Icon size={32} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-surface-100 truncate">
              {currentRoom.name}
            </h1>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                statusStyle[currentRoom.status]
              }`}
            >
              {currentRoom.status}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-surface-400">
            <span
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
                typeStyle[currentRoom.type]
              }`}
            >
              <Icon size={12} />
              {currentRoom.type}
            </span>
            <span className="flex items-center gap-1">
              <Users size={14} />
              {currentRoom.capacity} max
            </span>
            {currentRoom.category && (
              <span>{currentRoom.category.name}</span>
            )}
            <span>
              {currentRoom.visibility ? "Public" : "Private"}
            </span>
            <RoomTimer status={currentRoom.status} createdAt={currentRoom.created_at} />
          </div>
        </div>
      </div>

      {/* Description */}
      {currentRoom.description && (
        <div className="bg-surface-900 border border-surface-700 rounded-xl p-5">
          <h3 className="text-sm font-medium text-surface-300 mb-2">
            Description
          </h3>
          <p className="text-surface-200 leading-relaxed whitespace-pre-wrap">
            {currentRoom.description}
          </p>
        </div>
      )}

      {/* Topics */}
      {currentRoom.topic.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {currentRoom.topic.map((t) => (
            <span
              key={t.id}
              onClick={() => handleTopicClick(t.slug)}
              className="flex items-center gap-1 px-3 py-1.5 bg-surface-800 border border-surface-700 rounded-full text-sm text-surface-300 cursor-pointer hover:bg-surface-700 hover:border-surface-600 transition-colors"
            >
              <Hash size={12} />
              {t.name}
            </span>
          ))}
        </div>
      )}

      {/* Join Video Call button — only for active VIDEO rooms */}
      {currentRoom.type === "VIDEO" && currentRoom.status === "active" && (
        <button
          onClick={() => navigate(`/rooms/${currentRoom.uuid}/live`)}
          className="flex items-center justify-center gap-2 w-full py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors cursor-pointer border-none"
        >
          <Video size={20} />
          Join Video Call
        </button>
      )}

      {/* Info for non-active VIDEO rooms */}
      {currentRoom.type === "VIDEO" && currentRoom.status === "upcoming" && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3 text-sm text-amber-400">
          This video room is not active yet. The call will be available once the room becomes active.
        </div>
      )}

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-surface-900 border border-surface-700 rounded-2xl p-6 max-w-sm w-full space-y-4">
            <h3 className="text-lg font-semibold text-surface-100">
              Delete Room?
            </h3>
            <p className="text-sm text-surface-400">
              This action cannot be undone. The room and all its data will be
              permanently deleted.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-surface-800 hover:bg-surface-700 text-surface-300 text-sm font-medium rounded-lg transition-colors cursor-pointer border border-surface-600"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isLoading}
                className="px-4 py-2 bg-danger hover:bg-danger/80 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer border-none"
              >
                {isLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
