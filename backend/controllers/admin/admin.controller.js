const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Admin } = require("../../models");

const adminSignup = async (req, res) => {
    try {
        const {
            username,
            password,
            name,
            department,
            phone,
            email
        } = req.body;

        if (!username || !password || !name || !department) {
            return res.status(400).json({
                success: false,
                message: "Username, password, name and department are required"
            });
        }

        if (department === "superadmin") {
            return res.status(403).json({
                success: false,
                message: "Superadmin cannot be created through public signup"
            });
        }

        const existingAdmin = await Admin.findOne({
            username
        });

        if (existingAdmin) {
            return res.status(409).json({
                success: false,
                message: "Username already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(
            password,
            12
        );

        const admin = new Admin({
            username,
            password: hashedPassword,
            name,
            department,
            phone,
            email
        });

        await admin.save();

        return res.status(201).json({
            success: true,
            message: "Admin signup successful",
            admin: {
                id: admin._id,
                username: admin.username,
                name: admin.name,
                department: admin.department,
                phone: admin.phone,
                email: admin.email
            }
        });
    } catch (error) {
        console.error("Admin signup error:", error);

        return res.status(500).json({
            success: false,
            message: "Admin signup failed"
        });
    }
};

const adminLogin = async (req, res) => {
    try {
        const {
            username,
            password
        } = req.body;

        const admin = await Admin.findOne({
            username
        });

        if (!admin) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        if (!admin.is_active) {
            return res.status(403).json({
                success: false,
                message: "Admin account is inactive"
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            admin.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        const token = jwt.sign(
            {
                id: admin._id,
                username: admin.username,
                name: admin.name,
                department: admin.department
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1h"
            }
        );

        return res.json({
            success: true,
            message: "Login successful",
            token,
            admin: {
                id: admin._id,
                username: admin.username,
                name: admin.name,
                department: admin.department,
                phone: admin.phone,
                email: admin.email
            }
        });

    } catch (error) {
        console.error("Admin login error:", error);

        return res.status(500).json({
            success: false,
            message: "Login failed"
        });
    }
};
const setupSuperadmin = async (req, res) => {
    try {
        const {
            setupKey,
            username,
            password,
            name,
            phone,
            email
        } = req.body;

        if (
            !setupKey ||
            !username ||
            !password ||
            !name
        ) {
            return res.status(400).json({
                success: false,
                message: "Setup key, username, password and name are required"
            });
        }

        if (setupKey !== process.env.SUPERADMIN_SETUP_KEY) {
            return res.status(403).json({
                success: false,
                message: "Invalid superadmin setup key"
            });
        }

        const existingSuperadmin = await Admin.findOne({
            department: "superadmin"
        });

        if (existingSuperadmin) {
            return res.status(409).json({
                success: false,
                message: "Superadmin already exists"
            });
        }

        const existingAdmin = await Admin.findOne({
            username
        });

        if (existingAdmin) {
            return res.status(409).json({
                success: false,
                message: "Username already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(
            password,
            12
        );

        const admin = new Admin({
            username,
            password: hashedPassword,
            name,
            department: "superadmin",
            phone,
            email
        });

        await admin.save();

        return res.status(201).json({
            success: true,
            message: "Superadmin created successfully",
            admin: {
                id: admin._id,
                username: admin.username,
                name: admin.name,
                department: admin.department,
                phone: admin.phone,
                email: admin.email
            }
        });
    } catch (error) {
        console.error("Superadmin setup error:", error);

        return res.status(500).json({
            success: false,
            message: "Superadmin setup failed"
        });
    }
};



module.exports = {
    adminSignup,
    adminLogin,
    setupSuperadmin

};