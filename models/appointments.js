const { queryExecuter } = require("../libs/query-executor");
const { v4: uuidv4 } = require("uuid");
const uuidValidate = require("uuid-validate");

const DATABASE_SCHEMA = 'public'; /*process.env.DATABASE_SCHEMA*/

async function addAppointmentModel(appointment) {
  try {
    const keys = Object.keys(appointment);

    let query = `INSERT INTO ${DATABASE_SCHEMA}.appointment (`;
    let placeholders = 'VALUES (';
    const values = [];

    keys.forEach((key, index) => {
      if (key !== 'id') {
        query += `${key}, `;
        placeholders += `$${index + 1}, `;
        values.push(appointment[key]);
      }
    });

    // Removing the trailing comma and space
    query = query.slice(0, -2) + ')';
    placeholders = placeholders.slice(0, -2) + ')';
    query += ` ${placeholders} RETURNING *`;

    const result = await queryExecuter(query, values);
    return result[0];
  } catch (error) {
    console.error("Error Adding appointment:", error.message || error);
    throw new Error("Error Adding appointment");
  }
}

async function getAppointmentsByUserId(userId) {
  try {
    const query = `
      SELECT
          A.*,
          A.user_id,
          A.doctor_id,
          A.slot_id,
          A.report_id,
          U.first_name AS user_first_name,
          U.last_name AS user_last_name,
          U.email AS user_email,
          U.profile AS user_profile,
          U.height AS user_height,
          U.weight AS user_weight,
          U.gender AS user_gender,
          U.relation AS user_relation,
          U.dob AS user_dob,
          U.gender AS user_gender,
          U.preexisting_medication AS user_preexisting_medication,
          U.preexisting_condition AS user_preexisting_condition,
          U.emergency_contact_name AS user_emergency_contact_name,
          U.emergency_contact_number AS user_emergency_contact_number,
          M.first_name AS appointment_user_first_name,
          M.last_name AS appointment_user_last_name,
          M.email AS appointment_user_email,
          M.profile AS appointment_user_profile,
          M.height AS appointment_user_height,
          M.weight AS appointment_user_weight,
          M.gender AS appointment_user_gender,
          M.relation AS appointment_user_relation,
          M.dob AS appointment_user_dob,
          M.gender AS appointment_user_gender,
          M.preexisting_medication AS appointment_user_preexisting_medication,
          M.preexisting_condition AS appointment_user_preexisting_condition,
          M.emergency_contact_name AS appointment_user_emergency_contact_name,
          M.emergency_contact_number AS appointment_user_emergency_contact_number,
          D.first_name AS doctor_first_name,
          D.last_name AS doctor_last_name,
          D.profile AS doctor_profile,
          D.gender AS doctor_gender,
          D.specialist AS doctor_specialist,
          D.phone_no AS doctor_phone_no,
          S.start AS slot_start
      FROM 
          ${DATABASE_SCHEMA}.appointment AS A
      LEFT JOIN
          ${DATABASE_SCHEMA}.user AS U ON A.user_id = U.id
      LEFT JOIN
          ${DATABASE_SCHEMA}.user AS M ON A.appointmentuser_id = M.id
      LEFT JOIN
          ${DATABASE_SCHEMA}.doctor AS D ON A.doctor_id = D.id
      LEFT JOIN
          ${DATABASE_SCHEMA}.slot AS S ON A.slot_id = S.id
      WHERE 
          A.user_id = $1`;

    const values = [userId];
    const result = await queryExecuter(query, values);

    return result;
  } catch (error) {
    console.error("Error Fetching Appointment Details:", error.message || error);
    throw new Error("Error Fetching Appointment Details");
  }
}


