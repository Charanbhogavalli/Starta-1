
// Note: Since this is a client-side demo and ElevenLabs requires an API key we don't have in process.env,
// we will use Web Speech API as a robust fallback to ensure stability and cross-browser support.

const AUDIO_MUTE_KEY = 'starta_audio_muted';
let currentUtterance: SpeechSynthesisUtterance | null = null;

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

export const speakText = (text: string, onEnd?: () => void) => {
  if (isAudioMuted()) {
    onEnd?.();
    return;
  }

  if ('speechSynthesis' in window) {
    // Cancel any ongoing speech before starting new one
    window.speechSynthesis.cancel();
    
    currentUtterance = new SpeechSynthesisUtterance(text);
    currentUtterance.rate = 1.0;
    currentUtterance.pitch = 1.0;
    
    // We bind the onend and onerror to the provided callback to reset UI state
    currentUtterance.onend = () => {
      currentUtterance = null;
      onEnd?.();
    };
    
    currentUtterance.onerror = (event) => {
      console.error("Speech Synthesis Error:", event);
      currentUtterance = null;
      onEnd?.();
    };
    
    window.speechSynthesis.speak(currentUtterance);
  } else {
    onEnd?.();
  }
};
