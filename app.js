const express = require("express");
const cors = require("cors");
require("dotenv").config();
const bodyParser = require("body-parser");
// const doctorsRoute = require("./routes/doctors.js");
global.asyncWrapper = require("./middleware/asyncWrapper");
const routes = require("./routes/index");
const { doctorNextAvailabilityScheduler, schedulerAppointmentNotify } = require("./utils/scheduler.js")
const app = express();
const PORT = 80; //take it form .env
const SOCKETPORT = 4200 //take it form .env
const http = require("http")
  .Server(app)
  .listen(SOCKETPORT, function () {
    console.log("WebSocket listening on port %d", SOCKETPORT);
  });

const socketIo = require("socket.io")(http, {
  transport: ["websocket"],
});

require("./socket/socket.js")(socketIo);

app.use(bodyParser.json());
const corsOptions = {
  origin: "*", // Set the origin in here before deployment
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: [
    "Origin",
    "Authorization",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "X-Source-Url",
  ],
  optionsSuccessStatus: 204,
};
// Configure CORS middleware
app.use(cors(corsOptions));

app.use("/", routes);

// running cron job
doctorNextAvailabilityScheduler.start()
schedulerAppointmentNotify.start()

app.listen(PORT, (error) => {
  if (!error)
    console.log(
      "Server is Successfully Running, and App is listening on port " + PORT
    );
  else console.log("Error occurred, server can't start", error);
});


module.exports = app;