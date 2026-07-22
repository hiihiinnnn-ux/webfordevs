import { db, migrate } from "./index.js";

const J = JSON.stringify;

const models = [
  {
    slug: "llama-3.1-8b-instruct", name: "Llama 3.1 8B Instruct", family: "Llama",
    type: "chat", params_b: 8, context_window: 131072, license: "Llama 3.1 Community",
    min_ram_gb: 8, min_vram_gb: 6, quantizations: J(["Q4_K_M", "Q5_K_M", "Q8_0", "FP16"]),
    description: "Meta's workhorse open-weights chat model. The default first model for most people getting into local AI: strong general chat, tool calling, and a huge 128k context, while still fitting on an 8GB GPU when quantized.",
    tags: J(["general", "tool-calling", "long-context", "starter"]), homepage: "https://ai.meta.com/llama/",
  },
  {
    slug: "qwen2.5-coder-7b", name: "Qwen2.5 Coder 7B", family: "Qwen",
    type: "code", params_b: 7, context_window: 131072, license: "Apache-2.0",
    min_ram_gb: 8, min_vram_gb: 6, quantizations: J(["Q4_K_M", "Q6_K", "Q8_0", "FP16"]),
    description: "One of the best small coding models available. Excellent at code completion, fill-in-the-middle and code chat. Pairs perfectly with IDE extensions like Continue for a fully local Copilot alternative.",
    tags: J(["coding", "fill-in-middle", "copilot-alternative", "starter"]), homepage: "https://qwenlm.github.io/",
  },
  {
    slug: "qwen2.5-72b-instruct", name: "Qwen2.5 72B Instruct", family: "Qwen",
    type: "chat", params_b: 72, context_window: 131072, license: "Qwen License",
    min_ram_gb: 64, min_vram_gb: 48, quantizations: J(["Q4_K_M", "Q5_K_M", "AWQ", "GPTQ"]),
    description: "A frontier-class open model for people with serious hardware (dual 24GB GPUs or a 64GB+ Mac). Near GPT-4-level performance on many tasks, fully offline.",
    tags: J(["general", "high-end", "multilingual"]), homepage: "https://qwenlm.github.io/",
  },
  {
    slug: "mistral-7b-instruct-v0.3", name: "Mistral 7B Instruct v0.3", family: "Mistral",
    type: "chat", params_b: 7, context_window: 32768, license: "Apache-2.0",
    min_ram_gb: 8, min_vram_gb: 5, quantizations: J(["Q4_K_M", "Q5_K_M", "Q8_0"]),
    description: "The model that proved small models can punch far above their weight. Truly permissive Apache-2.0 license, fast, and a great base for fine-tuning experiments.",
    tags: J(["general", "apache-2.0", "fine-tuning", "starter"]), homepage: "https://mistral.ai/",
  },
  {
    slug: "phi-4", name: "Phi-4 14B", family: "Phi",
    type: "reasoning", params_b: 14, context_window: 16384, license: "MIT",
    min_ram_gb: 16, min_vram_gb: 10, quantizations: J(["Q4_K_M", "Q6_K", "FP16"]),
    description: "Microsoft's small model trained heavily on synthetic 'textbook quality' data. Outstanding at math and step-by-step reasoning for its size, under a plain MIT license.",
    tags: J(["reasoning", "math", "mit-license"]), homepage: "https://azure.microsoft.com/en-us/products/phi",
  },
  {
    slug: "gemma-2-9b-it", name: "Gemma 2 9B IT", family: "Gemma",
    type: "chat", params_b: 9, context_window: 8192, license: "Gemma Terms",
    min_ram_gb: 10, min_vram_gb: 8, quantizations: J(["Q4_K_M", "Q5_K_M", "Q8_0"]),
    description: "Google's open-weights family distilled from Gemini research. Very polished conversational tone and strong multilingual chat in a mid-size package.",
    tags: J(["general", "multilingual"]), homepage: "https://ai.google.dev/gemma",
  },
  {
    slug: "deepseek-r1-distill-qwen-14b", name: "DeepSeek-R1 Distill Qwen 14B", family: "DeepSeek",
    type: "reasoning", params_b: 14, context_window: 131072, license: "MIT",
    min_ram_gb: 16, min_vram_gb: 12, quantizations: J(["Q4_K_M", "Q6_K", "Q8_0"]),
    description: "A distilled version of DeepSeek's R1 reasoning model. Shows its chain-of-thought before answering — a great way to study how reasoning models work, running entirely on your own machine.",
    tags: J(["reasoning", "chain-of-thought", "mit-license"]), homepage: "https://www.deepseek.com/",
  },
  {
    slug: "llava-1.6-7b", name: "LLaVA 1.6 7B", family: "LLaVA",
    type: "vision", params_b: 7, context_window: 32768, license: "Apache-2.0",
    min_ram_gb: 10, min_vram_gb: 8, quantizations: J(["Q4_K_M", "Q5_K_M"]),
    description: "The classic open vision-language model: describe screenshots, extract text from images, answer questions about photos — all locally. Runs in Ollama with a single command.",
    tags: J(["vision", "multimodal", "ocr"]), homepage: "https://llava-vl.github.io/",
  },
  {
    slug: "whisper-large-v3", name: "Whisper Large v3", family: "Whisper",
    type: "speech", params_b: 1.5, context_window: null, license: "MIT",
    min_ram_gb: 4, min_vram_gb: 0, quantizations: J(["FP16", "INT8", "GGML"]),
    description: "OpenAI's open-source speech-to-text model, still the gold standard for local transcription in ~100 languages. whisper.cpp runs it in real time on a laptop CPU.",
    tags: J(["speech-to-text", "transcription", "multilingual", "cpu-friendly"]), homepage: "https://github.com/openai/whisper",
  },
  {
    slug: "stable-diffusion-xl", name: "Stable Diffusion XL", family: "Stable Diffusion",
    type: "image", params_b: 3.5, context_window: null, license: "OpenRAIL++",
    min_ram_gb: 16, min_vram_gb: 8, quantizations: J(["FP16", "FP8"]),
    description: "The most widely used local image generation model. A giant ecosystem of fine-tunes, LoRAs and tooling (ComfyUI, AUTOMATIC1111) has grown around it.",
    tags: J(["image-generation", "text-to-image"]), homepage: "https://stability.ai/",
  },
  {
    slug: "flux.1-schnell", name: "FLUX.1 schnell", family: "FLUX",
    type: "image", params_b: 12, context_window: null, license: "Apache-2.0",
    min_ram_gb: 24, min_vram_gb: 12, quantizations: J(["FP16", "FP8", "GGUF Q8"]),
    description: "State-of-the-art open image model from the original Stable Diffusion authors. The 'schnell' variant generates high quality images in ~4 steps and is Apache-2.0 licensed.",
    tags: J(["image-generation", "text-to-image", "apache-2.0"]), homepage: "https://blackforestlabs.ai/",
  },
  {
    slug: "nomic-embed-text-v1.5", name: "Nomic Embed Text v1.5", family: "Nomic",
    type: "embedding", params_b: 0.137, context_window: 8192, license: "Apache-2.0",
    min_ram_gb: 2, min_vram_gb: 0, quantizations: J(["FP16", "Q8_0"]),
    description: "A tiny, fast, fully open embedding model that beats OpenAI's ada-002 on retrieval benchmarks. The go-to choice for building local RAG pipelines — runs on any CPU.",
    tags: J(["embeddings", "rag", "cpu-friendly", "starter"]), homepage: "https://www.nomic.ai/",
  },
  {
    slug: "smollm2-1.7b", name: "SmolLM2 1.7B", family: "SmolLM",
    type: "chat", params_b: 1.7, context_window: 8192, license: "Apache-2.0",
    min_ram_gb: 2, min_vram_gb: 0, quantizations: J(["Q4_K_M", "Q8_0", "FP16"]),
    description: "Hugging Face's tiny model that runs comfortably on a Raspberry Pi or an old laptop with no GPU at all. Perfect for learning how inference works and for edge deployments.",
    tags: J(["tiny", "edge", "cpu-friendly", "starter"]), homepage: "https://huggingface.co/HuggingFaceTB",
  },
  {
    slug: "codellama-13b", name: "Code Llama 13B", family: "Llama",
    type: "code", params_b: 13, context_window: 16384, license: "Llama 2 Community",
    min_ram_gb: 16, min_vram_gb: 10, quantizations: J(["Q4_K_M", "Q5_K_M"]),
    description: "Meta's dedicated code model with infilling support. A bit dated now but historically important and still a solid choice for code completion on mid-range hardware.",
    tags: J(["coding", "fill-in-middle"]), homepage: "https://ai.meta.com/llama/",
  },
];

