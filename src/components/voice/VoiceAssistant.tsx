import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBatteries } from '@/hooks/useBatteries';
import { useAlerts } from '@/hooks/useAlerts';

// Augment window interface for Speech Recognition
declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

export const VoiceAssistant = () => {
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [response, setResponse] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    // Hooks to access data for answers
    const { getStats } = useBatteries();
    const { alerts } = useAlerts();

    const recognitionRef = useRef<any>(null);
    const synthesisRef = useRef<SpeechSynthesis>(window.speechSynthesis);
    const processCommandRef = useRef<(cmd: string) => void>(() => { }); // Placeholder

    useEffect(() => {
        // Initialize Speech Recognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.lang = 'en-US';
            recognition.interimResults = false;

            recognition.onstart = () => setIsListening(true);
            recognition.onend = () => setIsListening(false);
            recognition.onerror = (event: any) => {
                console.error("Speech Recognition Error:", event.error);
                setIsListening(false);

                if (event.error === 'not-allowed') {
                    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname === '[::1]';
                    const isSecure = window.location.protocol === 'https:' || window.isSecureContext;

                    if (!isLocal && !isSecure) {
                        toast.error("Voice AI requires HTTPS", {
                            description: "Browsers block microphone access on insecure connections (HTTP). Please use localhost or setup HTTPS."
                        });
                    } else {
                        toast.error("Microphone Access Denied", {
                            description: "Please allow microphone permissions in your browser settings."
                        });
                    }
                } else if (event.error === 'no-speech') {
                    // Ignore no-speech errors (user just stopped talking)
                } else {
                    toast.error("Voice Recognition Failed", {
                        description: `Error: ${event.error}`
                    });
                }
            };

            recognition.onresult = (event: any) => {
                try {
                    const text = event.results[0][0].transcript;
                    setTranscript(text);
                    processCommandRef.current(text); // Call the latest version via ref
                } catch (e) {
                    console.error("Error processing speech result:", e);
                }
            };

            recognitionRef.current = recognition;
        } else {
            console.warn("Speech Recognition not supported in this browser.");
        }
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    const speak = (text: string) => {
        if (synthesisRef.current.speaking) {
            synthesisRef.current.cancel();
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);

        // Select a futuristic voice if available
        const voices = synthesisRef.current.getVoices();
        const googleVoice = voices.find(v => v.name.includes('Google US English'));
        if (googleVoice) utterance.voice = googleVoice;

        setResponse(text);
        synthesisRef.current.speak(utterance);
    };

    // Use refs to keep access to latest data inside the closure-trapped event listener
    const getStatsRef = useRef(getStats);
    const alertsRef = useRef(alerts);

    // Update refs when data changes
    useEffect(() => {
        getStatsRef.current = getStats;
    }, [getStats]);

    useEffect(() => {
        alertsRef.current = alerts;
    }, [alerts]);

    // Keep processCommandRef updated
    useEffect(() => {
        processCommandRef.current = processCommand;
    }); // Update on every render

    const processCommand = (cmd: string) => {
        const command = cmd.toLowerCase();

        // Navigation Commands
        if (command.includes('go to') || command.includes('navigate to') || command.includes('open')) {
            const routes: Record<string, string> = {
                'dashboard': '/dashboard',
                'home': '/dashboard',
                'register': '/register',
                'add battery': '/register',
                'new battery': '/register',
                'monitor': '/monitor',
                'live': '/monitor',
                'alerts': '/alerts',
                'warnings': '/alerts',
                'reports': '/reports',
                'report': '/reports', // Added singular
                'analytics': '/analytics',
                'stats': '/analytics',
                'settings': '/settings',
                'preferences': '/settings',
                'marketplace': '/marketplace',
                'result': '/results',
                'results': '/results',
                'passport': '/passport',
                'comparison': '/comparison'
            };

            let foundRoute = false;
            for (const [key, path] of Object.entries(routes)) {
                if (command.includes(key)) {
                    speak(`Navigating to ${key}.`);
                    navigate(path);
                    foundRoute = true;
                    setIsOpen(false); // Close assistant on navigation
                    break;
                }
            }

            if (!foundRoute) {
                speak("I heard navigation, but I'm not sure which page you want. Try 'Go to Dashboard' or 'Open Settings'.");
            }
            return;
        }

        // Check for navigation first!
        // (Navigation block above handles "navigate to report")

        if (command.includes('status') || (command.includes('report') && !command.includes('navigate') && !command.includes('go to'))) {
            const stats = getStatsRef.current(); // Use ref
            const text = `System Status Report. You have ${stats.total} batteries registered. ${stats.healthy} are healthy, and ${stats.recyclable + stats.repairable} require attention.`;
            speak(text);
        }
        else if (command.includes('alert') || command.includes('problem') || command.includes('warning')) {
            const activeAlerts = alertsRef.current.filter(a => !a.acknowledged).length; // Use ref
            if (activeAlerts === 0) {
                speak("No active alerts. All systems distinctively nominal.");
            } else {
                speak(`Warning. You have ${activeAlerts} active alerts requiring immediate attention.`);
            }
        }
        else if (command.includes('hello') || command.includes('hi')) {
            speak("Hello! I am Batt-IQ, your energy management assistant. How can I help?");
        }
        else {
            speak("I didn't catch that. Try asking for a Status Report or say 'Go to Dashboard'.");
        }
    };

    const toggleListening = () => {
        if (!recognitionRef.current) {
            alert("Your browser does not support Voice AI.");
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
        } else {
            setIsOpen(true);
            recognitionRef.current.start();
        }
    };

    return (
        <>
            <motion.div
                className="fixed bottom-24 md:bottom-6 left-4 md:left-6 z-50"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
            >
                <Button
                    size="lg"
                    className={`rounded-full w-14 h-14 shadow-2xl p-0 flex items-center justify-center ${isListening ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-primary hover:bg-primary/90'} `}
                    onClick={toggleListening}
                >
                    {isListening ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                </Button>
            </motion.div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        className="fixed bottom-24 md:bottom-6 left-20 md:left-24 w-72 md:w-80 bg-card/95 backdrop-blur-md border border-primary/20 rounded-2xl shadow-2xl z-40 overflow-hidden"
                    >
                        <div className="p-4 relative">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 h-6 w-6 text-muted-foreground hover:text-foreground"
                                onClick={() => setIsOpen(false)}
                            >
                                <X className="h-4 w-4" />
                            </Button>

                            <div className="flex items-center gap-3 mb-4">
                                <div className={`p-2 rounded-full ${isSpeaking ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'} `}>
                                    <Volume2 className={`h-5 w-5 ${isSpeaking ? 'animate-pulse' : ''} `} />
                                </div>
                                <h3 className="font-semibold text-foreground">Voice Assistant</h3>
                            </div>

                            <div className="space-y-4">
                                {isListening && (
                                    <div className="flex items-center gap-2 text-sm text-primary animate-pulse">
                                        <Mic className="h-4 w-4" /> Listening...
                                    </div>
                                )}

                                {transcript && (
                                    <div className="bg-secondary/50 p-3 rounded-lg text-sm text-foreground/80 italic">
                                        "{transcript}"
                                    </div>
                                )}

                                {response && (
                                    <div className="bg-primary/10 p-3 rounded-lg text-sm text-foreground border border-primary/20">
                                        {response}
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
