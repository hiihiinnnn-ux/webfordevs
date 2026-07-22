from sqlalchemy.orm import Session

from app.models import Framework, Guide, Model, Tool


def seed_database(db: Session) -> None:
    if db.query(Tool).count() > 0:
        return

    tools = [
        Tool(
            slug="ollama",
            name="Ollama",
            tagline="Run open models locally with one command",
            description=(
                "Ollama packages LLMs into a simple CLI and REST API. Pull a model with "
                "`ollama pull llama3`, then chat from the terminal or hit localhost:11434. "
                "It's the fastest way for developers to prototype local AI without managing GPUs manually."
            ),
            category="runtime",
            website_url="https://ollama.com",
            github_url="https://github.com/ollama/ollama",
            tags="cli,api,macos,linux,windows,beginner-friendly",
            difficulty="beginner",
        ),
        Tool(
            slug="lm-studio",
            name="LM Studio",
            tagline="Desktop GUI for discovering and running local models",
            description=(
                "LM Studio provides a polished desktop app to browse Hugging Face models, "
                "download GGUF weights, and chat or expose an OpenAI-compatible local server. "
                "Great for developers who prefer a visual workflow before scripting."
            ),
            category="desktop",
            website_url="https://lmstudio.ai",
            github_url=None,
            tags="gui,gguf,openai-compatible,desktop",
            difficulty="beginner",
        ),
        Tool(
            slug="llama-cpp",
            name="llama.cpp",
            tagline="High-performance C++ inference engine",
            description=(
                "llama.cpp is the foundational inference project behind much of the local AI ecosystem. "
                "It runs quantized models efficiently on CPU and GPU, powers many wrappers, and is ideal "
                "when you need maximum control or embedded deployments."
            ),
            category="inference",
            website_url="https://github.com/ggerganov/llama.cpp",
            github_url="https://github.com/ggerganov/llama.cpp",
            tags="c++,gguf,cpu,gpu,embedded",
            difficulty="intermediate",
        ),
        Tool(
            slug="localai",
            name="LocalAI",
            tagline="Drop-in OpenAI API replacement that runs locally",
            description=(
                "LocalAI exposes endpoints compatible with the OpenAI API while running models on your hardware. "
                "Swap your app's base URL and keep existing SDK code — useful for testing privacy-sensitive flows."
            ),
            category="api-server",
            website_url="https://localai.io",
            github_url="https://github.com/mudler/LocalAI",
            tags="openai-compatible,docker,self-hosted,api",
            difficulty="intermediate",
        ),
        Tool(
            slug="text-generation-webui",
            name="Text Generation WebUI",
            tagline="Gradio-based web UI for experimenting with models",
            description=(
                "oobabooga's text-generation-webui is a feature-rich browser interface supporting many backends "
                "(llama.cpp, Transformers, ExLlama). Developers use it to benchmark prompts and extensions before production."
            ),
            category="desktop",
            website_url="https://github.com/oobabooga/text-generation-webui",
            github_url="https://github.com/oobabooga/text-generation-webui",
            tags="gradio,extensions,experimentation,python",
            difficulty="intermediate",
        ),
        Tool(
            slug="vllm",
            name="vLLM",
            tagline="Production-grade LLM serving with PagedAttention",
            description=(
                "vLLM is built for high-throughput serving on NVIDIA GPUs. If you're moving from a laptop prototype "
                "to an internal API that handles concurrent requests, vLLM is a common next step."
            ),
            category="serving",
            website_url="https://vllm.ai",
            github_url="https://github.com/vllm-project/vllm",
            tags="gpu,serving,throughput,production",
            difficulty="advanced",
        ),
    ]

    models = [
        Model(
            slug="llama-3-8b",
            name="Llama 3 8B Instruct",
            provider="Meta",
            parameter_size="8B",
            context_length="8K",
            description=(
                "A strong general-purpose instruct model that runs on consumer GPUs with quantization. "
                "Good default for chatbots, summarization, and code assistance prototypes."
            ),
            use_cases="chat,summarization,code-assist",
            license="Llama 3 Community License",
            tags="instruct,meta,general-purpose",
            min_vram_gb=6,
        ),
        Model(
            slug="mistral-7b",
            name="Mistral 7B Instruct",
            provider="Mistral AI",
            parameter_size="7B",
            context_length="32K",
            description=(
                "Efficient 7B model with long context support. Popular for RAG pipelines and agent tooling "
                "where you need a balance of speed and quality on modest hardware."
            ),
            use_cases="rag,agents,chat",
            license="Apache 2.0",
            tags="instruct,mistral,long-context",
            min_vram_gb=6,
        ),
        Model(
            slug="phi-3-mini",
            name="Phi-3 Mini 4K Instruct",
            provider="Microsoft",
            parameter_size="3.8B",
            context_length="4K",
            description=(
                "Small but capable model designed for edge and laptop deployment. Excellent when VRAM is limited "
                "or you need fast iteration loops during development."
            ),
            use_cases="edge,fast-prototyping,chat",
            license="MIT",
            tags="small,efficient,microsoft",
            min_vram_gb=4,
        ),
        Model(
            slug="codellama-13b",
            name="Code Llama 13B Instruct",
            provider="Meta",
            parameter_size="13B",
            context_length="16K",
            description=(
                "Specialized for code generation, explanation, and infilling. Use when building dev tools, "
                "local copilots, or documentation assistants inside your IDE workflow."
            ),
            use_cases="code-generation,infilling,dev-tools",
            license="Llama 2 Community License",
            tags="code,meta,instruct",
            min_vram_gb=10,
        ),
        Model(
            slug="qwen2-5-7b",
            name="Qwen2.5 7B Instruct",
            provider="Alibaba",
            parameter_size="7B",
            context_length="128K",
            description=(
                "Multilingual model with very long context. Strong choice for document Q&A and mixed-language "
                "support in local deployments."
            ),
            use_cases="multilingual,rag,long-documents",
            license="Apache 2.0",
            tags="multilingual,long-context,qwen",
            min_vram_gb=6,
        ),
        Model(
            slug="deepseek-r1-distill",
            name="DeepSeek R1 Distill 7B",
            provider="DeepSeek",
            parameter_size="7B",
            context_length="32K",
            description=(
                "Reasoning-focused distilled model that fits consumer hardware. Useful for experimenting with "
                "chain-of-thought style apps without cloud API costs."
            ),
            use_cases="reasoning,math,agents",
            license="MIT",
            tags="reasoning,distilled,chain-of-thought",
            min_vram_gb=8,
        ),
    ]

    frameworks = [
        Framework(
            slug="langchain",
            name="LangChain",
            language="Python",
            description=(
                "Composable framework for building LLM apps: chains, agents, retrievers, and tool calling. "
                "Supports local models via Ollama, llama.cpp, and OpenAI-compatible servers."
            ),
            website_url="https://www.langchain.com",
            github_url="https://github.com/langchain-ai/langchain",
            tags="agents,rag,tools,python",
        ),
        Framework(
            slug="llamaindex",
            name="LlamaIndex",
            language="Python",
            description=(
                "Data framework focused on connecting LLMs to your documents. Ideal for local RAG pipelines "
                "where embeddings and retrieval run entirely on your machine."
            ),
            website_url="https://www.llamaindex.ai",
            github_url="https://github.com/run-llama/llama_index",
            tags="rag,embeddings,indexing,python",
        ),
        Framework(
            slug="open-webui",
            name="Open WebUI",
            language="TypeScript",
            description=(
                "Self-hosted ChatGPT-style interface that plugs into Ollama and OpenAI-compatible backends. "
                "Teams use it as an internal chat portal over local models."
            ),
            website_url="https://openwebui.com",
            github_url="https://github.com/open-webui/open-webui",
            tags="ui,ollama,self-hosted,typescript",
        ),
        Framework(
            slug="semantic-kernel",
            name="Semantic Kernel",
            language="C#",
            description=(
                "Microsoft's SDK for orchestrating AI plugins and planners. Works with local endpoints "
                "through OpenAI-compatible adapters — useful in .NET shops."
            ),
            website_url="https://learn.microsoft.com/semantic-kernel",
            github_url="https://github.com/microsoft/semantic-kernel",
            tags="dotnet,plugins,orchestration",
        ),
        Framework(
            slug="haystack",
            name="Haystack",
            language="Python",
            description=(
                "Pipeline framework for search, QA, and generative AI. Build production RAG with local "
                "embedders and generators in a modular graph."
            ),
            website_url="https://haystack.deepset.ai",
            github_url="https://github.com/deepset-ai/haystack",
            tags="rag,pipelines,search,python",
        ),
    ]

    guides = [
        Guide(
            slug="why-local-ai",
            title="Why Local AI Matters for Developers",
            summary="Privacy, cost control, offline dev, and faster iteration — the case for running models on your machine.",
            content="""# Why Local AI Matters for Developers

Running models locally isn't just a hobbyist pursuit — it's a practical development strategy.

## Key benefits

**Privacy & compliance** — User data never leaves your network. Healthcare, legal, and enterprise prototypes often require this from day one.

**Predictable costs** — Cloud inference bills scale with usage. Local hardware is a fixed cost; great for high-volume dev/test loops.

**Offline & low-latency** — No network round trips. Iterate on prompts and agents on a plane or in a locked-down environment.

**Full control** — Pick the model, quantization, context length, and tooling. No vendor rate limits during development.

## When to start local

- Building RAG over sensitive documents
- Prototyping agents with tool calling
- Learning how transformers behave under the hood
- Creating demos without API keys

## When to move to cloud

Production scale, largest frontier models, or managed fine-tuning may still need cloud — but local dev shrinks the gap dramatically.

**Next:** Set up Ollama and run your first model in under five minutes.""",
            level="beginner",
            reading_time_minutes=4,
            tags="introduction,overview,privacy",
            order_index=1,
        ),
        Guide(
            slug="first-model-ollama",
            title="Run Your First Local Model with Ollama",
            summary="Install Ollama, pull a model, and call it from curl or Python in minutes.",
            content="""# Run Your First Local Model with Ollama

## 1. Install

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

Or download the macOS/Windows app from [ollama.com](https://ollama.com).

## 2. Pull a model

```bash
ollama pull llama3
```

This downloads weights optimized for your hardware.

## 3. Chat in the terminal

```bash
ollama run llama3 "Explain recursion to a junior dev"
```

## 4. Hit the REST API

```bash
curl http://localhost:11434/api/generate -d '{
  "model": "llama3",
  "prompt": "Write a FastAPI hello world",
  "stream": false
}'
```

## 5. Use from Python

```python
import requests

resp = requests.post(
    "http://localhost:11434/api/generate",
    json={"model": "llama3", "prompt": "Hello", "stream": False},
)
print(resp.json()["response"])
```

You now have a local inference server — no API key required.""",
            level="beginner",
            reading_time_minutes=6,
            tags="ollama,quickstart,api",
            order_index=2,
        ),
        Guide(
            slug="choosing-hardware",
            title="Choosing Hardware for Local AI",
            summary="VRAM, RAM, and CPU tradeoffs — what you need to run different model sizes.",
            content="""# Choosing Hardware for Local AI

## VRAM is usually the bottleneck

| Model size (Q4 quant) | Approx VRAM |
|-----------------------|-------------|
| 3B                    | 4 GB        |
| 7–8B                  | 6–8 GB      |
| 13B                   | 10–12 GB    |
| 70B                   | 48 GB+      |

Quantization (GGUF Q4_K_M, etc.) dramatically reduces memory at some quality cost.

## No GPU?

**llama.cpp** runs on CPU with enough RAM — slower but workable for small models and scripting.

## Apple Silicon

Unified memory means a 16–32 GB M-series Mac can run 7B–13B models comfortably via Metal acceleration in Ollama and llama.cpp.

## Development vs production

- **Dev laptop:** 7B instruct models for fast iteration
- **Workstation / server:** 13B+ or vLLM for team APIs
- **CI:** CPU-only smoke tests on tiny models

Match the model to your hardware using our catalog filters.""",
            level="beginner",
            reading_time_minutes=5,
            tags="hardware,vram,gpu,cpu",
            order_index=3,
        ),
        Guide(
            slug="rag-basics",
            title="RAG Basics: Chat With Your Docs Locally",
            summary="Embeddings, chunking, and retrieval — build a private document Q&A pipeline.",
            content="""# RAG Basics: Chat With Your Docs Locally

Retrieval-Augmented Generation (RAG) grounds the model in *your* data.

## Pipeline overview

1. **Load** documents (PDF, Markdown, code)
2. **Chunk** into overlapping segments
3. **Embed** each chunk with a local embedding model
4. **Store** vectors in a local DB (Chroma, LanceDB, sqlite-vss)
5. **Retrieve** relevant chunks at query time
6. **Generate** an answer with context in the prompt

## Minimal stack

- **Ollama** for chat + embeddings (`nomic-embed-text`)
- **LlamaIndex** or **LangChain** for orchestration
- **Chroma** for vector storage

## Privacy win

Documents and embeddings never leave your machine — ideal for internal wikis and codebases.

## Common pitfalls

- Chunks too large → noisy retrieval
- No metadata filters → wrong doc versions
- Skipping evaluation → hallucinations look plausible

Start small: one directory of Markdown files and a 20-question eval set.""",
            level="intermediate",
            reading_time_minutes=8,
            tags="rag,embeddings,llamaindex,privacy",
            order_index=4,
        ),
        Guide(
            slug="openai-compatible-local",
            title="Swap Cloud APIs for Local OpenAI-Compatible Servers",
            summary="Point existing SDKs at LocalAI or Ollama's compatibility layer with minimal code changes.",
            content="""# Swap Cloud APIs for Local OpenAI-Compatible Servers

Many local tools expose an OpenAI-compatible `/v1/chat/completions` endpoint.

## Ollama OpenAI compatibility

```bash
ollama pull llama3
```

```python
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:11434/v1",
    api_key="ollama",  # required but unused
)

completion = client.chat.completions.create(
    model="llama3",
    messages=[{"role": "user", "content": "Hello!"}],
)
print(completion.choices[0].message.content)
```

## Why this matters

- Reuse existing OpenAI SDK code in tests
- Toggle `base_url` between local and cloud via env vars
- Run integration tests in CI with tiny models

## LocalAI & vLLM

**LocalAI** and **vLLM** also offer compatible APIs for heavier deployments.

```bash
export OPENAI_BASE_URL=http://localhost:8080/v1
export OPENAI_API_KEY=local
```

Your app stays the same; only the inference backend changes.""",
            level="intermediate",
            reading_time_minutes=7,
            tags="openai-compatible,localai,ollama,migration",
            order_index=5,
        ),
    ]

    db.add_all(tools + models + frameworks + guides)
    db.commit()
