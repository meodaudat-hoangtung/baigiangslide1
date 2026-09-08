import React from 'react';
import { SlideContentBlock } from '../types';
import { parseMediaUrl } from '../utils/mediaUtils';
import { MathView } from './MathView';
import { Video, Music, ExternalLink, AlertCircle, PlayCircle } from 'lucide-react';

interface MediaBlockRendererProps {
  block: SlideContentBlock;
  interactive?: boolean;
}

export const MediaBlockRenderer: React.FC<MediaBlockRendererProps> = ({
  block,
  interactive = true,
}) => {
  const parsed = parseMediaUrl(block.mediaUrl);
  const position = block.mediaPosition || 'center';
  const widthPercent = block.mediaWidthPercent || 75;

  const posClass =
    position === 'left'
      ? 'justify-start'
      : position === 'right'
      ? 'justify-end'
      : position === 'full'
      ? 'justify-center w-full'
      : 'justify-center';

  const containerStyle = {
    width: position === 'full' ? '100%' : `${widthPercent}%`,
    maxWidth: '100%',
  };

  return (
    <div className={`flex ${posClass} w-full my-3.5`}>
      <div
        className="group relative rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-950/90 p-2 sm:p-3 shadow-xl transition-all"
        style={containerStyle}
      >
        {/* Title of media block if present */}
        {block.title && block.title !== 'Video / Âm thanh bài giảng' && (
          <div className="mb-2 text-xs sm:text-sm font-bold text-rose-300 flex items-center gap-1.5">
            {parsed.isAudio ? (
              <Music className="w-4 h-4 text-rose-400" />
            ) : (
              <Video className="w-4 h-4 text-rose-400" />
            )}
            <MathView content={block.title} inline />
          </div>
        )}

        {/* Media Player Area */}
        {!block.mediaUrl ? (
          <div className="p-8 rounded-xl bg-slate-900 border border-dashed border-slate-800 text-center space-y-2">
            <div className="w-10 h-10 mx-auto rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <PlayCircle className="w-6 h-6" />
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Chưa có nội dung Video/Audio. Hãy dán link YouTube, Google Drive hoặc tải tệp video/âm thanh.
            </p>
          </div>
        ) : parsed.type === 'youtube' || parsed.type === 'drive' || parsed.type === 'vimeo' ? (
          <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black shadow-inner">
            <iframe
              src={parsed.embedUrl}
              title={block.mediaCaption || 'Media Video Player'}
              className="absolute inset-0 w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        ) : parsed.isAudio ? (
          <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 via-rose-950/30 to-slate-900 border border-rose-500/30 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-600/30 border border-rose-500/50 flex items-center justify-center text-rose-300">
                <Music className="w-5 h-5 animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold text-white block truncate">
                  {block.mediaCaption || 'Bản ghi âm bài giảng / Thuyết minh âm thanh'}
                </span>
                <span className="text-[11px] text-rose-300/80">Audio Player</span>
              </div>
            </div>
            <audio
              controls
              className="w-full h-10 rounded-lg accent-rose-500"
              src={parsed.embedUrl}
              autoPlay={block.mediaAutoplay}
              loop={block.mediaLoop}
            >
              Trình duyệt của bạn không hỗ trợ phát thẻ âm thanh audio HTML5.
            </audio>
          </div>
        ) : parsed.type === 'direct_video' ? (
          <div className="relative w-full rounded-xl overflow-hidden bg-black shadow-inner">
            <video
              controls
              className="w-full max-h-[480px] object-contain rounded-xl"
              src={parsed.embedUrl}
              autoPlay={block.mediaAutoplay}
              loop={block.mediaLoop}
            >
              Trình duyệt của bạn không hỗ trợ phát thẻ video HTML5.
            </video>
          </div>
        ) : (
          /* Generic Web Link fallback */
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 text-center">
            <div className="flex items-center justify-center gap-2 text-xs text-slate-300">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span>Đường link truyền thông: {block.mediaUrl}</span>
            </div>
            <a
              href={block.mediaUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Mở liên kết trong tab mới</span>
            </a>
          </div>
        )}

        {/* Media Caption (Supports LaTeX Math $...$) */}
        {block.mediaCaption && (
          <div className="mt-2.5 text-center text-xs sm:text-sm text-slate-300 font-medium px-2 py-1">
            <MathView content={block.mediaCaption} inline />
          </div>
        )}
      </div>
    </div>
  );
};
