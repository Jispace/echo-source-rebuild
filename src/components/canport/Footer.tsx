import React from 'react';
import { portfolioProfile } from '../../data/portfolioData';
import { Sparkles, RotateCcw } from 'lucide-react';

interface FooterProps {
  onReplayLoader?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onReplayLoader }) => {
  return (
    <footer className="py-12 bg-[#FAF7F2] border-t border-[#EAE3D8] text-xs text-[#7A6C5E]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-5">
        <div className="flex flex-wrap items-center justify-center gap-2 text-center sm:justify-start sm:text-left">
          <span className="font-bold text-[#2D241E]">{portfolioProfile.name}</span>
          <span>•</span>
          <span>{portfolioProfile.subtitle}</span>
        </div>

        <div className="flex max-w-full flex-wrap items-center justify-center gap-x-5 gap-y-3">
          <a
            href={portfolioProfile.links.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="break-all hover:text-[#2D241E] transition-colors"
          >
            LinkedIn
          </a>
          <a
            href={`mailto:${portfolioProfile.links.email}`}
            className="hover:text-[#2D241E] transition-colors"
          >
            {portfolioProfile.links.email}
          </a>
          {onReplayLoader && (
            <button
              type="button"
              onClick={onReplayLoader}
              className="inline-flex items-center gap-1.5 hover:text-[#2D241E] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Revoir l'intro</span>
            </button>
          )}
        </div>
      </div>
    </footer>
  );
};
