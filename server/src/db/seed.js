import { db, initSchema } from './index.js';

const TOOLS = [
  {
    slug: 'ollama',
    name: 'Ollama',
    tagline: 'Run large language models locally with a single command.',
    description:
      'Ollama is the fastest way to get started with local LLMs. Pull a model with `ollama run llama3.1` and it downloads, quantizes and serves it behind a clean CLI and an OpenAI-compatible REST API on port 11434.',
    category: 'runtime',
    homepage: 'https://ollama.com',
    repo_url: 'https://github.com/ollama/ollama',
    license: 'MIT',
    platforms: 'macos,linux,windows',
    tags: 'cli,api,gguf,openai-compatible,beginner-friendly',
    stars: 98000,
  },
  {
    slug: 'lm-studio',
    name: 'LM Studio',
    tagline: 'A polished desktop app for discovering and running local models.',
    description:
      'LM Studio gives you a friendly GUI to browse Hugging Face, download GGUF models, chat with them, and spin up a local inference server — no terminal required.',
    category: 'desktop-app',
    homepage: 'https://lmstudio.ai',
    repo_url: '',
    license: 'Proprietary (free for personal use)',
    platforms: 'macos,linux,windows',
    tags: 'gui,gguf,server,discovery,beginner-friendly',
    stars: 0,
  },
  {
    slug: 'llama-cpp',
    name: 'llama.cpp',
    tagline: 'The high-performance C/C++ inference engine behind most local tools.',
    description:
      'llama.cpp is the foundational project that made CPU/GPU LLM inference practical on consumer hardware. It defines the GGUF format and powers Ollama, LM Studio, KoboldCpp and many more.',
    category: 'runtime',
    homepage: 'https://github.com/ggml-org/llama.cpp',
    repo_url: 'https://github.com/ggml-org/llama.cpp',
    license: 'MIT',
    platforms: 'macos,linux,windows',
    tags: 'engine,gguf,quantization,c++,performance',
    stars: 71000,
  },
  {
    slug: 'vllm',
    name: 'vLLM',
    tagline: 'High-throughput, production-grade LLM serving.',
    description:
      'vLLM uses PagedAttention to serve models with very high throughput and an OpenAI-compatible API. It is the go-to choice for GPU servers hosting many concurrent requests.',
    category: 'serving',
    homepage: 'https://docs.vllm.ai',
    repo_url: 'https://github.com/vllm-project/vllm',
    license: 'Apache-2.0',
    platforms: 'linux',
    tags: 'gpu,throughput,serving,openai-compatible,production',
    stars: 33000,
  },
  {
    slug: 'localai',
    name: 'LocalAI',
    tagline: 'A drop-in OpenAI API replacement you self-host.',
    description:
      'LocalAI exposes OpenAI-compatible endpoints for chat, embeddings, image and audio, backed by local models. Great for swapping cloud APIs out of an existing app without code changes.',
    category: 'serving',
    homepage: 'https://localai.io',
    repo_url: 'https://github.com/mudler/LocalAI',
    license: 'MIT',
    platforms: 'macos,linux,windows',
    tags: 'openai-compatible,api,embeddings,images,audio',
    stars: 27000,
  },
  {
    slug: 'open-webui',
    name: 'Open WebUI',
    tagline: 'A self-hosted, ChatGPT-style interface for local models.',
    description:
      'Open WebUI is a feature-rich web front-end for Ollama and OpenAI-compatible backends: multi-user chat, RAG over documents, model management and a plugin system.',
    category: 'ui',
    homepage: 'https://openwebui.com',
    repo_url: 'https://github.com/open-webui/open-webui',
    license: 'MIT',
    platforms: 'linux,macos,windows',
    tags: 'chat-ui,rag,multi-user,self-hosted,docker',
    stars: 52000,
  },
  {
    slug: 'jan',
    name: 'Jan',
    tagline: 'An open-source, offline ChatGPT alternative for your desktop.',
    description:
      'Jan is a privacy-first desktop app that runs models fully offline. It ships with a local API server and a clean chat interface, and works with GGUF models out of the box.',
    category: 'desktop-app',
    homepage: 'https://jan.ai',
    repo_url: 'https://github.com/janhq/jan',
    license: 'AGPL-3.0',
    platforms: 'macos,linux,windows',
    tags: 'gui,offline,privacy,gguf,api',
    stars: 26000,
  },
  {
    slug: 'gpt4all',
    name: 'GPT4All',
    tagline: 'Private, offline chatbots that run on everyday laptops.',
    description:
      'GPT4All from Nomic focuses on running capable assistants on CPUs with modest RAM, including local document chat (LocalDocs) for private RAG.',
    category: 'desktop-app',
    homepage: 'https://www.nomic.ai/gpt4all',
    repo_url: 'https://github.com/nomic-ai/gpt4all',
    license: 'MIT',
    platforms: 'macos,linux,windows',
    tags: 'gui,cpu,privacy,rag,beginner-friendly',
    stars: 71000,
  },
  {
    slug: 'text-generation-webui',
    name: 'Text Generation WebUI',
    tagline: 'The "Swiss-army knife" web UI for text generation.',
    description:
      "Oobabooga's Text Generation WebUI supports many backends (llama.cpp, Transformers, ExLlama), fine-tuning with LoRA, extensions and an API — popular with power users.",
    category: 'ui',
    homepage: 'https://github.com/oobabooga/text-generation-webui',
    repo_url: 'https://github.com/oobabooga/text-generation-webui',
    license: 'AGPL-3.0',
    platforms: 'macos,linux,windows',
    tags: 'web-ui,multi-backend,lora,extensions,power-user',
    stars: 40000,
  },
  {
    slug: 'koboldcpp',
    name: 'KoboldCpp',
    tagline: 'A single-file, easy-to-run llama.cpp distribution.',
    description:
      'KoboldCpp bundles llama.cpp with a UI into one executable, popular for storytelling and role-play, with GPU offload and a simple API.',
    category: 'runtime',
    homepage: 'https://github.com/LostRuins/koboldcpp',
    repo_url: 'https://github.com/LostRuins/koboldcpp',
    license: 'AGPL-3.0',
    platforms: 'windows,linux,macos',
    tags: 'single-file,gguf,gpu-offload,storytelling',
    stars: 6000,
  },
  {
    slug: 'anythingllm',
    name: 'AnythingLLM',
    tagline: 'An all-in-one desktop & docker app for private RAG.',
    description:
      'AnythingLLM lets you build workspaces that chat with your documents using local models and vector stores, with agents and multi-user support.',
    category: 'ui',
    homepage: 'https://anythingllm.com',
    repo_url: 'https://github.com/Mintplex-Labs/anything-llm',
    license: 'MIT',
    platforms: 'macos,linux,windows',
    tags: 'rag,agents,workspaces,vector-db,self-hosted',
    stars: 30000,
  },
  {
    slug: 'continue',
    name: 'Continue',
    tagline: 'An open-source AI code assistant for VS Code & JetBrains.',
    description:
      'Continue brings autocomplete and chat into your editor and can point entirely at local models via Ollama or an OpenAI-compatible endpoint — a private Copilot alternative.',
    category: 'dev-tool',
    homepage: 'https://continue.dev',
    repo_url: 'https://github.com/continuedev/continue',
    license: 'Apache-2.0',
    platforms: 'macos,linux,windows',
    tags: 'ide,autocomplete,coding,ollama,copilot-alternative',
    stars: 20000,
  },
  {
    slug: 'tabby',
    name: 'Tabby',
    tagline: 'A self-hosted AI coding assistant you fully own.',
    description:
      'Tabby is a self-hosted alternative to GitHub Copilot: run a code-completion server on your own GPU and connect your IDE, with no code leaving your network.',
    category: 'dev-tool',
    homepage: 'https://tabby.tabbyml.com',
    repo_url: 'https://github.com/TabbyML/tabby',
    license: 'Apache-2.0',
    platforms: 'linux,macos,windows',
    tags: 'coding,self-hosted,completion,gpu,copilot-alternative',
    stars: 22000,
  },
  {
    slug: 'litellm',
    name: 'LiteLLM',
    tagline: 'One SDK & proxy to call 100+ LLM APIs, local or cloud.',
    description:
      'LiteLLM gives you a unified OpenAI-style interface and a proxy/gateway with routing, budgets and logging — handy for mixing local models with fallbacks.',
    category: 'dev-tool',
    homepage: 'https://litellm.ai',
    repo_url: 'https://github.com/BerriAI/litellm',
    license: 'MIT',
    platforms: 'macos,linux,windows',
    tags: 'sdk,proxy,gateway,routing,python',
    stars: 15000,
  },
  {
    slug: 'comfyui',
    name: 'ComfyUI',
    tagline: 'A node-based UI for local image & video diffusion models.',
    description:
      'ComfyUI is a powerful, graph-based interface for Stable Diffusion and other diffusion models, giving fine-grained control over local image and video generation.',
    category: 'image-gen',
    homepage: 'https://www.comfy.org',
    repo_url: 'https://github.com/comfyanonymous/ComfyUI',
    license: 'GPL-3.0',
    platforms: 'macos,linux,windows',
    tags: 'image-gen,diffusion,nodes,workflow,gpu',
    stars: 60000,
  },
  {
    slug: 'whisper-cpp',
    name: 'whisper.cpp',
    tagline: 'Fast, local speech-to-text with OpenAI Whisper.',
    description:
      'whisper.cpp is a dependency-free C/C++ port of Whisper for on-device transcription, running efficiently on CPU and Apple Silicon.',
    category: 'audio',
    homepage: 'https://github.com/ggml-org/whisper.cpp',
    repo_url: 'https://github.com/ggml-org/whisper.cpp',
    license: 'MIT',
    platforms: 'macos,linux,windows',
    tags: 'speech-to-text,audio,transcription,cpu,offline',
    stars: 36000,
  },
];

