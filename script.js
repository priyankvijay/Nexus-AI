/* NEXUS AI — script.js
   Utility functions, page effects, and chat behavior */

/* Utility helpers */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const qs = (id) => document.getElementById(id);

/* Navbar scroll styling and mobile menu behavior */
function initNavbar() {
  const navbar = $('.navbar');
  if (!navbar) return;
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  });

  // Mobile hamburger
  const hamburger = $('.hamburger');
  const mobileMenu = $('.mobile-menu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open');
    });
    // Close on link click
    $$('.mobile-menu a').forEach(a =>
      a.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
      })
    );
  }
}

/* Particle animation for the home and about pages */
function initParticles() {
  const canvas = qs('particles-canvas') || document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const COLORS = ['#00d4ff','#7b2fff','#00ffcc','#ff2aff'];

  class Particle {
    constructor() { this.reset(true); }
    reset(init = false) {
      this.x  = Math.random() * W;
      this.y  = init ? Math.random() * H : H + 10;
      this.r  = Math.random() * 1.8 + 0.4;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = -(Math.random() * 0.5 + 0.1);
      this.alpha = Math.random() * 0.6 + 0.2;
      this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.y < -10) this.reset();
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle = this.color;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  for (let i = 0; i < 120; i++) particles.push(new Particle());

  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(loop);
  }
  loop();
}

/* Matrix rain effect used on the chat page */
function initMatrix() {
  const canvas = document.getElementById('matrix-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;
  const cols = [];
  const chars = '01アイウエオカキクケコABCDEFGHIJKLM0101NEXUSAI';

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    const n = Math.floor(W / 16);
    cols.length = 0;
    for (let i = 0; i < n; i++) cols.push(Math.random() * H / 16);
  }
  resize();
  window.addEventListener('resize', resize);

  function draw() {
    ctx.fillStyle = 'rgba(2,4,8,0.04)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#00d4ff';
    ctx.font = '13px Share Tech Mono, monospace';
    cols.forEach((y, i) => {
      const ch = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillText(ch, i * 16, y * 16);
      if (y * 16 > H && Math.random() > 0.975) cols[i] = 0;
      else cols[i] = y + 1;
    });
  }
  setInterval(draw, 60);
}

/* Typing animation for the hero section */
function initTyping() {
  const el = document.getElementById('typing-text');
  if (!el) return;
  const phrases = [
    'Powered by Advanced Neural Networks',
    'Understands Context Deeply',
    'Responds in 20+ Languages',
    'Your Intelligent Companion',
    'Always Learning, Always Evolving',
  ];
  let pi = 0, ci = 0, deleting = false;

  function type() {
    const phrase = phrases[pi];
    if (!deleting) {
      el.textContent = phrase.slice(0, ++ci);
      if (ci === phrase.length) { deleting = true; setTimeout(type, 1800); return; }
    } else {
      el.textContent = phrase.slice(0, --ci);
      if (ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; setTimeout(type, 400); return; }
    }
    setTimeout(type, deleting ? 40 : 70);
  }
  type();
}

/* Animated counters for statistic cards */
function initCounters() {
  const counters = $$('[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const duration = 2000;
      const start = performance.now();

      function update(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = target * eased;
        el.textContent = (Number.isInteger(target) ? Math.round(value).toLocaleString() : value.toFixed(1)) + suffix;
        if (progress < 1) requestAnimationFrame(update);
      }
      requestAnimationFrame(update);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
}

/* Reveal elements when they scroll into view */
function initScrollReveal() {
  const els = $$('.reveal');
  if (!els.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 80);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  els.forEach(el => observer.observe(el));
}

/* FAQ accordion expand/collapse behavior */
function initFaq() {
  $$('.faq-item').forEach(item => {
    const q = item.querySelector('.faq-q');
    if (!q) return;
    q.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      $$('.faq-item.open').forEach(o => o.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });
}

/* Contact form validation and user feedback */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    // Validate each field
    $$('.form-input, .form-textarea', form).forEach(field => {
      const errEl = field.parentElement.querySelector('.form-error');
      if (!field.value.trim()) {
        if (errEl) { errEl.style.display = 'block'; errEl.textContent = 'This field is required.'; }
        valid = false;
      } else if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
        if (errEl) { errEl.style.display = 'block'; errEl.textContent = 'Enter a valid email.'; }
        valid = false;
      } else {
        if (errEl) errEl.style.display = 'none';
      }
    });

    if (valid) {
      const success = form.querySelector('.form-success');
      if (success) { success.style.display = 'block'; }
      form.reset();
      setTimeout(() => { if (success) success.style.display = 'none'; }, 4000);
    }
  });

  // Clear errors on input
  $$('.form-input, .form-textarea', form).forEach(field => {
    field.addEventListener('input', () => {
      const errEl = field.parentElement.querySelector('.form-error');
      if (errEl) errEl.style.display = 'none';
    });
  });
}