const tools = [
  {
    slug: "ollama", name: "Ollama", category: "runtime", language: "Go",
    difficulty: "beginner", gpu_support: J(["cuda", "metal", "rocm", "cpu"]),
    platforms: J(["linux", "macos", "windows"]),
    description: "The easiest on-ramp to local AI. One install, then `ollama run llama3.1` downloads and runs a model with an OpenAI-compatible API on localhost:11434. Handles model management, quantization variants and GPU offload for you.",
    tags: J(["starter", "cli", "openai-compatible-api", "model-manager"]), repo_url: "https://github.com/ollama/ollama",
  },
  {
    slug: "llama-cpp", name: "llama.cpp", category: "runtime", language: "C/C++",
    difficulty: "intermediate", gpu_support: J(["cuda", "metal", "rocm", "vulkan", "cpu"]),
    platforms: J(["linux", "macos", "windows"]),
    description: "The engine that powers most of the local AI ecosystem (including Ollama). Pure C/C++ inference for GGUF models with aggressive quantization support. Use it directly when you want maximum control over performance.",
    tags: J(["gguf", "quantization", "performance", "foundation"]), repo_url: "https://github.com/ggerganov/llama.cpp",
  },
  {
    slug: "lm-studio", name: "LM Studio", category: "desktop-app", language: null,
    difficulty: "beginner", gpu_support: J(["cuda", "metal", "vulkan", "cpu"]),
    platforms: J(["linux", "macos", "windows"]),
    description: "A polished desktop GUI for discovering, downloading and chatting with local models. Includes a local server mode exposing an OpenAI-compatible API — great for devs who want a visual model browser plus an API endpoint.",
    tags: J(["starter", "gui", "openai-compatible-api", "model-manager"]), repo_url: "https://lmstudio.ai/",
  },
  {
    slug: "vllm", name: "vLLM", category: "server", language: "Python",
    difficulty: "advanced", gpu_support: J(["cuda", "rocm"]),
    platforms: J(["linux"]),
    description: "The production inference server. PagedAttention and continuous batching give it far higher throughput than hobbyist runtimes when serving many concurrent requests. What you reach for when your local prototype needs to become a real service.",
    tags: J(["production", "throughput", "openai-compatible-api", "batching"]), repo_url: "https://github.com/vllm-project/vllm",
  },
  {
    slug: "open-webui", name: "Open WebUI", category: "web-ui", language: "Python/Svelte",
    difficulty: "beginner", gpu_support: J(["cpu"]),
    platforms: J(["linux", "macos", "windows"]),
    description: "A self-hosted ChatGPT-style web interface that plugs into Ollama or any OpenAI-compatible endpoint. Supports multiple users, RAG over your documents, and model switching — one docker command to run.",
    tags: J(["starter", "chat-ui", "rag", "docker", "self-hosted"]), repo_url: "https://github.com/open-webui/open-webui",
  },
  {
    slug: "continue", name: "Continue", category: "ide-extension", language: "TypeScript",
    difficulty: "beginner", gpu_support: J(["cpu"]),
    platforms: J(["linux", "macos", "windows"]),
    description: "Open-source VS Code / JetBrains extension for AI-assisted coding that works with local models. Point it at Ollama running Qwen2.5 Coder and you have a fully offline Copilot: autocomplete, chat, and codebase-aware edits.",
    tags: J(["starter", "coding", "vscode", "jetbrains", "copilot-alternative"]), repo_url: "https://github.com/continuedev/continue",
  },
  {
    slug: "comfyui", name: "ComfyUI", category: "image", language: "Python",
    difficulty: "intermediate", gpu_support: J(["cuda", "metal", "rocm", "cpu"]),
    platforms: J(["linux", "macos", "windows"]),
    description: "Node-graph interface for local image and video generation. The most powerful way to run Stable Diffusion and FLUX: build reusable pipelines by wiring nodes together, then drive them via its API.",
    tags: J(["image-generation", "node-graph", "stable-diffusion", "flux"]), repo_url: "https://github.com/comfyanonymous/ComfyUI",
  },
  {
    slug: "whisper-cpp", name: "whisper.cpp", category: "speech", language: "C/C++",
    difficulty: "intermediate", gpu_support: J(["cuda", "metal", "cpu"]),
    platforms: J(["linux", "macos", "windows"]),
    description: "Port of OpenAI's Whisper to plain C/C++. Real-time speech-to-text on a laptop CPU, with bindings for most languages. The standard way to add local transcription to an app.",
    tags: J(["speech-to-text", "transcription", "cpu-friendly"]), repo_url: "https://github.com/ggerganov/whisper.cpp",
  },
  {
    slug: "jan", name: "Jan", category: "desktop-app", language: "TypeScript",
    difficulty: "beginner", gpu_support: J(["cuda", "metal", "vulkan", "cpu"]),
    platforms: J(["linux", "macos", "windows"]),
    description: "A fully open-source ChatGPT-style desktop app that runs models locally via llama.cpp. Everything stays on disk in open formats — a good choice if you want an offline assistant with zero cloud dependency.",
    tags: J(["starter", "gui", "offline", "open-source"]), repo_url: "https://github.com/janhq/jan",
  },
  {
    slug: "llamaindex", name: "LlamaIndex", category: "framework", language: "Python/TypeScript",
    difficulty: "intermediate", gpu_support: J(["cpu"]),
    platforms: J(["linux", "macos", "windows"]),
    description: "The data framework for building RAG applications. Connects your documents to local LLMs and embedding models: ingestion, chunking, vector indexing and query engines with a few lines of code.",
    tags: J(["rag", "framework", "embeddings", "python", "typescript"]), repo_url: "https://github.com/run-llama/llama_index",
  },
  {
    slug: "langchain", name: "LangChain", category: "framework", language: "Python/TypeScript",
    difficulty: "intermediate", gpu_support: J(["cpu"]),
    platforms: J(["linux", "macos", "windows"]),
    description: "The most widely used framework for composing LLM applications: chains, agents, tool calling and memory. First-class integrations for Ollama and llama.cpp make it easy to build agentic apps on local models.",
    tags: J(["framework", "agents", "tool-calling", "python", "typescript"]), repo_url: "https://github.com/langchain-ai/langchain",
  },
  {
    slug: "koboldcpp", name: "KoboldCpp", category: "runtime", language: "C/C++",
    difficulty: "intermediate", gpu_support: J(["cuda", "vulkan", "cpu"]),
    platforms: J(["linux", "macos", "windows"]),
    description: "A single-file llama.cpp distribution with a built-in web UI, popular for creative writing and roleplay. Zero-install: download one binary, point it at a GGUF file, go.",
    tags: J(["gguf", "single-binary", "creative-writing"]), repo_url: "https://github.com/LostRuins/koboldcpp",
  },
  {
    slug: "mlx", name: "MLX", category: "framework", language: "Python/Swift",
    difficulty: "advanced", gpu_support: J(["metal"]),
    platforms: J(["macos"]),
    description: "Apple's array framework built for Apple Silicon's unified memory. mlx-lm runs and fine-tunes LLMs natively on M-series Macs, often faster than llama.cpp on the same hardware.",
    tags: J(["apple-silicon", "fine-tuning", "performance"]), repo_url: "https://github.com/ml-explore/mlx",
  },
  {
    slug: "text-generation-webui", name: "Text Generation WebUI", category: "web-ui", language: "Python",
    difficulty: "intermediate", gpu_support: J(["cuda", "metal", "rocm", "cpu"]),
    platforms: J(["linux", "macos", "windows"]),
    description: "The 'Swiss army knife' web UI (a.k.a. oobabooga). Supports multiple backends (llama.cpp, ExLlama, Transformers), LoRA training, and an extensions ecosystem. More knobs than any other UI.",
    tags: J(["gui", "lora", "multi-backend", "power-user"]), repo_url: "https://github.com/oobabooga/text-generation-webui",
  },
];

