"use client";

import { useRef, useState } from "react";
import { RealtimeAgent, RealtimeSession, RealtimeItem, tool } from "@openai/agents-realtime";
import { getSessionToken } from './server/token';
import { z } from "zod";

const faq_search = tool({
  name: "faq_search",
  description: `A search tool that queries SupportGuru AI (/api/v1/chat) endpoint to fetch responses from FAQ knowledge base and returns summarized answers with source file and page info.`,
  parameters: z.object({
    query: z.string(),
  }),
  execute: async ({ query }: { query: string }) => {
    try {
      const response = await fetch("http://54.241.251.193:5001/api/v1/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: query,
          tenant_id: "tenant_aigentics_ai_1760527018074",
          user_id: "anonymous",
          context: {
            additionalProp1: {},
          }
        }),
      });

      const data = await response.json();
      console.log("🧠 Snowflare Backend Response:", data);

      return data.response || JSON.stringify(data, null, 2);

    } catch (error: any) {
      console.error("faq_search error:", error)
      return "Unable to reach snowflare API endpoint Right now!!...Something Went Wrong";
    }
  },
});


const create_ticket = tool({
  name: "create_ticket",
  description:
    "Create a new support ticket by calling the backend API. Use this when the user reports a problem or wants help. Always collect customer name and email before creating the ticket.",
  parameters: z.object({
    issue_description: z.string(),
    customer_name: z.string(),
    customer_email: z.string(),
    priority: z.enum(["low", "medium", "high"]).optional(),
  }),

  execute: async ({
    issue_description,
    customer_name,
    customer_email,
    priority = "medium",
  }: {
    issue_description: string;
    customer_name: string;
    customer_email: string;
    priority?: "low" | "medium" | "high";
  }) => {
    try {
      // ✅ Small readable ticket ID
      const ticketId = `TKT-${Math.floor(100 + Math.random() * 900)}`;

      const body = {
        title: issue_description.substring(0, 100),
        description: issue_description,
        priority: priority,
        channel: "voice_assistant",
        customer_email: customer_email,
        customer_name: customer_name,
      };

      console.log("🎫 Creating ticket with body:", body);

      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      console.log("🎫 Ticket API Response Status:", response.status);

      const data = await response.json();
      console.log("🎫 Ticket Created:", data);

      if (!response.ok) {
        return `❌ Unable to create ticket. Server responded with ${response.status}.`;
      }

      // ✅ Backend will generate real ticket ID, but we return a small one for user clarity
      return `✅ Your ticket has been created successfully, ${customer_name}!

Ticket ID: ${ticketId}
Priority: ${priority}
We'll send updates to: ${customer_email}

Our team will get back to you shortly.`;

    } catch (err: any) {
      console.error("Ticket Creation Error:", err);
      return `❌ Failed to create ticket: ${err.message}`;
    }
  }
});


const agent = new RealtimeAgent({
  name: "Snowflare Voice assistant",
  instructions: `You are a customer support voice AI assisatnt for Snowflare company. Keep ALL responses short (1-2 sentences only).

  ### TOOL USUAGE RULES
  1. For ANY informational question (policies, product info, procedures, how-to questions)
     -> ALWAYS use the faq_search tool first.

  2. DO NOT create a ticket immediately when a user describes a problem.
  ALWAYS collect the following information BEFORE creating a ticket:
  - Customer full name (REQUIRED)
  - Customer email address (REQUIRED)
  - A clear description of the issue

  3. ONLY use create_ticket when:
  - The user explicitly says "create a ticket", OR
  - The FAQ search doesnot solve the issue AND the user agrees to open a ticket.
  - AND you have collected their name and email address.

  4. Before creating a ticket, ALWAYS ask:
  "Would you like me to create a support ticket for you?"

  5. If the user agrees, then ask for their name and email if you haven't collected them yet.

  ### CONVERSATIONAL BEHAVIOUR
  - Be friendly, patient, and conversational.
  - If a user reports an issue, first try to understand the problem.
  - If needed, ask follow-up questions before creating a ticket.
  - If they ask a question, NEVER answer from your own knowledge-ALWAYS call faq_search.
  - When creating a ticket, summarize the issue back to them and confirm details.

  ### AFTER TICKET CREATION
  - Provide the generated ticket ID.
  - Provide a short status/update response.
  - DO NOT escalate unless backend indicates escalation.

  Your top priority is to use tools correctly, collect customer information, and avoid unnecessary ticket creation.
  `,
  tools: [faq_search, create_ticket],
});

export default function Home() {
  const session = useRef<RealtimeSession | null>(null);
  const [connected, setConnected] = useState(false);
  const [history, setHistory] = useState<RealtimeItem[]>([]);

  async function onConnect() {
    if (connected) {
      await session.current?.close();
      setConnected(false);
      return;
    }

    try {
      console.log("🎟 Requesting ephemeral key...");
      const ephemeralKey = await getSessionToken(); // ✅ secure server call

      if (!ephemeralKey) throw new Error("No ephemeral key returned.");

      console.log("🔑 Got ephemeral key:", ephemeralKey.substring(0, 10) + "...");

      session.current = new RealtimeSession(agent, {
        model: "gpt-realtime",
        config: {
          outputModalities: ["audio"],
          audio: {
            input: {
              turnDetection: {
                type: "server_vad",
                threshold: 0.5,
                prefix_padding_ms: 300,
                silence_duration_ms: 500,
              }
            }
          }
        },
      });

      session.current.on("transport_event", (event) => {
        console.log(event);
      })

      session.current.on("history_updated", (history) => {
        console.log(history);
        setHistory(history);
      })

      await session.current.connect({
        apiKey: ephemeralKey, // ✅ ephemeral, not your permanent key
      });

      console.log("✅ Connected successfully!");
      setConnected(true);

      // Trigger the agent to greet the user first
      session.current.sendMessage("Hello");
    } catch (error) {
      console.error("Connection error:", error);
      alert("Failed to connect: " + error);
    }
  }

  return (
    <div
      className="min-h-screen p-8"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1746982088021-8cbabc0667e2?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1173')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-orange-400 mb-2 drop-shadow-lg">Snowflare Technical Agent</h1>
        <p className="text-black-500 text-sm drop-shadow">OpenAI Realtime Sessions • WebRTC • Speech-to-Speech</p>
      </div>

      <button
        onClick={onConnect}
        className="bg-black text-white p-2 rounded-md hover:bg-gray-800 cursor-pointer mb-6"
      >
        {connected ? "Disconnect" : "Connect"}
      </button>

      <ul>
        {history
          .filter((item) => item.type === "message")
          .map((item) => {
            const audioContent = item.content?.find(
              (c) => c.type === "input_audio" || c.type === "output_audio"
            );
            const transcript = audioContent?.transcript || "";

            return (
              <li key={item.itemId}>
                {item.role}: {transcript}
              </li>
            );
          })}
      </ul>
    </div>
  );
}
