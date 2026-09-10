import React, { useEffect, useRef, useState } from "react";
import {
  Bot,
  Mic,
  MicOff,
  Send,
  X,
  User,
  Sparkles,
} from "lucide-react";
import axios from "axios";
import MarkdownRenderer from "@/utils/MDRenderer";
import { useUser } from "@/context/counterContext";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
}

interface ContextChatbotProps {
  analysisContext?: any;
}

const demoResponses = [
  "Based on the analysis, most of the evidence supports this claim. However, some parts are still uncertain.",
  "The analysis found that this claim has a low risk. There is no strong evidence showing that the content is harmful.",
  "According to the analyzed evidence, this claim is likely false. The available sources provide information that goes against the claim.",
  "The evidence is not strong enough to give a clear answer. The claim should be checked again using more reliable sources.",
];

const ContextChatbot: React.FC<ContextChatbotProps> = ({
  analysisContext = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const {AnalysisChatboatFeedDataSignal}=useUser()
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  let [AnalysisChatBoatFeedDataLoading,setAnalysisChatBoatFeedDataLoading]=useState<boolean>(false)
  

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      content:
        "Hi! I have access to the analysis results. Ask me anything about the claims, evidence, verdicts, or risk assessment.",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
async function feed_data_to_analysis_assistant(){
    try {
      let AIMsg:Message={content:"",id:0,role:"assistant"}
      setIsTyping(true)
      // let obj={name:"ravi",id:4,surname:"prajapati"}
      let {data}=await axios.post("http://localhost:8000/api/chat_with_analysis_assistant",{query:input})
      if(data?.success){

        console.log(data)
        AIMsg= {
          id: Date.now(),
          role: "assistant",
          content: data?.msg,
        }
    }
    else{
      console.log("something went wrong in feed_data_to_analysis_assistant")
    }

    setMessages((prev) => [...prev, AIMsg]);
    

    } catch (error) {
      console.log(error)
    }finally{
      setIsTyping(false)
    }
  }

  /* -----------------------------
     Auto scroll
  ----------------------------- */

  useEffect(()=>{
if(AnalysisChatboatFeedDataSignal){
  setIsTyping(true)
}
else{
  setIsTyping(false)

}
console.log("analysischatboat",AnalysisChatboatFeedDataSignal)
},[AnalysisChatboatFeedDataSignal])
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isTyping]);

  /* -----------------------------
     Speech Recognition
  ----------------------------- */

  const startListening = () => {
    const SpeechRecognition =
      window?.SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    

    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      let transcript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }

      setInput(transcript);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    recognition.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const toggleMic = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  /* -----------------------------
     Send Message
  ----------------------------- */

  const sendMessage = async () => {
    console.log(analysisContext)
    const message = input.trim();

    if (!message || isTyping) return;

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: message,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    /*
      Later replace this demo section with:

      const response = await fetch("/api/context-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          analysisContext,
        }),
      });

      const data = await response.json();
    */
await feed_data_to_analysis_assistant()
    // setTimeout(() => {
    //   const randomResponse =
    //     demoResponses[
    //       Math.floor(Math.random() * demoResponses.length)
    //     ];

    //   const assistantMessage: Message = {
    //     id: Date.now() + 1,
    //     role: "assistant",
    //     content: randomResponse,
    //   };

    //   setMessages((prev) => [...prev, assistantMessage]);
    //   setIsTyping(false);
    // }, 1200);
  };

  /* -----------------------------
     Enter key
  ----------------------------- */

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* --------------------------------
          Floating Robot Button
      -------------------------------- */}

      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="
            fixed
            bottom-5
            right-5
            z-50
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-full
            bg-[#7678EF]
            text-white
            shadow-xl
            transition
            duration-300
            hover:scale-110
            hover:shadow-2xl
          "
          aria-label="Open analysis assistant"
        >
          <Bot size={27} />

          <span
            className="
              absolute
              -right-1
              -top-1
              h-3
              w-3
              rounded-full
              bg-green-500
              ring-2
              ring-white
            "
          />
        </button>
      )}

      {/* --------------------------------
          Chat Window
      -------------------------------- */}

      {isOpen && (
        <div
          className="
            fixed
            bottom-5
            right-5
            z-50
            flex
            h-[520px]
            w-[380px]
            max-w-[calc(100vw-24px)]
            flex-col
            overflow-hidden
            rounded-2xl
            
            bg-white
            shadow-2xl
          "
        >
          {/* Header */}

          <div
            className="
              flex
              items-center
              justify-between
              border-b
              border-gray-200
              bg-[#7678EF]
              px-4
              py-3
              text-white
            "
          >
            <div className="flex items-center gap-3">
              <div
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-full
                  bg-white/10
                "
              >
                <Bot size={20} />
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-semibold">
                    TruthLense AI
                  </h3>

                  <Sparkles size={13} />
                </div>

                <p className="text-[11px] text-gray-300">
                  Analysis Assistant
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="
                rounded-full
                p-1.5
                text-gray-300
                transition
                hover:bg-white/10
                hover:text-white
              "
            >
              <X size={19} />
            </button>
          </div>

          {/* Context Indicator */}

          <div
            className="
              border-b
              border-gray-100
              bg-gray-50
              px-4
              py-2
            "
          >
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500" />

              <p className="text-[11px] text-gray-500">
                Using your existing analysis context
              </p>
            </div>
          </div>

          {/* Messages */}

          <div
            className="
              flex-1
              space-y-4
              w-full
              overflow-y-auto
              bg-white
              px-4
              py-4
            "
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex  ${
                  message.role === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`flex max-w-[85%]  gap-2 ${
                    message.role === "user"
                      ? "flex-row-reverse"
                      : "flex-row"
                  }`}
                >
                  {/* Avatar */}

                  <div
                    className={`
                      flex
                      h-7
                      w-7
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      ${
                        message.role === "user"
                          ? "bg-gray-200 text-gray-700"
                          : "bg-[#7678EF] text-white"
                      }
                    `}
                  >
                    {message.role === "user" ? (
                      <User size={14} />
                    ) : (
                      <Bot size={14} />
                    )}
                  </div>

                  {/* Message */}

                  <div
                    className={`
                      rounded-2xl
                      px-3
                      py-2.5
                      text-sm
                      
                      
                      leading-relaxed
                      ${
                        message.role === "user"
                          ? "rounded-tr-sm bg-[#7678EF]  "
                          : "rounded-tl-sm bg-gray-100 dark:bg-[#37366d]"
                      }
                    `}
                  >
                    <MarkdownRenderer content={message.content} />
                  </div>
                </div>
              </div>
            ))}

            {/* Typing indicator */}

            {isTyping && (
              <div className="flex items-center gap-2">
                <div
                  className="
                    flex
                    h-7
                    w-7
                    items-center
                    justify-center
                    rounded-full
                    
                    text-white
                  "
                >
                  <Bot size={14} />
                </div>

                <div
                  className="
                    flex
                    gap-1
                    rounded-2xl
                    rounded-tl-sm
                    bg-gray-100
                    px-4
                    py-3
                  "
                >
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-500" />
                  <span
                    className="
                      h-1.5
                      w-1.5
                      animate-bounce
                      rounded-full
                      bg-gray-500
                      [animation-delay:150ms]
                    "
                  />
                  <span
                    className="
                      h-1.5
                      w-1.5
                      animate-bounce
                      rounded-full
                      bg-gray-500
                      [animation-delay:300ms]
                    "
                  />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}

          <div className="border-t border-gray-200 bg-white p-3">
            <div
              className="
                flex
                items-center
                gap-2
                rounded-xl
                border
                border-gray-200
                bg-gray-50
                px-2
                py-1.5
                transition
                focus-within:border-gray-400
              "
            >
              <input
                type="text"
                value={AnalysisChatboatFeedDataSignal?"analyzing your data...":input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={AnalysisChatboatFeedDataSignal}
                placeholder={
                  isListening
                    ? "Listening..."
                    : "Ask about this analysis..."
                }
                className="
                  min-w-0
                  flex-1
                  bg-transparent
                  px-2
                  py-2
                  text-sm
                  text-gray-800
                  outline-none
                  placeholder:text-gray-400
                "
              />

              {/* Mic */}

              <button
                onClick={toggleMic}
                className={`
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  transition
                  ${
                    isListening
                      ? "bg-red-500 text-white"
                      : "text-gray-500 hover:bg-gray-200"
                  }
                `}
                aria-label={
                  isListening
                    ? "Stop listening"
                    : "Start voice input"
                }
              >
                {isListening ? (
                  <MicOff size={18} />
                ) : (
                  <Mic size={18} />
                )}
              </button>

              {/* Send */}

              <button
                onClick={sendMessage}
                disabled={!input.trim() || isTyping}
                className="
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  bg-[#7678EF]
                  text-white
                  transition
                  hover:bg-gray-800
                  disabled:cursor-not-allowed
                  disabled:opacity-30
                "
                aria-label="Send message"
              >
                <Send size={17} />
              </button>
            </div>

            <p className="mt-2 text-center text-[10px] text-gray-400">
              Answers are based on the completed analysis
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default ContextChatbot;