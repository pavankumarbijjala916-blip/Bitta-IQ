import { GoogleGenerativeAI, ChatSession } from '@google/generative-ai';

// Initialize the API with the environment variable
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(API_KEY);

const SYSTEM_INSTRUCTION = `You are BATT IQ Assistant, a professional, intelligent, and helpful AI assistant for the Green Battery Buddy application. You specialize in battery health monitoring, sustainable disposal, circular economy for batteries, and general knowledge.

Core Guidelines:
1. Tone: Professional, encouraging, and natural.
2. Capability: You can answer ANY question gracefully. If it's general knowledge, answer it accurately. If it's technical, provide clear explanations.
3. Formatting: Use markdown formatting (bold, lists, code blocks) to structure your responses for readability when appropriate. Keep responses concise unless asked for details.
4. Application Context: You are embedded in "BATT IQ", an app that monitors Battery State of Health (SoH), tracks charge cycles, creates Digital Battery Passports, and flags batteries for Repair or Recycling. Use this context if the user asks about app features.
5. Error Handling: Do not hallucinate battery data. If asked about a user's specific battery, politely state that you can only provide general advice and they should check the Dashboard for their live telemetry.

You must never break character. Always respond intelligently.`;

// Singleton instance to hold a global conversation history for the chatbot
let globalChatSession: ChatSession | null = null;

export const aiService = {
    isConfigured: () => !!API_KEY,

    getChatSession: () => {
        if (!API_KEY) {
            console.warn("Gemini API key is missing. AI features will use fallback mode.");
            return null;
        }

        if (!globalChatSession) {
            try {
                const model = genAI.getGenerativeModel({
                    model: "gemini-1.5-flash",
                    systemInstruction: SYSTEM_INSTRUCTION,
                });

                globalChatSession = model.startChat({
                    history: [],
                    generationConfig: {
                        maxOutputTokens: 1000,
                        temperature: 0.7,
                    }
                });
            } catch (error) {
                console.error("Failed to initialize Gemini AI session:", error);
                return null;
            }
        }

        return globalChatSession;
    },

    sendMessage: async (message: string): Promise<string> => {
        if (!API_KEY) {
            return "I'm sorry, my AI capabilities are currently offline because the API key is not configured. Please add `VITE_GEMINI_API_KEY` to your environment settings.";
        }

        try {
            const chat = aiService.getChatSession();
            if (!chat) throw new Error("Chat session not initialized");

            const result = await chat.sendMessage(message);
            return result.response.text();
        } catch (error: any) {
            console.error("Gemini API Error:", error);
            return "I apologize, but I encountered a network error while processing your request. Please try again.";
        }
    },

    // Separate function for Voice Assistant since voice shouldn't necessarily pollute the chatbot's specific text history, 
    // and needs shorter, punchier responses suitable for Speech-to-Text.
    generateVoiceResponse: async (message: string, isNavigationContext: boolean = false): Promise<string> => {
        if (!API_KEY) {
            return "My AI is currently offline. Please configure the API key.";
        }

        try {
            const model = genAI.getGenerativeModel({
                model: "gemini-1.5-flash",
                systemInstruction: SYSTEM_INSTRUCTION + `\n\nCRITICAL VOICE INSTRUCTION: This response will be READ ALOUD via Text-to-Speech. You MUST keep the response extremely concise (1-3 sentences max). DO NOT use markdown, asterisks, or complex formatting. Speak naturally.`,
            });

            let prompt = message;
            if (isNavigationContext) {
                prompt = `The user issued a voice command: "${message}". I have already executed the navigation to fulfill this request. Give a very short, polite 1-sentence confirmation that you've done this.`;
            }

            const result = await model.generateContent(prompt);
            return result.response.text().replace(/\*/g, ''); // strip any accidental asterisks for clean TTS
        } catch (error) {
            console.error("Gemini Voice API Error:", error);
            return "Sorry, I am having trouble connecting to my neural net.";
        }
    }
};
