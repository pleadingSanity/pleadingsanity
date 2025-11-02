// Cosmic Audio System - Immersive Background Soundscape
class CosmicAudio {
    constructor() {
        this.isEnabled = localStorage.getItem('cosmicAudioEnabled') === 'true';
        this.audioContext = null;
        this.oscillator = null;
        this.gainNode = null;
        this.analyser = null;
        this.isPlaying = false;
        this.frequencyData = null;
        
        this.init();
    }

    async init() {
        try {
            // Create audio toggle button
            this.createToggleButton();
            
            // Initialize Web Audio API
            if (this.isEnabled) {
                await this.initAudio();
            }
        } catch (error) {
            console.log('Cosmic audio initialization skipped:', error.message);
        }
    }

    createToggleButton() {
        const existingButton = document.getElementById('audioToggle');
        if (existingButton) {
            existingButton.remove();
        }

        const button = document.createElement('button');
        button.id = 'audioToggle';
        button.className = 'btn cosmic-audio-toggle';
        button.innerHTML = this.isEnabled ? '🌌 Cosmic Audio On' : '🌌 Enable Cosmic Audio';
        
        // Clean positioning styles
        button.style.cssText = `
            position: fixed;
            left: 12px;
            bottom: 12px;
            z-index: 1000;
            font-size: 0.9rem;
            padding: 10px 16px;
            border-radius: 25px;
            background: linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%);
            border: 2px solid rgba(0, 255, 240, 0.3);
            color: white;
            cursor: pointer;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
            box-shadow: 0 4px 15px rgba(124, 58, 237, 0.4);
        `;

        button.addEventListener('click', () => this.toggleAudio());
        button.addEventListener('mouseenter', () => {
            button.style.transform = 'translateY(-2px) scale(1.05)';
            button.style.boxShadow = '0 8px 25px rgba(124, 58, 237, 0.6)';
        });
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'translateY(0) scale(1)';
            button.style.boxShadow = '0 4px 15px rgba(124, 58, 237, 0.4)';
        });

        document.body.appendChild(button);
        this.button = button;
    }

    async initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Create oscillator for cosmic ambience
            this.oscillator = this.audioContext.createOscillator();
            this.gainNode = this.audioContext.createGain();
            this.analyser = this.audioContext.createAnalyser();
            
            // Configure oscillator for deep space ambience
            this.oscillator.type = 'sine';
            this.oscillator.frequency.setValueAtTime(40, this.audioContext.currentTime); // Deep cosmic hum
            
            // Configure gain (volume)
            this.gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            
            // Configure analyser
            this.analyser.fftSize = 256;
            this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
            
            // Connect audio nodes
            this.oscillator.connect(this.gainNode);
            this.gainNode.connect(this.analyser);
            this.analyser.connect(this.audioContext.destination);
            
            // Start the cosmic sound
            this.oscillator.start();
            this.isPlaying = true;
            
            // Add frequency modulation for cosmic effect
            this.modulateFrequency();
            
            console.log('🌌 Cosmic audio activated');
        } catch (error) {
            console.log('Audio context creation failed:', error.message);
        }
    }

    modulateFrequency() {
        if (!this.isPlaying || !this.oscillator) return;
        
        // Create slow, ethereal frequency changes
        const time = this.audioContext.currentTime;
        const baseFreq = 40;
        const modulation = Math.sin(time * 0.1) * 10; // Slow modulation
        
        this.oscillator.frequency.setValueAtTime(baseFreq + modulation, time);
        
        // Continue modulation
        requestAnimationFrame(() => this.modulateFrequency());
    }

    async toggleAudio() {
        try {
            if (this.isEnabled) {
                await this.disableAudio();
            } else {
                await this.enableAudio();
            }
        } catch (error) {
            console.log('Audio toggle error:', error.message);
        }
    }

    async enableAudio() {
        this.isEnabled = true;
        localStorage.setItem('cosmicAudioEnabled', 'true');
        
        if (!this.audioContext) {
            await this.initAudio();
        } else if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
            this.isPlaying = true;
        }
        
        this.button.innerHTML = '🌌 Cosmic Audio On';
        this.button.style.background = 'linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)';
        
        // Visual feedback
        this.addVisualEffects();
    }

    async disableAudio() {
        this.isEnabled = false;
        localStorage.setItem('cosmicAudioEnabled', 'false');
        
        if (this.audioContext && this.audioContext.state === 'running') {
            await this.audioContext.suspend();
            this.isPlaying = false;
        }
        
        this.button.innerHTML = '🌌 Enable Cosmic Audio';
        this.button.style.background = 'linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)';
        
        this.removeVisualEffects();
    }

    addVisualEffects() {
        // Add subtle pulsing effect to elements when audio is on
        const style = document.createElement('style');
        style.id = 'cosmic-audio-effects';
        style.textContent = `
            .cosmic-audio-active {
                animation: cosmic-pulse 4s ease-in-out infinite;
            }
            
            @keyframes cosmic-pulse {
                0%, 100% { 
                    box-shadow: 0 0 20px rgba(0, 255, 240, 0.3);
                }
                50% { 
                    box-shadow: 0 0 40px rgba(0, 255, 240, 0.6);
                }
            }
            
            .cosmic-audio-toggle {
                animation: cosmic-glow 3s ease-in-out infinite;
            }
            
            @keyframes cosmic-glow {
                0%, 100% { 
                    border-color: rgba(0, 255, 240, 0.3);
                }
                50% { 
                    border-color: rgba(0, 255, 240, 0.8);
                }
            }
        `;
        document.head.appendChild(style);
        
        // Add class to key elements
        const elements = document.querySelectorAll('header, .btn, .card');
        elements.forEach(el => el.classList.add('cosmic-audio-active'));
    }

    removeVisualEffects() {
        const style = document.getElementById('cosmic-audio-effects');
        if (style) style.remove();
        
        const elements = document.querySelectorAll('.cosmic-audio-active');
        elements.forEach(el => el.classList.remove('cosmic-audio-active'));
    }

    // Get audio data for visualizations
    getFrequencyData() {
        if (this.analyser && this.frequencyData) {
            this.analyser.getByteFrequencyData(this.frequencyData);
            return this.frequencyData;
        }
        return null;
    }
}

// Initialize cosmic audio when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.cosmicAudio = new CosmicAudio();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CosmicAudio;
}