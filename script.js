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

  sandInfoLink.addEventListener('click', function(event) {
    event.preventDefault();
    sandInfoOverlay.classList.remove('hidden');
  });

  function closeSandInfo() {
    sandInfoOverlay.classList.add('hidden');
  }

  sandInfoClose.addEventListener('click', closeSandInfo);

  // Click outside the modal box to close
  sandInfoOverlay.addEventListener('click', function(event) {
    if (event.target === sandInfoOverlay) closeSandInfo();
  });

  // Esc key to close
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && !sandInfoOverlay.classList.contains('hidden')) {
      closeSandInfo();
    }
  });

  themeBtn.addEventListener('click', function() {
    document.body.classList.toggle('dark');
  });

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

  resumeForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const visitorName = visitorNameInput.value;
    formFeedback.textContent = `Thank you, ${visitorName}! Your message has been sent. 🚀`;
    formFeedback.classList.remove('hidden');
    resumeForm.reset();
  });

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


  const localSession = {
    user: { email: "dr.jane@clinic.com", role: "Free_User", clearances: ["read_profile"] },
    secureReports: { id: "rep_102", payload: "CONFIDENTIAL: [Clinics & Inspector Audit Schema Route Verified]" }
  };

  // 1. Verify Authentication & Clearance State Permissions
  sandCheckBtn.addEventListener('click', function() {
    sandResult.classList.remove('hidden');
    
    if (localSession.user.clearances.includes("read_all_reports")) {
      sandStatus.textContent = "Authorized";
      sandStatus.className = "status-badge status-authorized";
      sandData.textContent = localSession.secureReports.payload;
      sandData.className = "payload-data data-authorized";
    } else {
      sandStatus.textContent = "Access Denied";
      sandStatus.className = "status-badge status-denied";
      sandData.textContent = "HTTP 403 Forbidden: Insufficient clearance tokens.";
      sandData.className = "payload-data data-denied";
    }
  });

 
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

  
  async function checkPaymentSuccess() {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');

    if (!sessionId) return;

    sandResult.classList.remove('hidden');
    sandStatus.textContent = "Verifying with server...";
    sandStatus.className = "status-badge";
    sandData.textContent = "Waiting for webhook confirmation...";
    sandData.className = "payload-data";

    
    const maxAttempts = 5;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const response = await fetch(
          `/verify-session?session_id=${encodeURIComponent(sessionId)}`
        );
        const data = await response.json();

        if (data.authorized) {
          localSession.user.role = data.role;
          localSession.user.clearances.push("read_all_reports");

          sandRole.textContent = localSession.user.role;
          sandRole.className = "role-badge role-premium";

          sandStatus.textContent = "Authorized via Stripe";
          sandStatus.className = "status-badge status-authorized";

          sandData.textContent = "Webhook verified server-side. Permissions synced.";
          sandData.className = "payload-data data-authorized";
          break;
        }
      } catch (err) {
        // fall through and retry
      }

      if (attempt === maxAttempts) {
        sandStatus.textContent = "Payment not yet confirmed";
        sandStatus.className = "status-badge status-denied";
        sandData.textContent = "The webhook hasn't confirmed this session. Try clicking Verify Payment Status in a moment.";
        sandData.className = "payload-data data-denied";
      } else {
        await new Promise(resolve => setTimeout(resolve, 1200));
      }
    }
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  checkPaymentSuccess();
});