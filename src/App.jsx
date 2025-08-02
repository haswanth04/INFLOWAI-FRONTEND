import React, { useState, useRef, useEffect } from "react";
import { Send, User, Bot, Sparkles, Sun, Moon } from "lucide-react";

function App() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleAsk = async () => {
    if (!query.trim()) return;

    const userMessage = { type: "user", content: query };
    setMessages(prev => [...prev, userMessage]);
    setQuery("");
    setLoading(true);

    try {
      const response = await fetch("https://inflowaibackend.onrender.com/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();
      
      if (response.ok) {
        const aiMessage = { type: "ai", content: data.answer };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        const errorMessage = { type: "error", content: data.error || "Something went wrong" };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (err) {
      const errorMessage = { type: "error", content: "Failed to connect to the server" };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [query]);

  return (
    <div className={`flex flex-col h-screen transition-colors duration-300 ${
      isDark ? 'bg-gray-900' : 'bg-white'
    }`}>
      {/* Header */}
      <header className={`flex items-center justify-between px-6 py-4 border-b backdrop-blur-sm sticky top-0 z-10 transition-colors duration-300 ${
        isDark 
          ? 'border-gray-700 bg-gray-900/80' 
          : 'border-gray-100 bg-white/80'
      }`}>
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
          </div>
          <h1 className={`text-lg font-medium transition-colors duration-300 ${
            isDark ? 'text-white' : 'text-gray-800'
          }`}>InfoFlow AI</h1>
        </div>
        
        {/* Theme Toggle */}
        <button
          onClick={() => setIsDark(!isDark)}
          className={`p-2 rounded-full transition-all duration-300 hover:scale-110 ${
            isDark 
              ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400' 
              : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
          }`}
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </header>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-4">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-6">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className={`text-2xl font-semibold mb-2 transition-colors duration-300 ${
              isDark ? 'text-white' : 'text-gray-800'
            }`}>How can I help you today?</h2>
            <p className={`text-center max-w-md transition-colors duration-300 ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Ask me anything and I'll provide you with detailed, helpful responses.
            </p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto px-4 py-6">
            {messages.map((message, index) => (
              <div key={index} className={`flex gap-4 mb-8 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                {message.type !== 'user' && (
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.type === 'error' 
                        ? isDark ? 'bg-red-900/30' : 'bg-red-100'
                        : 'bg-gradient-to-r from-purple-500 to-pink-500'
                    }`}>
                      {message.type === 'error' ? (
                        <span className={`text-sm font-bold ${
                          isDark ? 'text-red-400' : 'text-red-600'
                        }`}>!</span>
                      ) : (
                        <Bot className="w-4 h-4 text-white" />
                      )}
                    </div>
                  </div>
                )}
                
                <div className={`flex-1 ${message.type === 'user' ? 'max-w-xs' : 'max-w-none'}`}>
                  <div className={`rounded-2xl px-4 py-3 ${
                    message.type === 'user' 
                      ? 'bg-blue-500 text-white ml-auto' 
                      : message.type === 'error'
                      ? isDark 
                        ? 'bg-red-900/20 text-red-300 border border-red-800/30'
                        : 'bg-red-50 text-red-800 border border-red-200'
                      : isDark
                        ? 'bg-gray-800 text-gray-100'
                        : 'bg-gray-50 text-gray-800'
                  }`}>
                    {message.content.split('\n').map((line, idx) => (
                      <p key={idx} className={`${idx > 0 ? 'mt-2' : ''} leading-relaxed`}>
                        {line || '\u00A0'}
                      </p>
                    ))}
                  </div>
                </div>

                {message.type === 'user' && (
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {loading && (
              <div className="flex gap-4 mb-8">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className={`rounded-2xl px-4 py-3 transition-colors duration-300 ${
                    isDark ? 'bg-gray-800' : 'bg-gray-50'
                  }`}>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className={`w-2 h-2 rounded-full animate-bounce ${
                          isDark ? 'bg-gray-500' : 'bg-gray-400'
                        }`}></div>
                        <div className={`w-2 h-2 rounded-full animate-bounce ${
                          isDark ? 'bg-gray-500' : 'bg-gray-400'
                        }`} style={{ animationDelay: '0.1s' }}></div>
                        <div className={`w-2 h-2 rounded-full animate-bounce ${
                          isDark ? 'bg-gray-500' : 'bg-gray-400'
                        }`} style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className={`text-sm transition-colors duration-300 ${
                        isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}>Thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className={`border-t transition-colors duration-300 ${
        isDark 
          ? 'border-gray-700 bg-gray-900' 
          : 'border-gray-100 bg-white'
      }`}>
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className={`relative rounded-2xl border focus-within:border-blue-300 focus-within:ring-1 focus-within:ring-blue-300 transition-all duration-200 ${
            isDark 
              ? 'bg-gray-800 border-gray-600' 
              : 'bg-gray-50 border-gray-200'
          }`}>
            <textarea
              ref={textareaRef}
              rows={1}
              placeholder="Message InfoFlow AI..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className={`w-full px-4 py-3 pr-12 bg-transparent border-none resize-none focus:outline-none max-h-48 transition-colors duration-300 ${
                isDark 
                  ? 'text-gray-100 placeholder-gray-400' 
                  : 'text-gray-800 placeholder-gray-500'
              }`}
              disabled={loading}
              style={{ minHeight: '48px' }}
            />
            <button
              onClick={handleAsk}
              disabled={loading || !query.trim()}
              className="absolute right-2 bottom-2 w-8 h-8 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className={`text-xs text-center mt-2 transition-colors duration-300 ${
            isDark ? 'text-gray-500' : 'text-gray-400'
          }`}>
            InfoFlow AI can make mistakes. Consider checking important information.
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
