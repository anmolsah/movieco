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
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

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

  const handleInputChange = (e) => {
    setInput(e.target.value);
    // Auto-resize textarea on mobile
    if (window.innerWidth < 640) {
      e.target.style.height = "auto";
      e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
    }
  };

  // Mobile swipe to close handlers
  const handleTouchStart = (e) => {
    if (window.innerWidth >= 640) return; // Only on mobile
    setStartY(e.touches[0].clientY);
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging || window.innerWidth >= 640) return;
    setCurrentY(e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (!isDragging || window.innerWidth >= 640) return;
    const deltaY = currentY - startY;
    if (deltaY > 100) {
      // Swipe down threshold
      onClose();
    }
    setIsDragging(false);
    setStartY(0);
    setCurrentY(0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-slate-900 ai-bot-mobile rounded-t-2xl sm:rounded-2xl w-full max-w-4xl h-[100vh] sm:h-[80vh] flex flex-col">
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-700 bg-slate-900 rounded-t-2xl sm:rounded-t-2xl relative"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Mobile drag indicator */}
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-slate-600 rounded-full sm:hidden"></div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-1.5 sm:p-2 rounded-lg">
              <Bot className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                AI Movie Discovery
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 hidden sm:block">
                Powered by advanced AI
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors duration-200 p-1"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-3 sm:space-y-4 ai-bot-messages">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-2 sm:gap-3 ${
                message.type === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.type === "bot" && (
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-1.5 sm:p-2 rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[80%] ${
                  message.type === "user" ? "order-1" : ""
                }`}
              >
                <div
                  className={`rounded-2xl p-3 sm:p-4 ${
                    message.type === "user"
                      ? "bg-purple-600 text-white ml-auto"
                      : "bg-slate-800 text-slate-200"
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm sm:text-base">
                    {message.content}
                  </p>
                </div>

                {/* Movie Results */}
                {message.movies && message.movies.length > 0 && (
                  <div className="mt-3 sm:mt-4">
                    {/* Mobile: Horizontal scroll */}
                    <div className="sm:hidden">
                      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide px-1">
                        {message.movies.map((movie) => (
                          <div key={movie.id} className="flex-shrink-0 w-32">
                            <div
                              className="bg-slate-800 rounded-lg overflow-hidden cursor-pointer transform transition-transform duration-200 active:scale-95"
                              onClick={() => onMovieClick(movie)}
                            >
                              <img
                                src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                                alt={movie.title}
                                className="w-full h-48 object-cover"
                                onError={(e) => {
                                  e.target.src = "/placeholder-movie.jpg";
                                }}
                              />
                              <div className="p-2">
                                <h4 className="text-white text-xs font-medium line-clamp-2 mb-1">
                                  {movie.title}
                                </h4>
                                <div className="flex items-center justify-between">
                                  <span className="text-yellow-400 text-xs">
                                    ⭐ {movie.vote_average?.toFixed(1)}
                                  </span>
                                  <div className="text-purple-400 text-xs">
                                    Tap to view
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Desktop: Grid */}
                    <div className="hidden sm:block">
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
                  </div>
                )}

                <div className="text-xs text-slate-500 mt-2">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>

              {message.type === "user" && (
                <div className="bg-slate-700 p-1.5 sm:p-2 rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center flex-shrink-0 mt-1">
                  <User className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-2 sm:gap-3 justify-start">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-1.5 sm:p-2 rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center flex-shrink-0 mt-1">
                <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
              <div className="bg-slate-800 rounded-2xl p-3 sm:p-4">
                <div className="flex items-center gap-2 text-slate-400">
                  <Loader className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                  <span className="text-sm sm:text-base">
                    Analyzing your request...
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestions */}
        {messages.length === 1 && (
          <div className="px-3 sm:px-6 pb-3 sm:pb-4">
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <Lightbulb className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
              <span className="text-xs sm:text-sm text-slate-400">
                Try these suggestions:
              </span>
            </div>
            {/* Mobile: Horizontal scroll */}
            <div className="sm:hidden">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {suggestions.slice(0, 8).map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-2 rounded-lg text-xs whitespace-nowrap transition-colors duration-200 flex-shrink-0"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
            {/* Desktop: Flex wrap */}
            <div className="hidden sm:flex flex-wrap gap-2">
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
        <div className="p-3 sm:p-6 border-t border-slate-700 bg-slate-900 ai-bot-input">
          <div className="flex gap-2 sm:gap-3">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="What kind of movie are you looking for?"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 resize-none text-sm sm:text-base"
                rows="1"
                disabled={isLoading}
                style={{ minHeight: "40px", maxHeight: "120px" }}
              />
              <div className="absolute bottom-1 right-2 text-xs text-slate-500 hidden sm:block">
                Press Enter to send
              </div>
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white p-2 sm:p-3 rounded-xl transition-colors duration-200 flex items-center justify-center min-w-[40px] sm:min-w-[48px]"
            >
              {isLoading ? (
                <Loader className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
              ) : (
                <Send className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </button>
          </div>

          {/* Mobile helper text */}
          <div className="mt-2 text-xs text-slate-500 sm:hidden">
            Try: "funny movies", "scary Korean films", "romantic 90s movies"
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIMovieBotComponent;
