import { useState, useRef, useEffect } from "react";
import { Header } from "@/components/Header";
import { useConversations, useCreateConversation, useConversation, useDeleteConversation, useSendMessage } from "@/hooks/use-chat";
import {
  Send, User, Loader2, Plus, MessageSquare, Trash2, Menu, Languages, Crown,
  WandSparkles, MapPinned, Utensils, Camera, ShieldCheck,
  Volume2, VolumeX, Mic, MicOff, Copy, Check, Star, MapPin, Clock, Coins, ExternalLink,
  ArrowDown, PanelLeftClose, PanelLeftOpen, Sun, Moon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { format } from "date-fns";
import { useAppSettings } from "@/hooks/use-app-settings";
import { useTouristSpots } from "@/hooks/use-tourist-spots";
import { useRestaurants } from "@/hooks/use-restaurants";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";

// Clean text for text-to-speech to prevent reading markdown characters
function cleanTextForSpeech(text: string): string {
  return text
    .replace(/\n?\s*_?Note:\s*I am answering from the built-in Mysuru guide because the live AI service is temporarily unavailable\.?_?/gi, "")
    .replace(/\*\*/g, "") // remove bold markers
    .replace(/[-*#]/g, "") // remove bullet/header marks
    .replace(/\s+/g, " ")
    .trim();
}

// Custom Speech wave animation component using Framer Motion
const VoiceWave = () => (
  <div className="flex items-end gap-[2px] h-3 px-1">
    {[0, 1, 2, 3].map((i) => (
      <motion.div
        key={i}
        className="w-[2px] bg-secondary rounded-full"
        animate={{
          height: ["4px", "14px", "4px"]
        }}
        transition={{
          duration: 0.6,
          repeat: Infinity,
          delay: i * 0.15,
          ease: "easeInOut"
        }}
      />
    ))}
  </div>
);

// Markdown inline renderer for bold text
function renderInlineMarkdown(text: string) {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index} className="font-bold text-primary">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

// Markdown block renderer supporting headers, bulleted lists, and numbered lists
function renderMarkdown(content: string) {
  const cleanContent = content
    .replace(/\n?\s*_?Note:\s*I am answering from the built-in Mysuru guide because the live AI service is temporarily unavailable\.?_?/gi, "")
    .trim();
  
  const lines = cleanContent.split('\n');
  const elements: React.ReactNode[] = [];
  
  let currentList: { type: 'ul' | 'ol'; items: string[] } | null = null;
  
  const flushList = (keyPrefix: string) => {
    if (!currentList) return;
    if (currentList.type === 'ul') {
      elements.push(
        <ul key={`ul-${keyPrefix}`} className="space-y-2.5 my-3 list-none pl-1">
          {currentList.items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm md:text-base text-foreground/90 leading-relaxed">
              <Crown className="h-4 w-4 mt-1 flex-shrink-0 text-secondary" />
              <span>{renderInlineMarkdown(item)}</span>
            </li>
          ))}
        </ul>
      );
    } else {
      elements.push(
        <ol key={`ol-${keyPrefix}`} className="space-y-2.5 my-3 list-decimal pl-6 text-sm md:text-base text-foreground/90 leading-relaxed">
          {currentList.items.map((item, idx) => (
            <li key={idx} className="pl-1 marker:text-primary marker:font-bold">
              <span>{renderInlineMarkdown(item)}</span>
            </li>
          ))}
        </ol>
      );
    }
    currentList = null;
  };
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();
    
    if (!trimmedLine) {
      flushList(String(i));
      continue;
    }
    
    // Check for headers
    const headerMatch = trimmedLine.match(/^(#{1,6})\s+(.*)$/);
    if (headerMatch) {
      flushList(String(i));
      const level = headerMatch[1].length;
      const text = headerMatch[2];
      const headerClasses = cn(
        "font-serif font-bold text-primary my-4",
        level === 1 && "text-xl md:text-2xl border-b border-secondary/20 pb-1",
        level === 2 && "text-lg md:text-xl",
        level >= 3 && "text-base md:text-lg"
      );
      const Tag = `h${level}` as keyof JSX.IntrinsicElements;
      elements.push(<Tag key={i} className={headerClasses}>{renderInlineMarkdown(text)}</Tag>);
      continue;
    }
    
    // Check for bullet list item
    const bulletMatch = trimmedLine.match(/^[-*]\s+(.*)$/);
    if (bulletMatch) {
      if (currentList && currentList.type !== 'ul') {
        flushList(String(i));
      }
      if (!currentList) {
        currentList = { type: 'ul', items: [] };
      }
      currentList.items.push(bulletMatch[1]);
      continue;
    }
    
    // Check for numbered list item
    const numberedMatch = trimmedLine.match(/^(\d+)\.\s+(.*)$/);
    if (numberedMatch) {
      if (currentList && currentList.type !== 'ol') {
        flushList(String(i));
      }
      if (!currentList) {
        currentList = { type: 'ol', items: [] };
      }
      currentList.items.push(numberedMatch[2]);
      continue;
    }
    
    // Otherwise, regular line
    flushList(String(i));
    elements.push(
      <p key={i} className="mb-3 text-sm md:text-base leading-relaxed text-foreground/90">
        {renderInlineMarkdown(trimmedLine)}
      </p>
    );
  }
  
  flushList(String(lines.length));
  
  return elements;
}

// Function to scan message content and find tourist spots or restaurants in database
function findMentionedItems(content: string, spots: any[] = [], restaurants: any[] = []) {
  if (!content) return [];
  const mentions: any[] = [];
  const contentLower = content.toLowerCase();

  // Match spots
  spots.forEach(spot => {
    if (!spot || !spot.name) return;
    const nameLower = spot.name.toLowerCase();
    let isMatch = false;

    if (contentLower.includes(nameLower)) {
      isMatch = true;
    } else {
      const cleanName = spot.name.replace(/\(.*?\)/g, "").trim().toLowerCase();
      if (cleanName && cleanName.length > 3 && contentLower.includes(cleanName)) {
        isMatch = true;
      } else if (nameLower.includes("palace") && (contentLower.includes("mysore palace") || contentLower.includes("mysuru palace") || contentLower.includes("amba vilas"))) {
        isMatch = true;
      } else if (nameLower.includes("chamundi") && (contentLower.includes("chamundi hill") || contentLower.includes("chamundi temple"))) {
        isMatch = true;
      } else if (nameLower.includes("devaraja") && contentLower.includes("devaraja market")) {
        isMatch = true;
      }
    }

    if (isMatch) {
      if (!mentions.some(m => m.type === 'spot' && m.id === spot.id)) {
        mentions.push({ ...spot, type: 'spot' });
      }
    }
  });

  // Match restaurants
  restaurants.forEach(rest => {
    if (!rest || !rest.name) return;
    const nameLower = rest.name.toLowerCase();
    let isMatch = false;

    if (contentLower.includes(nameLower)) {
      isMatch = true;
    } else {
      const cleanName = rest.name.replace(/\(.*?\)/g, "").trim().toLowerCase();
      if (cleanName && cleanName.length > 3 && contentLower.includes(cleanName)) {
        isMatch = true;
      } else if (nameLower.includes("mylari") && contentLower.includes("mylari")) {
        isMatch = true;
      } else if (nameLower.includes("guru sweet") && (contentLower.includes("guru sweet") || contentLower.includes("mysore pak"))) {
        isMatch = true;
      }
    }

    if (isMatch) {
      if (!mentions.some(m => m.type === 'restaurant' && m.id === rest.id)) {
        mentions.push({ ...rest, type: 'restaurant' });
      }
    }
  });

  return mentions;
}

function ChatMessage({
  messageId,
  role,
  content,
  assistantTitle,
  speakingMsgId,
  onSpeak,
  copiedId,
  onCopy,
  spots,
  restaurants,
  onOpenDetail
}: {
  messageId: number;
  role: "user" | "assistant";
  content: string;
  assistantTitle?: string;
  speakingMsgId: number | null;
  onSpeak: (id: number, text: string) => void;
  copiedId: number | null;
  onCopy: (id: number, text: string) => void;
  spots: any[];
  restaurants: any[];
  onOpenDetail: (item: any) => void;
}) {
  const { theme } = useAppSettings();
  const isUser = role === "user";
  // Only evaluate mentioned items when message is finalized to prevent mid-stream layout shift
  const mentionedItems = !isUser && messageId !== -1 ? findMentionedItems(content, spots, restaurants) : [];

  return (
    <div className="w-full mb-6 text-left">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className={cn(
          "flex w-full",
          isUser ? "justify-end" : "justify-start"
        )}
      >
        {isUser ? (
          /* User Message Bubble - Stitch Light Maroon or Dark Royal Burgundy */
          <div className="flex gap-3 max-w-[85%] md:max-w-[72%] flex-row-reverse">
            <div className={cn(
              "flex h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0 items-center justify-center rounded-xl border shadow-sm",
              theme === "dark"
                ? "bg-gradient-to-br from-maroon to-maroon-deep text-gold-light border-gold/40 shadow-maroon/30"
                : "bg-maroon text-white border-maroon-dark shadow-xs"
            )}>
              <User className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>

            <div className={cn(
              "relative overflow-hidden rounded-2xl rounded-tr-sm p-3.5 sm:p-5 text-sm sm:text-[15px] leading-relaxed shadow-sm",
              theme === "dark"
                ? "bg-gradient-to-r from-maroon-dark to-maroon text-amber-50 border border-gold/30 shadow-md shadow-maroon/40"
                : "bg-maroon text-white shadow-xs"
            )}>
              <div className="text-left font-medium">
                {renderInlineMarkdown(content)}
              </div>
              <div className={cn(
                "mt-2 flex items-center justify-between border-t pt-1.5 text-[10px]",
                theme === "dark" ? "border-gold/20 text-gold-light/70" : "border-white/20 text-white/70"
              )}>
                <span className="font-bold uppercase tracking-wider">You</span>
                <button
                  onClick={() => onCopy(messageId, content)}
                  className="hover:opacity-100 opacity-80 transition-opacity p-0.5 rounded"
                  title="Copy message"
                >
                  {copiedId === messageId ? <Check className="h-3 w-3 text-emerald-300" /> : <Copy className="h-3 w-3" />}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Assistant Concierge Message Card - Stitch Design 1 Light Parchment or Design 3 Dusk Velvet */
          <div className="w-full max-w-[98%] sm:max-w-[95%] lg:max-w-[92%]">
            <article className={cn(
              "rounded-2xl border p-4 sm:p-6 transition-all duration-300 relative",
              theme === "dark"
                ? "bg-gradient-to-b from-[#21141C] to-[#180A12] border-gold/25 shadow-md text-[#F7F3E9]"
                : "bg-gradient-to-b from-[#FFFDF9] to-[#FAF6EE] border-[#EBE2D3] shadow-xs text-slate-800"
            )}>
              {/* Concierge Card Header */}
              <div className={cn(
                "flex items-start justify-between pb-3 sm:pb-4 border-b",
                theme === "dark" ? "border-gold/20" : "border-gold/15"
              )}>
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className={cn(
                    "h-9 w-9 rounded-lg flex items-center justify-center shrink-0 border",
                    theme === "dark"
                      ? "bg-gradient-to-br from-maroon to-maroon-deep text-gold-light border-gold/50 shadow-[0_0_12px_rgba(243,194,70,0.2)]"
                      : "bg-maroon text-gold-light border-gold/30 shadow-xs"
                  )}>
                    <Crown className="w-5 h-5 text-gold-light" />
                  </div>
                  <div>
                    <span className={cn(
                      "text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase",
                      theme === "dark" ? "text-gold" : "text-maroon"
                    )}>
                      Concierge
                    </span>
                    <p className={cn(
                      "text-[10px] sm:text-xs",
                      theme === "dark" ? "text-amber-100/70" : "text-slate-500"
                    )}>
                      Royal Heritage AI • Wadiyar Dynasty &amp; Cultural Guide
                    </p>
                  </div>
                </div>

                {/* Message Interaction Buttons */}
                <div className={cn(
                  "flex items-center space-x-1",
                  theme === "dark" ? "text-gold/70" : "text-slate-400"
                )}>
                  {/* TTS Button */}
                  {messageId !== -1 && (
                    <button
                      onClick={() => onSpeak(messageId, content)}
                      className={cn(
                        "p-1.5 rounded-lg transition-colors",
                        theme === "dark"
                          ? "hover:text-gold-light hover:bg-gold/15"
                          : "hover:text-maroon hover:bg-gold/10"
                      )}
                      title={speakingMsgId === messageId ? "Stop speaking" : "Listen Audio"}
                    >
                      {speakingMsgId === messageId ? (
                        <div className="flex items-center gap-1">
                          <VoiceWave />
                          <VolumeX className="h-4 w-4 animate-pulse text-gold" />
                        </div>
                      ) : (
                        <Volume2 className="h-4 w-4" />
                      )}
                    </button>
                  )}
                  {/* Copy Button */}
                  <button
                    onClick={() => onCopy(messageId, content)}
                    className={cn(
                      "p-1.5 rounded-lg transition-colors",
                      theme === "dark"
                        ? "hover:text-gold-light hover:bg-gold/15"
                        : "hover:text-maroon hover:bg-gold/10"
                    )}
                    title="Copy message"
                  >
                    {copiedId === messageId ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Dialogue Text Body */}
              <div className={cn(
                "mt-4 text-sm sm:text-[15px] leading-relaxed text-left",
                theme === "dark" ? "text-[#F7F3E9]" : "text-slate-700"
              )}>
                {renderMarkdown(content)}
                {messageId === -1 && <span className="typing-cursor" />}
              </div>
            </article>

            {/* Places Referenced Section (Stitch Design 1 & 3 Horizontal Carousel) */}
            {mentionedItems.length > 0 && (
              <div className="space-y-3 pt-3 w-full">
                <div className="flex items-center justify-between px-1">
                  <div className={cn(
                    "flex items-center space-x-2 font-bold text-xs uppercase tracking-wider",
                    theme === "dark" ? "text-gold" : "text-maroon"
                  )}>
                    <MapPin className={cn("w-4 h-4", theme === "dark" ? "text-gold-light" : "text-gold-muted")} />
                    <span>Places Referenced in this Response ({mentionedItems.length})</span>
                  </div>
                  <span className={cn(
                    "text-[11px] hidden sm:inline",
                    theme === "dark" ? "text-amber-200/60" : "text-slate-500"
                  )}>
                    Scroll horizontally to view all
                  </span>
                </div>

                {/* Horizontal Cards Carousel */}
                <div className="flex space-x-4 overflow-x-auto pb-4 pt-1 snap-x scroll-smooth scrollbar-thin">
                  {mentionedItems.map((item) => {
                    const isSpot = item.type === "spot";
                    return (
                      <div
                        key={`${item.type}-${item.id}`}
                        onClick={() => onOpenDetail(item)}
                        className={cn(
                          "min-w-[260px] max-w-[260px] sm:min-w-[270px] sm:max-w-[270px] rounded-2xl overflow-hidden snap-start flex flex-col cursor-pointer transition-all duration-300",
                          theme === "dark"
                            ? "bg-dusk-850 border border-gold/30 shadow-md hover:shadow-card-lift hover:border-gold group"
                            : "bg-white border border-[#E6DECE] shadow-xs hover:shadow-card-lift group"
                        )}
                      >
                        {/* Image Thumbnail */}
                        <div className={cn(
                          "relative h-36 overflow-hidden",
                          theme === "dark" ? "bg-dusk-950 border-b border-gold/20" : "bg-slate-100"
                        )}>
                          <ImageWithFallback
                            src={item.imageUrl || undefined}
                            alt={item.name}
                            className={cn(
                              "w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500",
                              theme === "dark" ? "filter brightness-105" : ""
                            )}
                            fallbackType={isSpot ? "spot" : "dining"}
                          />
                          <span className={cn(
                            "absolute top-2.5 left-2.5 backdrop-blur-xs text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1 border shadow-xs",
                            isSpot
                              ? (theme === "dark"
                                  ? "bg-maroon-dark/90 text-gold-light border-gold/40"
                                  : "bg-maroon/90 text-white border-white/20")
                              : (theme === "dark"
                                  ? "bg-amber-900/90 text-gold-light border-gold/40"
                                  : "bg-amber-700/90 text-white border-white/20")
                          )}>
                            <span className={cn("h-1.5 w-1.5 rounded-full", isSpot ? "bg-amber-400" : "bg-emerald-400")}></span>
                            {isSpot ? "Spot" : "Culinary"}
                          </span>
                        </div>

                        {/* Card Body */}
                        <div className="p-3.5 flex-1 flex flex-col justify-between text-left">
                          <div>
                            <h3 className={cn(
                              "font-serif font-bold text-sm leading-snug line-clamp-1 transition-colors",
                              theme === "dark" ? "text-white group-hover:text-gold-light" : "text-slate-900"
                            )}>
                              {item.name}
                            </h3>
                            <p className={cn(
                              "text-xs mt-1 line-clamp-2",
                              theme === "dark" ? "text-slate-300" : "text-slate-500"
                            )}>
                              {isSpot ? item.location : `${item.cuisine} • ${item.priceRange}`}
                            </p>
                          </div>

                          <div className={cn(
                            "mt-3.5 pt-2.5 border-t flex items-center justify-between text-xs",
                            theme === "dark" ? "border-gold/15" : "border-slate-100"
                          )}>
                            <span className={cn(
                              "font-medium truncate max-w-[150px]",
                              theme === "dark" ? "text-gold-light/90" : "text-slate-600"
                            )}>
                              {isSpot ? (item.ticketPrice || "Free Entry") : (item.priceRange || "Authentic Mysuru")}
                            </span>
                            <span className={cn(
                              "font-semibold flex items-center gap-0.5 hover:underline",
                              theme === "dark" ? "text-gold" : "text-maroon"
                            )}>
                              Details →
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}

function TypingIndicator({ label }: { label: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 flex items-center gap-3"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-secondary/20 bg-secondary text-secondary-foreground shadow-lg ring-4 ring-secondary/10">
        <Crown className="h-5 w-5" />
      </div>
      <div className="rounded-2xl rounded-tl-sm border border-secondary/25 bg-white/95 px-4 py-3 shadow-md dark:bg-card">
        <div className="flex items-center gap-2 text-sm font-medium text-primary">
          <span>{label}</span>
          <span className="flex gap-1">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-secondary [animation-delay:-0.2s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-secondary [animation-delay:-0.1s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-secondary" />
          </span>
        </div>
      </div>
    </motion.div>
  );
}

type ChatLanguage = "Auto" | "English" | "Kannada" | "Hindi";

const LANGUAGES: ChatLanguage[] = ["Auto", "English", "Kannada", "Hindi"];
const LANGUAGE_DISPLAY: Record<ChatLanguage, string> = {
  Auto: "Auto",
  English: "English",
  Kannada: "ಕನ್ನಡ",
  Hindi: "हिन्दी",
};
const SAFE_LANGUAGE_DISPLAY: Record<ChatLanguage, string> = {
  Auto: "Auto",
  English: "English",
  Kannada: "\u0c95\u0ca8\u0ccd\u0ca8\u0ca1",
  Hindi: "\u0939\u093f\u0928\u094d\u0926\u0940",
};

const LANGUAGE_COPY: Record<Exclude<ChatLanguage, "Auto">, {
  assistantTitle: string;
  typing: string;
  replyLabel: string;
  headline: string;
  intro: string;
  welcomeTitle: string;
  welcomeBody: string;
  placeholderNew: string;
  placeholderContinue: string;
  suggestions: string[];
  actions: Array<{ label: string; prompt: string; icon: typeof Crown }>;
}> = {
  English: {
    assistantTitle: "Royal Mysuru Concierge",
    typing: "Preparing your royal reply",
    replyLabel: "Reply in",
    headline: "Your royal Mysuru journey awaits",
    intro: "Ask for palace routes, food trails, photo moments, timings, safety, or a day plan shaped around you.",
    welcomeTitle: "Welcome, honored guest.",
    welcomeBody: "Tell me your mood, time, budget, or group size and I will shape Mysuru like a private royal itinerary in English.",
    placeholderNew: "Tell me your dream Mysuru experience in English...",
    placeholderContinue: "Continue your royal Mysuru plan in English...",
    suggestions: ["Plan a one-day heritage itinerary", "Best places for Mysore Pak", "How do I visit Chamundi Hill?"],
    actions: [
      { label: "Royal day plan", prompt: "Plan a royal one-day Mysuru itinerary with timings, food stops, and a grand evening finish.", icon: Crown },
      { label: "Palace route", prompt: "Create a palace and heritage route for Mysuru with travel order and best photo times.", icon: MapPinned },
      { label: "Mysuru feast", prompt: "Suggest a memorable Mysuru food trail with breakfast, snacks, dinner, and sweets.", icon: Utensils },
      { label: "Photo moments", prompt: "Give me the most royal photo spots in Mysuru and when to visit each one.", icon: Camera },
      { label: "Safe travel", prompt: "Help me travel safely in Mysuru with local transport tips and emergency contacts.", icon: ShieldCheck },
    ],
  },
  Kannada: {
    assistantTitle: "ರಾಜಮರ್ಯಾದೆಯ ಮೈಸೂರು ಮಾರ್ಗದರ್ಶಿ",
    typing: "ನಿಮ್ಮ ರಾಜಮರ್ಯಾದೆಯ ಉತ್ತರ ಸಿದ್ಧವಾಗುತ್ತಿದೆ",
    replyLabel: "ಉತ್ತರ ಭಾಷೆ",
    headline: "ನಿಮ್ಮ ರಾಜಮರ್ಯಾದೆಯ ಮೈಸೂರು ಪ್ರಯಾಣ ಸಿದ್ಧವಾಗಿದೆ",
    intro: "ಅರಮನೆ ಮಾರ್ಗಗಳು, ಆಹಾರ ಪ್ರಯಾಣ, ಫೋಟೋ ತಾಣಗಳು, ಸಮಯ, ಸುರಕ್ಷತೆ ಅಥವಾ ದಿನದ ಯೋಜನೆ ಕೇಳಿ.",
    welcomeTitle: "ಸ್ವಾಗತ, ಗೌರವಾನ್ವಿತ ಅತಿಥಿಯೇ.",
    welcomeBody: "ನಿಮ್ಮ ಮನೋಭಾವ, ಸಮಯ, ಬಜೆಟ್ ಅಥವಾ ಗುಂಪಿನ ಗಾತ್ರ ಹೇಳಿ; ನಾನು ಮೈಸೂರನ್ನು ಖಾಸಗಿ ರಾಜಮರ್ಯಾದೆಯ ಯೋಜನೆಯಂತೆ ರೂಪಿಸುತ್ತೇನೆ.",
    placeholderNew: "ನಿಮ್ಮ ಕನಸಿನ ಮೈಸೂರು ಅನುಭವವನ್ನು ಕನ್ನಡದಲ್ಲಿ ಹೇಳಿ...",
    placeholderContinue: "ನಿಮ್ಮ ರಾಜಮರ್ಯಾದೆಯ ಮೈಸೂರು ಯೋಜನೆಯನ್ನು ಕನ್ನಡದಲ್ಲಿ ಮುಂದುವರಿಸಿ...",
    suggestions: ["ಒಂದು ದಿನದ ಪಾರಂಪರಿಕ ಯೋಜನೆ ಮಾಡಿ", "ಮೈಸೂರು ಪಾಕ್ ಗೆ ಉತ್ತಮ ಸ್ಥಳಗಳು", "ಚಾಮುಂಡಿ ಬೆಟ್ಟಕ್ಕೆ ಹೇಗೆ ಹೋಗಲಿ?"],
    actions: [
      { label: "ರಾಜ ದಿನಯೋಜನೆ", prompt: "ಸಮಯ, ಆಹಾರ ನಿಲ್ದಾಣಗಳು ಮತ್ತು ಅದ್ಭುತ ಸಂಜೆ ಅಂತ್ಯದೊಂದಿಗೆ ಮೈಸೂರಿಗೆ ರಾಜಮರ್ಯಾದೆಯ ಒಂದು ದಿನದ ಯೋಜನೆ ಮಾಡಿ.", icon: Crown },
      { label: "ಅರಮನೆ ಮಾರ್ಗ", prompt: "ಮೈಸೂರಿನ ಅರಮನೆ ಮತ್ತು ಪಾರಂಪರಿಕ ಮಾರ್ಗವನ್ನು ಸರಿಯಾದ ಕ್ರಮ ಮತ್ತು ಉತ್ತಮ ಫೋಟೋ ಸಮಯಗಳೊಂದಿಗೆ ರೂಪಿಸಿ.", icon: MapPinned },
      { label: "ಮೈಸೂರು ರುಚಿ", prompt: "ಉಪಹಾರ, ತಿಂಡಿ, ಭೋಜನ ಮತ್ತು ಸಿಹಿಗಳೊಂದಿಗೆ ನೆನಪಿನಲ್ಲಿರುವ ಮೈಸೂರು ಆಹಾರ ಪ್ರಯಾಣವನ್ನು ಸೂಚಿಸಿ.", icon: Utensils },
      { label: "ಫೋಟೋ ತಾಣಗಳು", prompt: "ಮೈಸೂರಿನ ಅತ್ಯಂತ ರಾಜಮರ್ಯಾದೆಯ ಫೋಟೋ ತಾಣಗಳು ಮತ್ತು ಭೇಟಿ ಸಮಯಗಳನ್ನು ತಿಳಿಸಿ.", icon: Camera },
      { label: "ಸುರಕ್ಷಿತ ಪ್ರಯಾಣ", prompt: "ಸ್ಥಳೀಯ ಸಾರಿಗೆ ಸಲಹೆಗಳು ಮತ್ತು ತುರ್ತು ಸಂಪರ್ಕಗಳೊಂದಿಗೆ ಮೈಸೂರಿನಲ್ಲಿ ಸುರಕ್ಷಿತವಾಗಿ ಪ್ರಯಾಣಿಸಲು ಸಹಾಯ ಮಾಡಿ.", icon: ShieldCheck },
    ],
  },
  Hindi: {
    assistantTitle: "शाही मैसूर मार्गदर्शक",
    typing: "आपका शाही उत्तर तैयार हो रहा है",
    replyLabel: "उत्तर भाषा",
    headline: "आपकी शाही मैसूर यात्रा तैयार है",
    intro: "महल मार्ग, फूड ट्रेल, फोटो स्पॉट, समय, सुरक्षा या आपके अनुसार दिन की योजना पूछें.",
    welcomeTitle: "स्वागत है, आदरणीय अतिथि.",
    welcomeBody: "अपना मूड, समय, बजट या समूह का आकार बताइए; मैं मैसूर को निजी शाही यात्रा की तरह सजाऊंगा.",
    placeholderNew: "अपना सपना मैसूर अनुभव हिंदी में बताइए...",
    placeholderContinue: "अपनी शाही मैसूर योजना हिंदी में जारी रखें...",
    suggestions: ["एक दिन की विरासत यात्रा बनाइए", "मैसूर पाक के लिए अच्छी जगहें", "चामुंडी हिल कैसे जाएं?"],
    actions: [
      { label: "शाही दिन योजना", prompt: "समय, खाने के पड़ाव और शानदार शाम के अंत के साथ मैसूर की शाही एक-दिवसीय यात्रा बनाइए.", icon: Crown },
      { label: "महल मार्ग", prompt: "मैसूर का महल और विरासत मार्ग सही क्रम और अच्छे फोटो समयों के साथ बनाइए.", icon: MapPinned },
      { label: "मैसूर स्वाद", prompt: "नाश्ता, स्नैक्स, डिनर और मिठाइयों के साथ यादगार मैसूर फूड ट्रेल सुझाइए.", icon: Utensils },
      { label: "फोटो स्पॉट", prompt: "मैसूर के सबसे शाही फोटो स्पॉट और हर जगह जाने का सही समय बताइए.", icon: Camera },
      { label: "सुरक्षित यात्रा", prompt: "स्थानीय परिवहन सलाह और आपातकालीन संपर्कों के साथ मैसूर में सुरक्षित यात्रा में मदद कीजिए.", icon: ShieldCheck },
    ],
  },
};
const MYSURU_FEATURES = [
  {
    title: "Amba Vilas Palace Trail",
    subtitle: "Kalyana Mantapa, Golden Ambari & Durbar Halls",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC_6NlF4BNf8751LcdGgNxa0yk-meoYWsmYcWwYrlFL48CnQ1oFRwmxh4wyqib7iEIdUCKYvweLPQxCEF3hNx1kc5yoJqRjjD-7y22Mr8snT98s7KehhOUXIuZJpxbqmWA4knwISFmr7WwR4QHsY96fzNyv8CZLt5hKT-N-V4ltaD5s52my73UOOETrmbppbwv2mszEQHpLAjIe8XGBiARwxOZJzcf04yjuTBE0Gex2xSPuqfviOoxB",
  },
  {
    title: "Sacred Chamundi Ascent",
    subtitle: "1,008 Granite steps & Monolithic Nandi",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDCjgr0OM9UmSY40Phi1_oAzA2zcmL7yZevzvwUrShgWA5T6FHp44vg908o_T_jBANaCnWdSIpnsVn44xbkA6r-xbN0gA1beczd8U42aszBscRamjThR0LGworF1jI7ptswaet7x1lEELUlQLTFi13fSOXO0bgplCvNQa9ibAOrGb2wxYQFwxzCoX9DZferVW8ccBvXMxXh5MSdqvQUdoAU-MQIYucl5U6VdkcOduBTngygWNldyTpL",
  },
  {
    title: "Sandalwood & Silk Artisans",
    subtitle: "Govt Sandalwood Oil & KSIC Pure Zari Silk",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBn5ROWtX9TA6DYxmqDmSegAX7_DgA79oTY3PpTwYmS-dVOhwKMhNx7V5oF3a4lNzN-a4DIK2abLAP00vkbnWRrH1iRRDPLUq7erW_2ToVhKmD-3QHurWIhHQRRLqPTBiUPWXoQFGGf4aZWOaQp-8RPJNsWa-5CA5fWJcGBQZHLlkAs1duM90ESkeEU1BAZKMzHsXi3TePDLCqLwKt-5RlDQGUlBRljTYqUeqLKokogwTItE4U2shAa",
  },
];

const STITCH_PROMPTS = [
  { emoji: "👑", label: "Royal day plan", prompt: "Plan a one-day royal heritage tour of Mysuru" },
  { emoji: "🏛️", label: "Palace route", prompt: "Tell me about Mysore Palace and illumination timings" },
  { emoji: "🍛", label: "Mysuru feast", prompt: "Which restaurants are recommended for authentic Mysuru food?" },
  { emoji: "📷", label: "Photo moments", prompt: "Where are the best photography spots in Mysuru?" },
  { emoji: "🛡️", label: "Safe travel", prompt: "What are the emergency numbers and safety guidelines in Mysuru?" },
];

export default function Chat() {
  const { theme, setTheme } = useAppSettings();
  const [activeId, setActiveId] = useState<number | null>(null);
  const [inputText, setInputText] = useState("");
  const [streamingText, setStreamingText] = useState("");
  const [language, setLanguage] = useState<ChatLanguage>("Auto");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [greetingIndex, setGreetingIndex] = useState(0);
  
  // Custom states for speech, details modal and copy feedback
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [speakingMsgId, setSpeakingMsgId] = useState<number | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  // Fetch spots and restaurants for database matching
  const { data: spots = [] } = useTouristSpots();
  const { data: restaurants = [] } = useRestaurants();

  const ROYAL_GREETINGS = ["\u0ca8\u0cae\u0cb8\u0ccd\u0c95\u0cbe\u0cb0", "Hello", "\u0928\u092e\u0938\u094d\u0924\u0947"];

  useEffect(() => {
    const interval = setInterval(() => {
      setGreetingIndex((prev) => (prev + 1) % ROYAL_GREETINGS.length);
    }, 3000); // Change every 3 seconds
    return () => clearInterval(interval);
  }, []);

  const { data: conversations, isLoading: isLoadingConvs } = useConversations();
  const { mutateAsync: createConv } = useCreateConversation();
  const { mutateAsync: deleteConv } = useDeleteConversation();
  const { data: conversationData, isLoading: isLoadingConv } = useConversation(activeId || 0);
  const { mutateAsync: sendMessage, isPending: isSending } = useSendMessage();
  const hasMessages = (conversationData?.messages?.length ?? 0) > 0 || Boolean(streamingText);
  const copy = {
    ...LANGUAGE_COPY.English,
    welcomeBody: language === "Auto"
      ? "Type in English, Kannada, or Hindi and I will answer in the same language. You can still choose a specific reply language below."
      : `I will reply in ${SAFE_LANGUAGE_DISPLAY[language]} while keeping the guidance polished, royal, and useful.`,
    placeholderNew: language === "Auto"
      ? "Ask in English, Kannada, or Hindi..."
      : `Ask your Mysuru question for a ${SAFE_LANGUAGE_DISPLAY[language]} reply...`,
    placeholderContinue: language === "Auto"
      ? "Continue in English, Kannada, or Hindi..."
      : `Continue with a ${SAFE_LANGUAGE_DISPLAY[language]} reply...`,
  };

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          setIsListening(false);
        };

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            setInputText(prev => {
              const trimmed = prev.trim();
              return trimmed ? `${trimmed} ${transcript}` : transcript;
            });
          }
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  // Update speech recognition language when selected language changes
  useEffect(() => {
    if (recognitionRef.current) {
      if (language === "Kannada") {
        recognitionRef.current.lang = "kn-IN";
      } else if (language === "Hindi") {
        recognitionRef.current.lang = "hi-IN";
      } else {
        recognitionRef.current.lang = "en-IN";
      }
    }
  }, [language]);

  // Clean speech when unmounting
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Please use Chrome or Safari.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      if (language === "Kannada") {
        recognitionRef.current.lang = "kn-IN";
      } else if (language === "Hindi") {
        recognitionRef.current.lang = "hi-IN";
      } else {
        recognitionRef.current.lang = "en-IN";
      }
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error("Failed to start speech recognition:", err);
      }
    }
  };

  const handleSpeak = (id: number, text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      alert("Text-to-speech is not supported in this browser.");
      return;
    }

    if (speakingMsgId === id) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();

    const cleanText = cleanTextForSpeech(text);
    const utterance = new SpeechSynthesisUtterance(cleanText);

    let langCode = "en-IN";
    if (language === "Kannada") {
      langCode = "kn-IN";
    } else if (language === "Hindi") {
      langCode = "hi-IN";
    } else {
      const hasKannada = /[\u0c80-\u0cff]/.test(text);
      const hasHindi = /[\u0900-\u097f]/.test(text);
      if (hasKannada) langCode = "kn-IN";
      else if (hasHindi) langCode = "hi-IN";
    }

    utterance.lang = langCode;

    const voices = window.speechSynthesis.getVoices();
    const matchingVoice = voices.find(voice => voice.lang.startsWith(langCode.split("-")[0]));
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onend = () => {
      setSpeakingMsgId(null);
    };

    utterance.onerror = (e) => {
      console.error("Utterance error:", e);
      setSpeakingMsgId(null);
    };

    setSpeakingMsgId(id);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopy = (id: number, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }).catch(err => {
      console.error("Failed to copy text:", err);
    });
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [inputText]);

  // Initialize or select conversation
  useEffect(() => {
    if (conversations && conversations.length > 0 && !activeId) {
      if (!activeId) {
        setActiveId(conversations[0].id);
      }
    } else if (conversations && conversations.length === 0 && !activeId) {
      createConv("New Chat").then(c => setActiveId(c.id));
    }
  }, [conversations, activeId, createConv]);

  // Dedicated scroll container ref & scroll position tracking
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [showJumpButton, setShowJumpButton] = useState(false);

  // Deterministic scroll position detection (locks to bottom unless user scrolls up > 100px)
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
    const atBottom = distanceFromBottom < 100;
    setIsAtBottom(atBottom);
    setShowJumpButton(!atBottom);
  };

  const scrollToBottom = (smooth = true) => {
    if (!scrollContainerRef.current) return;
    if (smooth) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    } else {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
    setIsAtBottom(true);
    setShowJumpButton(false);
  };

  // Only auto-scroll when user is already at the bottom (never yank viewport down when reading above)
  useEffect(() => {
    if (!scrollContainerRef.current) return;
    if (isAtBottom) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [streamingText, conversationData?.messages]);

  // When activeId changes, initialize scroll to bottom
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom(false);
    }, 80);
    return () => clearTimeout(timer);
  }, [activeId]);

  // Desktop Collapsible Sidebar state (persisted across route changes in localStorage)
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const urlParam = new URLSearchParams(window.location.search).get("sidebar");
      if (urlParam === "closed" || urlParam === "false") return false;
      if (urlParam === "open" || urlParam === "true") return true;
      const saved = localStorage.getItem("nammamysuru_sidebar_open");
      if (saved !== null) return saved === "true";
    }
    return false; // Default collapsed by default as required by Stitch specification!
  });

  const toggleDesktopSidebar = () => {
    setIsDesktopSidebarOpen((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem("nammamysuru_sidebar_open", String(next));
      }
      return next;
    });
  };

  const handleNewChat = async () => {
    const c = await createConv("New Chat");
    setActiveId(c.id);
    setIsSidebarOpen(false);
  };

  const handleDeleteChat = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this chat?")) {
      await deleteConv(id);
      if (activeId === id) {
        setActiveId(null);
      }
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || !activeId || isSending) return;

    try {
      const textToSend = inputText.trim();
      setInputText("");
      setStreamingText("");

      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }

      // Re-anchor to bottom when user explicitly submits a message
      setIsAtBottom(true);
      setShowJumpButton(false);
      setTimeout(() => scrollToBottom(true), 40);

      await sendMessage({
        id: activeId,
        content: textToSend,
        language: language,
        onStreaming: (chunk) => {
          setStreamingText(prev => prev + chunk);
        }
      });

      setStreamingText("");

    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleUseSuggestion = (prompt: string) => {
    setInputText(prompt);
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 50);
  };

  const SidebarContent = () => (
    <div className={cn(
      "flex flex-col h-full transition-colors duration-300",
      theme === "dark" ? "bg-dusk-900 border-r border-gold/20" : "bg-parchment-100 border-r border-[#E6DECE]"
    )}>
      {/* Sidebar Top Header with New Conversation & Desktop Collapse Button */}
      <div className={cn(
        "p-3.5 border-b flex items-center justify-between gap-2 shrink-0",
        theme === "dark" ? "border-gold/15" : "border-[#E8DFC9]/70"
      )}>
        <button
          onClick={handleNewChat}
          className={cn(
            "flex-1 py-2.5 px-4 font-semibold text-sm flex items-center justify-center gap-2 rounded-xl shadow-sm transition-all active:scale-[0.98]",
            theme === "dark"
              ? "bg-gradient-to-r from-maroon via-maroon-dark to-maroon text-gold-light border border-gold/40 hover:border-gold hover:shadow-gold-glow shadow-md"
              : "bg-maroon hover:bg-maroon-dark text-white"
          )}
        >
          <Plus className={cn("w-4 h-4", theme === "dark" ? "text-gold" : "text-white")} />
          <span>New Conversation</span>
        </button>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleDesktopSidebar}
          className={cn(
            "hidden md:flex h-9 w-9 rounded-xl transition-colors shrink-0",
            theme === "dark" ? "text-gold-light/70 hover:text-gold hover:bg-dusk-800" : "text-slate-500 hover:text-maroon hover:bg-parchment-200"
          )}
          title="Collapse sidebar"
        >
          <PanelLeftClose className="w-4 h-4" />
        </Button>
      </div>

      {/* History Items Section */}
      <ScrollArea className="flex-grow px-2.5 py-3">
        <div className="space-y-1.5">
          <div className={cn(
            "px-2 pb-1 text-[11px] font-bold uppercase tracking-wider",
            theme === "dark" ? "text-gold/60" : "text-slate-400"
          )}>
            Recents
          </div>

          {isLoadingConvs ? (
            <div className="text-center text-xs text-muted-foreground py-6 animate-pulse">Loading conversations...</div>
          ) : conversations?.length === 0 ? (
            <div className="text-center text-xs text-muted-foreground py-6">No previous chats. Start a new one!</div>
          ) : conversations?.map((conv) => (
            <div
              key={conv.id}
              onClick={() => { setActiveId(conv.id); setIsSidebarOpen(false); }}
              className={cn(
                "group relative flex items-start gap-2.5 sm:gap-3 p-2.5 rounded-xl transition-all cursor-pointer text-left border",
                activeId === conv.id
                  ? (theme === "dark"
                      ? "bg-dusk-800 border-gold/35 shadow-md text-white"
                      : "bg-white border-[#E0D5C1] shadow-xs text-slate-900")
                  : (theme === "dark"
                      ? "border-transparent text-slate-300 hover:bg-dusk-800/80 hover:text-white"
                      : "border-transparent text-slate-600 hover:bg-white/70 hover:text-slate-900")
              )}
            >
              {/* Vertical Accent Pill for Active Item */}
              <div className={cn(
                "w-1.5 h-6 rounded-full self-center shrink-0 transition-all",
                activeId === conv.id
                  ? (theme === "dark" ? "bg-gold shadow-[0_0_8px_#F3C246]" : "bg-maroon")
                  : "bg-transparent"
              )} />

              <MessageSquare className={cn(
                "w-4 h-4 mt-0.5 shrink-0 transition-colors",
                activeId === conv.id
                  ? (theme === "dark" ? "text-gold" : "text-maroon")
                  : (theme === "dark" ? "text-slate-500 group-hover:text-gold" : "text-slate-400 group-hover:text-slate-600")
              )} />

              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-semibold truncate leading-tight">
                  {conv.title || "New Chat"}
                </h4>
                <p className={cn(
                  "text-[10px] mt-0.5",
                  theme === "dark" ? "text-slate-400" : "text-slate-500"
                )}>
                  {format(new Date(conv.createdAt ?? new Date()), "MMM d, h:mm a")}
                </p>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive flex-shrink-0 ml-1"
                onClick={(e) => handleDeleteChat(e, conv.id)}
                title="Delete chat"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Sidebar Footer — Wadiyar Era Gateway */}
      <div className={cn(
        "p-3 border-t text-[11px] flex items-center justify-between shrink-0",
        theme === "dark"
          ? "border-gold/20 bg-dusk-950 text-slate-400"
          : "border-[#E8DFC9]/70 bg-parchment-200/50 text-slate-500"
      )}>
        <span className="flex items-center gap-1.5 font-medium">
          <span className={cn(
            "h-2 w-2 rounded-full",
            theme === "dark" ? "bg-gold shadow-[0_0_6px_#F3C246]" : "bg-emerald-500"
          )}></span>
          Gateway v2.4 (Wadiyar Era)
        </span>
        <span className={cn("font-bold", theme === "dark" ? "text-gold" : "text-[#C59B27]")}>
          ಕನ್ನಡ
        </span>
      </div>
    </div>
  );

  return (
    <div className="h-screen h-dvh flex flex-col overflow-hidden bg-heritage-pattern">
      <Header />

      <main className="relative flex min-h-0 w-full flex-grow overflow-hidden">
        {/* Desktop Collapsible Sidebar (ChatGPT-style collapse with state persistence) */}
        <aside
          className={cn(
            "hidden md:flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out overflow-hidden z-20",
            isDesktopSidebarOpen
              ? "w-72 lg:w-80 opacity-100"
              : "w-0 opacity-0 border-r-0 pointer-events-none"
          )}
        >
          <div className="w-72 lg:w-80 h-full flex flex-col">
            <SidebarContent />
          </div>
        </aside>

        {/* Mobile Slide-Over Drawer Sheet */}
        <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
          <SheetContent side="left" className="w-[85%] max-w-[320px] p-0 border-r border-gold/30">
            <SidebarContent />
          </SheetContent>
        </Sheet>

        {/* Main Conversation Region (Unified Workspace integrating output and composer) */}
        <div className="relative flex flex-col flex-1 min-h-0 w-full overflow-hidden transition-all duration-300 p-2 sm:p-3 md:p-5">

          {/* Top Status Bar Controls Strip */}
          <section className="flex flex-wrap items-center justify-between gap-2.5 mb-2.5 px-1 shrink-0">
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Desktop Toggle Button */}
              <button
                type="button"
                onClick={toggleDesktopSidebar}
                className={cn(
                  "hidden md:flex p-2 rounded-xl transition-colors shadow-xs border items-center justify-center",
                  theme === "dark"
                    ? "bg-dusk-900 hover:bg-dusk-800 border-gold/30 text-gold-light shadow-sm"
                    : "bg-white hover:bg-parchment-200 border-[#DFD6C6] text-slate-600"
                )}
                title={isDesktopSidebarOpen ? "Collapse sidebar" : "Open sidebar"}
                aria-label="Toggle Sidebar"
              >
                {isDesktopSidebarOpen ? (
                  <PanelLeftClose className="w-4 h-4" />
                ) : (
                  <PanelLeftOpen className="w-4 h-4" />
                )}
              </button>

              {/* Mobile Toggle Button */}
              <button
                type="button"
                onClick={() => setIsSidebarOpen(true)}
                className={cn(
                  "md:hidden p-2 rounded-xl transition-colors shadow-xs border flex items-center justify-center",
                  theme === "dark"
                    ? "bg-dusk-900 hover:bg-dusk-800 border-gold/30 text-gold-light"
                    : "bg-white hover:bg-parchment-200 border-[#DFD6C6] text-slate-600"
                )}
                title="Open conversation menu"
                aria-label="Open conversation menu"
              >
                <Menu className="w-4 h-4" />
              </button>

              {/* Online Status Pill */}
              <div className={cn(
                "inline-flex items-center gap-2 px-3 py-1 rounded-full shadow-xs text-xs font-semibold border",
                theme === "dark"
                  ? "bg-dusk-900 border-emerald-500/40 text-emerald-400"
                  : "bg-white/90 border-emerald-200/80 text-emerald-800"
              )}>
                <span className={cn(
                  "h-2 w-2 rounded-full",
                  theme === "dark" ? "bg-emerald-400 animate-pulse shadow-[0_0_8px_#34D399]" : "bg-emerald-500 animate-pulse"
                )}></span>
                <span>NammaMysuru.ai Online</span>
              </div>

              {/* Active Conversation Title */}
              {hasMessages ? (
                <span className={cn(
                  "hidden sm:inline-flex items-center text-xs font-semibold uppercase tracking-widest gap-1.5 truncate max-w-[200px] lg:max-w-xs",
                  theme === "dark" ? "text-gold-light" : "text-maroon"
                )}>
                  <span>•</span>
                  <span className="truncate">{conversationData?.title || "Royal Consultation"}</span>
                </span>
              ) : null}
            </div>

            {/* Right Controls: Quick Theme Toggle & Language Strip */}
            <div className="flex items-center space-x-2">
              {/* Quick 1-Click Theme Toggle Button */}
              <button
                type="button"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all shadow-xs",
                  theme === "dark"
                    ? "bg-dusk-900 border-gold/35 text-gold hover:text-gold-light hover:bg-dusk-800"
                    : "bg-white border-[#DFD6C6] text-slate-600 hover:text-maroon hover:bg-parchment-200"
                )}
                title={theme === "dark" ? "Switch to Light Theme (Design 1)" : "Switch to Royal Evening Dark Theme (Design 3)"}
              >
                {theme === "dark" ? <Sun className="w-3.5 h-3.5 text-gold" /> : <Moon className="w-3.5 h-3.5 text-maroon" />}
                <span className="hidden sm:inline">{theme === "dark" ? "Dark (Design 3)" : "Light (Design 1)"}</span>
              </button>

              {/* Language Selector */}
              <div className={cn(
                "flex items-center space-x-1 border rounded-full p-0.5 sm:p-1 text-xs",
                theme === "dark"
                  ? "bg-dusk-900/90 border-gold/25 shadow-md"
                  : "bg-white/90 border-[#E3D9CC] shadow-xs"
              )}>
                <span className="text-slate-400 pl-2 pr-1 font-serif text-[11px] hidden xs:inline">
                  Reply in:
                </span>
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={cn(
                      "rounded-full px-2 sm:px-2.5 py-0.5 text-[11px] font-bold transition-all duration-200",
                      language === lang
                        ? (theme === "dark"
                            ? "bg-gradient-to-r from-maroon to-maroon-dark text-gold font-medium border border-gold/40 shadow-[0_0_10px_rgba(243,194,70,0.2)]"
                            : "bg-maroon text-white font-medium shadow-xs")
                        : (theme === "dark"
                            ? "text-slate-300 hover:text-gold"
                            : "text-slate-600 hover:text-slate-900")
                    )}
                  >
                    {SAFE_LANGUAGE_DISPLAY[lang]}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* ONE Single Cohesive Master Panel (Upper Chat Stream + Bottom Composer) */}
          <section className={cn(
            "flex-1 rounded-3xl flex flex-col overflow-hidden relative transition-colors duration-300",
            theme === "dark"
              ? "bg-dusk-900/90 backdrop-blur-xl border border-gold/30 shadow-royal-glow"
              : "bg-white/85 backdrop-blur-md border border-[#DFD6C6] shadow-royal"
          )}>

            {/* Main Messages Viewport (Scrolls independently within unified workspace) */}
            <div
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6 scrollbar-thin"
            >
              {/* Empty / Welcome State matching Stitch Design 1 & 3 */}
              {!hasMessages && !streamingText && (
                <div className="w-full max-w-4xl mx-auto py-2 sm:py-4">
                  {/* Royal AI Concierge Welcome Card */}
                  <article className={cn(
                    "rounded-2xl border p-5 sm:p-6 shadow-xs relative text-left mb-6 transition-all",
                    theme === "dark"
                      ? "bg-gradient-to-b from-[#21141C] to-[#180A12] border-gold/25 shadow-md text-[#F7F3E9]"
                      : "bg-gradient-to-b from-[#FFFDF9] to-[#FAF6EE] border-[#EBE2D3] shadow-xs text-slate-800"
                  )}>
                    <div className={cn(
                      "flex items-center gap-3 pb-4 border-b mb-4",
                      theme === "dark" ? "border-gold/20" : "border-gold/15"
                    )}>
                      <div className={cn(
                        "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border",
                        theme === "dark"
                          ? "bg-gradient-to-br from-maroon to-maroon-deep text-gold-light border-gold/50 shadow-[0_0_12px_rgba(243,194,70,0.2)]"
                          : "bg-maroon text-gold-light border-gold/30 shadow-xs"
                      )}>
                        <Crown className="w-5 h-5 text-gold-light" />
                      </div>
                      <div>
                        <span className={cn(
                          "text-[11px] font-bold tracking-[0.2em] uppercase",
                          theme === "dark" ? "text-gold" : "text-maroon"
                        )}>
                          Concierge
                        </span>
                        <p className={cn(
                          "text-xs",
                          theme === "dark" ? "text-amber-100/70" : "text-slate-500"
                        )}>
                          Royal Heritage AI • Wadiyar Dynasty &amp; Cultural Guide
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <p className={cn(
                        "font-serif text-lg md:text-xl font-semibold italic",
                        theme === "dark"
                          ? "text-gold-light drop-shadow-[0_0_10px_rgba(243,194,70,0.3)]"
                          : "text-maroon"
                      )}>
                        Namaskara! Welcome to the royal realm of Mysuru.
                      </p>
                      <p className={cn(
                        "text-sm md:text-[15px] leading-relaxed",
                        theme === "dark" ? "text-amber-50/90" : "text-slate-700"
                      )}>
                        Experience the royal charm of Mysuru. From the opulence of Amba Vilas illuminated against the night sky, to the delicate teakwood ceilings of Tipu Sultan’s Dariya Daulat Bagh and savoring iconic Mylari dosas, I am delighted to assist you with every detail of your journey today.
                      </p>
                    </div>
                  </article>

                  {/* Stitch Suggested Prompt Chips Grid */}
                  <div className="space-y-2 text-center">
                    <div className={cn(
                      "text-xs font-bold uppercase tracking-wider mb-2",
                      theme === "dark" ? "text-gold/70" : "text-maroon/70"
                    )}>
                      Suggested Inquiries
                    </div>
                    <div className="flex flex-wrap justify-center gap-2 sm:gap-2.5">
                      {STITCH_PROMPTS.map((item) => (
                        <button
                          key={item.label}
                          onClick={() => handleUseSuggestion(item.prompt)}
                          className={cn(
                            "whitespace-nowrap px-3.5 py-1.5 rounded-full flex items-center gap-1.5 transition-all text-xs font-medium",
                            theme === "dark"
                              ? "bg-dusk-800 hover:bg-gold/20 border border-gold/30 hover:border-gold text-slate-200 hover:text-gold-light shadow-sm"
                              : "bg-white hover:bg-gold/15 border border-[#DECDB8] text-slate-700 hover:text-maroon shadow-2xs"
                          )}
                        >
                          <span>{item.emoji}</span>
                          <span>{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {isLoadingConv ? (
                <div className="h-full flex items-center justify-center py-20">
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className={cn("w-10 h-10 animate-spin", theme === "dark" ? "text-gold" : "text-maroon")} />
                    <p className={cn("font-serif animate-pulse", theme === "dark" ? "text-gold" : "text-maroon")}>
                      Connecting to NammaMysuru.ai Concierge...
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {conversationData?.messages?.map((msg) => (
                    <ChatMessage
                      key={msg.id}
                      messageId={msg.id}
                      role={msg.role as "user" | "assistant"}
                      content={msg.content}
                      assistantTitle={copy.assistantTitle}
                      speakingMsgId={speakingMsgId}
                      onSpeak={handleSpeak}
                      copiedId={copiedId}
                      onCopy={handleCopy}
                      spots={spots}
                      restaurants={restaurants}
                      onOpenDetail={setSelectedItem}
                    />
                  ))}

                  {/* Streaming Content */}
                  {streamingText && (
                    <ChatMessage
                      messageId={-1}
                      role="assistant"
                      content={streamingText}
                      assistantTitle={copy.assistantTitle}
                      speakingMsgId={speakingMsgId}
                      onSpeak={handleSpeak}
                      copiedId={copiedId}
                      onCopy={handleCopy}
                      spots={spots}
                      restaurants={restaurants}
                      onOpenDetail={setSelectedItem}
                    />
                  )}

                  {isSending && !streamingText && (
                    <TypingIndicator label={copy.typing} />
                  )}

                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Floating Jump to Latest Button (Inside unified workspace) */}
            <AnimatePresence>
              {showJumpButton && (
                <motion.button
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.9 }}
                  onClick={() => scrollToBottom(true)}
                  className={cn(
                    "absolute bottom-28 right-6 z-30 flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold shadow-2xl backdrop-blur-md border transition-all hover:scale-105 active:scale-95",
                    theme === "dark"
                      ? "bg-maroon-dark/95 text-gold-light border-gold/40 shadow-[0_0_15px_rgba(243,194,70,0.3)]"
                      : "bg-maroon/95 text-white border-gold/40 shadow-royal"
                  )}
                >
                  <span>Jump to latest</span>
                  <ArrowDown className="h-3.5 w-3.5 animate-bounce" />
                </motion.button>
              )}
            </AnimatePresence>

            {/* Lower Integrated Composer Area: Suggested Prompt Chips + Roomy Multiline Bar */}
            <footer className={cn(
              "p-3 sm:p-4 md:p-5 shrink-0 border-t transition-colors",
              theme === "dark"
                ? "bg-gradient-to-t from-dusk-950 via-dusk-900 to-dusk-850 border-gold/20"
                : "bg-gradient-to-t from-[#FAF7F2] to-white/90 border-[#E8DFC9]"
            )}>
              {/* Suggested Prompt Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2.5 sm:pb-3 scrollbar-none text-xs font-medium">
                {STITCH_PROMPTS.map((chip) => (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={() => handleUseSuggestion(chip.prompt)}
                    className={cn(
                      "whitespace-nowrap px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full flex items-center gap-1.5 transition-all text-xs shrink-0",
                      theme === "dark"
                        ? "bg-dusk-800 hover:bg-gold/20 border border-gold/30 hover:border-gold text-slate-200 hover:text-gold-light shadow-sm hover:shadow-[0_0_12px_rgba(243,194,70,0.2)]"
                        : "bg-white hover:bg-gold/15 border border-[#DECDB8] text-slate-700 hover:text-maroon shadow-2xs"
                    )}
                  >
                    <span>{chip.emoji}</span>
                    <span>{chip.label}</span>
                  </button>
                ))}
              </div>

              {/* Main Input Form Container */}
              <form
                className="relative flex items-center"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
              >
                <textarea
                  ref={textareaRef}
                  autoComplete="off"
                  rows={1}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder={hasMessages ? copy.placeholderContinue : copy.placeholderNew}
                  className={cn(
                    "w-full resize-none text-sm md:text-base rounded-2xl pl-4 sm:pl-5 pr-28 py-3.5 focus:outline-hidden shadow-inner transition-all min-h-[50px] max-h-[140px] leading-relaxed",
                    theme === "dark"
                      ? "bg-dusk-950 border border-gold/30 text-slate-100 placeholder-amber-200/40 focus:ring-2 focus:ring-gold/30 focus:border-gold"
                      : "bg-[#FAF7F0] border border-[#DDD3C2] text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-maroon/20 focus:border-maroon"
                  )}
                />

                {/* Right-side input actions */}
                <div className="absolute right-2.5 bottom-2.5 flex items-center space-x-1 sm:space-x-1.5">
                  {/* Verified Mysuru Heritage Knowledge Base Badge */}
                  <span
                    className={cn(
                      "hidden sm:inline-flex items-center justify-center p-1.5 rounded-lg transition-colors",
                      theme === "dark" ? "text-emerald-400 hover:bg-emerald-950/40" : "text-emerald-600 hover:bg-emerald-50"
                    )}
                    title="Verified Mysuru Heritage Knowledge Base"
                  >
                    <ShieldCheck className="w-4 h-4" />
                  </span>

                  {/* Voice Input Button */}
                  <button
                    type="button"
                    onClick={toggleListening}
                    className={cn(
                      "p-2 rounded-xl transition-all",
                      isListening
                        ? "bg-red-500 text-white animate-pulse"
                        : theme === "dark"
                          ? "text-slate-400 hover:text-gold hover:bg-gold/15"
                          : "text-slate-500 hover:text-maroon hover:bg-gold/15"
                    )}
                    title={isListening ? "Listening... Click to stop" : "Speak to Mysore AI"}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>

                  {/* Send Button */}
                  <button
                    type="submit"
                    disabled={!inputText.trim() || isSending}
                    className={cn(
                      "p-2.5 rounded-xl transition-all active:scale-95 disabled:opacity-40",
                      theme === "dark"
                        ? "bg-gradient-to-r from-maroon via-maroon-dark to-maroon text-gold hover:text-gold-light hover:border-gold border border-gold/40 shadow-md shadow-maroon/50"
                        : "bg-maroon hover:bg-maroon-dark text-white shadow-sm"
                    )}
                    title="Send message"
                  >
                    {isSending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 rotate-45 transform -translate-y-0.5" />
                    )}
                  </button>
                </div>
              </form>
            </footer>
          </section>
        </div>
      </main>

      {/* Royal Heritage Details Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="max-w-md md:max-w-lg rounded-2xl overflow-hidden border-2 border-secondary/30 p-0 bg-white bg-pattern-mandala/5 dark:bg-card">
          {selectedItem && (
            <>
              <div className="relative h-48 md:h-56 w-full bg-secondary/15">
                <ImageWithFallback
                  src={selectedItem?.imageUrl || undefined}
                  alt={selectedItem?.name}
                  className="h-full w-full object-cover"
                  fallbackType={selectedItem?.type === 'spot' ? 'spot' : 'dining'}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-secondary text-primary font-bold text-[10px] px-2.5 py-0.5 rounded-full shadow-sm">
                      {selectedItem?.type === 'spot' ? 'TOURIST SPOT' : 'RESTAURANT'}
                    </span>
                    {selectedItem?.type === 'restaurant' && (
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "h-3 w-3",
                              i < (selectedItem?.rating || 0)
                                ? "fill-secondary text-secondary"
                                : "text-white/35"
                            )}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  <DialogTitle className="font-serif text-xl md:text-2xl font-bold text-white leading-tight">
                    {selectedItem?.name}
                  </DialogTitle>
                </div>
              </div>

              <DialogDescription className="sr-only">
                Details about {selectedItem?.name}
              </DialogDescription>

              <div className="p-5 md:p-6 space-y-4 max-h-[60vh] overflow-y-auto text-left">
                {selectedItem?.description && (
                  <p className="text-sm md:text-base text-foreground/90 leading-relaxed font-medium">
                    {selectedItem?.description}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-3 text-xs md:text-sm border-t border-secondary/15 pt-4">
                  {selectedItem?.type === 'spot' ? (
                    <>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 mt-0.5 text-secondary flex-shrink-0" />
                        <div>
                          <span className="block font-bold text-primary">Location</span>
                          <span className="text-muted-foreground">{selectedItem?.location || 'Mysuru'}</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Clock className="h-4 w-4 mt-0.5 text-secondary flex-shrink-0" />
                        <div>
                          <span className="block font-bold text-primary">Visiting Hours</span>
                          <span className="text-muted-foreground">{selectedItem?.visitingHours || 'Flexible'}</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 col-span-2">
                        <Coins className="h-4 w-4 mt-0.5 text-secondary flex-shrink-0" />
                        <div>
                          <span className="block font-bold text-primary">Ticket Price</span>
                          <span className="text-muted-foreground">{selectedItem?.ticketPrice || 'Free Entry'}</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 mt-0.5 text-secondary flex-shrink-0" />
                        <div>
                          <span className="block font-bold text-primary">Cuisine</span>
                          <span className="text-muted-foreground">{selectedItem?.cuisine || 'South Indian'}</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Coins className="h-4 w-4 mt-0.5 text-secondary flex-shrink-0" />
                        <div>
                          <span className="block font-bold text-primary">Price Range</span>
                          <span className="text-muted-foreground">{selectedItem?.priceRange || 'Medium'}</span>
                        </div>
                      </div>
                      {selectedItem?.isVegetarian && (
                        <div className="flex items-center gap-1.5 col-span-2 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 px-2.5 py-1.5 rounded-lg border border-emerald-100 dark:border-emerald-900/30 w-fit">
                          <span className="h-2 w-2 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                          <span className="font-bold text-xs uppercase tracking-wider">100% Pure Vegetarian</span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="border-t border-secondary/15 pt-4 flex justify-end">
                  <Button
                    onClick={() => {
                      if (selectedItem?.name) {
                        handleUseSuggestion(`Tell me more about ${selectedItem?.name}`);
                        setSelectedItem(null);
                      }
                    }}
                    className="gap-2 bg-primary hover:bg-primary/90 text-white font-bold"
                  >
                    <WandSparkles className="h-4 w-4 text-secondary" /> Ask Concierge
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
