import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import { createDb } from './index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '../../data');
const dbPath = process.env.LOCI_DB_PATH || path.join(dataDir, 'loci.db');

fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = createDb(dbPath);

const tools = [
  {
    slug: 'ollama',
    name: 'Ollama',
    category: 'runtime',
    description: 'The easiest way to run open models locally with a simple CLI and REST API.',
    long_description:
      'Ollama wraps model download, quantization management, and a local OpenAI-compatible API into one binary. Pull a model, then chat from the terminal or hit http://localhost:11434. Ideal first stop for developers learning local inference.',
    website_url: 'https://ollama.com',
    github_url: 'https://github.com/ollama/ollama',
    install_hint: 'curl -fsSL https://ollama.com/install.sh | sh',
    tags: JSON.stringify(['cli', 'api', 'macos', 'linux', 'windows', 'openai-compatible']),
    platforms: JSON.stringify(['macOS', 'Linux', 'Windows']),
    difficulty: 'beginner',
    featured: 1,
  },
  {
    slug: 'lm-studio',
    name: 'LM Studio',
    category: 'runtime',
    description: 'Desktop app for discovering, downloading, and chatting with local GGUF models.',
    long_description:
      'LM Studio gives you a GUI for browsing Hugging Face GGUF models, loading them with llama.cpp under the hood, and exposing a local OpenAI-compatible server. Great when you want visual control over context, GPU offload, and chat templates.',
    website_url: 'https://lmstudio.ai',
    github_url: null,
    install_hint: 'Download the desktop app from lmstudio.ai',
    tags: JSON.stringify(['gui', 'gguf', 'openai-compatible', 'huggingface']),
    platforms: JSON.stringify(['macOS', 'Linux', 'Windows']),
    difficulty: 'beginner',
    featured: 1,
  },
  {
    slug: 'llama-cpp',
    name: 'llama.cpp',
    category: 'runtime',
    description: 'High-performance C/C++ inference for GGUF models on CPU and GPU.',
    long_description:
      'llama.cpp is the foundation underneath many local runtimes. It pioneered efficient GGUF quantization and runs well on laptops without a discrete GPU. Use it directly when you need maximum control or want to embed inference in a native app.',
    website_url: 'https://github.com/ggerganov/llama.cpp',
    github_url: 'https://github.com/ggerganov/llama.cpp',
    install_hint: 'git clone https://github.com/ggerganov/llama.cpp && cmake -B build && cmake --build build --config Release',
    tags: JSON.stringify(['c++', 'gguf', 'cpu', 'gpu', 'embeddable']),
    platforms: JSON.stringify(['macOS', 'Linux', 'Windows', 'Android']),
    difficulty: 'intermediate',
    featured: 1,
  },
  {
    slug: 'vllm',
    name: 'vLLM',
    category: 'runtime',
    description: 'High-throughput serving engine for local or self-hosted LLM APIs.',
    long_description:
      'vLLM focuses on throughput with PagedAttention and continuous batching. If you are serving models to a team on a workstation or small GPU box, it is a strong OpenAI-compatible option beyond single-user chat UIs.',
    website_url: 'https://docs.vllm.ai',
    github_url: 'https://github.com/vllm-project/vllm',
    install_hint: 'pip install vllm',
    tags: JSON.stringify(['python', 'serving', 'gpu', 'openai-compatible', 'throughput']),
    platforms: JSON.stringify(['Linux']),
    difficulty: 'advanced',
    featured: 0,
  },
  {
    slug: 'open-webui',
    name: 'Open WebUI',
    category: 'interface',
    description: 'Polished ChatGPT-style UI that talks to Ollama and other local backends.',
    long_description:
      'Open WebUI sits in front of Ollama (or OpenAI-compatible servers) and adds conversations, RAG document collections, tools, and multi-user auth. Perfect for turning a local model into a shared team workspace.',
    website_url: 'https://openwebui.com',
    github_url: 'https://github.com/open-webui/open-webui',
    install_hint: 'docker run -d -p 3000:8080 --add-host=host.docker.internal:host-gateway ghcr.io/open-webui/open-webui:main',
    tags: JSON.stringify(['ui', 'rag', 'docker', 'ollama']),
    platforms: JSON.stringify(['Docker', 'macOS', 'Linux', 'Windows']),
    difficulty: 'beginner',
    featured: 1,
  },
  {
    slug: 'continue-dev',
    name: 'Continue',
    category: 'devtools',
    description: 'Open-source AI coding assistant that can use local models in VS Code and JetBrains.',
    long_description:
      'Continue lets you keep code completions and chat inside your IDE while pointing at Ollama, LM Studio, or other local endpoints. A practical path to private, offline-friendly AI pair programming.',
    website_url: 'https://continue.dev',
    github_url: 'https://github.com/continuedev/continue',
    install_hint: 'Install the Continue extension from the VS Code marketplace, then set provider to Ollama.',
    tags: JSON.stringify(['ide', 'coding', 'vscode', 'jetbrains', 'privacy']),
    platforms: JSON.stringify(['VS Code', 'JetBrains']),
    difficulty: 'beginner',
    featured: 1,
  },
  {
    slug: 'anythingllm',
    name: 'AnythingLLM',
    category: 'rag',
    description: 'Desktop and Docker RAG app for chatting with your documents privately.',
    long_description:
      'AnythingLLM wires local or remote LLMs to vector stores and document workspaces. Useful when you want retrieval-augmented generation without sending PDFs to a cloud vendor.',
    website_url: 'https://anythingllm.com',
    github_url: 'https://github.com/Mintplex-Labs/anything-llm',
    install_hint: 'Download desktop builds or run via Docker from the AnythingLLM docs.',
    tags: JSON.stringify(['rag', 'documents', 'desktop', 'docker']),
    platforms: JSON.stringify(['macOS', 'Linux', 'Windows', 'Docker']),
    difficulty: 'intermediate',
    featured: 0,
  },
  {
    slug: 'gpt4all',
    name: 'GPT4All',
    category: 'runtime',
    description: 'Offline chatbot and local model ecosystem with a simple installer.',
    long_description:
      'GPT4All focuses on private, offline chat with curated local models and bindings for Python and other languages. A friendly on-ramp if you want an installable desktop experience.',
    website_url: 'https://www.nomic.ai/gpt4all',
    github_url: 'https://github.com/nomic-ai/gpt4all',
    install_hint: 'Download the desktop installer from nomic.ai/gpt4all',
    tags: JSON.stringify(['desktop', 'offline', 'python', 'bindings']),
    platforms: JSON.stringify(['macOS', 'Linux', 'Windows']),
    difficulty: 'beginner',
    featured: 0,
  },
  {
    slug: 'huggingface-transformers',
    name: 'Hugging Face Transformers',
    category: 'library',
    description: 'Python library for loading and running open models with PyTorch or other backends.',
    long_description:
      'Transformers is the research and production workhorse for experimenting with model architectures locally. Pair it with accelerate, bitsandbytes, or GGUF converters when you need training hooks or custom pipelines beyond chat UIs.',
    website_url: 'https://huggingface.co/docs/transformers',
    github_url: 'https://github.com/huggingface/transformers',
    install_hint: 'pip install transformers torch',
    tags: JSON.stringify(['python', 'pytorch', 'research', 'fine-tuning']),
    platforms: JSON.stringify(['macOS', 'Linux', 'Windows']),
    difficulty: 'advanced',
    featured: 0,
  },
  {
    slug: 'jan',
    name: 'Jan',
    category: 'interface',
    description: 'Open-source ChatGPT alternative that runs 100% offline on your machine.',
    long_description:
      'Jan is a desktop client with local model management, extensions, and an OpenAI-compatible API. Designed for privacy-first daily chat and lightweight agent workflows.',
    website_url: 'https://jan.ai',
    github_url: 'https://github.com/janhq/jan',
    install_hint: 'Download from jan.ai or install via package managers listed in the docs.',
    tags: JSON.stringify(['desktop', 'offline', 'openai-compatible', 'privacy']),
    platforms: JSON.stringify(['macOS', 'Linux', 'Windows']),
    difficulty: 'beginner',
    featured: 0,
  },
];

