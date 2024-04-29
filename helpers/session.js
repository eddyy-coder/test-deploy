const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
// const log.error = require("../libraries/logger")(__filename);
// const getCurrentLineNumber = require("../helper/getCurrentLineNumber");

async function generateSessionToken() {
  const response = { status: true };
  try {
    const sessionToken =
      crypto.randomBytes(12).toString("hex") + new Date().getTime();
    const folderPath = path.join(__dirname, `../config/sessions`);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath);
    }
    const filePath = path.join(__dirname, `../config/sessions`, sessionToken);
    fs.writeFileSync(filePath, "");
    response.sessionToken = sessionToken;
  } catch (error) {
    response.status = false;
  }
  return response;
}

async function deleteSessionToken(sessionToken) {
  const response = { status: true };
  try {
    const filePath = path.join(__dirname, `../config/sessions`, sessionToken);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    response.status = false;
  }
  return response;
}

module.exports = { generateSessionToken, deleteSessionToken };
