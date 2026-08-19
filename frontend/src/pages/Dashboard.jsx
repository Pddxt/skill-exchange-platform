import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { fetchMySkills, deleteSkill, updateSkill } from "../api/index.js";

const Dashboard = () => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetchMySkills()
      .then(({ data }) => setSkills(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this listing? This can't be undone.")) return;
    try {
      await deleteSkill(id);
      toast.success("Listing removed");
      setSkills((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not remove listing");
    }
  };

  const handleToggleActive = async (skill) => {
    try {
      const { data } = await updateSkill(skill._id, { isActive: !skill.isActive });
      setSkills((prev) => prev.map((s) => (s._id === skill._id ? data : s)));
    } catch (err) {
      toast.error("Could not update listing");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-5 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold mb-1">My listings</h1>
          <p className="text-mute">Manage the skills you offer.</p>
        </div>
        <Link to="/skills/new" className="btn-primary inline-flex items-center gap-1.5">
          <Plus size={16} /> New listing
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-16 text-mute font-display">Loading…</div>
      ) : skills.length === 0 ? (
        <div className="ticket p-10 text-center">
          <p className="text-mute mb-4">You haven't listed any skills yet.</p>
          <Link to="/skills/new" className="btn-primary inline-flex items-center gap-1.5">
            <Plus size={16} /> Offer your first skill
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {skills.map((skill) => (
            <div key={skill._id} className="ticket p-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-display font-semibold truncate">{skill.title}</h3>
                  {!skill.isActive && (
                    <span className="text-xs font-mono bg-line/60 text-mute px-2 py-0.5 rounded-full">Hidden</span>
                  )}
                </div>
                <p className="text-sm text-mute">
                  {skill.category} · {skill.isPaid ? `$${skill.pricePerHour}/hr` : "Credit swap"}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => handleToggleActive(skill)} className="p-2 text-mute hover:text-ink" title={skill.isActive ? "Hide listing" : "Show listing"}>
                  {skill.isActive ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
                <Link to={`/skills/${skill._id}/edit`} className="p-2 text-mute hover:text-ink" title="Edit">
                  <Pencil size={18} />
                </Link>
                <button onClick={() => handleDelete(skill._id)} className="p-2 text-mute hover:text-clay" title="Delete">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
