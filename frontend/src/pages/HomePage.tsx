import { useEffect, useState, useMemo } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { TrendingUp, Flame, Filter, Hash, MessageCircle } from "lucide-react";
import api from "../api/axios";
import type { Room, Category, Topic } from "../types";
import RoomCard from "../components/RoomCard"; // Import the new RoomCard component

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<number[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [roomsLoading, setRoomsLoading] = useState(true);

  useEffect(() => {
    const initialTopicIds = searchParams.get("topic")?.split(",").map(Number).filter(Boolean) || [];
    const initialCategoryId = Number(searchParams.get("category")) || null;
    setSelectedTopics(initialTopicIds);
    setSelectedCategory(initialCategoryId);

    const fetchInitialData = async () => {
      try {
        const [catsRes, topicsRes] = await Promise.all([
          api.get<Category[]>("categories/"),
          api.get<Topic[]>("topics/"),
        ]);

        setCategories(catsRes.data);
        setTopics(topicsRes.data);
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchRooms = async () => {
      setRoomsLoading(true);
      try {
        const params = new URLSearchParams(searchParams.toString());
        const roomsRes = await api.get<Room[]>(`rooms/?${params.toString()}`);
        setRooms(roomsRes.data);
      } catch (error) {
        console.error("Failed to fetch rooms:", error);
        setRooms([]);
      } finally {
        setRoomsLoading(false);
      }
    };
    fetchRooms();
  }, [searchParams]);

  const handleTopicToggle = (topicId: number) => {
    const newSelectedTopics = selectedTopics.includes(topicId)
      ? selectedTopics.filter((id) => id !== topicId)
      : [...selectedTopics, topicId];
    
    setSelectedTopics(newSelectedTopics);
    
    const newSearchParams = new URLSearchParams(searchParams.toString());
    if (newSelectedTopics.length > 0) {
      newSearchParams.set("topic", newSelectedTopics.join(","));
    } else {
      newSearchParams.delete("topic");
    }
    setSearchParams(newSearchParams);
  };

  const handleCategoryClick = (id: number) => {
    const newSelectedCategory = selectedCategory === id ? null : id;
    setSelectedCategory(newSelectedCategory);

    const newSearchParams = new URLSearchParams(searchParams.toString());
    if (newSelectedCategory) {
      newSearchParams.set("category", String(newSelectedCategory));
    } else {
      newSearchParams.delete("category");
    }
    setSearchParams(newSearchParams);
  };
  
  const clearAllFilters = () => {
    setSelectedTopics([]);
    setSelectedCategory(null);
    setSearchParams({});
  }

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
              <p className="text-surface-400">No rooms match your filters. Try clearing them or creating a new room!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {rooms.map((room) => (
                <RoomCard key={room.uuid} room={room} />
              ))}
            </div>
          )}
        </div>

        {/* Categories and Topics sidebar */}
        <div className="space-y-6">
          {/* Categories */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-surface-200">
              <div className="flex items-center gap-2">
                <TrendingUp size={20} className="text-primary-400" />
                <h2 className="text-lg font-semibold">Categories</h2>
              </div>
              <Link to="/advanced-filter" className="flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300">
                <Filter size={12} />
                Advanced
              </Link>
            </div>
            {loading ? (
              <div className="text-surface-500 text-sm">Loading...</div>
            ) : categories.length === 0 ? (
              <div className="bg-surface-900 border border-surface-700 rounded-xl p-4 text-center">
                <p className="text-surface-400 text-sm">No categories yet</p>
              </div>
            ) : (
              <div className="bg-surface-900 border border-surface-700 rounded-xl max-h-60 overflow-y-auto">
                <div className="divide-y divide-surface-700">
                  {categories.map((cat) => (
                    <div
                      key={cat.id}
                      onClick={() => handleCategoryClick(cat.id)}
                      className={`flex items-center gap-3 p-3 hover:bg-surface-800 transition-colors cursor-pointer first:rounded-t-xl last:rounded-b-xl ${
                        selectedCategory === cat.id ? "bg-surface-800 border-l-2 border-primary-500" : ""
                      }`}
                    >
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${selectedCategory === cat.id ? "text-primary-400" : "text-surface-200"}`}>
                          {cat.name}
                        </p>
                      </div>
                      <MessageCircle size={16} className={selectedCategory === cat.id ? "text-primary-400" : "text-surface-500"} />
                    </div>
                  ))}
                </div>
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
              <div className="bg-surface-900 border border-surface-700 rounded-xl p-4 max-h-60 overflow-y-auto">
                {topics.map((topic) => (
                  <label
                    key={topic.id}
                    className="flex items-center gap-2 py-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedTopics.includes(topic.id)}
                      onChange={() => handleTopicToggle(topic.id)}
                      className="form-checkbox h-4 w-4 text-primary-600 rounded border-surface-600 focus:ring-primary-500 bg-surface-800"
                    />
                    <span className="text-surface-200 text-sm">{topic.name}</span>
                  </label>
                ))}
              </div>
            )}
            {(selectedTopics.length > 0 || selectedCategory || searchParams.has("search") || searchParams.has("type") || searchParams.has("visibility")) && (
              <button
                onClick={clearAllFilters}
                className="mt-4 px-3 py-1 bg-surface-800 hover:bg-surface-700 text-surface-200 text-xs font-medium rounded-lg transition-colors cursor-pointer border border-surface-600 w-full"
              >
                Clear All Filters
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
