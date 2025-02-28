// src/types.ts

export interface Stock {
    symbol: string;
    name: string;
    initial_price?: number;
    price: number;
    history?: { date: string; price: number }[]; // History array
  }
  
  export interface StockWithHistory extends Stock {
    history: { date: string; price: number }[]; // Explicitly ensuring history is an array
  }
  