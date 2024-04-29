const { queryExecuter } = require("../libs/query-executor");
const { v4: uuidv4 } = require("uuid");
const uuidValidate = require("uuid-validate");

const DATABASE_SCHEMA = 'public'; /*process.env.DATABASE_SCHEMA*/


async function addReportModel(report) {
    try {
        const keys = Object.keys(report);

        let query = `INSERT INTO ${DATABASE_SCHEMA}.report (`;
        let placeholders = 'VALUES (';
        const values = [];

        keys.forEach((key, index) => {
            if (key !== 'id') {
                query += `${key}, `;
                placeholders += `$${index + 1}, `;
                values.push(report[key]);
            }
        });

        // Removing the trailing comma and space
        query = query.slice(0, -2) + ')';
        placeholders = placeholders.slice(0, -2) + ')';
        query += ` ${placeholders} RETURNING *`;

        const result = await queryExecuter(query, values);
        return result;
    } catch (error) {
        console.error("Error Adding Report:", error.message || error);
        throw new Error("Error Adding Report");
    }
}

async function getReportsById(body) {
    try {
        let query, values;

        if (body.family_id) {
            query = `
            SELECT *
            FROM ${DATABASE_SCHEMA}.report
            WHERE family_id = $1`;
            values = [body.family_id];
        } else if (body.user_id) {
            query = `
            SELECT *
            FROM ${DATABASE_SCHEMA}.report
            WHERE user_id = $1`;
            values = [body.user_id];
        } else if (body.doctor_id) {
            query = `
            SELECT *
            FROM ${DATABASE_SCHEMA}.report
            WHERE doctor_id = $1`;
            values = [body.doctor_id];
        } else if (body.report_id) {
            query = `
            SELECT *
            FROM ${DATABASE_SCHEMA}.report
            WHERE id = $1`;
            values = [body.report_id];
        } else {
            throw new Error("Error Fetching Reports: No family_id, doctor_id, report_id or user_id provided.");
        }

        const result = await queryExecuter(query, values);
        return result;
    } catch (error) {
        console.error("Error Fetching Reports:", error.message || error);
        throw new Error("Error Fetching Reports");
    }
}



async function getReportsByUserId(userId) {
    try {
        const query = `
        SELECT 
            r.*,
            u.first_name AS user_first_name,
            u.last_name AS user_last_name,
            u.email AS user_email,
            u.last_name AS user_last_name,
            u.profile AS user_profile,
            u.height AS user_height,
            u.weight AS user_weight,
            u.gender AS user_gender,
          u.dob AS user_dob,
          u.relation AS user_relation,
          u.preexisting_medication AS user_preexisting_medication,
          u.preexisting_condition AS user_preexisting_condition,
          u.emergency_contact_name AS user_emergency_contact_name,
          u.emergency_contact_number AS user_emergency_contact_number,
            ru.first_name AS report_user_first_name,
            ru.last_name AS report_user_last_name,
            ru.last_name AS report_user_last_name,
            ru.profile AS report_user_profile,
            ru.height AS report_user_height,
            ru.weight AS report_user_weight,
            ru.gender AS report_user_gender,
            ru.relation AS report_user_relation,
            ru.preexisting_medication AS report_user_preexisting_medication,
          ru.preexisting_condition AS report_user_preexisting_condition,
          ru.emergency_contact_name AS report_user_emergency_contact_name,
          ru.emergency_contact_number AS report_user_emergency_contact_number,
            a.symptoms AS appointment_symptoms,
            d.first_name AS doctor_first_name,
            d.last_name AS doctor_last_name,
            d.profile AS doctor_profile,
            d.gender AS doctor_gender,
            d.specialist AS doctor_specialist,
            d.phone_no AS doctor_phone_no
        FROM ${DATABASE_SCHEMA}.report AS r
        LEFT JOIN ${DATABASE_SCHEMA}.user AS u ON r.user_id = u.id
        LEFT JOIN ${DATABASE_SCHEMA}.user AS ru ON r.report_user_id = ru.id
        LEFT JOIN ${DATABASE_SCHEMA}.appointment AS a ON r.appointment_id = a.id
        LEFT JOIN ${DATABASE_SCHEMA}.doctor AS d ON r.doctor_id = d.id
        WHERE r.user_id = $1`;

        const values = [userId];
        const result = await queryExecuter(query, values);

        return result;
    } catch (error) {
        console.error("Error Fetching Reports:", error.message || error);
        throw new Error("Error Fetching Reports");
    }
}


