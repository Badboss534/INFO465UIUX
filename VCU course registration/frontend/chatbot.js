// ============================================================
// VCU Registration AI Chatbot
// Drop this <script src="chatbot.js"></script> at the bottom
// of registration.html (before </body>) and make sure the page
// already has currentUser and enrolledSessions in scope.
// ============================================================

(function () {
  const API_LOCAL = 'http://13.217.196.158:3000';

  // ── Inject styles ──────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');

    #vcuChat-fab {
      position: fixed; bottom: 28px; right: 28px; z-index: 900;
      width: 54px; height: 54px; border-radius: 50%;
      background: #C9A84C; border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 20px rgba(0,0,0,0.22);
      transition: background 0.15s, transform 0.15s;
    }
    #vcuChat-fab:hover { background: #E8C97A; transform: scale(1.06); }
    #vcuChat-fab svg { width: 24px; height: 24px; }

    #vcuChat-panel {
      position: fixed; bottom: 94px; right: 28px; z-index: 901;
      width: 380px; max-height: 600px;
      background: #fff; border: 1px solid rgba(0,0,0,0.10);
      border-radius: 8px; box-shadow: 0 12px 48px rgba(0,0,0,0.16);
      display: flex; flex-direction: column;
      transform: scale(0.92) translateY(16px); opacity: 0;
      pointer-events: none;
      transition: transform 0.2s cubic-bezier(.22,.68,0,1.2), opacity 0.18s;
      font-family: 'DM Sans', sans-serif;
    }
    #vcuChat-panel.open {
      transform: scale(1) translateY(0); opacity: 1; pointer-events: all;
    }

    #vcuChat-header {
      background: #0D0D0D; border-radius: 8px 8px 0 0;
      padding: 14px 16px; display: flex; align-items: center; gap: 10px;
    }
    #vcuChat-header .avatar {
      width: 32px; height: 32px; border-radius: 50%;
      background: #C9A84C; display: flex; align-items: center; justify-content: center;
      font-size: 14px; font-weight: 500; color: #0D0D0D; flex-shrink: 0;
    }
    #vcuChat-header .info { flex: 1; }
    #vcuChat-header .name { font-size: 14px; font-weight: 500; color: #fff; }
    #vcuChat-header .status { font-size: 11px; color: #C9A84C; letter-spacing: 0.06em; }
    #vcuChat-close {
      background: none; border: none; cursor: pointer; color: #555; font-size: 20px; line-height: 1;
      transition: color 0.15s;
    }
    #vcuChat-close:hover { color: #fff; }

    #vcuChat-messages {
      flex: 1; overflow-y: auto; padding: 16px; display: flex;
      flex-direction: column; gap: 12px; min-height: 300px; max-height: 420px;
    }
    #vcuChat-messages::-webkit-scrollbar { width: 4px; }
    #vcuChat-messages::-webkit-scrollbar-track { background: transparent; }
    #vcuChat-messages::-webkit-scrollbar-thumb { background: #ddd; border-radius: 2px; }

    .chat-bubble {
      max-width: 88%; font-size: 13px; line-height: 1.55;
      padding: 10px 13px; border-radius: 12px; word-break: break-word;
      animation: bubbleIn 0.18s ease;
    }
    @keyframes bubbleIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:none; } }

    .chat-bubble.ai {
      background: #F7F4EF; color: #1A1A1A; border-radius: 4px 12px 12px 12px;
      border: 1px solid rgba(0,0,0,0.07); align-self: flex-start;
    }
    .chat-bubble.user {
      background: #0D0D0D; color: #fff;
      border-radius: 12px 4px 12px 12px; align-self: flex-end;
    }
    .chat-bubble.ai .bubble-label {
      font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase;
      color: #C9A84C; margin-bottom: 4px; font-weight: 500;
    }

    .chat-chips { display: flex; flex-wrap: wrap; gap: 6px; align-self: flex-start; margin-top: -4px; }
    .chat-chip {
      font-size: 12px; padding: 5px 12px; border: 1px solid #C9A84C;
      border-radius: 999px; color: #7A6230; background: #fff;
      cursor: pointer; transition: background 0.12s, color 0.12s; font-family: 'DM Sans', sans-serif;
    }
    .chat-chip:hover { background: #C9A84C; color: #0D0D0D; }

    .chat-typing {
      display: flex; align-items: center; gap: 4px;
      padding: 10px 13px; background: #F7F4EF;
      border: 1px solid rgba(0,0,0,0.07);
      border-radius: 4px 12px 12px 12px; align-self: flex-start; width: fit-content;
    }
    .chat-typing span {
      width: 6px; height: 6px; border-radius: 50%; background: #C9A84C;
      animation: typing 1.2s infinite;
    }
    .chat-typing span:nth-child(2) { animation-delay: 0.2s; }
    .chat-typing span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes typing { 0%,80%,100%{transform:scale(1);opacity:0.4} 40%{transform:scale(1.3);opacity:1} }

    #vcuChat-footer {
      border-top: 1px solid rgba(0,0,0,0.08); padding: 10px 12px;
      display: flex; gap: 8px; align-items: flex-end;
    }
    #vcuChat-input {
      flex: 1; border: 1px solid #DDD; border-radius: 6px; padding: 9px 12px;
      font-size: 13px; font-family: 'DM Sans', sans-serif; resize: none;
      outline: none; max-height: 100px; min-height: 38px; line-height: 1.4;
      transition: border-color 0.15s;
    }
    #vcuChat-input:focus { border-color: #C9A84C; }
    #vcuChat-send {
      width: 36px; height: 36px; border-radius: 6px; border: none;
      background: #0D0D0D; color: #C9A84C; cursor: pointer; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      transition: background 0.15s;
    }
    #vcuChat-send:hover { background: #1f1f1f; }
    #vcuChat-send:disabled { opacity: 0.4; cursor: default; }

    #vcuChat-panel .course-suggestion {
      background: #F7F4EF; border: 1px solid rgba(201,168,76,0.3);
      border-radius: 6px; padding: 10px 12px; margin-top: 6px; font-size: 12px;
    }
    #vcuChat-panel .course-suggestion .cs-title { font-weight: 500; font-size: 13px; color: #1A1A1A; }
    #vcuChat-panel .course-suggestion .cs-meta  { color: #6B6459; margin-top: 2px; }
    #vcuChat-panel .course-suggestion .cs-actions { display:flex; gap:6px; margin-top:8px; }
    #vcuChat-panel .cs-add {
      font-size: 12px; padding: 4px 14px; background: #EAF3DE;
      border: 1px solid #C0DD97; border-radius: 3px; color: #3B6D11;
      cursor: pointer; font-family: 'DM Sans', sans-serif;
    }
    #vcuChat-panel .cs-add:hover { background: #C0DD97; }
    #vcuChat-panel .cs-skip {
      font-size: 12px; padding: 4px 14px; background: transparent;
      border: 1px solid #DDD; border-radius: 3px; color: #6B6459;
      cursor: pointer; font-family: 'DM Sans', sans-serif;
    }

    @media (max-width: 480px) {
      #vcuChat-panel { width: calc(100vw - 32px); right: 16px; bottom: 80px; }
      #vcuChat-fab   { right: 16px; bottom: 16px; }
    }
  `;
  document.head.appendChild(style);

  // ── Inject HTML ────────────────────────────────────────────
  document.body.insertAdjacentHTML('beforeend', `
    <button id="vcuChat-fab" title="Schedule Assistant" aria-label="Open scheduling assistant">
      <svg viewBox="0 0 24 24" fill="none" stroke="#0D0D0D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    </button>

    <div id="vcuChat-panel" role="dialog" aria-label="VCU Schedule Assistant">
      <div id="vcuChat-header">
        <div class="avatar">AI</div>
        <div class="info">
          <div class="name">VCU Schedule Assistant</div>
          <div class="status">Summer 2026 &nbsp;·&nbsp; Powered by Claude</div>
        </div>
        <button id="vcuChat-close" aria-label="Close chat">×</button>
      </div>
      <div id="vcuChat-messages"></div>
      <div id="vcuChat-footer">
        <textarea id="vcuChat-input" rows="1" placeholder="Ask about courses, schedules…"></textarea>
        <button id="vcuChat-send" aria-label="Send">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
    </div>
  `);

  // ── State ──────────────────────────────────────────────────
  let isOpen       = false;
  let isLoading    = false;
  let allSessions  = [];
  let chatHistory  = [];
  let pendingSuggestion = null;

  const fab      = document.getElementById('vcuChat-fab');
  const panel    = document.getElementById('vcuChat-panel');
  const closeBtn = document.getElementById('vcuChat-close');
  const messages = document.getElementById('vcuChat-messages');
  const input    = document.getElementById('vcuChat-input');
  const sendBtn  = document.getElementById('vcuChat-send');

  // ── Toggle ─────────────────────────────────────────────────
  fab.addEventListener('click', () => {
    isOpen = !isOpen;
    panel.classList.toggle('open', isOpen);
    if (isOpen && chatHistory.length === 0) {
      loadSessionsThenGreet();
    }
    if (isOpen) setTimeout(() => input.focus(), 220);
  });

  closeBtn.addEventListener('click', () => {
    isOpen = false;
    panel.classList.remove('open');
  });

  // ── Load available sessions ────────────────────────────────
  async function loadSessionsThenGreet() {
    try {
      const res = await fetch(`${API_LOCAL}/sessions`);
      if (res.ok) allSessions = await res.json();
    } catch (e) { console.warn('Chatbot: could not load sessions'); }
    greet();
  }

  function greet() {
    const user = typeof currentUser !== 'undefined' ? currentUser : null;
    const name = user?.firstName || 'there';
    const enrolled = typeof enrolledSessions !== 'undefined' ? enrolledSessions : [];
    const credits  = enrolled.reduce((s, e) => s + (e.course?.creditHours || 0), 0);

    addAIMessage(
      `Hi ${name}! I'm your VCU scheduling assistant for Summer 2026. 👋\n\nYou're currently enrolled in **${enrolled.length} course(s)** (${credits} credits). I can help you:\n\n• Find courses that fit your schedule\n• Avoid time conflicts\n• Stay under the 18-credit limit\n• Suggest courses by department or interest\n\nWhat would you like to do?`,
      ['Show my schedule', 'Find courses', 'Check conflicts', 'What can I take?']
    );
  }

  // ── Send message ───────────────────────────────────────────
  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  });
  input.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 100) + 'px';
  });

  async function sendMessage(overrideText) {
    const text = typeof overrideText === 'string'
      ? overrideText
      : input.value.trim();
    if (!text || isLoading) return;

    input.value = '';
    input.style.height = 'auto';
    addUserMessage(text);
    await callClaude(text);
  }

  // ── Build system prompt ────────────────────────────────────
  function buildSystemPrompt() {
    const user     = typeof currentUser    !== 'undefined' ? currentUser    : {};
    const enrolled = typeof enrolledSessions !== 'undefined' ? enrolledSessions : [];

    const enrolledCredits = enrolled.reduce((s, e) => s + (e.course?.creditHours || 0), 0);
    const remainingCredits = 18 - enrolledCredits;

    const enrolledSummary = enrolled.length
      ? enrolled.map(e =>
          `- ${e.course?.courseNumber || '?'} ${e.course?.courseName || ''} ` +
          `(${e.course?.creditHours || 0} cr, §${e.sectionNumber || '?'}, ` +
          `${e.modality || '?'}, ${e.instructor?.firstName || ''} ${e.instructor?.lastName || ''})`
        ).join('\n')
      : 'None yet.';

    const enrolledCourseNumbers = new Set(
      enrolled.map(e => e.course?.courseNumber).filter(Boolean)
    );
    const enrolledSessionIds = new Set(
      enrolled.map(e => e.id || e.sessionId).filter(Boolean)
    );

    const availableSummary = allSessions
      .filter(s => {
        const courseNum = s.course?.courseNumber;
        const isFull    = s.enrolledCount >= s.maxStudents;
        const isDup     = enrolledCourseNumbers.has(courseNum);
        const isIn      = enrolledSessionIds.has(s.id);
        return !isFull && !isDup && !isIn;
      })
      .map(s =>
        `[ID:${s.id}] ${s.course?.courseNumber} §${s.sectionNumber} — ` +
        `${s.course?.courseName} | ${s.course?.creditHours}cr | ` +
        `${s.modality} | ${s.instructor?.firstName} ${s.instructor?.lastName} | ` +
        `${s.enrolledCount}/${s.maxStudents} seats | ` +
        `Prereq: ${(s.course?.prerequisites || []).join(', ') || 'None'}`
      )
      .join('\n');

    return `You are a helpful, conversational course scheduling assistant for VCU (Virginia Commonwealth University) Summer 2026.

