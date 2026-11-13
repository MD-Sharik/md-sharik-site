/**
 * MD Sharik - High Fidelity Dithered 3D Mascot Engine
 * Exact interactive implementation of lakshay85.github.io's waving, laughing dithered character (Scaled Up & Bug-Free)
 */

class MascotEngine {
  constructor() {
    this.container = document.querySelector('.mascot-canvas-container');
    this.canvas = document.getElementById('mascot-canvas');
    this.bubble = document.querySelector('.mascot-floating-bubble');
    this.ctx = this.canvas.getContext('2d');
    
    // Increased canvas dimensions for larger, prominent character
    this.width = 540;
    this.height = 640;
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    // Bayer 4x4 Matrix for authentic retro dithering
    this.bayer4 = [
      [ 0,  8,  2, 10],
      [12,  4, 14,  6],
      [ 3, 11,  1,  9],
      [15,  7, 13,  5]
    ];

    // State
    this.outfit = 'standard'; // standard, ai_architect, dev_mode, coffee, scholar
    this.gesture = 'wave'; // wave, idle, think, thumbs, cheer, panic, dizzy, sneeze, dance
    this.eyeTarget = { x: 0, y: 0 };
    this.isBlinking = false;
    this.blinkTimer = 0;
    this.frame = 0;
    this.isDragging = false;
    this.hasDraggedOnce = false;

    // Waving & laughing on hero greeting
    this.isLaughing = true;
    this.isWaving = true;

    // Sound toggle state (lakshay85.github.io style)
    this.soundEnabled = true;

    // Horizontal position interpolation (Right -> Left on scroll)
    this.currentX = 0;
    this.targetX = 0;
    this.currentY = 0;
    this.targetY = 0;
    
    // Physics for toss & drag
    this.vx = 0;
    this.vy = 0;
    this.gravity = 0.7;
    this.bounce = -0.45;
    this.friction = 0.94;
    this.dragStart = { x: 0, y: 0 };
    this.lastMouse = { x: 0, y: 0 };
    this.mouseVelocity = { x: 0, y: 0 };

    // Trick states
    this.trick = null;
    this.trickTimer = 0;
    this.trickFrame = 0;

    // Quotes when clicked
    this.clickQuotes = [
      "Stop, stop! I'm ticklish! 😄",
      "Who broke prod? Not me!",
      "Deploying AI agents with LangGraph...",
      "Qdrant vector search at 99.4% precision!",
      "To infinity and beyond!",
      "Hold and toss me! I can fly!",
      "Building full-stack web solutions!",
      "SSE streaming token-by-token..."
    ];
    this.quoteIndex = 0;

    // Initialize initial position on the RIGHT side of the screen (Hero default)
    this.setHeroPositionRight();

    // Web Audio Synthesizer
    this.initAudio();

    // Event Listeners
    this.initEvents();

    // Start render loop
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);

