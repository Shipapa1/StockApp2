import React from "react";
import { NavLink } from "react-router-dom";

const Header: React.FC = () => {
  return (
    <header className="main-header">
      <div className="logo">StockTracker Pro</div>
      <nav>
        <NavLink to="/stocks" className={({ isActive }) => isActive ? "active" : ""}>
          Market View
        </NavLink>
        <NavLink to="/watchlist" className={({ isActive }) => isActive ? "active" : ""}>
          My Watchlist
        </NavLink>
      </nav>
    </header>
  );
};

export default Header;