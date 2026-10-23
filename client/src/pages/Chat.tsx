import { useState, useRef, useEffect } from "react";
import { Header } from "@/components/Header";
import { useConversations, useCreateConversation, useConversation, useDeleteConversation, useSendMessage } from "@/hooks/use-chat";
import {
  Send, User, Loader2, Plus, MessageSquare, Trash2, Menu, Languages, Crown,
  WandSparkles, MapPinned, Utensils, Camera, ShieldCheck,
  Volume2, VolumeX, Mic, MicOff, Copy, Check, Star, MapPin, Clock, Coins, ExternalLink
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
  const isUser = role === "user";
  const mentionedItems = !isUser ? findMentionedItems(content, spots, restaurants) : [];

  return (
    <div className="w-full mb-6 text-left">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "flex w-full",
          isUser ? "justify-end" : "justify-start"
        )}
      >
        <div className={cn(
          "flex max-w-[92%] gap-3 md:max-w-[78%]",
          isUser ? "flex-row-reverse" : "flex-row"
        )}>
          <div className={cn(
            "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 shadow-lg",
            isUser
              ? "bg-primary text-primary-foreground border-primary/20"
              : "bg-secondary text-secondary-foreground border-secondary/20 ring-4 ring-secondary/10"
          )}>
            {isUser ? <User className="h-5 w-5" /> : <Crown className="h-5 w-5" />}
          </div>

          <div className={cn(
            "relative overflow-hidden rounded-2xl p-5 text-sm leading-relaxed shadow-md md:text-base flex flex-col w-full",
            isUser
              ? "bg-primary text-primary-foreground rounded-tr-sm"
              : "bg-white border-2 border-secondary/25 rounded-tl-sm text-foreground bg-pattern-mandala dark:bg-card"
          )}>
            {!isUser && (
              <>
                <div className="absolute right-0 top-0 -mr-8 -mt-8 h-16 w-16 rounded-full bg-secondary/10 blur-2xl" />
                <div className="mb-3 flex items-center gap-2 border-b border-secondary/15 pb-2 text-xs font-bold uppercase tracking-wide text-primary/75">
                  <WandSparkles className="h-3.5 w-3.5 text-secondary" />
                  {assistantTitle ?? LANGUAGE_COPY.English.assistantTitle}
                </div>
              </>
            )}
            
            <div className="flex-grow text-left">
              {isUser ? renderInlineMarkdown(content) : renderMarkdown(content)}
            </div>

            {/* Utility toolbar inside bubble */}
            <div className={cn(
              "mt-3 flex items-center justify-between border-t pt-2 text-xs",
              isUser ? "border-primary-foreground/15 text-primary-foreground/60" : "border-secondary/15 text-muted-foreground/60"
            )}>
              <span className="text-[10px] uppercase font-bold tracking-wider">
                {isUser ? "You" : "Concierge"}
              </span>
              <div className="flex items-center gap-2">
                {/* TTS Button */}
                {!isUser && messageId !== -1 && (
                  <button
                    onClick={() => onSpeak(messageId, content)}
                    className="text-primary/70 hover:text-primary transition-colors p-1 rounded hover:bg-secondary/15 flex items-center gap-1.5"
                    title={speakingMsgId === messageId ? "Stop speaking" : "Speak message"}
                  >
                    {speakingMsgId === messageId ? (
                      <>
                        <VoiceWave />
                        <VolumeX className="h-3.5 w-3.5 text-secondary animate-pulse" />
                      </>
                    ) : (
                      <Volume2 className="h-3.5 w-3.5" />
                    )}
                  </button>
                )}
                {/* Copy Button */}
                <button
                  onClick={() => onCopy(messageId, content)}
                  className={cn(
                    "transition-colors p-1 rounded",
                    isUser
                      ? "text-primary-foreground/70 hover:text-primary-foreground hover:bg-white/10"
                      : "text-primary/70 hover:text-primary hover:bg-secondary/15"
                  )}
                  title="Copy message"
                >
                  {copiedId === messageId ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Render mentioned items carousel outside bubble but aligned */}
      {!isUser && mentionedItems.length > 0 && (
        <div className="mt-3 pl-14 pr-4 w-full">
          <div className="text-[10px] font-extrabold text-primary/75 mb-2 flex items-center gap-1.5 tracking-wider uppercase">
            <MapPinned className="h-3.5 w-3.5 text-secondary animate-bounce" />
            <span>Places referenced in this response</span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-secondary/35 scrollbar-track-transparent snap-x">
            {mentionedItems.map((item) => {
              const isSpot = item.type === 'spot';
              return (
                <div
                  key={`${item.type}-${item.id}`}
                  onClick={() => onOpenDetail(item)}
                  className="w-48 flex-shrink-0 bg-white/80 dark:bg-card/90 border border-secondary/25 hover:border-secondary rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 flex flex-col cursor-pointer snap-start hover:scale-[1.02] group text-left"
                >
                  {/* Thumbnail */}
                  <div className="h-24 w-full relative bg-secondary/15 overflow-hidden">
                    <ImageWithFallback
                      src={item.imageUrl || undefined}
                      alt={item.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      fallbackType={isSpot ? "spot" : "dining"}
                    />
                    {/* Type Badge */}
                    <div className="absolute top-2 left-2 bg-primary/95 backdrop-blur-sm text-[9px] font-bold text-white px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                      {isSpot ? (
                        <>
                          <MapPinned className="h-2.5 w-2.5 text-secondary" />
                          <span>SPOT</span>
                        </>
                      ) : (
                        <>
                          <Utensils className="h-2.5 w-2.5 text-secondary" />
                          <span>DINE</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-3 flex-grow flex flex-col justify-between bg-pattern-mandala/5">
                    <div>
                      <h4 className="font-serif font-bold text-sm text-primary group-hover:text-secondary transition-colors line-clamp-1">
                        {item.name}
                      </h4>
                      <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">
                        {isSpot ? item.location : `${item.cuisine} • ${item.priceRange}`}
                      </p>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between border-t border-secondary/10 pt-2">
                      {isSpot ? (
                        <span className="text-[9px] font-bold text-secondary truncate">
                          {item.ticketPrice || 'Free'}
                        </span>
                      ) : (
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                "h-2.5 w-2.5",
                                i < (item.rating || 0)
                                  ? "fill-secondary text-secondary"
                                  : "text-muted-foreground/30"
                              )}
                            />
                          ))}
                        </div>
                      )}
                      <span className="text-[9px] font-bold text-primary group-hover:underline flex items-center gap-0.5">
                        Details <ExternalLink className="h-2 w-2" />
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
    title: "Mysuru Palace",
    subtitle: "Royal lights and Wodeyar heritage",
    image: "/images/mysuru-palace-hero.svg",
  },
  {
    title: "Chamundi Hill",
    subtitle: "Temple views above the city",
    image: "/images/chamundi-hill-card.svg",
  },
  {
    title: "Devaraja Market",
    subtitle: "Flowers, spices, silk and color",
    image: "/images/devaraja-market-card.svg",
  },
];

