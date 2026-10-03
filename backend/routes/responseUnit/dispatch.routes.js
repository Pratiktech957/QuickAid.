const express = require("express");

const {
    dispatchUnit,
    getDispatchByEmergency
} = require("../../controllers/responseUnit/dispatch.controller");

const adminAuth = require("../../middlewares/admin.middleware");

const router = express.Router();

router.get(
    "/emergency/:emergencyId",
    adminAuth,
    getDispatchByEmergency
);

router.post(
    "/",
    adminAuth,
    dispatchUnit
);

module.exports = router;