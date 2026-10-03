const {
    ResponseUnit
} = require("../../models");

const createResponseUnit = async (req, res) => {
    try {
        const {
            unit_id,
            unit_type,
            department,
            unit_name,
            current_location
        } = req.body;

        if (
            !unit_id ||
            !unit_type ||
            !department ||
            !unit_name ||
            !current_location
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "unit_id, unit_type, department, unit_name and current_location are required"
            });
        }

        const {
            latitude,
            longitude
        } = current_location;

        if (
            latitude === undefined ||
            longitude === undefined
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "latitude and longitude are required"
            });
        }

        const adminDepartment =
            req.admin.department;

        if (
            adminDepartment !== "superadmin" &&
            department !== adminDepartment
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "You are not authorized to create a response unit for this department"
            });
        }

        const existingUnit =
            await ResponseUnit.findOne({
                unit_id
            });

        if (existingUnit) {
            return res.status(409).json({
                success: false,
                message:
                    "Response unit with this unit_id already exists"
            });
        }

        const unit =
            await ResponseUnit.create({
                unit_id,
                unit_type,
                department,
                unit_name,
                current_location: {
                    latitude,
                    longitude
                },
                status: "available",
                assigned_emergency: null,
                cooldown_until: null,
                last_updated: new Date()
            });

        return res.status(201).json({
            success: true,
            message:
                "Response unit created successfully",
            data: unit
        });

    } catch (error) {
        console.error(
            "Error creating response unit:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to create response unit",
            error:
                error.message
        });
    }
};

const getResponseUnits = async (req, res) => {
    try {
        const adminDepartment =
            req.admin.department;

        const filter =
            adminDepartment === "superadmin"
                ? {}
                : {
                    department:
                        adminDepartment
                };

        const units =
            await ResponseUnit
                .find(filter)
                .sort({
                    last_updated: -1
                });

        const now = new Date();

        for (const unit of units) {
            if (
                unit.status === "busy" &&
                unit.cooldown_until &&
                now >= unit.cooldown_until &&
                !unit.assigned_emergency
            ) {
                unit.status = "available";
                unit.cooldown_until = null;
                unit.last_updated = now;

                await unit.save();
            }
        }

        return res.json({
            success: true,
            data: units
        });

    } catch (error) {
        console.error(
            "Error fetching response units:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to fetch response units",
            error:
                error.message
        });
    }
};

const getAvailableUnits = async (req, res) => {
    try {
        const {
            department,
            unit_type
        } = req.query;

        const adminDepartment =
            req.admin.department;

        if (
            adminDepartment !== "superadmin" &&
            department &&
            department !== adminDepartment
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "You are not authorized to access response units for this department"
            });
        }

        const now = new Date();

        await ResponseUnit.updateMany(
            {
                status: "busy",
                cooldown_until: {
                    $ne: null,
                    $lte: now
                },
                assigned_emergency: null
            },
            {
                $set: {
                    status: "available",
                    cooldown_until: null,
                    last_updated: now
                }
            }
        );

        const filter = {
            status: "available",
            $or: [
                {
                    cooldown_until: null
                },
                {
                    cooldown_until: {
                        $lte: now
                    }
                }
            ]
        };

        if (adminDepartment !== "superadmin") {
            filter.department =
                adminDepartment;
        } else if (department) {
            filter.department =
                department;
        }

        if (unit_type) {
            filter.unit_type =
                unit_type;
        }

        const units =
            await ResponseUnit
                .find(filter)
                .sort({
                    last_updated: -1
                });

        return res.json({
            success: true,
            data: units
        });

    } catch (error) {
        console.error(
            "Error fetching available units:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to fetch available response units",
            error:
                error.message
        });
    }
};

