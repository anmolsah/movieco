import React from "react";
import { Heart, Github, Linkedin, Film } from "lucide-react";
import logo from "../assets/logo5.png";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-t border-slate-700/50">
      <div className="container mx-auto px-6 max-w-7xl py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {/* Brand Section */}
          <div className="text-center md:text-left">
            <img className="w-60 h-48" src="./logo5.png" />
            <p className="text-slate-400 text-sm">
              Discover your next favorite movie with AI-powered recommendations
            </p>
          </div>

          {/* Made with Love Section */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-slate-300">Made with</span>
              <Heart className="w-4 h-4 text-red-500 fill-current animate-pulse" />
              <span className="text-slate-300">by</span>
            </div>
            <div className="text-lg font-semibold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Anmol Sah
            </div>
          </div>

          {/* Social Links */}
          <div className="flex items-center justify-center md:justify-end gap-4">
            <a
              href="https://github.com/anmolsah"
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-slate-800/50 hover:bg-slate-700 p-3 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-purple-500/20"
            >
              <Github className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors duration-200" />
            </a>
            <a
              href="https://linkedin.com/in/anmolsah"
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-slate-800/50 hover:bg-blue-600 p-3 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-blue-500/20"
            >
              <Linkedin className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors duration-200" />
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="my-8">
          <div className="h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent"></div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-400">
          <div className="flex items-center gap-4">
            <span>&copy; 2025 Movieco. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6">
            <span className="text-xs">Powered by TMDB API</span>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs">Live</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