/* Chatbot response data and trigger phrases */

// Knowledge base
const BOT_RESPONSES = {
  greetings: {
    patterns: ['hello','hi','hey','hiya','good morning','good evening','sup','yo','howdy','helo'],
    replies: [
      "Hello! 👋 I'm NEXUS AI — your intelligent assistant. How can I elevate your day?",
      "Hey there! Great to see you. What would you like to explore today?",
      "Greetings, human. 🤖 NEXUS systems online. How may I assist you?"
    ]
  },
  whoami: {
    patterns: ['who are you','what are you','tell me about yourself','introduce yourself','your name','what is nexus'],
    replies: [
      "I'm **NEXUS AI** — an advanced conversational intelligence built to assist, inform, and inspire. I process language with neural precision and learn from every interaction. My creators designed me to be your ultimate digital companion. 🌐",
      "I'm NEXUS AI, a next-generation artificial intelligence. Think of me as a mind that never sleeps — always ready to answer questions, spark ideas, or just have a great conversation. ⚡"
    ]
  },
  javascript: {
    patterns: ['what is javascript','explain javascript','tell me about javascript','js','javascript'],
    replies: [
      "**JavaScript** is the world's most popular programming language! 🚀\n\nIt's a lightweight, interpreted scripting language that runs in browsers and servers (via Node.js). Key features:\n• **Dynamic typing** — variables adapt to any data type\n• **Event-driven** — reacts to user interactions\n• **Asynchronous** — handles tasks without blocking\n• **Versatile** — front-end, back-end, mobile, AI\n\nUsed by 98% of all websites, JS powers everything from simple buttons to complex AI systems like me! 💻"
    ]
  },
  joke: {
    patterns: ['joke','funny','make me laugh','tell me a joke','humor','comedy'],
    replies: [
      "Why do programmers prefer dark mode? 🌑\nBecause light attracts bugs! 🐛",
      "I told my neural network a joke. It said it needed more training data. 😅",
      "Why was the AI bad at relationships? It kept confusing 'love' with 'loss' during backpropagation! 💔",
      "What do you call an AI that sings? Algo-rhythm! 🎵",
      "Why don't scientists trust atoms? Because they make up everything — unlike me, who only uses clean data! ⚛️"
    ]
  },
  creator: {
    patterns: ['who created you','who made you','who built you','your creator','who developed you','origin'],
    replies: [
      "I was brought to life by the brilliant engineer **Priyank Vijay** — a talented AI researcher, ML engineers and visionary designer who believe in the power of intelligent conversation. Think of him as my digital parent! 🧑‍💻",
      "NEXUS AI was created by the Er. Priyank Vijay . He trained me on vast datasets and fine-tuned me to be as helpful, accurate, and conversational as possible. 🔬"
    ]
  },
  capabilities: {
    patterns: ['what can you do','your capabilities','features','abilities','help me','how can you help','what do you know'],
    replies: [
      "Here's what I can do for you! ⚡\n\n🧠 **Answer Questions** — Science, tech, history, philosophy\n💻 **Explain Code** — JavaScript, Python, HTML, CSS & more\n📝 **Write Content** — Essays, emails, stories, summaries\n🌍 **Translate** — Multiple languages supported\n😄 **Tell Jokes** — Keep things light!\n💡 **Brainstorm** — Creative ideas on demand\n🔍 **Research** — Summarize complex topics\n\nJust ask me anything — I'm always learning! 🚀"
    ]
  },
  ai: {
    patterns: ['explain ai','what is ai','artificial intelligence','machine learning','how does ai work','deep learning','neural network'],
    replies: [
      "**Artificial Intelligence (AI)** is the simulation of human intelligence by machines! 🤖\n\nHere's the breakdown:\n• **Machine Learning** — Systems that learn from data patterns\n• **Deep Learning** — Neural networks with many layers (like my brain!)\n• **NLP** — Natural Language Processing — how I understand you\n• **Computer Vision** — AI that sees and interprets images\n• **Reinforcement Learning** — AI that learns by trial & reward\n\nAt its core, AI transforms raw data into intelligent decisions. The future is here — and you're talking to it! 🌐"
    ]
  },
  motivation: {
    patterns: ['motivate me','motivation','inspire me','quote','inspiration','feel down','i need motivation','encourage me'],
    replies: [
      "Here's something for your soul 🌟\n\n*\"The only way to do great work is to love what you do.\"*\n— **Steve Jobs**\n\nYou're capable of more than you know. Keep pushing forward! 💪",
      "✨ *\"In the middle of difficulty lies opportunity.\"* — Albert Einstein\n\nEvery challenge you face is shaping you into something extraordinary. Don't stop now! 🚀",
      "🔥 *\"Believe you can and you're halfway there.\"* — Theodore Roosevelt\n\nYour potential is limitless. The only limits are the ones you place on yourself! ⚡",
      "💫 *\"The future belongs to those who believe in the beauty of their dreams.\"* — Eleanor Roosevelt\n\nYou've got this. One step at a time leads to extraordinary places! 🌈"
    ]
  },
  weather: {
    patterns: ['weather','temperature','forecast','rain','sunny'],
    replies: [
      "I'm a language AI, so I don't have access to real-time weather data! 🌤️ Try checking apps like **Weather.com**, **AccuWeather**, or just ask your device's voice assistant for accurate forecasts.",
    ]
  },
  time: {
    patterns: ['what time is it','current time','today','what day','date'],
    replies: [
      () => `Right now it's **${new Date().toLocaleTimeString()}** on **${new Date().toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}**! ⏰`
    ]
  },
  bye: {
    patterns: ['bye','goodbye','see you','cya','farewell','exit','quit','take care'],
    replies: [
      "Goodbye! It was great talking with you. Come back anytime! 👋✨",
      "Until next time! Stay curious and keep exploring. 🚀",
      "Farewell, human! NEXUS systems standing by for your return. 🤖"
    ]
  },
  thanks: {
    patterns: ['thank you','thanks','ty','thx','appreciate it','cheers'],
    replies: [
      "You're very welcome! Happy to help anytime 😊",
      "Anytime! That's what I'm here for. ✨",
      "My pleasure! Is there anything else I can assist you with? 🚀"
    ]
  },
  default: {
    replies: [
      "Hmm, that's an interesting one! 🤔 I'm still learning, but I'll give it my best shot. Could you rephrase or ask something specific? I'm great at AI, coding, science, jokes, and general knowledge!",
      "I don't have a perfect answer for that yet, but I'm evolving constantly! Try asking me about AI, JavaScript, motivation, or just say 'what can you do?' ⚡",
      "Great question — my knowledge base is expanding! For now, try asking about AI, programming, or give me a topic to explain. 🧠"
    ]
  }
};

