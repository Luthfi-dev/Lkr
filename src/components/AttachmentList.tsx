import React from 'react';
import { 
  FileText, 
  Image as ImageIcon, 
  FileSpreadsheet, 
  FileCode, 
  Paperclip, 
  Download, 
  X, 
  ExternalLink,
  Presentation
} from 'lucide-react';
import { PostAttachment } from '../types';

interface AttachmentListProps {
  attachments: PostAttachment[];
  onRemove?: (id: string) => void;
  isReadOnly?: boolean;
}

export const AttachmentList: React.FC<AttachmentListProps> = ({
  attachments,
  onRemove,
  isReadOnly = false,
}) => {
  if (!attachments || attachments.length === 0) return null;

  const getIcon = (type: PostAttachment['type']) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-4 h-4 text-rose-500" />;
      case 'image':
        return <ImageIcon className="w-4 h-4 text-sky-500" />;
      case 'sheet':
        return <FileSpreadsheet className="w-4 h-4 text-emerald-500" />;
      case 'slide':
        return <Presentation className="w-4 h-4 text-amber-500" />;
      default:
        return <FileCode className="w-4 h-4 text-indigo-500" />;
    }
  };

  const handleDownload = (attachment: PostAttachment, e: React.MouseEvent) => {
    e.stopPropagation();
    // Simulate direct download or open
    const link = document.createElement('a');
    link.href = attachment.url || '#';
    link.target = '_blank';
    link.download = attachment.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-wrap gap-2 my-2">
      {attachments.map((att) => (
        <div
          key={att.id}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/80 text-slate-800 transition-all text-xs group"
        >
          <div className="p-1 rounded-lg bg-white shadow-2xs">
            {getIcon(att.type)}
          </div>

          <div className="space-y-0.2">
            <span className="font-semibold text-slate-900 block max-w-[160px] truncate text-[11px]">
              {att.name}
            </span>
            <span className="text-[9px] text-slate-400 font-medium">
              {att.size} • {att.type.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-1 ml-1">
            <button
              type="button"
              onClick={(e) => handleDownload(att, e)}
              title="Unduh Lampiran"
              className="p-1 rounded-md text-slate-400 hover:text-teal-700 hover:bg-white transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
            </button>

            {!isReadOnly && onRemove && (
              <button
                type="button"
                onClick={() => onRemove(att.id)}
                title="Hapus Lampiran"
                className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