async function getAppointmentsByDoctorId(doctorId) {
  try {
    const query = `
            SELECT
            A.*,
            A.user_id,
            A.doctor_id,
            A.slot_id,
            A.report_id,
            U.first_name AS user_first_name,
            U.last_name AS user_last_name,
            U.email AS user_email,
            U.profile AS user_profile,
            U.height AS user_height,
            U.weight AS user_weight,
            U.gender AS user_gender,
            U.relation AS user_relation,
            U.dob AS user_dob,
            U.gender AS user_gender,
            U.preexisting_medication AS user_preexisting_medication,
            U.preexisting_condition AS user_preexisting_condition,
            U.emergency_contact_name AS user_emergency_contact_name,
            U.emergency_contact_number AS user_emergency_contact_number,
            M.first_name AS appointment_user_first_name,
          M.last_name AS appointment_user_last_name,
          M.email AS appointment_user_email,
          M.profile AS appointment_user_profile,
          M.height AS appointment_user_height,
          M.weight AS appointment_user_weight,
          M.gender AS appointment_user_gender,
          M.relation AS appointment_user_relation,
          M.dob AS appointment_user_dob,
          M.gender AS appointment_user_gender,
          M.preexisting_medication AS appointment_user_preexisting_medication,
          M.preexisting_condition AS appointment_user_preexisting_condition,
          M.emergency_contact_name AS appointment_user_emergency_contact_name,
          M.emergency_contact_number AS appointment_user_emergency_contact_number,
            D.first_name AS doctor_first_name,
            D.last_name AS doctor_last_name,
            D.profile AS doctor_profile,
            D.gender AS doctor_gender,
            D.specialist AS doctor_specialist,
            D.phone_no AS doctor_phone_no,
            S.start AS slot_start
            FROM 
                ${DATABASE_SCHEMA}.appointment AS A
            LEFT JOIN
                ${DATABASE_SCHEMA}.user AS U ON A.user_id = U.id
            LEFT JOIN
                ${DATABASE_SCHEMA}.user AS M ON A.appointmentuser_id = M.id
            LEFT JOIN
                ${DATABASE_SCHEMA}.doctor AS D ON A.doctor_id = D.id
            LEFT JOIN
                ${DATABASE_SCHEMA}.slot AS S ON A.slot_id = S.id
            WHERE 
                A.doctor_id = $1`;

    const values = [doctorId];
    const result = await queryExecuter(query, values);

    return result;
  } catch (error) {
    console.error("Error Fetching Appointment Details:", error.message || error);
    throw new Error("Error Fetching Appointment Details");
  }
}

async function getAppointmentsByUserIdAndType(userId, appointmentType) {
  try {
    let currentDate = new Date();
    let condition, operator;

    // Set condition based on appointmentType
    if (appointmentType === 'past') {
      condition = '<';
      operator = 'DESC';
    } else if (appointmentType === 'current') {
      condition = '=';
      operator = 'ASC';
    } else if (appointmentType === 'upcoming') {
      condition = '>';
      operator = 'ASC';
    } else {
      throw new Error('Invalid appointment type');
    }

    const query = `
      SELECT
      A.*,
          A.user_id,
          A.doctor_id,
          A.slot_id,
          U.first_name AS user_first_name,
            U.last_name AS user_last_name,
            U.email AS user_email,
            U.profile AS user_profile,
            U.height AS user_height,
            U.weight AS user_weight,
            U.gender AS user_gender,
            U.relation AS user_relation,
            U.dob AS user_dob,
            U.gender AS user_gender,
            U.preexisting_medication AS user_preexisting_medication,
            U.preexisting_condition AS user_preexisting_condition,
            U.emergency_contact_name AS user_emergency_contact_name,
            U.emergency_contact_number AS user_emergency_contact_number,
            M.first_name AS appointment_user_first_name,
            M.last_name AS appointment_user_last_name,
            M.email AS appointment_user_email,
            M.profile AS appointment_user_profile,
            M.height AS appointment_user_height,
            M.weight AS appointment_user_weight,
            M.gender AS appointment_user_gender,
            M.relation AS appointment_user_relation,
            M.dob AS appointment_user_dob,
            M.gender AS appointment_user_gender,
            M.preexisting_medication AS appointment_user_preexisting_medication,
            M.preexisting_condition AS appointment_user_preexisting_condition,
            M.emergency_contact_name AS appointment_user_emergency_contact_name,
            M.emergency_contact_number AS appointment_user_emergency_contact_number,
          D.first_name AS doctor_first_name,
          D.last_name AS doctor_last_name,
          D.profile AS doctor_profile,
            D.gender AS doctor_gender,
            D.specialist AS doctor_specialist,
            D.phone_no AS doctor_phone_no,
          S.start AS slot_start
      FROM 
          ${DATABASE_SCHEMA}.appointment AS A
      LEFT JOIN
          ${DATABASE_SCHEMA}.user AS U ON A.user_id = U.id
      LEFT JOIN
          ${DATABASE_SCHEMA}.user AS M ON A.appointmentuser_id = M.id    
      LEFT JOIN
          ${DATABASE_SCHEMA}.doctor AS D ON A.doctor_id = D.id
      LEFT JOIN
          ${DATABASE_SCHEMA}.slot AS S ON A.slot_id = S.id
      WHERE 
          A.user_id = $1
          AND A.appointment_time ${condition} $2
      ORDER BY
          A.appointment_time ${operator}`;

    const values = [userId, currentDate];
    const result = await queryExecuter(query, values);

    return result;
  } catch (error) {
    console.error("Error Fetching Appointment Details:", error.message || error);
    throw new Error("Error Fetching Appointment Details");
  }
}


