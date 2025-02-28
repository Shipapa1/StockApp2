import React, { useState, useEffect, useCallback, useMemo } from "react";
import StockGrid from "./StockGrid";
import { useNotification } from "../context/NotificationContext";
import { Stock, StockWithHistory } from "../utils/StockUtils";

interface StocksPageProps {
  addToWatchlist: (stock: Stock) => void;
}

const StocksPage: React.FC<StocksPageProps> = ({ addToWatchlist }) => {
  const [stocks, setStocks] = useState<StockWithHistory[]>([]);
  const [previousPrices, setPreviousPrices] = useState<Record<string, number>>({});
  const [startPrices, setStartPrices] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotification();

  const fetchStocks = useCallback(() => {
    fetch("http://localhost:5000/api/stocks")
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
        return res.json();
      })
      .then((data: Stock[]) => {
        setLoading(false);
        setError(null);
        
        // Process start prices
        setStartPrices(prevStartPrices => {
          const newStartPrices = { ...prevStartPrices };
          data.forEach(stock => {
            if (newStartPrices[stock.symbol] === undefined) {
              newStartPrices[stock.symbol] = stock.initial_price;
            }
          });
          
          return newStartPrices;
        });
        
        // Update stocks with history
        setStocks(prevStocks => {
          const existingStocksMap = prevStocks.reduce((map, stock) => {
            map[stock.symbol] = stock;
            return map;
          }, {} as Record<string, StockWithHistory>);
          
          return data.map((stock) => {
            const previousPrice = previousPrices[stock.symbol] || stock.initial_price;
            const priceChange = stock.initial_price - previousPrice;
            const startPrice = startPrices[stock.symbol] || stock.initial_price;
            const totalChange = (stock.initial_price - startPrice);
            const totalChangePercent = (totalChange / startPrice) * 100;
            const existingStock = existingStocksMap[stock.symbol];
            const history = existingStock?.history || [];
            const newHistory = [
              ...history, 
              { time: new Date().toLocaleTimeString(), price: stock.initial_price }
            ].slice(-10);

            return {
              ...stock,
              priceChange,
              history: newHistory,
              startPrice,
              totalChange,
              totalChangePercent
            };
          });
        });
        
        // Update previous prices
        setPreviousPrices(data.reduce((prices, stock) => {
          prices[stock.symbol] = stock.initial_price;
          return prices;
        }, {} as Record<string, number>));
      })
      .catch((error) => {
        setLoading(false);
        setError(error.message);
        showNotification('error', `Error: ${error.message}`);
        console.error("Error fetching stocks:", error);
      });
  }, [previousPrices, startPrices, showNotification]);  // Removed 'stocks' from dependency array

  useEffect(() => {
    fetchStocks();
    const intervalId = setInterval(fetchStocks, 3000);
    return () => clearInterval(intervalId);
  }, [fetchStocks]);

  const uniqueStocks = useMemo(() => 
    Array.from(new Map(stocks.map(stock => [stock.symbol, stock])).values()).slice(0, 9), 
    [stocks]
  );

  if (loading) {
    return (
      <div className="main-container">
        <h1>Market Dashboard</h1>
        <div className="loading-state">
          <p>Loading stock data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="main-container">
        <h1>Market Dashboard</h1>
        <div className="error-state">
          <p>Failed to load stock data. Please try again later.</p>
          <button onClick={fetchStocks} className="retry-btn">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="main-container">
      <h1>Market Dashboard</h1>
      <h2>Live Stock Prices</h2>
      <StockGrid stocks={uniqueStocks} addToWatchlist={addToWatchlist} />
    </div>
  );
};

export default StocksPage;