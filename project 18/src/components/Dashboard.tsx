"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Brain,
  Plus,
  Search,
  Share2,
  LogOut,
  LinkIcon,
  Image,
  Video,
  FileText,
  Headphones,
  Trash2,
  MessageCircle,
  X,
  Send,
  Eraser,
  Sparkles,
  Filter,
  Users,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { contentApi } from "../api/content";
import { chatApi, Resource } from "../api/chat";
import { AddContentModal } from "./AddContentModal";
import { cn } from "../lib/utils";

// Import shadcn/ui components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Content {
  _id: string;
  link: string;
  type: string;
  title: string;
  tags: any[];
  userId: string;
}

interface DisplayMessage {
  id: string; // Unique ID for React keys
  sender: "user" | "bot";
  text: string;
  resources?: Resource[]; // Only for bot messages
  timestamp: number;
}

export function Dashboard() {
  const [contents, setContents] = useState<Content[]>([]);
  const [filteredContents, setFilteredContents] = useState<Content[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [shareHash, setShareHash] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Chat states
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatMessagesEndRef = useRef<HTMLDivElement>(null); // Ref for auto-scrolling
  const chatContainerRef = useRef<HTMLDivElement>(null); // Ref for resizing

  // Resizing states
  const [chatWidth, setChatWidth] = useState(400); // Initial width
  const [isResizing, setIsResizing] = useState(false);
  const MIN_CHAT_WIDTH = 320;
  const MAX_CHAT_WIDTH = 800;

  const { user, logout } = useAuth();

  const contentTypes = [
    { id: "all", label: "All Content", icon: Filter },
    { id: "image", label: "Images", icon: Image },
    { id: "video", label: "Videos", icon: Video },
    { id: "article", label: "Articles", icon: FileText },
    { id: "audio", label: "Audio", icon: Headphones },
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "image":
        return <Image className="h-5 w-5" />;
      case "video":
        return <Video className="h-5 w-5" />;
      case "article":
        return <FileText className="h-5 w-5" />;
      case "audio":
        return <Headphones className="h-5 w-5" />;
      default:
        return <LinkIcon className="h-5 w-5" />;
    }
  };

  const getTypeStyles = (type: string) => {
    switch (type) {
      case "image":
        return "content-image text-emerald-300"; // Adjusted for dark theme
      case "video":
        return "content-video text-rose-300"; // Adjusted for dark theme
      case "article":
        return "content-article text-blue-300"; // Adjusted for dark theme
      case "audio":
        return "content-audio text-purple-300"; // Adjusted for dark theme
      default:
        return "bg-muted/50 text-muted-foreground border-muted";
    }
  };

  useEffect(() => {
    fetchContents();
  }, []);

  useEffect(() => {
    if (!Array.isArray(contents)) {
      setFilteredContents([]);
      return;
    }
    const term = searchTerm.toLowerCase();
    const filtered = contents
      .filter((c) => selectedType === "all" || c.type === selectedType)
      .filter((c) => {
        const title = (c.title ?? "").toLowerCase();
        const link = (c.link ?? "").toLowerCase();
        return title.includes(term) || link.includes(term);
      });
    setFilteredContents(filtered);
  }, [contents, searchTerm, selectedType]);

  // Auto-scroll to the latest message
  useEffect(() => {
    if (chatMessagesEndRef.current) {
      chatMessagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, chatLoading]);

  const fetchContents = async () => {
    try {
      const response = await contentApi.getContents();
      setContents(response.contents);
    } catch (error) {
      console.error("Error fetching contents:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddContent = async (contentData: any) => {
    try {
      await contentApi.addContent(contentData);
      fetchContents();
      setShowAddModal(false);
    } catch (error) {
      console.error("Error adding content:", error);
    }
  };

  const handleDeleteContent = async (contentId: string) => {
    try {
      await contentApi.deleteContent(contentId);
      fetchContents();
    } catch (error) {
      console.error("Error deleting content:", error);
    }
  };

  const handleShare = async () => {
    try {
      const response = await contentApi.shareBrain(true);
      setShareHash((response as any).hash);
    } catch (error) {
      console.error("Error sharing brain:", error);
    }
  };

  const handleUnshare = async () => {
    try {
      await contentApi.shareBrain(false);
      setShareHash(null);
    } catch (error) {
      console.error("Error unsharing brain:", error);
    }
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;
    const userMessage: DisplayMessage = {
      id: Date.now().toString() + "-user",
      sender: "user",
      text: chatInput,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setChatInput("");
    setChatLoading(true);
    try {
      const { message: answer, resources } = await chatApi.sendMessage(
        userMessage.text
      );
      const botMessage: DisplayMessage = {
        id: Date.now().toString() + "-bot",
        sender: "bot",
        text: answer,
        resources: resources,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + "-error",
          sender: "bot",
          text: "Sorry, I couldn't process that. Please try again.",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  // Resizing handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing || !chatContainerRef.current) return;
      const newWidth = window.innerWidth - e.clientX;
      setChatWidth(
        Math.max(MIN_CHAT_WIDTH, Math.min(MAX_CHAT_WIDTH, newWidth))
      );
    },
    [isResizing]
  );

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    } else {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="glass-card p-12 flex flex-col items-center space-y-6 max-w-md">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-primary/30 rounded-full animate-spin"></div>
            <div className="absolute top-0 w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <Brain className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-primary animate-pulse" />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Initializing Your Content Brain
            </h3>
            <p className="text-muted-foreground">
              Preparing your intelligent content hub...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass-header sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="p-3 bg-gradient-hero rounded-2xl shadow-glow animate-pulse-glow">
                  <Brain className="h-8 w-8 text-white" />
                </div>
                <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-amber-400 animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-glow to-accent-blue bg-clip-text text-transparent">
                  Second Brain
                </h1>
                <p className="text-muted-foreground text-sm font-medium">
                  AI-Powered Intelligence Hub
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="hidden sm:flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Welcome back</p>
                  <p className="font-semibold text-foreground">
                    {user?.username}
                  </p>
                </div>
              </div>
              <Button
                onClick={logout}
                className="btn-glass px-4 py-2 rounded-xl flex items-center space-x-2 hover:text-destructive"
                variant="ghost" // Use shadcn button variant
              >
                <LogOut className="h-5 w-5" />
                <span className="hidden sm:inline font-medium">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main
        className={cn(
          "max-w-7xl mx-auto px-6 lg:px-8 py-8",
          showChat && "pr-6"
        )}
        style={showChat ? { marginRight: `${chatWidth}px` } : {}}
      >
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="glass-card p-8 mb-8 bg-gradient-content">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Your Intelligent
              <span className="bg-gradient-to-r from-primary-glow to-accent-blue bg-clip-text text-transparent">
                {" "}
                Content Universe
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Organize, discover, and interact with your digital content using
              cutting-edge AI technology
            </p>
          </div>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            {shareHash ? (
              <div className="glass-card p-4 flex items-center space-x-4 max-w-lg w-full">
                <div className="flex-1">
                  <Input
                    type="text"
                    value={`${window.location.origin}/brain/${shareHash}`}
                    readOnly
                    className="w-full bg-transparent text-sm text-foreground focus-visible:ring-0 focus-visible:ring-offset-0 border-none"
                  />
                </div>
                <Button
                  onClick={handleUnshare}
                  className="px-4 py-2 bg-destructive/20 border border-destructive/40 text-destructive rounded-lg hover:bg-destructive/30 transition-all duration-200 font-medium"
                  variant="outline" // Use shadcn button variant
                >
                  Unshare
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleShare}
                className="btn-hero px-8 py-4 flex items-center space-x-3"
              >
                <Share2 className="h-5 w-5" />
                <span className="font-semibold">Share Your Brain</span>
              </Button>
            )}
            <Button
              onClick={() => setShowAddModal(true)}
              className="btn-glass px-8 py-4 flex items-center space-x-3 font-semibold"
              variant="ghost" // Use shadcn button variant
            >
              <Plus className="h-5 w-5" />
              <span>Add Content</span>
            </Button>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="glass-card p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search across your content universe..."
                className="w-full pl-12 pr-6 py-4 bg-background/50 border border-glass-border rounded-xl text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary/50 transition-all duration-300"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              {contentTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <Button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={cn(
                      "px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2",
                      selectedType === type.id
                        ? "bg-primary text-primary-foreground shadow-glow"
                        : "btn-glass hover:scale-105"
                    )}
                    variant={selectedType === type.id ? "default" : "ghost"} // Use shadcn button variant
                  >
                    <Icon className="h-4 w-4" />
                    <span>{type.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content Grid */}
        {filteredContents.length === 0 ? (
          <div className="text-center py-20">
            <div className="glass-card p-16 max-w-2xl mx-auto">
              <div className="relative mb-8">
                <Brain className="h-24 w-24 text-muted-foreground/50 mx-auto animate-float" />
                <Sparkles className="absolute top-0 right-1/3 h-6 w-6 text-primary animate-pulse" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">
                {searchTerm || selectedType !== "all"
                  ? "No matching content found"
                  : "Your Content Universe Awaits"}
              </h3>
              <p className="text-lg text-muted-foreground mb-8">
                {searchTerm || selectedType !== "all"
                  ? "Try adjusting your search terms or filters"
                  : "Begin your journey by adding your first piece of content"}
              </p>
              {!searchTerm && selectedType === "all" && (
                <Button
                  onClick={() => setShowAddModal(true)}
                  className="btn-hero px-8 py-4 inline-flex items-center space-x-3"
                >
                  <Plus className="h-5 w-5" />
                  <span className="font-semibold">Create Your First Entry</span>
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredContents.map((content, index) => (
              <div
                key={content._id}
                className="glass-card p-6 hover-lift hover-glow group relative overflow-hidden"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-shimmer"></div>
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-background/80 rounded-xl group-hover:scale-110 transition-transform duration-300">
                        {getTypeIcon(content.type)}
                      </div>
                      <span
                        className={cn(
                          "px-3 py-1 rounded-lg text-xs font-semibold border",
                          getTypeStyles(content.type)
                        )}
                      >
                        {content.type.toUpperCase()}
                      </span>
                    </div>
                    <Button
                      onClick={() => handleDeleteContent(content._id)}
                      className="text-muted-foreground hover:text-destructive transition-colors p-2 rounded-lg hover:bg-destructive/10"
                      variant="ghost"
                      size="icon"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <h3 className="font-bold text-foreground mb-4 line-clamp-2 text-lg leading-tight">
                    {content.title}
                  </h3>
                  <a
                    href={content.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary-glow text-sm block mb-6 hover:underline truncate transition-colors duration-200"
                  >
                    {content.link}
                  </a>
                  {content.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {content.tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-muted/30 text-muted-foreground text-xs rounded-lg border border-muted/40"
                        >
                          {tag.title}
                        </span>
                      ))}
                      {content.tags.length > 3 && (
                        <span className="px-3 py-1 bg-primary/20 text-primary text-xs rounded-lg border border-primary/30">
                          +{content.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Floating Chat Button */}
      {!showChat && (
        <div className="fixed bottom-8 right-8 z-50">
          <div className="relative group">
            <Button
              onClick={() => setShowChat(true)}
              className="chat-gradient p-4 rounded-2xl shadow-glow hover:shadow-hover transition-all duration-300 hover:scale-110 animate-pulse-glow"
              size="icon"
            >
              <MessageCircle className="h-7 w-7 text-white" />
            </Button>
            <div className="absolute bottom-full right-0 mb-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-y-0 translate-y-2">
              <div className="glass-card p-4 text-sm text-foreground whitespace-nowrap">
                Chat with your content brain
                <div className="absolute top-full right-6 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-glass-border"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat Sidebar */}
      {showChat && (
        <div
          ref={chatContainerRef}
          className="fixed inset-y-0 right-0 glass-card z-50 flex flex-col border-l border-glass-border"
          style={{ width: chatWidth }}
        >
          {/* Resizer Handle */}
          <div
            className="absolute left-0 top-0 bottom-0 w-1 cursor-ew-resize z-50 bg-primary/50 opacity-0 hover:opacity-100 transition-opacity duration-200"
            onMouseDown={handleMouseDown}
          />
          {/* Chat Header */}
          <div className="chat-gradient p-6 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-white/20 rounded-xl">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">
                  Content Assistant
                </h3>
                <p className="text-white/80 text-sm">
                  Ask anything about your content
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={clearChat}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white/80 hover:text-white"
                title="Clear conversation"
                variant="ghost"
                size="icon"
              >
                <Eraser className="h-5 w-5" />
              </Button>
              <Button
                onClick={() => setShowChat(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white/80 hover:text-white"
                title="Close chat"
                variant="ghost"
                size="icon"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-background/80">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <div className="glass-card p-8">
                  <Brain className="h-16 w-16 text-primary mx-auto mb-4 animate-float" />
                  <h4 className="font-semibold text-foreground mb-2">
                    Ready to Assist
                  </h4>
                  <p className="text-muted-foreground text-sm">
                    Ask me anything about your content!
                  </p>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex",
                    message.sender === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "px-6 py-4 rounded-2xl max-w-[85%] backdrop-blur-xl",
                      message.sender === "user"
                        ? "bg-primary text-primary-foreground rounded-br-lg"
                        : "bg-accent-blue text-white rounded-bl-lg"
                    )}
                  >
                    <p className="text-sm leading-relaxed break-words">
                      {message.text}
                    </p>
                    {message.sender === "bot" &&
                      message.resources &&
                      message.resources.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-white/20">
                          <p className="text-xs font-semibold text-white/90 mb-3">
                            📚 Relevant Resources:
                          </p>
                          <div className="space-y-2">
                            {message.resources.map((resource) => (
                              <a
                                key={resource.id}
                                href={resource.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block p-3 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 transition-all duration-200 text-sm text-white hover:scale-[1.02]"
                              >
                                {resource.title}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              ))
            )}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-background/50 backdrop-blur-xl px-6 py-4 rounded-2xl rounded-bl-lg border border-glass-border">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-primary rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-primary rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatMessagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-6 border-t border-glass-border bg-background/90 backdrop-blur-xl">
            <div className="flex space-x-3">
              <Input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendChatMessage()}
                className="flex-1 px-4 py-3 bg-background/50 border border-glass-border rounded-xl text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary/50 transition-all duration-300"
                placeholder="Ask about your content..."
                disabled={chatLoading}
              />
              <Button
                onClick={sendChatMessage}
                disabled={chatLoading || !chatInput.trim()}
                className="p-3 bg-primary hover:bg-primary-glow text-primary-foreground rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95"
                size="icon"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Content Modal */}
      {showAddModal && (
        <AddContentModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddContent}
        />
      )}
    </div>
  );
}
