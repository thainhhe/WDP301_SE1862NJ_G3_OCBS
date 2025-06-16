import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";

// Load env
dotenv.config();

// Connect DB
connectDB();


// Import models (side-effect to register schema)
import "./models/bookingModel.js";
import "./models/seatModel.js";
import "./models/seatLayoutModel.js";
import "./models/seatStatusModel.js";
import "./models/branchModel.js";
import "./models/userModel.js";
import "./models/movieModel.js";
import "./models/showtimeModel.js";
import "./models/comboModel.js";
import "./models/voucherModel.js";
import "./models/theaterModel.js";



// Import routes
import showtimeRoutes from './routes/showtimeRoutes.js';
import movieRoutes from "./routes/movieRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import branchRoutes from "./routes/branchRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";





const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
    })
);

// Cấu hình Helmet để cho phép static files
app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
      contentSecurityPolicy: {
        directives: {
          ...helmet.contentSecurityPolicy.getDefaultDirectives(),
          "img-src": [
            "'self'",
            "data:",
            "https://via.placeholder.com",
            "http://localhost:5000",
          ],
        },
      },
    })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// API Routes
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use('/api/movies', movieRoutes);
app.use('/api/showtimes', showtimeRoutes);
app.use("/api/upload", uploadRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/users', userRoutes);
app.use("/api/auth", authRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
