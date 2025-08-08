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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Router = void 0;
// src/route.ts
var express_1 = __importDefault(require("express"));
var bcrypt_1 = __importDefault(require("bcrypt"));
var schema_js_1 = __importDefault(require("./schema.js"));
var jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
var dotenv_1 = __importDefault(require("dotenv"));
var middleware_js_1 = require("./middleware.js");
var utils_js_1 = require("./utils.js");
var pinecone_1 = require("@pinecone-database/pinecone");
var axios_1 = __importDefault(require("axios"));
dotenv_1.default.config();
exports.Router = express_1.default.Router();
var RELEVANCE_THRESHOLD = 0.8; // Increased to filter out less relevant matches
var PYTHON_API = process.env.LLM_SERVER_URL;
var pinecone = new pinecone_1.Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
});
function getIndex() {
    return pinecone.index("secondbrain");
}
var vectorService = {
    upsertContent: function (contentId, title, link, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var index, embedResp, embedding;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        index = getIndex();
                        return [4 /*yield*/, axios_1.default.post("".concat(PYTHON_API, "/embed"), {
                                text: "".concat(title, " ").concat(link),
                            })];
                    case 1:
                        embedResp = _a.sent();
                        embedding = embedResp.data;
                        return [4 /*yield*/, index.upsert([
                                {
                                    id: contentId,
                                    values: embedding,
                                    metadata: { userId: userId, title: title, link: link },
                                },
                            ])];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    },
    deleteContent: function (contentId) {
        return __awaiter(this, void 0, void 0, function () {
            var index;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        index = getIndex();
                        return [4 /*yield*/, index.deleteOne(contentId)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    },
    searchContent: function (query_1, userId_1) {
        return __awaiter(this, arguments, void 0, function (query, userId, topK) {
            var index, embedResp, embedding, results;
            if (topK === void 0) { topK = 3; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        index = getIndex();
                        return [4 /*yield*/, axios_1.default.post("".concat(PYTHON_API, "/embed"), {
                                text: query,
                            })];
                    case 1:
                        embedResp = _a.sent();
                        embedding = embedResp.data;
                        return [4 /*yield*/, index.query({
                                vector: embedding,
                                topK: topK,
                                includeMetadata: true,
                                filter: { userId: userId },
                            })];
                    case 2:
                        results = _a.sent();
                        return [2 /*return*/, results.matches.map(function (m) { return ({
                                id: m.id,
                                title: m.metadata.title,
                                link: m.metadata.link,
                                score: m.score,
                            }); })];
                }
            });
        });
    },
};
var runLLM = function (prompt) { return __awaiter(void 0, void 0, void 0, function () {
    var resp;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, axios_1.default.post("".concat(PYTHON_API, "/llm"), { prompt: prompt })];
            case 1:
                resp = _a.sent();
                return [2 /*return*/, resp.data];
        }
    });
}); };
exports.Router.post("/signup", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, username, password, existingUser, user, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, username = _a.username, password = _a.password;
                if (!username || !password) {
                    return [2 /*return*/, res.status(400).send("Username and password are required")];
                }
                else if (username.length < 3 || username.length > 10) {
                    return [2 /*return*/, res
                            .status(411)
                            .send("username must be at least 3 and maximum 10 characters long")];
                }
                else if (password.length < 8 || password.length > 20) {
                    return [2 /*return*/, res
                            .status(411)
                            .send("password must be at least 8 and maximum 20 characters long")];
                }
                return [4 /*yield*/, schema_js_1.default.userModel.findOne({ username: username })];
            case 1:
                existingUser = _b.sent();
                if (existingUser) {
                    return [2 /*return*/, res.status(403).send("Username already exists")];
                }
                return [4 /*yield*/, bcrypt_1.default.hash(password, 10)];
            case 2:
                password = _b.sent();
                _b.label = 3;
            case 3:
                _b.trys.push([3, 5, , 6]);
                return [4 /*yield*/, schema_js_1.default.userModel.create({ username: username, password: password })];
            case 4:
                user = _b.sent();
                return [2 /*return*/, res.status(201).json({ message: "User created successfully", user: user })];
            case 5:
                error_1 = _b.sent();
                return [2 /*return*/, res.status(500).send("Error creating user: " + error_1.message)];
            case 6: return [2 /*return*/];
        }
    });
}); });
exports.Router.post("/signin", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, username, password, user, match, token, err_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, username = _a.username, password = _a.password;
                _b.label = 1;
            case 1:
                _b.trys.push([1, 4, , 5]);
                return [4 /*yield*/, schema_js_1.default.userModel.findOne({ username: username })];
            case 2:
                user = _b.sent();
                if (!user) {
                    return [2 /*return*/, res.status(404).json({ error: "User not found" })];
                }
                return [4 /*yield*/, bcrypt_1.default.compare(password, user.password)];
            case 3:
                match = _b.sent();
                if (!match) {
                    return [2 /*return*/, res.status(401).json({ error: "Invalid credentials" })];
                }
                token = jsonwebtoken_1.default.sign({ userId: user._id.toString(), username: user.username }, process.env.JWT_SECRET, { expiresIn: "1h" });
                return [2 /*return*/, res.status(200).json({ message: "Login successful", token: token })];
            case 4:
                err_1 = _b.sent();
                console.error(err_1);
                return [2 /*return*/, res.status(500).json({ error: "Internal server error" })];
            case 5: return [2 /*return*/];
        }
    });
}); });
exports.Router.post("/content", middleware_js_1.authentication, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, link, type, title, content, err_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, link = _a.link, type = _a.type, title = _a.title;
                if (!req.userId) {
                    return [2 /*return*/, res.status(401).json({ error: "Unauthorized: Missing user ID" })];
                }
                _b.label = 1;
            case 1:
                _b.trys.push([1, 4, , 5]);
                return [4 /*yield*/, schema_js_1.default.contentModel.create({
                        link: link,
                        type: type,
                        title: title,
                        userId: req.userId,
                        tags: [],
                    })];
            case 2:
                content = _b.sent();
                return [4 /*yield*/, vectorService.upsertContent(content._id.toString(), title, link, req.userId)];
            case 3:
                _b.sent();
                return [2 /*return*/, res.json({ message: "Content added", content: content })];
            case 4:
                err_2 = _b.sent();
                console.error(err_2);
                return [2 /*return*/, res.status(500).json({ error: "Internal server error" })];
            case 5: return [2 /*return*/];
        }
    });
}); });
exports.Router.get("/content", middleware_js_1.authentication, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var contents, err_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!req.userId) {
                    return [2 /*return*/, res.status(401).json({ error: "Unauthorized: Missing user ID" })];
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, schema_js_1.default.contentModel
                        .find({ userId: req.userId })
                        .populate("userId", "username")
                        .populate("tags", "title")];
            case 2:
                contents = _a.sent();
                return [2 /*return*/, res.json({ contents: contents })];
            case 3:
                err_3 = _a.sent();
                console.error(err_3);
                return [2 /*return*/, res.status(500).json({ error: "Internal server error" })];
            case 4: return [2 /*return*/];
        }
    });
}); });
exports.Router.delete("/content", middleware_js_1.authentication, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var contentId, result, err_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                contentId = req.body.contentId;
                if (!req.userId) {
                    return [2 /*return*/, res.status(401).json({ error: "Unauthorized: Missing user ID" })];
                }
                if (!contentId) {
                    return [2 /*return*/, res.status(400).json({ error: "contentId is required" })];
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 4, , 5]);
                return [4 /*yield*/, schema_js_1.default.contentModel.deleteOne({
                        _id: contentId,
                        userId: req.userId,
                    })];
            case 2:
                result = _a.sent();
                if (result.deletedCount === 0) {
                    return [2 /*return*/, res.status(404).json({ error: "Content not found" })];
                }
                return [4 /*yield*/, vectorService.deleteContent(contentId)];
            case 3:
                _a.sent();
                return [2 /*return*/, res.json({ message: "Content deleted successfully" })];
            case 4:
                err_4 = _a.sent();
                console.error("Error deleting content:", err_4);
                return [2 /*return*/, res.status(500).json({ error: "Internal server error" })];
            case 5: return [2 /*return*/];
        }
    });
}); });
exports.Router.post("/brain/share", middleware_js_1.authentication, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var share, existingLink, hash;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                share = req.body.share;
                if (!req.userId) {
                    return [2 /*return*/, res.status(401).json({ error: "Unauthorized: Missing user ID" })];
                }
                if (!share) return [3 /*break*/, 3];
                return [4 /*yield*/, schema_js_1.default.linkModel.findOne({ userId: req.userId })];
            case 1:
                existingLink = _a.sent();
                if (existingLink) {
                    return [2 /*return*/, res.json({ hash: existingLink.hash })];
                }
                hash = (0, utils_js_1.random)(10);
                return [4 /*yield*/, schema_js_1.default.linkModel.create({ userId: req.userId, hash: hash })];
            case 2:
                _a.sent();
                return [2 /*return*/, res.json({ hash: hash })];
            case 3: return [4 /*yield*/, schema_js_1.default.linkModel.deleteOne({ userId: req.userId })];
            case 4:
                _a.sent();
                return [2 /*return*/, res.json({ message: "Removed link" })];
        }
    });
}); });
exports.Router.get("/brain/:sharelink", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var hash, link, content, user;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                hash = req.params.sharelink;
                return [4 /*yield*/, schema_js_1.default.linkModel.findOne({ hash: hash })];
            case 1:
                link = _a.sent();
                if (!link) {
                    return [2 /*return*/, res.status(404).send("Share link not found")];
                }
                return [4 /*yield*/, schema_js_1.default.contentModel.find({ userId: link.userId })];
            case 2:
                content = _a.sent();
                return [4 /*yield*/, schema_js_1.default.userModel.findOne({ _id: link.userId })];
            case 3:
                user = _a.sent();
                return [2 /*return*/, res.json({
                        username: user === null || user === void 0 ? void 0 : user.username,
                        content: content,
                    })];
        }
    });
}); });
exports.Router.post("/chat", middleware_js_1.authentication, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var message, intentPrompt, intentResult, isSubstantive, relevant, docs, systemPrompt, resourceText, userPrompt, fullPrompt, reply, err_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                message = req.body.message;
                if (!req.userId)
                    return [2 /*return*/, res.status(401).json({ error: "Missing user ID" })];
                if (!message)
                    return [2 /*return*/, res.status(400).json({ error: "Message is required" })];
                _a.label = 1;
            case 1:
                _a.trys.push([1, 6, , 7]);
                intentPrompt = "\nYou are a query classifier. Determine if the following user query is substantive (i.e., requests specific information or details) or non-substantive (e.g., greetings, casual remarks). Return a JSON object with a single key \"isSubstantive\" set to true or false.\n\nQuery: ".concat(message, "\n\nReturn: {\"isSubstantive\": <boolean>}\n");
                return [4 /*yield*/, runLLM(intentPrompt)];
            case 2:
                intentResult = (_a.sent());
                isSubstantive = intentResult.isSubstantive;
                relevant = [];
                if (!isSubstantive) return [3 /*break*/, 4];
                return [4 /*yield*/, vectorService.searchContent(message, req.userId, 5)];
            case 3:
                docs = _a.sent();
                relevant = docs.filter(function (d) { return d.score >= RELEVANCE_THRESHOLD; });
                _a.label = 4;
            case 4:
                systemPrompt = process.env.SYSTEM_PROMPT;
                resourceText = relevant
                    .map(function (r, i) { return "Resource ".concat(i + 1, " \u2014 ").concat(r.title, ": ").concat(r.link); })
                    .join("\n");
                userPrompt = "\nUser: ".concat(message, "\n\n").concat(relevant.length
                    ? "Resources:\n".concat(resourceText, "\n\nPlease incorporate these resources into your response where relevant.")
                    : "", "\n\nAnswer now:\n");
                fullPrompt = systemPrompt + "\n" + userPrompt;
                return [4 /*yield*/, runLLM(fullPrompt)];
            case 5:
                reply = (_a.sent());
                // 6) Return reply + resources (empty if none)
                return [2 /*return*/, res.json({ message: reply, resources: relevant })];
            case 6:
                err_5 = _a.sent();
                console.error("Chat error:", err_5);
                return [2 /*return*/, res.status(500).json({ error: "Internal server error" })];
            case 7: return [2 /*return*/];
        }
    });
}); });
