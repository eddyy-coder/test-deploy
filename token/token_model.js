const { queryExecuter } = require("../libs/query-executor");
const DATABASE_SCHEMA = 'public'; /*process.env.DATABASE_SCHEMA*/

async function saveRefreshToken({ uid, refreshToken, sessionToken, createdAt, expiryAt }) {
  try {
    const query = `
      INSERT INTO ${DATABASE_SCHEMA}.refresh_tokens (userid, refreshToken, sessionToken, createdAt, expiryAt)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING refreshToken`;
    const values = [uid ,refreshToken, sessionToken, createdAt, expiryAt];
    const result = await queryExecuter(query, values);
    return result[0];
  } catch (error) {
    console.error("Error saving refresh token:", error.message || error);
    throw new Error("Error saving refresh token");
  }
}

async function getTokenData({ refreshToken }) {
  try {
    const query = `
      SELECT *
      FROM ${DATABASE_SCHEMA}.refresh_tokens
      WHERE refreshToken = $1`;
    const values = [refreshToken];
    const result = await queryExecuter(query, values);
    if (result.length > 0) {
      return result[0];
    } else {
      throw new Error("Refresh token not found: " + refreshToken);
    }
  } catch (error) {
    console.error("Error retrieving token data:", error.message || error);
    throw new Error("Error retrieving token data");
  }
}

async function deleteRefreshTokenByUid(uid) {
  try {
    const query = `
      DELETE FROM ${DATABASE_SCHEMA}.refresh_tokens
      WHERE uid = $1`;
    const values = [uid];
    await queryExecuter(query, values);
    return { success: true, message: "Refresh token deleted successfully." };
  } catch (error) {
    console.error("Error deleting refresh token:", error.message || error);
    return {
      success: false,
      message: "An error occurred while deleting the refresh token.",
    };
  }
}

module.exports = {
  saveRefreshToken,
  getTokenData,
  deleteRefreshTokenByUid
};
