import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  MonitorUp,
  MonitorOff,
  PhoneOff,
  MessageCircle,
  Send,
  X,
  Users,
} from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { useRoomStore } from "../store/roomStore";
import { useVideoChat } from "../hooks/useVideoChat";

export default function VideoRoomPage() {
  const { uuid } = useParams<{ uuid: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { currentRoom, fetchRoom } = useRoomStore();

  const {
    localStream,
    screenStream,
    peers,
    chatMessages,
    isConnected,
    isMuted,
    isCameraOff,
    isScreenSharing,
    screenSharingUser,
    error,
    joinRoom,
    leaveRoom,
    toggleMute,
    toggleCamera,
    startScreenShare,
    stopScreenShare,
    sendChatMessage,
  } = useVideoChat({
    roomUuid: uuid || "",
    token: localStorage.getItem("access_token") || "",
  });

  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localScreenRef = useRef<HTMLVideoElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Fetch room details
  useEffect(() => {
    if (uuid) fetchRoom(uuid);
  }, [uuid, fetchRoom]);

  // Auto-join when room is loaded and is a VIDEO room
  useEffect(() => {
    if (
      currentRoom &&
      currentRoom.type === "VIDEO" &&
      currentRoom.status === "active" &&
      !isConnected &&
      !error
    ) {
      joinRoom();
    }
  }, [currentRoom, isConnected, error, joinRoom]);

  // Bind local stream to video element
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Bind screen share stream to its video element
  useEffect(() => {
    if (localScreenRef.current && screenStream) {
      localScreenRef.current.srcObject = screenStream;
    }
  }, [screenStream]);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim()) {
      sendChatMessage(chatInput);
      setChatInput("");
    }
  };

  const handleLeave = () => {
    leaveRoom();
    navigate(`/rooms/${uuid}`);
  };

  // Guard: only VIDEO rooms, must be active
  if (currentRoom && currentRoom.type !== "VIDEO") {
    return (
      <div className="flex items-center justify-center h-screen bg-surface-950">
        <div className="text-center space-y-4">
          <p className="text-danger text-lg font-medium">
            This room is not a video chat room
          </p>
          <button
            onClick={() => navigate(`/rooms/${uuid}`)}
            className="px-4 py-2 bg-surface-800 hover:bg-surface-700 text-surface-300 text-sm rounded-lg transition-colors cursor-pointer border border-surface-600"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  if (currentRoom && currentRoom.status !== "active") {
    return (
      <div className="flex items-center justify-center h-screen bg-surface-950">
        <div className="text-center space-y-4">
          <p className="text-warning text-lg font-medium">
            This room is not active yet
          </p>
          <p className="text-surface-400 text-sm">
            The room must be active to join the video call
          </p>
          <button
            onClick={() => navigate(`/rooms/${uuid}`)}
            className="px-4 py-2 bg-surface-800 hover:bg-surface-700 text-surface-300 text-sm rounded-lg transition-colors cursor-pointer border border-surface-600"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-surface-950">
        <div className="text-center space-y-4">
          <p className="text-danger text-lg font-medium">{error}</p>
          <button
            onClick={() => navigate(`/rooms/${uuid}`)}
            className="px-4 py-2 bg-surface-800 hover:bg-surface-700 text-surface-300 text-sm rounded-lg transition-colors cursor-pointer border border-surface-600"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  const peerCount = peers.size;
  const totalParticipants = peerCount + 1; // +1 for local user

  // Calculate grid layout
  const getGridClass = () => {
    if (totalParticipants <= 1) return "grid-cols-1";
    if (totalParticipants <= 2) return "grid-cols-2";
    if (totalParticipants <= 4) return "grid-cols-2 grid-rows-2";
    if (totalParticipants <= 6) return "grid-cols-3 grid-rows-2";
    if (totalParticipants <= 9) return "grid-cols-3 grid-rows-3";
    return "grid-cols-4 grid-rows-4";
  };

  return (
    <div className="fixed inset-0 bg-surface-950 flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-surface-900 border-b border-surface-700">
        <div className="flex items-center gap-3">
          <h2 className="text-surface-100 font-medium text-sm truncate max-w-[200px]">
            {currentRoom?.name || "Video Room"}
          </h2>
          <span className="flex items-center gap-1 text-xs text-surface-400">
            <Users size={12} />
            {totalParticipants}
          </span>
        </div>

        {screenSharingUser && screenSharingUser.userId !== user?.id && (
          <span className="flex items-center gap-1 text-xs text-accent bg-accent/10 px-2 py-1 rounded-full">
            <MonitorUp size={12} />
            {screenSharingUser.username} is sharing screen
          </span>
        )}
      </div>

      {/* Main area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video grid */}
        <div className={`flex-1 p-2 grid gap-2 ${getGridClass()} auto-rows-fr`}>
          {/* Local video */}
          <div className="relative bg-surface-900 rounded-xl overflow-hidden border border-surface-700">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${
                isCameraOff ? "hidden" : ""
              }`}
            />
            {isCameraOff && (
              <div className="absolute inset-0 flex items-center justify-center bg-surface-800">
                <div className="w-16 h-16 rounded-full bg-surface-700 flex items-center justify-center text-surface-300 text-xl font-bold">
                  {user?.username?.charAt(0).toUpperCase() || "?"}
                </div>
              </div>
            )}
            <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
              <span className="bg-surface-900/80 text-surface-200 text-xs px-2 py-0.5 rounded-md">
                You{isScreenSharing ? " (sharing)" : ""}
              </span>
              {isMuted && (
                <span className="bg-danger/80 p-0.5 rounded-md">
                  <MicOff size={10} className="text-white" />
                </span>
              )}
            </div>
          </div>

          {/* Local screen share preview (small, shown alongside camera) */}
          {isScreenSharing && screenStream && (
            <div className="relative bg-surface-900 rounded-xl overflow-hidden border border-accent/50">
              <video
                ref={localScreenRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-contain"
              />
              <div className="absolute bottom-2 left-2">
                <span className="bg-accent/80 text-white text-xs px-2 py-0.5 rounded-md">
                  Your screen
                </span>
              </div>
            </div>
          )}

          {/* Remote peers */}
          {Array.from(peers.values()).map((peer) => (
            <PeerVideo key={peer.userId} peer={peer} />
          ))}
        </div>

        {/* Chat panel */}
        {showChat && (
          <div className="w-80 bg-surface-900 border-l border-surface-700 flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-surface-700">
              <h3 className="text-surface-200 text-sm font-medium">Chat</h3>
              <button
                onClick={() => setShowChat(false)}
                className="text-surface-400 hover:text-surface-200 cursor-pointer bg-transparent border-none"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {chatMessages.length === 0 && (
                <p className="text-surface-500 text-xs text-center mt-4">
                  No messages yet
                </p>
              )}
              {chatMessages.map((msg, i) => (
                <div key={i} className="text-sm">
                  <span
                    className={`font-medium ${
                      msg.userId === user?.id
                        ? "text-primary-400"
                        : "text-surface-300"
                    }`}
                  >
                    {msg.userId === user?.id ? "You" : msg.username}
                  </span>
                  <span className="text-surface-200 ml-1.5">
                    {msg.message}
                  </span>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <form
              onSubmit={handleSendMessage}
              className="p-3 border-t border-surface-700"
            >
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-1.5 bg-surface-800 border border-surface-600 rounded-lg text-surface-100 text-sm placeholder-surface-500 focus:outline-none focus:border-primary-500"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim()}
                  className="p-1.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-lg cursor-pointer border-none transition-colors"
                >
                  <Send size={14} />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Controls bar */}
      <div className="flex items-center justify-center gap-3 px-4 py-3 bg-surface-900 border-t border-surface-700">
        <ControlButton
          onClick={toggleMute}
          active={!isMuted}
          icon={isMuted ? <MicOff size={20} /> : <Mic size={20} />}
          label={isMuted ? "Unmute" : "Mute"}
        />
        <ControlButton
          onClick={toggleCamera}
          active={!isCameraOff}
          icon={isCameraOff ? <VideoOff size={20} /> : <Video size={20} />}
          label={isCameraOff ? "Turn on camera" : "Turn off camera"}
        />
        <ControlButton
          onClick={isScreenSharing ? stopScreenShare : startScreenShare}
          active={isScreenSharing}
          activeColor="accent"
          icon={
            isScreenSharing ? (
              <MonitorOff size={20} />
            ) : (
              <MonitorUp size={20} />
            )
          }
          label={isScreenSharing ? "Stop sharing" : "Share screen"}
        />
        <ControlButton
          onClick={() => setShowChat((prev) => !prev)}
          active={showChat}
          activeColor="primary"
          icon={<MessageCircle size={20} />}
          label="Chat"
        />

        {/* Leave button */}
        <button
          onClick={handleLeave}
          className="flex items-center gap-2 px-5 py-2.5 bg-danger hover:bg-danger/80 text-white text-sm font-medium rounded-full transition-colors cursor-pointer border-none"
        >
          <PhoneOff size={18} />
          Leave
        </button>
      </div>
    </div>
  );
}

// --- Sub-components ---

function PeerVideo({ peer }: { peer: { userId: number; username: string; stream: MediaStream | null } }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && peer.stream) {
      videoRef.current.srcObject = peer.stream;
    }
  }, [peer.stream]);

  return (
    <div className="relative bg-surface-900 rounded-xl overflow-hidden border border-surface-700">
      {peer.stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-surface-800">
          <div className="w-16 h-16 rounded-full bg-surface-700 flex items-center justify-center text-surface-300 text-xl font-bold">
            {peer.username?.charAt(0).toUpperCase() || "?"}
          </div>
        </div>
      )}
      <div className="absolute bottom-2 left-2">
        <span className="bg-surface-900/80 text-surface-200 text-xs px-2 py-0.5 rounded-md">
          {peer.username}
        </span>
      </div>
    </div>
  );
}

function ControlButton({
  onClick,
  active,
  activeColor = "surface",
  icon,
  label,
}: {
  onClick: () => void;
  active: boolean;
  activeColor?: "surface" | "accent" | "primary";
  icon: React.ReactNode;
  label: string;
}) {
  const colorMap = {
    surface: active
      ? "bg-surface-700 text-surface-100"
      : "bg-surface-800 text-surface-400 hover:bg-surface-700 hover:text-surface-200",
    accent: active
      ? "bg-accent/20 text-accent"
      : "bg-surface-800 text-surface-400 hover:bg-surface-700 hover:text-surface-200",
    primary: active
      ? "bg-primary-600/20 text-primary-400"
      : "bg-surface-800 text-surface-400 hover:bg-surface-700 hover:text-surface-200",
  };

  return (
    <button
      onClick={onClick}
      title={label}
      className={`p-3 rounded-full transition-colors cursor-pointer border-none ${colorMap[activeColor]}`}
    >
      {icon}
    </button>
  );
}
