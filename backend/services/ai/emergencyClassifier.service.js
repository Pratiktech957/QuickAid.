const Groq = require("groq-sdk");

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

const VALID_EMERGENCY_TYPES = [
    "medical",
    "police",
    "fire",
    "accident",
    "other"
];

const VALID_SEVERITIES = [
    "low",
    "medium",
    "high",
    "critical"
];

const VALID_DEPARTMENTS = [
    "police",
    "medical",
    "fire",
    "multi",
    "pending"
];

const classificationSchema = {
    type: "object",
    additionalProperties: false,
    properties: {
        emergencyType: {
            type: "string",
            enum: [
                "medical",
                "police",
                "fire",
                "accident",
                "other"
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
        }
    },
    required: [
        "emergencyType",
        "severity"
    ]
};

const normalizeDescription = (description) => {
    if (!description) {
        return "";
    }

    return String(description)
        .trim()
        .replace(/\s+/g, " ");
};

const getDepartmentFromEmergencyType = (
    emergencyType
) => {
    switch (emergencyType) {
        case "medical":
            return "medical";

        case "police":
            return "police";

        case "fire":
            return "fire";

        case "accident":
            return "multi";

        case "other":
            return "pending";

        default:
            return "pending";
    }
};

const buildClassificationPrompt = (
    description
) => {
    return `
You are the emergency classification engine for QuickAid.

Your ONLY task is to classify the emergency description.

Do not provide advice.
Do not provide first aid.
Do not ask questions.
Do not explain your reasoning.

Return only the required structured classification.

EMERGENCY DESCRIPTION:
${description}

EMERGENCY TYPE:

Choose exactly one:

medical
police
fire
accident
other

MEDICAL:

Use medical for illness, injury, unconsciousness,
breathing problems, chest pain, heart attack symptoms,
stroke symptoms, severe bleeding, poisoning, burn injury,
drowning, choking, allergic reaction, and other medical emergencies.

POLICE:

Use police for crime, assault, attack, violence,
threats, theft, robbery, missing person, or danger
requiring police intervention.

FIRE:

Use fire for fire, smoke, burning building,
house fire, vehicle fire, gas fire, or major fire-related danger.

ACCIDENT:

Use accident for road accident, vehicle collision,
traffic accident, industrial accident, workplace accident,
or other accidental incidents.

OTHER:

Use other when the situation does not clearly belong
to medical, police, fire, or accident.

SEVERITY:

low:
Minor situation with no immediate serious danger.

medium:
Situation requiring assistance but without obvious
immediate life-threatening danger.

high:
Serious situation where significant harm may occur
without prompt assistance.

critical:
Immediate threat to life or severe danger requiring
emergency response immediately.

Examples of critical situations:

Not breathing
Unconscious person
Severe uncontrolled bleeding
Major fire
Active violent attack
Severe accident with serious injury

Do not mark every emergency as critical.

IMPORTANT:

Do not invent information.
Do not return values outside the allowed enums.
Classify only from the emergency description.
Do not determine a department.

The application will determine the department
after classification.
`;
};

const classifyEmergency = async (description) => {
    const cleanDescription =
        normalizeDescription(description);

    if (!cleanDescription) {
        throw new Error(
            "Emergency description is required"
        );
    }

    const completion =
        await groq.chat.completions.create({
            model: "openai/gpt-oss-20b",

            messages: [
                {
                    role: "system",
                    content:
                        "You are a strict emergency classification engine. Return only the required structured classification."
                },
                {
                    role: "user",
                    content:
                        buildClassificationPrompt(
                            cleanDescription
                        )
                }
            ],

            temperature: 0,

            max_tokens: 100,

            reasoning_effort: "low",

            response_format: {
                type: "json_schema",

                json_schema: {
                    name:
                        "quickaid_emergency_classification",

                    strict: true,

                    schema:
                        classificationSchema
                }
            }
        });

    const content =
        completion
            ?.choices?.[0]
            ?.message
            ?.content
            ?.trim();

    if (!content) {
        console.error(
            "Groq classification returned empty content."
        );

        console.error(
            "Groq finish reason:",
            completion
                ?.choices?.[0]
                ?.finish_reason
        );

        throw new Error(
            "AI classification returned empty response"
        );
    }

    let classification;

    try {
        classification =
            JSON.parse(content);
    } catch (error) {
        console.error(
            "Failed to parse AI classification:",
            content
        );

        throw new Error(
            "AI classification returned invalid JSON"
        );
    }

    if (
        !VALID_EMERGENCY_TYPES.includes(
            classification.emergencyType
        )
    ) {
        throw new Error(
            "Invalid emergency type returned by AI"
        );
    }

    if (
        !VALID_SEVERITIES.includes(
            classification.severity
        )
    ) {
        throw new Error(
            "Invalid severity returned by AI"
        );
    }

    const department =
        getDepartmentFromEmergencyType(
            classification.emergencyType
        );

    const finalClassification = {
        emergencyType:
            classification.emergencyType,

        severity:
            classification.severity,

        department
    };

    if (
        !VALID_DEPARTMENTS.includes(
            finalClassification.department
        )
    ) {
        throw new Error(
            "Invalid department generated by application"
        );
    }

    console.log(
        "FINAL EMERGENCY CLASSIFICATION:",
        JSON.stringify(
            finalClassification,
            null,
            2
        )
    );

    return finalClassification;
};

module.exports = {
    classifyEmergency
};