const MODELS = [
  {
    slug: 'llama-3.1-8b-instruct',
    name: 'Llama 3.1 8B Instruct',
    family: 'Llama',
    publisher: 'Meta',
    description:
      'A strong, well-rounded 8B instruction-tuned model with a 128K context window. An excellent default for general chat and assistants on consumer GPUs.',
    parameters: '8B',
    quantizations: 'Q4_K_M,Q5_K_M,Q8_0,FP16',
    context_len: 131072,
    modality: 'text',
    license: 'Llama 3.1 Community',
    min_ram_gb: 8,
    tags: 'general,chat,assistant,long-context',
    downloads: 5200000,
  },
  {
    slug: 'llama-3.2-3b-instruct',
    name: 'Llama 3.2 3B Instruct',
    family: 'Llama',
    publisher: 'Meta',
    description:
      'A compact 3B model that runs comfortably on laptops and even some phones, while still handling instructions and summarization well.',
    parameters: '3B',
    quantizations: 'Q4_K_M,Q5_K_M,Q8_0',
    context_len: 131072,
    modality: 'text',
    license: 'Llama 3.2 Community',
    min_ram_gb: 4,
    tags: 'small,edge,laptop,efficient',
    downloads: 2600000,
  },
  {
    slug: 'mistral-7b-instruct-v0.3',
    name: 'Mistral 7B Instruct v0.3',
    family: 'Mistral',
    publisher: 'Mistral AI',
    description:
      'A fast, Apache-2.0 licensed 7B model that punches above its weight. A perennial favorite for local deployments and fine-tuning.',
    parameters: '7B',
    quantizations: 'Q4_K_M,Q5_K_M,Q8_0,FP16',
    context_len: 32768,
    modality: 'text',
    license: 'Apache-2.0',
    min_ram_gb: 8,
    tags: 'general,fast,permissive,fine-tune',
    downloads: 4100000,
  },
  {
    slug: 'mixtral-8x7b-instruct',
    name: 'Mixtral 8x7B Instruct',
    family: 'Mistral',
    publisher: 'Mistral AI',
    description:
      'A sparse mixture-of-experts model with the quality of a much larger model but the inference cost of ~13B active parameters. Needs more RAM/VRAM.',
    parameters: '8x7B',
    quantizations: 'Q3_K_M,Q4_K_M,Q5_K_M',
    context_len: 32768,
    modality: 'text',
    license: 'Apache-2.0',
    min_ram_gb: 28,
    tags: 'moe,high-quality,reasoning',
    downloads: 1800000,
  },
  {
    slug: 'qwen2.5-7b-instruct',
    name: 'Qwen2.5 7B Instruct',
    family: 'Qwen',
    publisher: 'Alibaba',
    description:
      'A very capable multilingual 7B model with strong math, coding and structured-output performance. Comes in many sizes from 0.5B to 72B.',
    parameters: '7B',
    quantizations: 'Q4_K_M,Q5_K_M,Q8_0',
    context_len: 131072,
    modality: 'text',
    license: 'Apache-2.0',
    min_ram_gb: 8,
    tags: 'multilingual,math,coding,long-context',
    downloads: 3300000,
  },
  {
    slug: 'gemma-2-9b-it',
    name: 'Gemma 2 9B Instruct',
    family: 'Gemma',
    publisher: 'Google',
    description:
      "Google's open 9B model with excellent quality for its size, good for chat and reasoning on a single mid-range GPU.",
    parameters: '9B',
    quantizations: 'Q4_K_M,Q5_K_M,Q8_0',
    context_len: 8192,
    modality: 'text',
    license: 'Gemma',
    min_ram_gb: 10,
    tags: 'general,chat,reasoning',
    downloads: 1500000,
  },
  {
    slug: 'phi-3.5-mini-instruct',
    name: 'Phi-3.5 Mini Instruct',
    family: 'Phi',
    publisher: 'Microsoft',
    description:
      'A 3.8B "small language model" trained on high-quality data, offering surprisingly strong reasoning at a tiny footprint with a 128K context.',
    parameters: '3.8B',
    quantizations: 'Q4_K_M,Q5_K_M,Q8_0',
    context_len: 131072,
    modality: 'text',
    license: 'MIT',
    min_ram_gb: 4,
    tags: 'small,reasoning,efficient,long-context',
    downloads: 1200000,
  },
  {
    slug: 'deepseek-coder-v2-lite',
    name: 'DeepSeek-Coder-V2 Lite Instruct',
    family: 'DeepSeek',
    publisher: 'DeepSeek',
    description:
      'A 16B MoE code model (2.4B active) with excellent coding and fill-in-the-middle performance, ideal for a local coding assistant.',
    parameters: '16B (MoE)',
    quantizations: 'Q4_K_M,Q5_K_M,Q8_0',
    context_len: 131072,
    modality: 'code',
    license: 'DeepSeek License',
    min_ram_gb: 12,
    tags: 'coding,moe,fim,assistant',
    downloads: 900000,
  },
  {
    slug: 'codellama-13b-instruct',
    name: 'Code Llama 13B Instruct',
    family: 'Llama',
    publisher: 'Meta',
    description:
      'A code-specialized Llama model for generation and explanation, a solid self-hosted backend for editor assistants like Continue and Tabby.',
    parameters: '13B',
    quantizations: 'Q4_K_M,Q5_K_M',
    context_len: 16384,
    modality: 'code',
    license: 'Llama 2 Community',
    min_ram_gb: 12,
    tags: 'coding,completion,assistant',
    downloads: 1100000,
  },
  {
    slug: 'llava-1.6-7b',
    name: 'LLaVA 1.6 7B',
    family: 'LLaVA',
    publisher: 'LLaVA Team',
    description:
      'A vision-language model that can look at images and answer questions about them, runnable locally through llama.cpp and Ollama.',
    parameters: '7B',
    quantizations: 'Q4_K_M,Q5_K_M',
    context_len: 4096,
    modality: 'vision',
    license: 'Apache-2.0',
    min_ram_gb: 8,
    tags: 'vision,multimodal,image-understanding',
    downloads: 700000,
  },
  {
    slug: 'nomic-embed-text-v1.5',
    name: 'Nomic Embed Text v1.5',
    family: 'Nomic Embed',
    publisher: 'Nomic',
    description:
      'A high-quality, open text-embedding model with a large context window — a great local choice for RAG and semantic search.',
    parameters: '137M',
    quantizations: 'F16,Q8_0',
    context_len: 8192,
    modality: 'embedding',
    license: 'Apache-2.0',
    min_ram_gb: 2,
    tags: 'embeddings,rag,search,retrieval',
    downloads: 2000000,
  },
  {
    slug: 'whisper-large-v3',
    name: 'Whisper Large v3',
    family: 'Whisper',
    publisher: 'OpenAI',
    description:
      'A robust multilingual speech-to-text model. Run it locally with whisper.cpp for private, offline transcription and translation.',
    parameters: '1.5B',
    quantizations: 'F16,Q5_0,Q8_0',
    context_len: 0,
    modality: 'audio',
    license: 'MIT',
    min_ram_gb: 4,
    tags: 'speech-to-text,transcription,multilingual,audio',
    downloads: 1600000,
  },
];

