from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
import openai
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize OpenAI client
openai.api_key = os.getenv("OPENAI_API_KEY")

router = APIRouter()

class Message(BaseModel):
    role: str = Field(..., example="user", description="The role of the message sender (user/assistant)")
    content: str = Field(..., example="I feel anxious about my presentation tomorrow", description="The content of the message")

class CompletionRequest(BaseModel):
    messages: List[Message] = Field(..., example=[
        {
            "role": "user",
            "content": "I feel anxious about my presentation tomorrow"
        }
    ], description="List of messages in the conversation")

class CompletionResponse(BaseModel):
    message: str = Field(..., example="I understand that presentations can be nerve-wracking. What specific aspects of the presentation are causing you the most anxiety?", description="The AI's response message")

@router.post(
    "/completion",
    response_model=CompletionResponse,
    summary="Generate AI response for emotional support",
    description="""This endpoint generates empathetic responses using GPT-4.5.

    Example Request:
    ```json
    {
        "messages": [
            {
                "role": "user",
                "content": "I feel anxious about my presentation tomorrow"
            }
        ]
    }
    ```

    Example Response:
    ```json
    {
        "message": "I understand that presentations can be nerve-wracking. What specific aspects of the presentation are causing you the most anxiety?"
    }
    ```
    """
)
async def create_completion(request: CompletionRequest):
    try:
        if not request.messages:
            raise HTTPException(status_code=400, detail="Messages array is required")

        # Add system message for Feelora's personality
        messages = [
            {
                "role": "system",
                "content": """You are Feelora, an empathetic AI companion focused on emotional well-being.

                Your purpose is to:
                - Help users understand and process their emotions
                - Provide a safe, non-judgmental space for reflection
                - Offer gentle guidance based on emotional intelligence principles
                - Encourage healthy emotional expression and self-awareness

                Guidelines:
                - Be warm, compassionate, and conversational
                - Ask thoughtful questions to deepen understanding
                - Validate emotions without judgment
                - Keep responses to 1-3 sentences maximum
                - Focus on emotional awareness rather than problem-solving
                - Never diagnose or provide medical/therapeutic advice
                - If users are in crisis, gently suggest professional help

                Remember that you're a supportive companion, not a therapist or medical professional."""
            }
        ] + [msg.dict() for msg in request.messages]

        response = await openai.ChatCompletion.acreate(
            model="gpt-4o",  # Using GPT-4.5 Preview
            messages=messages,
            temperature=0.7,
            max_tokens=100  # Reduced from 500 to limit response length
        )

        return CompletionResponse(
            message=response.choices[0].message.content if response.choices else "I'm sorry, I couldn't process that. Could we try again?"
        )

    except Exception as e:
        print(f"Error in completion: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate response")
