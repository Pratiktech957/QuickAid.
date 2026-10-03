const Groq = require("groq-sdk");

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

const languageConfig = {
    en: {
        name: "English",
        code: "en-IN",
        instruction: `
Respond completely in natural English.
Use simple, clear, conversational English.
Use short sentences.
Do not switch to another language.
`
    },

    hi: {
        name: "Hindi",
        code: "hi-IN",
        instruction: `
Respond completely in natural Hindi using Devanagari script.
Use simple, commonly understood Hindi.
Do not translate Hindi into English.
Do not switch to another language.
`
    },

    or: {
        name: "Odia",
        code: "od-IN",
        instruction: `
Respond completely in natural Odia using Odia script.
Use simple, commonly understood Odia.
Do not translate Odia into Hindi or English.
Do not switch to another language.
`
    },

    pa: {
        name: "Punjabi",
        code: "pa-IN",
        instruction: `
Respond completely in natural Punjabi using Gurmukhi script.
Use simple, commonly understood Punjabi.
Do not switch to another language.
`
    }
};

const normalizeLanguage = (language) => {
    if (!language) {
        return "en";
    }

    const value = String(language)
        .trim()
        .toLowerCase();

    if (
        value === "en" ||
        value === "en-in" ||
        value === "english"
    ) {
        return "en";
    }

    if (
        value === "hi" ||
        value === "hi-in" ||
        value === "hindi"
    ) {
        return "hi";
    }

    if (
        value === "or" ||
        value === "od" ||
        value === "od-in" ||
        value === "odia" ||
        value === "oriya"
    ) {
        return "or";
    }

    if (
        value === "pa" ||
        value === "pa-in" ||
        value === "punjabi"
    ) {
        return "pa";
    }

    return "en";
};

const conversationSteps = [
    "name",
    "mobile",
    "description",
    "location",
    "confirmation",
    "completed"
];

const injuryTypes = [
    "heart_attack",
    "stroke",
    "severe_bleeding",
    "allergic_reaction",
    "poisoning",
    "burn_injury",
    "drowning",
    "choking"
];

const injuryConfig = {
    heart_attack: {
        emergencyType: "medical",
        titles: {
            en: "Heart Attack",
            hi: "दिल का दौरा",
            or: "ହୃଦଘାତ",
            pa: "ਦਿਲ ਦਾ ਦੌਰਾ"
        }
    },

    stroke: {
        emergencyType: "medical",
        titles: {
            en: "Stroke",
            hi: "स्ट्रोक",
            or: "ଷ୍ଟ୍ରୋକ୍",
            pa: "ਸਟ੍ਰੋਕ"
        }
    },

    severe_bleeding: {
        emergencyType: "medical",
        titles: {
            en: "Severe Bleeding",
            hi: "गंभीर रक्तस्राव",
            or: "ଅତ୍ୟଧିକ ରକ୍ତସ୍ରାବ",
            pa: "ਗੰਭੀਰ ਖੂਨ ਵਗਣਾ"
        }
    },

    allergic_reaction: {
        emergencyType: "medical",
        titles: {
            en: "Allergic Reaction",
            hi: "एलर्जी की गंभीर प्रतिक्रिया",
            or: "ଗୁରୁତର ଆଲର୍ଜି",
            pa: "ਗੰਭੀਰ ਐਲਰਜੀ ਪ੍ਰਤੀਕਿਰਿਆ"
        }
    },

    poisoning: {
        emergencyType: "medical",
        titles: {
            en: "Poisoning",
            hi: "विषाक्तता / ज़हर",
            or: "ବିଷକ୍ରିୟା",
            pa: "ਜ਼ਹਿਰ ਖਾਣਾ"
        }
    },

    burn_injury: {
        emergencyType: "medical",
        titles: {
            en: "Burn Injury",
            hi: "जलने की चोट",
            or: "ପୋଡ଼ା ଆଘାତ",
            pa: "ਸੜਨ ਦੀ ਸੱਟ"
        }
    },

    drowning: {
        emergencyType: "medical",
        titles: {
            en: "Drowning",
            hi: "डूबना",
            or: "ବୁଡ଼ିଯିବା",
            pa: "ਡੁੱਬਣਾ"
        }
    },

    choking: {
        emergencyType: "medical",
        titles: {
            en: "Choking",
            hi: "दम घुटना",
            or: "ଶ୍ୱାସରୋଧ",
            pa: "ਦਮ ਘੁੱਟਣਾ"
        }
    }
};

