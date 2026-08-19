import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { ArrowLeftRight, MessageSquare, User, LogOut, Plus } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const navLinkClass = ({ isActive }) =>
  `font-display text-sm font-semibold transition-colors ${
    isActive ? "text-clay" : "text-ink/70 hover:text-ink"
  }`;

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 bg-paper/95 backdrop-blur border-b border-line">
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="w-8 h-8 rounded-full bg-ink text-paper flex items-center justify-center">
            <ArrowLeftRight size={16} />
          </span>
          <span className="font-display text-lg font-bold tracking-tight">Barter</span>
        </Link>

        <nav className="hidden md:flex items-center gap-7">
          <NavLink to="/browse" className={navLinkClass}>
            Browse skills
          </NavLink>
          {user && (
            <>
              <NavLink to="/bookings" className={navLinkClass}>
                Sessions
              </NavLink>
              <NavLink to="/messages" className={navLinkClass}>
                Messages
              </NavLink>
              <NavLink to="/dashboard" className={navLinkClass}>
                My listings
              </NavLink>
            </>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="credit-stamp hidden sm:inline-flex" title="Time credits">
                {user.credits ?? 0} credits
              </span>
              <Link to="/skills/new" className="btn-secondary !px-3 !py-2 hidden sm:inline-flex items-center gap-1.5">
                <Plus size={16} /> Offer a skill
              </Link>
              <Link to="/messages" className="text-ink/70 hover:text-ink md:hidden">
                <MessageSquare size={20} />
              </Link>
              <Link to={`/profile/${user._id}`} className="text-ink/70 hover:text-ink" title="My profile">
                <User size={20} />
              </Link>
              <button onClick={handleLogout} className="text-ink/70 hover:text-clay" title="Log out">
                <LogOut size={20} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary !px-4 !py-2">
                Log in
              </Link>
              <Link to="/register" className="btn-primary !px-4 !py-2">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
