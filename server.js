require("dotenv").config();
const app = require("./src/app");
const connectDB = require("./src/config/db");
const express=require("express")
connectDB();

const cors = require('cors');

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(cors({
  origin: ["http://localhost:5173", "https://gainlabz.onrender.com/"] ,// Your Static Site URL
  credentials: true
}));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
