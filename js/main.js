/**
 * MD Sharik - Main Application Controller
 * Handles UI Modals, Copy-to-Clipboard, Filtering, and Project Inspector
 */

const projectDetails = {
  'pc-rag': {
    title: 'Enterprise AI Inference & RAG Architecture',
    company: 'PC Solutions · Jr. Engineer (AI)',
    period: 'October 2025 – Present · New Delhi, India',
    tags: ['Python', 'LangChain', 'LangGraph', 'Qdrant', 'RAG', 'Docker', 'FastAPI'],
    bullets: [
      'Architected and shipped end-to-end AI inference architectures including document ingestion, preprocessing, embedding generation, vector indexing, retrieval pipelines, prompt orchestration, and response generation.',
      'Engineered low-latency RAG pipelines utilizing Qdrant vector database, semantic chunking, and similarity reranking over enterprise knowledge bases.',
      'Developed real-time AI streaming experiences using Server-Sent Events (SSE) and WebSockets with event-driven state management and incremental token rendering.',
      'Implemented context-aware conversation storage with intelligent retrieval and chat history management, enabling LLMs to leverage multi-turn interactions for superior customer experience.'
    ]
  },
  'pc-docgen': {
    title: 'Automated Document Generation Pipeline (PDF/Word/Excel/PPTX)',
    company: 'PC Solutions · Jr. Engineer (AI)',
    period: '2025 · New Delhi, India',
    tags: ['Python', 'LLMs', 'LiteLLM', 'FastAPI', 'Office XML', 'Automation'],
    bullets: [
      'Designed and deployed an automated LLM-powered document generation pipeline producing PDF, Word, Excel, and PowerPoint outputs.',
      'Implemented hybrid editing workflows combining programmatic templating with AI-assisted content rewriting, refinement, and validation.',
      'Designed a multi-provider LLM orchestration layer with LiteLLM, establishing a unified API abstraction that routes across proprietary and open-source models with automatic fallback.'
    ]
  },
  'pc-sql': {
    title: 'Natural Language to SQL (Text-to-SQL) Pipeline',
    company: 'PC Solutions · Jr. Engineer (AI)',
    period: '2025 · New Delhi, India',
    tags: ['Text-to-SQL', 'Python', 'PostgreSQL', 'LangGraph', 'Prompt Engineering'],
    bullets: [
      'Engineered Text-to-SQL conversational systems enabling non-technical users to query complex structured databases in natural language.',
      'Implemented schema-aware prompt engineering, SQL syntax validation, and safety boundaries to prevent harmful or malformed queries.',
      'Integrated real-time database execution feedback loops where models self-correct upon detecting SQL syntax errors.'
    ]
  },
  'pc-cloud': {
    title: 'Enterprise Cloud & OneDrive API Integration',
    company: 'PC Solutions · Jr. Engineer',
    period: '2025 · New Delhi, India',
    tags: ['Microsoft Graph API', 'Azure', 'Docker', 'JWT', 'RBAC', 'FastAPI'],
    bullets: [
      'Engineered secure API integrations with OneDrive via Microsoft Graph API and implemented enterprise-grade Role-Based Access Control (RBAC).',
      'Containerized all backend services with Docker and Docker Compose, orchestrating deployments on Azure cloud infrastructure.',
      'Built multi-service orchestration with JWT authentication, secret management, and rate limiting for multi-tenant enterprise applications.'
    ]
  },
  'lms-ai': {
    title: 'LMS — Full-Stack Learning Management System with AI Assistance',
    company: 'Personal & Production Project',
    period: '2025 · Lead Full Stack Developer',
    tags: ['React.js', 'Node.js', 'Express.js', 'SSE', 'JWT', 'RBAC', 'MongoDB'],
    bullets: [
      'Built a responsive, production-ready React-based LMS focused on smooth student and instructor workflows, role-based dashboards, and course management.',
      'Engineered a streaming AI tutor using Server-Sent Events (SSE), session-based chat memory, auto-summarization, and dynamic context window management.',
      'Implemented secure JWT-based authentication with protected route middleware and session persistence.'
    ]
  },
  'navrik-intern': {
    title: 'Full Stack Web Development & AI Case Study Agent',
    company: 'Navrik Software Solutions · Full Stack Developer Intern',
    period: 'March 2025 – September 2025 · New Delhi, India',
    tags: ['React.js', 'Node.js', 'Express.js', 'SQL', 'Document Parsing', 'AI Agent'],
    bullets: [
      'Developed and maintained responsive full-stack web applications using React.js and Node.js, boosting load speed and user interaction.',
      'Built and documented RESTful APIs with Express.js and integrated SQL databases for dynamic, scalable data management.',
      'Engineered an AI-assisted Case Study Agent that parsed uploaded documents and generated dynamic context-aware questions integrated into the core product.'
    ]
  },
  'litellm-router': {
    title: 'Multi-LLM Orchestration & Fallback Layer',
    company: 'PC Solutions & Open Source Tools',
    period: '2025',
    tags: ['LiteLLM', 'OpenAI', 'Gemini', 'Claude', 'Hugging Face', 'FastAPI'],
    bullets: [
      'Architected a unified inference proxy connecting OpenAI, Claude, Gemini, and open-source models (SLMs) via LiteLLM.',
      'Configured automated latency tracking, provider failover routing, and cost optimization rules.',
      'Standardized structured output parsing with Pydantic and JSON schemas across all downstream consumers.'
    ]
  },
  'edu-mca': {
    title: 'Master of Computer Applications (MCA)',
    company: 'Indira Gandhi National Open University (IGNOU)',
    period: '2022 – 2024 · New Delhi, India',
    tags: ['Computer Science', 'Distributed Systems', 'Data Structures', 'Databases'],
    bullets: [
      'Graduated with honors in Master of Computer Applications (MCA).',
      'Advanced coursework in algorithms, object-oriented systems design, relational databases, computer networks, and cloud computing architectures.'
    ]
  },
  'edu-pgdca': {
    title: 'Post Graduation Diploma in Computer Application (PGDCA)',
    company: 'Indira Gandhi National Open University (IGNOU)',
    period: '2021 – 2022 · New Delhi, India',
    tags: ['Software Engineering', 'C/C++', 'Web Technologies', 'Information Systems'],
    bullets: [
      'Comprehensive foundation in modern programming paradigms, systems programming, and database design principles.'
    ]
  },
  'edu-bcom': {
    title: 'Bachelor of Commerce (B.Com)',
    company: 'Delhi University',
    period: '2017 – 2020 · New Delhi, India',
    tags: ['Economics', 'Business Analytics', 'Financial Systems'],
    bullets: [
      'Bachelor degree from University of Delhi with strong focus on quantitative modeling, financial systems, and analytical problem solving.'
    ]
  },
  'cert-apna': {
    title: 'Full Stack Web Development Certification',
    company: 'Apna College',
    period: '2024',
    tags: ['MERN Stack', 'React', 'Node.js', 'Express', 'MongoDB'],
    bullets: [
      'Rigorous industry certification covering modern full-stack development, asynchronous JavaScript, database modeling, and scalable REST APIs.'
    ]
  },
  'cert-nielit': {
    title: 'IT A-Level & O-Level Systems Certification',
    company: 'NIELIT, New Delhi',
    period: '2020 – 2022',
    tags: ['Systems Programming', 'Hardware & OS', 'Networking', 'Data Structures'],
    bullets: [
      'National Institute of Electronics and Information Technology (NIELIT) dual certifications in IT Systems, Software Design, and Network Architecture.'
    ]
  }
};