const GUIDES = [
  {
    slug: 'what-is-local-ai',
    title: 'What is Local AI (and why should devs care)?',
    summary:
      'Understand what "running AI locally" means, how it differs from cloud APIs, and the trade-offs around privacy, cost, latency and control.',
    level: 'beginner',
    minutes: 6,
    tags: 'concepts,intro,privacy',
    sort_order: 1,
    body: `## What is Local AI?

Local AI means running machine-learning models — most commonly large language models (LLMs) — **on hardware you control** instead of calling a hosted cloud API like OpenAI or Anthropic. That hardware might be your laptop, a workstation with a GPU, a home server, or a private server in your company's network.

## Why developers care

- **Privacy & compliance** — prompts and data never leave your machine. Great for regulated data or sensitive code.
- **Cost** — no per-token billing. Once you have the hardware, inference is effectively free.
- **Offline & reliability** — no internet dependency, no rate limits, no surprise API deprecations.
- **Control & customization** — pick exact model versions, tune sampling, and fine-tune on your own data.
- **Learning** — running the whole stack yourself is the best way to understand how these systems actually work.

## The trade-offs

- **Quality ceiling** — the very largest frontier models are hard to run locally; local models are catching up fast but a 7B model is not GPT-4.
- **Hardware** — you need enough RAM/VRAM (see the hardware guide).
- **Ops** — you own updates, serving and scaling.

## The typical local stack

1. A **runtime/engine** (e.g. \`llama.cpp\`) that executes the model.
2. A **model file**, usually in the **GGUF** format, downloaded from Hugging Face.
3. A **friendly layer** on top — a CLI/app like Ollama or LM Studio, or a server exposing an OpenAI-compatible API.
4. Your **application** talking to that API.

Head to the next guide to get a model running in about five minutes.`,
  },
  {
    slug: 'run-your-first-model-with-ollama',
    title: 'Run your first local model with Ollama in 5 minutes',
    summary:
      'Install Ollama, pull a model, chat with it from the terminal, and call it from code via the OpenAI-compatible API.',
    level: 'beginner',
    minutes: 5,
    tags: 'ollama,quickstart,api',
    sort_order: 2,
    body: `## 1. Install Ollama

Download it from [ollama.com](https://ollama.com) (macOS, Windows, Linux). On Linux:

\`\`\`bash
curl -fsSL https://ollama.com/install.sh | sh
\`\`\`

## 2. Pull and chat with a model

\`\`\`bash
ollama run llama3.1
\`\`\`

The first run downloads the model; after that it starts instantly. Type a message and you're chatting with a fully local model.

## 3. Call it from your code

Ollama serves an **OpenAI-compatible** API on \`http://localhost:11434\`. You can use the official OpenAI SDK and just change the base URL:

\`\`\`js
import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: 'http://localhost:11434/v1',
  apiKey: 'ollama', // required by the SDK but ignored locally
});

const res = await client.chat.completions.create({
  model: 'llama3.1',
  messages: [{ role: 'user', content: 'Explain local AI in one sentence.' }],
});

console.log(res.choices[0].message.content);
\`\`\`

## 4. Next steps

- Try other models: \`ollama pull qwen2.5\`, \`ollama pull mistral\`.
- Add a UI like **Open WebUI**.
- Read the quantization guide to fit bigger models on your machine.`,
  },
  {
    slug: 'pick-a-model-for-your-hardware',
    title: 'Choosing a model that fits your hardware',
    summary:
      'A practical rule of thumb for matching model size and quantization to your RAM/VRAM so things actually run fast.',
    level: 'beginner',
    minutes: 7,
    tags: 'hardware,vram,models',
    sort_order: 3,
    body: `## The core question: will it fit in memory?

Inference speed collapses the moment a model spills out of fast memory (VRAM on a GPU, unified memory on Apple Silicon, or system RAM on CPU). So the first job is picking a size that fits.

## A rough sizing rule

For a quantized GGUF model, estimate memory as:

> **memory ≈ parameters (billions) × bytes-per-weight + overhead**

At the common **Q4** quantization (~0.5–0.6 GB per billion params), plus a couple GB for context:

| Model size | Approx. RAM/VRAM at Q4 | Good for |
|------------|------------------------|----------|
| 3B         | ~3–4 GB                | laptops, edge |
| 7–8B       | ~6–8 GB                | most laptops/desktops |
| 13B        | ~10–12 GB             | 12–16 GB GPUs |
| 8x7B / 30B | ~24–32 GB             | high-end GPUs / 32 GB Macs |
| 70B        | ~40+ GB               | multi-GPU / 64 GB+ |

## Tips

- **Start small**, confirm speed, then size up until it gets slow.
- On a GPU, keep the whole model in **VRAM**; partial CPU offload is much slower.
- Apple Silicon shares memory, so a 32 GB Mac can run surprisingly large models.
- Leave headroom for the **context window** — long contexts use more memory.

Use the **Models** page filters (e.g. "Max RAM") to list only models that fit your machine.`,
  },
  {
    slug: 'understanding-quantization-gguf',
    title: 'Understanding quantization: GGUF, Q4 vs Q8 and friends',
    summary:
      'What quantization does, how to read names like Q4_K_M, and how to trade quality for size and speed.',
    level: 'intermediate',
    minutes: 8,
    tags: 'quantization,gguf,performance',
    sort_order: 4,
    body: `## Why quantize?

Models are trained in 16-bit precision (FP16/BF16). **Quantization** stores the weights in fewer bits (8, 5, 4, even 2) so the model uses less memory and runs faster, at a small cost to quality.

## GGUF

**GGUF** is the file format used by \`llama.cpp\` and the tools built on it (Ollama, LM Studio, KoboldCpp). A single \`.gguf\` file contains the weights plus metadata, at a chosen quantization level.

## Reading the names

A name like **\`Q4_K_M\`** decodes as:

- **Q4** — ~4 bits per weight.
- **_K** — the modern "k-quant" scheme (better quality than the old methods).
- **_M** — the size/quality variant: **S**(mall) < **M**(edium) < **L**(arge).

## Which one should I use?

- **Q4_K_M** — the sweet spot most people use. Great quality-to-size ratio.
- **Q5_K_M** — a bit larger, slightly better quality.
- **Q8_0** — near-lossless, ~2× the size of Q4. Use if you have the memory.
- **Q3 / Q2** — only when you're desperate to fit; noticeable quality loss.

## Rule of thumb

Prefer a **bigger model at Q4** over a **smaller model at Q8** if both fit — parameter count usually matters more than a couple of extra bits of precision.`,
  },
  {
    slug: 'openai-compatible-local-server',
    title: 'Serve local models behind an OpenAI-compatible API',
    summary:
      'Expose your local model with the same API shape as OpenAI so existing apps and SDKs just work by changing the base URL.',
    level: 'intermediate',
    minutes: 7,
    tags: 'api,serving,openai-compatible',
    sort_order: 5,
    body: `## Why OpenAI-compatible?

A huge ecosystem already speaks the OpenAI REST shape (\`/v1/chat/completions\`, \`/v1/embeddings\`). If your local server mimics it, you can reuse existing SDKs, frameworks and apps by only changing the **base URL** and **model name**.

## Options

- **Ollama** — serves \`/v1\` on port 11434 automatically.
- **LM Studio** — "Local Server" tab starts an OpenAI-compatible server.
- **vLLM** — \`vllm serve <model>\` for high-throughput GPU serving.
- **LocalAI** — a dedicated drop-in OpenAI replacement (chat, embeddings, images, audio).

## Example: point any OpenAI client locally

\`\`\`python
from openai import OpenAI

client = OpenAI(base_url="http://localhost:11434/v1", api_key="local")

resp = client.chat.completions.create(
    model="llama3.1",
    messages=[{"role": "user", "content": "Say hi from my GPU"}],
)
print(resp.choices[0].message.content)
\`\`\`

## Going to production

- Put a gateway like **LiteLLM** in front for routing, budgets, keys and logging.
- Use **vLLM** for concurrency and throughput.
- Add auth and TLS — an OpenAI-compatible endpoint is still an open endpoint.`,
  },
  {
    slug: 'build-a-local-rag-pipeline',
    title: 'Build a private RAG pipeline with local models',
    summary:
      'Combine a local embedding model, a vector store and a local LLM to answer questions over your own documents — fully offline.',
    level: 'intermediate',
    minutes: 10,
    tags: 'rag,embeddings,vector-db',
    sort_order: 6,
    body: `## What is RAG?

**Retrieval-Augmented Generation** grounds an LLM's answers in your own documents. Instead of relying only on what the model memorized, you retrieve relevant chunks and feed them into the prompt.

## The local pipeline

1. **Chunk** your documents into passages (a few hundred tokens each).
2. **Embed** each chunk with a local embedding model (e.g. \`nomic-embed-text\`).
3. **Store** the vectors in a local vector DB (Chroma, Qdrant, LanceDB, or even SQLite + FAISS).
4. On a question: embed it, **retrieve** the top-k similar chunks.
5. **Generate** an answer with a local LLM, passing the retrieved chunks as context.

## Minimal example with Ollama

\`\`\`python
import ollama, numpy as np

def embed(text):
    return np.array(ollama.embeddings(model="nomic-embed-text", prompt=text)["embedding"])

docs = ["Local AI runs on your hardware.", "GGUF is a model file format."]
doc_vecs = [embed(d) for d in docs]

q = "Where does local AI run?"
qv = embed(q)
best = docs[int(np.argmax([qv @ dv for dv in doc_vecs]))]

answer = ollama.chat(model="llama3.1", messages=[
    {"role": "system", "content": f"Answer using this context: {best}"},
    {"role": "user", "content": q},
])
print(answer["message"]["content"])
\`\`\`

## Do it with a tool

Prefer a ready-made app? **AnythingLLM**, **Open WebUI** and **GPT4All (LocalDocs)** all provide private RAG over your files with a few clicks.`,
  },
  {
    slug: 'gpu-cpu-inference-and-vram',
    title: 'GPU vs CPU inference and planning your VRAM',
    summary:
      'How inference uses hardware, what "offloading layers" means, and how to plan VRAM for weights plus context.',
    level: 'intermediate',
    minutes: 8,
    tags: 'hardware,gpu,performance',
    sort_order: 7,
    body: `## GPU vs CPU

- **GPU** — massively parallel, ideal for the matrix math in transformers. Fastest, but limited by **VRAM**.
- **CPU** — works everywhere and can use lots of system RAM, but is much slower for big models.
- **Apple Silicon** — unified memory + Metal acceleration hits a sweet spot for local inference.

## Layer offloading

llama.cpp-based tools let you offload a number of model **layers** to the GPU (\`n_gpu_layers\`). Put as many layers on the GPU as fit in VRAM; the rest run on CPU. All layers on the GPU = fastest.

## VRAM budget

Plan for two things:

1. **Weights** — model size at your chosen quantization.
2. **KV cache (context)** — grows with context length and batch size; long contexts can eat several GB.

> Leave ~10–15% headroom so the OS and display don't push you into slow swapping.

## Speeding things up

- Use a quantization that leaves room for your context.
- Enable **flash attention** if your runtime supports it.
- For many concurrent users, switch to **vLLM** which manages the KV cache efficiently with PagedAttention.`,
  },
  {
    slug: 'fine-tuning-basics-lora',
    title: 'Fine-tuning basics: teaching a local model with LoRA',
    summary:
      'When to fine-tune vs prompt or RAG, and how LoRA/QLoRA make it feasible on a single consumer GPU.',
    level: 'advanced',
    minutes: 9,
    tags: 'fine-tuning,lora,training',
    sort_order: 8,
    body: `## First: do you even need to fine-tune?

Reach for these in order — they're cheaper and faster:

1. **Prompting / few-shot** — often enough for format and tone.
2. **RAG** — best when you need up-to-date or private *knowledge*.
3. **Fine-tuning** — best when you need to change *behavior/style* or teach a narrow skill consistently.

## LoRA & QLoRA

Full fine-tuning updates every weight and needs huge memory. **LoRA** (Low-Rank Adaptation) freezes the base model and trains small adapter matrices instead — far fewer trainable parameters. **QLoRA** quantizes the frozen base to 4-bit so you can fine-tune a 7B–13B model on a single 16–24 GB GPU.

## Typical workflow

1. Build a dataset of **instruction → response** examples (quality > quantity; even a few hundred good examples help).
2. Pick a base model (e.g. Llama 3.1 8B, Mistral 7B).
3. Train LoRA adapters with a library like **Unsloth**, **Axolotl**, or **PEFT**.
4. **Evaluate** on held-out examples.
5. Merge adapters or keep them separate, then **export to GGUF** to run locally in Ollama/llama.cpp.

## Watch out for

- **Overfitting** on tiny datasets — keep a validation split.
- **Catastrophic forgetting** — mixing in some general data helps.
- **Licensing** — check the base model's license before distributing a fine-tune.`,
  },
];

