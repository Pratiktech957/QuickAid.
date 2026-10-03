const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const http = require("http");
const socketIo = require("socket.io");
require("dotenv").config();

const connectDB = require("./config/db");

const adminRoutes = require("./routes/admin/admin.routes");
const emergencyRoutes = require("./routes/emergency/emergency.routes");
const responseUnitRoutes = require("./routes/responseUnit/responseUnit.routes");
const dispatchRoutes = require("./routes/responseUnit/dispatch.routes");
const dispatchStatusRoutes = require("./routes/responseUnit/dispatchStatus.routes");

const aiRoutes = require("./routes/ai/ai.routes");

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3001;

app.use(cors());

app.use(express.json());

app.use(
  bodyParser.json({
    limit: "10mb"
  })
);

app.use(
  bodyParser.urlencoded({
    extended: true,
    limit: "10mb"
  })
);

connectDB();

app.use("/api/admin", adminRoutes);
app.use("/api/emergency", emergencyRoutes);
app.use("/api/response-units", responseUnitRoutes);
app.use("/api/dispatch", dispatchRoutes);
app.use("/api/dispatch", dispatchStatusRoutes);

app.use("/api/ai", aiRoutes);

const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.set("io", io);

const activeSirens = new Map();

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("join-user", (userData) => {
    if (userData.mobile) {
      socket.join(`user-${userData.mobile}`);
    }
  });

  socket.on("join-admin", (adminId) => {
    socket.join("admin-room");
    socket.adminId = adminId;
  });

  socket.on("join-emergency", (emergencyId) => {
    socket.join(`emergency-${emergencyId}`);
  });

  socket.on("location-update", (data) => {
    socket
      .to("admin-room")
      .emit("user-location-update", data);
  });

  socket.on("response-unit-location", (data) => {
    socket
      .to("admin-room")
      .emit("response-unit-location", data);

    socket
      .to(`emergency-${data.emergencyId}`)
      .emit("unit-location-update", data);
  });

  socket.on("emergency-status-update", (data) => {
    const {
      emergencyId,
      status,
      adminName,
      notes
    } = data;

    socket
      .to("admin-room")
      .emit("emergency-status-changed", data);

    socket
      .to(`emergency-${emergencyId}`)
      .emit("emergency-status-changed", data);

    if (data.userMobile) {
      socket
        .to(`user-${data.userMobile}`)
        .emit("user-emergency-update", {
          emergencyId,
          status,
          message: `Your emergency status updated to: ${status}`,
          adminName,
          notes,
          timestamp: new Date()
        });
    }
  });

  socket.on("trigger-siren", (emergencyData) => {
    activeSirens.set(
      emergencyData.emergency_id,
      {
        emergencyData,
        triggeredAt: new Date(),
        duration: 30000
      }
    );

    io.to("admin-room").emit(
      "emergency-siren",
      {
        ...emergencyData,
        sirenDuration: 30000,
        triggeredAt: new Date()
      }
    );

    setTimeout(() => {
      if (
        activeSirens.has(
          emergencyData.emergency_id
        )
      ) {
        activeSirens.delete(
          emergencyData.emergency_id
        );

        io.to("admin-room").emit(
          "siren-stopped",
          {
            emergencyId:
              emergencyData.emergency_id
          }
        );
      }
    }, 30000);
  });

  socket.on("stop-siren", (emergencyId) => {
    if (activeSirens.has(emergencyId)) {
      activeSirens.delete(emergencyId);

      io.to("admin-room").emit(
        "siren-stopped",
        {
          emergencyId
        }
      );
    }
  });

  socket.on("get-active-sirens", () => {
    const sirens = Array.from(
      activeSirens.values()
    );

    socket.emit(
      "active-sirens",
      sirens
    );
  });

  socket.on("disconnect", () => {
    console.log(
      "Client disconnected:",
      socket.id
    );
  });
});

app.get("/api/health", (req, res) => {
  return res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date(),
    uptime: process.uptime(),
    activeSirens: activeSirens.size
  });
});



app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found"
  });
});

app.use((error, req, res, next) => {
  console.error(
    "Unhandled error:",
    error
  );

  res.status(500).json({
    success: false,
    message: "Internal server error",
    error:
      process.env.NODE_ENV === "production"
        ? "Something went wrong"
        : error.message
  });
});

server.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );

  console.log(
    `Main App: http://localhost:${PORT}`
  );

  console.log(
    `Admin Dashboard: http://localhost:${PORT}/admin`
  );

  console.log("Siren System: ACTIVE");
});