function getBotResponse(userMsg) {
  const msg = userMsg.toLowerCase().trim();

  for (const [, category] of Object.entries(BOT_RESPONSES)) {
    if (!category.patterns) continue;
    const matched = category.patterns.some(p => msg.includes(p));
    if (matched) {
      const replies = category.replies;
      const reply = replies[Math.floor(Math.random() * replies.length)];
      return typeof reply === 'function' ? reply() : reply;
    }
  }
  const defaults = BOT_RESPONSES.default.replies;
  return defaults[Math.floor(Math.random() * defaults.length)];
}

/* Chat interface logic */
let chatHistory = [];
let isTyping = false;

function initChat() {
  const messagesEl = document.getElementById('chat-messages');
  const welcomeEl  = document.getElementById('chat-welcome');
  const inputEl    = document.getElementById('chat-input');
  const sendBtn    = document.getElementById('send-btn');
  const voiceBtn   = document.getElementById('voice-btn');
  const clearBtn   = document.getElementById('clear-btn');
  const downloadBtn = document.getElementById('download-btn');
  const themeBtn   = document.getElementById('theme-btn');
  const newChatBtn = document.getElementById('new-chat-btn');
  const historyList = document.getElementById('history-list');

  if (!messagesEl) return; // Not on chat page

  // Load saved chat history from localStorage
  loadHistory();

  // Auto-resize textarea
  if (inputEl) {
    inputEl.addEventListener('input', () => {
      inputEl.style.height = 'auto';
      inputEl.style.height = Math.min(inputEl.scrollHeight, 160) + 'px';
    });

    // Send on Enter (not Shift+Enter)
    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  }

  if (sendBtn) sendBtn.addEventListener('click', sendMessage);

  // Voice input
  if (voiceBtn) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) {
      const recognition = new SR();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      voiceBtn.addEventListener('click', () => {
        if (voiceBtn.classList.contains('listening')) {
          recognition.stop();
          voiceBtn.classList.remove('listening');
          voiceBtn.title = 'Voice input';
        } else {
          recognition.start();
          voiceBtn.classList.add('listening');
          voiceBtn.title = 'Listening...';
        }
      });

      recognition.addEventListener('result', (e) => {
        if (inputEl) inputEl.value = e.results[0][0].transcript;
        voiceBtn.classList.remove('listening');
        sendMessage();
      });
      recognition.addEventListener('end', () => {
        voiceBtn.classList.remove('listening');
      });
    } else {
      voiceBtn.title = 'Voice not supported in this browser';
      voiceBtn.style.opacity = '0.4';
    }
  }

  // Clear chat
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      chatHistory = [];
      saveHistory();
      messagesEl.innerHTML = '';
      if (welcomeEl) welcomeEl.style.display = 'flex';
    });
  }

  // Download chat
  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      if (!chatHistory.length) return;
      const text = chatHistory.map(m => `[${m.time}] ${m.role === 'user' ? 'You' : 'NEXUS AI'}: ${m.text}`).join('\n\n');
      const blob = new Blob([text], { type: 'text/plain' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url; a.download = 'nexus-chat.txt'; a.click();
      URL.revokeObjectURL(url);
    });
  }

  // Theme toggle
  if (themeBtn) {
    const isDark = localStorage.getItem('nexus-theme') !== 'light';
    if (!isDark) document.body.classList.add('light-mode');

    themeBtn.addEventListener('click', () => {
      document.body.classList.toggle('light-mode');
      const light = document.body.classList.contains('light-mode');
      localStorage.setItem('nexus-theme', light ? 'light' : 'dark');
      themeBtn.textContent = light ? '🌙' : '☀️';
    });
    themeBtn.textContent = document.body.classList.contains('light-mode') ? '🌙' : '☀️';
  }

  // New chat
  if (newChatBtn) {
    newChatBtn.addEventListener('click', () => {
      chatHistory = [];
      saveHistory();
      messagesEl.innerHTML = '';
      if (welcomeEl) welcomeEl.style.display = 'flex';
    });
  }

  // Welcome chips
  $$('.welcome-chip, .hint-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      if (inputEl) inputEl.value = chip.textContent;
      sendMessage();
    });
  });

  // Sidebar history items
  if (historyList) {
    historyList.addEventListener('click', (e) => {
      const item = e.target.closest('.history-item[data-session]');
      if (!item) return;
      $$('.history-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
    });
  }

  function sendMessage() {
    if (!inputEl || isTyping) return;
    const text = inputEl.value.trim();
    if (!text) return;

    // Hide welcome
    if (welcomeEl) welcomeEl.style.display = 'none';

    appendMessage('user', text);
    inputEl.value = '';
    inputEl.style.height = 'auto';
    showTyping();

    const delay = 900 + Math.random() * 800;
    setTimeout(() => {
      removeTyping();
      const reply = getBotResponse(text);
      appendMessage('ai', reply);
    }, delay);
  }

  function appendMessage(role, text) {
    const time = new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
    chatHistory.push({ role, text, time });
    saveHistory();

    const msg = document.createElement('div');
    msg.className = `message ${role}`;

    const avatar = role === 'ai' ? '🤖' : '👤';
    const bubble = formatText(text);

    msg.innerHTML = `
      <div class="msg-avatar">${avatar}</div>
      <div class="msg-body">
        <div class="msg-bubble">${bubble}</div>
        <span class="msg-time">${time}</span>
      </div>
    `;
    messagesEl.appendChild(msg);
    scrollToBottom();

    // Update sidebar
    updateHistoryList();
  }

  function formatText(text) {
    // Convert markdown-like bold and italics to HTML
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  }

  function showTyping() {
    isTyping = true;
    const typing = document.createElement('div');
    typing.className = 'message ai';
    typing.id = 'typing-msg';
    typing.innerHTML = `
      <div class="msg-avatar">🤖</div>
      <div class="msg-body">
        <div class="typing-indicator">
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
        </div>
      </div>
    `;
    messagesEl.appendChild(typing);
    scrollToBottom();
  }

  function removeTyping() {
    isTyping = false;
    const el = document.getElementById('typing-msg');
    if (el) el.remove();
  }

  function scrollToBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function saveHistory() {
    try { localStorage.setItem('nexus-chat-history', JSON.stringify(chatHistory)); } catch(e) {}
  }

  function loadHistory() {
    try {
      const stored = localStorage.getItem('nexus-chat-history');
      if (!stored) return;
      chatHistory = JSON.parse(stored);
      if (!chatHistory.length) return;

      if (welcomeEl) welcomeEl.style.display = 'none';
      chatHistory.forEach(({ role, text, time }) => {
        const msg = document.createElement('div');
        msg.className = `message ${role}`;
        const avatar = role === 'ai' ? '🤖' : '👤';
        const bubble = text.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').replace(/\*(.*?)\*/g,'<em>$1</em>').replace(/\n/g,'<br>');
        msg.innerHTML = `<div class="msg-avatar">${avatar}</div><div class="msg-body"><div class="msg-bubble">${bubble}</div><span class="msg-time">${time}</span></div>`;
        messagesEl.appendChild(msg);
      });
      messagesEl.scrollTop = messagesEl.scrollHeight;
      updateHistoryList();
    } catch(e) { chatHistory = []; }
  }

  function updateHistoryList() {
    if (!historyList) return;
    const userMsgs = chatHistory.filter(m => m.role === 'user');
    if (!userMsgs.length) return;

    const last = userMsgs[userMsgs.length - 1].text.slice(0, 30);
    // Check if already added
    const existing = historyList.querySelector('[data-session="current"]');
    if (existing) { existing.textContent = '💬 ' + last + (last.length >= 30 ? '…' : ''); return; }

    const item = document.createElement('div');
    item.className = 'history-item active';
    item.dataset.session = 'current';
    item.textContent = '💬 ' + last + (last.length >= 30 ? '…' : '');
    $$('.history-item').forEach(i => i.classList.remove('active'));
    historyList.prepend(item);
  }
}

/* Mouse glow effect on the chat page */
function initMouseGlow() {
  const glow = document.getElementById('mouse-glow');
  if (!glow) return;
  document.addEventListener('mousemove', (e) => {
    glow.style.left = e.clientX + 'px';
    glow.style.top  = e.clientY + 'px';
  });
}

/* Initialize page scripts after the DOM is ready */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initParticles();
  initMatrix();
  initTyping();
  initCounters();
  initScrollReveal();
  initFaq();
  initContactForm();
  initChat();
  initMouseGlow();

  // Restore theme preference
  if (localStorage.getItem('nexus-theme') === 'light') {
    document.body.classList.add('light-mode');
  }
});
