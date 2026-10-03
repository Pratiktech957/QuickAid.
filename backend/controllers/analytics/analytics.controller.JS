const { Emergency } = require("../../models");

const getDashboardStats = async (req, res) => {
    try {
        const totalEmergencies =
            await Emergency.countDocuments();

        const pendingEmergencies =
            await Emergency.countDocuments({
                status: "pending"
            });

        const inProgressEmergencies =
            await Emergency.countDocuments({
                status: "in_progress"
            });

        const resolvedEmergencies =
            await Emergency.countDocuments({
                status: "resolved"
            });

        res.json({
            success: true,
            data: {
                total: totalEmergencies,
                pending: pendingEmergencies,
                inProgress: inProgressEmergencies,
                resolved: resolvedEmergencies
            }
        });
    } catch (error) {
        console.error(
            "Error fetching dashboard stats:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard stats",
            error: error.message
        });
    }
};

const getEmergencyAnalytics = async (req, res) => {
    try {
        const byType =
            await Emergency.aggregate([
                {
                    $group: {
                        _id: "$emergency_type",
                        count: { $sum: 1 }
                    }
                }
            ]);

        const byHour =
            await Emergency.aggregate([
                {
                    $group: {
                        _id: {
                            $hour: "$created_at"
                        },
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: {
                        "_id": 1
                    }
                }
            ]);

        const byStatus =
            await Emergency.aggregate([
                {
                    $group: {
                        _id: "$status",
                        count: { $sum: 1 }
                    }
                }
            ]);

        res.json({
            success: true,
            data: {
                byType,
                byHour,
                byStatus
            }
        });
    } catch (error) {
        console.error(
            "Error fetching analytics:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch analytics",
            error: error.message
        });
    }
};

module.exports = {
    getDashboardStats,
    getEmergencyAnalytics
};