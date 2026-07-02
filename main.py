from dotenv import load_dotenv
from utils.audio_processing import process_input
from core.transcriber import transcribe_all
from core.summarizer import summarize, generate_title
from core.extractor import extract_action_items, extract_key_decisions, extract_questions
from core.rag_engine import build_rag_chain, ask_question 

load_dotenv()

def run_pipeline(source: str, language: str= "english")-> dict:
    print("starting AI Video Assistant")

    chunks = process_input(source)
    transcript = transcribe_all(chunks, language)
    print(f"raw transcription (first 300 characters) {transcript[:300]}")
    title = generate_title(transcript)
    summary = summarize(transcript)
    action_items = extract_action_items(transcript)
    key_decisions = extract_key_decisions(transcript)
    open_questions = extract_questions(transcript)
    rag_chain = build_rag_chain(transcript)
    return {
         "title": title,
         "transcript": transcript,
         "summary": summary,
         "action_items": action_items,
         "key_decisions": key_decisions,
         "open_questions": open_questions,
         "rag_chain": rag_chain
     }

if __name__ == "__main__":
    source= input("Enter YouTube URL or local file path:").strip()
    language= input("Language (english/hinglish):").strip() or "english"
    result = run_pipeline(source, language)

    print("\n" + "="*100)
    print(f"Title:{result['title']}")
    print(f"\nAction Items:\n{result['action_items']}")
    print(f"\nKey Decisions:\n{result['key_decisions']}")
    print(f"\nOpen Questions:\n{result['open_questions']}")
    print("="*100)

    print("\n Chat with your meeting assistant. Type exit to quit the chat option.\n")
    rag_chain = result["rag_chain"]
    while True:
        question = input("Your question: ").strip()
        if question.lower() in ["exit", "quit", "q"]:
            print("Exiting chat. Goodbye!")
            break
        if not question:
            continue
        answer = ask_question(rag_chain, question)
        print(f"\nVideo AI Assistant:{answer}\n")