const models = [
  {
    slug: 'llama-3-2-3b',
    name: 'Llama 3.2 3B',
    family: 'Llama',
    description: 'Compact Meta Llama model that runs comfortably on laptops.',
    long_description:
      'Llama 3.2 3B is a strong default for local experimentation: fast responses, modest VRAM, and good instruction following for coding and summarization. Start here if you are new to local inference.',
    parameter_size: '3B',
    quantization: 'Q4_K_M',
    context_length: 128000,
    license: 'Llama 3.2 Community',
    use_cases: JSON.stringify(['chat', 'summarization', 'lightweight coding']),
    formats: JSON.stringify(['GGUF', 'safetensors']),
    min_vram_gb: 3,
    ollama_pull: 'ollama pull llama3.2:3b',
    huggingface_url: 'https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct',
    tags: JSON.stringify(['small', 'fast', 'meta', 'instruct']),
    featured: 1,
  },
  {
    slug: 'llama-3-1-8b',
    name: 'Llama 3.1 8B',
    family: 'Llama',
    description: 'Balanced quality/speed instruct model for everyday local coding and chat.',
    long_description:
      'The 8B Llama 3.1 instruct variant is a sweet spot for developers with 8–12GB VRAM or a strong Apple Silicon Mac. Better reasoning than tiny models while staying interactive.',
    parameter_size: '8B',
    quantization: 'Q4_K_M',
    context_length: 128000,
    license: 'Llama 3.1 Community',
    use_cases: JSON.stringify(['coding', 'chat', 'rag', 'agents']),
    formats: JSON.stringify(['GGUF', 'safetensors']),
    min_vram_gb: 6,
    ollama_pull: 'ollama pull llama3.1:8b',
    huggingface_url: 'https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct',
    tags: JSON.stringify(['balanced', 'coding', 'meta', 'instruct']),
    featured: 1,
  },
  {
    slug: 'mistral-7b-instruct',
    name: 'Mistral 7B Instruct',
    family: 'Mistral',
    description: 'Efficient 7B instruct model known for strong quality at a small footprint.',
    long_description:
      'Mistral 7B helped popularize high-quality small models. Still a dependable local choice for chat, drafting, and light coding when you want snappy latency.',
    parameter_size: '7B',
    quantization: 'Q4_K_M',
    context_length: 32768,
    license: 'Apache 2.0',
    use_cases: JSON.stringify(['chat', 'writing', 'light coding']),
    formats: JSON.stringify(['GGUF', 'safetensors']),
    min_vram_gb: 5,
    ollama_pull: 'ollama pull mistral:7b',
    huggingface_url: 'https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3',
    tags: JSON.stringify(['efficient', 'apache', 'instruct']),
    featured: 1,
  },
  {
    slug: 'qwen2-5-coder-7b',
    name: 'Qwen2.5-Coder 7B',
    family: 'Qwen',
    description: 'Code-specialized model that shines for local pair programming.',
    long_description:
      'Qwen2.5-Coder is tuned for software engineering tasks: completion, refactoring hints, and explaining unfamiliar code. Pair it with Continue or an OpenAI-compatible server for IDE use.',
    parameter_size: '7B',
    quantization: 'Q4_K_M',
    context_length: 32768,
    license: 'Apache 2.0',
    use_cases: JSON.stringify(['coding', 'completion', 'code review']),
    formats: JSON.stringify(['GGUF', 'safetensors']),
    min_vram_gb: 5,
    ollama_pull: 'ollama pull qwen2.5-coder:7b',
    huggingface_url: 'https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct',
    tags: JSON.stringify(['coding', 'apache', 'qwen']),
    featured: 1,
  },
  {
    slug: 'phi-3-5-mini',
    name: 'Phi-3.5 Mini',
    family: 'Phi',
    description: 'Microsoft small model optimized for reasoning on constrained hardware.',
    long_description:
      'Phi-3.5 Mini punches above its size on reasoning and instruction tasks. Excellent when RAM or VRAM is limited but you still want usable quality.',
    parameter_size: '3.8B',
    quantization: 'Q4_K_M',
    context_length: 128000,
    license: 'MIT',
    use_cases: JSON.stringify(['reasoning', 'chat', 'edge devices']),
    formats: JSON.stringify(['GGUF', 'safetensors', 'ONNX']),
    min_vram_gb: 3,
    ollama_pull: 'ollama pull phi3.5',
    huggingface_url: 'https://huggingface.co/microsoft/Phi-3.5-mini-instruct',
    tags: JSON.stringify(['small', 'reasoning', 'microsoft']),
    featured: 0,
  },
  {
    slug: 'deepseek-coder-v2-lite',
    name: 'DeepSeek Coder V2 Lite',
    family: 'DeepSeek',
    description: 'MoE coding model that delivers strong code quality with efficient activation.',
    long_description:
      'DeepSeek Coder V2 Lite uses a mixture-of-experts design so only a subset of parameters activate per token. Attractive for local coding assistants when you can afford the disk footprint.',
    parameter_size: '16B (MoE)',
    quantization: 'Q4_K_M',
    context_length: 128000,
    license: 'DeepSeek License',
    use_cases: JSON.stringify(['coding', 'repo Q&A', 'agents']),
    formats: JSON.stringify(['GGUF', 'safetensors']),
    min_vram_gb: 10,
    ollama_pull: 'ollama pull deepseek-coder-v2:lite',
    huggingface_url: 'https://huggingface.co/deepseek-ai/DeepSeek-Coder-V2-Lite-Instruct',
    tags: JSON.stringify(['coding', 'moe', 'deepseek']),
    featured: 0,
  },
  {
    slug: 'nomic-embed-text',
    name: 'nomic-embed-text',
    family: 'Nomic',
    description: 'Local embedding model for RAG pipelines and semantic search.',
    long_description:
      'Embeddings power retrieval. nomic-embed-text is a practical local embedding model for chunking docs, building vector indexes, and wiring RAG without cloud APIs.',
    parameter_size: '137M',
    quantization: 'F16',
    context_length: 8192,
    license: 'Apache 2.0',
    use_cases: JSON.stringify(['embeddings', 'rag', 'semantic search']),
    formats: JSON.stringify(['GGUF', 'safetensors']),
    min_vram_gb: 1,
    ollama_pull: 'ollama pull nomic-embed-text',
    huggingface_url: 'https://huggingface.co/nomic-ai/nomic-embed-text-v1.5',
    tags: JSON.stringify(['embeddings', 'rag', 'apache']),
    featured: 1,
  },
  {
    slug: 'gemma-2-9b',
    name: 'Gemma 2 9B',
    family: 'Gemma',
    description: 'Google open model with solid instruction following for local apps.',
    long_description:
      'Gemma 2 9B is a capable open-weight instruct model for chat and light agent work. Check hardware headroom; Q4/Q5 quantizations keep it practical on consumer GPUs.',
    parameter_size: '9B',
    quantization: 'Q4_K_M',
    context_length: 8192,
    license: 'Gemma Terms',
    use_cases: JSON.stringify(['chat', 'summarization', 'agents']),
    formats: JSON.stringify(['GGUF', 'safetensors']),
    min_vram_gb: 7,
    ollama_pull: 'ollama pull gemma2:9b',
    huggingface_url: 'https://huggingface.co/google/gemma-2-9b-it',
    tags: JSON.stringify(['google', 'instruct', 'chat']),
    featured: 0,
  },
];

