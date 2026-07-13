document.addEventListener('DOMContentLoaded', function() {

  // ... (All your existing constant declarations remain the same) ...
  const sandCheckBtn = document.getElementById('sand-check-btn');
  const sandPayBtn = document.getElementById('sand-pay-btn');
  const sandResult = document.getElementById('sand-result');
  const sandStatus = document.getElementById('sand-status');
  const sandRole = document.getElementById('sand-role');
  const sandData = document.getElementById('sand-data');
  // ... (Keep other existing constants) ...

  // 1. Updated: Verify Payment Status Button now triggers the server check
  sandCheckBtn.addEventListener('click', function() {
    checkPaymentSuccess();
  });

  // 2. Stripe Checkout Payment Handler
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

  // 3. Main Verification Function
  async function checkPaymentSuccess() {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');

    if (!sessionId) {
      alert("No session found. Please complete the payment first.");
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

  // Auto-check on page load
  checkPaymentSuccess();
  
  // ... (Keep the rest of your existing code for theme, filters, etc.) ...
});