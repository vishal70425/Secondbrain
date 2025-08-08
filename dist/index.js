"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var db_1 = __importDefault(require("./db"));
var route_1 = require("./route");
var cors_1 = __importDefault(require("cors"));
var dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
var app = (0, express_1.default)();
// CORS first
app.use((0, cors_1.default)({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
}));
// OPTIONS handler for preflight
// app.options("/api/v1/*", cors());
// JSON parser
app.use(express_1.default.json());
(0, db_1.default)();
// Mount your API router on the **path** '/api/v1', not a URL
app.use("/api/v1", route_1.Router);
var port = process.env.PORT || 4000;
app.listen(port, function () {
    console.log("\uD83D\uDE80 Server running on http://localhost:".concat(port, "/api/v1"));
});
