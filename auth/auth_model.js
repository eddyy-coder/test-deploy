const { queryExecuter } = require("../libs/query-executor");
const sessionHelper = require("../helpers/session");
const bcrypt = require("bcryptjs");

async function verifyPassword({ email, password }) {
  try {
    // Check if the user exists in the users table
    let query = `
      SELECT *
      FROM public.user
      WHERE email = $1`;
    let values = [email];
    let result = await queryExecuter(query, values);

    // If user is not found in users table, check doctors table
    if (result.length === 0) {
      query = `
        SELECT *
        FROM public.doctor
        WHERE email = $1`;
      result = await queryExecuter(query, values);
    }

    // If user is still not found, return status false
    if ( result.length === 0) {
      return { status: false, message: "User not found." };
    }

    const userData = result[0];

    // Compare passwords
    const isMatch = await bcrypt.compare(password, userData.password);
    if (!isMatch) {
      return { status: false, message: "Incorrect password." };
    }

    return {
      status: true,
      message: "Authentication successful.",
      user: userData,
    };
  } catch (error) {
    console.error("Error occurred during authentication:", error.message || error);
    return {
      status: false,
      message: "An error occurred during authentication.",
    };
  }
}

async function deleteSessionToken({ uid, sessionToken }) {
  try {
    let responseData = { status: true };

    // Delete session token using sessionHelper
    const deleteStatus =  await sessionHelper.deleteSessionToken(sessionToken);

    if (deleteStatus.status) {
      // Find refresh tokens associated with the provided UID
      const query = `
        DELETE FROM refresh_tokens
        WHERE id = $1`;
      const values = [uid];
      await queryExecuter(query, values);

      responseData = {
        status: true,
        message: "Refresh token deleted successfully.",
      };
    } else {
      responseData.status = false;
    }

    return responseData;
  } catch (error) {
    console.error("Error occurred during session token deletion:", error.message || error);
    return {
      status: false,
      message: "An error occurred during session token deletion.",
    };
  }
}
// const deleteSessionToken = async ({ uid, sessionToken }) => {
//   let responseData = { status: true };

//   const deleteStatus = await sessionHelper.deleteSessionToken(sessionToken);
//   if (deleteStatus.status) {
//     let querySnapshot = await db
//       .collection("refresh_tokens")
//       .where("uid", "==", uid)
//       .get();
//     if (querySnapshot.empty) {
//       return {
//         success: false,
//         message: "Refresh token not found for the provided UID.",
//       };
//     }
//     const batch = db.batch();
//     querySnapshot.forEach((doc) => {
//       batch.delete(doc.ref);
//     });
//     await batch.commit();

//     responseData = {
//       status: true,
//       message: "Refresh token deleted successfully.",
//     };
//   } else {
//     responseData.status = false;
//   }

//   return responseData;
// };
module.exports = { deleteSessionToken, verifyPassword };
