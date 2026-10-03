import {
    useEffect,
    useRef,
    useState
} from "react";

import { useNavigate } from "react-router-dom";

import {
    Bot,
    X,
    Phone,
    MapPin,
    Navigation,
    Share2,
    Volume2,
    Mic,
    MicOff,
    Send,
    Loader2,
    AlertTriangle,
    CheckCircle2,
    Shield,
    Heart,
    Flame,
    Car,
    Crosshair,
    Layers,
    MessageCircle,
    ChevronRight,
    Sparkles
} from "lucide-react";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

import EmergencyHeader from "../../components/emergency/EmergencyHeader";
import EmergencyStatus from "../../components/emergency/EmergencyStatus";
import EmergencyAssistant from "../../components/emergency/EmergencyAssistant";
import EmergencyCategories from "../../components/emergency/EmergencyCategories";
import LocationMap from "../../components/emergency/LocationMap";
import EmergencyNumbers from "../../components/emergency/EmergencyNumbers";
import AIResponse from "../../components/emergency/AIResponse";
import EmergencyUserModal from "../../components/emergency/EmergencyUserModal";
import RouteInfo from "../../components/emergency/RouteInfo";

import { askAI } from "../../api/ai.api";
import { createEmergency } from "../../api/emergency.api";
import EmergencyChatbot from "../../components/emergency/EmergencyChatbot";


// ======================================================
// DEFAULT LOCATION
// ======================================================

const DEFAULT_LOCATION = {
    lat: 20.2961,
    lon: 85.8245,
    accuracy: null
};


// ======================================================
// SPEECH LANGUAGE
// ======================================================

const getSpeechLanguage = (language) => {

    if (language === "hi") {
        return "hi-IN";
    }

    if (language === "or") {
        return "or-IN";
    }

    return "en-IN";
};


// ======================================================
// MOBILE VALIDATION
// ======================================================

const isValidMobile = (mobile) => {

    const cleaned =
        String(mobile || "").replace(/\D/g, "");

    return /^[6-9]\d{9}$/.test(
        cleaned
    );
};


// ======================================================
// VOICE NUMBER PARSER
// ======================================================

const NUMBER_WORDS = {
    zero: "0",
    oh: "0",
    one: "1",
    two: "2",
    three: "3",
    four: "4",
    five: "5",
    six: "6",
    seven: "7",
    eight: "8",
    nine: "9",
    "शून्य": "0",
    "एक": "1",
    "दो": "2",
    "तीन": "3",
    "चार": "4",
    "पांच": "5",
    "पाँच": "5",
    "छह": "6",
    "छः": "6",
    "सात": "7",
    "आठ": "8",
    "नौ": "9"
};

const extractMobileFromVoice = (text) => {

    if (!text) {
        return "";
    }

    const digitMatches =
        text.match(/[6-9](?:[\s-]*\d){9}/g);

    if (digitMatches?.length) {

        for (const match of digitMatches) {

            const mobile =
                match.replace(/\D/g, "");

            if (isValidMobile(mobile)) {
                return mobile;
            }
        }
    }

    const normalized =
        text
            .toLowerCase()
            .replace(/[.,]/g, " ")
            .split(/\s+/)
            .filter(Boolean);

    const digits = [];

    for (const word of normalized) {

        if (NUMBER_WORDS[word] !== undefined) {
            digits.push(NUMBER_WORDS[word]);
        }
    }

    for (let i = 0; i <= digits.length - 10; i++) {

        const candidate =
            digits.slice(i, i + 10).join("");

        if (isValidMobile(candidate)) {
            return candidate;
        }
    }

    return "";
};


// ======================================================
// VOICE NAME PARSER
// ======================================================

const extractNameFromVoice = (text) => {

    if (!text) {
        return "";
    }

    const patterns = [
        /(?:my name is|i am|i'm|name is)\s+([a-zA-Z][a-zA-Z .'-]{1,60}?)(?=\s+(?:and|my|phone|mobile|number|contact|emergency|there|i need|please|report|submit)\b|[,.]|$)/i,

        /(?:मेरा नाम है|मेरा नाम)\s+([^,.;]+?)(?=\s+(?:और|मेरा|फोन|मोबाइल|नंबर|आपातकाल|इमरजेंसी)\b|[,.]|$)/i
    ];

    for (const pattern of patterns) {

        const match =
            text.match(pattern);

        if (match?.[1]) {

            const name =
                match[1]
                    .trim()
                    .replace(/\s+/g, " ");

            if (name.length >= 2) {
                return name;
            }
        }
    }

    return "";
};


// ======================================================
// VOICE SUBMIT COMMAND
// ======================================================

const hasVoiceSubmitCommand = (text) => {

    if (!text) {
        return false;
    }

    return /\b(?:submit|send|report|confirm|call for help|send help)\b/i.test(
        text
    ) ||
        /(?:सबमिट|भेजो|रिपोर्ट|कन्फर्म|मदद भेजो)/i.test(
            text
        );
};


