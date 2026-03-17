import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, Hash, Plus, X, ChevronRight, Send, CheckCircle, Clock, XCircle } from "lucide-react";
import api from "../api/axios";
import type { Category, Topic, TopicRequest } from "../types";

export default function ExplorePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [myRequests, setMyRequests] = useState<TopicRequest[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Topic suggestion form
  const [showSuggestForm, setShowSuggestForm] = useState(false);
  const [suggestName, setSuggestName] = useState("");
  const [suggestDesc, setSuggestDesc] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catsRes, topicsRes, requestsRes] = await Promise.all([
          api.get<Category[]>("categories/"),
          api.get<Topic[]>("topics/"),
          api.get<TopicRequest[]>("topic-requests/").catch(() => ({ data: [] })),
        ]);
        setCategories(catsRes.data);
        setTopics(topicsRes.data);
        setMyRequests(requestsRes.data);

        const initialCategorySlug = searchParams.get("category");
        if (initialCategorySlug) {
          setSelectedCategory(initialCategorySlug);
        }
      } catch {
        // API not available
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [searchParams]);

  const handleCategoryClick = (slug: string) => {
    setSelectedCategory(selectedCategory === slug ? null : slug);
  };

  const handleTopicClick = (slug: string) => {
    navigate(`/?topic=${slug}`);
  };

  const handleSuggestTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestName.trim()) return;

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const res = await api.post<TopicRequest>("topic-requests/", {
        name: suggestName,
        description: suggestDesc || undefined,
      });
      setMyRequests((prev) => [res.data, ...prev]);
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

  const filteredTopics = topics.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const statusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle size={14} className="text-green-400" />;
      case "rejected":
        return <XCircle size={14} className="text-red-400" />;
      default:
        return <Clock size={14} className="text-amber-400" />;
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "text-green-400";
      case "rejected":
        return "text-red-400";
      default:
        return "text-amber-400";
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-100">Explore</h1>
          <p className="text-surface-400 text-sm mt-0.5">
            Discover topics and join conversations
          </p>
        </div>
        <button
          onClick={() => {
            setShowSuggestForm(!showSuggestForm);
            setSubmitError(null);
            setSubmitSuccess(false);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer border-none"
        >
          <Plus size={16} />
          Suggest Topic
        </button>
      </div>

      {/* Suggest topic form */}
      {showSuggestForm && (
        <div className="bg-surface-900 border border-surface-700 rounded-xl p-5">
          {submitSuccess ? (
            <div className="flex items-center gap-3 text-green-400">
              <CheckCircle size={20} />
              <p className="text-sm font-medium">
                Topic suggestion submitted! A moderator will review it shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSuggestTopic} className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-surface-200">
                  Suggest a New Topic
                </h3>
                <button
                  type="button"
                  onClick={() => setShowSuggestForm(false)}
                  className="p-1 text-surface-500 hover:text-surface-300 bg-transparent border-none cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
              <input
                type="text"
                value={suggestName}
                onChange={(e) => setSuggestName(e.target.value)}
                placeholder="Topic name"
                className="w-full px-3 py-2.5 bg-surface-800 border border-surface-600 rounded-lg text-sm text-surface-100 placeholder-surface-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                required
              />
              <textarea
                value={suggestDesc}
                onChange={(e) => setSuggestDesc(e.target.value)}
                placeholder="Brief description (optional)"
                rows={2}
                className="w-full px-3 py-2.5 bg-surface-800 border border-surface-600 rounded-lg text-sm text-surface-100 placeholder-surface-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors resize-none"
              />
              {submitError && (
                <p className="text-red-400 text-xs">{submitError}</p>
              )}
              <button
                type="submit"
                disabled={isSubmitting || !suggestName.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={14} />
                {isSubmitting ? "Submitting..." : "Submit for Review"}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500"
        />
        <input
          type="text"
          placeholder="Search topics..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-surface-900 border border-surface-700 rounded-xl text-surface-100 placeholder-surface-500 text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
        />
      </div>

      {loading ? (
        <div className="text-surface-500 text-sm">Loading...</div>
      ) : (
        <>
          {/* Categories - horizontal scrollable pills */}
          <div>
            <h2 className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-3">
              Categories
            </h2>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.slug)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border cursor-pointer ${
                    selectedCategory === cat.slug
                      ? "bg-primary-600 text-white border-primary-500"
                      : "bg-surface-900 text-surface-300 border-surface-700 hover:border-surface-500 hover:text-surface-100"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
              {selectedCategory && (
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-surface-800 text-surface-400 border border-surface-700 hover:text-surface-200 cursor-pointer flex items-center gap-1 transition-colors"
                >
                  <X size={12} />
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Topics - clean compact list */}
          <div>
            <h2 className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-3">
              Topics
              <span className="ml-2 text-surface-500 font-normal normal-case">
                {filteredTopics.length} available
              </span>
            </h2>
            {filteredTopics.length === 0 ? (
              <div className="bg-surface-900 border border-surface-700 rounded-xl p-6 text-center">
                <p className="text-surface-400 text-sm">
                  {search
                    ? "No topics match your search"
                    : "No topics available yet"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {filteredTopics.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => handleTopicClick(topic.slug)}
                    className="flex items-center gap-3 px-4 py-3 bg-surface-900 border border-surface-700 rounded-lg hover:border-surface-500 hover:bg-surface-800/80 transition-all cursor-pointer text-left group"
                  >
                    <Hash
                      size={16}
                      className="text-surface-500 group-hover:text-primary-400 transition-colors shrink-0"
                    />
                    <span className="text-sm text-surface-200 group-hover:text-surface-100 transition-colors truncate flex-1">
                      {topic.name}
                    </span>
                    <ChevronRight
                      size={14}
                      className="text-surface-600 group-hover:text-surface-400 transition-colors shrink-0"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* My topic requests */}
          {myRequests.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-3">
                My Suggestions
              </h2>
              <div className="space-y-2">
                {myRequests.map((req) => (
                  <div
                    key={req.id}
                    className="flex items-center gap-3 px-4 py-2.5 bg-surface-900 border border-surface-700 rounded-lg"
                  >
                    {statusIcon(req.status)}
                    <span className="text-sm text-surface-200 flex-1 truncate">
                      {req.name}
                    </span>
                    <span
                      className={`text-xs font-medium capitalize ${statusColor(req.status)}`}
                    >
                      {req.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
