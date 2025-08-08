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
exports.AddContentModal = AddContentModal;
const react_1 = __importStar(require("react"));
const lucide_react_1 = require("lucide-react");
const utils_1 = require("../lib/utils");
function AddContentModal({ onClose, onAdd }) {
    const [formData, setFormData] = (0, react_1.useState)({
        link: "",
        title: "",
        type: "article",
        tags: "",
    });
    const [isSubmitting, setIsSubmitting] = (0, react_1.useState)(false);
    const contentTypes = [
        { value: "article", label: "Article", icon: lucide_react_1.FileText },
        { value: "image", label: "Image", icon: lucide_react_1.Image },
        { value: "video", label: "Video", icon: lucide_react_1.Video },
        { value: "audio", label: "Audio", icon: lucide_react_1.Headphones },
    ];
    const handleSubmit = (e) => __awaiter(this, void 0, void 0, function* () {
        e.preventDefault();
        if (!formData.link.trim() || !formData.title.trim())
            return;
        setIsSubmitting(true);
        const contentData = Object.assign(Object.assign({}, formData), { tags: formData.tags
                .split(",")
                .map((tag) => ({ title: tag.trim() }))
                .filter((tag) => tag.title.length > 0) });
        try {
            yield onAdd(contentData);
            onClose();
        }
        catch (error) {
            console.error("Error adding content:", error);
        }
        finally {
            setIsSubmitting(false);
        }
    });
    return (<div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card p-8 w-full max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">
            Add New Content
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-muted/50 rounded-lg transition-colors">
            <lucide_react_1.X className="h-5 w-5"/>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="content-url" className="flex items-center space-x-2 text-sm font-medium text-foreground mb-3">
              <lucide_react_1.Link className="h-4 w-4"/>
              <span>Content URL</span>
            </label>
            <input id="content-url" type="url" value={formData.link} onChange={(e) => setFormData(Object.assign(Object.assign({}, formData), { link: e.target.value }))} placeholder="https://example.com/your-content" className="w-full px-4 py-3 bg-background/50 border border-glass-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-300" required/>
          </div>
          <div>
            <label htmlFor="content-title" className="flex items-center space-x-2 text-sm font-medium text-foreground mb-3">
              <lucide_react_1.Type className="h-4 w-4"/>
              <span>Title</span>
            </label>
            <input id="content-title" type="text" value={formData.title} onChange={(e) => setFormData(Object.assign(Object.assign({}, formData), { title: e.target.value }))} placeholder="Give your content a descriptive title" className="w-full px-4 py-3 bg-background/50 border border-glass-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-300" required/>
          </div>
          <div>
            <label htmlFor="content-type" className="flex items-center space-x-2 text-sm font-medium text-foreground mb-3">
              <span>Content Type</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {contentTypes.map(({ value, label, icon: Icon }) => (<button key={value} type="button" onClick={() => setFormData(Object.assign(Object.assign({}, formData), { type: value }))} className={(0, utils_1.cn)("flex items-center space-x-2 p-3 rounded-lg border transition-all", formData.type === value
                ? "border-primary bg-primary/10 text-primary"
                : "border-border hover:bg-muted/50")}>
                  <Icon className="h-4 w-4"/>
                  <span className="text-sm font-medium">{label}</span>
                </button>))}
            </div>
          </div>
          <div>
            <label htmlFor="content-tags" className="flex items-center space-x-2 text-sm font-medium text-foreground mb-3">
              <lucide_react_1.Tag className="h-4 w-4"/>
              <span>Tags (comma-separated)</span>
            </label>
            <input id="content-tags" type="text" value={formData.tags} onChange={(e) => setFormData(Object.assign(Object.assign({}, formData), { tags: e.target.value }))} placeholder="technology, ai, web development" className="w-full px-4 py-3 bg-background/50 border border-glass-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-300"/>
          </div>
          <div className="flex justify-end space-x-4 pt-6">
            <button type="button" onClick={onClose} className="px-6 py-3 text-muted-foreground hover:text-foreground transition-colors font-medium" disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting || !formData.link.trim() || !formData.title.trim()} className="btn-hero px-8 py-3 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {isSubmitting ? (<div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>) : (<lucide_react_1.Save className="h-5 w-5"/>)}
              <span className="font-semibold">
                {isSubmitting ? "Adding..." : "Add Content"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>);
}
