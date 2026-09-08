export interface ParsedMedia {
  type: 'youtube' | 'drive' | 'vimeo' | 'direct_video' | 'direct_audio' | 'unknown';
  embedUrl: string;
  isEmbeddable: boolean;
  isVideo: boolean;
  isAudio: boolean;
}

/**
 * Parses any video/audio/YouTube/Drive/Vimeo URL or Data URI into playable embed structures.
 */
export function parseMediaUrl(url: string | undefined | null): ParsedMedia {
  if (!url || !url.trim()) {
    return {
      type: 'unknown',
      embedUrl: '',
      isEmbeddable: false,
      isVideo: false,
      isAudio: false
    };
  }

  const clean = url.trim();

  // 1. YouTube (Supports youtube.com/watch?v=, youtu.be/, youtube.com/shorts/, youtube.com/embed/)
  const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const ytMatch = clean.match(ytRegex);
  if (ytMatch && ytMatch[1]) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?rel=0&modestbranding=1&enablejsapi=1`,
      isEmbeddable: true,
      isVideo: true,
      isAudio: false
    };
  }

  // 2. Google Drive video preview (drive.google.com/file/d/ID/...)
  const driveRegex = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i;
  const driveMatch = clean.match(driveRegex);
  if (driveMatch && driveMatch[1]) {
    return {
      type: 'drive',
      embedUrl: `https://drive.google.com/file/d/${driveMatch[1]}/preview`,
      isEmbeddable: true,
      isVideo: true,
      isAudio: false
    };
  }

  // 3. Vimeo (vimeo.com/ID)
  const vimeoRegex = /vimeo\.com\/(?:video\/)?([0-9]+)/i;
  const vimeoMatch = clean.match(vimeoRegex);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      type: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
      isEmbeddable: true,
      isVideo: true,
      isAudio: false
    };
  }

  // 4. Audio files (mp3, wav, ogg, m4a, aac, webm audio or base64 data:audio/)
  if (
    /\.(mp3|wav|ogg|m4a|aac)(\?.*)?$/i.test(clean) ||
    clean.startsWith('data:audio/')
  ) {
    return {
      type: 'direct_audio',
      embedUrl: clean,
      isEmbeddable: true,
      isVideo: false,
      isAudio: true
    };
  }

  // 5. Video files (mp4, webm, ogv, mov or base64 data:video/)
  if (
    /\.(mp4|webm|ogv|mov|m4v)(\?.*)?$/i.test(clean) ||
    clean.startsWith('data:video/')
  ) {
    return {
      type: 'direct_video',
      embedUrl: clean,
      isEmbeddable: true,
      isVideo: true,
      isAudio: false
    };
  }

  // Fallback: If it's a URL, treat as generic web embed
  if (/^https?:\/\//i.test(clean)) {
    return {
      type: 'unknown',
      embedUrl: clean,
      isEmbeddable: true,
      isVideo: true,
      isAudio: false
    };
  }

  return {
    type: 'unknown',
    embedUrl: clean,
    isEmbeddable: false,
    isVideo: false,
    isAudio: false
  };
}
