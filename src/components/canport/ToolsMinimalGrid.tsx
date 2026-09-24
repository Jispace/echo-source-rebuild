import React from 'react';
import { Wrench } from 'lucide-react';

interface ToolItem {
  id: string;
  name: string;
  renderLogo: () => React.ReactNode;
}

const mainTools: ToolItem[] = [
  {
    id: 'gmail',
    name: 'Gmail',
    renderLogo: () => (
      <svg className="w-9 h-9 sm:w-11 sm:h-11" viewBox="0 0 64 64" fill="none" aria-label="Gmail">
        <path d="M12 18.5V47.5C12 50.8 14.7 53.5 18 53.5H23V34L12 25.5V18.5Z" fill="#4285F4"/>
        <path d="M52 18.5V47.5C52 50.8 49.3 53.5 46 53.5H41V34L52 25.5V18.5Z" fill="#34A853"/>
        <path d="M41 34V16L32 23L23 16V34L32 41L41 34Z" fill="#EA4335"/>
        <path d="M12 18.5C12 14.5 16.5 12.2 19.8 14.7L23 17.2V34L12 25.5V18.5Z" fill="#C5221F"/>
        <path d="M52 18.5C52 14.5 47.5 12.2 44.2 14.7L41 17.2V34L52 25.5V18.5Z" fill="#FBBC04"/>
      </svg>
    ),
  },
  {
    id: 'outlook',
    name: 'Outlook',
    renderLogo: () => (
      <svg className="w-9 h-9 sm:w-11 sm:h-11" viewBox="0 0 64 64" fill="none" aria-label="Outlook">
        <path d="M36 12L56 18.5V45.5L36 52V12Z" fill="#0078D4"/>
        <path d="M36 22.5L56 28.5V45.5L36 52V22.5Z" fill="#106EBE"/>
        <path d="M36 32.5L56 37.5V45.5L36 52V32.5Z" fill="#005A9E"/>
        <rect x="8" y="16" width="30" height="32" rx="7" fill="#28A8EA"/>
        <circle cx="23" cy="32" r="8" fill="#0078D4"/>
        <ellipse cx="23" cy="32" rx="4.5" ry="6" fill="#FFFFFF"/>
        <ellipse cx="23" cy="32" rx="2.5" ry="3.5" fill="#28A8EA"/>
      </svg>
    ),
  },
  {
    id: 'calendar',
    name: 'Google Calendar',
    renderLogo: () => (
      <svg className="w-9 h-9 sm:w-11 sm:h-11" viewBox="0 0 64 64" fill="none" aria-label="Google Calendar">
        <rect x="8" y="8" width="48" height="48" rx="10" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="1.5" />
        <path d="M18 8H46C51.5228 8 56 12.4772 56 18V22H8V18C8 12.4772 12.4772 8 18 8Z" fill="#4285F4"/>
        <path d="M8 22H12V46H8V22Z" fill="#4285F4"/>
        <path d="M52 22H56V46H52V22Z" fill="#34A853"/>
        <path d="M8 46H22V56H18C12.4772 56 8 51.5228 8 46Z" fill="#EA4335"/>
        <path d="M22 46H42V56H22V46Z" fill="#FBBC04"/>
        <path d="M42 46H56C56 51.5228 51.5228 56 46 56H42V46Z" fill="#34A853"/>
        <text x="32" y="42" fill="#1A73E8" fontSize="21" fontWeight="700" fontFamily="system-ui, -apple-system, sans-serif" textAnchor="middle">31</text>
      </svg>
    ),
  },
  {
    id: 'sheets',
    name: 'Google Sheets',
    renderLogo: () => (
      <svg className="w-9 h-9 sm:w-11 sm:h-11" viewBox="0 0 64 64" fill="none" aria-label="Google Sheets">
        <rect x="12" y="8" width="40" height="48" rx="6" fill="#0F9D58"/>
        <path d="M38 8L52 22H38V8Z" fill="#87CEAB"/>
        <rect x="20" y="24" width="24" height="20" rx="2" fill="#FFFFFF"/>
        <line x1="20" y1="30" x2="44" y2="30" stroke="#0F9D58" strokeWidth="2"/>
        <line x1="20" y1="37" x2="44" y2="37" stroke="#0F9D58" strokeWidth="2"/>
        <line x1="32" y1="24" x2="32" y2="44" stroke="#0F9D58" strokeWidth="2"/>
      </svg>
    ),
  },
  {
    id: 'excel',
    name: 'Microsoft Excel',
    renderLogo: () => (
      <svg className="w-9 h-9 sm:w-11 sm:h-11" viewBox="0 0 64 64" fill="none" aria-label="Microsoft Excel">
        <rect x="24" y="10" width="30" height="44" rx="5" fill="#107C41"/>
        <rect x="29" y="16" width="20" height="32" rx="2" fill="#185C37"/>
        <line x1="29" y1="24" x2="49" y2="24" stroke="white" strokeWidth="1.2" strokeOpacity="0.7"/>
        <line x1="29" y1="32" x2="49" y2="32" stroke="white" strokeWidth="1.2" strokeOpacity="0.7"/>
        <line x1="29" y1="40" x2="49" y2="40" stroke="white" strokeWidth="1.2" strokeOpacity="0.7"/>
        <line x1="39" y1="16" x2="39" y2="48" stroke="white" strokeWidth="1.2" strokeOpacity="0.7"/>
        <rect x="10" y="17" width="24" height="30" rx="4" fill="#107C41" stroke="#0D5A30" strokeWidth="1"/>
        <text x="22" y="39" fill="white" fontSize="20" fontWeight="bold" fontFamily="system-ui, -apple-system, sans-serif" textAnchor="middle">X</text>
      </svg>
    ),
  },
  {
    id: 'notion',
    name: 'Notion',
    renderLogo: () => (
      <svg className="w-9 h-9 sm:w-11 sm:h-11" viewBox="0 0 100 100" fill="none" aria-label="Notion">
        <path d="M6.3 17.6L61.7 1.4C66.8-.1 70.8 1.4 74.3 5.4L92.7 20.3C95.7 22.8 97.4 25.8 97.4 30.3V87.2C97.4 93.3 93.4 97.8 86.8 98.8L28.8 100C23.2 100 19.2 98 16.7 94L2.6 72.8C.5 69.8-.4 66.8.1 63.8L6.3 17.6Z" fill="#000000"/>
        <path d="M63.7 7.1L12.1 21.8C10.6 22.3 9.6 23.3 9.6 25.3V82.8C9.6 85.3 11.6 87.4 14.1 87.4L71.7 85.8C74.3 85.8 76.3 83.8 76.3 81.3V11.2C76.3 8.6 74.3 6.6 71.7 6.6L63.7 7.1Z" fill="#FFFFFF"/>
        <path d="M22.2 32.8C20.2 33.3 19.2 34.3 19.2 36.3V73.7C19.2 75.7 20.2 76.8 22.2 76.8H26.3C28.3 76.8 29.3 75.7 29.3 73.7V48.5L48.5 76.3C49.5 77.8 51.5 78.3 54 77.8H59.1C61.1 77.3 62.1 76.3 62.1 74.3V37.3C62.1 35.3 61.1 34.3 59.1 34.3H55C53 34.3 52 35.3 52 37.3V61.5L33.3 33.8C31.8 32.3 29.8 31.8 27.8 31.8L22.2 32.8Z" fill="#000000"/>
      </svg>
    ),
  },
  {
    id: 'canva',
    name: 'Canva',
    renderLogo: () => (
      <span className="font-['Caveat',_'Brush_Script_MT',_cursive] text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#00C4CC] via-[#2E7CE4] to-[#7D2AE8] bg-clip-text text-transparent italic select-none">
        Canva
      </span>
    ),
  },
  {
    id: 'trello',
    name: 'Trello',
    renderLogo: () => (
      <div className="flex items-center gap-1 sm:gap-1.5">
        <svg className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" viewBox="0 0 24 24" fill="none">
          <rect width="24" height="24" rx="4" fill="#0079BF" />
          <rect x="4" y="4" width="6" height="12" rx="1.5" fill="white" />
          <rect x="14" y="4" width="6" height="8" rx="1.5" fill="white" />
        </svg>
        <span className="font-bold text-xs sm:text-sm text-[#0079BF] tracking-tight">Trello</span>
      </div>
    ),
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    renderLogo: () => (
      <div className="flex items-center">
        <span className="font-bold text-xs sm:text-sm text-[#33475B]">HubSp</span>
        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 mx-0.5 shrink-0" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="5" stroke="#FF7A59" strokeWidth="2.5" />
          <circle cx="12" cy="3.5" r="2.2" fill="#FF7A59" />
          <line x1="12" y1="5.7" x2="12" y2="7" stroke="#FF7A59" strokeWidth="2.5" />
          <circle cx="20.5" cy="12" r="2.2" fill="#FF7A59" />
          <line x1="17" y1="12" x2="18.3" y2="12" stroke="#FF7A59" strokeWidth="2.5" />
        </svg>
        <span className="font-bold text-xs sm:text-sm text-[#33475B]">t</span>
      </div>
    ),
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    renderLogo: () => (
      <svg className="w-9 h-9 sm:w-11 sm:h-11" viewBox="0 0 64 64" fill="none" aria-label="ChatGPT">
        <rect width="64" height="64" rx="16" fill="#10A37F" />
        <g transform="translate(32, 32) scale(0.65)" stroke="white" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M0 -22 C6 -22 14 -18 17 -13 L7 4 C4 9 -2 12 -7 9 L-17 3 C-20 -2 -19 -10 -15 -14 Z" />
          <path d="M0 -22 C6 -22 14 -18 17 -13 L7 4 C4 9 -2 12 -7 9 L-17 3 C-20 -2 -19 -10 -15 -14 Z" transform="rotate(60)" />
          <path d="M0 -22 C6 -22 14 -18 17 -13 L7 4 C4 9 -2 12 -7 9 L-17 3 C-20 -2 -19 -10 -15 -14 Z" transform="rotate(120)" />
          <path d="M0 -22 C6 -22 14 -18 17 -13 L7 4 C4 9 -2 12 -7 9 L-17 3 C-20 -2 -19 -10 -15 -14 Z" transform="rotate(180)" />
          <path d="M0 -22 C6 -22 14 -18 17 -13 L7 4 C4 9 -2 12 -7 9 L-17 3 C-20 -2 -19 -10 -15 -14 Z" transform="rotate(240)" />
          <path d="M0 -22 C6 -22 14 -18 17 -13 L7 4 C4 9 -2 12 -7 9 L-17 3 C-20 -2 -19 -10 -15 -14 Z" transform="rotate(300)" />
        </g>
      </svg>
    ),
  },
  {
    id: 'claude',
    name: 'Claude',
    renderLogo: () => (
      <div className="flex items-center gap-1 sm:gap-1.5">
        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D97757] shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 1L13.8 8.2L21 6.5L16.2 12L21 17.5L13.8 15.8L12 23L10.2 15.8L3 17.5L7.8 12L3 6.5L10.2 8.2L12 1Z" />
        </svg>
        <span className="font-semibold text-xs sm:text-sm text-[#191919] tracking-tight">Claude</span>
      </div>
    ),
  },
  {
    id: 'stripe',
    name: 'Stripe',
    renderLogo: () => (
      <span className="font-extrabold text-base sm:text-lg text-[#635BFF] tracking-tight select-none">
        stripe
      </span>
    ),
  },
];

