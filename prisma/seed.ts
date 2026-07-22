import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

const models = [
  {
    slug: "llama-3-1-8b",
    name: "Llama 3.1 8B",
    vendor: "Meta",
    description:
      "A strong general-purpose open model that runs well on a modern laptop GPU or Apple Silicon. Great first local chat model for coding assistants and RAG experiments.",
    sizeParams: "8B",
    license: "Llama 3.1 Community",
    contextLength: 128000,
    tags: JSON.stringify(["chat", "coding", "rag", "general"]),
    hardwareMin: "16GB RAM + GPU/Metal",
    ollamaName: "llama3.1:8b",
    hfUrl: "https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct",
    useCases: JSON.stringify(["chatbots", "code assist", "summarization"]),
  },
  {
    slug: "mistral-7b-instruct",
    name: "Mistral 7B Instruct",
    vendor: "Mistral AI",
    description:
      "Efficient instruction-tuned model with solid reasoning for its size. Excellent latency-to-quality tradeoff for local APIs and CLI agents.",
    sizeParams: "7B",
    license: "Apache 2.0",
    contextLength: 32768,
    tags: JSON.stringify(["chat", "instruct", "efficient"]),
    hardwareMin: "12GB RAM",
    ollamaName: "mistral:7b",
    hfUrl: "https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3",
    useCases: JSON.stringify(["APIs", "agents", "classification"]),
  },
  {
    slug: "phi-3-mini",
    name: "Phi-3 Mini",
    vendor: "Microsoft",
    description:
      "Compact model optimized for reasoning and coding on constrained hardware. Ideal when you want local inference on lighter machines.",
    sizeParams: "3.8B",
    license: "MIT",
    contextLength: 128000,
    tags: JSON.stringify(["coding", "reasoning", "small"]),
    hardwareMin: "8GB RAM",
    ollamaName: "phi3:mini",
    hfUrl: "https://huggingface.co/microsoft/Phi-3-mini-4k-instruct",
    useCases: JSON.stringify(["edge devices", "fast prototyping", "coding"]),
  },
  {
    slug: "qwen2-5-coder-7b",
    name: "Qwen2.5 Coder 7B",
    vendor: "Alibaba",
    description:
      "Code-specialized open model that shines at completion, refactoring, and explaining repositories when run locally with a code UI.",
    sizeParams: "7B",
    license: "Apache 2.0",
    contextLength: 131072,
    tags: JSON.stringify(["coding", "completion", "repo"]),
    hardwareMin: "16GB RAM",
    ollamaName: "qwen2.5-coder:7b",
    hfUrl: "https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct",
    useCases: JSON.stringify(["IDE plugins", "code review", "tests"]),
  },
  {
    slug: "gemma-2-9b",
    name: "Gemma 2 9B",
    vendor: "Google",
    description:
      "Balanced open-weight model from Google DeepMind. Strong multilingual chat and instruction following for local experimentation.",
    sizeParams: "9B",
    license: "Gemma Terms",
    contextLength: 8192,
    tags: JSON.stringify(["chat", "multilingual", "general"]),
    hardwareMin: "16GB RAM + GPU/Metal",
    ollamaName: "gemma2:9b",
    hfUrl: "https://huggingface.co/google/gemma-2-9b-it",
    useCases: JSON.stringify(["chat", "translation", "writing"]),
  },
  {
    slug: "deepseek-coder-v2-lite",
    name: "DeepSeek Coder V2 Lite",
    vendor: "DeepSeek",
    description:
      "MoE-style coding model that punches above its active parameter count. Useful for local coding agents and structured generation.",
    sizeParams: "16B MoE",
    license: "DeepSeek License",
    contextLength: 128000,
    tags: JSON.stringify(["coding", "agents", "moe"]),
    hardwareMin: "24GB RAM",
    ollamaName: "deepseek-coder-v2:lite",
    hfUrl: "https://huggingface.co/deepseek-ai/DeepSeek-Coder-V2-Lite-Instruct",
    useCases: JSON.stringify(["agents", "tool calling", "codegen"]),
  },
  {
    slug: "nomic-embed-text",
    name: "Nomic Embed Text",
    vendor: "Nomic",
    description:
      "Open embedding model for local RAG pipelines. Pair with a vector store to keep retrieval fully on-device.",
    sizeParams: "137M",
    license: "Apache 2.0",
    contextLength: 8192,
    tags: JSON.stringify(["embeddings", "rag", "retrieval"]),
    hardwareMin: "4GB RAM",
    ollamaName: "nomic-embed-text",
    hfUrl: "https://huggingface.co/nomic-ai/nomic-embed-text-v1.5",
    useCases: JSON.stringify(["RAG", "semantic search", "clustering"]),
  },
  {
    slug: "llava-1-6",
    name: "LLaVA 1.6",
    vendor: "LLaVA Team",
    description:
      "Vision-language model for local image understanding. Useful for screenshot analysis and multimodal prototypes without cloud APIs.",
    sizeParams: "7B–34B",
    license: "Apache 2.0",
    contextLength: 4096,
    tags: JSON.stringify(["vision", "multimodal", "images"]),
    hardwareMin: "16GB RAM + GPU",
    ollamaName: "llava:7b",
    hfUrl: "https://huggingface.co/llava-hf/llava-v1.6-mistral-7b-hf",
    useCases: JSON.stringify(["screenshots", "docs OCR assist", "multimodal chat"]),
  },
];

