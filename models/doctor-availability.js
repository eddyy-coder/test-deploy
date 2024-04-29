const { queryExecuter } = require("../libs/query-executor");
const { v4: uuidv4 } = require("uuid");
const uuidValidate = require("uuid-validate");

const DATABASE_SCHEMA = 'public'; /*process.env.DATABASE_SCHEMA*/

async function addDoctorAvailabilityModel(doctorAvailability) {
    try {
        const keys = Object.keys(doctorAvailability);

        let query = `INSERT INTO ${DATABASE_SCHEMA}.doctoravailability (`;
        let placeholders = 'VALUES (';
        const values = [];

        keys.forEach((key, index) => {
            if (key !== 'id') {
                query += `${key}, `;
                placeholders += `$${index + 1}, `;
                values.push(doctorAvailability[key]);
            }
        });

        // Removing the trailing comma and space
        query = query.slice(0, -2) + ')';
        placeholders = placeholders.slice(0, -2) + ')';
        query += ` ${placeholders} RETURNING *`;

        const result = await queryExecuter(query, values);
        return result[0];
    } catch (error) {
        console.error("Error Adding Doctor Availability:", error.message || error);
        throw new Error("Error Adding Doctor Availability");
    }
}

async function getDoctorAvailabilityModel(doctorId) {
    try {
        // Construct the SQL query to fetch doctor availability and slots
        const query = `
            SELECT
                da.id AS doctor_availability_id,
                da.date,
                da.login,
                da.logout,
                s.id AS slot_id,
                s.start,
                s.booked
            FROM
                ${DATABASE_SCHEMA}.doctoravailability AS da
            LEFT JOIN
                ${DATABASE_SCHEMA}.slot AS s
            ON
                da.id = s.doctoravailability_id
            WHERE
                da.doctor_id = $1
                AND s.booked = false
            ORDER BY
                da.date, s.start;`;

        // Execute the query and pass doctorId as a parameter
        const result = await queryExecuter(query, [doctorId]);

        // Process the result and group slots by doctor availability
        const doctorAvailability = {};
        result.forEach(row => {
            const doctorAvailabilityId = row.doctor_availability_id;
            if (!doctorAvailability[doctorAvailabilityId]) {
                doctorAvailability[doctorAvailabilityId] = {
                    id: doctorAvailabilityId,
                    date: row.date,
                    login: row.login,
                    logout: row.logout,
                    slots: []
                };
            }
            doctorAvailability[doctorAvailabilityId].slots.push({
                id: row.slot_id,
                start: row.start,
                booked: row.booked
            });
        });

        // Convert doctor availability object to an array
        const doctorAvailabilityArray = Object.values(doctorAvailability);

        return doctorAvailabilityArray;
    } catch (error) {
        console.error("Error getting Doctor Availability:", error.message || error);
        throw new Error("Error getting Doctor Availability");
    }
}

async function getAllAvailableDoctorIdsModel() {
    try {
        const query = `
            SELECT DISTINCT doctor_id
            FROM ${DATABASE_SCHEMA}.doctoravailability
            WHERE date > CURRENT_TIMESTAMP;`;

        const result = await queryExecuter(query);
        return result;
    } catch (error) {
        console.error("Error Fetching Doctors:", error.message || error);
        throw new Error("Error Fetching Doctors");
    }
}


module.exports = {
    addDoctorAvailabilityModel,
    getDoctorAvailabilityModel,
    getAllAvailableDoctorIdsModel
}