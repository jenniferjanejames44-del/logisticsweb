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

const LiveChat = () => {
  const [isOpen, setIsOpen] = useState(false);
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

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  // Focus input when chat opens
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
        content: "I apologize, I'm having trouble connecting. Please try again or contact us directly at support@raclogistics.com",
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
          "fixed bottom-24 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-[380px] max-w-[380px] bg-card rounded-2xl shadow-2xl border border-border z-[9998] overflow-hidden transition-all duration-300 transform",
          isOpen
            ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
            : "opacity-0 translate-y-4 scale-95 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="gradient-blue px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shadow-md">
              <span className="text-lg">💬</span>
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">
                RAC Support
              </h4>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
                <p className="text-xs text-white/80">
                  AI Assistant • Online
                </p>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="text-white/80 hover:text-white hover:bg-white/10 h-8 w-8"
          >
            <X size={18} />
          </Button>
        </div>

        {/* Messages */}
        <ScrollArea ref={scrollAreaRef} className="h-[320px] bg-background">
          <div className="p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-2",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 gradient-blue rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Bot size={14} className="text-white" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[75%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm",
                    msg.role === "user"
                      ? "gradient-blue text-white rounded-br-md"
                      : "bg-muted text-foreground rounded-bl-md"
                  )}
                >
                  {msg.content}
                </div>
                {msg.role === "user" && (
                  <div className="w-7 h-7 gradient-yellow rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                    <User size={14} className="text-primary" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2 justify-start">
                <div className="w-7 h-7 gradient-blue rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Bot size={14} className="text-white" />
                </div>
                <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
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
              className="flex-1 bg-card border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-accent/50 text-sm"
            />
            <button
              onClick={sendMessage}
              disabled={!message.trim() || isLoading}
              className="h-10 w-10 gradient-blue rounded-xl flex items-center justify-center shadow-md disabled:opacity-50 transition-all hover:scale-105"
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin text-white" />
              ) : (
                <Send size={18} className="text-white" />
              )}
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground text-center mt-2">
            Powered by RAC Logistics AI
          </p>
        </div>
      </div>

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close chat" : "Open chat"}
        className={cn(
          "fixed bottom-8 right-4 sm:right-6 w-16 h-16 rounded-full shadow-xl z-[9999] flex items-center justify-center transition-all duration-300 hover:scale-110",
          isOpen
            ? "bg-muted"
            : "gradient-blue"
        )}
        style={{
          boxShadow: isOpen ? undefined : '0 8px 24px rgba(59, 130, 246, 0.4)',
        }}
      >
        {isOpen ? (
          <X size={24} className="text-primary" />
        ) : (
          <span className="text-2xl">💬</span>
        )}
      </button>
    </>
  );
};

export default LiveChat;