const updateUnitStatus = async (req, res) => {
    try {
        const {
            status
        } = req.body;

        const unitId =
            req.params.unitId;

        const allowedStatuses = [
            "available",
            "dispatched",
            "busy",
            "offline"
        ];

        if (!status) {
            return res.status(400).json({
                success: false,
                message:
                    "Status is required"
            });
        }

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid response unit status"
            });
        }

        const unit =
            await ResponseUnit.findOne({
                unit_id: unitId
            });

        if (!unit) {
            return res.status(404).json({
                success: false,
                message:
                    "Response unit not found"
            });
        }

        const adminDepartment =
            req.admin.department;

        if (
            adminDepartment !== "superadmin" &&
            unit.department !== adminDepartment
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "You are not authorized to manage this response unit"
            });
        }

        const now = new Date();

        if (
            unit.assigned_emergency &&
            (
                unit.status === "dispatched" ||
                unit.status === "busy"
            )
        ) {
            return res.status(409).json({
                success: false,
                message:
                    `Unit ${unit.unit_id} is actively assigned to emergency ${unit.assigned_emergency}. Complete or cancel the dispatch first.`
            });
        }

        if (
            unit.status === "busy" &&
            unit.cooldown_until
        ) {
            if (now < unit.cooldown_until) {
                const remainingMilliseconds =
                    unit.cooldown_until.getTime() -
                    now.getTime();

                const remainingMinutes =
                    Math.ceil(
                        remainingMilliseconds /
                        (60 * 1000)
                    );

                if (status === "available") {
                    return res.status(409).json({
                        success: false,
                        message:
                            `Unit is still in cooldown. ${remainingMinutes} minute(s) remaining.`,
                        cooldown_until:
                            unit.cooldown_until
                    });
                }

                if (
                    status === "dispatched" ||
                    status === "offline"
                ) {
                    return res.status(409).json({
                        success: false,
                        message:
                            `Unit is in cooldown until ${unit.cooldown_until.toISOString()}`
                    });
                }
            }

            if (
                now >= unit.cooldown_until &&
                !unit.assigned_emergency
            ) {
                unit.status = "available";
                unit.cooldown_until = null;
                unit.last_updated = now;

                await unit.save();
            }
        }

        if (status === "available") {
            if (unit.assigned_emergency) {
                return res.status(409).json({
                    success: false,
                    message:
                        `Unit ${unit.unit_id} is assigned to emergency ${unit.assigned_emergency} and cannot be made available manually`
                });
            }

            if (
                unit.cooldown_until &&
                now < unit.cooldown_until
            ) {
                return res.status(409).json({
                    success: false,
                    message:
                        `Unit is still in cooldown until ${unit.cooldown_until.toISOString()}`,
                    cooldown_until:
                        unit.cooldown_until
                });
            }

            unit.status = "available";
            unit.assigned_emergency = null;
            unit.cooldown_until = null;
        }

        if (status === "dispatched") {
            return res.status(403).json({
                success: false,
                message:
                    "Response unit cannot be manually dispatched. Use the dispatch operation."
            });
        }

        if (
            status === "busy" &&
            !unit.assigned_emergency
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "Response unit cannot be manually changed to busy without an active dispatch or cooldown"
            });
        }

        if (status === "offline") {
            if (unit.assigned_emergency) {
                return res.status(409).json({
                    success: false,
                    message:
                        `Unit ${unit.unit_id} is actively assigned to emergency ${unit.assigned_emergency} and cannot be taken offline`
                });
            }

            if (
                unit.cooldown_until &&
                now < unit.cooldown_until
            ) {
                return res.status(409).json({
                    success: false,
                    message:
                        "Unit is still in cooldown and cannot be taken offline"
                });
            }

            unit.status = "offline";
            unit.assigned_emergency = null;
            unit.cooldown_until = null;
        }

        unit.last_updated = now;

        await unit.save();

        return res.json({
            success: true,
            message:
                "Response unit status updated successfully",
            data: unit
        });

    } catch (error) {
        console.error(
            "Error updating response unit status:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to update response unit status",
            error:
                error.message
        });
    }
};

const updateUnitLocation = async (req, res) => {
    try {
        const {
            latitude,
            longitude
        } = req.body;

        if (
            latitude === undefined ||
            longitude === undefined
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "latitude and longitude are required"
            });
        }

        const unit =
            await ResponseUnit.findOne({
                unit_id:
                    req.params.unitId
            });

        if (!unit) {
            return res.status(404).json({
                success: false,
                message:
                    "Response unit not found"
            });
        }

        const adminDepartment =
            req.admin.department;

        if (
            adminDepartment !== "superadmin" &&
            unit.department !== adminDepartment
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "You are not authorized to manage this response unit"
            });
        }

        unit.current_location = {
            latitude,
            longitude
        };

        unit.last_updated =
            new Date();

        await unit.save();

        return res.json({
            success: true,
            message:
                "Response unit location updated successfully",
            data: unit
        });

    } catch (error) {
        console.error(
            "Error updating response unit location:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to update response unit location",
            error:
                error.message
        });
    }
};

module.exports = {
    createResponseUnit,
    getResponseUnits,
    getAvailableUnits,
    updateUnitStatus,
    updateUnitLocation
};