// ======================================================
// CLEAN EMERGENCY DESCRIPTION
// ======================================================

const cleanVoiceEmergencyDescription = (text) => {

    if (!text) {
        return "";
    }

    return text
        .replace(
            /(?:my name is|i am|i'm|name is)\s+[a-zA-Z][a-zA-Z .'-]{1,60}/i,
            ""
        )
        .replace(
            /(?:my (?:phone|mobile|number|contact)(?: number)? is)\s+[\d\s-]+/i,
            ""
        )
        .replace(
            /(?:submit|send|report|confirm|call for help|send help)\b/gi,
            ""
        )
        .replace(/\s+/g, " ")
        .replace(/^[\s,.;:-]+|[\s,.;:-]+$/g, "")
        .trim();
};


// ======================================================
// DISTANCE CALCULATION
// ======================================================

const calculateDistance = (
    lat1,
    lon1,
    lat2,
    lon2
) => {

    const R = 6371;

    const dLat =
        ((lat2 - lat1) * Math.PI) / 180;

    const dLon =
        ((lon2 - lon1) * Math.PI) / 180;

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(
            (lat1 * Math.PI) / 180
        ) *
        Math.cos(
            (lat2 * Math.PI) / 180
        ) *
        Math.sin(dLon / 2) ** 2;

    const c =
        2 *
        Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );

    return R * c;
};


// ======================================================
// ROUTE DISTANCE FORMAT
// ======================================================

const formatRouteDistance = (
    meters
) => {

    if (
        meters === undefined ||
        meters === null
    ) {
        return "N/A";
    }

    if (meters < 1000) {
        return `${Math.round(meters)} m`;
    }

    return `${(
        meters / 1000
    ).toFixed(1)} km`;
};


// ======================================================
// ROUTE DURATION FORMAT
// ======================================================

const formatRouteDuration = (
    seconds
) => {

    if (
        seconds === undefined ||
        seconds === null
    ) {
        return "N/A";
    }

    const minutes =
        Math.round(
            seconds / 60
        );

    if (minutes < 60) {
        return `${minutes} min`;
    }

    const hours =
        Math.floor(
            minutes / 60
        );

    const remainingMinutes =
        minutes % 60;

    if (remainingMinutes === 0) {
        return `${hours} hr`;
    }

    return `${hours} hr ${remainingMinutes} min`;
};


// ======================================================
// MAIN COMPONENT
// ======================================================