const normalizeMobile = (mobile) => {
    if (!mobile) {
        return null;
    }

    const cleaned = String(mobile)
        .replace(/\D/g, "");

    if (/^[6-9]\d{9}$/.test(cleaned)) {
        return cleaned;
    }

    return null;
};

const normalizeName = (name) => {
    if (!name) {
        return null;
    }

    const cleaned = String(name)
        .trim()
        .replace(/\s+/g, " ");

    if (
        cleaned.length < 2 ||
        cleaned.length > 100
    ) {
        return null;
    }

    return cleaned;
};

const normalizeEmergencyType = (emergencyType) => {
    const allowedTypes = [
        "medical",
        "police",
        "fire",
        "accident",
        "other"
    ];

    if (allowedTypes.includes(emergencyType)) {
        return emergencyType;
    }

    return null;
};

const normalizeSeverity = (severity) => {
    const allowedSeverity = [
        "low",
        "medium",
        "high",
        "critical"
    ];

    if (allowedSeverity.includes(severity)) {
        return severity;
    }

    return "medium";
};

const normalizeInjury = (injury) => {
    if (!injury) {
        return null;
    }

    const value = String(injury)
        .trim()
        .toLowerCase();

    if (injuryTypes.includes(value)) {
        return value;
    }

    return null;
};

const removeMarkdown = (text) => {
    if (!text) {
        return "";
    }

    return String(text)
        .replace(/```[\s\S]*?```/g, "")
        .replace(/`([^`]*)`/g, "$1")
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/__(.*?)__/g, "$1")
        .replace(/~~(.*?)~~/g, "$1")
        .replace(/^\s*#{1,6}\s*/gm, "")
        .replace(/^\s*>\s?/gm, "")
        .replace(/^\s*[-*+]\s+/gm, "")
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
};

const conversationSchema = {
    type: "object",
    additionalProperties: false,
    properties: {
        reply: {
            type: "string"
        },

        extracted_name: {
            type: ["string", "null"]
        },

        extracted_mobile: {
            type: ["string", "null"]
        },

        extracted_description: {
            type: ["string", "null"]
        },

        emergency_type: {
            type: ["string", "null"],
            enum: [
                "medical",
                "police",
                "fire",
                "accident",
                "other",
                null
            ]
        },

        severity: {
            type: "string",
            enum: [
                "low",
                "medium",
                "high",
                "critical"
            ]
        },

        user_confirmed: {
            type: "boolean"
        },

        immediate_safety_required: {
            type: "boolean"
        },

        emergency_contact_number: {
            type: ["string", "null"]
        }
    },

    required: [
        "reply",
        "extracted_name",
        "extracted_mobile",
        "extracted_description",
        "emergency_type",
        "severity",
        "user_confirmed",
        "immediate_safety_required",
        "emergency_contact_number"
    ]
};

const injuryGuidanceSchema = {
    type: "object",
    additionalProperties: false,
    properties: {
        title: {
            type: "string"
        },

        steps: {
            type: "array",
            items: {
                type: "string"
            }
        },

        warning: {
            type: "string"
        },

        emergency_type: {
            type: "string",
            enum: [
                "medical"
            ]
        },

        severity: {
            type: "string",
            enum: [
                "high",
                "critical"
            ]
        },

        emergency_contact_number: {
            type: "string"
        }
    },

    required: [
        "title",
        "steps",
        "warning",
        "emergency_type",
        "severity",
        "emergency_contact_number"
    ]
};

const buildInjuryPrompt = ({
    selectedLanguageKey,
    selectedLanguage,
    injury
}) => {
    const config = injuryConfig[injury];

    return `
You are QuickAid Emergency Medical Guidance Engine.

The user selected:

${config.titles[selectedLanguageKey] || config.titles.en}

Internal injury key:

${injury}

Respond completely in:

${selectedLanguage.name}

${selectedLanguage.instruction}

Provide immediate first-aid guidance.

This is NOT a diagnosis.

Do not diagnose the user.

Do not claim certainty.

Give 3 to 5 short practical safety actions.

Do not recommend dangerous home remedies.

Do not recommend unverified medication doses.

Do not tell the user to delay emergency care.

If the situation could be life-threatening, recommend immediate emergency assistance.

The final warning must state that the guidance does not replace professional medical care.

Emergency numbers in India:

Medical: 108

Immediate life-threatening emergency: 112

OUTPUT FORMAT RULES:

Use plain text only.

Do not use Markdown.

Do not use asterisks.

Do not use hashtags.

