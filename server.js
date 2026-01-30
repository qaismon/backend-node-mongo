require("dotenv").config();
const app = require("./src/app");
const connectDB = require("./src/config/db");

connectDB();

const cors = require('cors');

app.use(cors({
  origin: "https://gainlabz.onrender.com/" // Your Static Site URL
}));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
