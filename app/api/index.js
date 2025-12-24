import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// API route for health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'API is running', timestamp: new Date() });
});

// Example route for your Node logic
app.get('/api/user-status', (req, res) => {
  res.json({ message: "Node backend is active" });
});

// Export the app for Vercel
export default app;