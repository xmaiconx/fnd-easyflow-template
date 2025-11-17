/**
 * Media Object Types for Message Protocol
 *
 * Supports both URL and base64 encoding for media files
 * Uses discriminated unions for type safety
 */

/**
 * Base media properties common to all media types
 */
interface BaseMediaObject {
  /** MIME type of the media (e.g., 'audio/mp3', 'video/mp4', 'image/jpeg') */
  mimeType: string;
}

/**
 * Media source discriminated union
 * Either URL or base64, never both
 */
export type MediaSource =
  | {
      source: 'url';
      url: string;
      base64?: never;
    }
  | {
      source: 'base64';
      base64: string;
      url?: never;
    };

/**
 * Generic media object combining source and base properties
 */
export type MediaObject = MediaSource & BaseMediaObject;

/**
 * Audio-specific media object
 */
export type AudioMediaObject = MediaObject & {
  /** Duration in seconds */
  duration?: number;
  /** Audio transcription (optional) */
  transcript?: string;
};

/**
 * Video-specific media object
 */
export type VideoMediaObject = MediaObject & {
  /** Duration in seconds */
  duration?: number;
  /** Video transcription/caption (optional) */
  transcript?: string;
  /** Video caption */
  caption?: string;
  /** Thumbnail image */
  thumbnail?: MediaObject;
};

/**
 * Image-specific media object
 */
export type ImageMediaObject = MediaObject & {
  /** Image caption */
  caption?: string;
  /** Image width in pixels */
  width?: number;
  /** Image height in pixels */
  height?: number;
};

/**
 * Document-specific media object
 */
export type DocumentMediaObject = MediaObject & {
  /** Original file name */
  fileName: string;
  /** File size in bytes */
  fileSize?: number;
  /** Document caption */
  caption?: string;
};

/**
 * Sticker-specific media object
 */
export type StickerMediaObject = MediaObject & {
  /** Animated sticker flag */
  animated?: boolean;
};
