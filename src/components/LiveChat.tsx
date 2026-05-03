import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const SCROLL_THRESHOLD = 120;
const WHATSAPP_LINK = "https://wa.me/2348185956707?text=Hello%20RAC%20Logistics%2C%20I%20need%20support.";

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 32 32" fill="currentColor" className={className} aria-hidden="true">
    <path d="M19.11 17.33c-.3-.15-1.78-.88-2.05-.98-.27-.1-.47-.15-.67.15-.2.3-.77.98-.94 1.18-.17.2-.35.23-.65.08-.3-.15-1.27-.47-2.42-1.5-.89-.8-1.5-1.78-1.67-2.08-.18-.3-.02-.46.13-.61.13-.13.3-.35.45-.53.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.67-1.62-.92-2.22-.24-.58-.48-.5-.67-.5h-.57c-.2 0-.53.08-.8.38-.27.3-1.03 1-.98 2.43.05 1.42 1.03 2.8 1.18 3 .15.2 2.04 3.12 5.04 4.38.71.31 1.27.5 1.7.64.71.22 1.36.19 1.88.12.57-.08 1.78-.73 2.03-1.43.25-.7.25-1.3.17-1.43-.07-.13-.27-.2-.57-.35Z" />
    <path d="M27.22 4.78A15.2 15.2 0 0 0 3.68 23.12L2 30l7.04-1.64a15.21 15.21 0 0 0 7.22 1.83h.01c8.39 0 15.22-6.82 15.22-15.21 0-4.06-1.58-7.88-4.27-10.2Zm-10.95 22.8h-.01a12.7 12.7 0 0 1-6.47-1.78l-.46-.27-4.18.97.99-4.07-.3-.48a12.66 12.66 0 0 1-1.95-6.72c0-7 5.7-12.69 12.71-12.69 3.39 0 6.58 1.32 8.98 3.72a12.61 12.61 0 0 1 3.72 8.98c0 7-5.7 12.69-12.7 12.69Z" />
  </svg>
);

const LiveChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! 👋 Welcome to RAC Logistics. I'm your AI support assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsVisible(scrollY > SCROLL_THRESHOLD);
    };

    handleScroll();
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Hide floating chat/WhatsApp buttons whenever a modal/dialog or sheet is open
  // so they never cover sticky action buttons (Pay Now, Submit, etc.).
  useEffect(() => {
    const check = () => {
      const hasOpenDialog = !!document.querySelector(
        '[role="dialog"][data-state="open"], [role="alertdialog"][data-state="open"]'
      );
      setDialogOpen(hasOpenDialog);
    };
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["data-state"],
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: message.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setIsLoading(true);

    try {
      const conversationHistory = messages
        .filter((m) => m.id !== "welcome")
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      const { data, error } = await supabase.functions.invoke("chat-support", {
        body: {
          message: userMessage.content,
          conversationHistory,
        },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: "I apologize, I'm having trouble connecting. Please try again or contact us directly at support@raclogistic.com",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat Window */}
      <div
        className={cn(
          "fixed bottom-[10rem] right-4 sm:bottom-[10.5rem] sm:right-6 w-[calc(100vw-2rem)] max-w-[380px] rounded-2xl border border-border bg-card shadow-2xl z-[9998] overflow-hidden transition-all duration-300 transform sm:w-[380px]",
          isOpen
            ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
            : "opacity-0 translate-y-4 scale-95 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="bg-primary px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
              <MessageCircle size={18} className="text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">
                RAC Support
              </h4>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-white rounded-full" />
                <p className="text-xs text-white/80">
                  Online
                </p>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="h-8 w-8 text-white/80 hover:bg-primary/20 hover:text-white"
          >
            <X size={18} />
          </Button>
        </div>

        {/* Messages */}
        <ScrollArea ref={scrollAreaRef} className="h-[300px] bg-background">
          <div className="p-4 space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-2",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                    <Bot size={14} className="text-primary-foreground" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[75%] rounded-lg px-3 py-2 text-sm leading-relaxed",
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  )}
                >
                  {msg.content}
                </div>
                {msg.role === "user" && (
                  <div className="w-7 h-7 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                    <User size={14} className="text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2 justify-start">
                <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                  <Bot size={14} className="text-primary-foreground" />
                </div>
                <div className="bg-muted rounded-lg px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-3 bg-muted border-t border-border">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1 bg-background text-sm"
            />
            <button
              onClick={sendMessage}
              disabled={!message.trim() || isLoading}
              className="h-10 w-10 bg-primary rounded-lg flex items-center justify-center disabled:opacity-50 transition-colors hover:bg-[hsl(153,41%,24%)]"
            >
              {isLoading ? (
                <Loader2 size={16} className="animate-spin text-primary-foreground" />
              ) : (
                <Send size={16} className="text-primary-foreground" />
              )}
            </button>
          </div>
        </div>
      </div>

      <a
        href={WHATSAPP_LINK}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with RAC Logistics on WhatsApp"
        className={cn(
          "fixed bottom-6 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_18px_36px_rgba(37,211,102,0.32)] transition-all duration-300 hover:-translate-y-px hover:bg-[#1DA851] hover:shadow-[0_20px_42px_rgba(37,211,102,0.4)] sm:right-6",
          dialogOpen && "opacity-0 pointer-events-none translate-y-4"
        )}
      >
        <WhatsAppIcon className="h-7 w-7" />
      </a>

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close chat" : "Open chat"}
        className={cn(
          "fixed bottom-[5.25rem] right-4 z-40 flex h-14 w-14 items-center justify-center rounded-xl shadow-lg transition-all duration-300 sm:bottom-24 sm:right-6",
          isOpen
            ? "bg-muted text-foreground"
            : "bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground hover:shadow-xl",
          (isVisible || isOpen) && !dialogOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-4 pointer-events-none"
        )}
      >
        {isOpen ? (
          <X size={22} />
        ) : (
          <MessageCircle size={22} />
        )}
      </button>
    </>
  );
};

export default LiveChat;