async function getReportsByDoctorId(doctorId) {
    try {
        if (!doctorId) {
            throw new Error("Please provide Id");
        }
        const query = `
        SELECT 
            r.*,
            u.first_name AS user_first_name,
            u.last_name AS user_last_name,
            u.email AS user_email,
            u.last_name AS user_last_name,
            u.profile AS user_profile,
            u.height AS user_height,
            u.weight AS user_weight,
            u.gender AS user_gender,
          u.dob AS user_dob,
          u.relation AS user_relation,
          u.preexisting_medication AS user_preexisting_medication,
          u.preexisting_condition AS user_preexisting_condition,
          u.emergency_contact_name AS user_emergency_contact_name,
          u.emergency_contact_number AS user_emergency_contact_number,
            ru.first_name AS report_user_first_name,
            ru.last_name AS report_user_last_name,
            ru.profile AS report_user_profile,
            ru.height AS report_user_height,
            ru.weight AS report_user_weight,
            ru.gender AS report_user_gender,
            ru.relation AS report_user_relation,
            ru.preexisting_medication AS report_user_preexisting_medication,
          ru.preexisting_condition AS report_user_preexisting_condition,
          ru.emergency_contact_name AS report_user_emergency_contact_name,
          ru.emergency_contact_number AS report_user_emergency_contact_number,
          d.first_name AS doctor_first_name,
            d.last_name AS doctor_last_name,
            d.profile AS doctor_profile,
            d.gender AS doctor_gender,
            d.specialist AS doctor_specialist,
            d.phone_no AS doctor_phone_no
        FROM ${DATABASE_SCHEMA}.report AS r
        LEFT JOIN ${DATABASE_SCHEMA}.user AS u ON r.user_id = u.id
        LEFT JOIN ${DATABASE_SCHEMA}.user AS ru ON r.report_user_id = ru.id
        LEFT JOIN ${DATABASE_SCHEMA}.appointment AS a ON r.appointment_id = a.id
        LEFT JOIN ${DATABASE_SCHEMA}.doctor AS d ON r.doctor_id = d.id
        WHERE r.doctor_id = $1`;

        const values = [doctorId];
        const result = await queryExecuter(query, values);

        return result;
    } catch (error) {
        console.error("Error Fetching Reports:", error.message || error);
        throw new Error("Error Fetching Reports");
    }
}


async function deleteReportById(id) {
    try {
        const query = `
        DELETE FROM ${DATABASE_SCHEMA}.report
        WHERE id = $1`;

        const values = [id];
        const result = await queryExecuter(query, values);

        return result;
    } catch (error) {
        console.error("Error Deleting Report:", error.message || error);
        throw new Error("Error Deleting Report");
    }
}

async function updateReportById(id, updatedReport) {
    try {
        const keys = Object.keys(updatedReport);

        let query = `
        UPDATE ${DATABASE_SCHEMA}.report
        SET`;

        const values = [id];
        let index = 2;

        // Constructing the SET clause dynamically based on updatedReport object
        keys.forEach((key, i) => {
            query += ` ${key} = $${index},`;
            values.push(updatedReport[key]);
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
            throw new Error("Report not found");
        }

        return result[0];
    } catch (error) {
        console.error("Error Updating Report:", error.message || error);
        throw new Error("Error Updating Report");
    }
}

module.exports = {
    addReportModel,
    getReportsByDoctorId,
    getReportsByUserId,
    deleteReportById,
    updateReportById,
    getReportsById
}