import { useCallback, useEffect, useRef, useState } from "react";
import type { Peer, ChatMessage } from "../types";

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

const WS_BASE_URL =
  import.meta.env.VITE_WS_URL || "ws://127.0.0.1:8000";

interface UseVideoChatOptions {
  roomUuid: string;
  token: string;
}

export function useVideoChat({
  roomUuid,
  token,
}: UseVideoChatOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const peersRef = useRef<Map<number, Peer>>(new Map());

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [peers, setPeers] = useState<Map<number, Peer>>(new Map());
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [screenSharingUser, setScreenSharingUser] = useState<{
    userId: number;
    username: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Helper: update peers state from ref
  const syncPeers = useCallback(() => {
    setPeers(new Map(peersRef.current));
  }, []);

  // --- Create RTCPeerConnection for a remote peer ---
  const createPeerConnection = useCallback(
    (
      remoteUserId: number,
      remoteUsername: string,
      remoteChannelName: string,
      stream: MediaStream
    ): RTCPeerConnection => {
      const pc = new RTCPeerConnection(ICE_SERVERS);

      // Add local tracks to the connection
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      // Handle incoming tracks from remote peer
      pc.ontrack = (event) => {
        const peer = peersRef.current.get(remoteUserId);
        if (peer) {
          peer.stream = event.streams[0] || null;
          syncPeers();
        }
      };

      // Send ICE candidates to the remote peer via signaling
      pc.onicecandidate = (event) => {
        if (event.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(
            JSON.stringify({
              type: "ice-candidate",
              candidate: event.candidate.toJSON(),
              target_channel: remoteChannelName,
            })
          );
        }
      };

      pc.onconnectionstatechange = () => {
        if (
          pc.connectionState === "disconnected" ||
          pc.connectionState === "failed"
        ) {
          removePeer(remoteUserId);
        }
      };

      // Store peer
      const peer: Peer = {
        userId: remoteUserId,
        username: remoteUsername,
        channelName: remoteChannelName,
        connection: pc,
        stream: null,
        screenStream: null,
      };
      peersRef.current.set(remoteUserId, peer);
      syncPeers();

      return pc;
    },
    [syncPeers]
  );

  const removePeer = useCallback(
    (remoteUserId: number) => {
      const peer = peersRef.current.get(remoteUserId);
      if (peer) {
        peer.connection.close();
        peersRef.current.delete(remoteUserId);
        syncPeers();
      }
    },
    [syncPeers]
  );

  // --- WebSocket message handler ---
  const handleMessage = useCallback(
    async (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      const stream = localStream;

      if (!stream) return;

      switch (data.type) {
        case "user-joined": {
          // A new user joined: create a peer connection and send an offer
          const pc = createPeerConnection(
            data.user_id,
            data.username,
            data.channel_name,
            stream
          );
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);

          wsRef.current?.send(
            JSON.stringify({
              type: "offer",
              sdp: pc.localDescription,
              target_channel: data.channel_name,
            })
          );
          break;
        }

        case "offer": {
          // Received an offer: create peer connection, set remote desc, send answer
          const pc = createPeerConnection(
            data.user_id,
            data.username,
            data.channel_name,
            stream
          );
          await pc.setRemoteDescription(
            new RTCSessionDescription(data.sdp)
          );
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);

          wsRef.current?.send(
            JSON.stringify({
              type: "answer",
              sdp: pc.localDescription,
              target_channel: data.channel_name,
            })
          );
          break;
        }

        case "answer": {
          const peer = peersRef.current.get(data.user_id);
          if (peer) {
            await peer.connection.setRemoteDescription(
              new RTCSessionDescription(data.sdp)
            );
          }
          break;
        }

        case "ice-candidate": {
          const peer = peersRef.current.get(data.user_id);
          if (peer && data.candidate) {
            try {
              await peer.connection.addIceCandidate(
                new RTCIceCandidate(data.candidate)
              );
            } catch {
              // ICE candidate error - non-fatal
            }
          }
          break;
        }

        case "user-left": {
          removePeer(data.user_id);
          if (
            screenSharingUser &&
            screenSharingUser.userId === data.user_id
          ) {
            setScreenSharingUser(null);
          }
          break;
        }

        case "screen-share-started": {
          setScreenSharingUser({
            userId: data.user_id,
            username: data.username,
          });
          break;
        }

        case "screen-share-stopped": {
          if (
            screenSharingUser &&
            screenSharingUser.userId === data.user_id
          ) {
            setScreenSharingUser(null);
          }
          break;
        }

        case "chat-message": {
          setChatMessages((prev) => [
            ...prev,
            {
              userId: data.user_id,
              username: data.username,
              message: data.message,
              timestamp: Date.now(),
            },
          ]);
          break;
        }
      }
    },
    [localStream, createPeerConnection, removePeer, screenSharingUser]
  );

  // --- Initialize media and WebSocket ---
  const joinRoom = useCallback(async () => {
    try {
      setError(null);

      // Get user media (camera + mic)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);

      // Connect WebSocket
      const ws = new WebSocket(
        `${WS_BASE_URL}/ws/rooms/${roomUuid}/?token=${token}`
      );
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        // Tell the room we've joined
        ws.send(JSON.stringify({ type: "join" }));
      };

      ws.onclose = (e) => {
        setIsConnected(false);
        if (e.code === 4001) setError("Authentication failed");
        else if (e.code === 4002) setError("Room is not active");
        else if (e.code === 4003) setError("This is not a video room");
        else if (e.code === 4004) setError("Room not found");
      };

      ws.onerror = () => {
        setError("WebSocket connection error");
      };
    } catch (err) {
      if (err instanceof DOMException && err.name === "NotAllowedError") {
        setError("Camera/microphone permission denied");
      } else {
        setError("Failed to access media devices");
      }
    }
  }, [roomUuid, token]);

  // Attach message handler whenever localStream or handler changes
  useEffect(() => {
    const ws = wsRef.current;
    if (ws && localStream) {
      ws.onmessage = handleMessage;
    }
  }, [localStream, handleMessage]);

  // --- Leave room ---
  const leaveRoom = useCallback(() => {
    // Close all peer connections
    peersRef.current.forEach((peer) => {
      peer.connection.close();
    });
    peersRef.current.clear();
    syncPeers();

    // Stop screen share if active
    if (screenStream) {
      screenStream.getTracks().forEach((t) => t.stop());
      setScreenStream(null);
      setIsScreenSharing(false);
    }

    // Stop local media
    if (localStream) {
      localStream.getTracks().forEach((t) => t.stop());
      setLocalStream(null);
    }

    // Close websocket
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsConnected(false);
    setScreenSharingUser(null);
  }, [localStream, screenStream, syncPeers]);

  // --- Toggle mute ---
  const toggleMute = useCallback(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach((t) => {
        t.enabled = !t.enabled;
      });
      setIsMuted((prev) => !prev);
    }
  }, [localStream]);

  // --- Toggle camera ---
  const toggleCamera = useCallback(() => {
    if (localStream) {
      localStream.getVideoTracks().forEach((t) => {
        t.enabled = !t.enabled;
      });
      setIsCameraOff((prev) => !prev);
    }
  }, [localStream]);

  // --- Screen sharing (additive — camera stays on) ---
  const startScreenShare = useCallback(async () => {
    try {
      const screen = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });
      setScreenStream(screen);
      setIsScreenSharing(true);

      // Replace video track in all peer connections with screen track
      const screenTrack = screen.getVideoTracks()[0];

      peersRef.current.forEach((peer) => {
        const sender = peer.connection
          .getSenders()
          .find((s) => s.track?.kind === "video");
        if (sender) {
          sender.replaceTrack(screenTrack);
        }
      });

      // Notify peers
      wsRef.current?.send(
        JSON.stringify({ type: "screen-share-started" })
      );

      // When user stops sharing via browser UI
      screenTrack.onended = () => {
        stopScreenShare();
      };
    } catch {
      // User cancelled screen picker
    }
  }, []);

  const stopScreenShare = useCallback(() => {
    if (screenStream) {
      screenStream.getTracks().forEach((t) => t.stop());
      setScreenStream(null);
    }
    setIsScreenSharing(false);

    // Restore camera track in all peer connections
    if (localStream) {
      const cameraTrack = localStream.getVideoTracks()[0];
      if (cameraTrack) {
        peersRef.current.forEach((peer) => {
          const sender = peer.connection
            .getSenders()
            .find((s) => s.track?.kind === "video");
          if (sender) {
            sender.replaceTrack(cameraTrack);
          }
        });
      }
    }

    // Notify peers
    wsRef.current?.send(
      JSON.stringify({ type: "screen-share-stopped" })
    );
  }, [screenStream, localStream]);

  // --- Send chat message ---
  const sendChatMessage = useCallback(
    (message: string) => {
      if (wsRef.current?.readyState === WebSocket.OPEN && message.trim()) {
        wsRef.current.send(
          JSON.stringify({ type: "chat-message", message: message.trim() })
        );
      }
    },
    []
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      leaveRoom();
    };
  }, []);

  return {
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
  };
}
