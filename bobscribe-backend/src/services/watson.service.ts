import SpeechToTextV1 from 'ibm-watson/speech-to-text/v1.js';
import { IamAuthenticator } from 'ibm-watson/auth/index.js';
import { env } from '../config/env.js';

/**
 * Watson Speech-to-Text Service
 * Handles audio transcription using IBM Watson STT
 */
class WatsonSTTService {
  private client: SpeechToTextV1;

  constructor() {
    this.client = new SpeechToTextV1({
      authenticator: new IamAuthenticator({
        apikey: env.WATSON_STT_APIKEY,
      }),
      serviceUrl: env.WATSON_STT_URL,
    });
  }

  /**
   * Transcribe audio buffer to text
   * @param audioBuffer - Audio file buffer
   * @param contentType - MIME type of the audio (e.g., 'audio/wav', 'audio/mp3')
   * @returns Transcribed text
   */
  async transcribeAudio(
    audioBuffer: Buffer,
    contentType: string = 'audio/wav'
  ): Promise<string> {
    try {
      const params = {
        audio: audioBuffer,
        contentType,
        model: 'en-US_BroadbandModel',
        timestamps: false,
        wordAlternativesThreshold: 0.9,
        keywords: ['engineering', 'implement', 'feature', 'bug', 'fix', 'refactor'],
        keywordsThreshold: 0.5,
      };

      const response = await this.client.recognize(params);
      
      if (!response.result.results || response.result.results.length === 0) {
        throw new Error('No transcription results returned from Watson STT');
      }

      // Concatenate all transcript alternatives
      const transcript = response.result.results
        .map((result) => {
          if (result.alternatives && result.alternatives.length > 0) {
            return result.alternatives[0].transcript;
          }
          return '';
        })
        .join(' ')
        .trim();

      if (!transcript) {
        throw new Error('Empty transcription result');
      }

      return transcript;
    } catch (error) {
      console.error('Watson STT Error:', error);
      throw new Error(
        `Failed to transcribe audio: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Check if the Watson STT service is available
   * @returns true if service is reachable
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.client.listModels();
      return true;
    } catch (error) {
      console.error('Watson STT health check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const watsonSTTService = new WatsonSTTService();

// Made with Bob
