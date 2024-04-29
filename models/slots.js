const { queryExecuter } = require("../libs/query-executor");
const { v4: uuidv4 } = require("uuid");
const uuidValidate = require("uuid-validate");

const DATABASE_SCHEMA = 'public'; /*process.env.DATABASE_SCHEMA*/

async function addManySlotModel(slots) {
    try {
        // Start building the query
        let query = `INSERT INTO ${DATABASE_SCHEMA}.slot (`;

        // Extract keys from the first object in the array
        const keys = Object.keys(slots[0]);

        // Generate placeholders for each value set
        const placeholders = `VALUES ${slots.map((_, index) => `(${keys.map((_, i) => `$${index * keys.length + i + 1}`).join(', ')})`).join(', ')}`;

        // Flatten values array for all objects
        const values = slots.flatMap(slot => keys.map(key => slot[key]));

        // Constructing the final query
        query += `${keys.join(', ')}) ${placeholders} RETURNING *`;

        const result = await queryExecuter(query, values);
        return result;
    } catch (error) {
        console.error("Error Adding Slots:", error.message || error);
        throw new Error("Error Adding Slots");
    }
}

async function updateBookSlotById(slotId) {
    try {
        const query = `
            UPDATE ${DATABASE_SCHEMA}.slot
            SET booked = true
            WHERE id = $1
            RETURNING *`;

        const result = await queryExecuter(query, [slotId]);

        if (result.length === 0) {
            throw new Error("Slot not found");
        }

        return result[0];
    } catch (error) {
        console.error("Error Updating Slot:", error.message || error);
        throw new Error("Error Updating Slot");
    }
}

async function getAvailableSlotsByDoctorId(doctorId) {
    try {
        const query = `
        SELECT s.id AS slot_id, s.start AS slot_start
        FROM ${DATABASE_SCHEMA}.slot AS s
        JOIN ${DATABASE_SCHEMA}.doctoravailability AS da ON s.doctoravailability_id = da.id
        WHERE da.doctor_id = $1
        AND s.booked = false`;

        const values = [doctorId];
        const result = await queryExecuter(query, values);

        return result;
    } catch (error) {
        console.error("Error Fetching Available Slots:", error.message || error);
        throw new Error("Error Fetching Available Slots");
    }
}

async function updateSlotById(slotId, updatedData) {
    try {
        let query = `
        UPDATE ${DATABASE_SCHEMA}.slot
        SET`;

        const values = [slotId];
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
            throw new Error("Slot not found");
        }

        return result[0];
    } catch (error) {
        console.error("Error Updating Slot:", error.message || error);
        throw new Error("Error Updating Slot");
    }
}

async function getSlotById(slotId) {
    try {
        const query = `
        SELECT *
        FROM ${DATABASE_SCHEMA}.slot
        WHERE id = $1`;

        const result = await queryExecuter(query, [slotId]);

        if (result.length === 0) {
            throw new Error("Slot not found");
        }

        return result[0];
    } catch (error) {
        console.error("Error Fetching Slot:", error.message || error);
        throw new Error("Error Fetching Slot");
    }
}

async function deleteSlotById(slotId) {
    try {
        const query = `
        DELETE FROM ${DATABASE_SCHEMA}.slot
        WHERE id = $1
        RETURNING *`;

        const result = await queryExecuter(query, [slotId]);

        if (result.length === 0) {
            throw new Error("Slot not found");
        }

        return result[0]; // If you want to return the deleted slot
    } catch (error) {
        console.error("Error Deleting Slot:", error.message || error);
        throw new Error("Error Deleting Slot");
    }
}

async function getAvailableSlotsByDoctorIdAndDate(doctorId, date, booked) {
    try {
        // Creating the next day's date
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        // Constructing the query to filter slots for the given doctor within the date range
        let query = `
            SELECT s.id AS slot_id, s.start AS slot_start
            FROM ${DATABASE_SCHEMA}.slot AS s
            JOIN ${DATABASE_SCHEMA}.doctoravailability AS da ON s.doctoravailability_id = da.id
            WHERE da.doctor_id = $1
            AND s.start >= $2
            AND s.start < $3`;

        const values = [doctorId, date, nextDate];

        // Adding condition for booked slots if specified
        if (booked !== undefined) {
            query += `
            AND s.booked = $4`;
            values.push(booked);
        }

        const result = await queryExecuter(query, values);

        return result;
    } catch (error) {
        console.error("Error Fetching Available Slots:", error.message || error);
        throw new Error("Error Fetching Available Slots");
    }
}


module.exports = {
    addManySlotModel,
    updateBookSlotById,
    getAvailableSlotsByDoctorId,
    updateSlotById,
    getSlotById,
    deleteSlotById,
    getAvailableSlotsByDoctorIdAndDate
}