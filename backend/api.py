"""HTTP API for the VidWise React client."""
from __future__ import annotations

import os
import tempfile
import uuid
from pathlib import Path
from threading import Lock

from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

load_dotenv()
os.makedirs("downloads", exist_ok=True)

app = FastAPI(title="VidWise API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

sessions: dict[str, object] = {}
session_lock = Lock()


class ChatRequest(BaseModel):
    question: str


@app.get("/api/health")
def health():
    return {"status": "ok", "name": "VidWise"}


@app.post("/api/analyze")
async def analyze(
    source: str = Form(""),
    language: str = Form("english"),
    media: UploadFile | None = File(None),
):
    temp_path: str | None = None
    try:
        if media is not None:
            suffix = Path(media.filename or "upload").suffix or ".media"
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix, dir="downloads") as output:
                temp_path = output.name
                while chunk := await media.read(1024 * 1024):
                    output.write(chunk)
            source = temp_path
        if not source.strip():
            raise HTTPException(status_code=400, detail="Add a video URL or choose an audio/video file.")

        from utils.audio_processing import process_input
        from core.transcriber import transcribe_all
        from core.summarizer import summarize, generate_title
        from core.extractor import extract_action_items, extract_key_decisions, extract_questions
        from core.rag_engine import build_rag_chain

        chunks = process_input(source.strip())
        transcript = transcribe_all(chunks, language)
        title = generate_title(transcript)
        summary = summarize(transcript)
        action_items = extract_action_items(transcript)
        decisions = extract_key_decisions(transcript)
        questions = extract_questions(transcript)
        rag_chain = build_rag_chain(transcript)
        session_id = str(uuid.uuid4())
        with session_lock:
            sessions[session_id] = rag_chain
        return {
            "session_id": session_id,
            "title": title,
            "transcript": transcript,
            "summary": summary,
            "action_items": action_items,
            "key_decisions": decisions,
            "open_questions": questions,
        }
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)


@app.post("/api/sessions/{session_id}/chat")
def chat(session_id: str, request: ChatRequest):
    with session_lock:
        chain = sessions.get(session_id)
    if chain is None:
        raise HTTPException(status_code=404, detail="Analysis session not found. Please analyze the video again.")
    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Enter a question.")
    from core.rag_engine import ask_question
    try:
        return {"answer": ask_question(chain, request.question.strip())}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
