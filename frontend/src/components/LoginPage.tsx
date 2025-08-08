"use client";

import React, { useState } from "react";
import { Brain, Lock, User, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { authApi } from "../api/auth";

// Import shadcn/ui components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card"; // Using Card for the main form container

export function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (isLogin) {
        const response = await authApi.signin(username, password);
        login(response.token, username);
      } else {
        await authApi.signup(username, password);
        const response = await authApi.signin(username, password);
        login(response.token, username);
      }
    } catch (err: any) {
      setError(err.response?.data || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="glass-card max-w-md w-full p-8 space-y-6">
        <div className="text-center">
          <div className="flex justify-center mb-4 relative">
            <div className="p-3 bg-gradient-hero rounded-2xl shadow-glow animate-pulse-glow">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-amber-400 animate-pulse" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="text-muted-foreground">
            {isLogin
              ? "Sign in to your brain"
              : "Start organizing your content"}
          </p>
        </div>

        {error && (
          <div className="glass-card p-4 border border-destructive/40 bg-destructive/10">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label
              htmlFor="username"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Username
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-background/50 border border-glass-border rounded-xl text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary/50 transition-all duration-300"
                placeholder="Enter your username"
                required
              />
            </div>
          </div>
          <div>
            <Label
              htmlFor="password"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-background/50 border border-glass-border rounded-xl text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary/50 transition-all duration-300"
                placeholder="Enter your password"
                required
              />
            </div>
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full btn-hero py-3 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                {isLogin ? "Signing In..." : "Creating Account..."}
              </div>
            ) : isLogin ? (
              "Sign In"
            ) : (
              "Create Account"
            )}
          </Button>
        </form>
        <div className="text-center">
          <Button
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
            }}
            className="text-primary hover:text-primary-glow font-medium transition-colors"
            variant="link" // Use shadcn button variant
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : "Already have an account? Sign in"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