function InstantHelp() {

    const navigate =
        useNavigate();


    // ==================================================
    // BASIC STATE
    // ==================================================

    const [query, setQuery] =
        useState("");

    const [language, setLanguage] =
        useState("en");

    const [location, setLocation] =
        useState(null);

    const [locationText, setLocationText] =
        useState(
            "Acquiring your location..."
        );

    const [city, setCity] =
        useState(null);

    const [loading, setLoading] =
        useState(false);

    const [processing, setProcessing] =
        useState(false);

    const [aiResponse, setAiResponse] =
        useState("");

    const [aiClassification, setAiClassification] =
        useState(null);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");

    const [showUserModal, setShowUserModal] =
        useState(false);

    const [pendingEmergency, setPendingEmergency] =
        useState(null);

    const [userName, setUserName] =
        useState(
            localStorage.getItem(
                "emergencyUserName"
            ) || ""
        );

    const [userMobile, setUserMobile] =
        useState(
            localStorage.getItem(
                "emergencyUserMobile"
            ) || ""
        );

    const [emergencyId, setEmergencyId] =
        useState(null);

    const [trackingToken, setTrackingToken] =
        useState(null);

    const [isListening, setIsListening] =
        useState(false);

    const [voiceStatus, setVoiceStatus] =
        useState("");

    const [selectedCategory, setSelectedCategory] =
        useState("");

    const [showSiren, setShowSiren] =
        useState(false);

    // ==================================================
    // CHATBOT TOGGLE
    // ==================================================

    const [showChatbot, setShowChatbot] =
        useState(false);

    const [nearbyServices, setNearbyServices] =
        useState([]);

    // ==================================================
    // ROUTE STATE
    // ==================================================

    const [routeInfo, setRouteInfo] =
        useState(null);

    const [routeLoading, setRouteLoading] =
        useState(false);

    const [routeError, setRouteError] =
        useState("");


    // ==================================================
    // REFS
    // ==================================================

    const mapContainerRef =
        useRef(null);

    const mapRef =
        useRef(null);

    const userMarkerRef =
        useRef(null);

    const serviceMarkersRef =
        useRef([]);

    const routeLayerRef =
        useRef(null);

    const recognitionRef =
        useRef(null);

    const processQueryRef =
        useRef(null);

    const speechRef =
        useRef(
            typeof window !== "undefined"
                ? window.speechSynthesis
                : null
        );

    // ==================================================
    // INITIALIZE MAP
    // ==================================================

    useEffect(() => {

        if (!mapContainerRef.current) {
            return;
        }

        if (mapRef.current) {
            return;
        }

        const map =
            L.map(
                mapContainerRef.current
            ).setView(
                [
                    DEFAULT_LOCATION.lat,
                    DEFAULT_LOCATION.lon
                ],
                12
            );

        L.tileLayer(
            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            {
                attribution:
                    "© OpenStreetMap contributors"
            }
        ).addTo(map);

        mapRef.current = map;


        return () => {

            if (mapRef.current) {

                mapRef.current.remove();

                mapRef.current = null;
            }
        };

    }, []);


    // ==================================================
    // LOCATION TRACKING
    // ==================================================

    useEffect(() => {

        if (!navigator.geolocation) {

            setLocationText(
                "Geolocation is not supported by this browser."
            );

            return;
        }


        const watchId =
            navigator.geolocation.watchPosition(

                async (position) => {

                    const newLocation = {

                        lat:
                            position.coords.latitude,

                        lon:
                            position.coords.longitude,

                        accuracy:
                            position.coords.accuracy
                    };


                    setLocation(
                        newLocation
                    );


                    updateMapLocation(
                        newLocation
                    );


                    setLocationText(
                        `Location detected. Accuracy: ${Math.round(
                            newLocation.accuracy
                        )}m`
                    );


                    await reverseGeocode(
                        newLocation.lat,
                        newLocation.lon
                    );
                },


                () => {

                    setLocationText(
                        "Location access denied or unavailable."
                    );

                    getApproximateLocation();
                },


                {
                    enableHighAccuracy: true,
                    maximumAge: 30000,
                    timeout: 10000
                }
            );


        return () => {

            navigator.geolocation.clearWatch(
                watchId
            );
        };

    }, []);


    // ==================================================
    // UPDATE MAP LOCATION
    // ==================================================

    const updateMapLocation = (
        currentLocation
    ) => {

        if (!mapRef.current) {
            return;
        }

        const {
            lat,
            lon
        } = currentLocation;


        mapRef.current.setView(
            [lat, lon],
            15
        );


        if (!userMarkerRef.current) {

            userMarkerRef.current =
                L.marker([
                    lat,
                    lon
                ])
                    .addTo(
                        mapRef.current
                    )
                    .bindPopup(
                        "Your current location"
                    );

        } else {

            userMarkerRef.current.setLatLng(
                [lat, lon]
            );
        }
    };


    // ==================================================
    // REVERSE GEOCODING
    // ==================================================

    const reverseGeocode = async (
        lat,
        lon
    ) => {

        try {

            const response =
                await fetch(
                    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
                );


            const data =
                await response.json();


            if (data?.display_name) {

                setLocationText(
                    `Current Location: ${data.display_name}`
                );
            }


            if (data?.address) {

                const detectedCity =
                    data.address.city ||
                    data.address.town ||
                    data.address.village ||
                    data.address.county ||
                    data.address.state ||
                    "Unknown";


                setCity(
                    detectedCity
                );
            }

        } catch (error) {

            console.error(
                "Reverse geocoding failed:",
                error
            );


            setLocationText(
                `Location: ${lat.toFixed(
                    4
                )}, ${lon.toFixed(4)}`
            );
        }
    };


    // ==================================================
    // APPROXIMATE LOCATION
    // ==================================================

    const getApproximateLocation =
        async () => {

            try {

                const response =
                    await fetch(
                        "https://ipapi.co/json/"
                    );


                const data =
                    await response.json();


                const fallbackLocation = {

                    lat:
                        Number(
                            data.latitude
                        ),

                    lon:
                        Number(
                            data.longitude
                        ),

                    accuracy: 50000
                };


                setLocation(
                    fallbackLocation
                );


                setCity(
                    data.city
                );


                setLocationText(
                    `Approximate Location: ${data.city}, ${data.region}`
                );


                updateMapLocation(
                    fallbackLocation
                );

            } catch (error) {

                console.error(
                    "IP location failed:",
                    error
                );


                setLocationText(
                    "Could not determine your location."
                );
            }
        };


    // ==================================================
    // VOICE RECOGNITION
    // ==================================================

    useEffect(() => {

        const SpeechRecognition =
            window.SpeechRecognition ||
            window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            setVoiceStatus(
                "Voice recognition is not supported. Use Google Chrome or Microsoft Edge."
            );
            return;
        }

        const recognition =
            new SpeechRecognition();

        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.maxAlternatives = 3;

        recognitionRef.current =
            recognition;

        recognition.onstart = () => {

            setIsListening(true);

            setVoiceStatus(
                "Listening... Say your name, mobile number, emergency, and say 'submit'."
            );
        };

        recognition.onresult = (event) => {

            const transcript =
                Array.from(event.results)
                    .map(
                        (result) =>
                            result[0]?.transcript || ""
                    )
                    .join(" ")
                    .trim();

            if (!transcript) {
                setVoiceStatus(
                    "I could not hear anything. Please try again."
                );
                return;
            }

            console.log(
                "Voice transcript:",
                transcript
            );

            const extractedName =
                extractNameFromVoice(
                    transcript
                );

            const extractedMobile =
                extractMobileFromVoice(
                    transcript
                );

            const cleanedDescription =
                cleanVoiceEmergencyDescription(
                    transcript
                );

            if (extractedName) {
                setUserName(
                    extractedName
                );
            }

            if (extractedMobile) {
                setUserMobile(
                    extractedMobile
                );
            }

            if (cleanedDescription) {
                setQuery(
                    cleanedDescription
                );
            } else {
                setQuery(
                    transcript
                );
            }

            const voiceData = {
                name:
                    extractedName ||
                    userName,

                mobile:
                    extractedMobile ||
                    userMobile,

                description:
                    cleanedDescription ||
                    transcript,

                shouldAutoSubmit:
                    hasVoiceSubmitCommand(
                        transcript
                    )
            };

            setVoiceStatus(
                voiceData.name &&
                    isValidMobile(
                        voiceData.mobile
                    )
                    ? voiceData.shouldAutoSubmit
                        ? "Voice details captured. Submitting emergency..."
                        : "Voice details captured. You can review them before submitting."
                    : "Voice captured. Please say your name and 10-digit mobile number."
            );

            if (processQueryRef.current) {
                processQueryRef.current(
                    voiceData.description,
                    voiceData
                );
            }
        };

        recognition.onerror = (event) => {

            console.error(
                "Speech recognition error:",
                event.error
            );

            setIsListening(false);

            const errorMessages = {
                "not-allowed":
                    "Microphone permission was denied. Allow microphone access in your browser.",
                "service-not-allowed":
                    "Speech recognition service is blocked. Try Google Chrome or Microsoft Edge.",
                "audio-capture":
                    "No microphone was detected. Check your microphone.",
                "no-speech":
                    "No speech detected. Please speak clearly and try again.",
                "network":
                    "Speech recognition network error. Check your internet connection.",
                "aborted":
                    "Voice input was stopped."
            };

            setVoiceStatus(
                errorMessages[event.error] ||
                `Voice input error: ${event.error}. Please try again.`
            );
        };

        recognition.onend = () => {

            setIsListening(false);
        };

        return () => {

            try {
                recognition.stop();
            } catch {
                // Already stopped.
            }

            recognitionRef.current =
                null;
        };

    }, []);


    // ==================================================
    // START VOICE
    // ==================================================

    const startVoiceInput = () => {

        if (!recognitionRef.current) {

            setVoiceStatus(
                "Voice recognition is not supported in this browser."
            );

            return;
        }

        if (isListening) {

            recognitionRef.current.stop();

            return;
        }

        recognitionRef.current.lang =
            getSpeechLanguage(
                language
            );

        try {

            recognitionRef.current.start();

        } catch (error) {

            console.error(
                "Voice recognition start failed:",
                error
            );

            setVoiceStatus(
                "Could not start voice input. Please click the microphone button again."
            );
        }
    };


    // ==================================================
    // STOP VOICE
    // ==================================================

    const stopVoiceInput = () => {

        if (recognitionRef.current) {

            recognitionRef.current.stop();
        }
    };


    // ==================================================
    // TEXT TO SPEECH
    // ==================================================

    const speakText = (
        text
    ) => {

        if (!speechRef.current) {
            return;
        }


        speechRef.current.cancel();


        const utterance =
            new SpeechSynthesisUtterance(
                text
            );


        utterance.lang =
            getSpeechLanguage(
                language
            );

        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;


        speechRef.current.speak(
            utterance
        );
    };


    // ==================================================
    // AI RESPONSE
    // ==================================================

    const getAIResponse =
        async (userQuery) => {

            const response =
                await askAI({

                    query:
                        userQuery,

                    language,

                    location,

                    city
                });


            return response.response;
        };


    // ==================================================
    // PROCESS QUERY
    // ==================================================

    const processQuery = async (
        inputQuery = query,
        voiceData = null
    ) => {

        if (processing) {
            return;
        }


        const cleanQuery =
            inputQuery.trim();


        if (!cleanQuery) {

            setError(
                "Please describe your emergency."
            );

            return;
        }


        if (!location) {

            setError(
                "Please wait while we determine your location."
            );

            return;
        }


        setError("");
        setSuccess("");


        setProcessing(
            true
        );

        setLoading(
            true
        );


        try {

            const response =
                await getAIResponse(
                    cleanQuery
                );


            setAiResponse(
                response
            );


            speakText(
                response
            );


            const emergencyDescription =
                cleanVoiceEmergencyDescription(
                    cleanQuery
                ) || cleanQuery;

            setPendingEmergency({
                description:
                    emergencyDescription
            });

            const voiceName =
                voiceData?.name?.trim() ||
                "";

            const voiceMobile =
                voiceData?.mobile?.trim() ||
                "";

            const canAutoSubmit =
                voiceData?.shouldAutoSubmit &&
                voiceName &&
                isValidMobile(
                    voiceMobile
                ) &&
                emergencyDescription;

            if (canAutoSubmit) {

                await submitEmergency({
                    name: voiceName,
                    mobile: voiceMobile,
                    description:
                        emergencyDescription
                });

            } else {

                setShowUserModal(
                    true
                );
            }

        } catch (error) {

            console.error(
                "AI request failed:",
                error
            );


            setError(
                "Failed to get AI response. Please try again or call an emergency number."
            );

        } finally {

            setProcessing(
                false
            );

            setLoading(
                false
            );
        }
    };


    useEffect(() => {
        processQueryRef.current =
            processQuery;
    }, [processQuery]);


    // ==================================================
    // QUICK HELP
    // ==================================================

    const quickHelp = (
        type
    ) => {

        const queries = {

            medical:
                "Serious medical emergency, need ambulance and hospital immediately",

            police:
                "Need police assistance urgently, crime or security threat",

            fire:
                "Fire emergency, need fire brigade immediately",

            accident:
                "Serious accident happened, need medical and police assistance"
        };


        const selectedQuery =
            queries[type];


        if (!selectedQuery) {
            return;
        }


        setQuery(
            selectedQuery
        );


        processQuery(
            selectedQuery
        );
    };


    // ==================================================
    // EMERGENCY CATEGORIES
    // ==================================================

    const selectEmergencyCategory =
        (category) => {

            const queries = {

                heart_attack:
                    "Heart attack emergency. Person experiencing chest pain, shortness of breath, and discomfort in arms, back, neck, or jaw.",

                stroke:
                    "Stroke emergency. Person experiencing facial drooping, arm weakness, and speech difficulties.",

                bleeding:
                    "Severe bleeding emergency. Person has a deep wound with heavy bleeding that won't stop.",

                allergy:
                    "Severe allergic reaction. Person experiencing difficulty breathing, swelling of face and throat, and hives.",

                poisoning:
                    "Poisoning emergency. Person has ingested or been exposed to toxic substance.",

                burn:
                    "Serious burn injury. Person has severe burns covering large area of body.",

                drowning:
                    "Drowning emergency. Person pulled from water and not breathing properly.",

                choking:
                    "Choking emergency. Person cannot breathe, speak, or cough."
            };


            const selectedQuery =
                queries[category];


            if (!selectedQuery) {
                return;
            }


            setSelectedCategory(
                category
            );


            setQuery(
                selectedQuery
            );


            processQuery(
                selectedQuery
            );
        };


    // ==================================================
    // SUBMIT EMERGENCY
    // ==================================================

    const submitEmergency = async (
        voiceOverrides = null
    ) => {

        const finalName =
            voiceOverrides?.name ??
            userName;

        const finalMobile =
            voiceOverrides?.mobile ??
            userMobile;

        const finalDescription =
            voiceOverrides?.description ??
            pendingEmergency?.description;

        if (!finalName?.trim()) {

            setError(
                "Please provide your full name by voice or in the form."
            );

            return;
        }

        const cleanedMobile =
            String(
                finalMobile || ""
            ).replace(
                /\D/g,
                ""
            );

        if (!isValidMobile(cleanedMobile)) {

            setError(
                "Please provide a valid 10-digit mobile number by voice or in the form."
            );

            return;
        }

        if (
            !finalDescription ||
            !location
        ) {

            setError(
                "Emergency information is incomplete."
            );

            return;
        }

        setLoading(true);
        setError("");

        try {

            const normalizedName =
                finalName.trim();

            localStorage.setItem(
                "emergencyUserName",
                normalizedName
            );

            localStorage.setItem(
                "emergencyUserMobile",
                cleanedMobile
            );

            setUserName(
                normalizedName
            );

            setUserMobile(
                cleanedMobile
            );

            const emergencyData = {

                userName:
                    normalizedName,

                mobileNumber:
                    cleanedMobile,

                location: {

                    latitude:
                        location.lat,

                    longitude:
                        location.lon,

                    accuracy:
                        location.accuracy
                },

                description:
                    finalDescription.trim(),

                address:
                    locationText.replace(
                        "Current Location: ",
                        ""
                    )
            };

            const result =
                await createEmergency(
                    emergencyData
                );

            setAiClassification(
                result.classification
            );

            setEmergencyId(
                result.emergency_id
            );

            setTrackingToken(
                result.tracking_token
            );

            setSuccess(
                `Emergency reported successfully. Emergency ID: ${result.emergency_id}`
            );

            setShowUserModal(
                false
            );

            speakText(
                `Emergency reported successfully. Your emergency ID is ${result.emergency_id}. Help is on the way.`
            );

        } catch (error) {

            console.error(
                "Emergency submission failed:",
                error
            );

            setError(
                error.message ||
                "Failed to submit emergency."
            );

        } finally {

            setLoading(false);
        }
    };


    // ==================================================
    // SEARCH NEARBY SERVICES
    // ==================================================

    const searchNearbyServices =
        async (
            serviceType
        ) => {

            if (!location) {

                setError(
                    "Location is not available."
                );

                return;
            }


            try {

                setError("");

                clearRoute();


                const searchQuery =
                    city
                        ? `${serviceType} ${city} India`
                        : serviceType;


                const response =
                    await fetch(
                        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                            searchQuery
                        )}&limit=10`
                    );


                if (!response.ok) {

                    throw new Error(
                        "Service search failed"
                    );
                }


                const places =
                    await response.json();


                const nearby =
                    places
                        .map(
                            (place) => {

                                const distance =
                                    calculateDistance(

                                        location.lat,
                                        location.lon,

                                        Number(
                                            place.lat
                                        ),
                                        Number(
                                            place.lon
                                        )
                                    );


                                return {
                                    ...place,
                                    distance
                                };
                            }
                        )
                        .filter(
                            (place) =>
                                place.distance <
                                50
                        )
                        .sort(
                            (a, b) =>
                                a.distance -
                                b.distance
                        )
                        .slice(
                            0,
                            5
                        );


                setNearbyServices(
                    nearby
                );


                addServiceMarkers(
                    nearby
                );

            } catch (error) {

                console.error(
                    "Service search failed:",
                    error
                );


                setError(
                    `Could not find nearby ${serviceType}.`
                );
            }
        };


    // ==================================================
    // SERVICE MARKERS
    // ==================================================

    const addServiceMarkers =
        (places) => {

            if (!mapRef.current) {
                return;
            }


            clearServiceMarkers();


            places.forEach(
                (place) => {

                    const marker =
                        L.marker([
                            Number(
                                place.lat
                            ),
                            Number(
                                place.lon
                            )
                        ])
                            .addTo(
                                mapRef.current
                            )
                            .bindPopup(
                                place.display_name
                            );


                    serviceMarkersRef.current.push(
                        marker
                    );
                }
            );
        };


    // ==================================================
    // CLEAR SERVICE MARKERS
    // ==================================================

    const clearServiceMarkers =
        () => {

            serviceMarkersRef.current.forEach(
                (marker) => {

                    if (
                        mapRef.current
                    ) {

                        mapRef.current.removeLayer(
                            marker
                        );
                    }
                }
            );


            serviceMarkersRef.current =
                [];
        };


    // ==================================================
    // SHOW REAL ROAD ROUTE
    // ==================================================

    const showRoute = async (
        place
    ) => {

        if (
            !mapRef.current ||
            !location
        ) {

            setError(
                "Your location is not available."
            );

            return;
        }


        const destinationLat =
            Number(
                place.lat
            );

        const destinationLon =
            Number(
                place.lon
            );


        if (
            Number.isNaN(
                destinationLat
            ) ||
            Number.isNaN(
                destinationLon
            )
        ) {

            setError(
                "Destination location is invalid."
            );

            return;
        }


        setRouteLoading(
            true
        );

        setRouteError("");


        if (
            routeLayerRef.current &&
            mapRef.current
        ) {

            mapRef.current.removeLayer(
                routeLayerRef.current
            );

            routeLayerRef.current =
                null;
        }


        try {

            const routeUrl =
                `https://router.project-osrm.org/route/v1/driving/` +
                `${location.lon},${location.lat};` +
                `${destinationLon},${destinationLat}` +
                `?overview=full&geometries=geojson`;


            const response =
                await fetch(
                    routeUrl
                );


            if (!response.ok) {

                throw new Error(
                    "Routing service is unavailable."
                );
            }


            const data =
                await response.json();


            if (
                data.code !== "Ok" ||
                !data.routes ||
                data.routes.length === 0
            ) {

                throw new Error(
                    "No driving route could be found."
                );
            }


            const route =
                data.routes[0];


            const coordinates =
                route.geometry.coordinates.map(
                    ([longitude, latitude]) => [
                        latitude,
                        longitude
                    ]
                );


            const routeLine =
                L.polyline(
                    coordinates,
                    {
                        weight: 6,
                        opacity: 0.85
                    }
                ).addTo(
                    mapRef.current
                );


            routeLayerRef.current =
                routeLine;


            const newRouteInfo = {

                ...place,

                routeCoordinates:
                    coordinates,

                routeDistance:
                    route.distance,

                routeDuration:
                    route.duration,

                distanceKm:
                    route.distance / 1000,

                durationMinutes:
                    route.duration / 60
            };


            setRouteInfo(
                newRouteInfo
            );


            mapRef.current.fitBounds(
                routeLine.getBounds(),
                {
                    padding: [
                        50,
                        50
                    ],
                    maxZoom: 16,
                    animate: true
                }
            );

        } catch (error) {

            console.error(
                "Road route calculation failed:",
                error
            );


            setRouteError(
                error.message ||
                "Unable to calculate route."
            );


            mapRef.current.setView(
                [
                    destinationLat,
                    destinationLon
                ],
                14
            );

        } finally {

            setRouteLoading(
                false
            );
        }
    };


    // ==================================================
    // CLEAR ROUTE
    // ==================================================

    const clearRoute = () => {

        if (
            routeLayerRef.current &&
            mapRef.current
        ) {

            mapRef.current.removeLayer(
                routeLayerRef.current
            );

            routeLayerRef.current =
                null;
        }


        setRouteInfo(
            null
        );


        setRouteError(
            ""
        );
    };


    // ==================================================
    // CENTER MAP ON USER
    // ==================================================

    const centerMapOnUser =
        () => {

            if (
                !location ||
                !mapRef.current
            ) {

                return;
            }


            mapRef.current.setView(
                [
                    location.lat,
                    location.lon
                ],
                15
            );
        };


    // ==================================================
    // SHARE EMERGENCY
    // ==================================================

    const shareEmergency =
        async () => {

            if (!emergencyId) {
                return;
            }


            const mapUrl =
                location
                    ? `https://www.google.com/maps?q=${location.lat},${location.lon}`
                    : "";


            const text =
                `Emergency Alert\nEmergency ID: ${emergencyId}\nLocation: ${mapUrl}`;


            try {

                if (
                    navigator.share
                ) {

                    await navigator.share({

                        title:
                            "Emergency Alert",

                        text
                    });

                } else {

                    await navigator.clipboard.writeText(
                        text
                    );


                    setSuccess(
                        "Emergency details copied to clipboard."
                    );
                }

            } catch (error) {

                if (
                    error?.name !==
                    "AbortError"
                ) {

                    console.error(
                        "Emergency sharing failed:",
                        error
                    );
                }
            }
        };


    // ==================================================
    // SHARE AI RESPONSE
    // ==================================================

    const shareAIResponse =
        async () => {

            if (!aiResponse) {
                return;
            }


            const text =
                `Emergency Advice:\n${aiResponse}`;


            try {

                if (
                    navigator.share
                ) {

                    await navigator.share({

                        title:
                            "Emergency Assistance",

                        text
                    });

                } else {

                    await navigator.clipboard.writeText(
                        text
                    );


                    setSuccess(
                        "AI advice copied to clipboard."
                    );
                }

            } catch (error) {

                if (
                    error?.name !==
                    "AbortError"
                ) {

                    console.error(
                        "AI response sharing failed:",
                        error
                    );
                }
            }
        };


    // ==================================================
    // SEVERITY -> VISUAL TOKEN
    // ==================================================

    const severityDotClass =
        aiClassification?.severity === "critical" ||
            aiClassification?.severity === "high"
            ? "bg-red-600"
            : aiClassification?.severity === "medium"
                ? "bg-amber-500"
                : "bg-emerald-600";


    // ==================================================
    // PAGE UI
    // ==================================================

    return (

        <div className="min-h-screen bg-[#F7F7F5] text-slate-900">

            {/* ==========================================
                HEADER
            ========================================== */}

            <EmergencyHeader />


            <main className="mx-auto max-w-6xl px-4 py-8 pb-28">


                {/* ======================================
                    STATUS
                ====================================== */}

                <div className="mb-6">
                    <EmergencyStatus
                        locationText={
                            locationText
                        }
                    />
                </div>


                {/* ======================================
                    MAIN GRID
                    Left: assistant flow. Right: live map rail.
                ====================================== */}

                <div className="grid gap-6 lg:grid-cols-5 lg:items-start lg:gap-8">


                    {/* ==================================
                        LEFT COLUMN
                    ================================== */}

                    <div className="space-y-6 lg:col-span-3 lg:space-y-8">


                        {/* AI ASSISTANT */}

                        <EmergencyAssistant
                            query={
                                query
                            }
                            setQuery={
                                setQuery
                            }
                            language={
                                language
                            }
                            setLanguage={
                                setLanguage
                            }
                            processing={
                                processing
                            }
                            voiceStatus={
                                voiceStatus
                            }
                            startVoiceInput={
                                startVoiceInput
                            }
                            stopVoiceInput={
                                stopVoiceInput
                            }
                            quickHelp={
                                quickHelp
                            }
                            processQuery={
                                processQuery
                            }
                        />


                        {/* CATEGORIES */}

                        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

                            <div className="mb-5 flex items-center justify-between gap-3">
                                <h2 className="text-base font-semibold text-slate-900">
                                    What's happening
                                </h2>
                                <span className="text-xs text-slate-400">
                                    Pick the closest match
                                </span>
                            </div>

                            <EmergencyCategories
                                selectedCategory={
                                    selectedCategory
                                }
                                selectEmergencyCategory={
                                    selectEmergencyCategory
                                }
                            />

                        </section>


                        {/* EMERGENCY NUMBERS */}

                        <EmergencyNumbers />


                        {/* AI RESPONSE */}

                        <AIResponse
                            loading={
                                loading
                            }
                            aiResponse={
                                aiResponse
                            }
                            success={
                                success
                            }
                            error={
                                error
                            }
                            emergencyId={
                                emergencyId
                            }
                            trackingToken={
                                trackingToken
                            }
                            speakText={
                                speakText
                            }
                            shareAIResponse={
                                shareAIResponse
                            }
                            shareEmergency={
                                shareEmergency
                            }
                            navigate={
                                navigate
                            }
                        />


                        {/* AI CLASSIFICATION */}

                        {aiClassification && (

                            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                                <div className="flex items-center gap-2 border-b border-slate-100 px-6 py-4">
                                    <Sparkles className="h-4 w-4 text-teal-600" />
                                    <h2 className="text-sm font-semibold text-slate-900">
                                        AI assessment
                                    </h2>
                                </div>

                                <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">

                                    <div className="flex items-center gap-4">

                                        <span
                                            className={`h-3 w-3 flex-shrink-0 rounded-full ${severityDotClass}`}
                                            aria-hidden="true"
                                        />

                                        <div>
                                            <p className="text-base font-semibold capitalize text-slate-900">
                                                {
                                                    aiClassification.emergencyType
                                                }
                                            </p>
                                            <p className="text-sm capitalize text-slate-500">
                                                {
                                                    aiClassification.severity
                                                } severity
                                            </p>
                                        </div>

                                    </div>

                                    <div className="flex items-center gap-2 self-start rounded-full bg-slate-50 px-4 py-2 ring-1 ring-slate-200 sm:self-auto">
                                        <Shield className="h-4 w-4 flex-shrink-0 text-slate-400" />
                                        <p className="text-sm text-slate-600">
                                            Routed to{" "}
                                            <span className="font-semibold capitalize text-slate-900">
                                                {
                                                    aiClassification.department
                                                }
                                            </span>
                                        </p>
                                    </div>

                                </div>

                            </div>

                        )}

                    </div>


                    {/* ==================================
                        RIGHT COLUMN — LIVE MAP RAIL
                    ================================== */}

                    <div className="space-y-4 lg:col-span-2 lg:sticky lg:top-6">

                        <LocationMap
                            locationText={
                                locationText
                            }

                            mapContainerRef={
                                mapContainerRef
                            }

                            centerMapOnUser={
                                centerMapOnUser
                            }

                            clearRoute={
                                clearRoute
                            }

                            searchNearbyServices={
                                searchNearbyServices
                            }

                            nearbyServices={
                                nearbyServices
                            }

                            showRoute={
                                showRoute
                            }

                        />


                        {/* ROUTE LOADING */}

                        {routeLoading && (

                            <div className="flex items-center gap-3 rounded-2xl border border-teal-200 bg-teal-50 p-4">

                                <Loader2 className="h-5 w-5 flex-shrink-0 animate-spin text-teal-600" />

                                <div>
                                    <p className="text-sm font-semibold text-teal-900">
                                        Finding the fastest way there
                                    </p>
                                    <p className="mt-0.5 text-xs text-teal-700">
                                        Calculating the driving route from your location.
                                    </p>
                                </div>

                            </div>

                        )}


                        {/* ROUTE ERROR */}

                        {routeError && (

                            <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">

                                <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />

                                <div>
                                    <p className="text-sm font-semibold text-red-900">
                                        Route unavailable
                                    </p>
                                    <p className="mt-0.5 text-xs text-red-700">
                                        {
                                            routeError
                                        }
                                    </p>
                                </div>

                            </div>

                        )}


                        {/* ROUTE INFO */}

                        <RouteInfo
                            routeInfo={
                                routeInfo
                            }
                            clearRoute={
                                clearRoute
                            }
                        />

                    </div>

                </div>

            </main>


            {/* ==========================================
                USER MODAL
            ========================================== */}

            <EmergencyUserModal
                showUserModal={
                    showUserModal
                }

                setShowUserModal={
                    setShowUserModal
                }

                userName={
                    userName
                }

                setUserName={
                    setUserName
                }

                userMobile={
                    userMobile
                }

                setUserMobile={
                    setUserMobile
                }

                submitEmergency={
                    submitEmergency
                }

                loading={
                    loading
                }
            />

            {/* ==========================================
                FLOATING CHATBOT BUTTON
            ========================================== */}

            {!showChatbot && (
                <div className="fixed bottom-5 right-5 z-[900] sm:bottom-7 sm:right-7">

                    <span
                        className="absolute inset-0 rounded-full bg-red-500/60 motion-safe:animate-ping motion-reduce:hidden"
                        aria-hidden="true"
                    />

                    <button
                        type="button"
                        onClick={() => setShowChatbot(true)}
                        aria-label="Open QuickAid chatbot"
                        title="Open QuickAid Assistant"
                        className="relative flex h-16 w-16 items-center justify-center rounded-full bg-red-600 text-white shadow-[0_12px_28px_-8px_rgba(220,38,38,0.55)] ring-4 ring-white transition-transform duration-200 hover:scale-105 active:scale-95"
                    >
                        <MessageCircle size={26} />
                    </button>

                </div>
            )}

            {/* ==========================================
                CHATBOT TOGGLE PANEL
            ========================================== */}

            {showChatbot && (
                <EmergencyChatbot
                    onClose={() => setShowChatbot(false)}
                />
            )}

        </div>
    );
}

export default InstantHelp;