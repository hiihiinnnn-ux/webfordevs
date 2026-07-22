import "dotenv/config";
import path from "node:path";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";

const databaseUrl = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
const filePath = databaseUrl.startsWith("file:")
  ? databaseUrl.slice("file:".length)
  : databaseUrl;
const absolutePath = path.isAbsolute(filePath)
  ? filePath
  : path.join(process.cwd(), filePath);

const adapter = new PrismaBetterSqlite3({ url: `file:${absolutePath}` });
const prisma = new PrismaClient({ adapter });

const tools = [
  {
    slug: "ollama",
    name: "Ollama",
    description:
      "The friendliest way to run open models locally with a simple CLI and OpenAI-compatible API.",
    longDescription:
      "Ollama pulls, runs, and serves models on your machine. It exposes a local HTTP API so your apps can talk to Llama, Mistral, Phi, and more without cloud keys.",
    category: "runtime",
    website: "https://ollama.com",
    github: "https://github.com/ollama/ollama",
    tags: "cli,api,openai-compatible,macos,linux,windows",
    installCommand: "curl -fsSL https://ollama.com/install.sh | sh",
    difficulty: "beginner",
    platforms: "macOS,Linux,Windows",
    featured: true,
  },
  {
    slug: "lm-studio",
    name: "LM Studio",
    description:
      "Desktop app for discovering GGUF models, chatting locally, and spinning up a local OpenAI-compatible server.",
    longDescription:
      "LM Studio is ideal when you want a GUI first. Browse Hugging Face models, chat in-app, then expose localhost:1234 for your own tools.",
    category: "desktop",
    website: "https://lmstudio.ai",
    github: null,
    tags: "gui,gguf,openai-compatible,chat",
    installCommand: "Download from https://lmstudio.ai",
    difficulty: "beginner",
    platforms: "macOS,Linux,Windows",
    featured: true,
  },
  {
    slug: "llama-cpp",
    name: "llama.cpp",
    description:
      "High-performance C/C++ inference for GGUF models with broad hardware support.",
    longDescription:
      "The foundation many local tools build on. Excellent for learning quantization, context, and bare-metal inference performance.",
    category: "runtime",
    website: "https://github.com/ggerganov/llama.cpp",
    github: "https://github.com/ggerganov/llama.cpp",
    tags: "gguf,cpu,gpu,metal,cuda,inference",
    installCommand: "git clone https://github.com/ggerganov/llama.cpp && cmake -B build",
    difficulty: "advanced",
    platforms: "macOS,Linux,Windows",
    featured: true,
  },
  {
    slug: "openai-compatible-proxy",
    name: "Local OpenAI Proxy Pattern",
    description:
      "Point SDKs at localhost. Most local runtimes speak the OpenAI chat completions shape.",
    longDescription:
      "Swap baseURL to http://127.0.0.1:11434/v1 (Ollama) or http://127.0.0.1:1234/v1 (LM Studio) and keep using familiar client libraries.",
    category: "integration",
    website: null,
    github: null,
    tags: "api,sdk,openai,integration",
    installCommand: null,
    difficulty: "beginner",
    platforms: "any",
    featured: false,
  },
  {
    slug: "open-webui",
    name: "Open WebUI",
    description:
      "Self-hosted chat UI that connects to Ollama and other OpenAI-compatible backends.",
    longDescription:
      "Gives your local stack a polished ChatGPT-like interface with users, prompts, and document RAG options.",
    category: "ui",
    website: "https://openwebui.com",
    github: "https://github.com/open-webui/open-webui",
    tags: "chat,ui,rag,docker,self-hosted",
    installCommand: "docker run -d -p 3000:8080 --add-host=host.docker.internal:host-gateway ghcr.io/open-webui/open-webui:main",
    difficulty: "intermediate",
    platforms: "Docker,Linux,macOS,Windows",
    featured: true,
  },
  {
    slug: "continue-dev",
    name: "Continue",
    description:
      "Open-source coding assistant that can target local models from VS Code and JetBrains.",
    longDescription:
      "Configure Continue to use Ollama or LM Studio so autocomplete and chat stay on your machine.",
    category: "devtools",
    website: "https://continue.dev",
    github: "https://github.com/continuedev/continue",
    tags: "ide,coding,vscode,jetbrains",
    installCommand: "Install the Continue extension, then set provider to ollama",
    difficulty: "beginner",
    platforms: "VS Code,JetBrains",
    featured: false,
  },
  {
    slug: "anythingllm",
    name: "AnythingLLM",
    description:
      "Desktop/document RAG workspace that can run fully local with private embeddings and chat.",
    longDescription:
      "Drop PDFs and repos into a workspace, embed locally, and query with your preferred local LLM backend.",
    category: "rag",
    website: "https://anythingllm.com",
    github: "https://github.com/Mintplex-Labs/anything-llm",
    tags: "rag,documents,desktop,embeddings",
    installCommand: "Download desktop app or run via Docker",
    difficulty: "intermediate",
    platforms: "macOS,Linux,Windows,Docker",
    featured: false,
  },
  {
    slug: "whisper-cpp",
    name: "whisper.cpp",
    description:
      "Fast local speech-to-text based on OpenAI Whisper, ported to C/C++.",
    longDescription:
      "Transcribe audio offline. Pair with a local LLM for private voice workflows.",
    category: "audio",
    website: "https://github.com/ggerganov/whisper.cpp",
    github: "https://github.com/ggerganov/whisper.cpp",
    tags: "stt,audio,whisper,offline",
    installCommand: "git clone https://github.com/ggerganov/whisper.cpp && make",
    difficulty: "intermediate",
    platforms: "macOS,Linux,Windows",
    featured: false,
  },
  {
    slug: "huggingface-hub",
    name: "Hugging Face Hub + transformers",
    description:
      "Python ecosystem for downloading models, tokenizers, and running inference with accelerate.",
    longDescription:
      "Great when you need research flexibility, fine-tuning, or non-GGUF formats. Heavier than Ollama but more programmable.",
    category: "python",
    website: "https://huggingface.co",
    github: "https://github.com/huggingface/transformers",
    tags: "python,pytorch,hub,fine-tuning",
    installCommand: "pip install transformers accelerate torch",
    difficulty: "advanced",
    platforms: "Linux,macOS,Windows",
    featured: false,
  },
  {
    slug: "vllm",
    name: "vLLM",
    description:
      "High-throughput local/server inference engine with an OpenAI-compatible API for GPU boxes.",
    longDescription:
      "When one laptop chat isn't enough and you want production-grade batching on your own hardware.",
    category: "runtime",
    website: "https://docs.vllm.ai",
    github: "https://github.com/vllm-project/vllm",
    tags: "gpu,throughput,openai-compatible,server",
    installCommand: "pip install vllm",
    difficulty: "advanced",
    platforms: "Linux",
    featured: false,
  },
];

