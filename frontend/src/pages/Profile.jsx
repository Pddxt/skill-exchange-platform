import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Star, MapPin, MessageSquare, Pencil } from "lucide-react";
import { fetchUserProfile, updateMyProfile } from "../api/index.js";
import { useAuth } from "../context/AuthContext.jsx";
import SkillCard from "../components/SkillCard.jsx";

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, updateUserCache } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", bio: "", location: "" });
  const [saving, setSaving] = useState(false);

  const isOwn = user && user._id === id;

  const load = () => {
    setLoading(true);
    fetchUserProfile(id)
      .then(({ data }) => {
        setData(data);
        setForm({ name: data.user.name, bio: data.user.bio || "", location: data.user.location || "" });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data: updated } = await updateMyProfile(form);
      updateUserCache(updated);
      toast.success("Profile updated");
      setEditing(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not save profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="max-w-4xl mx-auto px-5 py-20 text-center text-mute font-display">Loading…</div>;
  if (!data) return null;

  const { user: profile, reviews } = data;

  return (
    <div className="max-w-4xl mx-auto px-5 py-12">
      <div className="flex items-start justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <span className="w-16 h-16 rounded-full bg-moss/10 text-moss flex items-center justify-center font-display text-2xl font-bold">
            {profile.name[0]?.toUpperCase()}
          </span>
          <div>
            <h1 className="font-display text-2xl font-bold">{profile.name}</h1>
            <div className="flex items-center gap-3 text-sm text-mute mt-1">
              {profile.numReviews > 0 && (
                <span className="flex items-center gap-1"><Star size={14} className="fill-gold text-gold" /> {profile.rating} ({profile.numReviews} reviews)</span>
              )}
              {profile.location && <span className="flex items-center gap-1"><MapPin size={14} /> {profile.location}</span>}
              {isOwn && <span className="credit-stamp !text-xs">{profile.credits} credits</span>}
            </div>
          </div>
        </div>

        {isOwn ? (
          <button onClick={() => setEditing((v) => !v)} className="btn-secondary inline-flex items-center gap-1.5 !px-3 !py-2">
            <Pencil size={15} /> Edit
          </button>
        ) : user && (
          <button onClick={() => navigate(`/messages/${profile._id}`)} className="btn-primary inline-flex items-center gap-1.5">
            <MessageSquare size={16} /> Message
          </button>
        )}
      </div>

      {editing ? (
        <form onSubmit={handleSave} className="ticket p-5 space-y-4 mb-10 max-w-md">
          <div>
            <label className="block text-sm font-medium mb-1.5">Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Location</label>
            <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="input-field" placeholder="City, Country" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Bio</label>
            <textarea rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="input-field resize-none" />
          </div>
          <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">{saving ? "Saving…" : "Save profile"}</button>
        </form>
      ) : (
        profile.bio && <p className="text-ink/80 leading-relaxed mb-10 max-w-2xl">{profile.bio}</p>
      )}

      <h2 className="font-display text-xl font-bold mb-4">Skills offered</h2>
      {profile.skillsOffered?.length === 0 ? (
        <p className="text-mute text-sm mb-10">No active listings.</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-5 mb-12">
          {profile.skillsOffered.map((skill) => (
            <SkillCard key={skill._id} skill={{ ...skill, user: profile }} />
          ))}
        </div>
      )}

      <h2 className="font-display text-xl font-bold mb-4">Reviews</h2>
      {reviews.length === 0 ? (
        <p className="text-mute text-sm">No reviews yet.</p>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r._id} className="ticket p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="font-display font-semibold text-sm">{r.reviewer.name}</span>
                <span className="flex items-center gap-1 text-sm text-gold">
                  {"★".repeat(r.rating)}<span className="text-line">{"★".repeat(5 - r.rating)}</span>
                </span>
              </div>
              <p className="text-xs text-mute mb-2">on {r.skill?.title}</p>
              {r.comment && <p className="text-sm text-ink/80">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Profile;
