# ❄️ Snowflare Voice Support Agent  
### **AI-Powered Realtime Voice Assistant for Customer Support**

This repository contains a **voice-enabled AI customer support assistant** built using the **OpenAI Realtime API**, WebRTC audio streaming, and server-side tool calling.  
The agent interacts with users through speech, queries internal FAQ knowledge bases, and creates support tickets when needed — all in real time.

---

## 🚀 Key Features

### 🎤 Realtime Voice Interaction
- Live two-way audio via **WebRTC**
- OpenAI Realtime model (`gpt-realtime`)
- Automatic voice activity detection (VAD)
- Instant speech-to-speech responses

### 🧠 Intelligent Tool Calling
The agent uses two backend-connected tools:

#### **1. FAQ Search Tool**
Queries your backend FAQ API at:

```
POST /api/v1/chat
```

Returns summarized answers with source details.

#### **2. Create Ticket Tool**
Creates support tickets by calling:

```
POST /api/tickets
```

The agent:
- Collects customer name & email before creating a ticket  
- Confirms the issue  
- Returns a friendly message with an easy ticket ID  

### 🛡 Secure Architecture
- Uses **Ephemeral Tokens** (secure short-lived OpenAI session keys)
- No permanent OpenAI API keys exposed to frontend  
- Backend-protected API access

---

## 🧩 Project Overview

```
/
│── app/
│   ├── Home.jsx                 # UI + realtime agent session
│   ├── tools/                   # Agent tool definitions (FAQ + ticket)
│   └── server/token.js          # Secure ephemeral key endpoint
│
├── public/                      # Static assets
└── README.md                    # Documentation
```

---

## ⚙️ How the Agent Works

### 🔄 Interaction Flow

```
User speaks
      ↓
Microphone (WebRTC) streams audio
      ↓
OpenAI Realtime Agent interprets voice
      ↓
Agent chooses:
   - Respond directly, OR
   - Use faq_search tool, OR
   - Ask for details + create_ticket
      ↓
Backend APIs return structured data
      ↓
Agent converts output back to voice
      ↓
User hears the response instantly
```

---

## 📦 Installation

### 1️⃣ Clone the repository
```bash
git clone https://github.com/yourusername/snowflare-voice-support-agent
cd snowflare-voice-support-agent
```

### 2️⃣ Install dependencies
```bash
npm install
```

### 3️⃣ Create `.env.local`
```env
OPENAI_API_KEY=your_openai_api_key
```

*(Your backend URLs are defined inside the tools.)*

### 4️⃣ Start the development server
```bash
npm run dev
```

---

## 🧪 Example Conversation

**User:**  
“How do I configure Zoho integration?”

**AI (via faq_search):**  
“You can configure the Zoho integration by going to Settings → Integrations → Zoho and selecting Connect Account.”

---

**User:**  
“It still doesn’t work. Create a ticket.”

**AI:**  
“Sure! Before I create a ticket, can I have your name and email address?”

---

**After details collected:**  
“Your ticket has been created successfully!  
Ticket ID: TKT-482  
We’ll notify you at your email with updates.”

---

## 🧑‍💻 Tech Stack

| Component | Technology |
|----------|-------------|
| AI Engine | OpenAI Realtime API |
| Audio Streaming | WebRTC |
| Frontend | React / Next.js |
| Validation | Zod |
| Backend Tools | Custom APIs |
| Authentication | Ephemeral Tokens |

---

## 📘 Purpose of This Project

This project demonstrates how companies can build:

- Voice-based customer support  
- Intelligent AI agents that call backend APIs  
- Real-time summarization and decision-making  
- Automated ticket creation workflows  

It can be extended for:
- CRM automation  
- Voice chatbots  
- Helpdesk agents  
- Knowledge-base search assistants  

---

## 📝 License
MIT License — feel free to use, modify, and extend.

