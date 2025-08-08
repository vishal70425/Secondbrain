"use client";

import React, { useState } from "react";
import {
  X,
  Link,
  Type,
  Tag,
  Save,
  Image,
  Video,
  FileText,
  Headphones,
} from "lucide-react";
import { cn } from "../lib/utils";

interface AddContentModalProps {
  onClose: () => void;
  onAdd: (content: {
    link: string;
    type: string;
    title: string;
    tags: { title: string }[];
  }) => void;
}

export function AddContentModal({ onClose, onAdd }: AddContentModalProps) {
  const [formData, setFormData] = useState({
    link: "",
    title: "",
    type: "article",
    tags: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const contentTypes = [
    { value: "article", label: "Article", icon: FileText },
    { value: "image", label: "Image", icon: Image },
    { value: "video", label: "Video", icon: Video },
    { value: "audio", label: "Audio", icon: Headphones },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.link.trim() || !formData.title.trim()) return;
    setIsSubmitting(true);

    const contentData = {
      ...formData,
      tags: formData.tags
        .split(",")
        .map((tag) => ({ title: tag.trim() }))
        .filter((tag) => tag.title.length > 0),
    };
    try {
      await onAdd(contentData);
      onClose();
    } catch (error) {
      console.error("Error adding content:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card p-8 w-full max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">
            Add New Content
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted/50 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="content-url"
              className="flex items-center space-x-2 text-sm font-medium text-foreground mb-3"
            >
              <Link className="h-4 w-4" />
              <span>Content URL</span>
            </label>
            <input
              id="content-url"
              type="url"
              value={formData.link}
              onChange={(e) =>
                setFormData({ ...formData, link: e.target.value })
              }
              placeholder="https://example.com/your-content"
              className="w-full px-4 py-3 bg-background/50 border border-glass-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-300"
              required
            />
          </div>
          <div>
            <label
              htmlFor="content-title"
              className="flex items-center space-x-2 text-sm font-medium text-foreground mb-3"
            >
              <Type className="h-4 w-4" />
              <span>Title</span>
            </label>
            <input
              id="content-title"
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Give your content a descriptive title"
              className="w-full px-4 py-3 bg-background/50 border border-glass-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-300"
              required
            />
          </div>
          <div>
            <label
              htmlFor="content-type"
              className="flex items-center space-x-2 text-sm font-medium text-foreground mb-3"
            >
              <span>Content Type</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {contentTypes.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFormData({ ...formData, type: value })}
                  className={cn(
                    "flex items-center space-x-2 p-3 rounded-lg border transition-all",
                    formData.type === value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:bg-muted/50"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label
              htmlFor="content-tags"
              className="flex items-center space-x-2 text-sm font-medium text-foreground mb-3"
            >
              <Tag className="h-4 w-4" />
              <span>Tags (comma-separated)</span>
            </label>
            <input
              id="content-tags"
              type="text"
              value={formData.tags}
              onChange={(e) =>
                setFormData({ ...formData, tags: e.target.value })
              }
              placeholder="technology, ai, web development"
              className="w-full px-4 py-3 bg-background/50 border border-glass-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-300"
            />
          </div>
          <div className="flex justify-end space-x-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-muted-foreground hover:text-foreground transition-colors font-medium"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                isSubmitting || !formData.link.trim() || !formData.title.trim()
              }
              className="btn-hero px-8 py-3 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="h-5 w-5" />
              )}
              <span className="font-semibold">
                {isSubmitting ? "Adding..." : "Add Content"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
