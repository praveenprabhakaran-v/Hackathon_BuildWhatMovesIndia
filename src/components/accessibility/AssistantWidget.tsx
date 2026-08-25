/**
 * RTI Online - Multilingual AI Assistant, Voice & Accessibility Widget
 * Features:
 * - Deterministic, cached TTS voice selection with honest fallback notice
 * - Multilingual Chat (en, hi, ta, mr, bn, te) decoupled from site UI language
 * - Dynamic language detection with "Replying in {Lang}" pill and tap-to-lock toggle
 * - Concise, bulleted responses ending with proactive expansion offers
 * - Tool-forced getApplicationStatus function-calling
 * - RAG Grounded Responses over official guidelines with confidence & source citations
 * - Web Speech API Voice Input (SpeechRecognition) with live editable transcript
 * - Text-to-Speech Output (SpeechSynthesis)
 * - Fixed Intent Voice Navigation
 * - Prominent "AI-generated, verify with official sources" badges
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  X,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  HelpCircle,
  FileText,
  AlertTriangle,
  Compass,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  Lock,
  Unlock,
  Info,
} from 'lucide-react';
import { useLanguage } from '../../lib/context/LanguageContext';
import { Locale, SUPPORTED_LANGUAGES } from '../../lib/i18n';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  language?: Locale;
  sources?: { title: string; excerpt: string }[];
  usedTool?: string;
  confidence?: 'high' | 'low';
  timestamp: string;
}

interface AssistantWidgetProps {
  onNavigate?: (path: string) => void;
  onTrackQuick?: (regNo: string) => void;
}

const LOCALE_MAP: Record<Locale, string[]> = {
  hi: ['hi-IN', 'hi_IN', 'hi'],
  ta: ['ta-IN', 'ta_IN', 'ta'],
  mr: ['mr-IN', 'mr_IN', 'mr'],
  bn: ['bn-IN', 'bn-BD', 'bn_IN', 'bn'],
  te: ['te-IN', 'te_IN', 'te'],
  en: ['en-IN', 'en-GB', 'en-US', 'en'], // Prefer Indian English first
};

let cachedVoices: SpeechSynthesisVoice[] = [];
const voiceCache = new Map<Locale, { voice: SpeechSynthesisVoice | null; isRealMatch: boolean }>();

function loadVoices() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    cachedVoices = window.speechSynthesis.getVoices();
    voiceCache.clear();
  }
}

function pickVoice(lang: Locale): { voice: SpeechSynthesisVoice | null; isRealMatch: boolean } {
  if (voiceCache.has(lang)) {
    return voiceCache.get(lang)!;
  }

  if (cachedVoices.length === 0 && typeof window !== 'undefined' && 'speechSynthesis' in window) {
    cachedVoices = window.speechSynthesis.getVoices();
  }

  const targets = LOCALE_MAP[lang] || ['en-IN', 'en-GB', 'en-US', 'en'];

  // Check for native voice match in browser
  for (const locale of targets) {
    const match = cachedVoices.find(
      (v) =>
        v.lang.toLowerCase() === locale.toLowerCase() ||
        v.lang.toLowerCase().replace('_', '-') === locale.toLowerCase() ||
        v.lang.toLowerCase().startsWith(locale.toLowerCase() + '-')
    );
    if (match) {
      const res = { voice: match, isRealMatch: true };
      voiceCache.set(lang, res);
      return res;
    }
  }

  // Fallback: Choose ONE consistent English voice
  const fallback =
    cachedVoices.find((v) => v.lang.toLowerCase().includes('en-in')) ||
    cachedVoices.find((v) => v.lang.toLowerCase().includes('en-gb')) ||
    cachedVoices.find((v) => v.lang.toLowerCase().includes('en-us')) ||
    cachedVoices.find((v) => v.lang.toLowerCase().startsWith('en')) ||
    (cachedVoices.length > 0 ? cachedVoices[0] : null);

  const res = { voice: fallback, isRealMatch: lang === 'en' };
  voiceCache.set(lang, res);
  return res;
}

// Fixed audited voice navigation intents
const NAVIGATION_INTENTS: { keywords: string[]; path: string; label: string }[] = [
  { keywords: ['file', 'apply', 'new rti', 'request', 'lodging', 'submit'], path: '/file-rti', label: 'File New RTI' },
  { keywords: ['track', 'status', 'check', 'where is', 'progress'], path: '/track', label: 'Track Application' },
  { keywords: ['appeal', 'first appeal', 'faa', 'refused'], path: '/first-appeal', label: 'File First Appeal' },
  { keywords: ['history', 'my applications', 'records', 'past'], path: '/history', label: 'Citizen History' },
  { keywords: ['authority', 'directory', 'cpio', 'department', 'ministry'], path: '/authorities', label: 'Authorities Directory' },
  { keywords: ['faq', 'guidelines', 'manual', 'rules', 'help'], path: '/faq', label: 'FAQs & Guidelines' },
  { keywords: ['reconcile', 'payment reconciliation', 'transaction'], path: '/payment-reconciliation', label: 'Payment Reconciliation' },
];

// Explicit Chat Language Options matching backend enum
const CHAT_LANGUAGE_OPTIONS: { code: Locale; label: string; native: string }[] = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'mr', label: 'Marathi', native: 'मराठी' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
];

export const AssistantWidget: React.FC<AssistantWidgetProps> = ({ onNavigate, onTrackQuick }) => {
  const { currentLocale } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [transcriptDraft, setTranscriptDraft] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Decoupled chat language independent from site-wide language
  const [chatLanguage, setChatLanguage] = useState<Locale>(currentLocale);
  const [isLanguageLocked, setIsLanguageLocked] = useState(false);
  const [fallbackWarningMsgId, setFallbackWarningMsgId] = useState<string | null>(null);

  // Ref-backed state tracking to prevent stale closures on rapid language switching
  const chatLanguageRef = useRef<Locale>(currentLocale);
  const isLanguageLockedRef = useRef<boolean>(false);

  // Sync site language changes if citizen has not explicitly locked the chat language
  useEffect(() => {
    if (!isLanguageLockedRef.current) {
      setChatLanguage(currentLocale);
      chatLanguageRef.current = currentLocale;
    }
  }, [currentLocale]);

  const handleLanguageChange = (newLang: Locale) => {
    setChatLanguage(newLang);
    chatLanguageRef.current = newLang;
    setIsLanguageLocked(true);
    isLanguageLockedRef.current = true;
  };

  const handleToggleLock = () => {
    const nextLocked = !isLanguageLockedRef.current;
    setIsLanguageLocked(nextLocked);
    isLanguageLockedRef.current = nextLocked;
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Namaste! I am the official RTI Online Citizen AI Assistant. You can ask me how to file an RTI, check your application status by Registration Number, or navigate the portal in your preferred language.',
      language: currentLocale,
      confidence: 'high',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize and listen for voice list loading
  useEffect(() => {
    loadVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Scroll to bottom on new message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Setup Web Speech API for voice recognition using chatLanguage
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      const targetLocale = LOCALE_MAP[chatLanguage]?.[0] || 'en-IN';
      recognition.lang = targetLocale;

      recognition.onresult = (event: any) => {
        let current = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          current += event.results[i][0].transcript;
        }
        setTranscriptDraft(current);
      };

      recognition.onerror = (e: any) => {
        console.warn('Speech recognition error:', e);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [chatLanguage]);

  const toggleVoiceListening = () => {
    if (!recognitionRef.current) {
      alert('Voice recognition is not supported in this browser. Please use Chrome/Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      if (transcriptDraft.trim()) {
        setInputQuery(transcriptDraft);
        setTranscriptDraft('');
      }
    } else {
      setTranscriptDraft('');
      const targetLocale = LOCALE_MAP[chatLanguage]?.[0] || 'en-IN';
      recognitionRef.current.lang = targetLocale;
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const speakText = (msgId: string, text: string, msgLanguage?: Locale) => {
    if (!('speechSynthesis' in window)) return;

    // Toggle off if already speaking this message
    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const targetLang = msgLanguage || chatLanguage;
    const { voice, isRealMatch } = pickVoice(targetLang);

    // Show inline fallback notice if device lacks native voice for selected language
    if (!isRealMatch && targetLang !== 'en') {
      setFallbackWarningMsgId(msgId);
    } else {
      setFallbackWarningMsgId(null);
    }

    const cleanText = text.replace(/[*_#`[\]()]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);

    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      utterance.lang = LOCALE_MAP[targetLang]?.[0] || 'en-IN';
    }

    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);

    setSpeakingMsgId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  // Fixed intent voice navigation detector
  const checkVoiceNavigationIntent = (query: string): string | null => {
    const q = query.toLowerCase();
    for (const intent of NAVIGATION_INTENTS) {
      if (intent.keywords.some((k) => q.includes(k))) {
        return intent.path;
      }
    }
    return null;
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || inputQuery).trim();
    if (!textToSend || isLoading) return;

    setInputQuery('');
    setTranscriptDraft('');

    // Check voice navigation intent first
    const matchedPath = checkVoiceNavigationIntent(textToSend);
    if (
      matchedPath &&
      onNavigate &&
      (textToSend.toLowerCase().startsWith('go to') ||
        textToSend.toLowerCase().startsWith('open') ||
        textToSend.toLowerCase().startsWith('navigate'))
    ) {
      const intentLabel = NAVIGATION_INTENTS.find((i) => i.path === matchedPath)?.label || matchedPath;
      onNavigate(matchedPath);
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          sender: 'user',
          text: textToSend,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
        {
          id: String(Date.now() + 1),
          sender: 'bot',
          text: `Navigating directly to **${intentLabel}** as requested.`,
          confidence: 'high',
          language: chatLanguage,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      return;
    }

    // Add user message
    const userMsg: Message = {
      id: String(Date.now()),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    const activeReqLang = chatLanguageRef.current || chatLanguage || 'en';
    const activeReqLocked = isLanguageLockedRef.current;

    try {
      const res = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          language: activeReqLang,
          isLanguageLocked: activeReqLocked,
        }),
      });

      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({ error: 'Assistant service returned an error status.' }));
        console.error('[Chat Assistant] Request failed with HTTP', res.status, errorBody);
        throw new Error(errorBody.error || errorBody.message || `Request failed with status ${res.status}`);
      }

      const data = await res.json();

      // If language was not locked and model detected a new language, update chatLanguage
      if (!isLanguageLockedRef.current && data.detectedLanguage && data.detectedLanguage !== chatLanguageRef.current) {
        setChatLanguage(data.detectedLanguage as Locale);
        chatLanguageRef.current = data.detectedLanguage as Locale;
      }

      const botMsg: Message = {
        id: String(Date.now() + 1),
        sender: 'bot',
        text: data.reply,
        language: (data.detectedLanguage || data.language || activeReqLang) as Locale,
        sources: data.sources,
        usedTool: data.usedTool,
        confidence: data.confidence || 'high',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error('[Chat Assistant Error]:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          sender: 'bot',
          text: `⚠️ ${err?.message || 'Unable to reach the assistant service. Please check your network or verify information using the official Guidelines.'}`,
          confidence: 'low',
          language: activeReqLang,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const currentLangObj = CHAT_LANGUAGE_OPTIONS.find((l) => l.code === chatLanguage) || CHAT_LANGUAGE_OPTIONS[0];

  return (
    <>
      {/* Floating Toggle Button */}
      <aside
        aria-label="RTI Citizen AI Assistant"
        className="fixed bottom-6 right-6 z-50 flex flex-col items-end no-print"
      >
        {!isOpen && (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-2.5 px-4 py-3 bg-[#1B4B8F] text-white rounded-full shadow-xl hover:bg-[#123362] hover:shadow-2xl transition-all duration-200 active:scale-95 cursor-pointer border-2 border-white focus:outline-none focus:ring-4 focus:ring-[#1B4B8F]/30"
            aria-label="Open RTI AI Assistant and Voice Help"
          >
            <div className="relative">
              <Bot className="w-6 h-6 animate-pulse" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full"></span>
            </div>
            <span className="text-sm font-semibold pr-1">Ask RTI Assistant</span>
            <span className="hidden group-hover:inline-block text-[10px] uppercase font-mono-code bg-[#EEF3FA] text-[#1B4B8F] px-1.5 py-0.5 rounded font-bold">
              AI + Voice
            </span>
          </button>
        )}

        {/* Chat Drawer / Modal Container */}
        {isOpen && (
          <div className="w-[92vw] sm:w-[420px] h-[590px] max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
            {/* Header */}
            <div className="bg-[#1B4B8F] text-white p-3.5 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold tracking-tight">Citizen AI Assistant</h3>
                    <span className="text-[9px] bg-white/20 px-1.5 py-0.2 rounded font-mono-code">RAG Grounded</span>
                  </div>
                  <p className="text-[10px] text-white/80">Voice & Multilingual RTI Helper</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Assistant Explicit Language Selector */}
                <div className="relative">
                  <select
                    value={chatLanguage}
                    onChange={(e) => handleLanguageChange(e.target.value as Locale)}
                    className="bg-white/15 text-white text-[11px] font-semibold py-1 px-2 pr-6 rounded-md appearance-none hover:bg-white/25 focus:outline-none cursor-pointer"
                    aria-label="Select Assistant Language"
                  >
                    {CHAT_LANGUAGE_OPTIONS.map((l) => (
                      <option key={l.code} value={l.code} className="text-gray-900 bg-white">
                        {l.native}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3 h-3 text-white absolute right-1.5 top-2 pointer-events-none" />
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/20 transition-colors text-white cursor-pointer"
                  aria-label="Close RTI Assistant"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Sub-Header Notice & Language Lock Indicator Pill */}
            <div className="bg-[#EEF3FA] px-3 py-1.5 border-b border-[#1B4B8F]/15 flex items-center justify-between text-[11px] text-[#1B4B8F]">
              <div className="flex items-center gap-1.5">
                {/* Replying In Pill with Tap to Lock/Unlock */}
                <button
                  type="button"
                  onClick={handleToggleLock}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${
                    isLanguageLocked
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : 'bg-white text-[#1B4B8F] border-[#1B4B8F]/20'
                  }`}
                  title={isLanguageLocked ? 'Language locked. Click to enable auto-detect' : 'Auto-detect active. Click to lock'}
                >
                  {isLanguageLocked ? <Lock className="w-2.5 h-2.5" /> : <Unlock className="w-2.5 h-2.5" />}
                  <span>Replying in {currentLangObj.native} ({isLanguageLocked ? 'Locked' : 'Auto'})</span>
                </button>
              </div>
              <span className="text-[10px] text-gray-500 font-mono-code">RTI Act, 2005</span>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-[#FAF9F5]/70 text-xs">
              {messages.map((msg) => {
                const msgLang = msg.language || chatLanguage;
                const msgLangName = SUPPORTED_LANGUAGES.find((l) => l.code === msgLang)?.label || msgLang;
                const isThisSpeaking = speakingMsgId === msg.id;
                const hasFallbackNotice = fallbackWarningMsgId === msg.id;

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[88%] p-3 rounded-2xl ${
                        msg.sender === 'user'
                          ? 'bg-[#1B4B8F] text-white rounded-br-xs'
                          : msg.confidence === 'low'
                          ? 'bg-amber-50 text-amber-950 border border-amber-300 rounded-bl-xs'
                          : 'bg-white text-gray-900 border border-gray-200 shadow-2xs rounded-bl-xs'
                      }`}
                    >
                      {/* Tool Used Badge */}
                      {msg.usedTool && (
                        <div className="mb-1.5 flex items-center gap-1 text-[10px] font-mono-code text-[#1B4B8F] bg-[#EEF3FA] px-2 py-0.5 rounded w-fit font-semibold border border-[#1B4B8F]/20">
                          <FileText className="w-3 h-3" />
                          Verified via getApplicationStatus()
                        </div>
                      )}

                      {/* Low Confidence Warning */}
                      {msg.confidence === 'low' && (
                        <div className="mb-1.5 flex items-center gap-1 text-[10px] text-amber-800 font-semibold">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          Uncertainty Notice — Please verify with official portal
                        </div>
                      )}

                      <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>

                      {/* Grounded Sources */}
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-gray-100 space-y-1">
                          <div className="text-[9px] uppercase font-mono-code font-bold text-gray-500">
                            Grounded Sources:
                          </div>
                          {msg.sources.map((s, idx) => (
                            <div
                              key={idx}
                              className="text-[10px] bg-[#FAF9F5] p-1.5 rounded border border-gray-200/80 text-gray-700"
                            >
                              <span className="font-semibold text-[#1B4B8F]">{s.title}:</span> {s.excerpt}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Honest TTS Fallback Notice */}
                      {hasFallbackNotice && (
                        <div className="mt-2 p-1.5 bg-amber-50 border border-amber-200 rounded text-[10px] text-amber-900 flex items-center gap-1">
                          <Info className="w-3 h-3 text-amber-700 shrink-0" />
                          <span>Voice not available for {msgLangName} on this device — reading in English instead.</span>
                        </div>
                      )}

                      {/* Mandatory Disclaimer Badge & TTS Button */}
                      {msg.sender === 'bot' && (
                        <div className="mt-2 pt-1.5 flex items-center justify-between text-[9px] text-gray-400 border-t border-gray-100">
                          <span>AI-generated, verify with official sources</span>
                          <button
                            type="button"
                            onClick={() => speakText(msg.id, msg.text, msg.language)}
                            className={`flex items-center gap-1 font-semibold cursor-pointer transition-colors ${
                              isThisSpeaking
                                ? 'text-red-600 animate-pulse'
                                : 'text-[#1B4B8F] hover:text-[#123362]'
                            }`}
                            aria-label={`Read aloud in ${msgLangName}`}
                          >
                            {isThisSpeaking ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                            <span>{isThisSpeaking ? 'Stop' : 'Listen'}</span>
                          </button>
                        </div>
                      )}
                    </div>
                    <span className="text-[9px] text-gray-400 px-1 mt-0.5">{msg.timestamp}</span>
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex items-center gap-2 text-gray-500 p-2 bg-white rounded-xl border border-gray-200 w-fit">
                  <Bot className="w-4 h-4 text-[#1B4B8F] animate-spin" />
                  <span className="text-xs">Consulting RTI statutory knowledge base...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompt Suggestions */}
            <div className="px-3 py-2 bg-white border-t border-gray-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => handleSendMessage('Where to file rti application')}
                className="shrink-0 text-[10px] bg-[#EEF3FA] text-[#1B4B8F] px-2.5 py-1 rounded-full font-medium hover:bg-[#1B4B8F] hover:text-white transition-colors"
              >
                📍 Where to File
              </button>
              <button
                type="button"
                onClick={() => handleSendMessage('What is the fee for first appeal?')}
                className="shrink-0 text-[10px] bg-[#EEF3FA] text-[#1B4B8F] px-2.5 py-1 rounded-full font-medium hover:bg-[#1B4B8F] hover:text-white transition-colors"
              >
                ⚖️ First Appeal Fee
              </button>
              <button
                type="button"
                onClick={() => handleSendMessage('Check status of DOPTR/R/E/26/00991')}
                className="shrink-0 text-[10px] bg-[#EEF3FA] text-[#1B4B8F] px-2.5 py-1 rounded-full font-medium hover:bg-[#1B4B8F] hover:text-white transition-colors"
              >
                🔍 Demo Status
              </button>
            </div>

            {/* Live Voice Transcript Box (Correctable before submission) */}
            {isListening && (
              <div className="p-2.5 bg-red-50 border-t border-red-200 text-xs">
                <div className="flex items-center justify-between text-red-700 font-bold mb-1">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
                    Listening in {currentLangObj.native}...
                  </span>
                  <span className="text-[10px]">Click mic to finish</span>
                </div>
                <div className="p-1.5 bg-white rounded border border-red-200 text-gray-800 italic">
                  {transcriptDraft || 'Speak now into your microphone...'}
                </div>
              </div>
            )}

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-2.5 bg-white border-t border-gray-200 flex items-center gap-1.5"
            >
              {/* Voice Input Button */}
              <button
                type="button"
                onClick={toggleVoiceListening}
                className={`p-2 rounded-xl transition-all ${
                  isListening
                    ? 'bg-red-600 text-white animate-pulse'
                    : 'bg-[#EEF3FA] text-[#1B4B8F] hover:bg-[#1B4B8F] hover:text-white'
                }`}
                title={`Voice input in ${currentLangObj.native}`}
                aria-label="Toggle voice input"
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder={`Ask in ${currentLangObj.native} or enter Reg No...`}
                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1B4B8F]/30"
              />

              <button
                type="submit"
                disabled={!inputQuery.trim() || isLoading}
                className="p-2 bg-[#1B4B8F] text-white rounded-xl hover:bg-[#123362] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </aside>
    </>
  );
};
