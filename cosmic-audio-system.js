// ==============================================================
// PLEADING SANITY — COSMIC AUDIO SYSTEM v2.0 FINAL
// Immersive Healing Soundscape • Frequency-Resonant • Vibration-Ready
// Evolution Not Erasure • One Source • One Consciousness • One Family
// Built for Shane Cooper — Pleading Sanity Universal Alliance
// ==============================================================

class CosmicAudio {
    constructor() {
        this.VERSION = '2.0.0-FINAL';
        this.isEnabled = localStorage.getItem('cosmicAudioEnabled') === 'true';
        this.audioContext = null;
        this.masterGain = null;
        this.oscillators = [];
        this.analyser = null;
        this.animationId = null;
        this.isPlaying = false;
        this.frequencyData = null;
        this.visualStyle = null;
        
        // Healing frequency presets
        this.FREQ = {
            DEEP_BASE: 43.0,     // Earth resonance foundation
            SOLFEGGIO_528: 528,  // Repair & DNA healing
            SOLFEGGIO_432: 432,  // Universal harmony
            SOLFEGGIO_639: 639,  // Heart connection
            SOLFEGGIO_741: 741,  // Expression & truth
            ALPHA_CARRIER: 10,   // Brainwave relaxation
        };
        
        this.init();
    }

    async init() {
        try {
            this.createToggleButton();
            if (this.isEnabled) await this.activateAudio();
            console.log(`🌌 Cosmic Audio System v${this.VERSION} — Ready`);
        } catch (err) {
            console.log('Cosmic Audio init soft fail:', err.message);
        }
    }

    // ==============================================
    // TOGGLE BUTTON — COSMIC DESIGN
    // ==============================================
    createToggleButton() {
        const existing = document.getElementById('audioToggle');
        if (existing) existing.remove();

        const btn = document.createElement('button');
        btn.id = 'audioToggle';
        btn.className = 'btn cosmic-audio-toggle';
        btn.innerHTML = this.isEnabled 
            ? '🌌 Soundscape Active' 
            : '🌌 Enable Cosmic Sound';
        
        btn.style.cssText = `
            position: fixed; left: 16px; bottom: 16px; z-index: 99999;
            font-size: 0.9rem; padding: 11px 20px; border-radius: 30px;
            background: ${this.isEnabled 
                ? 'linear-gradient(135deg, #00fff0, #00ff90)' 
                : 'linear-gradient(135deg, #7c3aed, #06b6d4)'};
            border: 2px solid rgba(0, 255, 240, 0.4);
            color: #000; font-weight: 700; cursor: pointer;
            transition: all 0.3s ease; backdrop-filter: blur(12px);
            box-shadow: 0 4px 20px rgba(0, 255, 240, 0.25);
        `;

        btn.addEventListener('click', () => this.toggleAudio());
        btn.addEventListener('mouseenter', () => {
            btn.style.transform = 'translateY(-3px) scale(1.05)';
            btn.style.boxShadow = '0 10px 30px rgba(0, 255, 240, 0.4)';
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translateY(0) scale(1)';
            btn.style.boxShadow = '0 4px 20px rgba(0, 255, 240, 0.25)';
        });

        document.body.appendChild(btn);
        this.button = btn;
    }

    // ==============================================
    // AUDIO ENGINE — LAYERED HEALING SOUNDSCAPE
    // ==============================================
    async activateAudio() {
        try {
            // Resume existing or create fresh context
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }

            // Master gain — safe volume control
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.setValueAtTime(0.08, this.audioContext.currentTime);

            // Analyser for visual feedback
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 256;
            this.analyser.smoothingTimeConstant = 0.82;
            this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);

            // Layer 1 — Deep Earth hum (43Hz)
            const osc1 = this.audioContext.createOscillator();
            const gain1 = this.audioContext.createGain();
            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(this.FREQ.DEEP_BASE, this.audioContext.currentTime);
            gain1.gain.setValueAtTime(0.25, this.audioContext.currentTime);
            osc1.connect(gain1);
            gain1.connect(this.masterGain);
            this.oscillators.push({ osc: osc1, gain: gain1, baseFreq: this.FREQ.DEEP_BASE });

            // Layer 2 — 528Hz repair tone (soft)
            const osc2 = this.audioContext.createOscillator();
            const gain2 = this.audioContext.createGain();
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(this.FREQ.SOLFEGGIO_528, this.audioContext.currentTime);
            gain2.gain.setValueAtTime(0.06, this.audioContext.currentTime);
            osc2.connect(gain2);
            gain2.connect(this.masterGain);
            this.oscillators.push({ osc: osc2, gain: gain2, baseFreq: this.FREQ.SOLFEGGIO_528 });

            // Layer 3 — 432Hz harmony (ultra-soft)
            const osc3 = this.audioContext.createOscillator();
            const gain3 = this.audioContext.createGain();
            osc3.type = 'sine';
            osc3.frequency.setValueAtTime(this.FREQ.SOLFEGGIO_432, this.audioContext.currentTime);
            gain3.gain.setValueAtTime(0.04, this.audioContext.currentTime);
            osc3.connect(gain3);
            gain3.connect(this.masterGain);
            this.oscillators.push({ osc: osc3, gain: gain3, baseFreq: this.FREQ.SOLFEGGIO_432 });

            // Connect chain
            this.masterGain.connect(this.analyser);
            this.analyser.connect(this.audioContext.destination);

