"use strict";
"use client";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginPage = LoginPage;
const react_1 = __importStar(require("react"));
const lucide_react_1 = require("lucide-react");
const AuthContext_1 = require("../context/AuthContext");
const auth_1 = require("../api/auth");
// Import shadcn/ui components
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const label_1 = require("@/components/ui/label");
const card_1 = require("@/components/ui/card"); // Using Card for the main form container
function LoginPage() {
    const [isLogin, setIsLogin] = (0, react_1.useState)(true);
    const [username, setUsername] = (0, react_1.useState)("");
    const [password, setPassword] = (0, react_1.useState)("");
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)("");
    const { login } = (0, AuthContext_1.useAuth)();
    const handleSubmit = (e) => __awaiter(this, void 0, void 0, function* () {
        var _a;
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            if (isLogin) {
                const response = yield auth_1.authApi.signin(username, password);
                login(response.token, username);
            }
            else {
                yield auth_1.authApi.signup(username, password);
                const response = yield auth_1.authApi.signin(username, password);
                login(response.token, username);
            }
        }
        catch (err) {
            setError(((_a = err.response) === null || _a === void 0 ? void 0 : _a.data) || "An error occurred");
        }
        finally {
            setLoading(false);
        }
    });
    return (<div className="min-h-screen bg-background flex items-center justify-center p-4">
      <card_1.Card className="glass-card max-w-md w-full p-8 space-y-6">
        <div className="text-center">
          <div className="flex justify-center mb-4 relative">
            <div className="p-3 bg-gradient-hero rounded-2xl shadow-glow animate-pulse-glow">
              <lucide_react_1.Brain className="h-8 w-8 text-white"/>
            </div>
            <lucide_react_1.Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-amber-400 animate-pulse"/>
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

        {error && (<div className="glass-card p-4 border border-destructive/40 bg-destructive/10">
            <p className="text-destructive text-sm">{error}</p>
          </div>)}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label_1.Label htmlFor="username" className="block text-sm font-medium text-foreground mb-2">
              Username
            </label_1.Label>
            <div className="relative">
              <lucide_react_1.User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground"/>
              <input_1.Input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-background/50 border border-glass-border rounded-xl text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary/50 transition-all duration-300" placeholder="Enter your username" required/>
            </div>
          </div>
          <div>
            <label_1.Label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
              Password
            </label_1.Label>
            <div className="relative">
              <lucide_react_1.Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground"/>
              <input_1.Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-background/50 border border-glass-border rounded-xl text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary/50 transition-all duration-300" placeholder="Enter your password" required/>
            </div>
          </div>
          <button_1.Button type="submit" disabled={loading} className="w-full btn-hero py-3 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? (<div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                {isLogin ? "Signing In..." : "Creating Account..."}
              </div>) : isLogin ? ("Sign In") : ("Create Account")}
          </button_1.Button>
        </form>
        <div className="text-center">
          <button_1.Button onClick={() => {
            setIsLogin(!isLogin);
            setError("");
        }} className="text-primary hover:text-primary-glow font-medium transition-colors" variant="link" // Use shadcn button variant
    >
            {isLogin
            ? "Don't have an account? Sign up"
            : "Already have an account? Sign in"}
          </button_1.Button>
        </div>
      </card_1.Card>
    </div>);
}
