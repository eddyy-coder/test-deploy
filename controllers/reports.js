const {
    addReportModel, getReportsByDoctorId, getReportsByUserId, deleteReportById,
    updateReportById, getReportsById
} = require("../models/reports.js");
const asyncWrapper = require("../middleware/asyncWrapper.js");

exports.addReport = asyncWrapper(async (req, res, next) => {
    //add validations to check request body
    let userDetials = req.user
    let report = {
        user_id: userDetials.id,
        // family_id,`
        ...req.body
    }
    let createdReport = await addReportModel(report)

    return res.status(200).json({
        success: true,
        message: "Added Report successfully",
        data: createdReport,
        error: {},
    });
});

exports.getReportsById = asyncWrapper(async (req, res, next) => {
    //We can pass any id by field name like docid, familyid, userid or reportid
    let body = req.body;
    if (!body) {
        return res.status(404).json({
            success: false,
            data: {},
            message: "User Not Found",
            error: { error: "User Does not exist" }
        });
    }
    let data = await getReportsById(req.body);
    return res.status(200).json({
        success: true,
        message: "List of Report Details Fetch Successfully",
        data: data,
        error: {},
    });
});

exports.getReportsByUser = asyncWrapper(async (req, res, next) => {
    if (!req.user.id) {
        return res.status(404).json({
            success: false,
            data: {},
            message: "User Not Found",
            error: { error: "User Does not exist" }
        });
    }
    let data = await getReportsByUserId(req.user.id);
    return res.status(200).json({
        success: true,
        message: "List of Report Details Fetch Successfully",
        data: data,
        error: {},
    });
});

exports.getReportsByDoctor = asyncWrapper(async (req, res, next) => {
    if (!req.doctor.id) {
        return res.status(404).json({
            success: false,
            message: "Doctor Not Found",
            data: {},
            error: { error: "Doctor Does not exist" }
        });
    }
    let data = await getReportsByDoctorId(req.doctor.id);
    return res.status(200).json({
        success: true,
        message: "List of Report Details Fetch Successfully",
        data: data,
        error: {},
    });
});

exports.deleteReportById = asyncWrapper(async (req, res, next) => {
    let id = req.params.id;
    let response = await deleteReportById(id)
    return res.status(200).json({
        success: true,
        message: "Deleted Report Successfully",
        data: {},
        error: {},
    });
});

exports.updateReportById = asyncWrapper(async (req, res, next) => {
    let id = req.params.id;
    let updatedReport = req.body
    let response = await updateReportById(id, updatedReport)
    return res.status(200).json({
        success: true,
        message: "Updated Report Successfully",
        doctor: response || [],
        error: {},
    });
});