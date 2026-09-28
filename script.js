document.addEventListener('DOMContentLoaded', function() {

  const themeBtn = document.getElementById('theme-btn');
  const resumeForm = document.getElementById('resume-form');
  const visitorNameInput = document.getElementById('visitor-name');
  const formFeedback = document.getElementById('form-feedback');

  const widgetSearchBtn = document.getElementById('widget-search-btn');
  const widgetCityInput = document.getElementById('widget-city');
  const widgetResult = document.getElementById('widget-result');
  const widgetName = document.getElementById('widget-name');
  const widgetTemp = document.getElementById('widget-temp');
  const widgetDesc = document.getElementById('widget-desc');

  const sandCheckBtn = document.getElementById('sand-check-btn');
  const sandPayBtn = document.getElementById('sand-pay-btn');
  const sandResult = document.getElementById('sand-result');
  const sandStatus = document.getElementById('sand-status');
  const sandRole = document.getElementById('sand-role');
  const sandData = document.getElementById('sand-data');

  const sandInfoLink = document.getElementById('sand-info-link');
  const sandInfoOverlay = document.getElementById('sand-info-overlay');
  const sandInfoClose = document.getElementById('sand-info-close');

  // Terminal DOM Elements
  const cmdForm = document.getElementById('cmdForm');
  const cmdInput = document.getElementById('cmdInput');
  const terminalOutput = document.getElementById('terminalOutput');
  const termNavBtns = document.querySelectorAll('.term-nav-btn');

  // Terminal Response Commands
  const commands = {
    help: `Available commands:
• <span style="color: #38bdf8;">summary</span>   - View candidate introduction & background
• <span style="color: #38bdf8;">freelance</span> - Learn about recent web development projects
• <span style="color: #38bdf8;">projects</span>  - List major application highlights
• <span style="color: #38bdf8;">skills</span>    - View core technical stack
• <span style="color: #38bdf8;">clear</span>     - Clear terminal output screen`,
    
    summary: `<strong style="color: #38bdf8;">SUMMARY:</strong>
Shane Blake — Aspiring Frontend Developer & Web Application Student.
Specializing in standard-compliant, accessible HTML/CSS, Vanilla JavaScript, and Cloudflare Pages workflows.`,

    freelance: `<strong style="color: #38bdf8;">FREELANCE EXPERIENCE:</strong>
• Custom responsive client portfolio sites (HTML5, CSS Grid, Flexbox)
• Web application integration & lightweight serverless logic
• Performance optimizations & accessibility compliance`,

    projects: `<strong style="color: #38bdf8;">PROJECT HIGHLIGHTS:</strong>
1. Interactive CV Terminal (DOM Manipulation & Custom Command Engine)
2. Live Weather Widget (Fetch API & Serverless Endpoint Integration)
3. Stripe Access Control Demo (Webhook Verification & Role-Based Access)`,

    skills: `<strong style="color: #38bdf8;">CORE SKILLS:</strong>
• Frontend: HTML5, CSS3, JavaScript (DOM / Async / Fetch)
• Hosting & Backend: Cloudflare Pages, Workers KV, Stripe APIs
• Tooling & Architecture: Git, GitHub Actions, GDPR Compliance`
  };

  // Terminal Command Execution Logic
  function processCommand(rawInput) {
    // Strip surrounding quotes or spaces if typed (e.g., 'help' -> help)
    const cleanCmd = rawInput.trim().replace(/^['"]|['"]$/g, '').toLowerCase();

    if (!cleanCmd) return;

    if (cleanCmd === 'clear') {
      terminalOutput.innerHTML = '';
      return;
    }

    // Echo user typed line
    const userLine = document.createElement('div');
    userLine.className = 'output-line';
    userLine.innerHTML = `<span style="color: #4ade80;">shane@dev:~$</span> ${escapeHtml(rawInput)}`;
    terminalOutput.appendChild(userLine);

    // Print command output or error message
    const responseLine = document.createElement('div');
    responseLine.className = 'output-line';

    if (commands[cleanCmd]) {
      responseLine.innerHTML = commands[cleanCmd];
    } else {
      responseLine.innerHTML = `Command not recognized: '<span style="color: #f87171;">${escapeHtml(rawInput)}</span>'. Type <span style="color: #4ade80;">'help'</span> for options.`;
    }

    terminalOutput.appendChild(responseLine);
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
  }

  // Helper to safely render user input
  function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }

  // Event Listener: Form submit handles Enter key press
  if (cmdForm) {
    cmdForm.addEventListener('submit', function(event) {
      event.preventDefault();
      const inputVal = cmdInput.value;
      processCommand(inputVal);
      cmdInput.value = '';
    });
  }

  // Event Listener: Quick Action Nav Buttons
  termNavBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const cmd = btn.getAttribute('data-cmd');
      processCommand(cmd);
    });
  });

  // Modal Handlers
  sandInfoLink.addEventListener('click', function(event) {
    event.preventDefault();
    sandInfoOverlay.classList.remove('hidden');
  });

  function closeSandInfo() {
    sandInfoOverlay.classList.add('hidden');
  }

  sandInfoClose.addEventListener('click', closeSandInfo);

  sandInfoOverlay.addEventListener('click', function(event) {
    if (event.target === sandInfoOverlay) closeSandInfo();
  });

  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && !sandInfoOverlay.classList.contains('hidden')) {
      closeSandInfo();
    }
  });

  // Dark Mode Toggle
  themeBtn.addEventListener('click', function() {
    document.body.classList.toggle('dark');
  });

  // Skills Filtering
  const filterButtons = document.querySelectorAll('.filter-btn');
  const skillItems = document.querySelectorAll('.skill-item');

  filterButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const targetFilter = btn.getAttribute('data-filter');
      
      skillItems.forEach(item => {
        if (targetFilter === 'all' || item.classList.contains(targetFilter)) {
          item.style.display = 'inline-block';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });

  // Resume Form Submission Handler
  resumeForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const visitorName = visitorNameInput.value;
    formFeedback.textContent = `Thank you, ${visitorName}! Your message has been sent. 🚀`;
    formFeedback.classList.remove('hidden');
    resumeForm.reset();
  });

  // Weather Widget Handler
  widgetSearchBtn.addEventListener('click', function() {
    const city = widgetCityInput.value.trim();
    if (city === "") {
      alert("Please enter a city name first!");
      return;
    }
    widgetSearchBtn.textContent = "⌛";
    widgetSearchBtn.style.opacity = "0.7";

    const url = `/weather?city=${encodeURIComponent(city)}`;

    fetch(url)
      .then(response => {
        if (!response.ok) throw new Error(`Server returned status: ${response.status}`);
        return response.json();
      })
      .then(data => {
        widgetName.textContent = `${data.name}, ${data.country}`;
        widgetTemp.textContent = `${Math.round(data.temp)}°C`;
        widgetDesc.textContent = data.description;
        widgetResult.classList.remove('hidden');
      })
      .catch(error => {
        alert(`Oops! ${error.message}`);
        console.error(error);
      })
      .finally(() => {
        widgetSearchBtn.textContent = "Go";
        widgetSearchBtn.style.opacity = "1";
      });
  });

  // Stripe Checkout Payment Handler
  sandPayBtn.addEventListener('click', async function() {
    sandPayBtn.textContent = "⌛ Creating checkout session...";
    sandPayBtn.disabled = true;

    try {
      const response = await fetch('/create-checkout-session', {
        method: 'POST',
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Failed to create checkout session');
      
      window.location.href = data.url;
    } catch (err) {
      alert(`Oops! ${err.message}`);
      sandPayBtn.textContent = "Test Stripe Webhook Payment";
      sandPayBtn.disabled = false;
    }
  });

  // Verify Payment Status Button handler
  sandCheckBtn.addEventListener('click', function() {
    checkPaymentSuccess(true);
  });

  // Main Verification Function
  async function checkPaymentSuccess(isManual = false) {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');

    if (!sessionId) {
      if (isManual) {
        alert("No session found. Please complete the payment first.");
      }
      return;
    }

    sandResult.classList.remove('hidden');
    sandStatus.textContent = "Verifying with server...";
    sandStatus.className = "status-badge";
    sandData.textContent = "Checking Stripe verification...";
    
    try {
      const response = await fetch(`/verify-session?session_id=${encodeURIComponent(sessionId)}`);
      const data = await response.json();

      if (data.authorized) {
        sandRole.textContent = data.role;
        sandRole.className = "role-badge role-premium";
        sandStatus.textContent = "Authorized via Stripe";
        sandStatus.className = "status-badge status-authorized";
        sandData.textContent = "Webhook verified server-side. Access granted.";
        sandData.className = "payload-data data-authorized";
      } else {
        sandStatus.textContent = "Payment not yet confirmed";
        sandStatus.className = "status-badge status-denied";
        sandData.textContent = "Payment not found or still processing. Please wait a moment.";
        sandData.className = "payload-data data-denied";
      }
    } catch (err) {
      sandStatus.textContent = "Error";
      sandData.textContent = "Failed to connect to verification server.";
    }
  }

  // Auto-check on page load (silent)
  checkPaymentSuccess(false);
  
});
