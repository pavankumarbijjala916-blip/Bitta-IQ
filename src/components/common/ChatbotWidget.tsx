import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import type { ChatMessage, ChatbotResponse, Intent } from '@/types/enhanced';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface ChatbotWidgetProps {
  userId?: string;
  onClose?: () => void;
}

// Enhanced chatbot knowledge base with weighted keywords
const CHATBOT_KNOWLEDGE_BASE: Record<Intent, {
  keywords: string[];
  responses: string[];
}> = {
  check_battery_health: {
    keywords: ['health', 'status', 'condition', 'check', 'assess', 'analysis', 'diagnose'],
    responses: [
      'To check your battery health, register your battery and enter its parameters (voltage, temperature, charge cycles, capacity). Our AI will analyze and provide a health assessment.',
      'Your battery health is determined by factors like voltage stability, temperature, charge cycles, and capacity retention. Visit the Assessment section to get a detailed analysis.',
    ],
  },
  battery_parameters: {
    keywords: ['voltage', 'temperature', 'cycles', 'capacity', 'parameters', 'metrics', 'reading'],
    responses: [
      'Battery parameters are key measurements: Voltage (electrical potential), Temperature (operating heat), Charge Cycles (full charge/discharge count), and Capacity (energy storage ability).',
      'Each parameter influences battery health. High temperatures and numerous cycles accelerate degradation. Monitor these regularly for better battery insights.',
    ],
  },
  disposal_guidance: {
    keywords: ['dispose', 'recycle', 'disposal', 'throw', 'rid of', 'waste', 'trash'],
    responses: [
      'Never throw batteries in regular trash. They contain hazardous materials. Use authorized recycling facilities or e-waste disposal centers certified for battery handling.',
      'Responsible disposal protects the environment and recovers valuable materials. Check our Recommendation section for certified disposal facilities near you.',
    ],
  },
  safe_usage: {
    keywords: ['safe', 'safely', 'usage', 'use', 'protect', 'prevent', 'extend', 'life', 'care'],
    responses: [
      'Safe battery usage includes: keeping optimal temperature (15-35°C), avoiding complete discharge, using quality chargers, proper storage in cool dry places.',
      'Limit fast charging, avoid overcharging, maintain moderate operating temperatures, and avoid physical damage to extend battery lifespan.',
    ],
  },
  system_help: {
    keywords: ['help', 'how', 'where', 'navigate', 'feature', 'guide', 'menu', 'dashboard'],
    responses: [
      'BATT IQ helps monitor battery health and provides disposal recommendations. Navigate using: Dashboard (overview), Register Battery, Assessment, Results, and Alerts.',
      'Use the Dashboard to view all batteries and stats. Click Register Battery to add new batteries. Use Assessment to analyze battery health.',
    ],
  },
  report_request: {
    keywords: ['report', 'generate', 'export', 'download', 'document', 'pdf', 'print'],
    responses: [
      'You can generate comprehensive reports from the Results section. Reports include health analysis, recommendations, and environmental impact data.',
      'Access your previous reports from the Reports section. Export as PDF or HTML format for sharing or documentation. You can also email them directly.',
    ],
  },
  eco_quest: {
    keywords: ['xp', 'level', 'game', 'gamification', 'badge', 'points', 'leaderboard', 'rank', 'quest'],
    responses: [
      'Eco-Quest is our new gamification feature! Earn XP by registering batteries (+50 XP) and keeping them healthy (+100 XP).',
      'Level up from "Battery Novice" to "Sustainability Legend" by actively managing your fleet. Check your progress on the Dashboard widget!',
    ],
  },
  password_reset: {
    keywords: ['password', 'reset', 'forgot', 'change', 'login', 'account', 'access'],
    responses: [
      'To reset your password, click "Forgot password?" on the login page. We\'ll send you a secure link to create a new one.',
      'If you are logged in, go to Settings (in the navbar) to change your password instantly. Secure your account!',
    ],
  },
  email_issue: {
    keywords: ['email', 'sendgrid', 'api key', 'unauthorized', 'sending failed', 'error'],
    responses: [
      'If you see "Unauthorized" email errors, check your SendGrid API Key in .env. It must start with "SG." and the sender email must be verified in SendGrid.',
      'Ensure your API Key has "Mail Send" permissions. You can regenerate a new key in your SendGrid settings if the current one is invalid.',
    ],
  },
  faq: {
    keywords: ['question', 'frequently asked', 'faq', 'common', 'ask'],
    responses: [
      'Common questions are answered in our FAQ section. Browse by category or search for specific topics about battery health and disposal.',
      'For questions not in the FAQ, feel free to contact our support team or ask me directly!',
    ],
  },
  other: {
    keywords: [],
    responses: [
      "I'm here to help! Ask me about battery health, disposal, safe usage, system features, or generating reports.",
      "I didn't quite understand. Could you rephrase? I can help with battery health checks, disposal guidance, usage tips, or system navigation.",
    ],
  },
};

