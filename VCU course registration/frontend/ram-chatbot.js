// ============================================================
// Ram — VCU Virtual Assistant
// Self-contained: injects its own CSS + HTML into any page.
// Usage: <script src="ram-chatbot.js"></script> before </body>
// Conversation history persists across pages via localStorage.
// ============================================================

(function () {
  const RAM_API     = 'http://13.217.196.158:3000/ai/chat';
  const HISTORY_KEY = 'ram_chat_history';
  const SYSTEM      = `You are Ram, VCU's friendly virtual assistant for the Summer 2026 Course Registration Portal. Help students with questions about registering for courses, finding available sessions, deadlines, and how to use the portal. Be warm, concise, and helpful. Keep answers to 2–3 sentences. Key facts: registration closes May 15 2026, students log in with their VCU student ID at login.html, course search is at course.html, instructors log in at instructor-login.html.`;

  // Prevent double-loading if somehow included twice
  if (document.getElementById('ram-fab')) return;

  // ── Inject CSS ──────────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    #ram-fab {
      position: fixed; bottom: 72px; right: 28px; z-index: 9000;
      width: 62px; height: 62px; border-radius: 50%;
      background: #0D0D0D; border: 2px solid #C9A84C;
      cursor: pointer; box-shadow: 0 4px 20px rgba(0,0,0,0.30);
      transition: transform 0.15s, box-shadow 0.15s;
      padding: 0; display: flex; align-items: center; justify-content: center;
    }
    #ram-fab:hover { transform: scale(1.06); box-shadow: 0 6px 28px rgba(0,0,0,0.40); }
    #ram-fab .ram-fab-logo { display: flex; align-items: center; justify-content: center; }
    #ram-fab .ram-fab-logo img { width: 42px; height: 42px; object-fit: contain; }
    #ram-fab .ram-fab-x { display: none; color: #C9A84C; font-size: 26px; font-weight: 300; line-height: 1; }
    #ram-fab.open .ram-fab-logo { display: none; }
    #ram-fab.open .ram-fab-x { display: flex; }

    #ram-panel {
      position: fixed; bottom: 148px; right: 28px; z-index: 9001;
      width: 340px; background: #fff;
      border: 1px solid rgba(0,0,0,0.10); border-radius: 10px;
      box-shadow: 0 12px 48px rgba(0,0,0,0.18);
      font-family: 'DM Sans', sans-serif;
      transform: scale(0.92) translateY(16px); opacity: 0; pointer-events: none;
      transition: transform 0.2s cubic-bezier(.22,.68,0,1.2), opacity 0.18s;
      display: flex; flex-direction: column; overflow: hidden; max-height: 580px;
    }
    #ram-panel.open { transform: scale(1) translateY(0); opacity: 1; pointer-events: all; }

    #ram-header {
      background: #0D0D0D; border-radius: 10px 10px 0 0;
      padding: 14px 16px; display: flex; align-items: center; gap: 12px; flex-shrink: 0;
    }
    .ram-avatar {
      width: 38px; height: 38px; border-radius: 50%; border: 1.5px solid #333;
      overflow: hidden; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .ram-avatar img { width: 28px; height: 28px; object-fit: contain; }
    .ram-hd-info { flex: 1; }
    .ram-hd-name { font-size: 15px; font-weight: 500; color: #fff; }
    .ram-hd-sub  { font-size: 11px; color: #C9A84C; letter-spacing: 0.05em; margin-top: 2px; }
    .ram-online-dot { width: 8px; height: 8px; border-radius: 50%; background: #4CAF50; flex-shrink: 0; }

    #ram-messages {
      overflow-y: auto; padding: 14px 14px 8px;
      display: flex; flex-direction: column; gap: 10px;
      min-height: 130px; max-height: 260px; flex-shrink: 0;
    }
    #ram-messages::-webkit-scrollbar { width: 3px; }
    #ram-messages::-webkit-scrollbar-thumb { background: #ddd; border-radius: 2px; }

    .ram-msg-row { display: flex; gap: 8px; align-items: flex-end; }
    .ram-msg-row.bot  { justify-content: flex-start; }
    .ram-msg-row.user { justify-content: flex-end; }
    .ram-msg-avt {
      width: 26px; height: 26px; border-radius: 50%; background: #0D0D0D;
      flex-shrink: 0; display: flex; align-items: center; justify-content: center; overflow: hidden;
    }
    .ram-msg-avt img { width: 18px; height: 18px; object-fit: contain; }
    .ram-bubble {
      max-width: 82%; padding: 9px 13px;
      font-size: 13px; line-height: 1.5; word-break: break-word;
    }
    .ram-msg-row.bot  .ram-bubble { background: #F0EEE8; color: #1A1A1A; border-radius: 4px 14px 14px 14px; }
    .ram-msg-row.user .ram-bubble { background: #0D0D0D; color: #fff;    border-radius: 14px 14px 4px 14px; }

    .ram-typing-dots {
      display: flex; gap: 4px; align-items: center;
      padding: 10px 13px; background: #F0EEE8; border-radius: 4px 14px 14px 14px;
    }
    .ram-typing-dots span {
      width: 6px; height: 6px; border-radius: 50%; background: #999;
      animation: ramDot 1.1s infinite;
    }
    .ram-typing-dots span:nth-child(2) { animation-delay: 0.18s; }
    .ram-typing-dots span:nth-child(3) { animation-delay: 0.36s; }
    @keyframes ramDot {
      0%,60%,100% { transform: translateY(0); opacity: 0.5; }
      30%          { transform: translateY(-5px); opacity: 1; }
    }

    #ram-qr { padding: 4px 14px 12px; display: flex; flex-direction: column; gap: 7px; flex-shrink: 0; }
    .ram-qr-btn {
      text-align: left; padding: 9px 13px;
      border: 1px solid rgba(201,168,76,0.4); border-radius: 6px;
      background: #fff; cursor: pointer;
      font-family: 'DM Sans', sans-serif; font-size: 13px; color: #1A1A1A;
      transition: background 0.12s, border-color 0.15s; line-height: 1.4;
    }
    .ram-qr-btn:hover { background: #F7F4EF; border-color: #C9A84C; }

    #ram-input-row {
      border-top: 1px solid rgba(0,0,0,0.08);
      padding: 10px 12px; display: flex; align-items: center; gap: 8px; flex-shrink: 0;
    }
    #ram-input {
      flex: 1; border: none; outline: none; background: transparent;
      font-family: 'DM Sans', sans-serif; font-size: 13px; color: #1A1A1A;
    }
    #ram-input::placeholder { color: #bbb; }
    #ram-send {
      width: 32px; height: 32px; border-radius: 50%;
      background: #0D0D0D; border: none; cursor: pointer; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center; transition: background 0.15s;
    }
    #ram-send:hover    { background: #1f1f1f; }
    #ram-send:disabled { opacity: 0.35; cursor: default; }
    #ram-send svg { fill: #C9A84C; }

    #ram-footer {
      border-top: 1px solid rgba(0,0,0,0.06);
      padding: 7px 14px; font-size: 11px; color: #999;
      text-align: center; background: #FAFAF9; flex-shrink: 0;
    }
    #ram-footer strong { color: #C9A84C; }

    @media (max-width: 480px) {
      #ram-panel { width: calc(100vw - 32px); right: 16px; }
      #ram-fab   { right: 16px; }
    }
  `;
  document.head.appendChild(style);

  // ── Inject HTML ─────────────────────────────────────────────
  document.body.insertAdjacentHTML('beforeend', `
    <button id="ram-fab" title="Chat with Ram" aria-label="Open Ram assistant">
      <span class="ram-fab-logo"><img src="VCU_Athletics_Logo.svg.png" alt="VCU" /></span>
      <span class="ram-fab-x">&#x2715;</span>
    </button>

    <div id="ram-panel" role="dialog" aria-label="Ram virtual assistant">
      <div id="ram-header">
        <div class="ram-avatar"><img src="VCU_Athletics_Logo.svg.png" alt="Ram" /></div>
        <div class="ram-hd-info">
          <div class="ram-hd-name">Ram</div>
          <div class="ram-hd-sub">VCU Virtual Assistant</div>
        </div>
        <div class="ram-online-dot"></div>
      </div>

      <div id="ram-messages"></div>

      <div id="ram-qr">
        <button class="ram-qr-btn">When does Summer 2026 registration close?</button>
        <button class="ram-qr-btn">What courses are available this summer?</button>
        <button class="ram-qr-btn">How do I register for a course?</button>
        <button class="ram-qr-btn">I have questions about my schedule.</button>
      </div>

      <div id="ram-input-row">
        <input id="ram-input" type="text" placeholder="Write a reply..." autocomplete="off" />
        <button id="ram-send" aria-label="Send">
          <svg width="14" height="14" viewBox="0 0 24 24"><path d="M2 21l21-9L2 3v7l15 2-15 2z"/></svg>
        </button>
      </div>

      <div id="ram-footer">Registration closes <strong>May 15, 2026</strong></div>
    </div>
  `);

  // ── State ───────────────────────────────────────────────────
  let history   = [];
  let isOpen    = false;
  let isLoading = false;

  const fab   = document.getElementById('ram-fab');
  const panel = document.getElementById('ram-panel');
  const msgs  = document.getElementById('ram-messages');
  const qr    = document.getElementById('ram-qr');
  const input = document.getElementById('ram-input');
  const send  = document.getElementById('ram-send');

  // ── Restore history from sessionStorage (resets when browser closes) ──
  try {
    const saved = sessionStorage.getItem(HISTORY_KEY);
    if (saved) history = JSON.parse(saved);
  } catch (e) {}

  if (history.length === 0) {
    // First visit — show greeting and quick replies
    addBubble('bot', '👋 Hi! I\'m Ram, your VCU registration assistant. How can I help you today?');
  } else {
    // Returning — replay conversation silently, hide quick replies
    qr.style.display = 'none';
    history.forEach(m => addBubble(m.role === 'user' ? 'user' : 'bot', m.content, false));
  }

  // ── Toggle ──────────────────────────────────────────────────
  fab.addEventListener('click', e => {
    e.stopPropagation();
    isOpen = !isOpen;
    panel.classList.toggle('open', isOpen);
    fab.classList.toggle('open', isOpen);
    if (isOpen) { msgs.scrollTop = msgs.scrollHeight; input.focus(); }
  });

  document.addEventListener('click', e => {
    if (isOpen && !panel.contains(e.target) && e.target !== fab) {
      isOpen = false;
      panel.classList.remove('open');
      fab.classList.remove('open');
    }
  });

  // ── Quick replies ───────────────────────────────────────────
  qr.querySelectorAll('.ram-qr-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const text = btn.textContent.trim();
      qr.style.display = 'none';
      sendMsg(text);
    });
  });

  // ── Input ───────────────────────────────────────────────────
  send.addEventListener('click', () => {
    const text = input.value.trim();
    if (text) { qr.style.display = 'none'; sendMsg(text); input.value = ''; }
  });
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const text = input.value.trim();
      if (text) { qr.style.display = 'none'; sendMsg(text); input.value = ''; }
    }
  });

  // ── Core ────────────────────────────────────────────────────
  function sendMsg(text) {
    if (isLoading) return;
    addBubble('user', text);
    history.push({ role: 'user', content: text });
    saveHistory();
    callAI();
  }

  async function callAI() {
    isLoading = true;
    send.disabled = true;
    const typingRow = addTyping();

    try {
      const res   = await fetch(RAM_API, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ system: SYSTEM, messages: history })
      });
      const data  = await res.json();
      const reply = data.content?.[0]?.text
                 || data.reply
                 || data.message
                 || "Sorry, I couldn't get a response. Please try again.";
      history.push({ role: 'assistant', content: reply });
      saveHistory();
      typingRow.remove();
      addBubble('bot', reply);
    } catch (e) {
      typingRow.remove();
      addBubble('bot', "I'm having trouble connecting right now. Please try again shortly.");
    } finally {
      isLoading = false;
      send.disabled = false;
      input.focus();
    }
  }

  function saveHistory() {
    if (history.length > 40) history = history.slice(-40);
    try { sessionStorage.setItem(HISTORY_KEY, JSON.stringify(history)); } catch (e) {}
  }

  // ── UI helpers ──────────────────────────────────────────────
  function addBubble(role, text, animate) {
    const row = document.createElement('div');
    row.className = `ram-msg-row ${role}`;
    if (role === 'bot') {
      row.innerHTML = `<div class="ram-msg-avt"><img src="VCU_Athletics_Logo.svg.png" alt=""/></div><div class="ram-bubble">${esc(text)}</div>`;
    } else {
      row.innerHTML = `<div class="ram-bubble">${esc(text)}</div>`;
    }
    msgs.appendChild(row);
    if (animate !== false) msgs.scrollTop = msgs.scrollHeight;
  }

  function addTyping() {
    const row = document.createElement('div');
    row.className = 'ram-msg-row bot';
    row.innerHTML  = `<div class="ram-msg-avt"><img src="VCU_Athletics_Logo.svg.png" alt=""/></div><div class="ram-typing-dots"><span></span><span></span><span></span></div>`;
    msgs.appendChild(row);
    msgs.scrollTop = msgs.scrollHeight;
    return row;
  }

  function esc(str) {
    return str
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>');
  }
})();
