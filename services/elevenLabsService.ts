
// Note: Since this is a client-side demo and ElevenLabs requires an API key we don't have in process.env,
// we will simulate the flow for the demo or use Web Speech API as a fallback to ensure stability.

const AUDIO_MUTE_KEY = 'starta_audio_muted';

export const isAudioMuted = (): boolean => {
  return localStorage.getItem(AUDIO_MUTE_KEY) === 'true';
};

export const setAudioMuted = (muted: boolean): void => {
  localStorage.setItem(AUDIO_MUTE_KEY, String(muted));
  if (muted && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};

export const generateVoicePitch = async (text: string): Promise<string> => {
  // Simulation: We'll use a public placeholder or return a successful signal
  console.log("Generating ElevenLabs Voice for:", text);
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("MOCK_AUDIO_READY");
    }, 1500);
  });
};

export const stopSpeaking = () => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};

export const speakText = (text: string) => {
  if (isAudioMuted()) return;

  if ('speechSynthesis' in window) {
    // Cancel any ongoing speech before starting new one
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  }
};
