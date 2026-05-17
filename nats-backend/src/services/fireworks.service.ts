import { env } from '../config/env.js';
import FormData from 'form-data';
import fetch from 'node-fetch';

/**
 * Fireworks AI Speech-to-Text Service
 * Handles audio transcription using Fireworks AI STT
 */
class FireworksSTTService {
  private apiKey: string;
  private apiUrl: string;

  constructor() {
    this.apiKey = env.FIREWORKS_API_KEY;
    this.apiUrl = 'https://audio-prod.us-virginia-1.direct.fireworks.ai/v1/audio/transcriptions';
  }

  /**
   * Transcribe audio buffer to text
   * @param audioBuffer - Audio file buffer
   * @param contentType - MIME type of the audio (e.g., 'audio/wav', 'audio/mp3', 'audio/mpeg')
   * @param filename - Original filename (optional, helps with format detection)
   * @returns Transcribed text
   */
  async transcribeAudio(
    audioBuffer: Buffer,
    contentType: string = 'audio/wav',
    filename: string = 'audio.wav'
  ): Promise<string> {
    try {
      // Create form data for multipart upload
      const formData = new FormData();
      
      // Determine file extension from content type or filename
      let fileExtension = 'wav';
      if (contentType.includes('mp3') || contentType.includes('mpeg')) {
        fileExtension = 'mp3';
      } else if (contentType.includes('wav')) {
        fileExtension = 'wav';
      } else if (contentType.includes('ogg')) {
        fileExtension = 'ogg';
      } else if (contentType.includes('webm')) {
        fileExtension = 'webm';
      } else if (contentType.includes('m4a')) {
        fileExtension = 'm4a';
      } else if (filename) {
        const match = filename.match(/\.([^.]+)$/);
        if (match) {
          fileExtension = match[1];
        }
      }

      // Append audio file to form data
      formData.append('file', audioBuffer, {
        filename: `audio.${fileExtension}`,
        contentType: contentType,
      });

      // Use whisper-v3 model (fast and accurate)
      formData.append('model', 'whisper-v3');
      
      // Optional: Add language hint for better accuracy
      formData.append('language', 'en');
      
      // Optional: Add response format
      formData.append('response_format', 'json');

      // Make API request to Fireworks AI
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          ...formData.getHeaders(),
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Fireworks AI API error (${response.status}): ${errorText}`
        );
      }

      const result = await response.json() as { text?: string; error?: string };

      if (result.error) {
        throw new Error(`Fireworks AI transcription error: ${result.error}`);
      }

      if (!result.text || result.text.trim().length === 0) {
        throw new Error('Empty transcription result from Fireworks AI');
      }

      return result.text.trim();
    } catch (error) {
      console.error('Fireworks AI STT Error:', error);
      throw new Error(
        `Failed to transcribe audio: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Check if the Fireworks AI STT service is available
   * @returns true if service is reachable
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Test with a minimal request to check API availability
      const response = await fetch('https://api.fireworks.ai/inference/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Fireworks AI STT health check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const fireworksSTTService = new FireworksSTTService();

// Made with Bob