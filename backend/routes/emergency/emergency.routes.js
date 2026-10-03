const express = require("express");

const {
    createEmergency,
    getAllEmergencies,
    getUserEmergencies,
    getEmergencyById,
    updateEmergencyStatus,
    getEmergencyLogs,
    getEmergenciesByDepartment,
    getEmergencyByTrackingToken
} = require("../../controllers/emergency/emergency.controller");

const {
    assignDepartment
} = require("../../controllers/emergency/department.controller");

const adminAuth = require("../../middlewares/admin.middleware");

const router = express.Router();

router.post("/", createEmergency);

router.get("/user/:mobile", getUserEmergencies);

router.get("/track/:trackingToken", getEmergencyByTrackingToken);

router.get("/", adminAuth, getAllEmergencies);

router.get(
    "/department/:department",
    adminAuth,
    getEmergenciesByDepartment
);

router.get("/:id", adminAuth, getEmergencyById);

router.put(
    "/:id/status",
    adminAuth,
    updateEmergencyStatus
);

router.put(
    "/:id/department",
    adminAuth,
    assignDepartment
);

router.get(
    "/:id/logs",
    adminAuth,
    getEmergencyLogs
);

module.exports = router;