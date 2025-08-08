"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Router = void 0;
// src/route.ts
const express_1 = __importDefault(require("express"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const schema_js_1 = __importDefault(require("./schema.js"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const middleware_js_1 = require("./middleware.js");
const utils_js_1 = require("./utils.js");
const pinecone_1 = require("@pinecone-database/pinecone");
const axios_1 = __importDefault(require("axios"));
dotenv_1.default.config();
exports.Router = express_1.default.Router();
const RELEVANCE_THRESHOLD = 0.8; // Increased to filter out less relevant matches
const PYTHON_API = process.env.LLM_SERVER_URL;
const pinecone = new pinecone_1.Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
});
function getIndex() {
    return pinecone.index("secondbrain");
}
const vectorService = {
    upsertContent(contentId, title, link, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const index = getIndex();
            const embedResp = yield axios_1.default.post(`${PYTHON_API}/embed`, {
                text: `${title} ${link}`,
            });
            const embedding = embedResp.data;
            yield index.upsert([
                {
                    id: contentId,
                    values: embedding,
                    metadata: { userId, title, link },
                },
            ]);
        });
    },
    deleteContent(contentId) {
        return __awaiter(this, void 0, void 0, function* () {
            const index = getIndex();
            yield index.deleteOne(contentId);
        });
    },
    searchContent(query_1, userId_1) {
        return __awaiter(this, arguments, void 0, function* (query, userId, topK = 3) {
            const index = getIndex();
            const embedResp = yield axios_1.default.post(`${PYTHON_API}/embed`, {
                text: query,
            });
            const embedding = embedResp.data;
            const results = yield index.query({
                vector: embedding,
                topK,
                includeMetadata: true,
                filter: { userId },
            });
            return results.matches.map((m) => ({
                id: m.id,
                title: m.metadata.title,
                link: m.metadata.link,
                score: m.score,
            }));
        });
    },
};
const runLLM = (prompt) => __awaiter(void 0, void 0, void 0, function* () {
    const resp = yield axios_1.default.post(`${PYTHON_API}/llm`, { prompt });
    return resp.data;
});
exports.Router.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).send("Username and password are required");
    }
    else if (username.length < 3 || username.length > 10) {
        return res
            .status(411)
            .send("username must be at least 3 and maximum 10 characters long");
    }
    else if (password.length < 8 || password.length > 20) {
        return res
            .status(411)
            .send("password must be at least 8 and maximum 20 characters long");
    }
    const existingUser = yield schema_js_1.default.userModel.findOne({ username });
    if (existingUser) {
        return res.status(403).send("Username already exists");
    }
    password = yield bcrypt_1.default.hash(password, 10);
    try {
        const user = yield schema_js_1.default.userModel.create({ username, password });
        return res.status(201).json({ message: "User created successfully", user });
    }
    catch (error) {
        return res.status(500).send("Error creating user: " + error.message);
    }
}));
exports.Router.post("/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    try {
        const user = yield schema_js_1.default.userModel.findOne({ username });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const match = yield bcrypt_1.default.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        const token = jsonwebtoken_1.default.sign({ userId: user._id.toString(), username: user.username }, process.env.JWT_SECRET, { expiresIn: "1h" });
        return res.status(200).json({ message: "Login successful", token });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
    }
}));
exports.Router.post("/content", middleware_js_1.authentication, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { link, type, title } = req.body;
    if (!req.userId) {
        return res.status(401).json({ error: "Unauthorized: Missing user ID" });
    }
    try {
        const content = yield schema_js_1.default.contentModel.create({
            link,
            type,
            title,
            userId: req.userId,
            tags: [],
        });
        yield vectorService.upsertContent(content._id.toString(), title, link, req.userId);
        return res.json({ message: "Content added", content });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
    }
}));
exports.Router.get("/content", middleware_js_1.authentication, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.userId) {
        return res.status(401).json({ error: "Unauthorized: Missing user ID" });
    }
    try {
        const contents = yield schema_js_1.default.contentModel
            .find({ userId: req.userId })
            .populate("userId", "username")
            .populate("tags", "title");
        return res.json({ contents });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
    }
}));
exports.Router.delete("/content", middleware_js_1.authentication, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { contentId } = req.body;
    if (!req.userId) {
        return res.status(401).json({ error: "Unauthorized: Missing user ID" });
    }
    if (!contentId) {
        return res.status(400).json({ error: "contentId is required" });
    }
    try {
        const result = yield schema_js_1.default.contentModel.deleteOne({
            _id: contentId,
            userId: req.userId,
        });
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: "Content not found" });
        }
        yield vectorService.deleteContent(contentId);
        return res.json({ message: "Content deleted successfully" });
    }
    catch (err) {
        console.error("Error deleting content:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
}));
exports.Router.post("/brain/share", middleware_js_1.authentication, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { share } = req.body;
    if (!req.userId) {
        return res.status(401).json({ error: "Unauthorized: Missing user ID" });
    }
    if (share) {
        const existingLink = yield schema_js_1.default.linkModel.findOne({ userId: req.userId });
        if (existingLink) {
            return res.json({ hash: existingLink.hash });
        }
        const hash = (0, utils_js_1.random)(10);
        yield schema_js_1.default.linkModel.create({ userId: req.userId, hash });
        return res.json({ hash });
    }
    else {
        yield schema_js_1.default.linkModel.deleteOne({ userId: req.userId });
        return res.json({ message: "Removed link" });
    }
}));
exports.Router.get("/brain/:sharelink", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const hash = req.params.sharelink;
    const link = yield schema_js_1.default.linkModel.findOne({ hash });
    if (!link) {
        return res.status(404).send("Share link not found");
    }
    const content = yield schema_js_1.default.contentModel.find({ userId: link.userId });
    const user = yield schema_js_1.default.userModel.findOne({ _id: link.userId });
    return res.json({
        username: user === null || user === void 0 ? void 0 : user.username,
        content,
    });
}));
exports.Router.post("/chat", middleware_js_1.authentication, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { message } = req.body;
    if (!req.userId)
        return res.status(401).json({ error: "Missing user ID" });
    if (!message)
        return res.status(400).json({ error: "Message is required" });
    try {
        // 1) Check if the query is substantive
        const intentPrompt = `
You are a query classifier. Determine if the following user query is substantive (i.e., requests specific information or details) or non-substantive (e.g., greetings, casual remarks). Return a JSON object with a single key "isSubstantive" set to true or false.

Query: ${message}

Return: {"isSubstantive": <boolean>}
`;
        const intentResult = (yield runLLM(intentPrompt));
        const isSubstantive = intentResult.isSubstantive;
        let relevant = [];
        if (isSubstantive) {
            // 2) Perform semantic search only for substantive queries
            const docs = yield vectorService.searchContent(message, req.userId, 5);
            relevant = docs.filter((d) => d.score >= RELEVANCE_THRESHOLD);
        }
        // 3) Build system prompt
        const systemPrompt = process.env.SYSTEM_PROMPT;
        // 4) Build user prompt
        const resourceText = relevant
            .map((r, i) => `Resource ${i + 1} — ${r.title}: ${r.link}`)
            .join("\n");
        const userPrompt = `
User: ${message}

${relevant.length
            ? `Resources:\n${resourceText}\n\nPlease incorporate these resources into your response where relevant.`
            : ""}

Answer now:
`;
        // 5) Call LLM service
        const fullPrompt = systemPrompt + "\n" + userPrompt;
        const reply = (yield runLLM(fullPrompt));
        // 6) Return reply + resources (empty if none)
        return res.json({ message: reply, resources: relevant });
    }
    catch (err) {
        console.error("Chat error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
}));
