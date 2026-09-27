// ==============================================================
// 🌌 PLEADING SANITY — COSMIC AUDIO SYSTEM v2.1-FINAL
// Immersive Healing Soundscape • Binaural Beats • Visualizer
// Evolution Not Erasure • One Source • One Consciousness • One Family
// Built for Shane Cooper — Pleading Sanity Universal Alliance
// ==============================================================

class CosmicAudio {
    constructor() {
        this.VERSION = '2.1.0-FINAL';
        this.isEnabled = localStorage.getItem('cosmicAudioEnabled') === 'true';
        this.audioContext = null;
        this.masterGain = null;
        this.oscillators = [];
        this.analyser = null;
        this.animationId = null;
        this.visualId = null;
        this.isPlaying = false;
        this.frequencyData = null;
        this.visualStyle = null;
        this.visualCanvas = null;
        this.selectedPreset = localStorage.getItem('cosmicAudioPreset') || 'balanced';
        this.sessionSeconds = 0;
        this.timerInterval = null;
        this.volume = parseFloat(localStorage.getItem('cosmicAudioVolume')) || 0.08;

        // ========================================
        // 🎵 HEALING FREQUENCY PRESETS — FULL LIBRARY
        // ========================================
        this.FREQ = {
            DEEP_BASE: 43.0,      // Earth resonance foundation
            SCHUMANN: 7.83,       // Planetary heartbeat
            SOLFEGGIO_174: 174,   // Pain relief
            SOLFEGGIO_285: 285,   // Energy field repair
            SOLFEGGIO_396: 396,   // Liberation from guilt/fear
            SOLFEGGIO_417: 417,   // Change & breaking patterns
            SOLFEGGIO_528: 528,   // DNA repair • Transformation
            SOLFEGGIO_639: 639,   // Heart connection • Love
            SOLFEGGIO_741: 741,   // Expression • Truth
            SOLFEGGIO_852: 852,   // Intuition • Spiritual sight
            SOLFEGGIO_963: 963,   // Crown • Unity • Oneness
            SOLFEGGIO_432: 432,   // Universal harmony
            ALPHA_CARRIER: 10,    // Relaxation (8–12Hz)
            THETA_CARRIER: 6,     // Deep meditation (4–8Hz)
            DELTA_CARRIER: 2,     // Deep healing/sleep (0.5–4Hz)
        };

        // Preset configurations
        this.PRESETS = {
            balanced: {
                name: '🌌 Balance & Harmony',
                layers: [
                    { freq: 'DEEP_BASE', type: 'sine', gain: 0.25, mod: 3 },
                    { freq: 'SOLFEGGIO_432', type: 'sine', gain: 0.04, mod: 1 },
                    { freq: 'SOLFEGGIO_528', type: 'sine', gain: 0.06, mod: 1.5 },
                ],
                binaural: null,
                description: 'Grounding + transformation + universal peace'
            },
            deepHeal: {
                name: '💜 Deep Healing',
                layers: [
                    { freq: 'SCHUMANN', type: 'sine', gain: 0.3, mod: 2 },
                    { freq: 'SOLFEGGIO_174', type: 'sine', gain: 0.08, mod: 0.5 },
                    { freq: 'SOLFEGGIO_528', type: 'sine', gain: 0.07, mod: 1 },
                ],
                binaural: 'DELTA_CARRIER',
                description: 'Pain relief • cellular repair • deep rest'
            },
            heartConnect: {
                name: '💚 Heart Connection',
                layers: [
                    { freq: 'DEEP_BASE', type: 'sine', gain: 0.2, mod: 2 },
                    { freq: 'SOLFEGGIO_639', type: 'sine', gain: 0.08, mod: 1.2 },
                    { freq: 'SOLFEGGIO_417', type: 'sine', gain: 0.05, mod: 0.8 },
                ],
                binaural: 'ALPHA_CARRIER',
                description: 'Open heart • release old patterns • connect'
            },
            awaken: {
                name: '✨ Awaken & Rise',
                layers: [
                    { freq: 'SOLFEGGIO_852', type: 'sine', gain: 0.06, mod: 0.6 },
                    { freq: 'SOLFEGGIO_963', type: 'sine', gain: 0.04, mod: 0.4 },
                    { freq: 'SOLFEGGIO_528', type: 'sine', gain: 0.05, mod: 1 },
                ],
                binaural: 'THETA_CARRIER',
                description: 'Intuition • crown • unity consciousness'
            },
            schumann: {
                name: '🌍 Earth Resonance',
                layers: [
                    { freq: 'SCHUMANN', type: 'sine', gain: 0.35, mod: 1.5 },
                    { freq: 'DEEP_BASE', type: 'sine', gain: 0.15, mod: 2 },
                ],
                binaural: null,
                description: 'Align with planetary heartbeat'
            }
        };

        this.init();
    }