const models = [
  {
    slug: "llama-3-2-3b",
    name: "Llama 3.2 3B",
    description:
      "Small, snappy Meta model that is excellent for learning local tooling on modest machines.",
    family: "Llama",
    sizeParams: "3B",
    quantization: "Q4_K_M",
    license: "Llama 3.2 Community",
    contextLength: 128000,
    tags: "chat,coding-light,fast,beginner",
    ollamaPull: "llama3.2:3b",
    huggingFaceId: "meta-llama/Llama-3.2-3B-Instruct",
    featured: true,
    minRamGb: 8,
  },
  {
    slug: "llama-3-1-8b",
    name: "Llama 3.1 8B",
    description:
      "Balanced general-purpose instruct model for coding helpers, summaries, and agents.",
    family: "Llama",
    sizeParams: "8B",
    quantization: "Q4_K_M",
    license: "Llama 3.1 Community",
    contextLength: 128000,
    tags: "chat,coding,agents,general",
    ollamaPull: "llama3.1:8b",
    huggingFaceId: "meta-llama/Meta-Llama-3.1-8B-Instruct",
    featured: true,
    minRamGb: 12,
  },
  {
    slug: "mistral-7b-instruct",
    name: "Mistral 7B Instruct",
    description:
      "Classic efficient instruct model with strong quality-per-parameter for local setups.",
    family: "Mistral",
    sizeParams: "7B",
    quantization: "Q4_K_M",
    license: "Apache-2.0",
    contextLength: 32768,
    tags: "chat,instruct,apache,efficient",
    ollamaPull: "mistral:7b",
    huggingFaceId: "mistralai/Mistral-7B-Instruct-v0.3",
    featured: true,
    minRamGb: 10,
  },
  {
    slug: "phi-3-mini",
    name: "Phi-3 Mini",
    description:
      "Microsoft's compact model that punches above its size for reasoning and coding on laptops.",
    family: "Phi",
    sizeParams: "3.8B",
    quantization: "Q4_K_M",
    license: "MIT",
    contextLength: 128000,
    tags: "reasoning,coding,small,laptop",
    ollamaPull: "phi3:mini",
    huggingFaceId: "microsoft/Phi-3-mini-4k-instruct",
    featured: true,
    minRamGb: 8,
  },
  {
    slug: "qwen2-5-coder-7b",
    name: "Qwen2.5 Coder 7B",
    description:
      "Code-specialized model popular for local autocomplete and refactor assistants.",
    family: "Qwen",
    sizeParams: "7B",
    quantization: "Q4_K_M",
    license: "Apache-2.0",
    contextLength: 32768,
    tags: "coding,refactor,completion,devtools",
    ollamaPull: "qwen2.5-coder:7b",
    huggingFaceId: "Qwen/Qwen2.5-Coder-7B-Instruct",
    featured: true,
    minRamGb: 10,
  },
  {
    slug: "gemma-2-9b",
    name: "Gemma 2 9B",
    description:
      "Google's open weights model family with solid instruction following for local apps.",
    family: "Gemma",
    sizeParams: "9B",
    quantization: "Q4_K_M",
    license: "Gemma",
    contextLength: 8192,
    tags: "chat,instruct,google",
    ollamaPull: "gemma2:9b",
    huggingFaceId: "google/gemma-2-9b-it",
    featured: false,
    minRamGb: 12,
  },
  {
    slug: "deepseek-coder-v2-lite",
    name: "DeepSeek Coder V2 Lite",
    description:
      "Strong local coding model for generation, explanation, and multi-file reasoning.",
    family: "DeepSeek",
    sizeParams: "16B",
    quantization: "Q4_K_M",
    license: "DeepSeek",
    contextLength: 16384,
    tags: "coding,agents,deepseek",
    ollamaPull: "deepseek-coder-v2:lite",
    huggingFaceId: "deepseek-ai/DeepSeek-Coder-V2-Lite-Instruct",
    featured: false,
    minRamGb: 16,
  },
  {
    slug: "nomic-embed-text",
    name: "nomic-embed-text",
    description:
      "Local embedding model for RAG pipelines, search indexes, and semantic memory.",
    family: "Nomic",
    sizeParams: "137M",
    quantization: null,
    license: "Apache-2.0",
    contextLength: 8192,
    tags: "embeddings,rag,search,vector",
    ollamaPull: "nomic-embed-text",
    huggingFaceId: "nomic-ai/nomic-embed-text-v1.5",
    featured: true,
    minRamGb: 4,
  },
];

