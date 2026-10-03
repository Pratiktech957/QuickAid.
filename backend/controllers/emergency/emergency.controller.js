const crypto = require("crypto");

const {
    Emergency,
    EmergencyLog
} = require("../../models");

const {
    classifyEmergency
} = require("../../services/ai/emergencyClassifier.service");

const createEmergency = async (req, res) => {
    try {
        const {
            userName,
            mobileNumber,
            location,
            description,
            address
        } = req.body;

        if (
            !userName ||
            !mobileNumber ||
            !location ||
            !description
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "User name, mobile number, location and description are required"
            });
        }

        const classification =
            await classifyEmergency(
                description
            );

        const emergencyId =
            "EMG-" +
            crypto.randomUUID();

        const trackingToken =
            crypto.randomUUID();

        const emergency =
            new Emergency({
                emergency_id:
                    emergencyId,

                tracking_token:
                    trackingToken,

                user_name:
                    userName,

                mobile_number:
                    mobileNumber,

                location,

                address,

                emergency_type:
                    classification.emergencyType,

                description,

                severity:
                    classification.severity,

                status:
                    "pending",

                department:
                    classification.department,

                created_at:
                    new Date(),

                updated_at:
                    new Date()
            });

        await emergency.save();

        await EmergencyLog.create({
            emergency_id:
                emergencyId,

            action:
                "emergency_created",

            department:
                classification.department,

            notes:
                `Emergency created and classified as ${classification.emergencyType} with ${classification.severity} severity`,

            created_at:
                new Date()
        });

        const io =
            req.app.get("io");

        if (io) {
            io.to("admin-room").emit(
                "new-emergency",
                emergency
            );

            if (
                classification.severity ===
                "critical" ||
                classification.severity ===
                "high"
            ) {
                io.to("admin-room").emit(
                    "emergency-siren",
                    emergency
                );
            }

            io.to(
                `user-${mobileNumber}`
            ).emit(
                "user-emergency-update",
                {
                    emergencyId,
                    status: "pending",
                    message:
                        "Emergency reported successfully! Help is on the way.",
                    timestamp:
                        new Date()
                }
            );
        }

        return res.status(201).json({
            success: true,
            message:
                "Emergency reported successfully",
            emergency_id:
                emergencyId,
            tracking_token:
                trackingToken,
            data:
                emergency
        });

    } catch (error) {
        console.error(
            "Error creating emergency:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to report emergency",
            error:
                error.message
        });
    }
};

const getAllEmergencies = async (req, res) => {
    try {
        const adminDepartment =
            req.admin.department;

        let filter = {};

        if (
            adminDepartment !==
            "superadmin"
        ) {
            filter = {
                department: {
                    $in: [
                        adminDepartment,
                        "multi"
                    ]
                }
            };
        }

        const emergencies =
            await Emergency
                .find(filter)
                .sort({
                    created_at: -1
                });

        return res.json({
            success: true,
            data:
                emergencies
        });

    } catch (error) {
        console.error(
            "Error fetching emergencies:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to fetch emergencies",
            error:
                error.message
        });
    }
};

const getUserEmergencies = async (
    req,
    res
) => {
    try {
        const emergencies =
            await Emergency
                .find({
                    mobile_number:
                        req.params.mobile
                })
                .sort({
                    created_at: -1
                });

        return res.json({
            success: true,
            data:
                emergencies
        });

    } catch (error) {
        console.error(
            "Error fetching user emergencies:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to fetch user emergencies",
            error:
                error.message
        });
    }
};

const getEmergencyById = async (
    req,
    res
) => {
    try {
        const emergency =
            await Emergency.findOne({
                emergency_id:
                    req.params.id
            });

        if (!emergency) {
            return res.status(404).json({
                success: false,
                message:
                    "Emergency not found"
            });
        }

        return res.json({
            success: true,
            data:
                emergency
        });

    } catch (error) {
        console.error(
            "Error fetching emergency:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to fetch emergency",
            error:
                error.message
        });
    }
};

