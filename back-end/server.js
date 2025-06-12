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

// Import to call .init()
import Booking from "./models/bookingModel.js";
import Seat from "./models/seatModel.js";
import SeatLayout from "./models/seatLayoutModel.js";
import SeatStatus from "./models/seatStatusModel.js";
import Branch from "./models/branchModel.js";
import User from "./models/userModel.js";
import Movie from "./models/movieModel.js";
import Showtime from "./models/showtimeModel.js";
import Combo from "./models/comboModel.js";
import Voucher from "./models/voucherModel.js";

// Import routes
import showtimeRoutes from './routes/showtimeRoutes.js';
import movieRoutes from "./routes/movieRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";



// Force create index/collection
Promise.all([
  Booking.init(),
  Seat.init(),
  SeatLayout.init(),
  SeatStatus.init(),
  Branch.init(),
  User.init(),
  Movie.init(),
  Showtime.init(),
  Combo.init(),
  Voucher.init(),
])
  .then(() => console.log("✅ MongoDB models initialized"))
  .catch((err) => console.error("❌ Model initialization failed:", err));

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
app.use("/api/auth", authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/showtimes', showtimeRoutes);
app.use("/api/upload", uploadRoutes);
app.use('/api/users', userRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
