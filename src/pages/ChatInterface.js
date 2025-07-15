import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  User,
  Loader,
  Plus,
  MessageSquare,
  Trash2,
  Edit3,
} from "lucide-react";

import { sendMessageToAgent } from "../components/sendMessageToAgent";

const ChatInterface = () => {
  const [conversations, setConversations] = useState(() => {
    const saved = localStorage.getItem("englishAI_conversations");
    if (saved) {
      return JSON.parse(saved);
    }
    return [];
  });

  const [currentConversationId, setCurrentConversationId] = useState(() => {
    const saved = localStorage.getItem("englishAI_currentConversationId");
    return saved
      ? parseInt(saved)
      : conversations.length > 0
      ? conversations[0].id
      : 1;
  });
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(
    () => window.innerWidth >= 768
  );

  const messagesEndRef = useRef(null);

  const currentConversation = conversations.find(
    (c) => c.id === currentConversationId
  );
  const messages = currentConversation?.messages || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle window resize for responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      // Only auto-close sidebar on mobile, don't auto-open on desktop
      if (window.innerWidth < 768 && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [sidebarOpen]);

  // Save conversations to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(
      "englishAI_conversations",
      JSON.stringify(conversations)
    );
  }, [conversations]);

  // Save current conversation ID to localStorage
  useEffect(() => {
    localStorage.setItem(
      "englishAI_currentConversationId",
      currentConversationId.toString()
    );
  }, [currentConversationId]);

  const isInputValid = () => {
    try {
      if (inputMessage === null || inputMessage === undefined) return false;
      const str = String(inputMessage);
      return str.trim().length > 0;
    } catch (error) {
      console.error("Error checking input validity:", error);
      return false;
    }
  };

  const handleSendMessage = async (message = null) => {
    try {
      // Ensure we always have a string to work with
      let textToSend = "";

      if (message !== null && message !== undefined) {
        textToSend = String(message);
      } else if (inputMessage !== null && inputMessage !== undefined) {
        textToSend = String(inputMessage);
      }

      console.log("handleSendMessage called with:", {
        message,
        inputMessage,
        textToSend,
        messageType: typeof message,
        inputMessageType: typeof inputMessage,
      });

      // Safe trim check
      if (!textToSend || typeof textToSend !== "string" || !textToSend.trim()) {
        console.log("Message is empty or invalid, not sending");
        return;
      }

      console.log("Sending message:", textToSend);

      const userMessage = {
        id: Date.now(),
        text: textToSend,
        sender: "user",
        timestamp: new Date(),
      };

      // Update current conversation with new message and generate title if it's the first user message
      setConversations((prev) =>
        prev.map((conv) => {
          if (conv.id === currentConversationId) {
            const isFirstUserMessage = conv.messages.length === 1; // Only has the initial AI greeting
            const newTitle = isFirstUserMessage
              ? textToSend.length > 50
                ? textToSend.substring(0, 50) + "..."
                : textToSend
              : conv.title;

            return {
              ...conv,
              title: newTitle,
              messages: [...conv.messages, userMessage],
              lastMessage: textToSend,
              timestamp: new Date().toLocaleString(),
            };
          }
          return conv;
        })
      );

      const currentConv = conversations.find(
        (c) => c.id === currentConversationId
      );
      setInputMessage("");
      setIsLoading(true);

      try {
        console.log("Making API call to agent...");
        // Use the Bedrock agent API
        const response = await fetch(
          "https://4j4vji7vs8.execute-api.us-east-1.amazonaws.com/dev/chch",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              message: textToSend,
            }),
          }
        );

        const result = await response.json();
        const parsed =
          typeof result.body === "string" ? JSON.parse(result.body) : result;
        const aiMessageText = parsed.response;
        console.log("Agent response received:", aiMessageText);

        const aiMessage = {
          id: Date.now() + 1,
          text: aiMessageText,
          sender: "ai",
          timestamp: new Date(),
        };

        // Add AI response to conversation and update sessionId
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === currentConversationId
              ? {
                  ...conv,
                  messages: [...conv.messages, aiMessage],
                  sessionId: response.sessionId,
                }
              : conv
          )
        );
      } catch (error) {
        console.error("Error sending message:", error);
        const errorMessage = {
          id: Date.now() + 1,
          text:
            error.message ||
            "I'm sorry, I'm having trouble connecting right now. Please try again later.",
          sender: "ai",
          timestamp: new Date(),
          isError: true,
        };

        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === currentConversationId
              ? { ...conv, messages: [...conv.messages, errorMessage] }
              : conv
          )
        );
      } finally {
        setIsLoading(false);
      }
    } catch (outerError) {
      console.error("Critical error in handleSendMessage:", outerError);
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  useEffect(() => {
    if (conversations.length === 0) {
      const newConversation = {
        id: Date.now(),
        title: "New Conversation",
        lastMessage: "",
        timestamp: new Date().toLocaleString(),
        sessionId: null,
        messages: [
          {
            id: 1,
            text: "Hello! I'm your Bedrock AI Agent. How can I help you today?",
            sender: "ai",
            timestamp: new Date(),
          },
        ],
      };
      setConversations([newConversation]);
      setCurrentConversationId(newConversation.id);
    }
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value || "";
    console.log("Input changed:", { value, type: typeof value });
    setInputMessage(value);
    // Auto-resize textarea
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  const startNewConversation = async () => {
    try {
      const { agentAPI } = await import("../services/api");
      const session = await agentAPI.createSession();

      const newConversation = {
        id: Date.now(),
        title: "New Conversation",
        lastMessage: "",
        timestamp: new Date().toLocaleString(),
        sessionId: session.sessionId,
        messages: [
          {
            id: 1,
            text: "Hello! I'm your Bedrock AI Agent. How can I help you today?",
            sender: "ai",
            timestamp: new Date(),
          },
        ],
      };

      setConversations((prev) => [newConversation, ...prev]);
      setCurrentConversationId(newConversation.id);
    } catch (error) {
      console.error("Error creating new conversation:", error);
      // Fallback to create conversation without session
      const newConversation = {
        id: Date.now(),
        title: "New Conversation",
        lastMessage: "",
        timestamp: new Date().toLocaleString(),
        messages: [
          {
            id: 1,
            text: "Hello! I'm your Bedrock AI Agent. How can I help you today?",
            sender: "ai",
            timestamp: new Date(),
          },
        ],
      };

      setConversations((prev) => [newConversation, ...prev]);
      setCurrentConversationId(newConversation.id);
    }
  };

  const deleteConversation = (conversationId) => {
    setConversations((prev) =>
      prev.filter((conv) => conv.id !== conversationId)
    );

    // If we're deleting the current conversation, switch to the first available one
    if (currentConversationId === conversationId) {
      const remainingConversations = conversations.filter(
        (conv) => conv.id !== conversationId
      );
      if (remainingConversations.length > 0) {
        setCurrentConversationId(remainingConversations[0].id);
      } else {
        // If no conversations left, create a new one
        startNewConversation();
      }
    }
  };

  const suggestedQuestions = [
    "Các thông tin cơ bản về công ty?",
    "Các bảng biểu về tài chính của 4 quý?",
    "Viết cho tôi một tờ trình tín dụng của công ty",
    "Hãy gửi mail cho Mr.Tran",
  ];

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col md:flex-row bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      {/* Sidebar */}

      <div
        className={`fixed md:static top-16 left-0 h-[calc(100vh-64px)] z-30 transform transition-all duration-300 bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 flex flex-col shadow-2xl
              ${
                sidebarOpen
                  ? "translate-x-0 w-64 sm:w-72 md:w-80"
                  : "-translate-x-full md:translate-x-0 md:w-0"
              }
            `}
      >
        {/* New Chat Button - Only show when sidebar is open */}
        {sidebarOpen && (
          <div className="p-3 md:p-4 border-b border-blue-700/50">
            <button
              onClick={startNewConversation}
              className="w-full flex items-center justify-center px-3 md:px-4 py-2 md:py-3 bg-white hover:bg-blue-50 text-blue-900 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl border-2 border-blue-200 text-sm md:text-base hover:scale-105"
            >
              <Plus className="h-4 w-4 md:h-5 md:w-5 mr-2" />
              New Chat
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto dark-scrollbar">
          <div className="p-2 space-y-1">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`group relative p-3 md:p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                  currentConversationId === conversation.id
                    ? "bg-white/20 shadow-lg border border-blue-300/50 backdrop-blur-sm"
                    : "hover:bg-white/10 hover:shadow-md"
                }`}
                onClick={() => {
                  setCurrentConversationId(conversation.id);
                  if (window.innerWidth < 768) {
                    setSidebarOpen(false);
                  }
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0 mr-2">
                    <div className="flex items-center mb-1 md:mb-2">
                      <MessageSquare className="h-3 w-3 md:h-4 md:w-4 text-blue-200 mr-2 md:mr-3 flex-shrink-0" />
                      <h3 className="text-xs md:text-sm text-white truncate font-semibold">
                        {conversation.title}
                      </h3>
                    </div>
                    <p className="text-xs text-blue-100 truncate opacity-80">
                      {conversation.lastMessage || "No messages yet"}
                    </p>
                  </div>
                  <div className="flex items-center space-x-1 md:opacity-0 md:group-hover:opacity-100">
                    <button className="p-1 md:p-2 text-blue-200 hover:text-white rounded-lg hover:bg-white/20 transition-all hover:scale-110">
                      <Edit3 className="h-3 w-3 md:h-3.5 md:w-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteConversation(conversation.id);
                      }}
                      className="p-1 md:p-2 text-blue-200 hover:text-red-300 rounded-lg hover:bg-white/20 transition-all hover:scale-110"
                    >
                      <Trash2 className="h-3 w-3 md:h-3.5 md:w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-3 md:p-4 border-t border-blue-700/50">
          <div className="flex items-center space-x-2 md:space-x-3 text-white">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
              <span className="text-blue-900 font-bold text-sm md:text-lg">
                B
              </span>
            </div>
            <div>
              <p className="text-xs md:text-sm font-semibold">Bedrock Agent</p>
              <p className="text-xs text-blue-200 opacity-80">AI Assistant</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white/80 backdrop-blur-sm md:ml-0 h-[calc(100vh-64px)]">
        {/* Header */}

        {/* Messages - Fixed height container */}
        <div className="flex-1 overflow-hidden">
          {messages.length === 1 ? (
            /* Suggested Questions - Centered when no messages */
            <div className="h-full flex items-center justify-center px-3 md:px-6">
              <div className="max-w-2xl w-full">
                <div className="text-center mb-6">
                  <h3 className="text-blue-900 font-semibold mb-2 text-lg md:text-xl">
                    Welcome to CREDIT PROCESS AUTOMATION 🤖
                  </h3>
                  <p className="text-blue-600 text-sm md:text-base opacity-80">
                    Try asking me about:
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  {suggestedQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        try {
                          console.log("Suggested question clicked:", question);
                          setInputMessage(String(question || ""));
                        } catch (error) {
                          console.error(
                            "Error setting suggested question:",
                            error
                          );
                          setInputMessage("");
                        }
                      }}
                      className="text-left p-4 md:p-5 text-sm md:text-base text-blue-800 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all duration-200 border-2 border-blue-200 hover:border-blue-300 shadow-sm hover:shadow-md hover:scale-105 backdrop-blur-sm"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-sm">
                            {index + 1}
                          </span>
                        </div>
                        <span className="leading-relaxed">{question}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Chat Messages - Scrollable area */
            <div className="h-full overflow-y-auto chat-scrollbar">
              <div className="max-w-3xl mx-auto px-3 md:px-6 py-4 md:py-6 space-y-4 md:space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender === "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`flex items-start gap-[10px] max-w-[85%] md:max-w-2xl ${
                        message.sender === "user" ? "flex-row-reverse" : ""
                      }`}
                    >
                      <div
                        className={`flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shadow-lg ${
                          message.sender === "user"
                            ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white"
                            : "bg-gradient-to-r from-blue-600 to-blue-700 text-white"
                        }`}
                      >
                        {message.sender === "user" ? (
                          <User className="h-4 w-4 md:h-5 md:w-5" />
                        ) : (
                          <span className="font-bold text-xs md:text-sm">
                            B
                          </span>
                        )}
                      </div>
                      <div
                        className={`p-3 md:p-5 rounded-2xl shadow-sm backdrop-blur-sm ${
                          message.sender === "user"
                            ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
                            : message.isError
                            ? "bg-red-50 text-red-800 border-2 border-red-200"
                            : "bg-white/90 text-gray-800 border-2 border-blue-100/50 shadow-lg"
                        }`}
                      >
                        <p className="whitespace-pre-wrap leading-relaxed text-sm md:text-base">
                          {message.text}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex items-start space-x-2 md:space-x-3 max-w-[85%] md:max-w-2xl">
                      <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white flex items-center justify-center shadow-lg">
                        <span className="font-bold text-xs md:text-sm">B</span>
                      </div>
                      <div className="p-3 md:p-5 bg-white/90 border-2 border-blue-100/50 rounded-2xl shadow-sm backdrop-blur-sm">
                        <div className="flex items-center space-x-2 md:space-x-3 text-blue-600">
                          <Loader className="h-4 w-4 md:h-5 md:w-5 animate-spin" />
                          <span className="font-medium text-sm md:text-base">
                            AI Agent is thinking...
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>
          )}
        </div>

        {/* Input Area - Fixed at bottom */}
        <div className="border-t border-blue-100/50 bg-gradient-to-t from-blue-50/90 to-white/90 backdrop-blur-sm p-3 md:p-6 flex-shrink-0">
          <div className="max-w-3xl mx-auto">
            <div className="relative flex items-center space-x-2 md:space-x-3 bg-white/90 border-2 border-blue-200/50 rounded-2xl shadow-lg backdrop-blur-sm p-2">
              <textarea
                value={inputMessage}
                onChange={handleInputChange}
                onKeyDown={handleKeyPress}
                placeholder="Message AI Agent..."
                className="flex-1 p-3 md:p-4 border-0 rounded-2xl resize-none focus:ring-0 focus:outline-none text-gray-800 placeholder-blue-400 text-sm md:text-base bg-transparent min-h-[44px] max-h-[120px]"
                rows={1}
                disabled={isLoading}
                style={{ minHeight: "44px", maxHeight: "120px" }}
              />
              <button
                onClick={() => {
                  try {
                    console.log("Submit button clicked!", {
                      inputMessage,
                      inputValid: isInputValid(),
                      isLoading,
                      disabled: !isInputValid() || isLoading,
                    });
                    handleSendMessage();
                  } catch (error) {
                    console.error("Error in submit button click:", error);
                  }
                }}
                disabled={!isInputValid() || isLoading}
                aria-label="Send"
                title="Send"
                className={`flex items-center justify-center text-white p-3 rounded-full transition-all duration-200 shadow-md hover:shadow-lg hover:scale-110 self-center ${
                  !isInputValid() || isLoading
                    ? "bg-gray-400 cursor-not-allowed opacity-50"
                    : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                }`}
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