            // Start all oscillators
            this.oscillators.forEach(layer => layer.osc.start());
            this.isPlaying = true;

            // Begin gentle cosmic modulation
            this.animateModulation();
            this.attachVisualEffects();

            console.log('🌌 Cosmic Soundscape Active — 43Hz • 528Hz • 432Hz');
        } catch (err) {
            console.log('Audio activation failed:', err.message);
            this.isEnabled = false;
            localStorage.setItem('cosmicAudioEnabled', 'false');
        }
    }

    // ==============================================
    // FREQUENCY MODULATION — ETHEREAL MOVEMENT
    // ==============================================
    animateModulation() {
        if (!this.isPlaying || !this.audioContext) return;

        const t = this.audioContext.currentTime;
        
        // Slow, gentle wave movement — never jarring
        this.oscillators.forEach((layer, idx) => {
            const speed = 0.08 + (idx * 0.02); // Each layer moves slightly differently
            const depth = idx === 0 ? 3 : idx === 1 ? 1.5 : 1;
            const shift = Math.sin(t * speed) * depth;
            layer.osc.frequency.setValueAtTime(layer.baseFreq + shift, t);
        });

        // Master volume breathing — subtle rise/fall
        const breath = 0.08 + (Math.sin(t * 0.05) * 0.015);
        this.masterGain?.gain.setValueAtTime(breath, t);

        this.animationId = requestAnimationFrame(() => this.animateModulation());
    }

    // ==============================================
    // TOGGLE CONTROLS
    // ==============================================
    async toggleAudio() {
        try {
            if (this.isEnabled) {
                await this.deactivateAudio();
            } else {
                await this.activateAudio();
                this.isEnabled = true;
                localStorage.setItem('cosmicAudioEnabled', 'true');
                this.button.innerHTML = '🌌 Soundscape Active';
                this.button.style.background = 'linear-gradient(135deg, #00fff0, #00ff90)';
            }
        } catch (err) {
            console.log('Toggle error:', err.message);
        }
    }

    async deactivateAudio() {
        this.isEnabled = false;
        localStorage.setItem('cosmicAudioEnabled', 'false');

        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }

        // Fade out smoothly
        if (this.masterGain && this.audioContext) {
            this.masterGain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 1.5);
        }

        setTimeout(() => {
            this.oscillators.forEach(layer => {
                try { layer.osc.stop(); } catch {}
            });
            this.oscillators = [];
            this.isPlaying = false;
        }, 1600);

        if (this.audioContext?.state === 'running') {
            await this.audioContext.suspend();
        }

        this.button.innerHTML = '🌌 Enable Cosmic Sound';
        this.button.style.background = 'linear-gradient(135deg, #7c3aed, #06b6d4)';
        this.detachVisualEffects();
    }

    // ==============================================
    // VISUAL EFFECTS — AUDIO-RESPONSIVE GLOW
    // ==============================================
    attachVisualEffects() {
        if (this.visualStyle) return;

        this.visualStyle = document.createElement('style');
        this.visualStyle.id = 'cosmic-audio-vfx';
        this.visualStyle.textContent = `
            .cosmic-glow-active {
                animation: cosmicRespire 6s ease-in-out infinite;
            }
            @keyframes cosmicRespire {
                0%, 100% { box-shadow: 0 0 20px rgba(0, 255, 240, 0.25); }
                50% { box-shadow: 0 0 45px rgba(0, 255, 240, 0.5), 0 0 70px rgba(0, 255, 144, 0.2); }
            }
            .cosmic-audio-toggle {
                animation: buttonPulse 4s ease-in-out infinite;
            }
            @keyframes buttonPulse {
                0%, 100% { border-color: rgba(0, 255, 240, 0.4); }
                50% { border-color: rgba(0, 255, 240, 0.9); box-shadow: 0 0 25px rgba(0, 255, 240, 0.5); }
            }
            body.audio-active {
                background-blend-mode: overlay;
            }
        `;
        document.head.appendChild(this.visualStyle);
        document.body.classList.add('audio-active');

        // Add glow to key elements
        const targets = document.querySelectorAll('header, .feed-item, .feature, .btn-primary, .offline-container');
        targets.forEach(el => el.classList.add('cosmic-glow-active'));
    }

    detachVisualEffects() {
        if (this.visualStyle) {
            this.visualStyle.remove();
            this.visualStyle = null;
        }
        document.body.classList.remove('audio-active');
        document.querySelectorAll('.cosmic-glow-active').forEach(el => {
            el.classList.remove('cosmic-glow-active');
        });
    }

    // ==============================================
    // DATA EXPORT — FOR VISUALIZER INTEGRATION
    // ==============================================
    getFrequencyData() {
        if (!this.analyser || !this.frequencyData) return null;
        this.analyser.getByteFrequencyData(this.frequencyData);
        return this.frequencyData;
    }

    getAverageLevel() {
        const data = this.getFrequencyData();
        if (!data) return 0;
        return data.reduce((a, b) => a + b, 0) / data.length / 255;
    }
}

// ==============================================
// INITIALIZE — AUTO-LOAD ON EVERY PAGE
// ==============================================
document.addEventListener('DOMContentLoaded', () => {
    window.cosmicAudio = new CosmicAudio();
    console.log('🌌 Pleading Sanity — Cosmic Audio Ready');
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CosmicAudio;
}
