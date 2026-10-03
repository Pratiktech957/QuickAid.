const {
    Emergency,
    EmergencyLog
} = require("../../models");

const assignDepartment = async (req, res) => {
    try {
        const { department, notes } = req.body;

        const allowedDepartments = [
            "police",
            "medical",
            "fire",
            "multi"
        ];

        if (!department) {
            return res.status(400).json({
                success: false,
                message: "Department is required"
            });
        }

        if (!allowedDepartments.includes(department)) {
            return res.status(400).json({
                success: false,
                message: "Invalid department"
            });
        }

        const emergency = await Emergency.findOne({
            emergency_id: req.params.id
        });

        if (!emergency) {
            return res.status(404).json({
                success: false,
                message: "Emergency not found"
            });
        }

        if (
            emergency.status === "resolved" ||
            emergency.status === "cancelled"
        ) {
            return res.status(400).json({
                success: false,
                message: `Cannot assign department to ${emergency.status} emergency`
            });
        }

        const previousDepartment = emergency.department;

        emergency.department = department;
        emergency.updated_at = new Date();

        await emergency.save();

        await EmergencyLog.create({
            emergency_id: emergency.emergency_id,
            action: "department_assigned",
            department,
            admin_name: req.admin?.name,
            notes: notes || `Department changed from ${previousDepartment || "pending"} to ${department}`,
            created_at: new Date()
        });

        return res.json({
            success: true,
            message: "Emergency department assigned successfully",
            data: emergency
        });

    } catch (error) {
        console.error("Error assigning department:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to assign emergency department",
            error: error.message
        });
    }
};

module.exports = {
    assignDepartment
};