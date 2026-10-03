require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const { Admin } = require("./models");

const resetSuperadmin = async () => {
    try {
        await mongoose.connect(
            process.env.MONGO_URI
        );

        console.log(
            "MongoDB connected successfully"
        );

        const username = "super_admin";

        const newPassword =
            process.env.SUPERADMIN_NEW_PASSWORD;

        if (!newPassword) {
            console.log(
                "SUPERADMIN_NEW_PASSWORD is required"
            );

            return;
        }

        const hashedPassword =
            await bcrypt.hash(
                newPassword,
                12
            );

        const superadmin =
            await Admin.findOneAndUpdate(
                {
                    username,
                    department: "superadmin"
                },
                {
                    password: hashedPassword
                },
                {
                    new: true
                }
            );

        if (!superadmin) {
            console.log(
                "Superadmin not found"
            );

            return;
        }

        console.log(
            "Superadmin password reset successfully"
        );

        console.log(
            "Username:",
            superadmin.username
        );

        console.log(
            "Department:",
            superadmin.department
        );

    } catch (error) {
        console.error(
            "Password reset error:",
            error
        );
    } finally {
        await mongoose.disconnect();
    }
};

resetSuperadmin();