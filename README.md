Cortex AI

A full-stack MERN application augmented with RAG (Retrieval-Augmented Generation), LangGraph agent workflows, containerised with Docker, and deployable on AWS.
The backend is split into a Gateway, multiple microservices (Agent, Auth, Billing, Chat), and a Shared module that relies on Redis.
The frontend is built with React + Vite and styled using Tailwind CSS.

⸻

Tech Stack

Layer Technology
Frontend React, Vite, Tailwind CSS
Backend Node.js, Express (Gateway & Services)
Database MongoDB
Cache Redis (via Docker Compose)
AI / RAG LangGraph, Google Gemini / Groq, Qdrant (vector DB), Tavily, OpenRouter
Payments Razorpay
Storage AWS S3
Auth Firebase Auth
Container Docker, Docker Compose
Cloud AWS (S3, Qdrant Cloud, etc.)

⸻

Architecture

┌─────────────┐
│ Frontend │ (React + Tailwind)
│ :5173 │
└──────┬──────┘
│ HTTP
▼
┌─────────────┐
│ Gateway │ (Express, port 8000)
└──┬──┬──┬──┬─┘
│ │ │ │
▼ ▼ ▼ ▼
┌──────────────────────────────┐
│ Services (each Express) │
│ - Auth (8001) │
│ - Chat (8002) │
│ - Agent (8003) │
│ - Billing (8004) │
└──────┬───────────────────────┘
│
▼
┌─────────────┐ ┌──────────┐
│ Shared │────▶│ Redis │ (Docker)
└─────────────┘ └──────────┘

- The Gateway routes requests to the appropriate service.
- The Agent service handles RAG and LangGraph workflows, using external APIs and vector stores.
- Auth, Chat, Billing are independent microservices.
- Shared contains common utilities and a Redis client that all services can use.
- Frontend communicates exclusively with the Gateway.

⸻

Project Structure

.
├── frontend/ # React + Vite application
├── backend/
│ ├── gateway/ # API Gateway
│ ├── services/
│ │ ├── agent/ # Agent (RAG, LangGraph)
│ │ ├── auth/ # Authentication
│ │ ├── billing/ # Billing & subscriptions
│ │ └── chat/ # Chat service
│ └── shared/ # Shared libraries & Redis client
├── docker-compose.yml # Runs Redis
└── README.md

⸻

Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Docker & Docker Compose
- MongoDB (local or Atlas)
- Firebase project (for auth)

API keys required for:

- Google Gemini / Groq
- Tavily
- OpenRouter
- Unsplash
- Qdrant Cloud
- Razorpay
- AWS (S3)

⸻

Setup Instructions

1. Clone the repository

git clone <your-repo-url>
cd project-name

⸻

2. Environment Variables

Create .env files in each service and frontend directory.

Gateway (backend/gateway/.env)

PORT=8000
REDIS_URL="redis://localhost:6379"
AUTH_SERVICE="http://localhost:8001"
CHAT_SERVICE="http://localhost:8002"
AGENT_SERVICE="http://localhost:8003"
BILLING_SERVICE="http://localhost:8004"
FRONTEND_URL="http://localhost:5173"

Agent (backend/services/agent/.env)

PORT=8003
MONGODB_URL='<YOUR_MONGODB_CONNECTION_STRING>'
GOOGLE_API_KEY='<YOUR_GOOGLE_API_KEY>'
CHAT_SERVICE='http://localhost:8002'
AUTH_SERVICE='http://localhost:8001'
GROQ_API_KEY='<YOUR_GROQ_API_KEY>'
TAVILY_API_KEY='<YOUR_TAVILY_API_KEY>'
GATEWAY_URL='http://localhost:8000'
REDIS_URL="redis://localhost:6379"
OPENROUTER_API_KEY='<YOUR_OPENROUTER_API_KEY>'
AWS_REGION='<YOUR_AWS_REGION>'
AWS_ACCESS_KEY_ID='<YOUR_AWS_ACCESS_KEY>'
AWS_SECRET_ACCESS_KEY='<YOUR_AWS_SECRET_KEY>'
AWS_BUCKET_NAME='<YOUR_S3_BUCKET_NAME>'
UNSPLASH_ACCESS_KEY='<YOUR_UNSPLASH_ACCESS_KEY>'
UNSPLASH_SECRET_KEY='<YOUR_UNSPLASH_SECRET_KEY>'
QDRANT_URL='<YOUR_QDRANT_CLOUD_URL>'
QDRANT_API_KEY='<YOUR_QDRANT_API_KEY>'

Auth (backend/services/auth/.env)

PORT=8001
MONGODB_URL='<YOUR_MONGODB_CONNECTION_STRING>'
FRONTEND_URL="http://localhost:5173"

Billing (backend/services/billing/.env)

PORT=8004
MONGODB_URL='<YOUR_MONGODB_CONNECTION_STRING>'
SERVER_URL="http://localhost:8000"
RAZORPAY_KEY_ID='<YOUR_RAZORPAY_KEY_ID>'
RAZORPAY_KEY_SECRET='<YOUR_RAZORPAY_KEY_SECRET>'

Chat (backend/services/chat/.env)

PORT=8002
MONGODB_URL='<YOUR_MONGODB_CONNECTION_STRING>'

Frontend (frontend/.env)

VITE_FIREBASE_API_KEY='<YOUR_FIREBASE_API_KEY>'
VITE_SERVER_URL="http://localhost:8000"
VITE_RAZORPAY_KEY_ID='<YOUR_RAZORPAY_KEY_ID>'

Do not commit .env files. Add them to .gitignore.

⸻

3. Start Redis

docker-compose up -d

Runs Redis on localhost:6379.

⸻

4. Start Backend Services

Run each service in separate terminals:

# Gateway

cd backend/gateway
npm install
npm run dev

# Auth

cd backend/services/auth
npm install
npm run dev

# Chat

cd backend/services/chat
npm install
npm run dev

# Agent

cd backend/services/agent
npm install
npm run dev

# Billing

cd backend/services/billing
npm install
npm run dev

⸻

5. Start Frontend

cd frontend
npm install
npm run dev

App runs at:

http://localhost:5173

⸻

Usage

- Open the frontend in the browser
- Authenticate via Firebase
- Use the chat interface
- Agent service processes requests using RAG + LangGraph
- Billing handled via Razorpay

⸻

Deployment

- Containerize each service with Docker
- Use AWS ECS or Kubernetes
- Store secrets in AWS Secrets Manager
- Use ALB for Gateway
- Host frontend on S3 + CloudFront

⸻

Contributing

Open an issue before major changes. PRs are accepted.

⸻

License

MIT License
