import express from 'express'
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import { userRoutes } from './routes/userRoutes.js';
dotenv.config();

const app = express()

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/users', userRoutes);

const port = process.env.PORT || 3000

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})

app.get('/', (req, res) => {
    res.send('Hello, World!')
})

mongoose.connect(process.env.MONGO_URI as string)
    .then(() => {
        console.log('Connected to MongoDB')
    })
    .catch((err) => {
        console.log(err)
    })