const guides = [
  {
    slug: 'what-is-local-ai',
    title: 'What is local AI?',
    summary: 'A plain-language intro to running models on your own machine instead of calling cloud APIs.',
    body: `# What is local AI?

Local AI means the model weights and inference run on hardware you control — your laptop, workstation, or homelab — instead of a remote provider.

## Why developers care

- **Privacy**: source code and proprietary docs never leave your machine.
- **Cost control**: no per-token bills once hardware is paid for.
- **Latency & offline**: useful on planes, air-gapped networks, and demos.
- **Learning**: you see quantization, context windows, and serving trade-offs up close.

## The basic loop

1. Install a runtime (Ollama, LM Studio, or llama.cpp).
2. Download a quantized model (often GGUF).
3. Chat via CLI/UI or call a local HTTP API from your app.
4. Optionally add RAG, tooling, or IDE integrations.

Local AI is not “worse cloud AI.” It is a different deployment choice with different constraints — and for many developer workflows, those constraints are features.`,
    level: 'intro',
    reading_minutes: 4,
    tags: JSON.stringify(['fundamentals', 'privacy', 'overview']),
  },
  {
    slug: 'choose-your-first-stack',
    title: 'Choose your first local stack',
    summary: 'Pick a beginner-friendly combination of runtime, model, and interface.',
    body: `# Choose your first local stack

You do not need a research cluster. A solid starter path:

## Path A — fastest hello world

1. Install **Ollama**
2. Run \`ollama pull llama3.2:3b\`
3. Run \`ollama run llama3.2:3b\`
4. Optional: point **Continue** or **Open WebUI** at Ollama

## Path B — visual explorer

1. Install **LM Studio**
2. Download a small GGUF instruct model
3. Start the local server
4. Hit the OpenAI-compatible endpoint from a script

## Hardware heuristics

- **8GB unified/RAM**: stay around 3B–7B Q4 models
- **16GB+**: 7B–8B comfortably; try 13B–14B carefully
- **Dedicated GPU 8–12GB**: excellent for 7B–8B and light serving

Start small, measure tokens/sec, then scale model size only when quality demands it.`,
    level: 'intro',
    reading_minutes: 5,
    tags: JSON.stringify(['getting-started', 'hardware', 'ollama']),
  },
  {
    slug: 'gguf-and-quantization',
    title: 'GGUF and quantization, explained',
    summary: 'Why almost every local chat app talks about Q4_K_M and what those letters mean.',
    body: `# GGUF and quantization, explained

**GGUF** is a file format popularized by llama.cpp for storing models (and metadata) in a way that is efficient to load for inference.

**Quantization** reduces the numeric precision of weights (for example from 16-bit floats to 4-bit integers) so models use less memory and run faster — usually with a small quality trade-off.

## Common quant names

- **Q4_K_M**: popular default balance of size and quality
- **Q5_K_M / Q6_K**: higher fidelity, larger files
- **Q8_0**: near-original quality, much heavier
- **IQ** variants: newer methods aiming for better quality at low bitrates

## Practical advice

For first projects, prefer a well-known **Q4_K_M** instruct GGUF. If answers feel muddy and you have headroom, bump to Q5. If the model will not load, drop size (3B instead of 8B) before chasing exotic quants.`,
    level: 'intro',
    reading_minutes: 6,
    tags: JSON.stringify(['gguf', 'quantization', 'performance']),
  },
  {
    slug: 'local-openai-compatible-apis',
    title: 'Talk to local models like OpenAI',
    summary: 'Use familiar chat-completions clients against Ollama, LM Studio, and vLLM.',
    body: `# Talk to local models like OpenAI

Most local runtimes expose an **OpenAI-compatible** HTTP API. That means your existing SDKs often work with a base URL change.

## Typical endpoints

- Ollama: \`http://localhost:11434/v1\`
- LM Studio: \`http://localhost:1234/v1\`
- vLLM: configurable, often \`http://localhost:8000/v1\`

## Minimal fetch example

\`\`\`js
const res = await fetch('http://localhost:11434/v1/chat/completions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'llama3.2:3b',
    messages: [{ role: 'user', content: 'Explain GGUF in one paragraph.' }],
  }),
});
const data = await res.json();
console.log(data.choices[0].message.content);
\`\`\`

This pattern is how IDE plugins, agents, and your own backend services stay portable across cloud and local providers.`,
    level: 'intermediate',
    reading_minutes: 7,
    tags: JSON.stringify(['api', 'openai-compatible', 'integration']),
  },
  {
    slug: 'local-rag-basics',
    title: 'Local RAG basics',
    summary: 'Ground answers in your own files without uploading them to a vendor.',
    body: `# Local RAG basics

**Retrieval-Augmented Generation (RAG)** means: embed documents, retrieve relevant chunks, then pass those chunks into the model prompt.

## Local pipeline

1. Chunk markdown/PDFs/code
2. Embed with a local model (e.g. nomic-embed-text)
3. Store vectors (sqlite-vss, Chroma, LanceDB, etc.)
4. On query: retrieve top-k chunks → prompt LLM

## Why local RAG matters

Source code, design docs, and customer notes often cannot leave the building. Local embeddings + local LLMs keep the whole loop on-device.

Tools like **AnythingLLM** and **Open WebUI** package this flow; building it yourself teaches the real failure modes (bad chunking, weak retrieval, context stuffing).`,
    level: 'intermediate',
    reading_minutes: 8,
    tags: JSON.stringify(['rag', 'embeddings', 'privacy']),
  },
  {
    slug: 'ide-coding-with-local-models',
    title: 'IDE coding with local models',
    summary: 'Wire Continue (or similar) to Ollama for private pair programming.',
    body: `# IDE coding with local models

Cloud coding assistants are convenient. Local ones are controllable.

## Suggested setup

1. Run **Ollama** with a coding model (\`qwen2.5-coder:7b\` or \`llama3.1:8b\`)
2. Install **Continue** in VS Code
3. Set the model provider to Ollama / OpenAI-compatible
4. Use chat for refactors and tab completion where supported

## Tips

- Prefer coding-tuned models for completion quality
- Keep context focused — paste the file region that matters
- For large repos, combine with local RAG over your codebase

You get autocomplete and explanations without shipping proprietary code to a third party.`,
    level: 'intro',
    reading_minutes: 5,
    tags: JSON.stringify(['coding', 'ide', 'continue', 'privacy']),
  },
];

