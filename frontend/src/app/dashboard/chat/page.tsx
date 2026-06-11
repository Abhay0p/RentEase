"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useAuthStore } from "@/store/authStore";
import { motion } from "framer-motion";
import { Send, User as UserIcon, Shield, Search, ArrowLeft } from "lucide-react";
import { PremiumButton } from "@/components/ui/premium-button";
import { useSearchParams } from "next/navigation";
import api from "@/lib/axios";

interface Message {
  id: string;
  sender_id: string;
  sender_name: string;
  content: string;
  timestamp: string;
}

interface Conversation {
  id: string;
  property_details: any;
  tenant_details: any;
  landlord_details: any;
  latest_message?: Message;
  updated_at: string;
}

function ChatClient() {
  const { user } = useAuthStore();
  const searchParams = useSearchParams();
  const initialConversationId = searchParams.get("conversationId") || "global";

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string>(initialConversationId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [showSidebarOnMobile, setShowSidebarOnMobile] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch Conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await api.get("/chat/conversations/");
        setConversations(res.data);
      } catch (err) {
        console.error("Failed to fetch conversations", err);
      }
    };
    if (user) {
      fetchConversations();
    }
  }, [user]);

  // Handle WebSocket Connection
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    let isActive = true;

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/ws/chat/";
    const ws = new WebSocket(`${wsUrl}${activeConvId}/?token=${token}`);

    ws.onopen = () => {
      if (!isActive) return;
      setIsConnected(true);
      console.log(`Connected to chat: ${activeConvId}`);
    };

    ws.onmessage = (event) => {
      if (!isActive) return;
      const data = JSON.parse(event.data);
      if (data.type === 'message') {
        setMessages((prev) => [...prev, data.message]);
        
        // Update latest message in sidebar
        setConversations(prev => prev.map(c => {
          if (c.id === activeConvId) {
            return { ...c, latest_message: data.message, updated_at: new Date().toISOString() };
          }
          return c;
        }).sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()));
      }
    };

    ws.onclose = () => {
      if (!isActive) return;
      setIsConnected(false);
    };

    setSocket(ws);

    return () => {
      isActive = false;
      ws.close();
    };
  }, [activeConvId]);

  // Fetch Message History for selected conversation (if not global)
  useEffect(() => {
    if (activeConvId === "global") {
      setMessages([]);
      return;
    }

    let isFetchActive = true;

    const fetchHistory = async () => {
      try {
        const res = await api.get(`/chat/conversations/${activeConvId}/messages/`);
        
        if (!isFetchActive) return;

        // Transform the DRF response to match our Message interface
        const history = res.data.map((msg: any) => ({
          id: msg.id,
          sender_id: msg.sender,
          sender_name: msg.sender_name,
          content: msg.content,
          timestamp: msg.created_at
        }));

        setMessages(history);
      } catch (err) {
        if (isFetchActive) {
           console.error("Failed to fetch history", err);
        }
      }
    };

    fetchHistory();

    return () => {
       isFetchActive = false;
    };
  }, [activeConvId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !socket || !isConnected) return;

    socket.send(JSON.stringify({
      message: input,
      sender_id: user?.id,
      sender_name: user?.first_name || "Client",
    }));
    setInput("");
  };

  const getChatPartnerName = (conv: Conversation) => {
    if (user?.role === "LANDLORD") {
      return `${conv.tenant_details?.first_name} ${conv.tenant_details?.last_name}`;
    }
    return `${conv.landlord_details?.first_name} ${conv.landlord_details?.last_name}`;
  };

  const activeConversation = conversations.find(c => c.id === activeConvId);

  return (
    <div className="max-w-7xl mx-auto h-[80vh] flex bg-card border border-border/40 rounded-3xl arch-shadow overflow-hidden">
      
      {/* Sidebar: Conversations List */}
      <div className={`w-full md:w-1/3 border-r border-border/40 flex-col bg-card ${showSidebarOnMobile ? 'flex' : 'hidden md:flex'}`}>
        <div className="p-6 border-b border-border/40 bg-secondary/30">
          <h2 className="text-xl font-serif text-foreground mb-4">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              className="w-full bg-background border border-border focus:border-accent rounded-xl pl-10 pr-4 py-2 text-sm outline-none transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-border/20">
          {/* Global Concierge Option */}
          <div 
            onClick={() => { setActiveConvId("global"); setShowSidebarOnMobile(false); }}
            className={`p-5 cursor-pointer transition-colors flex gap-4 ${activeConvId === 'global' ? 'bg-secondary/80' : 'hover:bg-secondary/40'}`}
          >
            <div className="w-12 h-12 rounded-full bg-accent/10 border border-accent/20 flex flex-shrink-0 items-center justify-center relative">
              <Shield className="w-6 h-6 text-accent" />
            </div>
            <div className="flex-1 min-w-0 overflow-hidden">
              <div className="flex justify-between items-baseline mb-1">
                <h4 className="font-serif text-foreground truncate">Global Concierge</h4>
              </div>
              <p className="text-xs text-muted-foreground truncate font-light">Public support channel</p>
            </div>
          </div>

          {/* Private Conversations */}
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground font-light text-sm">
              No private conversations yet.
            </div>
          ) : (
            conversations.map((conv) => (
              <div 
                key={conv.id}
                onClick={() => { setActiveConvId(conv.id); setShowSidebarOnMobile(false); }}
                className={`p-5 cursor-pointer transition-colors flex gap-4 ${activeConvId === conv.id ? 'bg-secondary/80 border-l-2 border-accent' : 'hover:bg-secondary/40 border-l-2 border-transparent'}`}
              >
                <div className="w-12 h-12 rounded-full bg-secondary border border-border flex flex-shrink-0 items-center justify-center overflow-hidden">
                   {conv.property_details?.images?.[0]?.image_url ? (
                     <img src={conv.property_details.images[0].image_url} alt="Prop" className="w-full h-full object-cover" />
                   ) : (
                     <UserIcon className="w-6 h-6 text-muted-foreground" />
                   )}
                </div>
                <div className="flex-1 min-w-0 overflow-hidden">
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="font-serif text-foreground truncate">{getChatPartnerName(conv)}</h4>
                    {conv.latest_message && (
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(conv.latest_message.timestamp).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-accent truncate mb-1">{conv.property_details?.title}</p>
                  <p className="text-xs text-muted-foreground truncate font-light">
                    {conv.latest_message ? conv.latest_message.content : "Start the conversation..."}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex-col bg-background/50 relative ${showSidebarOnMobile ? 'hidden md:flex' : 'flex'}`}>
        {/* Header */}
        <div className="p-6 border-b border-border/40 bg-secondary/50 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <div 
              onClick={() => setShowSidebarOnMobile(true)}
              className="md:hidden w-10 h-10 rounded-full flex items-center justify-center bg-card border border-border mr-2 cursor-pointer hover:bg-secondary"
            >
               <ArrowLeft className="w-4 h-4" />
            </div>

            {activeConvId === "global" ? (
              <>
                <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center border border-border arch-shadow relative">
                  <Shield className="w-6 h-6 text-accent" />
                  <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card ${isConnected ? 'bg-green-500' : 'bg-destructive'}`}></span>
                </div>
                <div>
                  <h2 className="text-xl font-serif text-foreground">Global Concierge</h2>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                    {isConnected ? "Connected to Network" : "Reconnecting..."}
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center border border-border arch-shadow relative overflow-hidden">
                  {activeConversation?.property_details?.images?.[0]?.image_url ? (
                     <img src={activeConversation.property_details.images[0].image_url} alt="Prop" className="w-full h-full object-cover" />
                   ) : (
                     <UserIcon className="w-6 h-6 text-accent" />
                   )}
                  <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card ${isConnected ? 'bg-green-500' : 'bg-destructive'}`}></span>
                </div>
                <div>
                  <h2 className="text-xl font-serif text-foreground">{activeConversation ? getChatPartnerName(activeConversation) : 'Loading...'}</h2>
                  <p className="text-xs text-accent font-medium truncate max-w-sm">
                    {activeConversation?.property_details?.title || 'Private Channel'}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="text-center pb-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Secure Channel</p>
            <p className="text-sm text-muted-foreground font-light max-w-md mx-auto">
              {activeConvId === "global" 
                ? "Welcome to the RentEase global network. Our luxury concierge team is available 24/7."
                : "This conversation is end-to-end encrypted. For your safety, do not share personal payment details outside of RentEase."}
            </p>
          </div>

          {messages.map((msg, idx) => {
            const isMe = msg.sender_id === user?.id;
            return (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={msg.id || idx} 
                className={`flex gap-4 ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                {!isMe && (
                  <div className="w-10 h-10 rounded-full bg-secondary flex-shrink-0 flex items-center justify-center border border-border">
                    <UserIcon className="w-5 h-5 text-muted-foreground" />
                  </div>
                )}
                
                <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                  <span className="text-xs text-muted-foreground mb-1 ml-1">{msg.sender_name}</span>
                  <div className={`px-6 py-4 rounded-2xl ${isMe ? 'bg-accent text-white rounded-tr-sm' : 'bg-secondary text-foreground rounded-tl-sm'} shadow-sm`}>
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1 mr-1">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </motion.div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 border-t border-border/40 bg-card">
          <form onSubmit={sendMessage} className="flex gap-4">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Send a secure message..."
              disabled={!isConnected}
              className="flex-1 bg-secondary border border-border focus:border-accent rounded-xl px-6 py-4 text-sm outline-none transition-colors disabled:opacity-50"
            />
            <PremiumButton type="submit" disabled={!isConnected || !input.trim()} className="px-8 flex-shrink-0">
              <Send className="w-5 h-5" />
            </PremiumButton>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-[80vh]">Loading chat...</div>}>
      <ChatClient />
    </Suspense>
  );
}
