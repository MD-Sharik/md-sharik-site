/**
 * MD Sharik - Interactive Scratch Card Mini-Game
 * Interactive implementation of lakshay85.github.io's "Which game is this? Scratch it and I'll guess" feature
 */

class ScratchGame {
  constructor() {
    this.canvas = document.getElementById('scratch-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.wrap = document.querySelector('.scratch-canvas-wrap');
    
    this.width = 440;
    this.height = 240;
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    this.isDrawing = false;
    this.scratchedPercent = 0;
    this.solved = false;
    this.lastMilestone = 0;

    this.initCoating();
    this.initEvents();
  }

  initCoating() {
    this.ctx.globalCompositeOperation = 'source-over';
    // Metallic dither texture
    this.ctx.fillStyle = '#334155';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Subtle dither dots
    this.ctx.fillStyle = '#475569';
    for (let x = 0; x < this.width; x += 6) {
      for (let y = 0; y < this.height; y += 6) {
        if ((x + y) % 12 === 0) {
          this.ctx.fillRect(x, y, 3, 3);
        }
      }
    }

    // Call-to-action text on scratch coating
    this.ctx.font = "bold 20px 'Space Grotesk', sans-serif";
    this.ctx.fillStyle = '#f8fafc';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText("✨ SCRATCH ME TO REVEAL ✨", this.width / 2, this.height / 2 - 12);

    this.ctx.font = "14px 'JetBrains Mono', monospace";
    this.ctx.fillStyle = '#94a3b8';
    this.ctx.fillText("Drag mouse or finger here", this.width / 2, this.height / 2 + 18);
  }

  initEvents() {
    const startScratch = (x, y) => {
      this.isDrawing = true;
      this.scratch(x, y);
    };

    const moveScratch = (x, y) => {
      if (!this.isDrawing) return;
      this.scratch(x, y);
      this.calculateScratched();
    };

    const stopScratch = () => {
      this.isDrawing = false;
    };

    // Mouse events
    this.canvas.addEventListener('mousedown', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      startScratch(e.clientX - rect.left, e.clientY - rect.top);
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDrawing) return;
      const rect = this.canvas.getBoundingClientRect();
      moveScratch(e.clientX - rect.left, e.clientY - rect.top);
    });

    window.addEventListener('mouseup', stopScratch);

    // Touch events
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      const touch = e.touches[0];
      startScratch(touch.clientX - rect.left, touch.clientY - rect.top);
    }, { passive: false });

    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      const touch = e.touches[0];
      moveScratch(touch.clientX - rect.left, touch.clientY - rect.top);
    }, { passive: false });

    this.canvas.addEventListener('touchend', stopScratch);

    // Reset button
    const resetBtn = document.getElementById('btn-reset-scratch');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.solved = false;
        this.scratchedPercent = 0;
        this.lastMilestone = 0;
        this.initCoating();
        if (window.mascot) {
          window.mascot.say("Scratch card reset! Guess again!", 2000);
        }
      });
    }
  }

  scratch(x, y) {
    this.ctx.globalCompositeOperation = 'destination-out';
    this.ctx.beginPath();
    this.ctx.arc(x, y, 24, 0, Math.PI * 2);
    this.ctx.fill();

    if (window.mascot && Math.random() < 0.2) {
      window.mascot.playTone(320 + Math.random() * 200, 'sine', 0.04, 0.05);
    }
  }

  calculateScratched() {
    if (this.solved) return;

    // Sample pixels across canvas
    const sampleStep = 8;
    const imgData = this.ctx.getImageData(0, 0, this.width, this.height);
    const data = imgData.data;
    let transparentCount = 0;
    let totalSampled = 0;

    for (let i = 3; i < data.length; i += 4 * sampleStep) {
      totalSampled++;
      if (data[i] === 0) {
        transparentCount++;
      }
    }

    this.scratchedPercent = (transparentCount / totalSampled) * 100;

    // Mascot guesses at milestones
    if (this.scratchedPercent > 12 && this.lastMilestone < 1) {
      this.lastMilestone = 1;
      if (window.mascot) {
        window.mascot.setGesture('think');
        window.mascot.say("Ooh, keep going! I see some agent nodes...", 2500);
      }
    } else if (this.scratchedPercent > 32 && this.lastMilestone < 2) {
      this.lastMilestone = 2;
      if (window.mascot) {
        window.mascot.setGesture('think');
        window.mascot.say("Hmm... is it standard LangChain RAG?", 2500);
      }
    } else if (this.scratchedPercent > 55 && this.lastMilestone < 3) {
      this.lastMilestone = 3;
      if (window.mascot) {
        window.mascot.setGesture('thumbs');
        window.mascot.say("No wait, look at the cyclic graph edges... it's LangGraph!", 2800);
      }
    } else if (this.scratchedPercent > 70 && !this.solved) {
      this.solved = true;
      this.ctx.clearRect(0, 0, this.width, this.height);
      if (window.mascot) {
        window.mascot.doTrick('dance');
        window.mascot.say("Boom! LangGraph + Qdrant Multi-Agent Pipeline! Nailed it! 🎉", 4000);
      }
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.scratchGame = new ScratchGame();
});

