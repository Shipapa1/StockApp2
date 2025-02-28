import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Stock, StockWithHistory, getPriceColor } from "../utils/StockUtils";

interface StockCardProps {
  stock: StockWithHistory;
  addToWatchlist: (stock: Stock) => void;
}

const StockCard: React.FC<StockCardProps> = ({ stock, addToWatchlist }) => {
  return (
    <div className="stock-card">
      <div className="stock-header">
        <h3>{stock.company} ({stock.symbol})</h3>
        <button 
          className="watchlist-btn" 
          onClick={() => addToWatchlist(stock)}
        >
          Add to Watchlist
        </button>
      </div>
      <div className="stock-price">
        <span className="price-label">Current Price:</span>
        <span className="price-value" style={{ color: getPriceColor(stock.priceChange || 0) }}>
          ${stock.initial_price.toFixed(2)}
          {stock.priceChange !== undefined && stock.priceChange !== 0 && (
            <span className="price-change">
              {stock.priceChange > 0 ? "↑" : "↓"}
              {Math.abs(stock.priceChange).toFixed(2)}
            </span>
          )}
        </span>
      </div>
      <div className="total-change">
        <span className="total-label">Since first view:</span>
        <span className="total-value" style={{ color: getPriceColor(stock.totalChange || 0) }}>
          ${(stock.totalChange || 0).toFixed(2)} ({(stock.totalChangePercent || 0).toFixed(2)}%)
        </span>
      </div>
      <div className="stock-chart">
        <ResponsiveContainer width="100%" height={150}>
          <LineChart data={stock.history}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 10 }}
              interval="preserveStartEnd"
              tickFormatter={(value) => value.split(':')[0] + ':' + value.split(':')[1]}
            />
            <YAxis domain={['dataMin - 5', 'dataMax + 5']} tick={{ fontSize: 10 }} />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke={getPriceColor(stock.totalChange || 0)} 
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StockCard;