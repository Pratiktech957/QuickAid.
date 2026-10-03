const {
    Emergency,
    ResponseUnit,
    Dispatch,
    EmergencyLog
} = require("../../models");

const dispatchUnit = async (req, res) => {
    try {
        const {
            emergency_id,
            unit_id
        } = req.body;

        if (!emergency_id || !unit_id) {
            return res.status(400).json({
                success: false,
                message:
                    "emergency_id and unit_id are required"
            });
        }

        const emergency = await Emergency.findOne({
            emergency_id
        });

        if (!emergency) {
            return res.status(404).json({
                success: false,
                message:
                    "Emergency not found"
            });
        }

        if (
            emergency.status === "resolved" ||
            emergency.status === "cancelled"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    `Cannot dispatch unit for ${emergency.status} emergency`
            });
        }

        if (
            !emergency.department ||
            emergency.department === "pending"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Emergency department must be assigned before dispatch"
            });
        }

        const adminDepartment =
            req.admin.department;

        if (
            adminDepartment !== "superadmin" &&
            emergency.department !== adminDepartment &&
            emergency.department !== "multi"
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "You are not authorized to dispatch for this emergency"
            });
        }

        const unit = await ResponseUnit.findOne({
            unit_id
        });

        if (!unit) {
            return res.status(404).json({
                success: false,
                message:
                    "Response unit not found"
            });
        }

        if (unit.status !== "available") {
            return res.status(400).json({
                success: false,
                message:
                    `Unit is currently ${unit.status}`
            });
        }

        if (
            adminDepartment !== "superadmin" &&
            unit.department !== adminDepartment
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "You are not authorized to dispatch this response unit"
            });
        }

        const departmentMatch =
            emergency.department === "multi" ||
            emergency.department === unit.department;

        if (!departmentMatch) {
            return res.status(400).json({
                success: false,
                message:
                    `Unit department (${unit.department}) does not match emergency department (${emergency.department})`
            });
        }

        const dispatch = await Dispatch.create({
            emergency_id:
                emergency.emergency_id,
            unit_id:
                unit.unit_id,
            dispatched_by:
                req.admin.username,
            status:
                "dispatched",
            dispatched_at:
                new Date()
        });

        unit.status = "dispatched";
        unit.assigned_emergency =
            emergency.emergency_id;
        unit.last_updated =
            new Date();

        await unit.save();

        emergency.status = "in_progress";

        if (
            emergency.response_time === null ||
            emergency.response_time === undefined
        ) {
            emergency.response_time =
                new Date();
        }

        emergency.updated_at =
            new Date();

        const alreadyAssigned =
            emergency.assigned_units.some(
                (assignedUnit) =>
                    assignedUnit.unit_id ===
                    unit.unit_id
            );

        if (!alreadyAssigned) {
            emergency.assigned_units.push({
                unit_type:
                    unit.unit_type,
                unit_id:
                    unit.unit_id,
                assigned_at:
                    new Date()
            });
        }

        await emergency.save();

        await EmergencyLog.create({
            emergency_id:
                emergency.emergency_id,
            action:
                "unit_dispatched",
            department:
                unit.department,
            admin_name:
                req.admin?.name ||
                req.admin?.username,
            notes:
                `Unit ${unit.unit_id} dispatched to emergency ${emergency.emergency_id}`,
            created_at:
                new Date()
        });

        return res.status(201).json({
            success: true,
            message:
                "Response unit dispatched successfully",
            data: {
                dispatch,
                unit,
                emergency
            }
        });

    } catch (error) {
        console.error(
            "Error dispatching response unit:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to dispatch response unit",
            error:
                error.message
        });
    }
};

const getDispatchByEmergency = async (
    req,
    res
) => {
    try {
        const { emergencyId } =
            req.params;

        if (!emergencyId) {
            return res.status(400).json({
                success: false,
                message:
                    "Emergency ID is required"
            });
        }

        const emergency =
            await Emergency.findOne({
                emergency_id:
                    emergencyId
            });

        if (!emergency) {
            return res.status(404).json({
                success: false,
                message:
                    "Emergency not found"
            });
        }

        const adminDepartment =
            req.admin.department;

        if (
            adminDepartment !== "superadmin" &&
            emergency.department !== adminDepartment &&
            emergency.department !== "multi"
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "You are not authorized to access this emergency"
            });
        }

        const dispatch =
            await Dispatch.findOne({
                emergency_id:
                    emergencyId,
                status: {
                    $nin: [
                        "completed",
                        "cancelled"
                    ]
                }
            }).sort({
                createdAt: -1
            });

        if (!dispatch) {
            return res.status(404).json({
                success: false,
                message:
                    "No active dispatch found for this emergency"
            });
        }

        const unit =
            await ResponseUnit.findOne({
                unit_id:
                    dispatch.unit_id
            });

        if (!unit) {
            return res.status(404).json({
                success: false,
                message:
                    "Response unit not found"
            });
        }

        if (
            adminDepartment !== "superadmin" &&
            unit.department !== adminDepartment
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "You are not authorized to access this response unit"
            });
        }

        return res.json({
            success: true,
            data: {
                dispatch,
                unit,
                emergency
            }
        });

    } catch (error) {
        console.error(
            "Error getting dispatch by emergency:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to get dispatch",
            error:
                error.message
        });
    }
};

module.exports = {
    dispatchUnit,
    getDispatchByEmergency
};