const guides = [
  {
    slug: "what-is-local-ai", title: "What is local AI, and why should devs care?",
    level: "beginner", minutes: 6,
    summary: "The 5-minute mental model: what running models locally actually means, what it costs, and when it beats calling a cloud API.",
    body: `## The core idea

"Local AI" means running the model's weights on hardware you control — your laptop, a workstation, or a server in your rack — instead of sending prompts to a cloud API.

An open-weights model is just a big file of numbers (often several GB). A **runtime** like Ollama or llama.cpp loads that file into RAM/VRAM and turns tokens in into tokens out. That's the whole trick.

## Why developers care

- **Privacy** — prompts, code, and documents never leave your machine. This unblocks work on codebases and data you could never send to a third party.
- **Cost** — inference is free after the hardware. Iterate on prompts and agents all day without watching a usage meter.
- **Latency & offline** — no network round-trip; works on a plane.
- **Control** — pin an exact model version forever; no deprecations, no silent behavior changes, no rate limits.
- **Learning** — nothing teaches you how LLMs actually work like watching one saturate your GPU.

## The honest trade-offs

- The best local models still trail the top proprietary ones on hard reasoning.
- You manage the ops: VRAM budgeting, quantization choices, updates.
- Batch throughput on one GPU is limited compared to a cloud fleet.

## The stack at a glance

1. **Model weights** (e.g. Llama 3.1 8B) — usually in GGUF format for local use.
2. **Runtime** (Ollama, llama.cpp, LM Studio) — loads weights, generates tokens.
3. **API layer** — most runtimes expose an OpenAI-compatible HTTP API, so existing SDKs work by changing the base URL.
4. **Your app** — chat UIs, IDE extensions, RAG pipelines, agents.

Next: [Run your first model in 10 minutes](/guides/run-your-first-model) →`,
    tags: J(["concepts", "getting-started"]),
  },
  {
    slug: "run-your-first-model", title: "Run your first local model in 10 minutes",
    level: "beginner", minutes: 10,
    summary: "From nothing to chatting with Llama 3.1 on your own machine using Ollama, plus calling it from code via the OpenAI-compatible API.",
    body: `## 1. Install Ollama

**macOS / Windows:** download from [ollama.com](https://ollama.com).

**Linux:**

\`\`\`bash
curl -fsSL https://ollama.com/install.sh | sh
\`\`\`

## 2. Pull and run a model

\`\`\`bash
ollama run llama3.1
\`\`\`

First run downloads ~4.7GB (the 8B model at Q4_K_M quantization). Then you get an interactive chat right in your terminal. Type \`/bye\` to exit.

Low on RAM? Try \`ollama run smollm2:1.7b\` — it runs on almost anything.

## 3. Call it from code

Ollama serves an OpenAI-compatible API on port 11434, so any OpenAI SDK works:

\`\`\`python
from openai import OpenAI

client = OpenAI(base_url="http://localhost:11434/v1", api_key="ollama")

resp = client.chat.completions.create(
    model="llama3.1",
    messages=[{"role": "user", "content": "Explain quantization in one paragraph."}],
)
print(resp.choices[0].message.content)
\`\`\`

Or raw HTTP:

\`\`\`bash
curl http://localhost:11434/v1/chat/completions -d '{
  "model": "llama3.1",
  "messages": [{"role": "user", "content": "Hello!"}]
}'
\`\`\`

## 4. Useful commands

\`\`\`bash
ollama list          # models you have downloaded
ollama ps            # what is loaded in memory right now
ollama pull qwen2.5-coder:7b   # grab a coding model
ollama rm llama3.1   # free disk space
\`\`\`

You now have a local LLM with an API. Next: [Understanding quantization](/guides/understanding-quantization) →`,
    tags: J(["ollama", "getting-started", "tutorial"]),
  },
  {
    slug: "understanding-quantization", title: "Understanding quantization: Q4? GGUF? What?",
    level: "beginner", minutes: 8,
    summary: "Decode the alphabet soup of model files — GGUF, Q4_K_M, FP16 — and learn how to pick the right variant for your hardware.",
    body: `## The problem quantization solves

A model's size is roughly **parameters × bytes per parameter**. Llama 3.1 8B at full 16-bit precision needs ~16GB — more than most GPUs have.

**Quantization** stores weights with fewer bits. Fewer bits = smaller file = less (V)RAM = faster loading, at the cost of a little quality.

| Format | Bits/weight | 8B model size | Quality |
|--------|------------|---------------|---------|
| FP16   | 16         | ~16 GB        | Reference |
| Q8_0   | 8          | ~8.5 GB       | Nearly identical |
| Q6_K   | ~6.6       | ~6.6 GB       | Excellent |
| Q5_K_M | ~5.5       | ~5.7 GB       | Very good |
| Q4_K_M | ~4.8       | ~4.9 GB       | Good — the usual sweet spot |
| Q2_K   | ~2.6       | ~3.2 GB       | Noticeably degraded |

## Decoding the names

- **GGUF** — the file format used by llama.cpp/Ollama. One self-contained file with weights + tokenizer + metadata.
- **Q4_K_M** — 4-bit "K-quant", Medium variant. The K-quants keep important layers at higher precision, which is why they punch above their bit count.
- **AWQ / GPTQ** — GPU-oriented 4-bit formats used by vLLM and friends.

## Rules of thumb

1. **Q4_K_M is the default.** Best quality-per-GB for most models.
2. Have spare VRAM? Step up to Q5_K_M or Q6_K.
3. Below Q4, quality drops fast — prefer a smaller model at Q4 over a bigger one at Q2.
4. A model needs its file size **plus ~1–2GB** of memory for context. The longer your context, the more overhead.

## Sizing cheat sheet

| Your hardware | Comfortable model size |
|---------------|------------------------|
| 8GB RAM, no GPU | 1–3B (Q4) |
| 16GB RAM or 8GB VRAM | 7–9B (Q4/Q5) |
| 24GB VRAM (e.g. RTX 4090) | 14–32B (Q4) |
| 64GB+ unified memory (Mac) | 70B+ (Q4) |

Use the **hardware filter** on this site's model catalog to see what fits your machine.`,
    tags: J(["concepts", "quantization", "gguf", "hardware"]),
  },
  {
    slug: "local-copilot-setup", title: "Build a fully local coding copilot",
    level: "intermediate", minutes: 15,
    summary: "Wire Qwen2.5 Coder + Ollama + the Continue extension into VS Code for offline autocomplete and codebase chat.",
    body: `## The stack

- **Ollama** — serves the models
- **Qwen2.5 Coder 7B** — chat + edits
- **Qwen2.5 Coder 1.5B** — fast autocomplete
- **Nomic Embed** — codebase indexing for @codebase questions
- **Continue** — the VS Code / JetBrains extension tying it together

## 1. Pull the models

\`\`\`bash
ollama pull qwen2.5-coder:7b
ollama pull qwen2.5-coder:1.5b
ollama pull nomic-embed-text
\`\`\`

## 2. Install Continue

Install "Continue" from the VS Code marketplace, then open its config (gear icon → \`config.yaml\`):

\`\`\`yaml
models:
  - name: Qwen2.5 Coder 7B
    provider: ollama
    model: qwen2.5-coder:7b
    roles: [chat, edit, apply]
  - name: Qwen2.5 Coder 1.5B
    provider: ollama
    model: qwen2.5-coder:1.5b
    roles: [autocomplete]
  - name: Nomic Embed
    provider: ollama
    model: nomic-embed-text
    roles: [embed]
\`\`\`

## 3. Use it

- **Tab** — inline autocomplete from the 1.5B model (fast enough to feel instant on a GPU).
- **Cmd/Ctrl+L** — chat about selected code.
- **@codebase** in chat — asks questions over your indexed repo using local embeddings.
- **Cmd/Ctrl+I** — inline edits ("add error handling to this function").

## Tuning tips

- Autocomplete latency is dominated by the small model; keep it at 1.5B–3B.
- If completions feel slow, check \`ollama ps\` — both models should show \`100% GPU\`.
- On 16GB Macs, run the 7B for chat only and let autocomplete share it.

Everything here works on a plane. No tokens, no telemetry, no bill.`,
    tags: J(["coding", "ollama", "continue", "tutorial", "vscode"]),
  },
  {
    slug: "local-rag-pipeline", title: "Build a local RAG pipeline over your docs",
    level: "intermediate", minutes: 20,
    summary: "Retrieval-augmented generation with zero cloud calls: embed your documents with Nomic Embed and answer questions with Llama 3.1.",
    body: `## Why RAG locally?

RAG (retrieval-augmented generation) lets an LLM answer questions using **your** documents. Doing it locally means confidential docs never leave your machine — often the whole reason a company can use AI on internal data at all.

## The pipeline

1. **Chunk** documents into passages
2. **Embed** each chunk into a vector (Nomic Embed)
3. **Store** vectors (Chroma, an embedded vector DB)
4. At question time: embed the query, fetch the closest chunks, and hand them to the LLM as context

## Setup

\`\`\`bash
ollama pull llama3.1
ollama pull nomic-embed-text
pip install chromadb ollama
\`\`\`

## The code (~40 lines)

\`\`\`python
import ollama, chromadb

client = chromadb.PersistentClient("./rag-db")
collection = client.get_or_create_collection("docs")

def embed(texts):
    return [ollama.embeddings(model="nomic-embed-text", prompt=t)["embedding"] for t in texts]

# --- Ingest (run once) ---
chunks = [...]  # your documents, split into ~500-token passages
collection.add(
    ids=[f"chunk-{i}" for i in range(len(chunks))],
    embeddings=embed(chunks),
    documents=chunks,
)

# --- Query ---
def ask(question):
    hits = collection.query(query_embeddings=embed([question]), n_results=4)
    context = "\\n\\n".join(hits["documents"][0])
    resp = ollama.chat(model="llama3.1", messages=[
        {"role": "system", "content": "Answer using only the provided context."},
        {"role": "user", "content": f"Context:\\n{context}\\n\\nQuestion: {question}"},
    ])
    return resp["message"]["content"]

print(ask("What does our deployment runbook say about rollbacks?"))
\`\`\`

## Making it good

- **Chunking matters most.** Split on headings/paragraphs, not fixed character counts, and overlap chunks by ~10%.
- Retrieve more than you need (top 10), then let a reranker or the LLM pick.
- Evaluate with a fixed set of question/answer pairs before tweaking anything.

Want this without writing code? **Open WebUI** ships a document-QA feature with the same architecture built in.`,
    tags: J(["rag", "embeddings", "python", "tutorial"]),
  },
  {
    slug: "choosing-hardware", title: "Choosing hardware for local AI",
    level: "beginner", minutes: 10,
    summary: "VRAM is the currency of local AI. What to buy (or what you already own that works) for every budget.",
    body: `## The one number that matters: memory

Token generation is **memory-bandwidth bound**. The whole model is read from memory for every token generated. So:

1. **Capacity** decides which models you can run at all.
2. **Bandwidth** decides how fast tokens come out.

## What you already own probably works

- **Any M-series Mac** — unified memory is a superpower; a 32GB MacBook runs 14B models well, a 64GB one runs 70B.
- **Gaming PC with an RTX 3060 12GB or better** — great for 7–14B models.
- **Laptop with 16GB RAM, no GPU** — 3–8B models on CPU at usable speeds via llama.cpp. Slower, but fine for learning.

## If you're buying

| Budget | Pick | Runs comfortably |
|--------|------|------------------|
| Used ~$300 | RTX 3060 12GB | 7–13B Q4 |
| ~$600 | RTX 4060 Ti 16GB | 14B Q4, some 32B |
| Used ~$700 | RTX 3090 24GB | 32B Q4 — the classic value pick |
| ~$1600+ | RTX 4090 / 5090 24–32GB | 32B fast, 70B partially offloaded |
| Mac | Any M-chip, max the RAM | RAM ≈ your model budget |

## Things people over-buy

- **CPU** — nearly irrelevant once the model is on GPU.
- **Multi-GPU** — works (llama.cpp and vLLM both split models) but adds complexity; one big card beats two small ones.

## Things people under-buy

- **RAM headroom** — you want model + context + your IDE + browser to coexist.
- **VRAM** — the difference between 12GB and 24GB is the difference between "runs 13B" and "runs 32B".

Use the hardware filter in the [model catalog](/models) to match models to what you have.`,
    tags: J(["hardware", "gpu", "getting-started"]),
  },
  {
    slug: "serving-in-production", title: "From laptop to production: serving local models",
    level: "advanced", minutes: 15,
    summary: "When Ollama isn't enough: concurrent users, batching, and the jump to vLLM.",
    body: `## The scaling cliff

Ollama and llama.cpp are optimized for **one user at a time**. Serve 20 concurrent users and each request queues behind the last. Production serving needs different machinery:

- **Continuous batching** — new requests join the GPU batch mid-flight instead of waiting.
- **PagedAttention** — KV-cache memory managed like virtual memory pages, so long and short requests share VRAM efficiently.

This is what **vLLM** does. Same model, same GPU, often 10–20× the aggregate throughput.

## Minimal vLLM deployment

\`\`\`bash
pip install vllm
python -m vllm.entrypoints.openai.api_server \\
  --model Qwen/Qwen2.5-7B-Instruct-AWQ \\
  --quantization awq \\
  --max-model-len 16384
\`\`\`

You get an OpenAI-compatible endpoint on :8000 that handles concurrency properly.

Note vLLM uses **AWQ/GPTQ** quantized models (GPU-native formats), not GGUF.

## Checklist before you ship

1. **Load test** with realistic prompt/response lengths (\`vllm bench\` or k6). Watch P95 time-to-first-token and tokens/sec.
2. **Cap max-model-len** — context length reserves KV-cache VRAM whether used or not.
3. **Put a gateway in front** — auth, rate limits, and request logging don't belong in the inference server.
4. **Pin versions** — model file hash and server version together; treat them as one deployable artifact.
5. **Plan for failure** — a single GPU box is a single point of failure; run two replicas behind a load balancer if it matters.

## When to stay on Ollama

Internal tool with a handful of users? Ollama behind a reverse proxy is honestly fine. Reach for vLLM when concurrency, throughput or latency SLOs force you to.`,
    tags: J(["production", "vllm", "serving", "advanced"]),
  },
];

