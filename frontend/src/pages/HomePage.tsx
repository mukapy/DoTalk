import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { TrendingUp, Users, Flame, Video, Mic, MessageCircle, Hash } from "lucide-react";
import api from "../api/axios";
import type { Room, Category, Topic, PaginatedResponse } from "../types";

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

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [roomsLoading, setRoomsLoading] = useState(true);

  useEffect(() => {
    const initialTopics = searchParams.get("topic")?.split(",") || [];
    setSelectedTopics(initialTopics);

    const fetchInitialData = async () => {
      try {
        const [catsRes, topicsRes] = await Promise.all([
          api.get<PaginatedResponse<Category> | Category[]>("rooms/categories/"),
          api.get<PaginatedResponse<Topic> | Topic[]>("rooms/topics/"),
        ]);

        const catsData = Array.isArray(catsRes.data)
          ? catsRes.data
          : catsRes.data.results;
        const topicsData = Array.isArray(topicsRes.data)
          ? topicsRes.data
          : topicsRes.data.results;

        setCategories(catsData);
        setTopics(topicsData);
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [searchParams]);

  useEffect(() => {
    const fetchRooms = async () => {
      setRoomsLoading(true);
      try {
        const topicQuery = selectedTopics.length > 0 ? `&topic=${selectedTopics.join(",")}` : "";
        const roomsRes = await api.get<PaginatedResponse<Room> | Room[]>(`rooms/?${topicQuery}`);

        const roomsData = Array.isArray(roomsRes.data)
          ? roomsRes.data
          : roomsRes.data.results;
        setRooms(roomsData);
      } catch (error) {
        console.error("Failed to fetch rooms:", error);
        setRooms([]);
      } finally {
        setRoomsLoading(false);
      }
    };
    fetchRooms();
  }, [selectedTopics]);

  const handleTopicToggle = (topicSlug: string) => {
    setSelectedTopics((prevSelectedTopics) => {
      const newSelectedTopics = prevSelectedTopics.includes(topicSlug)
        ? prevSelectedTopics.filter((slug) => slug !== topicSlug)
        : [...prevSelectedTopics, topicSlug];

      if (newSelectedTopics.length > 0) {
        searchParams.set("topic", newSelectedTopics.join(","));
      } else {
        searchParams.delete("topic");
      }
      setSearchParams(searchParams);
      return newSelectedTopics;
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-primary-600/20 to-accent/10 rounded-2xl border border-primary-500/20 p-8">
        <h1 className="text-2xl font-bold text-surface-100 mb-2">
          Welcome to DoTalk
        </h1>
        <p className="text-surface-400 max-w-lg">
          Join conversations about topics you love. Start a video chat, hop into
          a voice room, or text with people who share your interests.
        </p>
        <div className="flex gap-3 mt-6">
          <Link
            to="/explore"
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer border-none no-underline"
          >
            Explore Topics
          </Link>
          <Link
            to="/chats"
            className="px-4 py-2 bg-surface-800 hover:bg-surface-700 text-surface-200 text-sm font-medium rounded-lg transition-colors cursor-pointer border border-surface-600 no-underline"
          >
            Browse Rooms
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Rooms */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 text-surface-200">
            <Flame size={20} className="text-orange-400" />
            <h2 className="text-lg font-semibold">Active Rooms</h2>
          </div>
          {roomsLoading ? (
            <div className="text-surface-500 text-sm">Loading rooms...</div>
          ) : rooms.length === 0 ? (
            <div className="bg-surface-900 border border-surface-700 rounded-xl p-6 text-center">
              <p className="text-surface-400">No rooms available yet. Be the first to create one!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {rooms.map((room) => {
                const Icon = typeIcon[room.type] || MessageCircle;
                return (
                  <div
                    key={room.uuid}
                    className="bg-surface-900 border border-surface-700 rounded-xl p-4 hover:border-surface-600 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-surface-100 font-medium">{room.name}</h3>
                        <p className="text-surface-500 text-sm mt-1">
                          {room.category?.name}
                          {room.description && ` - ${room.description.slice(0, 60)}...`}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {room.topic.map((t) => (
                            <span
                              key={t.id}
                              className="px-2 py-1 bg-surface-800 rounded-full text-xs text-surface-300"
                            >
                              <Hash size={10} className="inline-block mr-1" />
                              {t.name}
                            </span>
                          ))}
                        </div>
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
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Categories and Topics sidebar */}
        <div className="space-y-6">
          {/* Categories */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-surface-200">
              <TrendingUp size={20} className="text-primary-400" />
              <h2 className="text-lg font-semibold">Categories</h2>
            </div>
            {loading ? (
              <div className="text-surface-500 text-sm">Loading...</div>
            ) : categories.length === 0 ? (
              <div className="bg-surface-900 border border-surface-700 rounded-xl p-4 text-center">
                <p className="text-surface-400 text-sm">No categories yet</p>
              </div>
            ) : (
              <div className="bg-surface-900 border border-surface-700 rounded-xl divide-y divide-surface-700">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/explore?category=${cat.slug}`} // Link to explore page with category filter
                    className="flex items-center gap-3 p-3 hover:bg-surface-800 transition-colors cursor-pointer first:rounded-t-xl last:rounded-b-xl no-underline"
                  >
                    <div className="flex-1">
                      <p className="text-surface-200 font-medium text-sm">
                        {cat.name}
                      </p>
                    </div>
                    <MessageCircle size={16} className="text-surface-500" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Topics */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-surface-200">
              <Hash size={20} className="text-blue-400" />
              <h2 className="text-lg font-semibold">Topics</h2>
            </div>
            {loading ? (
              <div className="text-surface-500 text-sm">Loading...</div>
            ) : topics.length === 0 ? (
              <div className="bg-surface-900 border border-surface-700 rounded-xl p-4 text-center">
                <p className="text-surface-400 text-sm">No topics yet</p>
              </div>
            ) : (
              <div className="bg-surface-900 border border-surface-700 rounded-xl p-4">
                {topics.map((topic) => (
                  <label
                    key={topic.id}
                    className="flex items-center gap-2 py-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedTopics.includes(topic.slug)}
                      onChange={() => handleTopicToggle(topic.slug)}
                      className="form-checkbox h-4 w-4 text-primary-600 rounded border-surface-600 focus:ring-primary-500 bg-surface-800"
                    />
                    <span className="text-surface-200 text-sm">{topic.name}</span>
                  </label>
                ))}
                {selectedTopics.length > 0 && (
                  <button
                    onClick={() => {
                      setSelectedTopics([]);
                      searchParams.delete("topic");
                      setSearchParams(searchParams);
                    }}
                    className="mt-4 px-3 py-1 bg-surface-800 hover:bg-surface-700 text-surface-200 text-xs font-medium rounded-lg transition-colors cursor-pointer border border-surface-600 w-full"
                  >
                    Clear Topics
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