document.addEventListener('DOMContentLoaded', () => {

  // 1. Copy Email to Clipboard
  const emailBtn = document.getElementById('btn-copy-email');
  const emailTooltip = document.querySelector('.email-copy-tooltip');

  if (emailBtn) {
    emailBtn.addEventListener('click', () => {
      const email = 'md.sharik5012@gmail.com';
      navigator.clipboard.writeText(email).then(() => {
        if (emailTooltip) {
          emailTooltip.classList.add('active');
          setTimeout(() => {
            emailTooltip.classList.remove('active');
          }, 2400);
        }
        if (window.mascot) {
          window.mascot.playPopSound();
          window.mascot.say("Copied! Talk soon. ✉️", 2500);
        }
      });
    });
  }

  // 2. Modals: "Do a trick" and "Dress me up"
  const trickModal = document.getElementById('modal-tricks');
  const wardrobeModal = document.getElementById('modal-wardrobe');
  const projectModal = document.getElementById('modal-project');

  const btnOpenTricks = document.getElementById('btn-open-tricks');
  const btnOpenWardrobe = document.getElementById('btn-open-wardrobe');
  const btnResetTour = document.getElementById('btn-reset-tour');

  const closeButtons = document.querySelectorAll('.modal-close, .modal-overlay');

  if (btnOpenTricks) {
    btnOpenTricks.addEventListener('click', () => {
      trickModal.classList.add('open');
      if (window.mascot) window.mascot.playPopSound();
    });
  }

  if (btnOpenWardrobe) {
    btnOpenWardrobe.addEventListener('click', () => {
      wardrobeModal.classList.add('open');
      if (window.mascot) window.mascot.playPopSound();
    });
  }

  if (btnResetTour) {
    btnResetTour.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (window.mascot) {
        window.mascot.hasDraggedOnce = false;
        window.mascot.say("Tour reset! Welcome back to the top!", 3000);
      }
    });
  }

  closeButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-overlay') || e.target.classList.contains('modal-close')) {
        document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('open'));
      }
    });
  });

  // Trick Action Buttons
  document.querySelectorAll('.trick-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const trick = btn.getAttribute('data-trick');
      if (window.mascot) {
        window.mascot.doTrick(trick);
      }
      trickModal.classList.remove('open');
    });
  });

  // Wardrobe Outfit Buttons
  document.querySelectorAll('.wardrobe-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.wardrobe-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const outfit = btn.getAttribute('data-outfit');
      if (window.mascot) {
        window.mascot.setOutfit(outfit);
      }
      wardrobeModal.classList.remove('open');
    });
  });

  // 3. Project Filter Tabs in #work
  const filterBtns = document.querySelectorAll('.filter-btn');
  const workRows = document.querySelectorAll('.work-row');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter');

      workRows.forEach(row => {
        const cat = row.getAttribute('data-category');
        if (filter === 'all' || cat.includes(filter)) {
          row.style.display = 'grid';
        } else {
          row.style.display = 'none';
        }
      });
    });
  });

  // 4. Project Detail Modal Trigger
  workRows.forEach(row => {
    row.addEventListener('click', () => {
      const key = row.getAttribute('data-project');
      const data = projectDetails[key];
      if (!data) return;

      document.getElementById('pm-title').textContent = data.title;
      document.getElementById('pm-company').textContent = data.company;
      document.getElementById('pm-period').textContent = data.period;

      const tagsContainer = document.getElementById('pm-tags');
      tagsContainer.innerHTML = '';
      data.tags.forEach(t => {
        const span = document.createElement('span');
        span.className = 'tag-badge';
        span.style.color = '#0b0b0c';
        span.style.background = '#e2e8f0';
        span.style.border = '1px solid #cbd5e1';
        span.textContent = t;
        tagsContainer.appendChild(span);
      });

      const bulletsList = document.getElementById('pm-bullets');
      bulletsList.innerHTML = '';
      data.bullets.forEach(b => {
        const li = document.createElement('li');
        li.textContent = b;
        bulletsList.appendChild(li);
      });

      projectModal.classList.add('open');
      if (window.mascot) {
        window.mascot.playPopSound();
        window.mascot.say(`Viewing ${data.title}!`, 2000);
      }
    });
  });

});