export function seed({ force = false } = {}) {
  migrate();
  const count = db.prepare("SELECT COUNT(*) AS c FROM models").get().c;
  if (count > 0 && !force) return { seeded: false };

  if (force) {
    db.exec("DELETE FROM favorites; DELETE FROM models; DELETE FROM tools; DELETE FROM guides;");
  }

  const insertModel = db.prepare(`
    INSERT INTO models (slug, name, family, type, params_b, context_window, license,
      min_ram_gb, min_vram_gb, quantizations, description, tags, homepage)
    VALUES (@slug, @name, @family, @type, @params_b, @context_window, @license,
      @min_ram_gb, @min_vram_gb, @quantizations, @description, @tags, @homepage)
  `);
  const insertTool = db.prepare(`
    INSERT INTO tools (slug, name, category, language, difficulty, gpu_support, platforms,
      description, tags, repo_url)
    VALUES (@slug, @name, @category, @language, @difficulty, @gpu_support, @platforms,
      @description, @tags, @repo_url)
  `);
  const insertGuide = db.prepare(`
    INSERT INTO guides (slug, title, level, minutes, summary, body, tags)
    VALUES (@slug, @title, @level, @minutes, @summary, @body, @tags)
  `);

  db.transaction(() => {
    models.forEach((m) => insertModel.run(m));
    tools.forEach((t) => insertTool.run(t));
    guides.forEach((g) => insertGuide.run(g));
  })();

  return { seeded: true, models: models.length, tools: tools.length, guides: guides.length };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const result = seed({ force: process.argv.includes("--force") });
  console.log(result.seeded ? `Seeded ${result.models} models, ${result.tools} tools, ${result.guides} guides.` : "Database already seeded (use --force to reseed).");
}