async function getUserIdsByDoctorId(doctorId) {
  try {
    const query = `
          SELECT
              A.user_id
          FROM
              ${DATABASE_SCHEMA}.appointment AS A
          JOIN
              ${DATABASE_SCHEMA}.doctor AS D ON A.doctor_id = D.id
          WHERE
              D.id = $1`;

    const values = [doctorId];
    const result = await queryExecuter(query, values);

    return result.map(row => row.user_id);
  } catch (error) {
    console.error("Error Fetching User IDs:", error.message || error);
    throw new Error("Error Fetching User IDs");
  }
}

async function getAppointmentsByDoctorIdAndStatus(doctorId, status) {
  try {
    const query = `
      SELECT
      A.*,
          A.user_id,
          A.doctor_id,
          A.slot_id,
          A.report_id,
          U.first_name AS user_first_name,
          U.last_name AS user_last_name,
          U.email AS user_email,
          U.profile AS user_profile,
          U.height AS user_height,
          U.weight AS user_weight,
          U.gender AS user_gender,
          U.dob AS user_dob,
          U.relation AS user_relation,
          U.preexisting_medication AS user_preexisting_medication,
          U.preexisting_condition AS user_preexisting_condition,
          U.emergency_contact_name AS user_emergency_contact_name,
          U.emergency_contact_number AS user_emergency_contact_number,
          M.first_name AS appointment_user_first_name,
          M.last_name AS appointment_user_last_name,
          M.email AS appointment_user_email,
          M.profile AS appointment_user_profile,
          M.height AS appointment_user_height,
          M.weight AS appointment_user_weight,
          M.gender AS appointment_user_gender,
          M.relation AS appointment_user_relation,
          M.dob AS appointment_user_dob,
          M.gender AS appointment_user_gender,
          M.preexisting_medication AS appointment_user_preexisting_medication,
          M.preexisting_condition AS appointment_user_preexisting_condition,
          M.emergency_contact_name AS appointment_user_emergency_contact_name,
          M.emergency_contact_number AS appointment_user_emergency_contact_number,
          D.first_name AS doctor_first_name,
          D.last_name AS doctor_last_name,
          D.profile AS doctor_profile,
          D.gender AS doctor_gender,
          D.specialist AS doctor_specialist,
          D.phone_no AS doctor_phone_no,
          S.start AS slot_start
      FROM 
          ${DATABASE_SCHEMA}.appointment AS A
      LEFT JOIN
          ${DATABASE_SCHEMA}.user AS U ON A.user_id = U.id
      LEFT JOIN
          ${DATABASE_SCHEMA}.user AS M ON A.appointmentuser_id = M.id
      LEFT JOIN
          ${DATABASE_SCHEMA}.doctor AS D ON A.doctor_id = D.id
      LEFT JOIN
          ${DATABASE_SCHEMA}.slot AS S ON A.slot_id = S.id
      WHERE 
          A.doctor_id = $1
      AND
          A.status = $2`;

    const values = [doctorId, status];
    const result = await queryExecuter(query, values);

    return result;
  } catch (error) {
    console.error("Error Fetching Appointment Details:", error.message || error);
    throw new Error("Error Fetching Appointment Details");
  }
}