export default function Chat() {
  const { theme } = useAppSettings();
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

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversationData?.messages, streamingText, activeId]);

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
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <Button onClick={handleNewChat} className="w-full gap-2 bg-primary hover:bg-primary/90 text-white shadow-md transition-all hover:scale-[1.02]">
          <Plus className="w-4 h-4" /> New Conversation
        </Button>
      </div>
      <ScrollArea className="flex-grow p-4">
        <div className="space-y-2">
          {isLoadingConvs ? (
            <div className="text-center text-muted-foreground py-4">Loading chats...</div>
          ) : conversations?.map((conv) => (
            <div
              key={conv.id}
              onClick={() => { setActiveId(conv.id); setIsSidebarOpen(false); }}
              className={cn(
                "group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border",
                activeId === conv.id
                  ? "bg-secondary/15 border-secondary/30 shadow-sm"
                  : "hover:bg-muted border-transparent"
              )}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <MessageSquare className={cn("w-4 h-4 flex-shrink-0", activeId === conv.id ? "text-secondary" : "text-muted-foreground")} />
                <div className="flex flex-col overflow-hidden">
                  <span className={cn("truncate font-medium text-sm", activeId === conv.id ? "text-foreground" : "text-muted-foreground group-hover:text-foreground")}>
                    {conv.title || "New Chat"}
                  </span>
                  <span className="text-[10px] text-muted-foreground/70">
                    {format(new Date(conv.createdAt ?? new Date()), "MMM d, h:mm a")}
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                onClick={(e) => handleDeleteChat(e, conv.id)}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );

  return (
    <div
      className="h-screen flex flex-col overflow-hidden bg-background bg-cover bg-center"
      style={{
        backgroundImage: `${theme === "dark"
          ? "linear-gradient(rgba(18, 3, 8, 0.86), rgba(18, 3, 8, 0.78))"
          : "linear-gradient(rgba(255, 250, 240, 0.9), rgba(255, 250, 240, 0.86))"
          }, url('/images/royal-silk-pattern.svg')`,
      }}
    >
      <Header />

      <main className="relative flex min-h-0 w-full flex-grow overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden w-80 flex-col border-r bg-white/70 backdrop-blur-sm dark:bg-card/80 md:flex">
          <SidebarContent />
        </aside>

        {/* Mobile Header / Sidebar Trigger */}
        <div className="md:hidden absolute top-4 left-4 z-20">
          <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shadow-md bg-white dark:bg-card dark:text-foreground dark:border-secondary/30">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[80%] max-w-[300px] p-0">
              <SidebarContent />
            </SheetContent>
          </Sheet>
        </div>

        {/* Chat Container */}
        <div className="relative mx-auto flex min-h-0 w-full max-w-5xl flex-grow flex-col overflow-hidden px-4 pb-3 pt-4 md:px-8 md:pb-4 md:pt-5">
          {/* Header Area */}
          {!hasMessages ? (
            <div className="mb-3 pl-12 text-center md:mb-4 md:pl-0">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 shadow-sm dark:border-emerald-500/30 dark:bg-emerald-950">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-200">NammaMysuru.ai Online</span>
              </div>
              <h1 className="flex flex-col items-center justify-center gap-1 font-serif text-xl font-bold text-primary sm:text-2xl md:flex-row md:gap-2 md:text-3xl">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={greetingIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.5 }}
                    className="inline-block min-w-[120px] text-center text-primary md:text-right"
                  >
                    {ROYAL_GREETINGS[greetingIndex]}!
                  </motion.span>
                </AnimatePresence>
                <span>{copy.headline}</span>
              </h1>
              <p className="mx-auto mt-1 hidden max-w-xl text-xs font-medium text-muted-foreground sm:block sm:text-sm">
                {copy.intro}
              </p>
            </div>
          ) : (
            <div className="mb-2 flex items-center justify-between pl-12 md:pl-0">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 shadow-sm dark:border-emerald-500/30 dark:bg-emerald-950">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-200">NammaMysuru.ai Online</span>
              </div>
              <h2 className="font-serif font-bold text-sm text-primary uppercase tracking-wider hidden sm:block">
                {conversationData?.title || "Royal Consultation"}
              </h2>
            </div>
          )}

          {!hasMessages && (
            <div className="mb-3 flex gap-3 overflow-x-auto pb-1 sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0 md:mb-4">
              {MYSURU_FEATURES.map((item) => (
                <button
                  key={item.title}
                  onClick={() => handleUseSuggestion(`Tell me about ${item.title}`)}
                  className="group relative min-h-[64px] min-w-[176px] overflow-hidden rounded-lg border border-secondary/30 text-left shadow-lg transition hover:-translate-y-0.5 hover:border-secondary sm:min-w-0 sm:min-h-[86px] md:min-h-[92px]"
                >
                  <img src={item.image} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/55 to-black/25" />
                  <div className="relative z-10 p-2.5 sm:p-3 md:p-4">
                    <div className="text-sm font-bold text-secondary">{item.title}</div>
                    <div className="mt-1 hidden max-w-[13rem] text-xs leading-relaxed text-white/85 sm:block">{item.subtitle}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Chat Area */}
          <div className="relative mb-3 min-h-0 flex-1 overflow-y-auto rounded-lg border border-secondary/35 bg-white/90 p-4 shadow-2xl backdrop-blur-md dark:bg-card/90 md:mb-4 md:p-8">
            {isLoadingConv ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="w-10 h-10 text-primary animate-spin" />
                  <p className="text-primary font-serif animate-pulse">Connecting to NammaMysuru.ai...</p>
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

            {(!conversationData?.messages || conversationData.messages.length === 0) && !streamingText && (
              <div className="h-full flex flex-col items-center justify-center text-center px-6">
                <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-lg border border-secondary/30 bg-secondary/15 shadow-inner">
                  <Crown className="h-10 w-10 text-secondary" />
                </div>
                <h2 className="mb-2 font-serif text-2xl font-bold text-primary">{copy.welcomeTitle}</h2>
                <p className="max-w-md text-muted-foreground">{copy.welcomeBody}</p>
                <div className="mt-6 flex max-w-xl flex-wrap justify-center gap-2">
                  {copy.suggestions.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => handleUseSuggestion(prompt)}
                      className="rounded-lg border border-border dark:border-secondary/30 bg-white dark:bg-card px-3 py-2 text-sm text-foreground shadow-sm transition hover:border-primary/30 hover:text-primary"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="relative group px-1 pb-4">
            <div className="flex flex-col gap-2 rounded-lg border border-primary/20 bg-white/92 p-3 shadow-2xl backdrop-blur-md transition-all duration-300 group-focus-within:border-primary/40 group-focus-within:shadow-primary/10 dark:bg-card/95 md:p-4">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {copy.actions.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.label}
                      onClick={() => handleUseSuggestion(item.prompt)}
                      className="flex min-w-fit items-center gap-2 rounded-md border border-secondary/30 bg-secondary/10 px-2.5 py-1.5 text-xs font-bold text-primary transition-all hover:-translate-y-0.5 hover:border-secondary hover:bg-secondary/20 md:px-3 md:py-2"
                    >
                      <Icon className="h-3.5 w-3.5 text-secondary" />
                      {item.label}
                    </button>
                  );
                })}
              </div>

              {/* Language Selector */}
              <div className="flex flex-wrap items-center justify-center gap-2">
                <div className="mr-1 flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                  <Languages className="h-3.5 w-3.5" />
                  {copy.replyLabel}
                </div>
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={cn(
                      "rounded-md border px-2.5 py-0.5 text-xs font-bold uppercase transition-all duration-200 md:px-3 md:py-1",
                      language === lang
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-transparent text-muted-foreground border-transparent hover:bg-secondary/10 hover:text-primary"
                    )}
                  >
                    {SAFE_LANGUAGE_DISPLAY[lang]}
                  </button>
                ))}
              </div>

              <div className="flex items-end gap-3">
                <textarea
                  ref={textareaRef}
                  placeholder={hasMessages ? copy.placeholderContinue : copy.placeholderNew}
                  className="min-h-[24px] flex-grow resize-none border-none bg-transparent py-1.5 font-medium text-foreground placeholder:text-muted-foreground/50 focus:ring-0 md:py-2"
                  rows={1}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />

                {/* Microphone Button */}
                <button
                  type="button"
                  onClick={toggleListening}
                  className={cn(
                    "mb-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border transition-all relative overflow-hidden shadow-md",
                    isListening
                      ? "bg-red-500 text-white border-red-500 hover:bg-red-600"
                      : "bg-white dark:bg-card border-primary/20 dark:border-secondary/30 text-primary dark:text-foreground hover:bg-secondary/15"
                  )}
                  title={isListening ? "Listening... Click to stop" : "Speak to type"}
                >
                  {isListening ? (
                    <>
                      <span className="absolute inset-0 rounded-lg bg-red-500 animate-ping opacity-75" />
                      <MicOff className="h-5 w-5 relative z-10" />
                    </>
                  ) : (
                    <Mic className="h-5 w-5" />
                  )}
                </button>

                <button
                  onClick={handleSend}
                  disabled={!inputText.trim() || isSending}
                  className="mb-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md transition-all hover:bg-primary/90 disabled:opacity-30"
                >
                  {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
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
