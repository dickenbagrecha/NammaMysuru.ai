/**
 * React hook for handling SSE voice streaming responses.
 * Converts audio blob to base64 and sends as JSON to match server expectations.
 */
import { useCallback } from "react";
import { getApiUrl } from "@/lib/api";

interface StreamCallbacks {
  onUserTranscript?: (text: string) => void;
  onTranscript?: (text: string, full: string) => void;
  onComplete?: (transcript: string) => void;
  onError?: (error: Error) => void;
}

export function useVoiceStream(callbacks: StreamCallbacks = {}) {
  const streamVoiceResponse = useCallback(
    async (url: string, audioBlob: Blob) => {
      // Convert blob to base64 for JSON body (server expects express.json())
      const base64Audio = await new Promise<string>((resolve) => {
        const fileReader = new FileReader();
        fileReader.onload = () => {
          const result = fileReader.result as string;
          resolve(result.split(",")[1]); // Remove data URL prefix
        };
        fileReader.readAsDataURL(audioBlob);
      });

      const targetUrl = url.startsWith("http://") || url.startsWith("https://") ? url : getApiUrl(url);
      const response = await fetch(targetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audio: base64Audio }),
      });
      if (!response.ok) throw new Error("Voice request failed");

      const streamReader = response.body?.getReader();
      if (!streamReader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let buffer = "";
      let fullTranscript = "";

      // Setup SpeechSynthesis
      const synth = window.speechSynthesis;
      let utteranceBuffer = "";

      const speak = (text: string) => {
        if (!text.trim()) return;
        const utterance = new SpeechSynthesisUtterance(text);
        // Attempt to select a good voice
        const voices = synth.getVoices();
        const preferredVoice = voices.find(v => v.name.includes("Google US English") || v.name.includes("Microsoft Zira"));
        if (preferredVoice) utterance.voice = preferredVoice;
        synth.speak(utterance);
      };

      while (true) {
        const { done, value } = await streamReader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;

          try {
            const event = JSON.parse(line.slice(6));

            switch (event.type) {
              case "user_transcript":
                callbacks.onUserTranscript?.(event.data);
                break;
              case "transcript":
                fullTranscript += event.data;
                callbacks.onTranscript?.(event.data, fullTranscript);

                // Simple TTS strategy: Speak by sentence or large chunks
                // Since Gemini streams fast, we can try to speak larger chunks
                utteranceBuffer += event.data;
                if (utteranceBuffer.includes(".") || utteranceBuffer.includes("?") || utteranceBuffer.includes("!")) {
                  speak(utteranceBuffer);
                  utteranceBuffer = "";
                }
                break;
              case "audio":
                // playback.pushAudio(event.data); // No audio from Gemini
                break;
              case "done":
                // signal complete
                if (utteranceBuffer) speak(utteranceBuffer); // Speak remaining
                callbacks.onComplete?.(fullTranscript);
                break;
              case "error":
                throw new Error(event.error);
            }
          } catch (e) {
            if (!(e instanceof SyntaxError)) {
              callbacks.onError?.(e as Error);
            }
          }
        }
      }
    },
    [callbacks]
  );

  return { streamVoiceResponse, playbackState: "idle" as const }; // Mock state
}