async function updateAppointmentById(appointmentId, updatedData) {
  try {
    let query = `
      UPDATE ${DATABASE_SCHEMA}.appointment
      SET`;

    const values = [appointmentId];
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
      throw new Error("Appointment not found");
    }

    return result[0];
  } catch (error) {
    console.error("Error Updating Appointment:", error.message || error);
    throw new Error("Error Updating Appointment");
  }
}

async function getAppointmentById(appointmentId) {
  try {
    const query = `
      SELECT
          A.*,
          U.first_name AS user_first_name,
          U.last_name AS user_last_name,
          U.email AS user_email,
          U.profile AS user_profile,
          U.height AS user_height,
          U.weight AS user_weight,
          U.gender AS user_gender,
          U.relation AS user_gender,
          U.dob AS user_dob,
          U.preexisting_medication AS user_preexisting_medication,
          U.preexisting_condition AS user_preexisting_condition,
          U.emergency_contact_name AS user_emergency_contact_name,
          U.emergency_contact_number AS user_emergency_contact_number,
          M.first_name AS appointment_user_first_name,
          M.last_name AS appointment_user_last_name,
          M.email AS appointment_user_email,
          M.profile AS appointment_user_profile,
          M.height AS appointment_user_height,
          M.weight AS appointment_user_weight,
          M.gender AS appointment_user_gender,
          M.relation AS appointment_user_relation,
          M.dob AS appointment_user_dob,
          M.gender AS appointment_user_gender,
          M.preexisting_medication AS appointment_user_preexisting_medication,
          M.preexisting_condition AS appointment_user_preexisting_condition,
          M.emergency_contact_name AS appointment_user_emergency_contact_name,
          M.emergency_contact_number AS appointment_user_emergency_contact_number,
          D.first_name AS doctor_first_name,
          D.last_name AS doctor_last_name,
          D.profile AS doctor_profile,
          D.gender AS doctor_gender,
          D.specialist AS doctor_specialist,
          D.phone_no AS doctor_phone_no,
          S.start AS slot_start
      FROM 
          ${DATABASE_SCHEMA}.appointment AS A
      LEFT JOIN
          ${DATABASE_SCHEMA}.user AS U ON A.user_id = U.id
      LEFT JOIN
          ${DATABASE_SCHEMA}.user AS M ON A.appointmentuser_id = M.id    
      LEFT JOIN
          ${DATABASE_SCHEMA}.doctor AS D ON A.doctor_id = D.id
      LEFT JOIN
          ${DATABASE_SCHEMA}.slot AS S ON A.slot_id = S.id
      WHERE 
          A.id = $1`;

    const values = [appointmentId];
    const result = await queryExecuter(query, values);

    if (result.length === 0) {
      throw new Error("Appointment not found");
    }

    return result[0];
  } catch (error) {
    console.error("Error Fetching Appointment:", error.message || error);
    throw new Error("Error Fetching Appointment");
  }
}

async function updateAppointmentsCancelByDate(condition, updatedData) {
  try {
    let query = `
      UPDATE ${DATABASE_SCHEMA}.appointment
      SET`;

    const values = [];
    let index = 1;

    // Constructing the SET clause dynamically based on updatedData object
    Object.keys(updatedData).forEach((key, i) => {
      query += ` ${key} = $${index},`;
      values.push(updatedData[key]);
      index++;
    });

    // Removing the trailing comma
    query = query.slice(0, -1);

    // Constructing the WHERE clause dynamically based on the condition object
    query += `
      WHERE`;

    const conditionKeys = Object.keys(condition);
    conditionKeys.forEach((key, i) => {
      // Check if the condition key is "appointment_time"
      if (key === "appointment_time") {
        // Extract the date part from the datetime column and compare it with the provided date
        query += ` DATE(${key}) = DATE($${index})`;
      } else {
        // For other condition keys, simply compare them as usual
        query += ` ${key} = $${index}`;
      }
      values.push(condition[key]);
      index++;
      if (i < conditionKeys.length - 1) {
        query += ' AND';
      }
    });

    query += `
      RETURNING *`;

    const result = await queryExecuter(query, values);

    if (result.length === 0) {
      throw new Error("No appointments found matching the condition");
    }

    return result;
  } catch (error) {
    console.error("Error Updating Appointments:", error.message || error);
    throw new Error("Error Updating Appointments");
  }
}

