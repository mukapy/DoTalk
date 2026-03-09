import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, Hash, Plus, ChevronDown } from "lucide-react";
import api from "../api/axios";
import type { Category, Topic } from "../types";

const TOPICS_TO_SHOW_INITIALLY = 8; // Adjust this number to control how many topics appear in the first two rows

export default function AdvancedFilterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [roomType, setRoomType] = useState<string | null>(searchParams.get("type"));
  const [categories, setCategories] = useState<Category[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(searchParams.get("category") || null);
  const [selectedTopics, setSelectedTopics] = useState<string[]>(searchParams.get("topic")?.split(",").filter(Boolean) || []);
  const [loading, setLoading] = useState(true);
  const [showNewTopicForm, setShowNewTopicForm] = useState(false);
  const [newTopicName, setNewTopicName] = useState("");
  const [isSubmittingTopic, setIsSubmittingTopic] = useState(false);
  const [isTopicsExpanded, setIsTopicsExpanded] = useState(false);

  const fetchTopics = async () => {
    try {
      const topicsRes = await api.get<Topic[]>("topics/");
      setTopics(topicsRes.data);
    } catch (error) {
      console.error("Failed to fetch topics:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const catsRes = await api.get<Category[]>("categories/");
        setCategories(catsRes.data);
        await fetchTopics();
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCategoryChange = (slug: string) => {
    if (selectedCategory === slug) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(slug);
    }
  };

  const handleTopicToggle = (slug: string) => {
    setSelectedTopics((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const handleAddNewTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicName.trim()) return;

    setIsSubmittingTopic(true);
    try {
      const response = await api.post<Topic>("topics/", { name: newTopicName });
      setTopics((prev) => [...prev, response.data]);
      setSelectedTopics((prev) => [...prev, response.data.slug]);
      setNewTopicName("");
      setShowNewTopicForm(false);
    } catch (error) {
      console.error("Failed to create topic:", error);
      // Optionally, show an error message to the user
    } finally {
      setIsSubmittingTopic(false);
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.append("search", searchQuery);
    if (roomType) params.append("type", roomType);
    if (selectedCategory) params.append("category", selectedCategory);
    if (selectedTopics.length > 0) params.append("topic", selectedTopics.join(","));
    navigate(`/?${params.toString()}`);
  };

  const visibleTopics = isTopicsExpanded ? topics : topics.slice(0, TOPICS_TO_SHOW_INITIALLY);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-surface-100">Advanced Filter</h1>
        <p className="text-surface-400 mt-1">
          Find rooms with more specific criteria.
        </p>
      </div>

      <div className="space-y-6">
        {/* Search by name */}
        <div className="relative max-w-lg">
          <label className="block text-sm font-medium text-surface-300 mb-1.5">
            Room Name
          </label>
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500"
            />
            <input
              type="text"
              placeholder="Search by room name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-surface-900 border border-surface-700 rounded-xl text-surface-100 placeholder-surface-500 text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
            />
          </div>
        </div>

        {/* Filter by type */}
        <div>
          <label className="block text-sm font-medium text-surface-300 mb-1.5">
            Room Type
          </label>
          <div className="flex flex-wrap gap-3">
            {["VIDEO", "VOICE", "CHAT"].map((type) => (
              <button
                key={type}
                onClick={() => setRoomType(roomType === type ? null : type)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                  roomType === type
                    ? "bg-primary-600 text-white border-primary-500"
                    : "bg-surface-800 hover:bg-surface-700 text-surface-200 border-surface-600"
                }`}
              >
                {type.charAt(0) + type.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Filter by category */}
        <div>
          <label className="block text-sm font-medium text-surface-300 mb-1.5">
            Category (select one)
          </label>
          {loading ? <div className="text-sm text-surface-500">Loading categories...</div> : (
            <div className="flex flex-wrap gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.slug)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                    selectedCategory === cat.slug
                      ? "bg-primary-600 text-white border-primary-500"
                      : "bg-surface-800 hover:bg-surface-700 text-surface-200 border-surface-600"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filter by topics */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-medium text-surface-300">
              Topics (select many)
            </label>
            <button
              onClick={() => setShowNewTopicForm(!showNewTopicForm)}
              className="flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300"
            >
              <Plus size={14} />
              Enhance
            </button>
          </div>
          {showNewTopicForm && (
            <form onSubmit={handleAddNewTopic} className="flex gap-2 mb-3">
              <input
                type="text"
                value={newTopicName}
                onChange={(e) => setNewTopicName(e.target.value)}
                placeholder="Enter new topic name"
                className="flex-grow px-3 py-2 bg-surface-800 border border-surface-600 rounded-lg text-sm text-surface-100 focus:outline-none focus:border-primary-500"
              />
              <button
                type="submit"
                disabled={isSubmittingTopic}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg disabled:opacity-50"
              >
                {isSubmittingTopic ? "Adding..." : "Add"}
              </button>
            </form>
          )}
          {loading ? <div className="text-sm text-surface-500">Loading topics...</div> : (
            <>
              <div className="flex flex-wrap gap-3">
                {visibleTopics.length > 0 ? visibleTopics.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => handleTopicToggle(topic.slug)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                      selectedTopics.includes(topic.slug)
                        ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                        : "bg-surface-800 hover:bg-surface-700 text-surface-300 border-surface-700"
                    }`}
                  >
                    <Hash size={12} />
                    {topic.name}
                  </button>
                )) : <p className="text-sm text-surface-500">No topics available.</p>}
              </div>
              {topics.length > TOPICS_TO_SHOW_INITIALLY && (
                <div className="text-center mt-3">
                  <button
                    onClick={() => setIsTopicsExpanded(!isTopicsExpanded)}
                    className="flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300"
                  >
                    <ChevronDown size={14} className={`transition-transform ${isTopicsExpanded ? 'rotate-180' : ''}`} />
                    {isTopicsExpanded ? "Pull up" : "Pull down"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Apply button */}
        <div className="pt-4">
          <button
            onClick={handleSearch}
            className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors cursor-pointer border-none"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}
