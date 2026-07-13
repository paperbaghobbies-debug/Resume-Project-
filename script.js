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

  sandInfoOverlay.addEventListener('click', function(event) {
    if (event.target === sandInfoOverlay) closeSandInfo();
  });

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