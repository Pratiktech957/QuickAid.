const express = require("express");

const {
    askAI
} = require("../../controllers/ai/ai.controller");

const router = express.Router();


router.post("/", askAI);


module.exports = router;