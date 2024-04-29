const { queryExecuter } = require("../libs/query-executor");
const { v4: uuidv4 } = require("uuid");
const uuidValidate = require("uuid-validate");

const DATABASE_SCHEMA = 'public'; /*process.env.DATABASE_SCHEMA*/

async function addUserModel(user) {
  try {
    const keys = Object.keys(user);

    let query = `INSERT INTO ${DATABASE_SCHEMA}.user (`;
    let placeholders = 'VALUES (';
    const values = [];

    keys.forEach((key, index) => {
      query += `${key}, `;
      placeholders += `$${index + 1}, `;
      values.push(user[key]);
    });

    // Removing the trailing comma and space
    query = query.slice(0, -2) + ')';
    placeholders = placeholders.slice(0, -2) + ')';
    query += ` ${placeholders} RETURNING *`;

    const result = await queryExecuter(query, values);
    return result[0];
  } catch (error) {
    console.error("Error Adding User:", error.message || error);
    throw new Error("Error Adding User");
  }
}

async function getAllUsersModel() {
  try {
    const query = `
        SELECT *
        FROM ${DATABASE_SCHEMA}.user`;

    const result = await queryExecuter(query);
    return result;
  } catch (error) {
    console.error("Error Fetching Users:", error.message || error);
    throw new Error("Error Fetching Users");
  }
}

async function getUserModel(identifier) {
  try {
    let query, values;

    if (identifier.id) {
      if (!uuidValidate(identifier.id)) {
        throw new Error("Invalid UUID");
      }
      query = `
          SELECT *
          FROM ${DATABASE_SCHEMA}.user
          WHERE id = $1`;
      values = [identifier.id];
    } else if (identifier.name) {
      query = `
          SELECT *
          FROM ${DATABASE_SCHEMA}.user
          WHERE first_name ILIKE $1 OR last_name ILIKE $1`;
      values = [`%${identifier.name}%`];
    } else {
      throw new Error("Invalid input. Please provide either id or name.");
    }

    const result = await queryExecuter(query, values);

    return result[0];
  } catch (error) {
    console.error("Error Fetching User:", error.message || error);
    throw new Error("Error Fetching User");
  }
}

async function updateUserModel(userId, updatedData) {
  try {
    let query = `
        UPDATE ${DATABASE_SCHEMA}.user
        SET`;

    const values = [userId];
    let index = 2;

    Object.keys(updatedData).forEach((key, i) => {
      query += ` ${key} = $${index},`;
      values.push(updatedData[key]);
      index++;
    });

    query = query.slice(0, -1);

    query += `
        WHERE id = $1
        RETURNING *`;

    const result = await queryExecuter(query, values);

    if (result.length === 0) {
      throw new Error("User not found");
    }

    return result[0];
  } catch (error) {
    console.error("Error Updating User:", error.message || error);
    throw new Error("Error Updating User");
  }
}

async function getUserByEmail(email) {
  try {
    const query = `
        SELECT *
        FROM ${DATABASE_SCHEMA}.user
        WHERE email = $1`;

    const values = [email];
    const result = await queryExecuter(query, values);

    return result[0];
  } catch (error) {
    console.error("Error Fetching User:", error.message || error);
    throw new Error("Error Fetching User");
  }
}

async function getUserByIdModel(id) {
  try {
    if (id) {
      if (!uuidValidate(id)) {
        throw new Error("Invalid UUID");
      }
      query = `
        SELECT *
        FROM ${DATABASE_SCHEMA}.user
        WHERE id = $1`;
      values = [id];
    } else {
      throw new Error("Invalid input. Please provide id.");
    }

    const result = await queryExecuter(query, values);

    return result[0];
  } catch (error) {
    console.error("Error Fetching User:", error.message || error);
    throw new Error("Error Fetching User");
  }
}

async function getUsersByIdsModel(ids) {
  try {
      const users = [];
      for (const id of ids) {
          if (uuidValidate(id)) {
              const user = await getUserByIdModel(id);
              users.push(user);
          } else {
              console.error(`Invalid UUID: ${id}`);
          }
      }
      return users;
  } catch (error) {
      console.error("Error Fetching Users:", error.message || error);
      throw new Error("Error Fetching Users");
  }
}

async function deleteUserByIdModel(id) {
  try {
    const query = `
      DELETE FROM ${DATABASE_SCHEMA}.user
      WHERE id = $1`;

    const values = [id];
    const result = await queryExecuter(query, values);

    return result;
  } catch (error) {
    console.error("Error Deleting User:", error.message || error);
    throw new Error("Error Deleting User");
  }
}

async function getUsersByFamilyIdModel(familyId) {
  try {
    const query = `
      SELECT *
      FROM ${DATABASE_SCHEMA}.user
      WHERE family_id = $1`;

    const values = [familyId];
    const result = await queryExecuter(query, values);
    
    return result;
  } catch (error) {
    console.error("Error Fetching Users by Family ID:", error.message || error);
    throw new Error("Error Fetching Users by Family ID");
  }
}

module.exports = {
  addUserModel,
  getAllUsersModel,
  getUserModel,
  updateUserModel,
  getUserByEmail,
  getUserByIdModel,
  getUsersByIdsModel,
  deleteUserByIdModel,
  getUsersByFamilyIdModel
}
