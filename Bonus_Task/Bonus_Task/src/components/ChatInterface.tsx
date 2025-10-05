import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

const ChatInterface = () => {
  const { toast } = useToast();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [selectedModel] = useState("Llama-3.1-Nemotron-Nano-4B-v1.1");
  const [isLoading, setIsLoading] = useState(false);

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: "welcome",
        content: "Hello! I'm ready to help you test the Llama-3.1-Nemotron-Nano-4B-v1.1 model.",
        role: "assistant",
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, []);

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: currentMessage,
      role: "user",
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setCurrentMessage("");
    setIsLoading(true);

    try {
      // Replace with your actual API endpoint
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: selectedModel,
          message: currentMessage,
        }),
      });

      let assistantResponse = "I'm a demo response. Connect me to your local Llama API endpoint to get real responses.";
      
      if (response.ok) {
        const data = await response.json();
        assistantResponse = data.response || data.message || assistantResponse;
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: assistantResponse,
        role: "assistant",
        timestamp: new Date(),
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);

    } catch (error) {
      console.error('Chat API error:', error);
      toast({
        title: "API Error",
        description: "Failed to get response from Llama API. Check your local server.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-screen bg-chat-background">
      {/* Chat Area */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3 max-w-[80%]",
                message.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              {message.role === "assistant" && (
                <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
              
              <div
                className={cn(
                  "px-4 py-3 rounded-2xl",
                  message.role === "user"
                    ? "bg-message-user text-message-user-foreground"
                    : "bg-message-assistant text-message-assistant-foreground"
                )}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
                <div className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>

              {message.role === "user" && (
                <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-secondary-foreground" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 max-w-[80%] mr-auto">
              <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="bg-message-assistant text-message-assistant-foreground px-4 py-3 rounded-2xl">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-border p-6">
          <div className="flex gap-3 mb-3">
            <Input
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message to test Llama-3.1-Nemotron-Nano-4B-v1.1..."
              className="flex-1 bg-background border-border"
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!currentMessage.trim() || isLoading}
              className="bg-gradient-primary hover:opacity-90 transition-opacity"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <div className="text-xs text-muted-foreground">
            <span>Press Enter to send, Shift+Enter for new line</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;