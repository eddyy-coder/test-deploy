// const Message = require("../models/message");

const MESSAGE = "MESSAGE";
const GET_READING = "GET_READING";
const GET_NOTIFICATION_READING = "GET_NOTIFICATION_READING";
const READING_COMPLETE = "READING_COMPLETE";
const GET_OXYGEN_READING = "GET_OXYGEN_READING";
const GET_TEMPERATURE_READING = "GET_TEMPERATURE_READING";
const GET_HEART_RATE_READING = "GET_HEART_RATE_READING";
const GET_BLOOD_PRESSURE_READING = "GET_BLOOD_PRESSURE_READING";
const OXYGEN_READING_COMPLETE = "OXYGEN_READING_COMPLETE";
const TEMPERATURE_READING_COMPLETE = "TEMPERATURE_READING_COMPLETE";
const HEART_RATE_READING_COMPLETE = "HEART_RATE_READING_COMPLETE";
const BLOOD_PRESSURE_READING = "BLOOD_PRESSURE_READING";
const GET_PAYMENT = "GET_PAYMENT";
const PAYMENT_COMPLETE = "PAYMENT_COMPLETE";
const GET_WEIGHT = "GET_WEIGHT";
const WEIGHT_READING_COMPLETE = "WEIGHT_READING_COMPLETE";
const START_STREAMING = "START_STREAMING";
const STREAM_READING = "STREAM_READING";
const GET_CAMERA_IP = "GET_CAMERA_IP";
const CAMERA_IP_READING = "CAMERA_IP_READING";
const VIDEO_USER_ID = "VIDEO_USER_ID";



module.exports = (socketIo) => {
  socketIo.on("connection", async function (socket) {
    let { id } = socket.handshake.query;

    socket.join(id);

    // socket.on(MESSAGE, async (message) => {
    //   socketIo
    //     .to(message.receiverid)
    //     .to(message.senderid)
    //     .emit(MESSAGE, message);

    //   let new_message = new Message({
    //     message: message.message,
    //     senderid: message.senderid,
    //     receiverid: message.receiverid,
    //   });
    //   await new_message.save();
    // });

    socket.on(GET_READING, (data) => {
      console.log(data, "reading");
      socket.broadcast.emit(GET_READING, data);
    });
    socket.on(GET_NOTIFICATION_READING, (data) => {
      console.log(data, "reading");
      socket.broadcast.emit(GET_NOTIFICATION_READING, data);
    });
    socket.on(GET_OXYGEN_READING, function (data) {
      console.log(data);
      socket.broadcast.emit(GET_OXYGEN_READING, data);
    });

    socket.on(GET_HEART_RATE_READING, function (data) {
      console.log(data);
      socket.broadcast.emit(GET_HEART_RATE_READING, data);
    });

    socket.on(GET_TEMPERATURE_READING, function (data) {
      console.log(data);
      socket.broadcast.emit(GET_TEMPERATURE_READING, data);
    });

    socket.on(GET_BLOOD_PRESSURE_READING, function (data) {
      console.log(data);
      socket.broadcast.emit(GET_BLOOD_PRESSURE_READING, data);
    });

    socket.on(GET_PAYMENT, function (data) {
      console.log(data);
      socket.broadcast.emit(GET_PAYMENT, data);
    });

    socket.on(GET_WEIGHT, function (data) {
      console.log(data);
      socket.broadcast.emit(GET_WEIGHT, data);
    });

    socket.on(START_STREAMING, function (data) {
      console.log(data);
      socket.broadcast.emit(START_STREAMING, data);
    });

    socket.on(GET_CAMERA_IP, function (data) {
      console.log(data);
      socket.broadcast.emit(GET_CAMERA_IP, data);
    });

    socket.on(VIDEO_USER_ID, function (data) {
      console.log(data);
      socket.broadcast.emit(VIDEO_USER_ID, data);
    });

    socket.on(READING_COMPLETE, (data) => {
      console.log(data, "complete");
      socket.broadcast.emit(READING_COMPLETE, data);
    });
    socket.on(OXYGEN_READING_COMPLETE, function (data) {
      socket.broadcast.emit(OXYGEN_READING_COMPLETE, data);
    });

    socket.on(TEMPERATURE_READING_COMPLETE, function (data) {
      socket.broadcast.emit(TEMPERATURE_READING_COMPLETE, data);
    });

    socket.on(HEART_RATE_READING_COMPLETE, function (data) {
      socket.broadcast.emit(HEART_RATE_READING_COMPLETE, data);
    });

    socket.on(BLOOD_PRESSURE_READING, function (data) {
      socket.broadcast.emit(BLOOD_PRESSURE_READING, data);
    });

    socket.on(PAYMENT_COMPLETE, function (data) {
      socket.broadcast.emit(PAYMENT_COMPLETE, data);
    });

    socket.on(WEIGHT_READING_COMPLETE, function (data) {
      socket.broadcast.emit(WEIGHT_READING_COMPLETE, data);
    });

    socket.on(STREAM_READING, function (data) {
      socket.broadcast.emit(STREAM_READING, data);
    });

    socket.on(CAMERA_IP_READING, function (data) {
      socket.broadcast.emit(CAMERA_IP_READING, data);
    });

    socket.on("disconnecting", () => {
      console.log("disconnecting");
    });

    socket.on("disconnect", async () => {
      console.log("disconnect");
    });
  });
};
