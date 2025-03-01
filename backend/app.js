import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { connectDB } from "./DB/Database.js";
import transactionRoutes from "./Routers/Transactions.js";
import userRoutes from "./Routers/userRouter.js";

// Load environment variables
dotenv.config();
console.log("🔹 JWT_SECRET from .env:", process.env.SECRET_KEY);

// Check if SECRET_KEY exists
if (!process.env.SECRET_KEY) {
  console.error("❌ SECRET_KEY is missing! Set it in .env file.");
  process.exit(1);
}

// Create Express app
const app = express();
const port = 4000;

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Routes
app.use("/api/v1", transactionRoutes);
app.use("/api/auth", userRoutes);

app.get("/", (req, res) => {
  res.send("FinManager Server is working");
});

// Start server
app.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}`);
});