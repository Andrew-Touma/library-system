import dotenv from "dotenv"
dotenv.config()

import express from "express"
import cors from "cors"
import connectDB from "./config/db.js"
import rateLimiter from './middleware/rateLimiter.js'
import authRoutes from './routes/authRoutes.js'
import bookRoutes from './routes/bookRoutes.js'
import borrowRoutes from './routes/borrowRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import requestRoutes from './routes/requestRoutes.js'


connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use(rateLimiter);

// Routes 
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api', borrowRoutes);

app.get('/heartbeat', (req,res) =>{
    res.send("Library API Runing");
})

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
})