    // Initial greeting in bubble - PERMANENTLY VISIBLE on hero!
    this.say("Hi, I'm <span style='color: #2261e9; font-weight:700;'>Sharik</span>. Scroll down and I'll show you around.", 0);
  }

  // Safe Bayer Matrix lookup that NEVER throws negative-index errors
  getBayer(x, y) {
    const row = ((Math.floor(y) % 4) + 4) % 4;
    const col = ((Math.floor(x) % 4) + 4) % 4;
    return this.bayer4[row][col] / 16;
  }

  setHeroPositionRight() {
    const screenW = window.innerWidth;
    const rightMargin = screenW > 1200 ? screenW * 0.06 : (screenW > 768 ? 20 : 0);
    this.targetX = screenW - this.width - rightMargin;
    this.targetY = 0;
    this.currentX = this.targetX;
    this.currentY = this.targetY;
    this.updatePositionStyle();
  }

  initAudio() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
    } catch (e) {
      this.audioCtx = null;
    }
  }

  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    const soundBtn = document.getElementById('btn-sound-toggle');
    if (soundBtn) {
      soundBtn.innerHTML = this.soundEnabled ? '<i class="fas fa-volume-up"></i>' : '<i class="fas fa-volume-mute"></i>';
    }
    if (this.soundEnabled) {
      this.playPopSound();
      this.say("Sound turned on! 🔊", 2000);
    } else {
      this.say("Sound muted. 🔇", 2000);
    }
  }

  playTone(freq, type = 'sine', duration = 0.12, gainVal = 0.1) {
    if (!this.soundEnabled || !this.audioCtx) return;
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
    gain.gain.setValueAtTime(gainVal, this.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(this.audioCtx.destination);
    osc.start();
    osc.stop(this.audioCtx.currentTime + duration);
  }

  playPopSound() {
    this.playTone(520, 'sine', 0.08, 0.15);
    setTimeout(() => this.playTone(780, 'triangle', 0.1, 0.12), 40);
  }

  playBoingSound() {
    if (!this.soundEnabled || !this.audioCtx) return;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, this.audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, this.audioCtx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.25);
    osc.connect(gain);
    gain.connect(this.audioCtx.destination);
    osc.start();
    osc.stop(this.audioCtx.currentTime + 0.25);
  }

  playSneezeSound() {
    this.playTone(300, 'sawtooth', 0.15, 0.1);
    setTimeout(() => this.playTone(850, 'sawtooth', 0.2, 0.2), 120);
  }

  playShutterSound() {
    this.playTone(800, 'square', 0.05, 0.15);
    setTimeout(() => this.playTone(400, 'sine', 0.08, 0.1), 60);
  }

  initEvents() {
    window.addEventListener('mousemove', (e) => {
      const rect = this.container.getBoundingClientRect();
      const mascotCenterX = rect.left + rect.width / 2;
      const mascotCenterY = rect.top + rect.height * 0.35;
      
      const dx = (e.clientX - mascotCenterX) / window.innerWidth;
      const dy = (e.clientY - mascotCenterY) / window.innerHeight;
      this.eyeTarget.x = Math.max(-1, Math.min(1, dx * 2.5));
      this.eyeTarget.y = Math.max(-1, Math.min(1, dy * 2.5));

      if (this.isDragging) {
        this.mouseVelocity.x = e.clientX - this.lastMouse.x;
        this.mouseVelocity.y = e.clientY - this.lastMouse.y;
        this.lastMouse.x = e.clientX;
        this.lastMouse.y = e.clientY;

        this.currentX = e.clientX - this.dragStart.x;
        this.currentY = e.clientY - this.dragStart.y;
        this.targetX = this.currentX;
        this.targetY = this.currentY;
        this.updatePositionStyle();
      }
    });

    window.addEventListener('scroll', () => {
      if (this.isDragging || this.hasDraggedOnce) return;
      this.handleScrollProgress();
    }, { passive: true });

    window.addEventListener('resize', () => {
      if (!this.hasDraggedOnce) {
        this.handleScrollProgress();
      }
    });

    this.container.addEventListener('mousedown', (e) => {
      e.preventDefault();
      this.isDragging = true;
      this.hasDraggedOnce = true;
      const rect = this.container.getBoundingClientRect();
      this.dragStart.x = e.clientX - rect.left;
      this.dragStart.y = e.clientY - rect.top;
      this.lastMouse = { x: e.clientX, y: e.clientY };
      this.vx = 0;
      this.vy = 0;
      this.playPopSound();
      this.isLaughing = true;
      this.say("Weee! Hold on tight!", 1500);
    });

    window.addEventListener('mouseup', () => {
      if (this.isDragging) {
        this.isDragging = false;
        this.vx = this.mouseVelocity.x * 0.8;
        this.vy = this.mouseVelocity.y * 0.8;
      }
    });

    this.container.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      this.isDragging = true;
      this.hasDraggedOnce = true;
      const rect = this.container.getBoundingClientRect();
      this.dragStart.x = touch.clientX - rect.left;
      this.dragStart.y = touch.clientY - rect.top;
      this.lastMouse = { x: touch.clientX, y: touch.clientY };
      this.vx = 0;
      this.vy = 0;
      this.playPopSound();
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (this.isDragging && e.touches.length > 0) {
        const touch = e.touches[0];
        this.mouseVelocity.x = touch.clientX - this.lastMouse.x;
        this.mouseVelocity.y = touch.clientY - this.lastMouse.y;
        this.lastMouse.x = touch.clientX;
        this.lastMouse.y = touch.clientY;

        this.currentX = touch.clientX - this.dragStart.x;
        this.currentY = touch.clientY - this.dragStart.y;
        this.targetX = this.currentX;
        this.targetY = this.currentY;
        this.updatePositionStyle();
      }
    }, { passive: true });

    window.addEventListener('touchend', () => {
      if (this.isDragging) {
        this.isDragging = false;
        this.vx = this.mouseVelocity.x * 0.8;
        this.vy = this.mouseVelocity.y * 0.8;
      }
    });

    this.container.addEventListener('click', () => {
      if (!this.isDragging) {
        this.playPopSound();
        const quote = this.clickQuotes[this.quoteIndex % this.clickQuotes.length];
        this.quoteIndex++;
        this.say(quote, 2500);
        this.isLaughing = true;
        this.isWaving = true;
        setTimeout(() => {
          if (window.scrollY > 200) {
            this.isWaving = false;
          }
        }, 3000);
      }
    });

    const soundBtn = document.getElementById('btn-sound-toggle');
    if (soundBtn) {
      soundBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleSound();
      });
    }
  }

  handleScrollProgress() {
    const scrollY = window.scrollY;
    const heroHeight = window.innerHeight;
    const screenW = window.innerWidth;

    const rightMargin = screenW > 1200 ? screenW * 0.06 : (screenW > 768 ? 20 : 0);
    const rightX = screenW - this.width - rightMargin;
    const leftX = screenW > 768 ? 40 : 10;

    if (scrollY <= heroHeight) {
      const progress = Math.min(1, Math.max(0, scrollY / (heroHeight * 0.75)));
      const eased = progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      this.targetX = rightX + (leftX - rightX) * eased;
      this.targetY = 0;

      if (progress < 0.2) {
        this.isLaughing = true;
        this.isWaving = true;
        this.say("Hi, I'm <span style='color: #2261e9; font-weight:700;'>Sharik</span>. Scroll down and I'll show you around.", 0);
      } else if (progress > 0.5) {
        this.isWaving = false;
        this.say("Psst. You can grab and toss me!", 4000);
      }
    } else {
      this.targetX = leftX;
      this.targetY = 0;
      this.isWaving = false;
    }
  }

  updatePositionStyle() {
    this.container.style.transform = `translate(${this.currentX}px, ${this.currentY}px)`;
  }

  say(text, duration = 0) {
    if (!this.bubble) return;
    this.bubble.innerHTML = text;
    this.bubble.style.opacity = '1';
    clearTimeout(this.bubbleTimeout);
    if (duration > 0) {
      this.bubbleTimeout = setTimeout(() => {
        if (window.scrollY > 200) {
          this.bubble.style.opacity = '0';
        }
      }, duration);
    }
  }

  setGesture(gesture) {
    if (this.trick) return;
    this.gesture = gesture;
    if (gesture === 'wave') {
      this.isWaving = true;
      this.isLaughing = true;
    }
  }

  setOutfit(outfit) {
    this.outfit = outfit;
    this.playPopSound();
    this.say(`New look: ${outfit.replace('_', ' ').toUpperCase()}!`, 2000);
  }

  doTrick(trickName) {
    this.trick = trickName;
    this.trickFrame = 0;
    this.playBoingSound();

    switch (trickName) {
      case 'dance':
        this.say("Watch these dev moves! 🕺", 3000);
        break;
      case 'panic':
        this.say("WHO PUSHED DIRECTLY TO MAIN?! 🚨", 3500);
        break;
      case 'fly':
        this.say("Launching AI agent to the cloud! 🚀", 3000);
        this.vy = -22;
        break;
      case 'vanish':
        this.say("Now you see me... 💨", 1500);
        break;
      case 'sneeze':
        this.say("Ah... ah... 🤧", 1200);
        break;
      case 'selfie':
        this.say("Say cheese! 📸", 2000);
        break;
      case 'dizzy':
        this.say("Too many concurrent async tasks! 😵", 3000);
        break;
      case 'punch':
        this.say("Oof! Elastic reflex active! 🥊", 2000);
        this.vx = -12;
        break;
    }
  }

  updatePhysics() {
    if (this.isDragging) return;

    if (this.hasDraggedOnce) {
      this.vy += this.gravity;
      this.currentX += this.vx;
      this.currentY += this.vy;
      this.vx *= this.friction;

      const floor = 0;
      const leftWall = 0;
      const rightWall = window.innerWidth - this.width;

      if (this.currentY > floor) {
        this.currentY = floor;
        if (Math.abs(this.vy) > 2) {
          this.playBoingSound();
        }
        this.vy *= this.bounce;
        if (Math.abs(this.vy) < 0.5) this.vy = 0;
      }

      if (this.currentX < leftWall) {
        this.currentX = leftWall;
        this.vx = -this.vx * 0.5;
      } else if (this.currentX > rightWall) {
        this.currentX = rightWall;
        this.vx = -this.vx * 0.5;
      }
    } else {
      this.currentX += (this.targetX - this.currentX) * 0.12;
      this.currentY += (this.targetY - this.currentY) * 0.12;
    }

    this.updatePositionStyle();
  }

  /**
   * Draw safe dither shaded circle using getBayer (immune to negative modulos)
   */
  drawDitherCircle(cx, cy, r, baseColor, shadowColor, lightAngle = -0.55) {
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, r, 0, Math.PI * 2);
    this.ctx.clip();

    this.ctx.fillStyle = baseColor;
    this.ctx.fill();

    const step = 3;
    const lightX = cx + Math.cos(lightAngle) * (r * 0.45);
    const lightY = cy + Math.sin(lightAngle) * (r * 0.45);

    this.ctx.fillStyle = shadowColor;
    for (let x = cx - r; x < cx + r; x += step) {
      for (let y = cy - r; y < cy + r; y += step) {
        const dist = Math.hypot(x - lightX, y - lightY);
        const norm = dist / (r * 1.55);
        const bayerVal = this.getBayer(x / step, y / step);
        if (norm > bayerVal + 0.22) {
          this.ctx.fillRect(Math.floor(x), Math.floor(y), step, step);
        }
      }
    }
    this.ctx.restore();
  }

  /**
   * Render the complete, prominent character matching screenshot
   */
  renderCharacter() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Center coordinates
    let cx = 255;
    let cy = 295;
    
    // Natural head tilt and breathing bob
    const waveTime = this.frame * 0.1;
    const headTilt = Math.sin(this.frame * 0.05) * 0.035;
    const bob = Math.sin(this.frame * 0.06) * 3;

    // Palette matching screenshot
    const skinTone = '#fbfbf8';
    const skinDither = '#111215';
    const hairTone = '#1c1b20';
    const shirtTone = '#d6d5ce';
    const shirtDither = '#111215';

    // ================= 1. TORSO & SHOULDERS =================
    const shoulderY = cy + 140 + bob;
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.ellipse(cx, shoulderY + 105, 220, 140, 0, 0, Math.PI * 2);
    this.ctx.fillStyle = shirtTone;
    this.ctx.fill();

    // Dither texture on shirt
    const step = 4;
    this.ctx.fillStyle = shirtDither;
    this.ctx.clip();
    for (let x = cx - 220; x < cx + 220; x += step) {
      for (let y = shoulderY; y < this.height; y += step) {
        const b = this.getBayer(x / step, y / step);
        if (b > 0.45 && (Math.abs(Math.floor(x)) + Math.abs(Math.floor(y))) % 8 === 0) {
          this.ctx.fillRect(x, y, step, step);
        }
      }
    }
    this.ctx.restore();

    // Collar
    this.ctx.beginPath();
    this.ctx.ellipse(cx, shoulderY - 8, 52, 22, 0, 0, Math.PI * 2);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fill();
    this.ctx.lineWidth = 3;
    this.ctx.strokeStyle = '#1c1b20';
    this.ctx.stroke();

    // ================= 2. WAVING ARM & HAND (CHARACTER'S LEFT, VIEWER'S RIGHT) =================
    if (this.isWaving) {
      const handWaveAngle = Math.sin(waveTime * 1.5) * 0.22;
      const armStartX = cx + 105;
      const armStartY = shoulderY + 25;

      this.ctx.save();
      this.ctx.translate(armStartX, armStartY);
      this.ctx.rotate(-0.45 + handWaveAngle * 0.3);

      // Arm body
      this.ctx.beginPath();
      this.ctx.roundRect(-22, -155, 44, 155, 20);
      this.ctx.fillStyle = shirtTone;
      this.ctx.fill();
      this.ctx.lineWidth = 3;
      this.ctx.strokeStyle = '#1c1b20';
      this.ctx.stroke();

      // Dither stipple on arm
      this.ctx.fillStyle = shirtDither;
      for (let y = -155; y < 0; y += 4) {
        for (let x = -22; x < 22; x += 4) {
          const b = this.getBayer(x / 4, y / 4);
          if (b > 0.45 && (Math.abs(Math.floor(x)) + Math.abs(Math.floor(y))) % 8 === 0) {
            this.ctx.fillRect(x, y, 4, 4);
          }
        }
      }

      // White wrist cuff ring
      this.ctx.beginPath();
      this.ctx.ellipse(0, -155, 26, 12, 0, 0, Math.PI * 2);
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fill();
      this.ctx.stroke();

      // Waving White Cartoon Hand with fingers
      this.ctx.translate(0, -162);
      this.ctx.rotate(handWaveAngle * 0.8);

      // Palm
      this.ctx.beginPath();
      this.ctx.ellipse(0, -18, 26, 24, 0, 0, Math.PI * 2);
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fill();
      this.ctx.lineWidth = 3;
      this.ctx.strokeStyle = '#1c1b20';
      this.ctx.stroke();

      // Fingers spread out waving
      const fingers = [
        { angle: -0.85, len: 30, w: 10 }, // thumb
        { angle: -0.32, len: 42, w: 9.5 }, // index
        { angle: -0.05, len: 46, w: 9.5 }, // middle
        { angle: 0.22, len: 42, w: 9.5 },  // ring
        { angle: 0.50, len: 32, w: 8.5 }   // pinky
      ];

      fingers.forEach(f => {
        this.ctx.save();
        this.ctx.rotate(f.angle);
        this.ctx.beginPath();
        this.ctx.roundRect(-f.w / 2, -22 - f.len, f.w, f.len, f.w / 2);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fill();
        this.ctx.lineWidth = 2.5;
        this.ctx.strokeStyle = '#1c1b20';
        this.ctx.stroke();

        this.ctx.fillStyle = '#1c1b20';
        for (let fy = -22 - f.len; fy < -22; fy += 3) {
          const b = this.getBayer(0, fy / 3);
          if (b < 0.25) {
            this.ctx.fillRect(-f.w / 2 + 1, fy, 2, 2);
          }
        }
        this.ctx.restore();
      });

      this.ctx.restore();
    }

    // ================= 3. NECK & HEAD =================
    this.ctx.save();
    this.ctx.translate(cx, cy + bob);
    this.ctx.rotate(headTilt);

    // Neck
    this.ctx.fillStyle = skinTone;
    this.ctx.fillRect(-40, 65, 80, 80);
    this.ctx.fillStyle = skinDither;
    for (let y = 70; y < 140; y += 3) {
      for (let x = -40; x < 40; x += 3) {
        const b = this.getBayer(x / 3, y / 3);
        if (b < 0.38) {
          this.ctx.fillRect(x, y, 3, 3);
        }
      }
    }

    // Head base (radius = 125)
    const headRadius = 125;
    this.drawDitherCircle(0, 0, headRadius, skinTone, skinDither, -0.6);

    // Ears on sides
    this.drawDitherCircle(-headRadius + 4, 10, 26, skinTone, skinDither, -0.6);
    this.drawDitherCircle(headRadius - 4, 10, 26, skinTone, skinDither, -0.6);

    // Ear inner detail
    this.ctx.strokeStyle = '#1c1b20';
    this.ctx.lineWidth = 2.5;
    this.ctx.beginPath();
    this.ctx.arc(-headRadius + 4, 10, 12, 0.2 * Math.PI, 1.2 * Math.PI);
    this.ctx.stroke();
    this.ctx.beginPath();
    this.ctx.arc(headRadius - 4, 10, 12, -0.2 * Math.PI, 0.8 * Math.PI);
    this.ctx.stroke();

    // ================= 4. BEARD & JAWLINE DITHER =================
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(0, 0, headRadius, 0.22 * Math.PI, 0.78 * Math.PI);
    this.ctx.lineTo(0, 40);
    this.ctx.closePath();
    this.ctx.clip();

    this.ctx.fillStyle = skinDither;
    for (let x = -headRadius; x < headRadius; x += 3) {
      for (let y = 20; y < headRadius + 12; y += 3) {
        const b = this.getBayer(x / 3, y / 3);
        if (b < 0.6) {
          this.ctx.fillRect(x, y, 3, 3);
        }
      }
    }
    this.ctx.restore();

    // ================= 5. HAIR (ROUND DOME WITH CURLY DITHER TEXTURE) =================
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.ellipse(0, -60, 134, 102, 0, Math.PI, 0);
    this.ctx.lineTo(134, 12);
    this.ctx.quadraticCurveTo(95, 24, 60, -12);
    this.ctx.quadraticCurveTo(0, -18, -60, -12);
    this.ctx.quadraticCurveTo(-95, 24, -134, 12);
    this.ctx.closePath();
    this.ctx.fillStyle = hairTone;
    this.ctx.fill();

    // Authentic stippled dither on hair volume
    this.ctx.fillStyle = '#ffffff';
    for (let x = -134; x < 134; x += 3) {
      for (let y = -160; y < 12; y += 3) {
        const dist = Math.hypot(x + 25, y + 95);
        const norm = dist / 130;
        const bayerVal = this.getBayer(x / 3, y / 3);
        if (norm < 0.45 && bayerVal > 0.65) {
          this.ctx.fillRect(x, y, 3, 3);
        }
      }
    }
    this.ctx.restore();

    // ================= 6. EYEBROWS =================
    this.ctx.fillStyle = '#0b0b0c';
    this.ctx.beginPath();
    this.ctx.roundRect(-56, -38, 34, 13, 6);
    this.ctx.fill();
    this.ctx.beginPath();
    this.ctx.roundRect(24, -38, 34, 13, 6);
    this.ctx.fill();

    // ================= 7. EYES (HAPPY LAUGHING CRESCENTS ^ ^) =================
    const leftEyeX = -40;
    const rightEyeX = 40;
    const eyeY = -6;

    if (this.isLaughing || this.isWaving) {
      this.ctx.strokeStyle = '#0b0b0c';
      this.ctx.lineWidth = 7.5;
      this.ctx.lineCap = 'round';

      this.ctx.beginPath();
      this.ctx.arc(leftEyeX, eyeY + 4, 18, Math.PI * 1.15, Math.PI * 1.85);
      this.ctx.stroke();

      this.ctx.beginPath();
      this.ctx.arc(rightEyeX, eyeY + 4, 18, Math.PI * 1.15, Math.PI * 1.85);
      this.ctx.stroke();
    } else {
      const eyeOffsetX = this.eyeTarget.x * 5;
      const eyeOffsetY = this.eyeTarget.y * 4;

      this.ctx.fillStyle = '#ffffff';
      this.ctx.beginPath();
      this.ctx.ellipse(leftEyeX, eyeY, 19, 26, 0, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.beginPath();
      this.ctx.ellipse(rightEyeX, eyeY, 19, 26, 0, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.fillStyle = '#0b0b0c';
      this.ctx.beginPath();
      this.ctx.ellipse(leftEyeX + eyeOffsetX, eyeY + eyeOffsetY, 12, 17, 0, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.beginPath();
      this.ctx.ellipse(rightEyeX + eyeOffsetX, eyeY + eyeOffsetY, 12, 17, 0, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.fillStyle = '#ffffff';
      this.ctx.beginPath();
      this.ctx.arc(leftEyeX + eyeOffsetX - 4, eyeY + eyeOffsetY - 5, 4, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.beginPath();
      this.ctx.arc(rightEyeX + eyeOffsetX - 4, eyeY + eyeOffsetY - 5, 4, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // ================= 8. NOSE =================
    this.ctx.strokeStyle = '#0b0b0c';
    this.ctx.lineWidth = 3;
    this.ctx.lineCap = 'round';
    this.ctx.beginPath();
    this.ctx.arc(0, 22, 7, 0.2 * Math.PI, 0.8 * Math.PI);
    this.ctx.stroke();

    // ================= 9. MOUTH (HAPPY LAUGHING OPEN MOUTH) =================
    const laughBob = Math.sin(this.frame * 0.16) * 3.5;
    const mouthHeight = 26 + laughBob;

    this.ctx.fillStyle = '#0b0b0c';
    this.ctx.beginPath();
    this.ctx.moveTo(-28, 38);
    this.ctx.quadraticCurveTo(0, 33, 28, 38);
    this.ctx.quadraticCurveTo(33, 38 + mouthHeight, 0, 38 + mouthHeight);
    this.ctx.quadraticCurveTo(-33, 38 + mouthHeight, -28, 38);
    this.ctx.closePath();
    this.ctx.fill();

    // Pink tongue inside
    this.ctx.save();
    this.ctx.clip();
    this.ctx.fillStyle = '#e11d48';
    this.ctx.beginPath();
    this.ctx.arc(0, 38 + mouthHeight + 4, 18, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();

    // ================= 10. WARDROBE ACCESSORIES =================
    if (this.outfit === 'ai_architect') {
      this.ctx.fillStyle = '#0284c7';
      this.ctx.fillRect(-75, -14, 150, 28);
      this.ctx.fillStyle = '#38bdf8';
      this.ctx.fillRect(-60, -10, 140, 20);
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillRect(-45, -7, 35, 6);
    } else if (this.outfit === 'dev_mode') {
      this.ctx.lineWidth = 16;
      this.ctx.strokeStyle = '#334155';
      this.ctx.beginPath();
      this.ctx.arc(0, -48, headRadius + 16, Math.PI, 0);
      this.ctx.stroke();

      this.ctx.fillStyle = '#0f172a';
      this.ctx.fillRect(-headRadius - 26, -18, 28, 70);
      this.ctx.fillRect(headRadius - 2, -18, 28, 70);
    } else if (this.outfit === 'scholar') {
      this.ctx.fillStyle = '#0f172a';
      this.ctx.beginPath();
      this.ctx.moveTo(0, -190);
      this.ctx.lineTo(130, -140);
      this.ctx.lineTo(0, -95);
      this.ctx.lineTo(-130, -140);
      this.ctx.closePath();
      this.ctx.fill();

      this.ctx.strokeStyle = '#eab308';
      this.ctx.lineWidth = 4.5;
      this.ctx.beginPath();
      this.ctx.moveTo(0, -140);
      this.ctx.lineTo(90, -95);
      this.ctx.stroke();
      this.ctx.fillStyle = '#eab308';
      this.ctx.fillRect(85, -95, 12, 16);
    }

    this.ctx.restore();
  }

  animate() {
    this.frame++;

    if (!this.isLaughing) {
      this.blinkTimer++;
      if (this.blinkTimer > 180 + Math.random() * 140) {
        this.isBlinking = true;
        if (this.blinkTimer > 195 + Math.random() * 140) {
          this.isBlinking = false;
          this.blinkTimer = 0;
        }
      }
    }

    if (this.trick) {
      this.trickFrame++;
      if (this.trickFrame > 140 && this.trick !== 'vanish') {
        this.trick = null;
        this.gesture = 'idle';
      }
    }

    this.updatePhysics();
    this.renderCharacter();

    requestAnimationFrame(this.animate);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.mascot = new MascotEngine();
});
