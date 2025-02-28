// App.tsx
import React, { useState, useEffect, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

// Components
import NotificationProvider from "./components/common/NotificationProvider";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import StocksPage from "./components/stocks/StocksPage";
import WatchlistPage from "./components/watchlist/WatchlistPage";

// Hooks and Types
import { useNotification } from "./components/context/NotificationContext";
import { Stock } from "./components/utils/StockUtils";

function App() {
  const [watchlist, setWatchlist] = useState<Stock[]>([]);
  const { showNotification } = useNotification();

  const addToWatchlist = useCallback((stock: Stock) => {
    if (watchlist.some(item => item.symbol === stock.symbol)) {
      showNotification('warning', "Already in your watchlist");
      return;
    }
    
    setWatchlist(prevWatchlist => [...prevWatchlist, stock]);
    showNotification('success', "Added to watchlist");
  }, [watchlist, showNotification]);

  const removeFromWatchlist = useCallback((symbol: string) => {
    setWatchlist(prevWatchlist => 
      prevWatchlist.filter(stock => stock.symbol !== symbol)
    );
    showNotification('success', 'Stock removed from watchlist');
  }, [showNotification]);

  //
  // const fetchWatchlist = useCallback(() => {
  //   fetch("http://localhost:5000/api/watchlist")
  //     .then((res) => {
  //       if (!res.ok) throw new Error(`Failed to fetch watchlist: ${res.status}`);
  //       return res.json();
  //     })
  //     .then((data) => {
  //       setWatchlist(data);
  //     })
  //     .catch((error) => {
  //       showNotification("error", `Error: ${error.message}`);
  //       console.error("Error fetching watchlist:", error);
  //     });
  // }, [showNotification]);

  // useEffect(() => {
  //   fetchWatchlist();
  // }, [fetchWatchlist]);

  // const addToWatchlist = useCallback(
  //   (stock: Stock) => {
  //     if (watchlist.some((item) => item.symbol === stock.symbol)) {
  //       showNotification("warning", "Already in your watchlist");
  //       return;
  //     }

  //     fetch("http://localhost:5000/api/watchlist", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(stock),
  //     })
  //       .then((res) => {
  //         if (!res.ok) throw new Error(`Failed to add: ${res.status}`);
  //         return res.json();
  //       })
  //       .then((data) => {
  //         showNotification("success", data.message || "Added to watchlist");
  //         setWatchlist([...watchlist, stock]);
  //       })
  //       .catch((error) => {
  //         showNotification("error", `Error: ${error.message}`);
  //       });
  //   },
  //   [watchlist, showNotification]
  // );
  //
  return (
    <NotificationProvider>
      <Router>
        <div className="app-container">
          <Header />
          <main>
            <Routes>
              <Route path="/stocks" element={<StocksPage addToWatchlist={addToWatchlist} />} />
              <Route 
                path="/watchlist" 
                element={
                  <WatchlistPage 
                    watchlist={watchlist} 
                    removeFromWatchlist={removeFromWatchlist}
                  />
                } 
              />
              <Route path="/" element={<Navigate to="/stocks" replace />} />
              <Route path="*" element={<Navigate to="/stocks" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </NotificationProvider>
  );
}

export default App;