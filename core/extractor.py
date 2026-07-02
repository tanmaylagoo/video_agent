

from langchain_core.runnables import RunnableLambda

from langchain_mistralai import ChatMistralAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain_text_splitters import RecursiveCharacterTextSplitter
import os

def get_llm():
    return ChatMistralAI(model="mistral-small-latest",
                         mistral_api_key=os.getenv("MISTRAL_API_KEY"), temperature=0.2)



def build_chain(system_prompt:str):
    llm = get_llm()
    return(
        RunnablePassthrough()| RunnableLambda(lambda x:{"text":x})|ChatPromptTemplate.from_messages([
            ("system",system_prompt),
            ("human", "{text}"),
        ])| llm| StrOutputParser()
    )

def split_transcript(transcript:str)->list:
    splitter=RecursiveCharacterTextSplitter(
        chunk_size=3000,
        chunk_overlap=200
    )
    return splitter.split_text(transcript)

def process_chunks(transcript: str, system_prompt: str)->str:
    chunks = split_transcript(transcript)
    chain = build_chain(system_prompt)
    outputs=[]

    for chunk in chunks:
        result=chain.invoke(chunk)
        outputs.append(result)
    
    combined="\n\n".join(outputs)

    merge_chain = build_chain(
        """
        Combine the following partial outputs into one final result.
         - Remove duplicate items.
        - Merge similar points.
        - Keep the numbering consistent.
        - Preserve all important information."""
    )
    return merge_chain.invoke(combined)


def extract_action_items(transcript: str)->str:
    return process_chunks(
        transcript,
        """You are an expert meeting analyst. From the meeting transcript, extract all action items.
        For each action item provide:
        - Task description
        - Owner (who is responsible)
        - Deadline (if mentioned, otherwise write 'Not specified')
        Format as a numbered list. 
        If none are found, return Actions items not found."""
    )

def extract_key_decisions(transcript: str)-> str:
    return process_chunks(
        transcript,
        "You are an expert meeting analyst. From the meeting transcript, extract all key decisions made during the meeting. Format as a numbered list. If none are found, return: No key decisions found."
    )

def extract_questions(transcript: str)-> str:
    return process_chunks(
        transcript,
        """
        You are an expert meeting analyst.

        Extract all unresolved questions or topics needing follow-up.

        Format as a numbered list.

        If none are found, return:
        No open questions found.
        """,
    )


