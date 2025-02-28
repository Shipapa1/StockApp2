// WatchlistItem.tsx
import React from "react";
import { Stock } from "../utils/StockUtils";

interface WatchlistItemProps {
  stock: Stock;
  onRemove: (symbol: string) => void;
}

const WatchlistItem: React.FC<WatchlistItemProps> = ({ stock, onRemove }) => {
  return (
    <div className="watchlist-item">
      <div className="watchlist-content">
        <h3>{stock.company} ({stock.symbol})</h3>
        <span className="watchlist-price">${stock.initial_price.toFixed(2)}</span>
      </div>
      <button className="remove-btn" onClick={() => onRemove(stock.symbol)}>
        Remove
      </button>
    </div>
  );
};

export default WatchlistItem;