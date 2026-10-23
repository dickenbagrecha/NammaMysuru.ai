import express, { type Express, type NextFunction, type Request, type Response } from "express";
import { chatStorage } from "../chat/storage";
import { model } from "../gemini_client";

// Body parser with 50MB limit for audio payloads
const audioBodyParser = express.json({ limit: "50mb" });

export function registerAudioRoutes(app: Express): void {
  // Get all conversations
  app.get("/api/conversations", async (req: Request, res: Response) => {
    try {
      const conversations = await chatStorage.getAllConversations();
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  // Get single conversation with messages
  app.get("/api/conversations/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
      const conversation = await chatStorage.getConversation(id);
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      const messages = await chatStorage.getMessagesByConversation(id);
      res.json({ ...conversation, messages });
    } catch (error) {
      console.error("Error fetching conversation:", error);
      res.status(500).json({ error: "Failed to fetch conversation" });
    }
  });

  // Create new conversation
  app.post("/api/conversations", async (req: Request, res: Response) => {
    try {
      const { title } = req.body;
      const conversation = await chatStorage.createConversation(title || "New Chat");
      res.status(201).json(conversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      res.status(500).json({ error: "Failed to create conversation" });
    }
  });

  // Delete conversation
  app.delete("/api/conversations/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
      await chatStorage.deleteConversation(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting conversation:", error);
      res.status(500).json({ error: "Failed to delete conversation" });
    }
  });

  // Send voice message and get streaming audio response
  // Auto-detects audio format and converts WebM/MP4/OGG to WAV
  // Uses gpt-4o-mini-transcribe for STT, gpt-audio for voice response
  app.post("/api/conversations/:id/messages", audioBodyParser, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const conversationId = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
      const { audio, content, language = "English" } = req.body;

      if (!audio && content) {
        return next();
      }

      if (!audio && !content) {
        return res.status(400).json({ error: "Audio or text content is required" });
      }

      let userMessage = "";
      let promptParts: any[] = [];

      // Language instruction
      const systemInstruction = `(Please reply in ${language}. Keep the response concise and helpful for a tourist using a chat guide.)`;

      if (audio) {
        // Voice Mode
        const rawBuffer = Buffer.from(audio, "base64");
        const base64Audio = rawBuffer.toString("base64");

        promptParts = [
          { text: "You are NammaMysuru.ai, the official Mysuru Tourism Chatbot, a friendly and knowledgeable AI guide. Listen to the audio and provide an accurate, helpful, and engaging response about Mysuru's tourist attractions, culture, or history. " + systemInstruction },
          { inlineData: { mimeType: "audio/wav", data: base64Audio } }
        ];

        // We don't have the user text transcript yet if we just send audio.
        // For now, we save a placeholder or try to extract it from the model response if we prompted for it.
        // Simplest for now: matches previous behavior.
        userMessage = "[Voice Message]";
      } else {
        // Text Mode
        userMessage = content;
        promptParts = [
          { text: `You are NammaMysuru.ai, the official Mysuru Tourism Chatbot, a knowledgeable, friendly, and highly helpful AI guide to Mysuru (Mysore). Your goal is to provide accurate, engaging, and informative responses about Mysuru's tourist attractions, local culture, history, food, and transportation. Provide clear, concise answers. ${systemInstruction}` },
          { text: userMessage }
        ];
      }

      // Save user message first
      await chatStorage.createMessage(conversationId, "user", userMessage);

      const chat = model.startChat({
        history: [], // We could load history here if needed
      });

      const result = await chat.sendMessageStream(promptParts);

      let fullResponse = "";

      for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) {
          fullResponse += text;
          // Send text chunks to client
          // We use the same 'transcript' event type or a new 'content' type.
          // The client hook `useSendMessage` I wrote earlier expects `data: { content: ... }`
          // BUT the `useVoiceStream` expected `transcript` events.
          // Let's standardise on `content` for the new text hook, and keep `transcript` if we wanted backward compat.
          // given I am rewriting the client hook, I will use `content`.

          res.write(`data: ${JSON.stringify({ content: text })}\n\n`);
        }
      }

      // Save assistant message
      await chatStorage.createMessage(conversationId, "assistant", fullResponse);

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (error) {
      console.error("Error processing message:", error);
      if (res.headersSent) {
        res.write(`data: ${JSON.stringify({ error: "Failed to process message" })}\n\n`);
        res.end();
      } else {
        res.status(500).json({ error: "Failed to process message" });
      }
    }
  });
}
