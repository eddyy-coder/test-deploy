const { queryExecuter } = require("../libs/query-executor");
const { v4: uuidv4 } = require("uuid");
const uuidValidate = require("uuid-validate");

const DATABASE_SCHEMA = 'public'; /*process.env.DATABASE_SCHEMA*/

// async function addDoctorModel(doctor) {
//   try {
//     const {
//         id,
//       first_name,
//       last_name
//     } = doctor;

//     let query, values;

//     if (id) {
//       const checkQuery = `SELECT id FROM ${DATABASE_SCHEMA}.doctor WHERE id = $1`;
//       const checkValues = [id];
//       const existingRecord = await queryExecuter(checkQuery, checkValues);

//       if (existingRecord.length > 0) {
//         // If id exists, update the existing record
//         query = `
//           UPDATE ${DATABASE_SCHEMA}.doctor
//           SET first_name = $2, last_name = $3
//           WHERE id = $1
//           RETURNING *`;
//         values = [first_name, last_name];
//       } else {
//         // If id does not exist, insert a new record
//         query = `
//           INSERT INTO ${DATABASE_SCHEMA}.doctor (first_name, last_name )
//           VALUES ($1, $2, $3)
//           RETURNING *`;
//         values = [
//             first_name, last_name
//         ];
//       }
//     } else {
//       // If id is not present, insert a new record
//       const newId = uuidv4();
//       query = `
//         INSERT INTO ${DATABASE_SCHEMA}.doctor (first_name, last_name)
//         VALUES ($1, $2, $3)
//         RETURNING *`;
//       values = [
//          first_name, last_name
//       ];
//     }

//     const result = await Promise.all([queryExecuter(query, values)]);
//     return result;
//   } catch (error) {
//     console.error("Error Adding Doctor:", error.message || error);
//     throw new Error("Error Adding Doctor");
//   }
// }
async function addDoctorModel(doctor) {
  try {
    const keys = Object.keys(doctor);

    let query = `INSERT INTO ${DATABASE_SCHEMA}.doctor (`;
    let placeholders = 'VALUES (';
    const values = [];

    keys.forEach((key, index) => {
      if (key !== 'id') {
        query += `${key}, `;
        placeholders += `$${index + 1}, `;
        values.push(doctor[key]);
      }
    });

    // Removing the trailing comma and space
    query = query.slice(0, -2) + ')';
    placeholders = placeholders.slice(0, -2) + ')';
    query += ` ${placeholders} RETURNING *`;

    const result = await queryExecuter(query, values);
    return result[0];
  } catch (error) {
    console.error("Error Adding Doctor:", error.message || error);
    throw new Error("Error Adding Doctor");
  }
}

async function getAllDoctorModel() {
  try {
    const query = `
      SELECT *
      FROM ${DATABASE_SCHEMA}.doctor`;

    const result = await queryExecuter(query);
    return result;
  } catch (error) {
    console.error("Error Fetching Doctors:", error.message || error);
    throw new Error("Error Fetching Doctors");
  }
}

async function getDoctorModel(id) {
  try {
    let query = `
    SELECT
        first_name,
        last_name,
        email,
        profile,
        is_verified,
        is_doctor,
        gender,
        specialist,
        working_at,
        work_location,
        start_time,
        end_time,
        last_availability_date,
        has_mandatory_fields,
        phone_no
    FROM ${DATABASE_SCHEMA}.doctor
    WHERE id = $1`;
    let values = [id]

    const result = await queryExecuter(query, values);

    if (result.length === 0) {
      throw new Error("Doctor not found");
    }

    return result[0];
  } catch (error) {
    console.error("Error Fetching Doctor:", error.message || error);
    throw new Error("Error Fetching Doctor");
  }
}


async function updateDoctorModel(doctorId, updatedData) {
  try {

    let query = `
      UPDATE ${DATABASE_SCHEMA}.doctor
      SET`;

    const values = [doctorId];
    let index = 2;

    // Constructing the SET clause dynamically based on updatedData object
    Object.keys(updatedData).forEach((key, i) => {
      query += ` ${key} = $${index},`;
      values.push(updatedData[key]);
      index++;
    });

    // Removing the trailing comma
    query = query.slice(0, -1);

    // Adding WHERE clause for the id
    query += `
      WHERE id = $1
      RETURNING *`;

    const result = await queryExecuter(query, values);

    if (result.length === 0) {
      throw new Error("Doctor not found");
    }

    return result[0];
  } catch (error) {
    console.error("Error Updating Doctor:", error.message || error);
    throw new Error("Error Updating Doctor");
  }
}

async function getDoctorByEmail(email) {
  try {
    const query = `
      SELECT *
      FROM ${DATABASE_SCHEMA}.doctor
      WHERE email = $1`;

    const values = [email];
    const result = await queryExecuter(query, values);

    return result[0];
  } catch (error) {
    console.error("Error Fetching Doctor:", error.message || error);
    throw new Error("Error Fetching Doctor");
  }
}

async function getDoctorByIdModel(id) {
  try {
    if (id) {
      if (!uuidValidate(id)) {
        throw new Error("Invalid UUID");
      }
      query = `
        SELECT *
        FROM ${DATABASE_SCHEMA}.doctor
        WHERE id = $1`;
      values = [id];
    } else {
      throw new Error("Invalid input. Please provide id.");
    }

    const result = await queryExecuter(query, values);

    return result[0];
  } catch (error) {
    console.error("Error Fetching Doctor:", error.message || error);
    throw new Error("Error Fetching Doctor");
  }
}

async function getDoctorsByIds(doctorIds) {
  try {

    const query = `
          SELECT *
          FROM ${DATABASE_SCHEMA}.doctor
          WHERE id IN (${doctorIds.map((_, index) => `$${index + 1}`).join(', ')});`;

    const result = await queryExecuter(query, doctorIds);

    return result;
  } catch (error) {
    console.error("Error Fetching Doctors:", error.message || error);
    throw new Error("Error Fetching Doctors");
  }
}

async function deleteDoctorByIdModel(id) {
  try {
    const query = `
      DELETE FROM ${DATABASE_SCHEMA}.doctor
      WHERE id = $1`;

    const values = [id];
    const result = await queryExecuter(query, values);

    return result;
  } catch (error) {
    console.error("Error Deleting Doctor:", error.message || error);
    throw new Error("Error Deleting Doctor");
  }
}

async function getDoctorsWithNextAvailability() {
  try {
    let currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + 1); // Get the date for tomorrow

    // Construct the SQL query to fetch doctors with last_availability_date equal to currentDate
    const query = `
          SELECT *
          FROM ${DATABASE_SCHEMA}.doctor
          WHERE DATE(last_availability_date) = $1;`;

    // Execute the query and pass currentDate as a parameter
    const result = await queryExecuter(query, [currentDate]);

    return result;
  } catch (error) {
    console.error("Error Fetching Doctors:", error.message || error);
    throw new Error("Error Fetching Doctors");
  }
}

module.exports = {
  addDoctorModel,
  getAllDoctorModel,
  getDoctorModel,
  updateDoctorModel,
  getDoctorByEmail,
  getDoctorByIdModel,
  getDoctorsByIds,
  deleteDoctorByIdModel,
  getDoctorsWithNextAvailability
}