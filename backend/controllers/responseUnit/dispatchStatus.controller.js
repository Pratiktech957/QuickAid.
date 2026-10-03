const {
    Dispatch,
    ResponseUnit,
    Emergency,
    EmergencyLog
} = require("../../models");

const updateDispatchStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const dispatchId = req.params.id;

        const allowedStatuses = [
            "dispatched",
            "accepted",
            "en_route",
            "arrived",
            "completed",
            "cancelled"
        ];

        if (!status) {
            return res.status(400).json({
                success: false,
                message: "Dispatch status is required"
            });
        }

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid dispatch status"
            });
        }

        const dispatch = await Dispatch.findById(
            dispatchId
        );

        if (!dispatch) {
            return res.status(404).json({
                success: false,
                message: "Dispatch record not found"
            });
        }

        const validTransitions = {
            dispatched: [
                "accepted",
                "cancelled"
            ],
            accepted: [
                "en_route",
                "cancelled"
            ],
            en_route: [
                "arrived",
                "cancelled"
            ],
            arrived: [
                "completed"
            ],
            completed: [],
            cancelled: []
        };

        if (
            !validTransitions[dispatch.status] ||
            !validTransitions[dispatch.status].includes(
                status
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    `Cannot change dispatch status from ${dispatch.status} to ${status}`
            });
        }

        const unit = await ResponseUnit.findOne({
            unit_id: dispatch.unit_id
        });

        if (!unit) {
            return res.status(404).json({
                success: false,
                message: "Response unit not found"
            });
        }

        const emergency = await Emergency.findOne({
            emergency_id: dispatch.emergency_id
        });

        if (!emergency) {
            return res.status(404).json({
                success: false,
                message: "Emergency not found"
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
                    "You are not authorized to manage this emergency"
            });
        }

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

        const activeDispatchStatuses = [
            "dispatched",
            "accepted",
            "en_route",
            "arrived"
        ];

        if (
            activeDispatchStatuses.includes(status) &&
            unit.assigned_emergency &&
            unit.assigned_emergency !==
            dispatch.emergency_id
        ) {
            return res.status(409).json({
                success: false,
                message:
                    `Unit ${unit.unit_id} is already assigned to another emergency`
            });
        }

        dispatch.status = status;

        if (status === "accepted") {
            dispatch.accepted_at = now;
        }

        if (status === "en_route") {
            dispatch.en_route_at = now;
        }

        if (status === "arrived") {
            dispatch.arrived_at = now;
        }

        if (status === "completed") {
            dispatch.completed_at = now;
        }

        if (status === "cancelled") {
            dispatch.cancelled_at = now;
        }

        await dispatch.save();

        if (
            status === "completed" ||
            status === "cancelled"
        ) {
            const cooldownUntil = new Date(
                now.getTime() + 5 * 60 * 1000
            );

            unit.status = "busy";
            unit.assigned_emergency = null;
            unit.cooldown_until =
                cooldownUntil;
        } else {
            unit.status = "dispatched";
            unit.assigned_emergency =
                dispatch.emergency_id;
            unit.cooldown_until = null;
        }

        unit.last_updated = now;

        await unit.save();

        if (
            status === "accepted" ||
            status === "en_route" ||
            status === "arrived"
        ) {
            emergency.status = "in_progress";
            emergency.updated_at = now;

            await emergency.save();
        }

        const logActions = {
            accepted: "dispatch_accepted",
            en_route: "unit_en_route",
            arrived: "unit_arrived",
            completed: "response_completed",
            cancelled: "dispatch_cancelled"
        };

        const logAction = logActions[status];

        if (logAction) {
            let logNotes = "";

            if (status === "accepted") {
                logNotes =
                    `Unit ${dispatch.unit_id} accepted dispatch for emergency ${dispatch.emergency_id}`;
            }

            if (status === "en_route") {
                logNotes =
                    `Unit ${dispatch.unit_id} is en route to emergency ${dispatch.emergency_id}`;
            }

            if (status === "arrived") {
                logNotes =
                    `Unit ${dispatch.unit_id} arrived at emergency ${dispatch.emergency_id}`;
            }

            if (status === "completed") {
                logNotes =
                    `Unit ${dispatch.unit_id} completed response for emergency ${dispatch.emergency_id}. 5-minute cooldown started.`;
            }

            if (status === "cancelled") {
                logNotes =
                    `Dispatch for unit ${dispatch.unit_id} was cancelled. 5-minute cooldown started.`;
            }

            await EmergencyLog.create({
                emergency_id:
                    dispatch.emergency_id,
                action:
                    logAction,
                department:
                    unit.department,
                admin_name:
                    req.admin?.name ||
                    req.admin?.username,
                notes:
                    logNotes,
                created_at:
                    now
            });
        }

        return res.json({
            success: true,
            message:
                `Dispatch status updated to ${status}`,
            data: {
                dispatch,
                unit,
                emergency
            }
        });

    } catch (error) {
        console.error(
            "Error updating dispatch status:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to update dispatch status",
            error:
                error.message
        });
    }
};

const makeUnitAvailable = async (req, res) => {
    try {
        const { unitId } = req.params;

        if (!unitId) {
            return res.status(400).json({
                success: false,
                message: "Unit ID is required"
            });
        }

        const unit = await ResponseUnit.findOne({
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

        if (unit.assigned_emergency) {
            return res.status(409).json({
                success: false,
                message:
                    `Unit ${unit.unit_id} is actively assigned to emergency ${unit.assigned_emergency} and cannot be made available`
            });
        }

        if (unit.status !== "busy") {
            return res.status(400).json({
                success: false,
                message:
                    `Unit is currently ${unit.status}`
            });
        }

        if (!unit.cooldown_until) {
            return res.status(400).json({
                success: false,
                message:
                    "Unit has no active cooldown"
            });
        }

        if (now < unit.cooldown_until) {
            const remainingMilliseconds =
                unit.cooldown_until.getTime() -
                now.getTime();

            const remainingSeconds =
                Math.ceil(
                    remainingMilliseconds /
                    1000
                );

            const remainingMinutes =
                Math.ceil(
                    remainingSeconds /
                    60
                );

            return res.status(409).json({
                success: false,
                message:
                    `Unit is still in cooldown. ${remainingMinutes} minute(s) remaining.`,
                cooldown_until:
                    unit.cooldown_until
            });
        }

        unit.status = "available";
        unit.assigned_emergency = null;
        unit.cooldown_until = null;
        unit.last_updated = now;

        await unit.save();

        return res.json({
            success: true,
            message:
                "Response unit is now available",
            data: unit
        });

    } catch (error) {
        console.error(
            "Error making unit available:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to make unit available",
            error:
                error.message
        });
    }
};

module.exports = {
    updateDispatchStatus,
    makeUnitAvailable
};