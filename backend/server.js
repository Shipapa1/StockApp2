const express = require("express");         //import dependencies
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();                      /// access app express
const PORT = process.env.PORT || 5000;      //set the port #

app.use(cors());
app.use(bodyParser.json());                              //URL MongoDB
mongoose.connect("mongodb+srv://NathanStock:nathan.nguyen89@cluster0.xqvvmir.mongodb.net/Nathanstocks?retryWrites=true&w=majority", {                      
    useNewUrlParser: true,
    useUnifiedTopology: true,
})

const stockSchema = new mongoose.Schema(
    {
        company: String,
        description: String,
        initial_price: Number,
        symbol: String,
    },
    {collection: "stocks"}  // collection name
);

const Stock = mongoose.model("Stock", stockSchema);

//Get API to grab the Stock Data
app.get("/api/stocks", async (req,res)=>{   ///Get API call of stocks in the Backend
    try{
        const stocks = await Stock.find();
        res.json(stocks)
    } catch (error){
        console.error(error);
        res.status(500).json({error: "Internal Server Error"});
    }
});

//
const updatePrices = async () => {
    try {
        const stocks = await Stock.find();
        for (const stock of stocks) {
            // Generate a random price change between +0.01 and +0.10
            const randomChange = (Math.random() * 0.1 + 0.01).toFixed(2); // Random number in range [0.01, 0.10]
            
            // Randomly choose between adding or subtracting the change
            const changeDirection = Math.random() < 0.5 ? -1 : 1; // 50% chance to subtract or add

            // Update the stock price, ensuring it's not negative and keeping two decimal places
            stock.initial_price = Math.max(0, (stock.initial_price + changeDirection * parseFloat(randomChange)).toFixed(2));

            await stock.save();
        }
        console.log("Stock prices updated");
    } catch (error) {
        console.error("Error updating stock prices:", error);
    }
};

// Update stock prices every 5 seconds
setInterval(updatePrices, 3000);
///
app.post("/api/watchlist", async (req, res) => {
    try {
        const {
            company,
            description,
            initial_price,
            symbol,
        } = req.body;
        const stock = new Stock({
            company,
            description,
            initial_price,
            symbol,
        });
        await stock.save();
        res.json({ message: "Stock added to watchlist successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
///
app.listen(PORT, () => {
    console.log('Server running on port 5000');
});