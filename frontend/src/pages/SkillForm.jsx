import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { createSkill, fetchSkillById, updateSkill } from "../api/index.js";
import { useAuth } from "../context/AuthContext.jsx";

const CATEGORIES = ["Programming", "Design", "Music", "Language", "Business", "Fitness", "Cooking", "Writing", "Marketing", "Other"];
const LEVELS = ["Any", "Beginner", "Intermediate", "Advanced"];

const emptyForm = {
  title: "",
  category: "Programming",
  description: "",
  level: "Any",
  isPaid: false,
  pricePerHour: "",
  tags: "",
};

const SkillForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    fetchSkillById(id)
      .then(({ data }) => {
        setForm({
          title: data.title,
          category: data.category,
          description: data.description,
          level: data.level,
          isPaid: data.isPaid,
          pricePerHour: data.pricePerHour || "",
          tags: (data.tags || []).join(", "),
        });
      })
      .catch(() => toast.error("Could not load listing"))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      pricePerHour: form.isPaid ? Number(form.pricePerHour) || 0 : 0,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
    };
    try {
      if (isEdit) {
        await updateSkill(id, payload);
        toast.success("Listing updated");
      } else {
        await createSkill(payload);
        toast.success("Skill listed!");
      }
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    navigate("/login");
    return null;
  }

  if (loading) return <div className="max-w-2xl mx-auto px-5 py-20 text-center text-mute font-display">Loading…</div>;

  return (
    <div className="max-w-2xl mx-auto px-5 py-12">
      <h1 className="font-display text-3xl font-bold mb-1">{isEdit ? "Edit listing" : "Offer a skill"}</h1>
      <p className="text-mute mb-8">Describe what you'll teach and how you'd like to be compensated.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">Title</label>
          <input name="title" required value={form.title} onChange={handleChange} className="input-field" placeholder="e.g. Intro to Watercolor Painting" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Category</label>
            <select name="category" value={form.category} onChange={handleChange} className="input-field">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Level</label>
            <select name="level" value={form.level} onChange={handleChange} className="input-field">
              {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Description</label>
          <textarea name="description" required rows={5} value={form.description} onChange={handleChange} className="input-field resize-none" placeholder="What will students learn? What should they bring or know beforehand?" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Tags (comma separated)</label>
          <input name="tags" value={form.tags} onChange={handleChange} className="input-field" placeholder="watercolor, painting, art" />
        </div>

        <div className="ticket p-4">
          <label className="flex items-center gap-2.5 cursor-pointer mb-3">
            <input type="checkbox" name="isPaid" checked={form.isPaid} onChange={handleChange} className="w-4 h-4 accent-clay" />
            <span className="font-display font-semibold text-sm">Charge real money instead of credits</span>
          </label>
          {form.isPaid ? (
            <div>
              <label className="block text-sm font-medium mb-1.5">Price per hour (USD)</label>
              <input type="number" name="pricePerHour" min="1" required value={form.pricePerHour} onChange={handleChange} className="input-field" placeholder="25" />
            </div>
          ) : (
            <p className="text-sm text-mute">Students will pay with time-credits (1 credit = 1 hour) instead of cash.</p>
          )}
        </div>

        <button type="submit" disabled={saving} className="btn-primary w-full disabled:opacity-60">
          {saving ? "Saving…" : isEdit ? "Save changes" : "Publish listing"}
        </button>
      </form>
    </div>
  );
};

export default SkillForm;