    async init() {
        try {
            this.createUI();
            if (this.isEnabled) await this.activateAudio();
            console.log(`🌌 Cosmic Audio System v${this.VERSION} — Ready`);
        } catch (err) {
            console.log('Cosmic Audio init soft fail:', err.message);
        }
    }

    // ==============================================
    // 🎛️ FULL UI — TOGGLE + PRESETS + VOLUME + TIMER
    // ==============================================
    createUI() {
        // Remove existing
        ['audioToggle', 'audioPanel', 'audioVisualizer'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.remove();
        });

        // Main Toggle Button
        const btn = document.createElement('button');
        btn.id = 'audioToggle';
        btn.className = 'btn cosmic-audio-toggle';
        btn.innerHTML = this.isEnabled 
            ? '🌌 Soundscape Active' 
            : '🌌 Enable Cosmic Sound';
        btn.style.cssText = this.getButtonStyle();
        btn.addEventListener('click', () => this.toggleAudio());
        btn.addEventListener('contextmenu', e => {
            e.preventDefault();
            this.togglePanel();
        });
        document.body.appendChild(btn);
        this.button = btn;

        // Control Panel
        this.createPanel();
        
        // Visualizer Canvas
        this.createVisualizer();
    }

    getButtonStyle() {
        const active = this.isEnabled;
        return `
            position: fixed; left: 16px; bottom: 16px; z-index: 99999;
            font-size: 0.9rem; padding: 11px 20px; border-radius: 30px;
            background: ${active 
                ? 'linear-gradient(135deg, #00fff0, #00ff90)' 
                : 'linear-gradient(135deg, #7c3aed, #06b6d4)'};
            border: 2px solid rgba(0, 255, 240, 0.4);
            color: #000; font-weight: 700; cursor: pointer;
            transition: all 0.3s ease; backdrop-filter: blur(12px);
            box-shadow: 0 4px 20px rgba(0, 255, 240, 0.25);
            user-select: none;
        `;
    }

    createPanel() {
        const panel = document.createElement('div');
        panel.id = 'audioPanel';
        panel.style.cssText = `
            position: fixed; left: 16px; bottom: 80px; z-index: 99998;
            background: rgba(10, 12, 28, 0.92); backdrop-filter: blur(16px);
            border: 1px solid rgba(0, 255, 240, 0.25); border-radius: 16px;
            padding: 20px; width: 300px; display: none;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5), 0 0 30px rgba(0, 255, 240, 0.1);
            color: #e0ffff; font-family: system-ui, sans-serif;
        `;

        panel.innerHTML = `
            <h4 style="margin:0 0 14px; font-size:1rem; color:#00fff0; display:flex; justify-content:space-between; align-items:center;">
                🌌 Cosmic Soundscape
                <button id="closeAudioPanel" style="background:none; border:none; color:#888; cursor:pointer; font-size:1rem;">×</button>
            </h4>
            
            <div style="margin-bottom:12px;">
                <label style="font-size:0.8rem; color:#8ff; opacity:0.8;">Preset</label>
                <select id="audioPreset" style="width:100%; padding:8px 10px; margin-top:4px; border-radius:8px; 
                    background:rgba(0,40,40,0.5); border:1px solid rgba(0,255,240,0.3); color:#fff; cursor:pointer;">
                    ${Object.entries(this.PRESETS).map(([key, p]) => 
                        `<option value="${key}" ${key === this.selectedPreset ? 'selected' : ''}>${p.name}</option>`
                    ).join('')}
                </select>
                <p id="presetDesc" style="font-size:0.75rem; opacity:0.6; margin:6px 0 0;"></p>
            </div>
            
            <div style="margin-bottom:12px;">
                <label style="font-size:0.8rem; color:#8ff; opacity:0.8;">Volume: <span id="volVal">${Math.round(this.volume * 100)}%</span></label>
                <input type="range" id="audioVolume" min="1" max="30" value="${Math.round(this.volume * 100)}" 
                    style="width:100%; margin-top:4px; accent-color:#00fff0;">
            </div>
            
            <div style="margin-bottom:8px; font-size:0.8rem; opacity:0.7;">
                Session: <span id="sessionTimer">00:00</span>
            </div>
            
            <p style="font-size:0.7rem; opacity:0.5; margin:10px 0 0;">
                💡 Right-click the main button to open this panel
            </p>
        `;

        document.body.appendChild(panel);
        this.panel = panel;

        // Bind events
        setTimeout(() => {
            document.getElementById('closeAudioPanel')?.addEventListener('click', () => this.togglePanel());
            document.getElementById('audioPreset')?.addEventListener('change', e => {
                this.selectedPreset = e.target.value;
                localStorage.setItem('cosmicAudioPreset', this.selectedPreset);
                this.updatePresetDesc();
                if (this.isPlaying) this.restartWithPreset();
            });
            document.getElementById('audioVolume')?.addEventListener('input', e => {
                this.volume = parseInt(e.target.value) / 100;
                localStorage.setItem('cosmicAudioVolume', this.volume);
                if (this.masterGain && this.audioContext) {
                    this.masterGain.gain.setValueAtTime(this.volume, this.audioContext.currentTime);
                }
                document.getElementById('volVal').textContent = `${Math.round(this.volume * 100)}%`;
            });
            this.updatePresetDesc();
        }, 0);
    }

    createVisualizer() {
        const canvas = document.createElement('canvas');
        canvas.id = 'audioVisualizer';
        canvas.style.cssText = `
            position: fixed; right: 20px; bottom: 20px; z-index: 99997;
            width: 120px; height: 80px; border-radius: 12px;
            background: rgba(5, 10, 20, 0.6); border: 1px solid rgba(0, 255, 240, 0.2);
            display: ${this.isPlaying ? 'block' : 'none'};
            pointer-events: none; backdrop-filter: blur(8px);
        `;
        document.body.appendChild(canvas);
        this.visualCanvas = canvas;
    }

    updatePresetDesc() {
        const desc = this.PRESETS[this.selectedPreset]?.description || '';
        const el = document.getElementById('presetDesc');
        if (el) el.textContent = desc;
    }

    togglePanel() {
        if (!this.panel) return;
        const isVisible = this.panel.style.display === 'block';
        this.panel.style.display = isVisible ? 'none' : 'block';
    }

    // ==============================================
    // 🎵 AUDIO ENGINE — LAYERED + BINAURAL
    // ==============================================
    async activateAudio() {
        try {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }

            // Master gain
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.setValueAtTime(this.volume, this.audioContext.currentTime);

            // Analyser
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 128;
            this.analyser.smoothingTimeConstant = 0.85;
            this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);

            // Load preset layers
            const preset = this.PRESETS[this.selectedPreset];
            preset.layers.forEach(layer => {
                const freqVal = typeof layer.freq === 'string' 
                    ? this.FREQ[layer.freq] 
                    : layer.freq;
                const osc = this.audioContext.createOscillator();
                const gain = this.audioContext.createGain();
                
                osc.type = layer.type;
                osc.frequency.setValueAtTime(freqVal, this.audioContext.currentTime);
                gain.gain.setValueAtTime(layer.gain, this.audioContext.currentTime);
                
                osc.connect(gain);
                gain.connect(this.masterGain);
                this.oscillators.push({ 
                    osc, gain, baseFreq: freqVal, 
                    modDepth: layer.mod || 0,
                    modSpeed: 0.05 + Math.random() * 0.05
                });
            });

            // Binaural beat layer (if preset defines one)
            if (preset.binaural) {
                const carrier = 200;
                const beatFreq = this.FREQ[preset.binaural];
                
                const oscL = this.audioContext.createOscillator();
                const oscR = this.audioContext.createOscillator();
                const gainL = this.audioContext.createGain();
                const gainR = this.audioContext.createGain();
                const merger = this.audioContext.createChannelMerger(2);
                
                oscL.frequency.setValueAtTime(carrier, this.audioContext.currentTime);
                oscR.frequency.setValueAtTime(carrier + beatFreq, this.audioContext.currentTime);
                gainL.gain.setValueAtTime(0.03, this.audioContext.currentTime);
                gainR.gain.setValueAtTime(0.03, this.audioContext.currentTime);
                
                oscL.connect(gainL); gainL.connect(merger, 0, 0);
                oscR.connect(gainR); gainR.connect(merger, 0, 1);
                merger.connect(this.masterGain);
                
                this.oscillators.push({ osc: oscL, gain: gainL, baseFreq: carrier, isLeft: true });
                this.oscillators.push({ osc: oscR, gain: gainR, baseFreq: carrier + beatFreq, isRight: true, beatFreq });
            }

            // Connect chain
            this.masterGain.connect(this.analyser);
            this.analyser.connect(this.audioContext.destination);

            // Start
            this.oscillators.forEach(layer => layer.osc.start());
            this.isPlaying = true;

            // Start animations
            this.animateModulation();
            this.drawVisualizer();
            this.startTimer();
            this.attachVisualEffects();

            // Show visualizer
            if (this.visualCanvas) this.visualCanvas.style.display = 'block';

            console.log(`🌌 ${preset.name} — Active`);
        } catch (err) {
            console.log('Audio activation failed:', err.message);
            this.isEnabled = false;
            localStorage.setItem('cosmicAudioEnabled', 'false');
        }
    }

    async restartWithPreset() {
        await this.deactivateAudio(true);
        await this.activateAudio();
    }

    // ==============================================
    // 📡 MODULATION — LIVING SOUNDSCAPE
    // ==============================================
    animateModulation() {
        if (!this.isPlaying || !this.audioContext) return;

        const t = this.audioContext.currentTime;
        
        this.oscillators.forEach(layer => {
            if (layer.modDepth && !layer.isLeft && !layer.isRight) {
                const shift = Math.sin(t * layer.modSpeed) * layer.modDepth;
                layer.osc.frequency.setValueAtTime(layer.baseFreq + shift, t);
            }
            // Binaural slow drift
            if (layer.beatFreq) {
                const drift = Math.sin(t * 0.02) * 0.5;
                layer.osc.frequency.setValueAtTime(layer.baseFreq + drift, t);
            }
        });

        // Gentle breathing
        const breath = this.volume + (Math.sin(t * 0.05) * 0.008);
        if (this.masterGain) {
            this.masterGain.gain.setValueAtTime(Math.max(0.01, breath), t);
        }

        this.animationId = requestAnimationFrame(() => this.animateModulation());
    }

    // ==============================================
    // 📊 VISUALIZER — CANVAS BARS
    // ==============================================
    drawVisualizer() {
        if (!this.isPlaying || !this.visualCanvas) return;
        
        const ctx = this.visualCanvas.getContext('2d');
        const w = this.visualCanvas.width = this.visualCanvas.offsetWidth * 2;
        const h = this.visualCanvas.height = this.visualCanvas.offsetHeight * 2;
        const barCount = 16;
        
        const data = this.getFrequencyData();
        const avg = this.getAverageLevel();

        ctx.clearRect(0, 0, w, h);
        
        // Background glow
        const bgGrad = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, w/2);
        bgGrad.addColorStop(0, `rgba(0, 255, 240, ${avg * 0.15})`);
        bgGrad.addColorStop(1, 'rgba(0, 20, 40, 0)');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);

        // Bars
        const barW = w / barCount - 4;
        for (let i = 0; i < barCount; i++) {
            const val = data ? data[i] / 255 : 0;
            const barH = val * h * 0.8;
            const x = i * (w / barCount) + 2;
            const y = h - barH;
            
            const grad = ctx.createLinearGradient(x, y, x, h);
            grad.addColorStop(0, '#00fff0');
            grad.addColorStop(0.5, '#00ff90');
            grad.addColorStop(1, 'rgba(0, 255, 144, 0.1)');
            
            ctx.fillStyle = grad;
            ctx.fillRect(x, y, barW, barH);
        }

        this.visualId = requestAnimationFrame(() => this.drawVisualizer());
    }

    // ==============================================
    // ⏱️ SESSION TIMER
    // ==============================================
    startTimer() {
        this.sessionSeconds = 0;
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
            this.sessionSeconds++;
            const m = Math.floor(this.sessionSeconds / 60).toString().padStart(2, '0');
            const s = (this.sessionSeconds % 60).toString().padStart(2, '0');
            const el = document.getElementById('sessionTimer');
            if (el) el.textContent = `${m}:${s}`;
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    // ==============================================
    // 🔘 TOGGLE CONTROLS
    // ==============================================
    async toggleAudio() {
        try {
            if (this.isEnabled) {
                await this.deactivateAudio();
            } else {
                await this.activateAudio();
                this.isEnabled = true;
                localStorage.setItem('cosmicAudioEnabled', 'true');
                this.updateButtonState(true);
            }
        } catch (err) {
            console.log('Toggle error:', err.message);
        }
    }

    async deactivateAudio(keepState = false) {
        if (!keepState) {
            this.isEnabled = false;
            localStorage.setItem('cosmicAudioEnabled', 'false');
        }

        this.stopTimer();

        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        if (this.visualId) {
            cancelAnimationFrame(this.visualId);
            this.visualId = null;
        }

        // Smooth fade out
        if (this.masterGain && this.audioContext) {
            const now = this.audioContext.currentTime;
            this.masterGain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
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

        if (!keepState) this.updateButtonState(false);
        this.detachVisualEffects();
        
        if (this.visualCanvas) this.visualCanvas.style.display = 'none';
    }

    updateButtonState(active) {
        this.button.innerHTML = active ? '🌌 Soundscape Active' : '🌌 Enable Cosmic Sound';
        this.button.style.cssText = this.getButtonStyle();
    }

    // ==============================================
    // ✨ VISUAL EFFECTS — AUDIO-RESPONSIVE
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
            body.audio-active {
                background-blend-mode: overlay;
            }
        `;
        document.head.appendChild(this.visualStyle);
        document.body.classList.add('audio-active');

        const targets = document.querySelectorAll('header, .feature, .btn-primary, .card, .section');
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
    // 📊 DATA FOR OTHER COMPONENTS
    // ==============================================
    getFrequencyData() {
        if (!this.analyser || !this.frequencyData) return new Uint8Array(16).fill(0);
        this.analyser.getByteFrequencyData(this.frequencyData);
        return this.frequencyData;
    }

    getAverageLevel() {
        const data = this.getFrequencyData();
        return data.reduce((a, b) => a + b, 0) / data.length / 255;
    }
}

// ==============================================
// 🚀 AUTO-INITIALIZE — EVERY PAGE
// ==============================================
document.addEventListener('DOMContentLoaded', () => {
    window.cosmicAudio = new CosmicAudio();
    console.log('🌌 Pleading Sanity — Cosmic Audio v2.1 Ready');
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CosmicAudio;
}
