import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowLeftRight, Clock, Users } from "lucide-react";
import { fetchSkills } from "../api/index.js";
import SkillCard from "../components/SkillCard.jsx";

const Home = () => {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    fetchSkills({ limit: 6 })
      .then(({ data }) => setFeatured(data.skills))
      .catch(() => {});
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-5 pt-16 pb-20">
        <div className="max-w-2xl">
          <span className="font-mono text-xs uppercase tracking-widest text-moss">Skill for skill, or skill for cash</span>
          <h1 className="font-display text-4xl sm:text-5xl font-bold leading-[1.1] mt-4 mb-6">
            Trade what you know <br /> for what you want to learn.
          </h1>
          <p className="text-mute text-lg mb-8 leading-relaxed">
            Barter is a marketplace of time. Teach a skill, earn a credit, spend it learning
            someone else's. Or skip the swap entirely and book a paid session — your call.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/browse" className="btn-primary inline-flex items-center gap-2">
              Browse skills <ArrowRight size={16} />
            </Link>
            <Link to="/register" className="btn-secondary">
              Create a free account
            </Link>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mt-16">
          <div className="ticket p-5">
            <ArrowLeftRight className="text-clay mb-3" size={22} />
            <h3 className="font-display font-semibold mb-1">Swap skills</h3>
            <p className="text-sm text-mute">Teach an hour, earn a credit. Spend it on any other skill in the marketplace.</p>
          </div>
          <div className="ticket p-5">
            <Clock className="text-moss mb-3" size={22} />
            <h3 className="font-display font-semibold mb-1">Or charge for it</h3>
            <p className="text-sm text-mute">List a paid session instead, and get paid directly for your time.</p>
          </div>
          <div className="ticket p-5">
            <Users className="text-gold mb-3" size={22} />
            <h3 className="font-display font-semibold mb-1">Real reviews</h3>
            <p className="text-sm text-mute">Every completed session can be rated, building real reputation over time.</p>
          </div>
        </div>
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <section className="max-w-6xl mx-auto px-5 pb-20">
          <div className="flex items-end justify-between mb-6">
            <h2 className="font-display text-2xl font-bold">Recently listed</h2>
            <Link to="/browse" className="text-sm font-display font-semibold text-clay flex items-center gap-1">
              See all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featured.map((skill) => (
              <SkillCard key={skill._id} skill={skill} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
