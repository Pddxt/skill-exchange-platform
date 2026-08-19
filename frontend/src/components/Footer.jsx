import React from "react";
import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="border-t border-line mt-24">
    <div className="max-w-6xl mx-auto px-5 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
      <p className="font-display text-sm text-mute">
        Barter — trade time, not just money.
      </p>
      <div className="flex gap-6 text-sm text-mute">
        <Link to="/browse" className="hover:text-ink">Browse skills</Link>
        <Link to="/register" className="hover:text-ink">Join</Link>
      </div>
    </div>
  </footer>
);

export default Footer;