const tools = [
  {
    slug: "ollama",
    name: "Ollama",
    category: "runtime",
    description:
      "The fastest on-ramp to local LLMs. Pull models, run an OpenAI-compatible API on localhost, and script against it from any language.",
    website: "https://ollama.com",
    github: "https://github.com/ollama/ollama",
    platforms: JSON.stringify(["macOS", "Linux", "Windows"]),
    tags: JSON.stringify(["api", "cli", "beginner", "openai-compatible"]),
    difficulty: "beginner",
  },
  {
    slug: "lm-studio",
    name: "LM Studio",
    category: "ui",
    description:
      "Desktop app for discovering GGUF models, chatting locally, and exposing a local server. Ideal when you want a GUI plus an API.",
    website: "https://lmstudio.ai",
    github: null,
    platforms: JSON.stringify(["macOS", "Linux", "Windows"]),
    tags: JSON.stringify(["gui", "gguf", "openai-compatible"]),
    difficulty: "beginner",
  },
  {
    slug: "llama-cpp",
    name: "llama.cpp",
    category: "runtime",
    description:
      "High-performance C/C++ inference for GGUF models. The foundation behind many local tools and the gold standard for CPU/Metal/CUDA efficiency.",
    website: "https://github.com/ggerganov/llama.cpp",
    github: "https://github.com/ggerganov/llama.cpp",
    platforms: JSON.stringify(["macOS", "Linux", "Windows"]),
    tags: JSON.stringify(["gguf", "performance", "cli"]),
    difficulty: "intermediate",
  },
  {
    slug: "vllm",
    name: "vLLM",
    category: "runtime",
    description:
      "Throughput-oriented inference server for GPU machines. Use it when you need production-like local serving with continuous batching.",
    website: "https://docs.vllm.ai",
    github: "https://github.com/vllm-project/vllm",
    platforms: JSON.stringify(["Linux"]),
    tags: JSON.stringify(["gpu", "serving", "openai-compatible"]),
    difficulty: "advanced",
  },
  {
    slug: "open-webui",
    name: "Open WebUI",
    category: "ui",
    description:
      "Self-hosted ChatGPT-style interface that talks to Ollama and other backends. Great for teams exploring local AI with a familiar UX.",
    website: "https://openwebui.com",
    github: "https://github.com/open-webui/open-webui",
    platforms: JSON.stringify(["Docker", "macOS", "Linux", "Windows"]),
    tags: JSON.stringify(["chat-ui", "self-hosted", "ollama"]),
    difficulty: "beginner",
  },
  {
    slug: "langchain",
    name: "LangChain",
    category: "framework",
    description:
      "Composable framework for chains, agents, and RAG. Point it at a local OpenAI-compatible endpoint and keep your stack portable.",
    website: "https://js.langchain.com",
    github: "https://github.com/langchain-ai/langchainjs",
    platforms: JSON.stringify(["Node", "Python"]),
    tags: JSON.stringify(["rag", "agents", "framework"]),
    difficulty: "intermediate",
  },
  {
    slug: "llamaindex",
    name: "LlamaIndex",
    category: "framework",
    description:
      "Data framework focused on indexing documents and building retrieval pipelines. Pair with local embeddings for private knowledge bases.",
    website: "https://www.llamaindex.ai",
    github: "https://github.com/run-llama/llama_index",
    platforms: JSON.stringify(["Python", "TypeScript"]),
    tags: JSON.stringify(["rag", "indexing", "framework"]),
    difficulty: "intermediate",
  },
  {
    slug: "continue-dev",
    name: "Continue",
    category: "ide",
    description:
      "Open-source coding assistant for VS Code and JetBrains that can target local models via Ollama or LM Studio.",
    website: "https://continue.dev",
    github: "https://github.com/continuedev/continue",
    platforms: JSON.stringify(["VS Code", "JetBrains"]),
    tags: JSON.stringify(["ide", "coding", "ollama"]),
    difficulty: "beginner",
  },
  {
    slug: "anythingllm",
    name: "AnythingLLM",
    category: "ui",
    description:
      "All-in-one desktop/server app for private RAG with local models, document workspaces, and agent tools.",
    website: "https://anythingllm.com",
    github: "https://github.com/Mintplex-Labs/anything-llm",
    platforms: JSON.stringify(["macOS", "Linux", "Windows", "Docker"]),
    tags: JSON.stringify(["rag", "desktop", "agents"]),
    difficulty: "beginner",
  },
  {
    slug: "huggingface-tgi",
    name: "Text Generation Inference",
    category: "runtime",
    description:
      "Hugging Face's production inference toolkit. Useful when you want optimized serving of Transformers models on your own GPUs.",
    website: "https://huggingface.co/docs/text-generation-inference",
    github: "https://github.com/huggingface/text-generation-inference",
    platforms: JSON.stringify(["Linux", "Docker"]),
    tags: JSON.stringify(["serving", "gpu", "transformers"]),
    difficulty: "advanced",
  },
];

