// WatchlistPage.tsx
import React from "react";
import WatchlistItem from "./WatchlistItem";
import { Stock } from "../utils/StockUtils";

interface WatchlistPageProps {
  watchlist: Stock[];
  removeFromWatchlist: (symbol: string) => void;
}

const WatchlistPage: React.FC<WatchlistPageProps> = ({ watchlist, removeFromWatchlist }) => {
  return (
    <div className="main-container">
      <h1>Market Dashboard</h1>
      <h2>My Watchlist</h2>
      {watchlist.length === 0 ? (
        <div className="empty-state">
          <p>Your watchlist is empty. Add stocks from the market view.</p>
        </div>
      ) : (
        <div className="watchlist-container">
          {watchlist.map((stock) => (
            <WatchlistItem
              key={stock.symbol}
              stock={stock}
              onRemove={removeFromWatchlist}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default WatchlistPage;