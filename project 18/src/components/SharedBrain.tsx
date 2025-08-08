"use client";

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Brain,
  LinkIcon,
  Image,
  Video,
  FileText,
  Headphones,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { contentApi } from "../api/content";
import { cn } from "../lib/utils"; // Assuming cn utility is available

// Import shadcn/ui components
import { Card, CardContent } from "@/components/ui/card"; // Using Card for content items

interface Content {
  _id: string;
  link: string;
  type: string;
  title: string;
  tags: any[];
}

interface SharedBrainData {
  usernamer: string;
  content: Content[];
}

export function SharedBrain() {
  const { sharelink } = useParams<{ sharelink: string }>();
  const [brainData, setBrainData] = useState<SharedBrainData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
        return "content-image text-emerald-300";
      case "video":
        return "content-video text-rose-300";
      case "article":
        return "content-article text-blue-300";
      case "audio":
        return "content-audio text-purple-300";
      default:
        return "bg-muted/50 text-muted-foreground border-muted";
    }
  };

  useEffect(() => {
    const fetchSharedBrain = async () => {
      if (!sharelink) return;
      try {
        const response = await contentApi.getSharedBrain(sharelink);
        setBrainData(response);
      } catch (err: any) {
        setError("Brain not found or link has expired");
      } finally {
        setLoading(false);
      }
    };
    fetchSharedBrain();
  }, [sharelink]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="glass-card p-12 flex flex-col items-center space-y-6 max-w-md">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-primary/30 rounded-full animate-spin"></div>
            <div className="absolute top-0 w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <Brain className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-primary animate-pulse" />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Loading Shared Brain
            </h3>
            <p className="text-muted-foreground">
              Retrieving content from the universe...
            </p>
          </div>
        </Card>
      </div>
    );
  }

  if (error || !brainData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="glass-card p-12 flex flex-col items-center space-y-6 max-w-md">
          <Brain className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Brain Not Found
          </h2>
          <p className="text-muted-foreground">{error}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="glass-header sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center h-20">
            <div className="relative">
              <div className="p-3 bg-gradient-hero rounded-2xl shadow-glow">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-amber-400 animate-pulse" />
            </div>
            <div className="ml-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-glow to-accent-blue bg-clip-text text-transparent">
                {brainData.username}'s Brain
              </h1>
              <p className="text-muted-foreground text-sm font-medium">
                Shared content collection
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="mb-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Explore
            <span className="bg-gradient-to-r from-primary-glow to-accent-blue bg-clip-text text-transparent">
              {" "}
              {brainData.usernamer}'s Content
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {brainData.content.length} items shared
          </p>
        </div>

        {brainData.content.length === 0 ? (
          <div className="text-center py-12">
            <Card className="glass-card p-16 max-w-2xl mx-auto">
              <div className="relative mb-8">
                <Brain className="h-24 w-24 text-muted-foreground/50 mx-auto animate-float" />
                <Sparkles className="absolute top-0 right-1/3 h-6 w-6 text-primary animate-pulse" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">
                No content shared yet
              </h3>
              <p className="text-lg text-muted-foreground mb-8">
                This brain is empty for now.
              </p>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {brainData.content.map((content, index) => (
              <Card
                key={content._id}
                className="glass-card p-6 hover-lift hover-glow group relative overflow-hidden"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-0 relative z-10">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-shimmer"></div>
                  <div className="relative z-10">
                    <div className="flex items-center space-x-3 mb-4">
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
                    <h3 className="font-bold text-foreground mb-2 line-clamp-2 text-lg leading-tight">
                      {content.title}
                    </h3>
                    <a
                      href={content.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 text-primary hover:text-primary-glow text-sm font-medium transition-colors hover:underline truncate"
                    >
                      <span className="truncate">Visit Link</span>
                      <ExternalLink className="h-4 w-4 flex-shrink-0" />
                    </a>
                    {content.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {content.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-muted/30 text-muted-foreground text-xs rounded-lg border border-muted/40"
                          >
                            {tag.title}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
