// ===================================
// Voice Input Module - Web Speech API
// ===================================

const Voice = {
    recognition: null,
    isListening: false,
    isSupported: false,

    // Initialize speech recognition
    init() {
        // Check for browser support
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            console.warn('Speech recognition not supported in this browser');
            this.isSupported = false;
            return false;
        }

        this.isSupported = true;
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';

        return true;
    },

    // Start listening
    start(onResult, onEnd) {
        if (!this.isSupported || !this.recognition) {
            alert('Voice input is not supported in your browser. Please use Chrome or Edge.');
            return false;
        }

        if (this.isListening) {
            this.stop();
            return false;
        }

        this.recognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript + ' ';
                } else {
                    interimTranscript += transcript;
                }
            }

            if (onResult) {
                onResult(finalTranscript, interimTranscript);
            }
        };

        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.isListening = false;
            if (onEnd) onEnd();
        };

        this.recognition.onend = () => {
            this.isListening = false;
            if (onEnd) onEnd();
        };

        try {
            this.recognition.start();
            this.isListening = true;
            return true;
        } catch (error) {
            console.error('Error starting speech recognition:', error);
            return false;
        }
    },

    // Stop listening
    stop() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
            this.isListening = false;
        }
    },

    // Toggle listening
    toggle(onResult, onEnd) {
        if (this.isListening) {
            this.stop();
            return false;
        } else {
            return this.start(onResult, onEnd);
        }
    }
};

// Initialize on load
Voice.init();
