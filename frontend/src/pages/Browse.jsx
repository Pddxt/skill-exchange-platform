import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { fetchSkills } from "../api/index.js";
import SkillCard from "../components/SkillCard.jsx";

const CATEGORIES = [
  "All",
  "Programming",
  "Design",
  "Music",
  "Language",
  "Business",
  "Fitness",
  "Cooking",
  "Writing",
  "Marketing",
  "Other",
];

const Browse = () => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [mode, setMode] = useState("all"); // all | free | paid
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    const params = { page, limit: 9 };
    if (search) params.search = search;
    if (category !== "All") params.category = category;
    if (mode === "free") params.isPaid = "false";
    if (mode === "paid") params.isPaid = "true";

    const timeout = setTimeout(() => {
      fetchSkills(params)
        .then(({ data }) => {
          setSkills(data.skills);
          setPages(data.pages);
        })
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timeout);
  }, [search, category, mode, page]);

  return (
    <div className="max-w-6xl mx-auto px-5 py-12">
      <h1 className="font-display text-3xl font-bold mb-2">Browse skills</h1>
      <p className="text-mute mb-8">Find someone teaching what you want to learn.</p>

      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-mute" size={18} />
          <input
            type="text"
            placeholder="Search skills, e.g. 'guitar' or 'python'"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input-field !pl-10"
          />
        </div>
        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          className="input-field md:w-48"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          value={mode}
          onChange={(e) => { setMode(e.target.value); setPage(1); }}
          className="input-field md:w-40"
        >
          <option value="all">All sessions</option>
          <option value="free">Credit swap</option>
          <option value="paid">Paid only</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-20 text-mute font-display">Loading skills…</div>
      ) : skills.length === 0 ? (
        <div className="text-center py-20 text-mute font-display">
          No skills found. Try a different search.
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {skills.map((skill) => (
              <SkillCard key={skill._id} skill={skill} />
            ))}
          </div>

          {pages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-ticket font-mono text-sm font-semibold ${
                    p === page ? "bg-ink text-paper" : "border border-line text-mute hover:border-ink/40"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Browse;
