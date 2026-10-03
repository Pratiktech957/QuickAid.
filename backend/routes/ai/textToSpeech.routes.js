const express = require("express");

const {
    generateSpeech
} = require("../../controllers/ai/textToSpeech.controller");

const router = express.Router();

router.post("/", generateSpeech);

module.exports = router;