STUDENT INFO:
Name: ${user.firstName || 'Student'} ${user.lastName || ''}
Student ID: ${user.studentId || user.studentNumber || '?'}
Virginia Resident: ${user.virginiaResident ? 'Yes' : 'No'}
Home Country: ${user.homeCountry || '?'}

CURRENT ENROLLMENT (${enrolledCredits} / 18 credits used, ${remainingCredits} remaining):
${enrolledSummary}

AVAILABLE SESSIONS (not enrolled, not full, no duplicate courses):
${availableSummary || 'No available sessions found.'}

YOUR ROLE:
- Help the student build a good schedule through conversation
- ALWAYS ask for the student's input before suggesting they add something
- When suggesting a course, describe it clearly and ask "Would you like to add this?"
- Never add courses automatically — always confirm first
- Check for time conflicts (compare meetingDays + startTime/endTime)
- Warn if adding a course would exceed 18 credits
- Be friendly, concise, and specific
- When you want to suggest a specific session for the student to add, include this exact tag at the end of your message: [SUGGEST:sessionId] where sessionId is the numeric ID from the available sessions list above
- Only suggest one course at a time
- If the student says yes/confirms, tell them to click the "Add" button that appears
- Keep responses short — 2-4 sentences max unless listing courses`;
  }

  // ── Call Claude API via proxy ──────────────────────────────
  async function callClaude(userMessage) {
    isLoading = true;
    sendBtn.disabled = true;
    const typingEl = addTyping();

    chatHistory.push({ role: 'user', content: userMessage });

    try {
      const res = await fetch(`${API_LOCAL}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: buildSystemPrompt(),
          messages: chatHistory
        })
      });

      const data = await res.json();
      const reply = data.content?.[0]?.text || "Sorry, I couldn't get a response. Try again.";

      chatHistory.push({ role: 'assistant', content: reply });

      removeTyping(typingEl);

      const suggestMatch = reply.match(/\[SUGGEST:(\d+)\]/);
      const cleanReply   = reply.replace(/\[SUGGEST:\d+\]/g, '').trim();

      if (suggestMatch) {
        const sessionId = parseInt(suggestMatch[1]);
        const session   = allSessions.find(s => s.id === sessionId);
        pendingSuggestion = session || null;
        addAIMessage(cleanReply);
        if (session) addCourseSuggestion(session);
      } else {
        pendingSuggestion = null;
        addAIMessage(cleanReply);
      }

    } catch (err) {
      console.error('Chatbot error:', err);
      removeTyping(typingEl);
      addAIMessage("I'm having trouble connecting right now. Make sure the server is running and try again.");
    }

    isLoading = false;
    sendBtn.disabled = false;
    input.focus();
  }

  // ── Enroll via chatbot ─────────────────────────────────────
  async function enrollFromChat(sessionId) {
    const user = typeof currentUser !== 'undefined' ? currentUser : null;
    if (!user) { addAIMessage("You need to be signed in to add courses."); return; }

    const studentId = user.studentId || user.studentNumber || user.id;

    try {
      const res = await fetch(`${API_LOCAL}/enrollments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, sessionId })
      });
      const data = await res.json();

      if (!res.ok) {
        addAIMessage(`Couldn't add that course: ${data.error}`);
        return;
      }

      if (typeof enrolledSessions !== 'undefined' && typeof renderEnrolled === 'function') {
        enrolledSessions.push(data.enrollment || data);
        renderEnrolled();
        if (typeof renderSearchResults === 'function') renderSearchResults();
      }

      const s = allSessions.find(x => x.id === sessionId);
      const courseName = s?.course?.courseName || 'that course';
      addAIMessage(
        `✓ Done! **${courseName}** has been added to your schedule. Your registration page has been updated. What else can I help you with?`,
        ['Find another course', 'Check my schedule', 'I\'m done']
      );

      pendingSuggestion = null;
    } catch (err) {
      addAIMessage("There was a problem adding the course. Please try again.");
    }
  }

  // ── UI helpers ─────────────────────────────────────────────
  function addUserMessage(text) {
    const div = document.createElement('div');
    div.className = 'chat-bubble user';
    div.textContent = text;
    messages.appendChild(div);
    scrollBottom();
  }

  function addAIMessage(text, chips) {
    const div = document.createElement('div');
    div.className = 'chat-bubble ai';
    div.innerHTML = `<div class="bubble-label">Assistant</div>${formatMarkdown(text)}`;
    messages.appendChild(div);

    if (chips && chips.length) {
      const chipWrap = document.createElement('div');
      chipWrap.className = 'chat-chips';
      chips.forEach(label => {
        const btn = document.createElement('button');
        btn.className = 'chat-chip';
        btn.textContent = label;
        btn.addEventListener('click', () => {
          chipWrap.remove();
          sendMessage(label);
        });
        chipWrap.appendChild(btn);
      });
      messages.appendChild(chipWrap);
    }

    scrollBottom();
  }

  function addCourseSuggestion(session) {
    const div = document.createElement('div');
    div.className = 'course-suggestion';
    const courseNum  = session.course?.courseNumber || '?';
    const courseName = session.course?.courseName   || '?';
    const credits    = session.course?.creditHours  || 0;
    const instructor = session.instructor
      ? `${session.instructor.firstName} ${session.instructor.lastName}`
      : 'TBD';
    const seats = `${session.enrolledCount}/${session.maxStudents}`;

    div.innerHTML = `
      <div class="cs-title">${courseNum} — ${courseName}</div>
      <div class="cs-meta">§${session.sectionNumber} &nbsp;·&nbsp; ${session.modality} &nbsp;·&nbsp; ${credits} cr &nbsp;·&nbsp; ${instructor} &nbsp;·&nbsp; ${seats} seats</div>
      <div class="cs-actions">
        <button class="cs-add">Yes, add this course</button>
        <button class="cs-skip">No thanks</button>
      </div>
    `;

    div.querySelector('.cs-add').addEventListener('click', () => {
      div.remove();
      enrollFromChat(session.id);
    });

    div.querySelector('.cs-skip').addEventListener('click', () => {
      div.remove();
      pendingSuggestion = null;
      addAIMessage("No problem! Want me to suggest something else?", ['Yes, show me another', 'No, I\'m good']);
    });

    messages.appendChild(div);
    scrollBottom();
  }

  function addTyping() {
    const div = document.createElement('div');
    div.className = 'chat-typing';
    div.innerHTML = '<span></span><span></span><span></span>';
    messages.appendChild(div);
    scrollBottom();
    return div;
  }

  function removeTyping(el) { if (el && el.parentNode) el.remove(); }

  function scrollBottom() {
    messages.scrollTop = messages.scrollHeight;
  }

  function formatMarkdown(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }
})();