const guides = [
  {
    slug: "what-is-local-ai",
    title: "What is local AI?",
    summary:
      "Understand why developers run models on their own machines—and what tradeoffs come with privacy, cost, and latency.",
    level: "beginner",
    sortOrder: 1,
    readingMins: 6,
    content: `# What is local AI?

Local AI means running language, vision, or embedding models on hardware you control—your laptop, a home GPU box, or a team workstation—instead of calling a hosted API.

## Why developers care

- **Privacy**: source code, customer data, and notes never leave the machine.
- **Cost control**: no per-token bill while you iterate.
- **Latency**: local loops feel snappy for IDE tooling and agents.
- **Offline**: trains you to build resilient apps that work without the cloud.

## What "local" usually looks like

1. You download a model weights file (often GGUF or safetensors).
2. A runtime (Ollama, llama.cpp, vLLM, LM Studio) loads it.
3. You chat in a UI or hit an HTTP API that mimics OpenAI's shape.
4. Your app talks to \`localhost\` the same way it would talk to a cloud provider.

## Tradeoffs

Local models are smaller than frontier APIs. Quality depends on VRAM/RAM, quantization, and prompting. Start small (3B–8B), measure, then scale up.

## Next step

Install a runtime, pull one chat model and one embedding model, then build a tiny script that hits the local OpenAI-compatible endpoint.`,
  },
  {
    slug: "first-local-stack",
    title: "Your first local stack in 15 minutes",
    summary:
      "Install Ollama, pull Llama 3.1, and call it from curl and Node—the practical on-ramp for most developers.",
    level: "beginner",
    sortOrder: 2,
    readingMins: 8,
    content: `# Your first local stack in 15 minutes

This guide gets you from zero to a working local API.

## 1. Install Ollama

Download from [ollama.com](https://ollama.com) for macOS, Linux, or Windows. Confirm the CLI works:

\`\`\`bash
ollama --version
\`\`\`

## 2. Pull a chat model

\`\`\`bash
ollama pull llama3.1:8b
\`\`\`

Then try an interactive session:

\`\`\`bash
ollama run llama3.1:8b
\`\`\`

## 3. Hit the local HTTP API

Ollama exposes an OpenAI-compatible surface on \`http://localhost:11434\`.

\`\`\`bash
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.1:8b",
  "prompt": "Explain REST APIs in two sentences.",
  "stream": false
}'
\`\`\`

## 4. Call it from Node

\`\`\`js
const res = await fetch("http://localhost:11434/api/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    model: "llama3.1:8b",
    messages: [{ role: "user", content: "Say hello as a local model." }],
    stream: false,
  }),
});
console.log(await res.json());
\`\`\`

## 5. Add embeddings for RAG later

\`\`\`bash
ollama pull nomic-embed-text
\`\`\`

You now have chat + embeddings running entirely on your machine.`,
  },
  {
    slug: "models-vs-tools",
    title: "Models vs tools: how to choose",
    summary:
      "A decision guide for picking runtimes, UIs, frameworks, and model sizes based on your hardware and goals.",
    level: "beginner",
    sortOrder: 3,
    readingMins: 7,
    content: `# Models vs tools: how to choose

Local AI has two layers: **models** (the weights) and **tools** (everything that loads, serves, or wraps them).

## Models

Pick by task and hardware:

| Goal | Start with |
|------|------------|
| General chat | Llama 3.1 8B, Gemma 2 9B |
| Coding | Qwen2.5 Coder, DeepSeek Coder |
| Tiny / CPU | Phi-3 Mini |
| RAG embeddings | Nomic Embed Text |
| Images | LLaVA |

Quantization (Q4/Q5 GGUF) trades a little quality for much less memory.

## Tools

- **Need speed to first token of joy?** Ollama or LM Studio.
- **Need max performance on GPU?** vLLM or llama.cpp tuned builds.
- **Need a ChatGPT-like UI?** Open WebUI or AnythingLLM.
- **Building app logic?** LangChain / LlamaIndex against a local endpoint.
- **Coding in the IDE?** Continue pointed at Ollama.

## Rule of thumb

Keep the **interface contract** stable (OpenAI-compatible HTTP). Swap models and runtimes underneath without rewriting your product code.`,
  },
  {
    slug: "local-rag-basics",
    title: "Local RAG without the cloud",
    summary:
      "Chunk docs, embed locally, store vectors, and answer questions with a local LLM—all on localhost.",
    level: "intermediate",
    sortOrder: 4,
    readingMins: 10,
    content: `# Local RAG without the cloud

Retrieval-Augmented Generation (RAG) lets a small local model answer questions about *your* files.

## Pipeline

1. **Ingest** markdown, PDFs, or code.
2. **Chunk** into ~400–800 token pieces with overlap.
3. **Embed** each chunk with a local embedding model.
4. **Store** vectors (SQLite+sqlite-vss, Chroma, LanceDB, Qdrant).
5. **Retrieve** top-k chunks for a query.
6. **Generate** an answer with a local chat model using those chunks as context.

## Minimal mental model

\`\`\`
query → embed → nearest chunks → prompt(context + question) → local LLM
\`\`\`

## Practical tips

- Keep prompts explicit: "Answer only from context. If missing, say you don't know."
- Start with 3–5 retrieved chunks; more context is not always better.
- Re-embed when docs change.
- Log retrieved chunks during debugging—most RAG bugs are retrieval bugs.

## Localbench path

Favorite an embedding model (Nomic) and a chat model (Llama/Mistral), then pick a framework tool (LlamaIndex or LangChain) from Explore.`,
  },
  {
    slug: "openai-compatible-local-apis",
    title: "Design apps against local OpenAI-compatible APIs",
    summary:
      "Write backend code once, point it at localhost during development, and keep the door open to cloud providers later.",
    level: "intermediate",
    sortOrder: 5,
    readingMins: 9,
    content: `# Design apps against local OpenAI-compatible APIs

Most local runtimes speak a dialect of the OpenAI Chat Completions API. Treat that as your app's boundary.

## Pattern

\`\`\`ts
const baseURL = process.env.LLM_BASE_URL ?? "http://localhost:11434/v1";
const apiKey = process.env.LLM_API_KEY ?? "ollama";

export async function chat(messages: { role: string; content: string }[]) {
  const res = await fetch(\`\${baseURL}/chat/completions\`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: \`Bearer \${apiKey}\`,
    },
    body: JSON.stringify({
      model: process.env.LLM_MODEL ?? "llama3.1:8b",
      messages,
      temperature: 0.2,
    }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
\`\`\`

## Why this matters

- Swap Ollama ↔ LM Studio ↔ vLLM by changing env vars.
- Promote to a hosted provider by changing \`baseURL\` and keys.
- Write integration tests against a deterministic local model.

## Backend checklist

- Timeouts and retries for cold model loads
- Streaming support for UX
- Separate embedding vs chat base URLs if needed
- Never hardcode secrets—even local keys belong in env

Localbench's own API layer follows the same idea: clear routes, JSON contracts, auth where it matters.`,
  },
  {
    slug: "hardware-and-quantization",
    title: "Hardware, VRAM, and quantization",
    summary:
      "Map model sizes to machines and learn how GGUF quantization makes local inference realistic.",
    level: "intermediate",
    sortOrder: 6,
    readingMins: 8,
    content: `# Hardware, VRAM, and quantization

## Rough sizing

| Machine | Comfortable models |
|---------|--------------------|
| 8GB unified / RAM | 3B–4B Q4 |
| 16GB | 7B–8B Q4/Q5 |
| 24GB VRAM | 13B–34B quantized / MoE lite |
| Multi-GPU server | full-precision or large MoE |

Rules are fuzzy—context length, batch size, and KV cache matter.

## Quantization in one paragraph

Quantization stores weights in fewer bits (e.g. 4-bit). GGUF Q4_K_M is a popular balance. You lose a little quality, gain a lot of speed/memory headroom.

## Developer workflow

1. Start with the smallest model that passes your eval prompts.
2. Measure tokens/sec and quality on *your* tasks.
3. Increase size only when quality plateaus.
4. Prefer more context + better retrieval over blindly larger models for RAG.

## Apple Silicon note

Metal acceleration in llama.cpp / Ollama makes Macs excellent for local AI. Prefer GGUF runtimes there.`,
  },
];

async function main() {
  await prisma.favorite.deleteMany();
  await prisma.user.deleteMany();
  await prisma.aiModel.deleteMany();
  await prisma.tool.deleteMany();
  await prisma.guide.deleteMany();

  await prisma.aiModel.createMany({ data: models });
  await prisma.tool.createMany({ data: tools });
  await prisma.guide.createMany({ data: guides });

  const passwordHash = await hash("demo1234", 10);
  await prisma.user.create({
    data: {
      email: "dev@localbench.dev",
      username: "demo",
      displayName: "Demo Developer",
      passwordHash,
    },
  });

  console.log(
    `Seeded ${models.length} models, ${tools.length} tools, ${guides.length} guides, and demo user (dev@localbench.dev / demo1234)`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