const secondaryTools = [
  'MS Word',
  'Google Docs',
  'Google Meet',
  'Google Drive',
  'Zoom',
  'Opus',
  'Systeme.io',
];

export const ToolsMinimalGrid: React.FC = () => {
  return (
    <section id="outils" className="py-14 sm:py-16 md:py-24 bg-[#FDFBF7] border-t border-[#EAE3D8]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF7F2] border border-[#E7E0D5] text-xs font-semibold uppercase tracking-wider text-[#7A583E] mb-3 shadow-2xs">
            <Wrench className="w-3.5 h-3.5 text-[#A87C51]" />
            <span>Environnement & Outils</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#2D241E] tracking-tight">
            Une maîtrise fluide des plateformes incontournables
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-[#635345] leading-relaxed">
            Des outils essentiels pour une intégration immédiate dans vos opérations.
          </p>
        </div>

        {/* 12 Tools Grid (3 columns on mobile, 4/6 on larger screens) */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-4 max-w-2xl md:max-w-3xl mx-auto">
          {mainTools.map((tool) => (
            <div
              key={tool.id}
              className="aspect-square min-w-0 rounded-xl sm:rounded-3xl bg-white border border-[#ECE5DB] shadow-2xs hover:shadow-md hover:border-[#D5C7B7] hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center p-2 sm:p-4 group cursor-default overflow-hidden"
              title={tool.name}
            >
              <div className="transition-transform duration-200 group-hover:scale-105 flex items-center justify-center">
                {tool.renderLogo()}
              </div>
            </div>
          ))}
        </div>

        {/* Secondary Tools Pills */}
        <div className="mt-10 sm:mt-14 text-center">
          <h3 className="text-xs sm:text-sm font-bold text-[#2D241E] mb-4">
            Également opérationnelle sur
          </h3>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-2.5 max-w-lg mx-auto">
            {secondaryTools.map((tool) => (
              <span
                key={tool}
                className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white border border-[#E2D8CC] text-xs sm:text-sm font-medium text-[#2D241E] shadow-2xs hover:bg-[#FAF7F2] hover:border-[#D5C7B7] transition-all"
              >
                {tool}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