const insertTool = db.prepare(`
  INSERT OR REPLACE INTO tools (
    slug, name, category, description, long_description, website_url, github_url,
    install_hint, tags, platforms, difficulty, featured
  ) VALUES (
    @slug, @name, @category, @description, @long_description, @website_url, @github_url,
    @install_hint, @tags, @platforms, @difficulty, @featured
  )
`);

const insertModel = db.prepare(`
  INSERT OR REPLACE INTO models (
    slug, name, family, description, long_description, parameter_size, quantization,
    context_length, license, use_cases, formats, min_vram_gb, ollama_pull,
    huggingface_url, tags, featured
  ) VALUES (
    @slug, @name, @family, @description, @long_description, @parameter_size, @quantization,
    @context_length, @license, @use_cases, @formats, @min_vram_gb, @ollama_pull,
    @huggingface_url, @tags, @featured
  )
`);

const insertGuide = db.prepare(`
  INSERT OR REPLACE INTO guides (
    slug, title, summary, body, level, reading_minutes, tags, published
  ) VALUES (
    @slug, @title, @summary, @body, @level, @reading_minutes, @tags, 1
  )
`);

const seed = db.transaction(() => {
  for (const tool of tools) insertTool.run(tool);
  for (const model of models) insertModel.run(model);
  for (const guide of guides) insertGuide.run(guide);
});

seed();

console.log(`Seeded ${tools.length} tools, ${models.length} models, ${guides.length} guides → ${dbPath}`);
db.close();