const updateEmergencyStatus = async (
    req,
    res
) => {
    try {
        const {
            status,
            notes
        } = req.body;

        const allowedStatuses = [
            "pending",
            "in_progress",
            "resolved",
            "cancelled"
        ];

        if (
            !allowedStatuses.includes(
                status
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid emergency status"
            });
        }

        const emergency =
            await Emergency.findOne({
                emergency_id:
                    req.params.id
            });

        if (!emergency) {
            return res.status(404).json({
                success: false,
                message:
                    "Emergency not found"
            });
        }

        if (
            emergency.status ===
            "resolved" ||
            emergency.status ===
            "cancelled"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    `Cannot update ${emergency.status} emergency`
            });
        }

        emergency.status =
            status;

        emergency.updated_at =
            new Date();

        await emergency.save();

        await EmergencyLog.create({
            emergency_id:
                emergency.emergency_id,

            action:
                "status_updated",

            department:
                emergency.department,

            admin_name:
                req.admin?.name,

            notes:
                notes ||
                `Status changed to ${status}`,

            created_at:
                new Date()
        });

        const io =
            req.app.get("io");

        if (io) {
            const data = {
                emergencyId:
                    emergency.emergency_id,

                status,

                adminName:
                    req.admin?.name,

                notes,

                userMobile:
                    emergency.mobile_number,

                timestamp:
                    new Date()
            };

            io.to("admin-room").emit(
                "emergency-status-changed",
                data
            );

            io.to(
                `emergency-${emergency.emergency_id}`
            ).emit(
                "emergency-status-changed",
                data
            );

            io.to(
                `user-${emergency.mobile_number}`
            ).emit(
                "user-emergency-update",
                {
                    emergencyId:
                        emergency.emergency_id,

                    status,

                    message:
                        `Your emergency status updated to: ${status}`,

                    adminName:
                        req.admin?.name,

                    notes,

                    timestamp:
                        new Date()
                }
            );
        }

        return res.json({
            success: true,
            message:
                "Emergency status updated successfully",
            data:
                emergency
        });

    } catch (error) {
        console.error(
            "Error updating emergency status:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to update emergency",
            error:
                error.message
        });
    }
};

const getEmergencyLogs = async (
    req,
    res
) => {
    try {
        const logs =
            await EmergencyLog
                .find({
                    emergency_id:
                        req.params.id
                })
                .sort({
                    created_at: -1
                });

        return res.json({
            success: true,
            data:
                logs
        });

    } catch (error) {
        console.error(
            "Error fetching emergency logs:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to fetch emergency logs",
            error:
                error.message
        });
    }
};

const getEmergenciesByDepartment = async (
    req,
    res
) => {
    try {
        const requestedDepartment =
            req.params.department;

        const allowedDepartments = [
            "police",
            "medical",
            "fire",
            "multi"
        ];

        if (
            !allowedDepartments.includes(
                requestedDepartment
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid department"
            });
        }

        const adminDepartment =
            req.admin.department;

        if (
            adminDepartment !==
            "superadmin" &&
            requestedDepartment !==
            adminDepartment &&
            requestedDepartment !==
            "multi"
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "You are not authorized to access this department"
            });
        }

        const emergencies =
            await Emergency
                .find({
                    department:
                        requestedDepartment
                })
                .sort({
                    created_at: -1
                });

        return res.json({
            success: true,
            data:
                emergencies
        });

    } catch (error) {
        console.error(
            "Error fetching department emergencies:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to fetch department emergencies",
            error:
                error.message
        });
    }
};

const getEmergencyByTrackingToken = async (
    req,
    res
) => {
    try {
        const emergency =
            await Emergency.findOne({
                tracking_token:
                    req.params.trackingToken
            });

        if (!emergency) {
            return res.status(404).json({
                success: false,
                message:
                    "Emergency not found"
            });
        }

        return res.json({
            success: true,
            data:
                emergency
        });

    } catch (error) {
        console.error(
            "Error tracking emergency:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to track emergency",
            error:
                error.message
        });
    }
};

module.exports = {
    createEmergency,
    getAllEmergencies,
    getUserEmergencies,
    getEmergencyById,
    updateEmergencyStatus,
    getEmergencyLogs,
    getEmergenciesByDepartment,
    getEmergencyByTrackingToken
};