import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, Lightbulb, X, Loader } from "lucide-react";
import AIMovieBot from "../services/aiMovieBot.js";
import MovieCard from "./MovieCard.jsx";

const AIMovieBotComponent = ({
  isOpen,
  onClose,
  moviePool,
  onMovieClick,
  onAddToWatchlist,
  watchlist,
  onAuthRequired,
}) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      content:
        "Hi! I'm your Movieco AI discovery assistant. Tell me what you're in the mood for and I'll find the perfect movies for you!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions] = useState(AIMovieBot.getQuickSuggestions());
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const analysis = await AIMovieBot.enhancedAnalyzeUserInput(input.trim());

      const results = await AIMovieBot.findMovies(analysis, moviePool);

      const explanation = AIMovieBot.generateExplanation(analysis, results);

      const botMessage = {
        id: Date.now() + 1,
        type: "bot",
        content: explanation,
        movies: results.movies.slice(0, 8),
        analysis: analysis,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: "bot",
        content:
          "I'm having trouble processing your request right now. Please try again or use simpler terms like 'funny movies' or 'action films'.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-2xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-lg">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                AI Movie Discovery
              </h2>
              <p className="text-sm text-slate-400">Powered by advanced AI</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.type === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.type === "bot" && (
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}

              <div
                className={`max-w-[80%] ${
                  message.type === "user" ? "order-1" : ""
                }`}
              >
                <div
                  className={`rounded-2xl p-4 ${
                    message.type === "user"
                      ? "bg-purple-600 text-white ml-auto"
                      : "bg-slate-800 text-slate-200"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>

                {/* Movie Results */}
                {message.movies && message.movies.length > 0 && (
                  <div className="mt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {message.movies.map((movie) => (
                        <div key={movie.id} className="transform scale-90">
                          <MovieCard
                            movie={movie}
                            onMovieClick={onMovieClick}
                            onAddToWatchlist={onAddToWatchlist}
                            isInWatchlist={watchlist.some(
                              (w) => w.id === movie.id
                            )}
                            onAuthRequired={onAuthRequired}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-xs text-slate-500 mt-2">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>

              {message.type === "user" && (
                <div className="bg-slate-700 p-2 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-slate-800 rounded-2xl p-4">
                <div className="flex items-center gap-2 text-slate-400">
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Analyzing your request...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestions */}
        {messages.length === 1 && (
          <div className="px-6 pb-4">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-slate-400">
                Try these suggestions:
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestions.slice(0, 6).map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-2 rounded-lg text-sm transition-colors duration-200"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-6 border-t border-slate-700">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Describe what kind of movie you want... (e.g., 'I want something funny and recent' or 'Show me romantic Korean movies')"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 resize-none"
                rows="2"
                disabled={isLoading}
              />
              <div className="absolute bottom-2 right-2 text-xs text-slate-500">
                Press Enter to send
              </div>
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-colors duration-200 flex items-center justify-center"
            >
              {isLoading ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIMovieBotComponent;