async function getAppointmentByTime(appointmentTime) {
  try {
    const query = `
      SELECT
          A.*,
          U.first_name AS user_first_name,
          U.last_name AS user_last_name,
          U.email AS user_email,
          U.profile AS user_profile,
          U.height AS user_height,
          U.weight AS user_weight,
          U.gender AS user_gender,
          U.relation AS user_gender,
          U.dob AS user_dob,
          U.preexisting_medication AS user_preexisting_medication,
          U.preexisting_condition AS user_preexisting_condition,
          U.emergency_contact_name AS user_emergency_contact_name,
          U.emergency_contact_number AS user_emergency_contact_number,
          M.first_name AS appointment_user_first_name,
          M.last_name AS appointment_user_last_name,
          M.email AS appointment_user_email,
          M.profile AS appointment_user_profile,
          M.height AS appointment_user_height,
          M.weight AS appointment_user_weight,
          M.gender AS appointment_user_gender,
          M.relation AS appointment_user_relation,
          M.dob AS appointment_user_dob,
          M.gender AS appointment_user_gender,
          M.preexisting_medication AS appointment_user_preexisting_medication,
          M.preexisting_condition AS appointment_user_preexisting_condition,
          M.emergency_contact_name AS appointment_user_emergency_contact_name,
          M.emergency_contact_number AS appointment_user_emergency_contact_number,
          D.first_name AS doctor_first_name,
          D.last_name AS doctor_last_name,
          D.profile AS doctor_profile,
          D.gender AS doctor_gender,
          D.specialist AS doctor_specialist,
          D.phone_no AS doctor_phone_no,
          S.start AS slot_start
      FROM 
          ${DATABASE_SCHEMA}.appointment AS A
      LEFT JOIN
          ${DATABASE_SCHEMA}.user AS U ON A.user_id = U.id
      LEFT JOIN
          ${DATABASE_SCHEMA}.user AS M ON A.appointmentuser_id = M.id    
      LEFT JOIN
          ${DATABASE_SCHEMA}.doctor AS D ON A.doctor_id = D.id
      LEFT JOIN
          ${DATABASE_SCHEMA}.slot AS S ON A.slot_id = S.id
      WHERE 
          A.appointment_time = $1`;

    const values = [appointmentTime];
    const result = await queryExecuter(query, values);

    // if (result.length === 0) {
    //   throw new Error("Appointment not found");
    // }

    return result;
  } catch (error) {
    console.error("Error Fetching Appointment:", error.message || error);
    throw new Error("Error Fetching Appointment");
  }
}

async function getAppointmentCountByDoctorId(doctorId) {
  try {
    const query = `
      SELECT COUNT(*) AS appointment_count
      FROM ${DATABASE_SCHEMA}.appointment AS A
      WHERE A.doctor_id = $1`;

    const values = [doctorId];
    const result = await queryExecuter(query, values);

    // Extract the appointment count from the result
    const appointmentCount = result[0].appointment_count;

    return appointmentCount;
  } catch (error) {
    console.error("Error Fetching Appointment Count:", error.message || error);
    throw new Error("Error Fetching Appointment Count");
  }
}

module.exports = {
  getAppointmentsByUserId,
  addAppointmentModel,
  getAppointmentsByUserId,
  getAppointmentsByDoctorId,
  getUserIdsByDoctorId,
  getAppointmentsByUserIdAndType,
  getAppointmentsByDoctorIdAndStatus,
  updateAppointmentById,
  getAppointmentById,
  updateAppointmentsCancelByDate,
  getAppointmentByTime,
  getAppointmentCountByDoctorId
}