import { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const LiveChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");

  return (
    <>
      {/* Chat Window */}
      <div
        className={`fixed bottom-28 right-6 w-80 sm:w-96 bg-card rounded-2xl shadow-2xl z-[9998] border border-border transition-all duration-300 overflow-hidden ${
          isOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        {/* Header */}
        <div className="bg-primary p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
              <MessageCircle size={20} className="text-primary" />
            </div>
            <div>
              <h4 className="font-heading font-bold text-primary-foreground">RAC Support</h4>
              <p className="text-xs text-primary-foreground/70">Online • Typically replies instantly</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-primary-foreground/70 hover:text-primary-foreground transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="h-72 p-4 bg-muted/30 overflow-y-auto">
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                <MessageCircle size={14} className="text-primary" />
              </div>
              <div className="bg-card rounded-2xl rounded-tl-none p-3 shadow-sm max-w-[80%]">
                <p className="text-sm text-foreground">
                  Hello! 👋 Welcome to RAC Logistics. How can we help you today?
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Input */}
        <div className="p-4 bg-card border-t border-border">
          <div className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1"
            />
            <Button variant="cta" size="icon">
              <Send size={18} />
            </Button>
          </div>
        </div>
      </div>

      {/* Floating Button - Fixed position with proper spacing */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close chat" : "Open chat"}
        className={`fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-2xl z-[9999] flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-yellow-lg ${
          isOpen 
            ? "bg-primary rotate-180" 
            : "bg-secondary"
        }`}
        style={{ 
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
        }}
      >
        {isOpen ? (
          <X size={26} className="text-primary-foreground transition-transform" />
        ) : (
          <>
            <MessageCircle size={26} className="text-secondary-foreground" />
            {/* Pulse ring effect */}
            <span className="absolute inset-0 rounded-full bg-secondary animate-ping opacity-25" />
          </>
        )}
      </button>
    </>
  );
};

export default LiveChat;
