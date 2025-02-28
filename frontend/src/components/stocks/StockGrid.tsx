import React from "react";
import StockCard from "./StockCard";
import { Stock, StockWithHistory } from "../utils/StockUtils";

interface StockGridProps {
  stocks: StockWithHistory[];
  addToWatchlist: (stock: Stock) => void;
}

const StockGrid: React.FC<StockGridProps> = ({ stocks, addToWatchlist }) => {
  if (stocks.length === 0) {
    return (
      <div className="empty-state">
        <p>No stocks available at the moment. Please check back later.</p>
      </div>
    );
  }

  return (
    <div className="stock-grid">
      {stocks.map((stock) => (
        <StockCard key={stock.symbol} stock={stock} addToWatchlist={addToWatchlist} />
      ))}
    </div>
  );
};

export default StockGrid;