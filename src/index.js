import express from 'express';
import { matchesRouter } from './routes/matches.js';

const app = express();

// Use JSON middleware
app.use(express.json());

// Root GET route
app.get('/', (req, res) => {
  res.send('Welcome to the Sportz server!');
});

app.use('/matches', matchesRouter);

// Start the server
const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});