import React from "react";
import { Link } from "react-router-dom";
import { Star, Clock, DollarSign } from "lucide-react";

const SkillCard = ({ skill }) => {
  const teacher = skill.user || {};

  return (
    <Link to={`/skills/${skill._id}`} className="ticket block p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-150">
      <div className="flex items-start justify-between gap-3 mb-3">
        <span className="text-xs font-mono uppercase tracking-wider text-mute">{skill.category}</span>
        {skill.isPaid ? (
          <span className="inline-flex items-center gap-1 text-xs font-mono font-semibold text-gold bg-gold/10 px-2 py-0.5 rounded-full border border-gold/20">
            <DollarSign size={12} /> ${skill.pricePerHour}/hr
          </span>
        ) : (
          <span className="credit-stamp !py-0.5 !text-xs">
            <Clock size={12} /> 1 credit/hr
          </span>
        )}
      </div>

      <h3 className="font-display text-lg font-semibold leading-snug mb-1.5">{skill.title}</h3>
      <p className="text-sm text-mute line-clamp-2 mb-4">{skill.description}</p>

      <div className="flex items-center justify-between pt-3 border-t border-dashed border-line">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-moss/10 text-moss flex items-center justify-center font-display text-xs font-bold">
            {teacher.name?.[0]?.toUpperCase() || "?"}
          </span>
          <span className="text-sm font-medium">{teacher.name || "Unknown"}</span>
        </div>
        {teacher.numReviews > 0 && (
          <div className="flex items-center gap-1 text-sm text-mute">
            <Star size={14} className="fill-gold text-gold" />
            {teacher.rating} ({teacher.numReviews})
          </div>
        )}
      </div>
    </Link>
  );
};

export default SkillCard;
