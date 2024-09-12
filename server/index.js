const cors = require('cors');
const express = require('express');
const os = require('os');

// Create an instance of an Express app
const app = express();
// Enable CORS (Cross-Origin Resource Sharing), allowing requests from different origins
app.use(cors());

const getNormalizedLoad = () => {
  // Get the number of CPUs
  const cpus = os.cpus().length;
  // Normalize CPU load average
  const loadAverage = os.loadavg()[0] / cpus;
  return loadAverage;
};

// Define GET route
app.get('/cpu-load', (req, res) => {
  const loadAverage = getNormalizedLoad();
  res.json({ loadAverage });
});

// Use the PORT environment variable else default to 3001
const PORT = process.env.PORT || 3001;
// Start the Express server on the specified port
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});