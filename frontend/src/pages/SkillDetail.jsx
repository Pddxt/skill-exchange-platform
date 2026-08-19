import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Star, Clock, DollarSign, MapPin } from "lucide-react";
import { fetchSkillById, createBooking } from "../api/index.js";
import { useAuth } from "../context/AuthContext.jsx";

const SkillDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [skill, setSkill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [form, setForm] = useState({ scheduledAt: "", durationMinutes: 60, notes: "" });

  useEffect(() => {
    fetchSkillById(id)
      .then(({ data }) => setSkill(data))
      .catch(() => toast.error("Skill not found"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleBook = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate("/login");
      return;
    }
    if (!form.scheduledAt) {
      toast.error("Pick a date and time first");
      return;
    }
    setBooking(true);
    try {
      await createBooking({ skillId: id, ...form });
      toast.success("Session requested! Check your bookings for status.");
      navigate("/bookings");
    } catch (err) {
      toast.error(err.response?.data?.message || "Booking failed");
    } finally {
      setBooking(false);
    }
  };

  if (loading) return <div className="max-w-4xl mx-auto px-5 py-20 text-center text-mute font-display">Loading…</div>;
  if (!skill) return <div className="max-w-4xl mx-auto px-5 py-20 text-center text-mute font-display">Skill not found.</div>;

  const teacher = skill.user;
  const hours = form.durationMinutes / 60;
  const isOwner = user && user._id === teacher?._id;

  return (
    <div className="max-w-4xl mx-auto px-5 py-12 grid md:grid-cols-3 gap-10">
      <div className="md:col-span-2">
        <span className="text-xs font-mono uppercase tracking-wider text-mute">{skill.category}</span>
        <h1 className="font-display text-3xl font-bold mt-2 mb-4">{skill.title}</h1>

        <div className="flex items-center gap-3 mb-6">
          <Link to={`/profile/${teacher._id}`} className="w-10 h-10 rounded-full bg-moss/10 text-moss flex items-center justify-center font-display font-bold">
            {teacher.name?.[0]?.toUpperCase()}
          </Link>
          <div>
            <Link to={`/profile/${teacher._id}`} className="font-display font-semibold hover:text-clay">{teacher.name}</Link>
            <div className="flex items-center gap-3 text-sm text-mute">
              {teacher.numReviews > 0 && (
                <span className="flex items-center gap-1"><Star size={13} className="fill-gold text-gold" /> {teacher.rating} ({teacher.numReviews})</span>
              )}
              {teacher.location && <span className="flex items-center gap-1"><MapPin size={13} /> {teacher.location}</span>}
            </div>
          </div>
        </div>

        <p className="text-ink/80 leading-relaxed whitespace-pre-line mb-6">{skill.description}</p>

        {skill.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {skill.tags.map((t) => (
              <span key={t} className="text-xs font-mono bg-line/60 px-2.5 py-1 rounded-full text-mute">#{t}</span>
            ))}
          </div>
        )}

        {teacher.bio && (
          <div className="ticket p-5">
            <h3 className="font-display font-semibold mb-1.5">About {teacher.name?.split(" ")[0]}</h3>
            <p className="text-sm text-mute leading-relaxed">{teacher.bio}</p>
          </div>
        )}
      </div>

      <div>
        <div className="ticket p-5 sticky top-24">
          <div className="flex items-center justify-between mb-4">
            <span className="font-display font-semibold">Level</span>
            <span className="text-sm text-mute">{skill.level}</span>
          </div>

          {skill.isPaid ? (
            <div className="flex items-center gap-2 mb-5 text-gold font-display font-bold text-xl">
              <DollarSign size={20} /> {skill.pricePerHour}/hr
            </div>
          ) : (
            <div className="flex items-center gap-2 mb-5 text-moss font-display font-bold text-xl">
              <Clock size={20} /> 1 credit/hr
            </div>
          )}

          {isOwner ? (
            <p className="text-sm text-mute">This is your own listing — manage it from your dashboard.</p>
          ) : (
            <form onSubmit={handleBook} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-mute mb-1">Date & time</label>
                <input
                  type="datetime-local"
                  required
                  value={form.scheduledAt}
                  onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-mute mb-1">Duration</label>
                <select
                  value={form.durationMinutes}
                  onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })}
                  className="input-field"
                >
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={90}>1.5 hours</option>
                  <option value={120}>2 hours</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-mute mb-1">Note (optional)</label>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="input-field resize-none"
                  placeholder="What do you want to focus on?"
                />
              </div>

              <div className="text-sm text-mute pt-1">
                Total: {skill.isPaid ? `$${(skill.pricePerHour * hours).toFixed(2)}` : `${Math.ceil(hours)} credit(s)`}
              </div>

              <button type="submit" disabled={booking} className="btn-primary w-full disabled:opacity-60">
                {booking ? "Requesting…" : "Request session"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SkillDetail;
