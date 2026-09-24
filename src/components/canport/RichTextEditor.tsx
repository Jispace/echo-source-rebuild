import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Eraser,
  Palette,
  Highlighter,
  Check,
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
  maxHeight?: number;
  id?: string;
}

// Refined palette matching the portfolio's warm minimalist aesthetic
const TEXT_COLORS = [
  { name: 'Par défaut', value: '#2D241E', bg: 'bg-[#2D241E]' },
  { name: 'Brun chaud', value: '#7A583E', bg: 'bg-[#7A583E]' },
  { name: 'Terre cuite', value: '#C25E38', bg: 'bg-[#C25E38]' },
  { name: 'Vert olive', value: '#3F624D', bg: 'bg-[#3F624D]' },
  { name: 'Bleu ardoise', value: '#2C4A6F', bg: 'bg-[#2C4A6F]' },
  { name: 'Gris doux', value: '#6B6055', bg: 'bg-[#6B6055]' },
];

const HIGHLIGHT_COLORS = [
  { name: 'Sans', value: 'transparent', bg: 'bg-transparent border border-dashed border-gray-300' },
  { name: 'Jaune miel', value: '#FEF3C7', bg: 'bg-[#FEF3C7]' },
  { name: 'Pêche doux', value: '#FFEDD5', bg: 'bg-[#FFEDD5]' },
  { name: 'Sauge pastel', value: '#DCFCE7', bg: 'bg-[#DCFCE7]' },
  { name: 'Ciel doux', value: '#E0F2FE', bg: 'bg-[#E0F2FE]' },
  { name: 'Lilac pastel', value: '#F3E8FF', bg: 'bg-[#F3E8FF]' },
];

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Décrivez vos besoins ou votre message ici...',
  minHeight = 150,
  maxHeight = 500,
  id = 'rich-text-editor',
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [height, setHeight] = useState<number>(200);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartY = useRef<number>(0);
  const dragStartHeight = useRef<number>(0);

  // Active formatting state
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isUnorderedList, setIsUnorderedList] = useState(false);
  const [isOrderedList, setIsOrderedList] = useState(false);

  // Color picker dropdown states
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [currentTextColor, setCurrentTextColor] = useState('#2D241E');
  const [currentHighlight, setCurrentHighlight] = useState('transparent');

  const [isEmpty, setIsEmpty] = useState(!value || value === '<br>' || value === '<p><br></p>');

  // Sync external value with contenteditable if different
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      if (!value) {
        editorRef.current.innerHTML = '';
        setIsEmpty(true);
      } else {
        editorRef.current.innerHTML = value;
        setIsEmpty(false);
      }
    }
  }, [value]);

  // Update command states when selection changes
  const checkCommandStates = useCallback(() => {
    try {
      setIsBold(document.queryCommandState('bold'));
      setIsItalic(document.queryCommandState('italic'));
      setIsUnderline(document.queryCommandState('underline'));
      setIsUnorderedList(document.queryCommandState('insertUnorderedList'));
      setIsOrderedList(document.queryCommandState('insertOrderedList'));
    } catch {
      // ignore
    }
  }, []);

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      const text = editorRef.current.innerText.trim();
      const empty = text.length === 0 && (!html || html === '<br>' || html === '<p><br></p>');
      setIsEmpty(empty);
      onChange(empty ? '' : html);
      checkCommandStates();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // When empty and a printable character is pressed, hide placeholder and show toolbar promptly
    if (isEmpty && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      setIsEmpty(false);
    }
  };

  const executeCommand = (command: string, arg?: string) => {
    // Keep focus in editor
    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand(command, false, arg);
    handleInput();
    checkCommandStates();
  };

  const handleClearFormatting = () => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand('removeFormat', false);
    // Also remove highlights and background if set
    document.execCommand('backColor', false, 'transparent');
    document.execCommand('hiliteColor', false, 'transparent');
    setCurrentHighlight('transparent');
    setCurrentTextColor('#2D241E');
    handleInput();
    checkCommandStates();
  };

  const handleTextColorSelect = (color: string) => {
    setCurrentTextColor(color);
    executeCommand('foreColor', color);
    setShowTextColorPicker(false);
  };

  const handleHighlightSelect = (color: string) => {
    setCurrentHighlight(color);
    if (color === 'transparent') {
      executeCommand('removeFormat');
    } else {
      executeCommand('hiliteColor', color);
    }
    setShowHighlightPicker(false);
  };

  // Resizing logic via drag handle
  const handleMouseDownResize = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartY.current = e.clientY;
    dragStartHeight.current = containerRef.current ? containerRef.current.offsetHeight : height;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = moveEvent.clientY - dragStartY.current;
      const nextHeight = Math.min(Math.max(dragStartHeight.current + deltaY, minHeight), maxHeight);
      setHeight(nextHeight);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.rte-color-menu')) {
        setShowTextColorPicker(false);
        setShowHighlightPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div
      ref={containerRef}
      id={id}
      style={{ height: `${height}px`, minHeight: `${minHeight}px`, maxHeight: `${maxHeight}px` }}
      className={`relative flex flex-col w-full rounded-2xl bg-[#FAF7F2] border transition-colors ${
        isDragging
          ? 'border-[#7A583E] ring-2 ring-[#7A583E]/20 shadow-md'
          : 'border-[#E6DDD0] focus-within:border-[#7A583E] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#7A583E]/10'
      } overflow-hidden shadow-2xs`}
    >
      {/* Pinned / Sticky Toolbar at Top - Appears promptly once typing begins */}
      <AnimatePresence initial={false}>
        {!isEmpty && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="sticky top-0 z-10 overflow-visible bg-white/95 backdrop-blur-xs border-b border-[#EAE3D8] select-none"
            onMouseDown={(e) => {
              // Prevent losing text selection when clicking anywhere on toolbar that isn't an input
              if ((e.target as HTMLElement).tagName !== 'INPUT') {
                e.preventDefault();
              }
            }}
          >
            <div className="flex flex-wrap items-center justify-between gap-1 px-3 py-2">
              {/* Left Formats */}
              <div className="flex items-center gap-0.5 flex-wrap">
                {/* Bold */}
                <button
                  type="button"
                  id={`${id}-btn-bold`}
                  title="Gras (Ctrl+B)"
                  onClick={() => executeCommand('bold')}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                    isBold
                      ? 'bg-[#2D241E] text-white shadow-2xs'
                      : 'text-[#4A3D33] hover:bg-[#F3EDE3] hover:text-[#2D241E]'
                  }`}
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>

                {/* Italic */}
                <button
                  type="button"
                  id={`${id}-btn-italic`}
                  title="Italique (Ctrl+I)"
                  onClick={() => executeCommand('italic')}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                    isItalic
                      ? 'bg-[#2D241E] text-white shadow-2xs'
                      : 'text-[#4A3D33] hover:bg-[#F3EDE3] hover:text-[#2D241E]'
                  }`}
                >
                  <Italic className="w-3.5 h-3.5" />
                </button>

                {/* Underline */}
                <button
                  type="button"
                  id={`${id}-btn-underline`}
                  title="Souligné (Ctrl+U)"
                  onClick={() => executeCommand('underline')}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                    isUnderline
                      ? 'bg-[#2D241E] text-white shadow-2xs'
                      : 'text-[#4A3D33] hover:bg-[#F3EDE3] hover:text-[#2D241E]'
                  }`}
                >
                  <Underline className="w-3.5 h-3.5" />
                </button>

                <div className="w-[1px] h-4 bg-[#E5DCD0] mx-1" />

                {/* Text Color Picker */}
                <div className="relative rte-color-menu">
                  <button
                    type="button"
                    id={`${id}-btn-text-color`}
                    title="Couleur du texte"
                    onClick={() => {
                      setShowTextColorPicker(!showTextColorPicker);
                      setShowHighlightPicker(false);
                    }}
                    className="px-1.5 h-7 rounded-lg flex items-center gap-1 text-[#4A3D33] hover:bg-[#F3EDE3] transition-all cursor-pointer"
                  >
                    <Palette className="w-3.5 h-3.5" />
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-black/20"
                      style={{ backgroundColor: currentTextColor }}
                    />
                  </button>

                  {showTextColorPicker && (
                    <div className="absolute left-0 top-full mt-1 z-30 p-2.5 rounded-xl bg-white border border-[#E8E1D5] shadow-xl w-44 space-y-2">
                      <span className="text-[10px] font-bold text-[#8A7969] uppercase tracking-wider block">
                        Couleur du texte
                      </span>
                      <div className="grid grid-cols-6 gap-1.5">
                        {TEXT_COLORS.map((col) => (
                          <button
                            key={col.value}
                            type="button"
                            title={col.name}
                            onClick={() => handleTextColorSelect(col.value)}
                            className={`w-5 h-5 rounded-md ${col.bg} flex items-center justify-center cursor-pointer transition-transform hover:scale-110 shadow-2xs`}
                          >
                            {currentTextColor === col.value && (
                              <Check className="w-3 h-3 text-white stroke-[3]" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Highlight Color Picker */}
                <div className="relative rte-color-menu">
                  <button
                    type="button"
                    id={`${id}-btn-highlight`}
                    title="Surlignage / Couleur de fond"
                    onClick={() => {
                      setShowHighlightPicker(!showHighlightPicker);
                      setShowTextColorPicker(false);
                    }}
                    className="px-1.5 h-7 rounded-lg flex items-center gap-1 text-[#4A3D33] hover:bg-[#F3EDE3] transition-all cursor-pointer"
                  >
                    <Highlighter className="w-3.5 h-3.5" />
                    <span
                      className="w-2.5 h-2.5 rounded-sm border border-black/20"
                      style={{
                        backgroundColor:
                          currentHighlight === 'transparent' ? '#F4EDE4' : currentHighlight,
                      }}
                    />
                  </button>

                  {showHighlightPicker && (
                    <div className="absolute left-0 top-full mt-1 z-30 p-2.5 rounded-xl bg-white border border-[#E8E1D5] shadow-xl w-44 space-y-2">
                      <span className="text-[10px] font-bold text-[#8A7969] uppercase tracking-wider block">
                        Surlignage
                      </span>
                      <div className="grid grid-cols-6 gap-1.5">
                        {HIGHLIGHT_COLORS.map((col) => (
                          <button
                            key={col.value}
                            type="button"
                            title={col.name}
                            onClick={() => handleHighlightSelect(col.value)}
                            className={`w-5 h-5 rounded-md ${col.bg} flex items-center justify-center cursor-pointer transition-transform hover:scale-110 shadow-2xs`}
                          >
                            {currentHighlight === col.value && (
                              <Check className="w-3 h-3 text-[#2D241E] stroke-[3]" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="w-[1px] h-4 bg-[#E5DCD0] mx-1" />

                {/* Bullet List */}
                <button
                  type="button"
                  id={`${id}-btn-bullet-list`}
                  title="Liste à puces"
                  onClick={() => executeCommand('insertUnorderedList')}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                    isUnorderedList
                      ? 'bg-[#2D241E] text-white shadow-2xs'
                      : 'text-[#4A3D33] hover:bg-[#F3EDE3] hover:text-[#2D241E]'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                </button>

                {/* Numbered List */}
                <button
                  type="button"
                  id={`${id}-btn-numbered-list`}
                  title="Liste numérotée"
                  onClick={() => executeCommand('insertOrderedList')}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                    isOrderedList
                      ? 'bg-[#2D241E] text-white shadow-2xs'
                      : 'text-[#4A3D33] hover:bg-[#F3EDE3] hover:text-[#2D241E]'
                  }`}
                >
                  <ListOrdered className="w-3.5 h-3.5" />
                </button>

                <div className="w-[1px] h-4 bg-[#E5DCD0] mx-1" />

                {/* Clear Formatting */}
                <button
                  type="button"
                  id={`${id}-btn-clear-format`}
                  title="Effacer le formatage"
                  onClick={handleClearFormatting}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[#7A583E] hover:bg-[#F3EDE3] hover:text-[#2D241E] transition-all cursor-pointer"
                >
                  <Eraser className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Height indicator */}
              <div className="hidden sm:flex items-center text-[10px] text-[#A6998C] font-mono select-none pr-1">
                {Math.round(height)}px
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editable Content Area */}
      <div className="relative flex-1 overflow-y-auto px-4 py-3 bg-transparent">
        <AnimatePresence>
          {isEmpty && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              className="absolute left-4 top-3 text-xs sm:text-sm text-[#9E8E7E] pointer-events-none select-none font-normal leading-relaxed"
            >
              {placeholder}
            </motion.div>
          )}
        </AnimatePresence>

        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onKeyUp={checkCommandStates}
          onMouseUp={checkCommandStates}
          onFocus={checkCommandStates}
          className="rich-text-content w-full h-full min-h-[100px] outline-hidden text-xs sm:text-sm text-[#2D241E] leading-relaxed break-words font-normal"
        />
      </div>

      {/* Resize Handle / Grip in Bottom-Right Corner */}
      <div
        id={`${id}-resize-handle`}
        title="Glisser pour redimensionner (150px - 500px)"
        onMouseDown={handleMouseDownResize}
        className="absolute bottom-1 right-1 z-20 w-5 h-5 flex items-end justify-end p-0.5 cursor-ns-resize select-none group"
      >
        <svg
          className={`w-3.5 h-3.5 transition-colors ${
            isDragging ? 'text-[#7A583E]' : 'text-[#B8AA9A] group-hover:text-[#7A583E]'
          }`}
          viewBox="0 0 16 16"
          fill="currentColor"
        >
          <path d="M14 14H12V12H14V14Z" />
          <path d="M14 10H12V8H14V10Z" />
          <path d="M10 14H8V12H10V14Z" />
          <path d="M14 6H12V4H14V6Z" />
          <path d="M10 10H8V8H10V10Z" />
          <path d="M6 14H4V12H6V14Z" />
        </svg>
      </div>
    </div>
  );
};
