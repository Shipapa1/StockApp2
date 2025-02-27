import React, { useState, useEffect, useCallback, useMemo, createContext, useContext } from "react";
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import "./App.css";

// Types
type NotificationType = 'success' | 'warning' | 'error' | 'info';
interface NotificationContextType {
  showNotification: (type: NotificationType, message: string, duration?: number) => void;
}
interface Stock {
  symbol: string;
  company: string;
  initial_price: number;
  priceChange?: number;
}
interface PriceHistory {
  time: string;
  price: number;
}
interface StockWithHistory extends Stock {
  history: PriceHistory[];
  startPrice?: number;
  totalChange?: number;
  totalChangePercent?: number;
}

// Context
const NotificationContext = createContext<NotificationContextType>({
  showNotification: () => {}
});
const useNotification = () => useContext(NotificationContext);

// Notification Components
const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Array<{ id: number; type: NotificationType; message: string; duration: number }>>([]);
  const nextId = React.useRef(0);

  const showNotification = (type: NotificationType, message: string, duration = 3000) => {
    const id = nextId.current++;
    setNotifications(prev => [...prev, { id, type, message, duration }]);
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <div className="notification-container">
        {notifications.map(({ id, type, message, duration }) => (
          <Notification 
            key={id}
            type={type}
            message={message}
            duration={duration}
            onClose={() => setNotifications(prev => prev.filter(n => n.id !== id))}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

const Notification: React.FC<{
  type: NotificationType;
  message: string;
  duration: number;
  onClose: () => void;
}> = ({ type, message, duration, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const showTimer = setTimeout(() => setVisible(true), 100);
    const hideTimer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, duration);
    
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [duration, onClose]);
  
  return (
    <div className={`notification ${type} ${visible ? 'show' : ''}`}>
      {message}
    </div>
  );
};

// Utility Functions
const getPriceColor = (priceChange: number) => 
  priceChange > 0 ? "#4CAF50" : priceChange < 0 ? "#F44336" : "#757575";

// Stocks Component
const Stocks = ({ addToWatchlist }: { addToWatchlist: (stock: Stock) => void }) => {
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
        
        const newStartPrices = { ...startPrices };
        data.forEach(stock => {
          if (newStartPrices[stock.symbol] === undefined) {
            newStartPrices[stock.symbol] = stock.initial_price;
          }
        });
        
        if (Object.keys(newStartPrices).length !== Object.keys(startPrices).length) {
          setStartPrices(newStartPrices);
        }
        
        const existingStocksMap = stocks.reduce((map, stock) => {
          map[stock.symbol] = stock;
          return map;
        }, {} as Record<string, StockWithHistory>);
        
        const updatedStocks = data.map((stock) => {
          const previousPrice = previousPrices[stock.symbol] || stock.initial_price;
          const priceChange = stock.initial_price - previousPrice;
          const startPrice = newStartPrices[stock.symbol];
          const totalChange = startPrice ? (stock.initial_price - startPrice) : 0;
          const totalChangePercent = startPrice ? (totalChange / startPrice) * 100 : 0;
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
        
        const newPreviousPrices = data.reduce((prices, stock) => {
          prices[stock.symbol] = stock.initial_price;
          return prices;
        }, {} as Record<string, number>);
        
        setPreviousPrices(newPreviousPrices);
        setStocks(updatedStocks);
      })
      .catch((error) => {
        setLoading(false);
        setError(error.message);
        showNotification('error', `Error: ${error.message}`);
        console.error("Error fetching stocks:", error);
      });
  }, [previousPrices, startPrices, stocks, showNotification]);

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
      {uniqueStocks.length === 0 ? (
        <div className="empty-state">
          <p>No stocks available at the moment. Please check back later.</p>
        </div>
      ) : (
        <div className="stock-grid">
          {uniqueStocks.map((stock) => (
            <div key={stock.symbol} className="stock-card">
              <div className="stock-header">
                <h3>{stock.company} ({stock.symbol})</h3>
                <button className="watchlist-btn" onClick={() => addToWatchlist(stock)}>
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
          ))}
        </div>
      )}
    </div>
  );
};

// Watchlist Component
const Watchlist = ({ watchlist, refreshWatchlist }: { watchlist: Stock[], refreshWatchlist: () => void }) => {
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();

  const removeFromWatchlist = (symbol: string) => {
    setLoading(true);
    fetch(`http://localhost:5000/api/watchlist/${symbol}`, {
      method: "DELETE",
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to remove: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        showNotification('success', data.message || 'Stock removed from watchlist');
        refreshWatchlist();
      })
      .catch((error) => {
        showNotification('error', `Error: ${error.message}`);
        console.error("Error removing from watchlist:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="main-container">
      <h1>Market Dashboard</h1>
      <h2>My Watchlist</h2>
      {loading ? (
        <div className="loading-state"><p>Updating watchlist...</p></div>
      ) : watchlist.length === 0 ? (
        <div className="empty-state"><p>Your watchlist is empty. Add stocks from the market view.</p></div>
      ) : (
        <div className="watchlist-container">
          {watchlist.map((stock) => (
            <div key={stock.symbol} className="watchlist-item">
              <div className="watchlist-content">
                <h3>{stock.company} ({stock.symbol})</h3>
                <span className="watchlist-price">${stock.initial_price.toFixed(2)}</span>
              </div>
              <button className="remove-btn" onClick={() => removeFromWatchlist(stock.symbol)}>
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Main App Component
function App() {
  const [watchlist, setWatchlist] = useState<Stock[]>([]);
  const [watchlistLoading, setWatchlistLoading] = useState(true);
  const { showNotification } = useNotification();

  const fetchWatchlist = useCallback(() => {
    setWatchlistLoading(true);
    fetch("http://localhost:5000/api/watchlist")
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch watchlist: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setWatchlist(data);
      })
      .catch((error) => {
        showNotification('error', `Error: ${error.message}`);
        console.error("Error fetching watchlist:", error);
      })
      .finally(() => {
        setWatchlistLoading(false);
      });
  }, [showNotification]);

  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  const addToWatchlist = useCallback((stock: Stock) => {
    if (watchlist.some(item => item.symbol === stock.symbol)) {
      showNotification('warning', "Already in your watchlist");
      return;
    }

    fetch("http://localhost:5000/api/watchlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(stock),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to add: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        showNotification('success', data.message || "Added to watchlist");
        setWatchlist([...watchlist, stock]);
      })
      .catch((error) => {
        showNotification('error', `Error: ${error.message}`);
        console.error("Error adding to watchlist:", error);
      });
  }, [watchlist, showNotification]);

  return (
    <NotificationProvider>
      <Router>
        <div className="app-container">
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
          <main>
            <Routes>
              <Route path="/stocks" element={<Stocks addToWatchlist={addToWatchlist} />} />
              <Route path="/watchlist" element={<Watchlist watchlist={watchlist} refreshWatchlist={fetchWatchlist} />} />
              <Route path="/" element={<Navigate to="/stocks" replace />} />
              <Route path="*" element={<Navigate to="/stocks" replace />} />
            </Routes>
          </main>
          <footer className="main-footer">
            <p>© 2025 StockTracker Pro - Real-time market data</p>
          </footer>
        </div>
      </Router>
    </NotificationProvider>
  );
}

export default App;