const guides = [
  {
    slug: "what-is-local-ai",
    title: "What local AI actually means",
    summary:
      "Inference on your machine, model files you control, and APIs that never leave localhost.",
    level: "beginner",
    sortOrder: 1,
    content: `# What local AI actually means

Local AI means the **weights and inference** run on hardware you control — a laptop GPU, a desktop CPU, or a home server.

You still download models (often from Hugging Face or Ollama's registry), but once they are on disk:

- prompts do not need a cloud API key
- latency is bounded by your machine, not a vendor queue
- you can develop offline
- you choose the tradeoff between quality, speed, and RAM

## Mental model for developers

1. **Model file** — quantized weights (often GGUF) sitting in a folder
2. **Runtime** — Ollama, llama.cpp, LM Studio, vLLM
3. **API surface** — usually OpenAI-shaped HTTP on localhost
4. **Your app** — SDK or fetch calls pointed at that base URL

Ember exists to help you pick tools and models for that stack.`,
  },
  {
    slug: "first-ollama-server",
    title: "Spin up your first local model with Ollama",
    summary:
      "Install Ollama, pull a small model, and hit the local chat API from curl or Node.",
    level: "beginner",
    sortOrder: 2,
    content: `# Spin up your first local model with Ollama

## Install

\`\`\`bash
curl -fsSL https://ollama.com/install.sh | sh
\`\`\`

## Pull and run

\`\`\`bash
ollama pull llama3.2:3b
ollama run llama3.2:3b
\`\`\`

## Call the HTTP API

\`\`\`bash
curl http://localhost:11434/api/chat -d '{
  "model": "llama3.2:3b",
  "messages": [{ "role": "user", "content": "Explain local AI in one paragraph." }],
  "stream": false
}'
\`\`\`

OpenAI-compatible clients can use \`http://localhost:11434/v1\` as \`baseURL\`.`,
  },
  {
    slug: "hardware-and-quantization",
    title: "Hardware, VRAM, and quantization",
    summary:
      "How Q4 vs Q8, parameter count, and context length decide what fits on your machine.",
    level: "intermediate",
    sortOrder: 3,
    content: `# Hardware, VRAM, and quantization

Rough rule of thumb for **Q4** GGUF chat models:

- 3B → comfortable on 8GB machines
- 7–8B → ideally 12–16GB unified/system RAM (or dedicated VRAM)
- 13B+ → desktop/GPU territory for snappy responses

## Quantization

Quantization compresses weights (Q4, Q5, Q8…). Lower bits = smaller + faster, usually a bit less sharp.

## Context length

Long context costs memory. Start with 4k–8k while learning, then raise when your app needs documents.

## Developer tip

Prototype on a tiny model. Promote to a larger coding model only after the prompt + tool loop works.`,
  },
  {
    slug: "wire-local-models-into-apps",
    title: "Wire local models into real apps",
    summary:
      "Point OpenAI SDKs at localhost, add health checks, and keep a cloud fallback if you want one.",
    level: "intermediate",
    sortOrder: 4,
    content: `# Wire local models into real apps

## Pattern

\`\`\`ts
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: "ollama", // ignored locally, required by SDK
  baseURL: "http://127.0.0.1:11434/v1",
});

const completion = await client.chat.completions.create({
  model: "llama3.2:3b",
  messages: [{ role: "user", content: "Write a TypeScript debounce helper." }],
});
\`\`\`

## Production-minded local setups

- health-check \`/api/tags\` or \`/v1/models\` before serving traffic
- pin model names in config
- log tokens/sec and timeouts
- optionally fall back to a hosted model when the laptop is asleep

Local-first does not mean local-only — it means **you control the default path**.`,
  },
  {
    slug: "local-rag-starter",
    title: "Local RAG starter path",
    summary:
      "Embeddings + chunking + a local chat model for private document Q&A.",
    level: "advanced",
    sortOrder: 5,
    content: `# Local RAG starter path

1. Choose an embedding model (\`nomic-embed-text\` via Ollama is a good default)
2. Chunk docs (500–1000 tokens with overlap)
3. Store vectors in SQLite/pgvector/Chroma on disk
4. Retrieve top-k chunks
5. Stuff them into a local chat model with a strict citation prompt

Tools like AnythingLLM and Open WebUI package much of this. Rolling your own teaches the real failure modes: bad chunking, weak retrieval, and hallucinated citations.`,
  },
];

async function main() {
  console.log("Seeding Ember catalog...");

  await prisma.bookmark.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tool.deleteMany();
  await prisma.model.deleteMany();
  await prisma.guide.deleteMany();

  for (const tool of tools) {
    await prisma.tool.create({ data: tool });
  }

  for (const model of models) {
    await prisma.model.create({ data: model });
  }

  for (const guide of guides) {
    await prisma.guide.create({ data: guide });
  }

  const passwordHash = await bcrypt.hash("password123", 12);
  await prisma.user.create({
    data: {
      email: "dev@ember.local",
      name: "Demo Developer",
      bio: "Exploring local inference stacks.",
      passwordHash,
    },
  });

  console.log(
    `Seeded ${tools.length} tools, ${models.length} models, ${guides.length} guides.`,
  );
  console.log("Demo login: dev@ember.local / password123");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
