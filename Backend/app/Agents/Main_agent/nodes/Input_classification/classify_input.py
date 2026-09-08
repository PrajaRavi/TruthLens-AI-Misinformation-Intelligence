from app.Agents.Main_agent.state import InvestigationState
from urllib.parse import urlparse

async def classify_input(state:InvestigationState) ->InvestigationState:
    print('running classify input')
    """
    Classifies the user's input as text or URL-based content.

    Current implementation:
    - Normal text -> returns state unchanged
    - URL -> classifies the URL for future processing
    -and also extract transcript from videos and webpages
    """

    input_text = state['input_text'].strip()

    # No input
    if not input_text:
        raise ValueError("input_text cannot be empty")

    # Check whether input looks like a URL
    parsed_url = urlparse(input_text)

    is_url = parsed_url.scheme in ("http", "https") and bool(parsed_url.netloc)

    # ─────────────────────────────────────
    # NORMAL TEXT
    # ─────────────────────────────────────
    if not is_url:
        # Your current focus is text.
        # Nothing needs to be changed.
        return state

    # ─────────────────────────────────────
    # URL
    # ─────────────────────────────────────
    
    hostname = parsed_url.netloc.lower()
    path = parsed_url.path.lower()

    # YouTube
    if "youtube.com" in hostname or "youtu.be" in hostname:
        input_type = "youtube"

    # Common video URLs
    elif path.endswith((".mp4", ".webm", ".mov", ".mkv", ".m3u8")):
        input_type = "video"
        
    # Common audio URLs
    elif path.endswith((".mp3", ".wav", ".ogg", ".m4a", ".aac")):
        input_type = "audio" \
        ""
    # Common Image URLs
    elif path.endswith((".jpg", ".png", ".jpeg", ".webp")):
        input_type = "image"

    # Everything else is treated as a webpage for now
    else:
        input_type = "webpage"
    print("chala hu mai bhai")    
    # Future implementation
    return {'input_type':input_type,"input_url":input_text}

def input_type_is_text(state:InvestigationState)->InvestigationState:
    return state
def input_type_is_url(state:InvestigationState)->InvestigationState:
    print("input_type_is_url start")
    return state
