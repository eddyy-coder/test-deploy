const express = require('express');
const app = express();
const port = 3000;

// Define a route handler for the root route
app.get('/', (req, res) => {
  console.log("express app")
  res.send('heydsfosfljdslf omsfmo');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is listening at ${port}`);
});
