// src/route.ts
import express from "express";
import bcrypt from "bcrypt";
import Models from "./schema.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { authentication } from "./middleware.js";
import { random } from "./utils.js";
import { Pinecone } from "@pinecone-database/pinecone";
import axios from "axios";

dotenv.config();
export const Router = express.Router();
const RELEVANCE_THRESHOLD = 0.8; // Increased to filter out less relevant matches

type Resource = { id: string; title: string; link: string; score: number };

const PYTHON_API = process.env.LLM_SERVER_URL!;

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

function getIndex() {
  return pinecone.index("secondbrain");
}

const vectorService = {
  async upsertContent(
    contentId: string,
    title: string,
    link: string,
    userId: string
  ) {
    const index = getIndex();
    const embedResp = await axios.post<number[]>(`${PYTHON_API}/embed`, {
      text: `${title} ${link}`,
    });
    const embedding = embedResp.data;
    await index.upsert([
      {
        id: contentId,
        values: embedding,
        metadata: { userId, title, link },
      },
    ]);
  },

  async deleteContent(contentId: string) {
    const index = getIndex();
    await index.deleteOne(contentId);
  },

  async searchContent(
    query: string,
    userId: string,
    topK = 3
  ): Promise<Resource[]> {
    const index = getIndex();
    const embedResp = await axios.post<number[]>(`${PYTHON_API}/embed`, {
      text: query,
    });
    const embedding = embedResp.data;
    const results = await index.query({
      vector: embedding,
      topK,
      includeMetadata: true,
      filter: { userId },
    });
    return results.matches.map((m: any) => ({
      id: m.id,
      title: m.metadata.title,
      link: m.metadata.link,
      score: m.score,
    }));
  },
};

const runLLM = async (
  prompt: string
): Promise<string | { isSubstantive: boolean }> => {
  const resp = await axios.post<string | { isSubstantive: boolean }>(
    `${PYTHON_API}/llm`,
    { prompt }
  );
  return resp.data;
};

Router.post("/signup", async (req, res) => {
  let { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).send("Username and password are required");
  } else if (username.length < 3 || username.length > 10) {
    return res
      .status(411)
      .send("username must be at least 3 and maximum 10 characters long");
  } else if (password.length < 8 || password.length > 20) {
    return res
      .status(411)
      .send("password must be at least 8 and maximum 20 characters long");
  }

  const existingUser = await Models.userModel.findOne({ username });
  if (existingUser) {
    return res.status(403).send("Username already exists");
  }

  password = await bcrypt.hash(password, 10);
  try {
    const user = await Models.userModel.create({ username, password });
    return res.status(201).json({ message: "User created successfully", user });
  } catch (error: any) {
    return res.status(500).send("Error creating user: " + error.message);
  }
});

Router.post("/signin", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await Models.userModel.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign(
      { userId: user._id.toString(), username: user.username },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );
    return res.status(200).json({ message: "Login successful", token });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

Router.post("/content", authentication, async (req, res) => {
  const { link, type, title } = req.body;
  if (!req.userId) {
    return res.status(401).json({ error: "Unauthorized: Missing user ID" });
  }
  try {
    const content = await Models.contentModel.create({
      link,
      type,
      title,
      userId: req.userId,
      tags: [],
    });
    await vectorService.upsertContent(
      content._id.toString(),
      title,
      link,
      req.userId
    );
    return res.json({ message: "Content added", content });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

Router.get("/content", authentication, async (req, res) => {
  if (!req.userId) {
    return res.status(401).json({ error: "Unauthorized: Missing user ID" });
  }
  try {
    const contents = await Models.contentModel
      .find({ userId: req.userId })
      .populate("userId", "username")
      .populate("tags", "title");
    return res.json({ contents });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

Router.delete("/content", authentication, async (req, res) => {
  const { contentId } = req.body;
  if (!req.userId) {
    return res.status(401).json({ error: "Unauthorized: Missing user ID" });
  }
  if (!contentId) {
    return res.status(400).json({ error: "contentId is required" });
  }
  try {
    const result = await Models.contentModel.deleteOne({
      _id: contentId,
      userId: req.userId,
    });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Content not found" });
    }
    await vectorService.deleteContent(contentId);
    return res.json({ message: "Content deleted successfully" });
  } catch (err: any) {
    console.error("Error deleting content:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

Router.post("/brain/share", authentication, async (req, res) => {
  const { share } = req.body;
  if (!req.userId) {
    return res.status(401).json({ error: "Unauthorized: Missing user ID" });
  }
  if (share) {
    const existingLink = await Models.linkModel.findOne({ userId: req.userId });
    if (existingLink) {
      return res.json({ hash: existingLink.hash });
    }
    const hash = random(10);
    await Models.linkModel.create({ userId: req.userId, hash });
    return res.json({ hash });
  } else {
    await Models.linkModel.deleteOne({ userId: req.userId });
    return res.json({ message: "Removed link" });
  }
});

Router.get("/brain/:sharelink", async (req, res) => {
  const hash = req.params.sharelink;
  const link = await Models.linkModel.findOne({ hash });
  if (!link) {
    return res.status(404).send("Share link not found");
  }
  const content = await Models.contentModel.find({ userId: link.userId });
  const user = await Models.userModel.findOne({ _id: link.userId });
  return res.json({
    username: user?.username,
    content,
  });
});

Router.post("/chat", authentication, async (req, res) => {
  const { message } = req.body;
  if (!req.userId) return res.status(401).json({ error: "Missing user ID" });
  if (!message) return res.status(400).json({ error: "Message is required" });

  try {
    // 1) Check if the query is substantive
    const intentPrompt = `
You are a query classifier. Determine if the following user query is substantive (i.e., requests specific information or details) or non-substantive (e.g., greetings, casual remarks). Return a JSON object with a single key "isSubstantive" set to true or false.

Query: ${message}

Return: {"isSubstantive": <boolean>}
`;
    const intentResult = (await runLLM(intentPrompt)) as {
      isSubstantive: boolean;
    };
    const isSubstantive = intentResult.isSubstantive;

    let relevant: Resource[] = [];
    if (isSubstantive) {
      // 2) Perform semantic search only for substantive queries
      const docs = await vectorService.searchContent(message, req.userId, 5);
      relevant = docs.filter((d) => d.score >= RELEVANCE_THRESHOLD);
    }

    // 3) Build system prompt
    const systemPrompt = process.env.SYSTEM_PROMPT!;

    // 4) Build user prompt
    const resourceText = relevant
      .map((r, i) => `Resource ${i + 1} — ${r.title}: ${r.link}`)
      .join("\n");
    const userPrompt = `
User: ${message}

${
  relevant.length
    ? `Resources:\n${resourceText}\n\nPlease incorporate these resources into your response where relevant.`
    : ""
}

Answer now:
`;

    // 5) Call LLM service
    const fullPrompt = systemPrompt + "\n" + userPrompt;
    const reply = (await runLLM(fullPrompt)) as string;

    // 6) Return reply + resources (empty if none)
    return res.json({ message: reply, resources: relevant });
  } catch (err: any) {
    console.error("Chat error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});
