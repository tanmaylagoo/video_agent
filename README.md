# 🎙️ AI Meeting Assistant

An AI-powered Meeting Assistant built with Python that automatically transcribes meetings, generates summaries, extracts key insights, and enables conversational Q&A using Retrieval-Augmented Generation (RAG).

## ✨ Features

- 🎥 Accepts YouTube URLs or local audio/video files
- 📝 Automatic meeting transcription
  - English using OpenAI Whisper (local)
  - Hindi/Hinglish support using Sarvam AI (optional)
- 📋 Generates concise meeting summaries
- 🏷️ Generates an AI-powered meeting title
- ✅ Extracts action items
- 📌 Extracts key decisions
- ❓ Extracts open questions and follow-ups
- 💬 Chat with the meeting transcript using RAG
- 🧠 Semantic search powered by ChromaDB and HuggingFace Embeddings

---

# Demo Workflow

```
Video / Audio
       │
       ▼
Audio Processing
       │
       ▼
Speech-to-Text
       │
       ▼
Transcript
       │
       ├────────► AI Title
       │
       ├────────► Summary
       │
       ├────────► Action Items
       │
       ├────────► Key Decisions
       │
       ├────────► Open Questions
       │
       ▼
Chunking
       │
       ▼
Embeddings
       │
       ▼
ChromaDB
       │
       ▼
RAG Chatbot
```

---

# Tech Stack

| Category | Technology |
|----------|------------|
| Language | Python |
| LLM | Mistral AI |
| Speech-to-Text | OpenAI Whisper |
| Hindi STT | Sarvam AI |
| Framework | LangChain (LCEL) |
| Vector Database | ChromaDB |
| Embeddings | HuggingFace (all-MiniLM-L6-v2) |
| UI | React, Vite, Tailwind CSS |
| API | FastAPI |

---

# Project Structure

```
AI-Meeting-Assistant/

│
├── core/
│   ├── extractor.py
│   ├── rag_engine.py
│   ├── summarizer.py
│   ├── transcriber.py
│   ├── translator.py
│   └── vector_store.py
│
├── utils/
│   └── audio_processing.py
│
├── vector_db/
│
├── temp/
│
├── main.py
├── requirements.txt
├── .env
└── README.md
```

---

# Installation

## Clone the repository

```bash
git clone https://github.com/yourusername/AI-Meeting-Assistant.git

cd AI-Meeting-Assistant
```

## Create a virtual environment

Windows

```bash
python -m venv .venv

.venv\Scripts\activate
```

Linux / macOS

```bash
python3 -m venv .venv

source .venv/bin/activate
```

## Install dependencies

```bash
pip install -r requirements.txt
```

---

# Environment Variables

Create a `.env` file in the project root.

```env
MISTRAL_API_KEY=your_mistral_api_key

SARVAM_API_KEY=your_sarvam_api_key

WHISPER_MODEL=small
```

---

# Usage

## Run VidWise

Install the Python dependencies and start the API from the repository root:

```bash
pip install -r requirements.txt
uvicorn backend.api:app --reload
```

In a second terminal, start the React frontend:

```bash
cd frontend
npm install
npm run dev
```

Open the Vite URL shown in the terminal (usually `http://localhost:5173`). VidWise accepts a video URL or an uploaded audio/video file, then shows the transcript, summary, extracted action items and decisions, and transcript-grounded chat.

You can also start the API with `python app.py` from the repository root.

Run

```bash
python main.py
```

Enter

```
YouTube URL or local file path
```

Example

```
https://www.youtube.com/watch?v=xxxxxxxx
```

Choose language

```
english

or

hinglish
```

The application will automatically

- Download/process audio
- Generate transcript
- Create meeting title
- Generate summary
- Extract action items
- Extract decisions
- Extract open questions
- Build a vector database
- Launch an interactive chatbot

---

# Chat with Your Meeting

Once processing is complete, ask natural language questions such as:

```
Who is responsible for the deployment?

What decisions were made?

What are the pending tasks?

Summarize the discussion about the budget.

Who mentioned the AI roadmap?
```

The chatbot retrieves the most relevant transcript chunks using ChromaDB and answers using Mistral AI.

---

# RAG Pipeline

```
Transcript
      │
      ▼
Text Splitter
      │
      ▼
Chunks
      │
      ▼
Embeddings
      │
      ▼
ChromaDB
      │
      ▼
Retriever
      │
      ▼
Relevant Chunks
      │
      ▼
Prompt
      │
      ▼
Mistral AI
      │
      ▼
Answer
```

---

# Modules

### audio_processing.py

- Downloads YouTube audio
- Converts local videos
- Splits audio into manageable chunks

### transcriber.py

- Transcribes audio using Whisper
- Supports Sarvam AI for Hindi/Hinglish

### summarizer.py

- Generates meeting title
- Produces structured meeting summary using LangChain LCEL

### extractor.py

Extracts:

- Action Items
- Key Decisions
- Open Questions

### vector_store.py

- Splits transcript into chunks
- Creates embeddings
- Stores vectors inside ChromaDB
- Creates retriever

### rag_engine.py

Builds the complete Retrieval-Augmented Generation pipeline using:

- Retriever
- Prompt Template
- Mistral AI
- Output Parser

### main.py

Coordinates the entire workflow and launches the interactive chat interface.

---

# Acknowledgements

This project uses:

- LangChain
- ChromaDB
- OpenAI Whisper
- HuggingFace Sentence Transformers
- Mistral AI
- Sarvam AI

---

# License

This project is licensed under the MIT License.

---

## ⭐ If you found this project helpful, consider giving it a star!
