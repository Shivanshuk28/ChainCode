import express from 'express';
import authRoutes from './routes/auth.js';
import problemRoutes from './routes/problem.js';
import submissionRoutes from './routes/submission.js';
import nftRoutes from './routes/nft.js';

const app = express();

// ... other middleware and setup ...

app.use('/api/auth', authRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/nft', nftRoutes);

// ... error handling and server startup ...