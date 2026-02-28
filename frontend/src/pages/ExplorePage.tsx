import { useEffect, useState } from "react";
import { Search, Hash } from "lucide-react";
import api from "../api/axios";
import type { Category, Topic, PaginatedResponse } from "../types";

// Color palette for categories
const colorPalette = [
  "from-red-500/20 to-red-500/5",
  "from-purple-500/20 to-purple-500/5",
  "from-amber-500/20 to-amber-500/5",
  "from-green-500/20 to-green-500/5",
  "from-blue-500/20 to-blue-500/5",
  "from-orange-500/20 to-orange-500/5",
  "from-emerald-500/20 to-emerald-500/5",
  "from-cyan-500/20 to-cyan-500/5",
  "from-pink-500/20 to-pink-500/5",
  "from-sky-500/20 to-sky-500/5",
  "from-violet-500/20 to-violet-500/5",
  "from-lime-500/20 to-lime-500/5",
];

export default function ExplorePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
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
      } catch {
        // API not available
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredTopics = topics.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === null || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getTopicCount = (categoryId: number) =>
    topics.filter((t) => t.category === categoryId).length;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-surface-100">Explore</h1>
        <p className="text-surface-400 mt-1">
          Discover topics and join conversations
        </p>
      </div>

      {/* Search bar */}
      <div className="relative max-w-lg">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500"
        />
        <input
          type="text"
          placeholder="Search topics..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-surface-900 border border-surface-700 rounded-xl text-surface-100 placeholder-surface-500 text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
        />
      </div>

      {loading ? (
        <div className="text-surface-500 text-sm">Loading categories and topics...</div>
      ) : (
        <>
          {/* Categories grid */}
          <div>
            <h2 className="text-lg font-semibold text-surface-200 mb-4">Categories</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {categories.map((cat, i) => (
                <div
                  key={cat.id}
                  onClick={() =>
                    setSelectedCategory(
                      selectedCategory === cat.id ? null : cat.id
                    )
                  }
                  className={`bg-gradient-to-br ${
                    colorPalette[i % colorPalette.length]
                  } border rounded-xl p-5 hover:border-surface-500 transition-all cursor-pointer group ${
                    selectedCategory === cat.id
                      ? "border-primary-500 ring-1 ring-primary-500"
                      : "border-surface-700"
                  }`}
                >
                  <h3 className="text-surface-100 font-semibold group-hover:text-primary-400 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-surface-500 text-sm mt-1 flex items-center gap-1">
                    <Hash size={14} />
                    {getTopicCount(cat.id)} topics
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Topics list */}
          <div>
            <h2 className="text-lg font-semibold text-surface-200 mb-4">
              Topics
              {selectedCategory !== null && (
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="ml-2 text-sm text-primary-400 hover:text-primary-300 bg-transparent border-none cursor-pointer font-normal"
                >
                  (show all)
                </button>
              )}
            </h2>
            {filteredTopics.length === 0 ? (
              <div className="bg-surface-900 border border-surface-700 rounded-xl p-6 text-center">
                <p className="text-surface-400">
                  {search ? "No topics match your search" : "No topics available yet"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredTopics.map((topic) => {
                  const cat = categories.find((c) => c.id === topic.category);
                  return (
                    <div
                      key={topic.id}
                      className="bg-surface-900 border border-surface-700 rounded-xl p-4 hover:border-surface-600 transition-colors cursor-pointer"
                    >
                      <h3 className="text-surface-100 font-medium">{topic.name}</h3>
                      {cat && (
                        <p className="text-surface-500 text-xs mt-1">{cat.name}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
