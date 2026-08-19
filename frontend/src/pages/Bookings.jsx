import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { fetchMyBookings, updateBookingStatus, createReview } from "../api/index.js";
import { useAuth } from "../context/AuthContext.jsx";

const STATUS_STYLES = {
  pending: "bg-gold/10 text-gold border-gold/20",
  confirmed: "bg-moss/10 text-moss border-moss/20",
  completed: "bg-ink/5 text-ink/70 border-ink/10",
  cancelled: "bg-line/60 text-mute border-line",
  rejected: "bg-clay/10 text-clay border-clay/20",
};

const ReviewModal = ({ booking, onClose, onSubmitted }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    setSaving(true);
    try {
      await createReview({ bookingId: booking._id, rating, comment });
      toast.success("Review submitted");
      onSubmitted();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not submit review");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-ink/40 flex items-center justify-center p-5 z-50">
      <div className="bg-white rounded-ticket p-6 max-w-sm w-full">
        <h3 className="font-display text-lg font-bold mb-1">Rate the session</h3>
        <p className="text-sm text-mute mb-4">with {booking.teacher.name}</p>
        <div className="flex gap-1 mb-4">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} onClick={() => setRating(n)} className={`text-2xl ${n <= rating ? "text-gold" : "text-line"}`}>★</button>
          ))}
        </div>
        <textarea
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="How did it go?"
          className="input-field resize-none mb-4"
        />
        <div className="flex gap-2">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={submit} disabled={saving} className="btn-primary flex-1 disabled:opacity-60">
            {saving ? "Saving…" : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
};

const Bookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewTarget, setReviewTarget] = useState(null);

  const load = () => {
    setLoading(true);
    fetchMyBookings()
      .then(({ data }) => setBookings(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleStatus = async (id, status) => {
    try {
      await updateBookingStatus(id, status);
      toast.success(`Session ${status}`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update session");
    }
  };

  if (loading) return <div className="max-w-4xl mx-auto px-5 py-20 text-center text-mute font-display">Loading…</div>;

  return (
    <div className="max-w-4xl mx-auto px-5 py-12">
      <h1 className="font-display text-3xl font-bold mb-1">Sessions</h1>
      <p className="text-mute mb-8">Sessions you're teaching or attending.</p>

      {bookings.length === 0 ? (
        <div className="ticket p-10 text-center text-mute">No sessions yet. Browse skills to book one.</div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => {
            const isTeacher = b.teacher._id === user._id;
            const other = isTeacher ? b.learner : b.teacher;
            return (
              <div key={b._id} className="ticket p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-display font-semibold">{b.skill?.title}</h3>
                      <span className={`text-xs font-mono px-2 py-0.5 rounded-full border ${STATUS_STYLES[b.status]}`}>{b.status}</span>
                    </div>
                    <p className="text-sm text-mute">
                      {isTeacher ? "Teaching" : "Learning from"} <Link to={`/profile/${other._id}`} className="font-medium text-ink hover:text-clay">{other.name}</Link>
                      {" · "}
                      {format(new Date(b.scheduledAt), "MMM d, yyyy 'at' h:mm a")}
                      {" · "}
                      {b.durationMinutes} min
                    </p>
                    <p className="text-sm text-mute mt-0.5">
                      {b.isPaid ? `$${b.amount}` : `${b.creditsUsed} credit(s)`}
                    </p>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    {b.status === "pending" && isTeacher && (
                      <>
                        <button onClick={() => handleStatus(b._id, "confirmed")} className="btn-primary !px-3 !py-1.5 !text-sm">Confirm</button>
                        <button onClick={() => handleStatus(b._id, "rejected")} className="btn-secondary !px-3 !py-1.5 !text-sm">Decline</button>
                      </>
                    )}
                    {b.status === "confirmed" && (
                      <button onClick={() => handleStatus(b._id, "completed")} className="btn-secondary !px-3 !py-1.5 !text-sm">Mark completed</button>
                    )}
                    {(b.status === "pending" || b.status === "confirmed") && (
                      <button onClick={() => handleStatus(b._id, "cancelled")} className="text-sm text-mute hover:text-clay px-2">Cancel</button>
                    )}
                    {b.status === "completed" && !isTeacher && (
                      <button onClick={() => setReviewTarget(b)} className="btn-secondary !px-3 !py-1.5 !text-sm">Leave review</button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {reviewTarget && (
        <ReviewModal
          booking={reviewTarget}
          onClose={() => setReviewTarget(null)}
          onSubmitted={() => { setReviewTarget(null); load(); }}
        />
      )}
    </div>
  );
};

export default Bookings;