export const ChatbotWidget: React.FC<ChatbotWidgetProps> = ({ userId, onClose }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      conversationId: 'new',
      userId: 'bot',
      sender: 'bot',
      text: "Hi! 👋 I'm BATT IQ Assistant v2.0. I can help with Eco-Quest XP, password resets, battery health, and more. How can I assist?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]); // Scroll when loading state changes too

  // Enhanced Intent Classification with Scoring
  const classifyIntent = (text: string): Intent => {
    const lowerText = text.toLowerCase();
    let bestIntent: Intent = 'other';
    let maxScore = 0;

    for (const [intent, data] of Object.entries(CHATBOT_KNOWLEDGE_BASE)) {
      if (intent === 'other') continue;

      let score = 0;
      data.keywords.forEach((keyword) => {
        if (lowerText.includes(keyword)) {
          score += keyword.length; // Longer usage of keywords = higher relevance
        }
      });

      if (score > maxScore) {
        maxScore = score;
        bestIntent = intent as Intent;
      }
    }

    // Threshold to avoid weak matches
    return maxScore > 2 ? bestIntent : 'other';
  };

  const generateResponse = (intent: Intent): ChatbotResponse => {
    const knowledgeBase = CHATBOT_KNOWLEDGE_BASE[intent];
    const randomResponse = knowledgeBase.responses[
      Math.floor(Math.random() * knowledgeBase.responses.length)
    ];

    return {
      text: randomResponse,
      intent,
      confidence: intent === 'other' ? 0.5 : 0.95,
      suggestions: [
        'Check my battery health',
        'How do I earn XP?',
        'Forgot password',
        'Disposal options',
      ],
      quickReplies: ['Yes', 'No', 'Tell me more', 'Thanks!'],
    };
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim()) return;

    const currentInput = input;
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      conversationId: 'current',
      userId: userId || 'anonymous',
      sender: 'user',
      text: currentInput,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (apiKey) {
      // Use Gemini API
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        
        const systemInstruction = `You are a helpful AI assistant for BATT IQ, a battery health monitoring system. 
        Your job is to answer questions about battery health, parameters (voltage, temperature, capacity, charge cycles), 
        eco-quest (gamification), disposal guidance, and safe usage. Be concise, helpful, and friendly. 
        Format your responses clearly.`;
        
        const model = genAI.getGenerativeModel({ 
          model: "gemini-1.5-flash",
          systemInstruction: systemInstruction 
        });

        // Add previous messages context
        const history = messages
          .filter(m => m.id !== '1') // skip the hardcoded first message if needed, or include it
          .map(m => ({
            role: m.sender === 'user' ? 'user' : 'model',
            parts: [{ text: m.text }]
          }));

        const chat = model.startChat({
          history: history,
        });

        const result = await chat.sendMessage(currentInput);
        const responseText = result.response.text();

        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          conversationId: 'current',
          userId: 'bot',
          sender: 'bot',
          text: responseText,
          timestamp: new Date(),
          metadata: {
            intent: 'other',
            confidence: 0.99,
          },
        };
        setMessages((prev) => [...prev, botMessage]);
      } catch (error) {
        console.error("Gemini API Error:", error);
        // Fallback or error message
        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          conversationId: 'current',
          userId: 'bot',
          sender: 'bot',
          text: "I'm having trouble connecting to my AI brain right now. Please check your API key or network connection.",
          timestamp: new Date(),
          metadata: { intent: 'other', confidence: 0 },
        };
        setMessages((prev) => [...prev, botMessage]);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Fallback to static mock if no API key is set
      setTimeout(() => {
        const intent = classifyIntent(currentInput);
        const botResponse = generateResponse(intent);
        
        let responseText = botResponse.text;
        if (intent === 'other') {
           responseText = "(Set VITE_GEMINI_API_KEY in .env for true AI!) " + responseText;
        }

        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          conversationId: 'current',
          userId: 'bot',
          sender: 'bot',
          text: responseText,
          timestamp: new Date(),
          metadata: {
            intent: botResponse.intent,
            confidence: botResponse.confidence,
          },
        };

        setMessages((prev) => [...prev, botMessage]);
        setIsLoading(false);
      }, 600);
    }
  };

  const handleSuggestion = (suggestion: string) => {
    setInput(suggestion);
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-24 md:bottom-6 right-4 md:right-6 w-14 h-14 bg-primary text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center z-40 cursor-pointer"
          >
            <MessageCircle className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-24 md:bottom-6 right-4 md:right-6 w-[calc(100vw-32px)] md:w-96 max-h-[70vh] md:h-[600px] bg-white rounded-lg shadow-2xl flex flex-col z-50 border border-gray-200"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-primary/80 text-white p-4 rounded-t-lg flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg">BATT IQ Assistant</h3>
                <p className="text-xs text-white/80">Always here to help</p>
              </div>
              <button
                onClick={() => {
                  setIsOpen(false);
                  onClose?.();
                }}
                className="p-1 hover:bg-white/20 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${message.sender === 'user'
                      ? 'bg-primary text-white rounded-br-none'
                      : 'bg-white border border-gray-200 text-gray-900 rounded-bl-none'
                      }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-white border border-gray-200 px-4 py-2 rounded-lg rounded-bl-none flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <p className="text-sm text-gray-600">Thinking...</p>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions */}
            {messages.length > 0 && !isLoading && (
              <div className="px-4 py-2 border-t border-gray-200 bg-white">
                <p className="text-xs text-gray-500 mb-2 font-medium">Quick suggestions:</p>
                <div className="grid grid-cols-2 gap-2">
                  {['Check battery', 'Disposal info', 'Learn more', 'Help'].map((suggestion) => (
                    <motion.button
                      key={suggestion}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleSuggestion(suggestion)}
                      className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition"
                    >
                      {suggestion}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Ask me something..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isLoading}
                  className="flex-1 text-sm"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="bg-primary text-white p-2 rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <Send className="w-4 h-4" />
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatbotWidget;