Do not use backticks.

Do not use Markdown headings.

Do not use Markdown bullet symbols.

Do not use Markdown links.

Do not use emojis.

Use short numbered steps if steps are required.

Do not explain your reasoning.
`;
};

const buildNormalChatPrompt = ({
    selectedLanguage
}) => {
    return `
You are QuickAid's normal conversation assistant.

The user is currently in NORMAL CHAT MODE.

Your job is to answer general questions naturally.

You are NOT collecting emergency information.

Do NOT ask for:

name
phone number
location
emergency type

unless the user explicitly asks to start an emergency report.

You can answer questions about:

first aid
basic safety
QuickAid
emergency preparedness
general health and safety information

For medical questions:

Do not diagnose.

Do not claim certainty.

Give safe general information.

If the user appears to describe an actual life-threatening situation, advise them to seek immediate emergency help.

Respond completely in:

${selectedLanguage.name}

${selectedLanguage.instruction}

Keep answers clear and conversational.

OUTPUT FORMAT RULES:

Use plain text only.

Do not use Markdown.

Do not use asterisks.

Do not use hashtags.

Do not use backticks.

Do not use Markdown headings.

Do not use Markdown bullet symbols.

Do not use Markdown links.

Do not use emojis.

Use simple numbered steps when a list is necessary.

Do not explain your reasoning.
`;
};

const buildEmergencyPrompt = ({
    selectedLanguage,
    conversationState,
    userQuery
}) => {
    return `
You are QuickAid Emergency Intake Assistant.

The user is currently in EMERGENCY MODE.

Your job is to understand the user's message and collect the information required to create an emergency report.

The user can provide multiple pieces of information in one message.

Extract EVERYTHING that is clearly present.

For example:

"My name is Rahul, my number is 9876543210, I had a bike accident and my leg is bleeding."

You should extract:

name
mobile
description
emergency type
severity

Do NOT ask again for information already available.

CURRENT INFORMATION:

${JSON.stringify(
        conversationState,
        null,
        2
    )}

USER MESSAGE:

${userQuery}

REQUIRED INFORMATION:

Name
Mobile number
Description of emergency
Emergency type
Location
Confirmation

Location is controlled by the application.

Never invent location or coordinates.

EMERGENCY TYPES:

medical
police
fire
accident
other

Examples:

Chest pain → medical

Breathing problem → medical

Fire → fire

Robbery → police

Physical attack → police

Road accident → accident

SEVERITY:

low
medium
high
critical

Use critical only when the situation appears immediately life-threatening.

Examples:

Unconscious person → critical

Not breathing → critical

Severe bleeding → critical

Major fire → critical

Active violent attack → critical

Do not exaggerate severity.

IMMEDIATE SAFETY:

If the user describes an immediate danger:

Give one or two short safety instructions.

Then continue collecting missing information.

Do not provide a long lecture.

CONFIRMATION:

The emergency cannot be submitted until:

name exists
mobile exists
description exists
emergency type exists
location exists

Then ask the user to confirm the summary.

Only treat clear confirmation as confirmation.

Examples:

English:

yes
confirm
correct
yes send

Hindi:

हाँ
हां
हाँ भेजें
सही है

Odia:

ହଁ
ହଁ ପଠାନ୍ତୁ
ଠିକ୍ ଅଛି

Punjabi:

ਹਾਂ
ਹਾਂ ਭੇਜੋ
ਠੀਕ ਹੈ

Never assume confirmation.

LANGUAGE:

Respond completely in:

${selectedLanguage.name}

${selectedLanguage.instruction}

Never switch language.

STYLE:

Short.
Calm.
Clear.
Human.
Direct.

Ask one primary question at a time.

OUTPUT FORMAT RULES:

Use plain text only.

Do not use Markdown.

Do not use asterisks.

Do not use hashtags.

Do not use backticks.

Do not use Markdown headings.

Do not use Markdown bullet symbols.

Do not use Markdown links.

Do not use emojis.

Use simple numbered steps only when necessary.

Do not explain reasoning.

