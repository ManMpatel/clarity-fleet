/* Clarity Fleet – booking flow controller */
(function () {
  'use strict';

  // ── Collect UTM / gclid params from URL ──────────────────────────────
  var utmParams = {};
  new URLSearchParams(window.location.search).forEach(function (v, k) {
    if (/^(utm_|gclid|fbclid)/.test(k)) utmParams[k] = v;
  });

  // ── State ─────────────────────────────────────────────────────────────
  var state = {
    step: 1,
    trackTypes:   [],   // Step 1 checkboxes
    fleetSize:    '',   // Step 2 radio
    mainConcern:  [],   // Step 3 checkboxes
    contact: {
      fullName:     '',
      businessName: '',
      email:        '',
      phone:        '',
      suburb:       '',
      message:      ''
    },
    utm: utmParams
  };

  var TOTAL_STEPS = 4;

  // ── DOM refs ──────────────────────────────────────────────────────────
  var stepPanels    = document.querySelectorAll('.step-panel');
  var stepperSteps  = document.querySelectorAll('[data-stepper-step]');
  var stepperTracks = document.querySelectorAll('.stepper-track');
  var stepCounter   = document.getElementById('stepCounter');
  var formEl        = document.getElementById('bookingForm');
  var thankYouEl    = document.getElementById('thankYouState');

  // ── Render helpers ────────────────────────────────────────────────────
  function showStep(n) {
    var prev = state.step;
    state.step = n;

    // Stepper and counter update immediately regardless of animation
    stepperSteps.forEach(function (el, i) {
      var sNum = i + 1;
      el.classList.remove('active', 'completed');
      if (sNum < n)        el.classList.add('completed');
      else if (sNum === n) el.classList.add('active');
    });
    stepperTracks.forEach(function (track, i) {
      track.classList.toggle('completed', i < n - 1);
    });
    if (stepCounter) stepCounter.textContent = 'Step ' + n + ' of ' + TOTAL_STEPS;

    var animate  = prev !== n;
    var enterCls = n > prev ? 'step-enter-right' : 'step-enter-left';

    stepPanels.forEach(function (panel) {
      var isTarget = panel.dataset.step === String(n);
      panel.classList.toggle('hidden', !isTarget);
      if (isTarget && animate) {
        // Remove any leftover class then force reflow to restart animation
        panel.classList.remove('step-enter-right', 'step-enter-left');
        void panel.offsetWidth;
        panel.classList.add(enterCls);
        panel.addEventListener('animationend', function handler() {
          panel.classList.remove(enterCls);
          panel.removeEventListener('animationend', handler);
        });
      }
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Wire option-card selection styling.
  // Each .option-card is a <label> — the browser natively toggles its associated
  // input on click and fires 'change', so we only need to listen for that event.
  function wireOptionCards(panel) {
    panel.querySelectorAll('.option-card').forEach(function (card) {
      var input = card.querySelector('input');
      input.addEventListener('change', function () {
        if (input.type === 'radio') {
          panel.querySelectorAll('.option-card').forEach(function (c) {
            c.classList.remove('selected');
          });
        }
        card.classList.toggle('selected', input.checked);
      });
    });
  }

  stepPanels.forEach(function (panel) { wireOptionCards(panel); });

  // ── Step navigation ───────────────────────────────────────────────────
  document.querySelectorAll('[data-next]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var current = parseInt(btn.dataset.next) - 1;
      collectStep(current);
      showStep(parseInt(btn.dataset.next));
    });
  });

  document.querySelectorAll('[data-back]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      showStep(parseInt(btn.dataset.back));
    });
  });

  // ── Collect per-step data ─────────────────────────────────────────────
  function collectStep(n) {
    if (n === 1) {
      state.trackTypes = Array.from(
        document.querySelectorAll('[name="track_type"]:checked')
      ).map(function (el) { return el.value; });
    }
    if (n === 2) {
      var sel = document.querySelector('[name="fleet_size"]:checked');
      state.fleetSize = sel ? sel.value : '';
    }
    if (n === 3) {
      state.mainConcern = Array.from(
        document.querySelectorAll('[name="main_concern"]:checked')
      ).map(function (el) { return el.value; });
    }
  }

  // ── Final form submission ─────────────────────────────────────────────
  if (formEl) {
    formEl.addEventListener('submit', function (e) {
      e.preventDefault();
      state.contact.fullName     = document.getElementById('fullName').value.trim();
      state.contact.businessName = document.getElementById('businessName').value.trim();
      state.contact.email        = document.getElementById('email').value.trim();
      state.contact.phone        = document.getElementById('phone').value.trim();
      state.contact.suburb       = document.getElementById('suburb').value.trim();
      state.contact.message      = document.getElementById('message').value.trim();

      var bookingData = Object.assign({}, state);
      console.log('Booking data ready:', bookingData);

      // TODO: wire up to CRM once built — do not add email/DB submission yet
      // Example: fetch('/api/booking', { method:'POST', body: JSON.stringify(bookingData) })

      // Show thank-you state
      formEl.closest('.booking-canvas').classList.add('hidden');
      thankYouEl.classList.add('visible');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ── Init ──────────────────────────────────────────────────────────────
  showStep(1);
})();
