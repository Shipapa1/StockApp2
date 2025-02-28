// Types
export interface Stock {
    symbol: string;
    company: string;
    initial_price: number;
    priceChange?: number;
  }
  
  export interface PriceHistory {
    time: string;
    price: number;
  }
  
  export interface StockWithHistory extends Stock {
    history: PriceHistory[];
    startPrice?: number;
    totalChange?: number;
    totalChangePercent?: number;
  }
  
  // Utility Functions
  export const getPriceColor = (priceChange: number) => 
    priceChange > 0 ? "#4CAF50" : priceChange < 0 ? "#F44336" : "#757575";