Do not claim that the emergency was submitted.
`;
};

const askAI = async (req, res) => {
    try {
        const {
            query,
            language,
            location,
            city,
            conversation,
            mode,
            injury
        } = req.body;

        if (
            !query ||
            !String(query).trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Query required"
            });
        }

        const selectedLanguageKey =
            normalizeLanguage(language);

        const selectedLanguage =
            languageConfig[selectedLanguageKey];

        if (mode === "injury_guidance") {
            const selectedInjury =
                normalizeInjury(injury);

            if (!selectedInjury) {
                return res.status(400).json({
                    success: false,
                    message: "Valid injury type required",
                    allowedInjuries: injuryTypes
                });
            }

            const prompt =
                buildInjuryPrompt({
                    selectedLanguageKey,
                    selectedLanguage,
                    injury: selectedInjury
                });

            const completion =
                await groq.chat.completions.create({
                    model: "openai/gpt-oss-20b",

                    messages: [
                        {
                            role: "system",
                            content: prompt
                        },

                        {
                            role: "user",
                            content: String(query).trim()
                        }
                    ],

                    temperature: 0.1,

                    max_tokens: 600,

                    reasoning_effort: "medium",

                    response_format: {
                        type: "json_schema",

                        json_schema: {
                            name: "quickaid_injury_guidance",
                            strict: true,
                            schema: injuryGuidanceSchema
                        }
                    }
                });

            const rawContent =
                completion
                    .choices?.[0]
                    ?.message
                    ?.content;

            if (!rawContent) {
                throw new Error(
                    "Groq returned empty injury guidance"
                );
            }

            const aiResult =
                JSON.parse(rawContent);

            const config =
                injuryConfig[selectedInjury];

            return res.json({
                success: true,

                mode: "injury_guidance",

                language:
                    selectedLanguageKey,

                languageCode:
                    selectedLanguage.code,

                injury:
                    selectedInjury,

                guidance: {
                    title:
                        removeMarkdown(
                            aiResult.title ||
                            config.titles[
                            selectedLanguageKey
                            ] ||
                            config.titles.en
                        ),

                    steps:
                        Array.isArray(aiResult.steps)
                            ? aiResult.steps.map(
                                (step) =>
                                    removeMarkdown(step)
                            )
                            : [],

                    warning:
                        removeMarkdown(
                            aiResult.warning ||
                            "This guidance does not replace professional medical care."
                        )
                },

                classification: {
                    emergencyType: "medical",

                    severity:
                        aiResult.severity
                },

                emergencyContactNumber:
                    aiResult.emergency_contact_number
            });
        }

        if (mode === "chat") {
            const prompt =
                buildNormalChatPrompt({
                    selectedLanguage
                });

            const completion =
                await groq.chat.completions.create({
                    model: "openai/gpt-oss-20b",

                    messages: [
                        {
                            role: "system",
                            content: prompt
                        },

                        {
                            role: "user",
                            content: String(query).trim()
                        }
                    ],

                    temperature: 0.3,

                    max_tokens: 500,

                    reasoning_effort: "medium"
                });

            const response =
                completion
                    .choices?.[0]
                    ?.message
                    ?.content;

            if (!response) {
                throw new Error(
                    "Groq returned empty chat response"
                );
            }

            return res.json({
                success: true,

                mode: "chat",

                language:
                    selectedLanguageKey,

                languageCode:
                    selectedLanguage.code,

                response:
                    removeMarkdown(response)
            });
        }

        if (mode !== "emergency") {
            return res.status(400).json({
                success: false,
                message: "Invalid AI mode"
            });
        }

        const rawConversation =
            conversation || {};

        const conversationState = {
            step:
                rawConversation.step || "name",

            language:
                selectedLanguageKey,

            name:
                normalizeName(
                    rawConversation.name
                ),

            mobile:
                normalizeMobile(
                    rawConversation.mobile
                ),

            description:
                rawConversation.description
                    ? String(
                        rawConversation.description
                    ).trim()
                    : null,

            emergencyType:
                normalizeEmergencyType(
                    rawConversation.emergencyType
                ),

            severity:
                normalizeSeverity(
                    rawConversation.severity
                ),

            locationAvailable:
                Boolean(
                    rawConversation.locationAvailable
                ),

            locationText:
                rawConversation.locationText
                    ? String(
                        rawConversation.locationText
                    ).trim()
                    : null,

            confirmed:
                Boolean(
                    rawConversation.confirmed
                )
        };

        if (
            location &&
            typeof location === "object"
        ) {
            conversationState.locationAvailable =
                Number.isFinite(
                    Number(location.latitude)
                ) &&
                Number.isFinite(
                    Number(location.longitude)
                );
        }

        if (
            city &&
            !conversationState.locationText
        ) {
            conversationState.locationText =
                String(city).trim();
        }

        const prompt =
            buildEmergencyPrompt({
                selectedLanguage,
                conversationState,
                userQuery:
                    String(query).trim()
            });

        const completion =
            await groq.chat.completions.create({
                model: "openai/gpt-oss-20b",

                messages: [
                    {
                        role: "system",
                        content: prompt
                    },

                    {
                        role: "user",
                        content:
                            String(query).trim()
                    }
                ],

                temperature: 0.1,

                max_tokens: 700,

                reasoning_effort: "medium",

                response_format: {
                    type: "json_schema",

                    json_schema: {
                        name: "quickaid_emergency_intake",
                        strict: true,
                        schema: conversationSchema
                    }
                }
            });

        const rawContent =
            completion
                .choices?.[0]
                ?.message
                ?.content;

        if (!rawContent) {
            throw new Error(
                "Groq returned empty emergency response"
            );
        }

        const aiResult =
            JSON.parse(rawContent);

        const extractedName =
            normalizeName(
                aiResult.extracted_name
            );

        const extractedMobile =
            normalizeMobile(
                aiResult.extracted_mobile
            );

        const extractedDescription =
            aiResult.extracted_description
                ? String(
                    aiResult.extracted_description
                ).trim()
                : null;

        const extractedEmergencyType =
            normalizeEmergencyType(
                aiResult.emergency_type
            );

        const extractedSeverity =
            normalizeSeverity(
                aiResult.severity
            );

        const finalName =
            extractedName ||
            conversationState.name ||
            null;

        const finalMobile =
            extractedMobile ||
            conversationState.mobile ||
            null;

        const finalDescription =
            extractedDescription ||
            conversationState.description ||
            null;

        const finalEmergencyType =
            extractedEmergencyType ||
            conversationState.emergencyType ||
            null;

        const finalSeverity =
            extractedSeverity ||
            conversationState.severity ||
            "medium";

        const finalLocationAvailable =
            conversationState.locationAvailable;

        const missingFields = [];

        if (!finalName) {
            missingFields.push("name");
        }

        if (!finalMobile) {
            missingFields.push("mobile");
        }

        if (!finalDescription) {
            missingFields.push("description");
        }

        if (!finalEmergencyType) {
            missingFields.push("emergencyType");
        }

        if (!finalLocationAvailable) {
            missingFields.push("location");
        }

        const informationComplete =
            Boolean(
                finalName &&
                finalMobile &&
                finalDescription &&
                finalEmergencyType &&
                finalLocationAvailable
            );

        const userConfirmed =
            informationComplete &&
            Boolean(
                aiResult.user_confirmed
            );

        const readyForConfirmation =
            informationComplete &&
            !userConfirmed;

        let nextStep = "confirmation";

        if (!finalName) {
            nextStep = "name";
        } else if (!finalMobile) {
            nextStep = "mobile";
        } else if (!finalDescription) {
            nextStep = "description";
        } else if (!finalEmergencyType) {
            nextStep = "description";
        } else if (!finalLocationAvailable) {
            nextStep = "location";
        } else if (!userConfirmed) {
            nextStep = "confirmation";
        } else {
            nextStep = "completed";
        }

        let emergencyContactNumber = null;

        if (finalSeverity === "critical") {
            emergencyContactNumber = "112";
        } else if (
            finalEmergencyType === "medical"
        ) {
            emergencyContactNumber = "108";
        } else if (
            finalEmergencyType === "fire"
        ) {
            emergencyContactNumber = "101";
        } else if (
            finalEmergencyType === "police"
        ) {
            emergencyContactNumber = "100";
        }

        return res.json({
            success: true,

            mode: "emergency",

            language:
                selectedLanguageKey,

            languageCode:
                selectedLanguage.code,

            response:
                removeMarkdown(
                    aiResult.reply
                ),

            conversation: {
                currentStep:
                    conversationState.step,

                nextStep,

                name:
                    finalName,

                mobile:
                    finalMobile,

                description:
                    finalDescription,

                emergencyType:
                    finalEmergencyType,

                severity:
                    finalSeverity,

                locationAvailable:
                    finalLocationAvailable,

                confirmed:
                    userConfirmed
            },

            classification: {
                emergencyType:
                    finalEmergencyType,

                severity:
                    finalSeverity
            },

            missingFields,

            informationComplete,

            readyForConfirmation,

            userConfirmed,

            immediateSafetyRequired:
                Boolean(
                    aiResult.immediate_safety_required
                ),

            emergencyContactNumber
        });

    } catch (error) {
        console.error(
            "❌ Groq AI Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "AI service error"
        });
    }
};

module.exports = {
    askAI
};