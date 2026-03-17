import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, Hash, Plus, ChevronDown, Send, CheckCircle, X } from "lucide-react";
import api from "../api/axios";
import type { Category, Topic, TopicRequest } from "../types";

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
  const [showSuggestForm, setShowSuggestForm] = useState(false);
  const [suggestName, setSuggestName] = useState("");
  const [suggestDesc, setSuggestDesc] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
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

  const handleSuggestTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestName.trim()) return;

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await api.post<TopicRequest>("topic-requests/", {
        name: suggestName,
        description: suggestDesc || undefined,
      });
      setSuggestName("");
      setSuggestDesc("");
      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        setShowSuggestForm(false);
      }, 2000);
    } catch (err: any) {
      const data = err?.response?.data;
      if (data?.name) {
        setSubmitError(Array.isArray(data.name) ? data.name[0] : data.name);
      } else {
        setSubmitError("Failed to submit request. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
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
              onClick={() => {
                setShowSuggestForm(!showSuggestForm);
                setSubmitError(null);
                setSubmitSuccess(false);
              }}
              className="flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300 bg-transparent border-none cursor-pointer"
            >
              <Plus size={14} />
              Suggest Topic
            </button>
          </div>
          {showSuggestForm && (
            <div className="bg-surface-800 border border-surface-700 rounded-lg p-4 mb-3">
              {submitSuccess ? (
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle size={16} />
                  <p className="text-sm font-medium">
                    Submitted! A moderator will review it shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSuggestTopic} className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-surface-300">Suggest a New Topic</span>
                    <button
                      type="button"
                      onClick={() => setShowSuggestForm(false)}
                      className="p-1 text-surface-500 hover:text-surface-300 bg-transparent border-none cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={suggestName}
                    onChange={(e) => setSuggestName(e.target.value)}
                    placeholder="Topic name"
                    className="w-full px-3 py-2 bg-surface-900 border border-surface-600 rounded-lg text-sm text-surface-100 placeholder-surface-500 focus:outline-none focus:border-primary-500"
                    required
                  />
                  <textarea
                    value={suggestDesc}
                    onChange={(e) => setSuggestDesc(e.target.value)}
                    placeholder="Brief description (optional)"
                    rows={2}
                    className="w-full px-3 py-2 bg-surface-900 border border-surface-600 rounded-lg text-sm text-surface-100 placeholder-surface-500 focus:outline-none focus:border-primary-500 resize-none"
                  />
                  {submitError && (
                    <p className="text-red-400 text-xs">{submitError}</p>
                  )}
                  <button
                    type="submit"
                    disabled={isSubmitting || !suggestName.trim()}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border-none"
                  >
                    <Send size={14} />
                    {isSubmitting ? "Submitting..." : "Submit for Review"}
                  </button>
                </form>
              )}
            </div>
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
