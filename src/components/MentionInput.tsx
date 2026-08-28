import React, { useState, useRef, useEffect } from 'react';
import { AtSign, Paperclip, Smile } from 'lucide-react';
import { CircleMember } from '../types';

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  members?: CircleMember[];
  circleMembers?: CircleMember[];
  isTextarea?: boolean;
  rows?: number;
  className?: string;
  onAttachFileClick?: () => void;
  showToolbar?: boolean;
  autoFocus?: boolean;
}

export const MentionInput: React.FC<MentionInputProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder = 'Tulis pesan... Gunakan @ untuk menandai rekan',
  members,
  circleMembers,
  isTextarea = false,
  rows = 2,
  className = '',
  onAttachFileClick,
  showToolbar = false,
  autoFocus = false,
}) => {
  const effectiveMembers = members || circleMembers || [];
  const [showMentionMenu, setShowMentionMenu] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [cursorPos, setCursorPos] = useState(0);

  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement | null>(null);

  // Filter members based on query after @
  const filteredMembers = effectiveMembers.filter((m) =>
    m.name.toLowerCase().includes(mentionQuery.toLowerCase())
  );

  const checkMentionTrigger = (text: string, selectionStart: number) => {
    const textBeforeCursor = text.slice(0, selectionStart);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex !== -1) {
      // Check if there is space between @ and cursor or if it's a valid query
      const query = textBeforeCursor.slice(lastAtIndex + 1);
      if (!query.includes('\n') && query.length < 20) {
        setMentionQuery(query);
        setShowMentionMenu(true);
        setSelectedIndex(0);
        return;
      }
    }
    setShowMentionMenu(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const val = e.target.value;
    const start = e.target.selectionStart || 0;
    setCursorPos(start);
    onChange(val);
    checkMentionTrigger(val, start);
  };

  const insertMention = (member: CircleMember) => {
    if (!inputRef.current) return;
    const textBeforeCursor = value.slice(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex !== -1) {
      const before = value.slice(0, lastAtIndex);
      const after = value.slice(cursorPos);
      const mentionText = `@${member.name} `;
      const newValue = before + mentionText + after;
      onChange(newValue);
      setShowMentionMenu(false);

      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          const newPos = before.length + mentionText.length;
          inputRef.current.setSelectionRange(newPos, newPos);
        }
      }, 20);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    if (showMentionMenu && filteredMembers.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredMembers.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredMembers.length) % filteredMembers.length);
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        insertMention(filteredMembers[selectedIndex]);
        return;
      }
      if (e.key === 'Escape') {
        setShowMentionMenu(false);
        return;
      }
    }

    if (e.key === 'Enter' && !e.shiftKey && !showMentionMenu) {
      if (onSubmit) {
        e.preventDefault();
        onSubmit();
      }
    }
  };

  const handleTriggerMentionManually = () => {
    const newText = value + '@';
    onChange(newText);
    setShowMentionMenu(true);
    setMentionQuery('');
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.setSelectionRange(newText.length, newText.length);
      }
    }, 20);
  };

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  return (
    <div className="relative w-full">
      {/* Mention Dropdown Menu */}
      {showMentionMenu && filteredMembers.length > 0 && (
        <div className="absolute bottom-full left-0 mb-1.5 w-64 max-h-48 overflow-y-auto bg-white rounded-2xl shadow-xl border border-slate-200 z-50 p-1 animate-in fade-in slide-in-from-bottom-2 duration-100">
          <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <AtSign className="w-3 h-3 text-teal-600" />
            Tandai Anggota Tim
          </div>
          {filteredMembers.map((member, idx) => (
            <button
              key={member.id}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                insertMention(member);
              }}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-left text-xs transition-colors ${
                idx === selectedIndex
                  ? 'bg-teal-50 text-teal-900 font-semibold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <img
                src={member.avatar}
                alt={member.name}
                referrerPolicy="no-referrer"
                className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-200"
              />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold truncate">{member.name}</div>
                <div className="text-[10px] text-slate-400 truncate">{member.role}</div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Input or Textarea */}
      {isTextarea ? (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onClick={(e) => {
            const target = e.target as HTMLTextAreaElement;
            setCursorPos(target.selectionStart || 0);
          }}
          placeholder={placeholder}
          rows={rows}
          className={`w-full bg-white border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 leading-relaxed font-sans ${className}`}
        />
      ) : (
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onClick={(e) => {
            const target = e.target as HTMLInputElement;
            setCursorPos(target.selectionStart || 0);
          }}
          placeholder={placeholder}
          className={`w-full bg-white border border-slate-200 rounded-full px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 ${className}`}
        />
      )}

      {/* Optional Toolbar */}
      {showToolbar && (
        <div className="flex items-center justify-between mt-1 px-1">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleTriggerMentionManually}
              title="Tandai anggota (@mention)"
              className="p-1 rounded-lg text-slate-400 hover:text-teal-700 hover:bg-teal-50 transition-colors text-[11px] font-bold flex items-center gap-0.5"
            >
              <AtSign className="w-3.5 h-3.5" />
              <span className="text-[10px]">Tandai</span>
            </button>

            {onAttachFileClick && (
              <button
                type="button"
                onClick={onAttachFileClick}
                title="Lampirkan berkas"
                className="p-1 rounded-lg text-slate-400 hover:text-teal-700 hover:bg-teal-50 transition-colors text-[11px] font-bold flex items-center gap-0.5"
              >
                <Paperclip className="w-3.5 h-3.5" />
                <span className="text-[10px]">Lampirkan</span>
              </button>
            )}
          </div>

          <span className="text-[10px] text-slate-400">
            Ketik <span className="font-mono text-teal-700 font-bold">@</span> untuk menandai
          </span>
        </div>
      )}
    </div>
  );
};
