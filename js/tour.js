/**
 * MD Sharik - Tour & Scrollytelling Controller
 * Matches the sticky viewport chapter transitions and speech triggers of lakshay85.github.io
 */

class TourController {
  constructor() {
    this.chapters = document.querySelectorAll('.tour__chapter');
    this.sections = document.querySelectorAll('section');
    this.bubbles = document.querySelectorAll('.speech-bubble');
    this.initObserver();
    this.initInteractiveDemos();
  }

  initObserver() {
    const observerOptions = {
      root: null,
      rootMargin: '-10% 0px -20% 0px',
      threshold: [0.15, 0.45, 0.75]
    };

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const target = entry.target;
        const mascotSide = target.getAttribute('data-mascot');
        const gesture = target.getAttribute('data-mascot-gesture') || 'idle';
        const sectionId = target.id;

        if (window.mascot) {
          window.mascot.setGesture(gesture);
        }

        // Activate speech bubbles inside the section
        const bubbles = target.querySelectorAll('.speech-bubble');
        bubbles.forEach((b, index) => {
          setTimeout(() => {
            b.classList.add('visible');
          }, index * 250);
        });

      });
    }, observerOptions);

    this.sections.forEach((sec) => sectionObserver.observe(sec));
  }

  initInteractiveDemos() {
    // 1. Interactive RAG Query Tester in Chapter 1
    const ragBtn = document.getElementById('rag-btn-query');
    const ragInput = document.getElementById('rag-input');
    const ragOutput = document.getElementById('rag-output-stream');
    const ragChips = document.querySelectorAll('.rag-chip');

    const runRagSimulation = (queryText) => {
      if (!ragOutput) return;
      ragOutput.innerHTML = `Searching Qdrant Vector Index for: "${queryText}"...<br/><span style="color:#38bdf8;">[1/3] Generating 1536-dim embeddings... Done (18ms)</span><br/><span style="color:#4ade80;">[2/3] Top-3 chunks retrieved (Cosine sim: 0.941)...</span><br/><br/><span style="color:#f8fafc;" id="rag-typewriter"></span>`;
      
      const fullResponse = `Based on enterprise records, the ingestion pipeline automatically preprocesses PDF, Word, and Excel files, generates semantic embeddings, and stores them in Qdrant with hybrid indexing. Low-latency inference is served with SSE streaming (142ms initial TTFT).`;
      let charIndex = 0;
      const typeEl = document.getElementById('rag-typewriter');
      
      const interval = setInterval(() => {
        if (charIndex < fullResponse.length) {
          typeEl.textContent += fullResponse.charAt(charIndex);
          charIndex++;
        } else {
          clearInterval(interval);
        }
      }, 16);

      if (window.mascot) {
        window.mascot.setGesture('thumbs');
        window.mascot.say("Vector cosine similarity score: 0.941! High precision retrieval.", 3000);
      }
    };

    if (ragBtn && ragInput) {
      ragBtn.addEventListener('click', () => {
        const val = ragInput.value.trim() || "What is the document ingestion architecture?";
        runRagSimulation(val);
      });
      ragInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          ragBtn.click();
        }
      });
    }

    ragChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const q = chip.getAttribute('data-query');
        if (ragInput) ragInput.value = q;
        runRagSimulation(q);
      });
    });

    // 2. Interactive Document Generator & Text-to-SQL in Chapter 2
    const docTabBtns = document.querySelectorAll('.doc-tab-btn');
    const docTabContents = document.querySelectorAll('.doc-tab-content');

    docTabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        docTabBtns.forEach(b => b.classList.remove('active'));
        docTabContents.forEach(c => c.style.display = 'none');
        btn.classList.add('active');
        const target = btn.getAttribute('data-tab');
        const activeContent = document.getElementById(target);
        if (activeContent) activeContent.style.display = 'block';
      });
    });

    const docGenBtn = document.getElementById('btn-gen-doc');
    const docResult = document.getElementById('doc-gen-result');
    if (docGenBtn && docResult) {
      docGenBtn.addEventListener('click', () => {
        docResult.innerHTML = `<span style="color:#eab308;">Orchestrating LiteLLM multi-provider pipeline...</span><br/>Compiling structured sections: Summary, Financials, Action Items...<br/><span style="color:#22c55e;">Generated Document: "Enterprise_Q3_Report.pdf" (6 Pages) + synced to OneDrive.</span>`;
        if (window.mascot) {
          window.mascot.playPopSound();
          window.mascot.say("Document synthesized in PDF, Word & Excel!", 2500);
        }
      });
    }

    const sqlGenBtn = document.getElementById('btn-gen-sql');
    const sqlResult = document.getElementById('sql-gen-result');
    if (sqlGenBtn && sqlResult) {
      sqlGenBtn.addEventListener('click', () => {
        sqlResult.innerHTML = `<span style="color:#38bdf8;">[Schema Validation Passed]</span><br/><pre style="color:#a5f3fc;margin-top:4px;">SELECT client_name, SUM(vector_queries) AS total_requests\nFROM enterprise_tenants\nGROUP BY client_name\nORDER BY total_requests DESC\nLIMIT 10;</pre><span style="color:#4ade80;">Returned 10 rows in 22ms.</span>`;
        if (window.mascot) {
          window.mascot.playPopSound();
          window.mascot.say("Text-to-SQL query validated against database schema!", 2500);
        }
      });
    }

    // 3. Interactive AI LMS Tutor Simulator in Chapter 4
    const lmsTutorBtn = document.getElementById('btn-lms-tutor');
    const lmsTutorOutput = document.getElementById('lms-tutor-stream');
    if (lmsTutorBtn && lmsTutorOutput) {
      lmsTutorBtn.addEventListener('click', () => {
        lmsTutorOutput.innerHTML = `<strong>AI Tutor (Streaming SSE):</strong> `;
        const message = "Server-Sent Events (SSE) offer a lightweight, unidirectional stream from server to client over HTTP. For conversational AI tutors, SSE delivers token-by-token streaming with low latency, auto-reconnection, and minimal overhead!";
        let i = 0;
        const timer = setInterval(() => {
          if (i < message.length) {
            lmsTutorOutput.innerHTML += message.charAt(i);
            i++;
          } else {
            clearInterval(timer);
          }
        }, 18);
        if (window.mascot) {
          window.mascot.say("Streaming responses over SSE keeps student interaction real-time!", 3000);
        }
      });
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.tour = new TourController();
});

