const express = require("express");

const {
    createResponseUnit,
    getResponseUnits,
    getAvailableUnits,
    updateUnitStatus,
    updateUnitLocation
} = require("../../controllers/responseUnit/responseUnit.controller");

const adminAuth = require("../../middlewares/admin.middleware");

const router = express.Router();



router.post(
    "/",
    adminAuth,
    createResponseUnit
);



router.get(
    "/available",
    adminAuth,
    getAvailableUnits
);



router.get(
    "/",
    adminAuth,
    getResponseUnits
);



router.put(
    "/:unitId/status",
    adminAuth,
    updateUnitStatus
);



router.put(
    "/:unitId/location",
    adminAuth,
    updateUnitLocation
);

module.exports = router;