const authorize = (...allowedDepartments) => {
    return (req, res, next) => {
        if (!req.admin) {
            return res.status(401).json({
                success: false,
                message: "Admin authentication required"
            });
        }

        if (req.admin.department === "superadmin") {
            return next();
        }

        if (!allowedDepartments.includes(req.admin.department)) {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        next();
    };
};

module.exports = authorize;