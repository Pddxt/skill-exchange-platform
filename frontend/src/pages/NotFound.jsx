import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => (
  <div className="max-w-md mx-auto px-5 py-28 text-center">
    <p className="font-mono text-clay text-sm mb-2">404</p>
    <h1 className="font-display text-2xl font-bold mb-3">Page not found</h1>
    <p className="text-mute mb-6">That ticket doesn't exist, or it's already been redeemed.</p>
    <Link to="/" className="btn-primary inline-block">Back home</Link>
  </div>
);

export default NotFound;
