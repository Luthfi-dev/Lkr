import React from 'react';
import { AtSign } from 'lucide-react';

interface MentionTextProps {
  content: string;
  className?: string;
  onMentionClick?: (name: string) => void;
}

export const MentionText: React.FC<MentionTextProps> = ({
  content,
  className = '',
  onMentionClick,
}) => {
  if (!content) return null;

  // Split content by @mentions: @[A-Za-z0-9_.\s]{2,25}(?=\s|[.,!?]|$) or simply @\w+
  // We match pattern like @Budi Pratama or @Agnes Nielsen or @username
  const regex = /(@[A-Za-z0-9_]+(?:\s+[A-Za-z0-9_]+)?)/g;
  const parts = content.split(regex);

  return (
    <span className={`inline leading-relaxed break-words whitespace-pre-line ${className}`}>
      {parts.map((part, index) => {
        if (part && part.startsWith('@') && part.length > 1) {
          const cleanName = part.substring(1).trim();
          return (
            <button
              key={index}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onMentionClick) onMentionClick(cleanName);
              }}
              title={`Ditandai: ${cleanName}`}
              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 mx-0.5 rounded-md bg-teal-50 text-teal-800 font-bold text-[11px] border border-teal-200/80 hover:bg-teal-100 transition-colors align-baseline cursor-pointer"
            >
              <AtSign className="w-2.5 h-2.5 text-teal-600 inline" />
              <span>{cleanName}</span>
            </button>
          );
        }
        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </span>
  );
};
