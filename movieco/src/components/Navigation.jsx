import React, { useState } from "react";
import logo from "../assets/logo5.png";
import { Film, Bot, Search, Heart, X, Menu } from "lucide-react";

const Navigation = () => {
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navItems = [
    { id: "home", label: "Home", icon: Film },
    { id: "now-playing", label: "Now Playing", icon: null },
    { id: "upcoming", label: "Upcoming", icon: null },
    { id: "popular", label: "Popular", icon: null },
    { id: "top-rated", label: "Top Rated", icon: null },
  ];
  return (
    <nav className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          <img className="w-60 h-48" src="./logo5.png" />

          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200`}
              >
                {item.icon && <item.icon className="w-4 h-4" />}
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors duration-200 relative group">
              <Bot className="w-5 h-5" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-pulse"></div>
            </button>

            <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors duration-200">
              <Search className="w-5 h-5" />
            </button>

            <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors duration-200">
              <Heart className="w-5 h-5" />
            </button>

            <button className="flex items-center gap-2 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors duration-200">
              <img
                src={logo}
                alt="logo"
                className="w-6 h-6 rounded-full border border-slate-600"
              />
            </button>

            <button className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors duration-200">
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-800">
            <div className="space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200`}
                >
                  {item.icon && <item.icon className="w-4 h-4" />}
                  {item.label}
                </button>
              ))}

              <button className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-all duration-200">
                <Bot className="w-4 h-4" />
                AI Movie Discovery
              </button>

              <button className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-all duration-200">
                <Heart className="w-4 h-4" />
                My Watchlist
              </button>

              <button className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-all duration-200">
                <img
                  src={logo}
                  alt="logo"
                  className="w-8 h-8 rounded-full border border-slate-600"
                />
                Profile
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
