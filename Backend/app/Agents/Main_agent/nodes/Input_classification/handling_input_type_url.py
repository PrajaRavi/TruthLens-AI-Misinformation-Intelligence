from app.Agents.Main_agent.state import InvestigationState
from utils.utils_func import extract_video_id,extract_webpage_content
from youtube_transcript_api import YouTubeTranscriptApi, TranscriptsDisabled,VideoUnavailable,InvalidVideoId,NoTranscriptFound,NotTranslatable
from yt_dlp import YoutubeDL

def input_type_is_text(state:InvestigationState)->InvestigationState:
    return state
def input_type_is_url(state:InvestigationState)->InvestigationState:
    print("input_type_is_url start")
    return state

async def handling_input_type_url(state:InvestigationState)->InvestigationState:
    content_length_th=state['content_length_th']
    print("handling_input_type_url")
    if(state['input_type']=="youtube"):

        # ! Now i have to fetch the transScript of that yt video and further processing will be same

        video_id=extract_video_id(url=state['input_url'])
        if(video_id=="Invalid YouTube URL"):
                return print("Error !!!!",video_id)
                # 1. fetch transcript
        try:
            transcript_list = YouTubeTranscriptApi().fetch(video_id=video_id, languages=["en","hi"])
            transcript = " ".join(snippet.text for snippet in transcript_list)
            # 2. Fetch title and thumbnail metadata
            ydl_opts = {
                'skip_download': True,
                'quiet': True,
                    }
        except VideoUnavailable:
                print("This video is not available")
                return
                    
                    
        except NotTranslatable:
                print("This video is not translateble")
                return
                    
                    
        
        except NoTranscriptFound:
                print("This video doesn't contains any transcript")
                return
        
                    
        
        except TranscriptsDisabled:
                print("No captions available for this video.")
                return
        
                    
        
        except Exception as e:
                print("An error occured",str(e))      
                return
        print("hello mai ravi")
        with YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(state['input_url'], download=False)
                title = info.get('title')
                thumbnail = info.get('thumbnail')
                return {'webpage_title':title,"yt_thumbnail":thumbnail,'input_text':str(transcript)[0:int(content_length_th)]}
    elif(state['input_type']=="webpage"):
         data=await extract_webpage_content(state['input_url'])
         title=data['title']
         return {'webpage_title':title,'input_text':str(data['text'])[0:int(content_length_th)]}