export function runSeed({ quiet = false } = {}) {
  initSchema();

  const insertTool = db.prepare(`
    INSERT OR IGNORE INTO tools
      (slug, name, tagline, description, category, homepage, repo_url, license, platforms, tags, stars)
    VALUES
      (@slug, @name, @tagline, @description, @category, @homepage, @repo_url, @license, @platforms, @tags, @stars)
  `);
  const insertModel = db.prepare(`
    INSERT OR IGNORE INTO models
      (slug, name, family, publisher, description, parameters, quantizations, context_len, modality, license, min_ram_gb, tags, downloads)
    VALUES
      (@slug, @name, @family, @publisher, @description, @parameters, @quantizations, @context_len, @modality, @license, @min_ram_gb, @tags, @downloads)
  `);
  const insertGuide = db.prepare(`
    INSERT OR IGNORE INTO guides
      (slug, title, summary, body, level, minutes, tags, sort_order)
    VALUES
      (@slug, @title, @summary, @body, @level, @minutes, @tags, @sort_order)
  `);

  const seedAll = db.transaction(() => {
    for (const t of TOOLS) insertTool.run(t);
    for (const m of MODELS) insertModel.run(m);
    for (const g of GUIDES) insertGuide.run(g);
  });
  seedAll();

  if (!quiet) {
    const counts = {
      tools: db.prepare('SELECT COUNT(*) AS n FROM tools').get().n,
      models: db.prepare('SELECT COUNT(*) AS n FROM models').get().n,
      guides: db.prepare('SELECT COUNT(*) AS n FROM guides').get().n,
    };
    console.log('Seed complete:', counts);
  }
}

const isMain = process.argv[1] && import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  runSeed();
  process.exit(0);
}
