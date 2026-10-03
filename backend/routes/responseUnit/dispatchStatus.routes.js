const express = require("express");

const {
    updateDispatchStatus
} = require("../../controllers/responseUnit/dispatchStatus.controller");

const adminAuth = require("../../middlewares/admin.middleware");

const router = express.Router();

router.put(
    "/:id/status",
    adminAuth,
    updateDispatchStatus
);

module.exports = router;