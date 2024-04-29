const cron = require('node-cron');
const doctorModel = require("../models/doctors.js")
const slotModel = require("../models/slots.js")
const doctorAvailabilityModel = require("../models/doctor-availability.js")
const appointmentModel = require("../models/appointments.js")
const moment = require('moment');
const Config = require("../config/serverConfig.js")
const config = new Config()
const mail = require("./email.js");

// Define the cron job
const doctorNextAvailabilityScheduler = cron.schedule('0 0 * * *', async () => {

    try {
        // This function will run every day at midnight (00:00)
        let doctorList = await doctorModel.getDoctorsWithNextAvailability()
        if (doctorList && doctorList.length > 0) {
            for (let j = 0; j < doctorList.length; j++) {
                const doctor = doctorList[j];

                let currentDate = new Date();
                currentDate.setDate(currentDate.getDate() + 2);
                for (let i = 0; i < 30; i++) {
                    // Clone the current date
                    let loginDate = new Date(currentDate);
                    let logoutDate = new Date(currentDate);
                    // Set login time to 9 AM
                    loginDate.setUTCHours(9, 0, 0, 0);
                    // Set logout time to 5 PM
                    logoutDate.setUTCHours(17, 0, 0, 0);

                    let doctoravailability = {
                        doctor_id: doctor.id,
                        date: currentDate,
                        login: loginDate.toISOString(),
                        logout: logoutDate.toISOString()
                    }

                    // const newDoctorData = req.body;
                    const newDoctoravailability = await doctorAvailabilityModel.addDoctorAvailabilityModel(doctoravailability);
                    // creating time slots
                    // creating start timestamp array
                    const slotDetails = [];
                    const loginTime = newDoctoravailability.login
                    const logoutTime = newDoctoravailability.logout

                    for (let time = new Date(loginTime); time < logoutTime; time.setHours(time.getHours() + 1)) {
                        slotDetails.push({
                            doctoravailability_id: newDoctoravailability.id,
                            start: new Date(time)
                        });
                    }

                    let addedSlots = await slotModel.addManySlotModel(slotDetails)

                    // Move to the next day
                    currentDate.setDate(currentDate.getDate() + 1);
                }
                await doctorModel.updateDoctorModel(doctor.id, { last_availability_date: currentDate })

            }
        }
        console.log('Cron job executed! at ', new Date().toUTCString());
    } catch (error) {
        console.log('Error: while executing cron job', error);
    }

}, {
    scheduled: true, // Start the cron job immediately
    //   timezone: 'UTC' // Set the timezone (optional)
});

const schedulerAppointmentNotify = cron.schedule('*/1 * * * *', async () => {

    try {
        const currentTime = new Date();
        const fifteenMinutesAhead = new Date(currentTime.getTime() + (15 * 60000)); // Calculate 15 minutes ahead
        fifteenMinutesAhead.setSeconds(0); // Set seconds to 0
        fifteenMinutesAhead.setMilliseconds(0); // Set milliseconds to 0 to match the database format

        // Assuming appointmentTime is used as a timestamp in the database
        // Convert appointmentTime to a format compatible with the database timestamp
        const formattedAppointmentTime = fifteenMinutesAhead.toISOString().slice(0, 19).replace('T', ' '); // Format: 'YYYY-MM-DD HH:MM:SS'

        const appointments = await appointmentModel.getAppointmentByTime(fifteenMinutesAhead);



        if (appointments && appointments.length > 0) {
            for (let index = 0; index < appointments.length; index++) {
                const appointment = appointments[index];
                // formating the appointment time to send the email -
                const timestamp = appointment.appointment_time;
                const dateTime = moment(timestamp);
                const formattedDate = dateTime.format('MMMM DD, YYYY');
                const formattedTime = dateTime.format('hh:mm A');
                const mail_option = {
                    filename: "appointmentNotify",
                    data: {
                        appointment_created_by: `${appointment.user_first_name} ${appointment.user_last_name}` || "",
                        appointment_user_name: `${appointment.appointment_user_first_name} ${appointment.appointment_user_last_name}` || "",
                        appointment_time: `${formattedTime} ${formattedDate}` || "",
                        doctor_name: `${appointment.doctor_first_name} ${appointment.doctor_last_name}` || "",
                        note_for_doctor: `${appointment.note_for_doctor}` || "",
                        symptoms: `${appointment.symptoms}` || ""
                    },
                    subject: `${config.appName} - Appointment notify - Appointment is in 15 minutes`,
                    user: {
                        email: appointment.user_email,
                    },
                };
                let send_mail = await mail.send(mail_option);
            }
            const logTime = new Date();
            console.log(' Sent Appointment notification Current time:', logTime.toLocaleString('en-US'));
        }

    } catch (error) {
        console.log('Error: while executing cron job', error);
    }

}, {
    scheduled: true, // Start the cron job immediately
    //   timezone: 'UTC' // Set the timezone (optional)
});
// Start the cron job
// Start the cron job
// task.start();

module.exports = {
    doctorNextAvailabilityScheduler,
    schedulerAppointmentNotify
}

// Stop the cron job after a certain time (optional)
// setTimeout(() => {
//   task.stop();
//   console.log('Cron job stopped!');
// }, 10000); // Stop after 10 seconds (for example)
