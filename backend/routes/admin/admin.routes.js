const express = require("express");

const {
    adminSignup,
    adminLogin,
    setupSuperadmin
} = require("../../controllers/admin/admin.controller");

const adminAuth = require("../../middlewares/admin.middleware");
const authorize = require("../../middlewares/authorize.middleware");

const router = express.Router();

router.post("/signup", adminSignup);

router.post("/login", adminLogin);

router.post("/setup-superadmin", setupSuperadmin);

router.get(
    "/dashboard",
    adminAuth,
    authorize("police", "medical", "fire"),
    (req, res) => {
        res.json({
            success: true,
            message: "Welcome to Admin Dashboard",
            admin: req.admin
        });
    }
);

module.exports = router;