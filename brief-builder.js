'use strict';
(() => {
const form = document.querySelector('#brief-form');
if (!form) return;
const button = document.querySelector('#send-brief');
const status = document.querySelector('#brief-status');
const token = '';
const connected = typeof google !== 'undefined' && !!google.script && !!google.script.run;
const preview = document.querySelector('#brief-preview-text');
function updatePreview() {
  const fields = Object.fromEntries(new FormData(form));
  preview.textContent = `Hi Aditya, I'd like to discuss a project.\n\nProject / company: ${fields.company.trim() || '[Your project or company]'}\nArea: ${fields.service}\n\nProblem and desired outcome:\n${fields.problem.trim() || '[The problem you want to solve]'}\n\nTimeline: ${fields.timeline.trim() || 'Open to discussion'}\n`;
}
form.addEventListener('invalid', event => {
  status.textContent = event.target.validationMessage || 'Please check the highlighted field before sending.';
}, true);
form.addEventListener('input', updatePreview);
form.addEventListener('change', updatePreview);
updatePreview();
button.disabled = !connected;
if (!connected) {
  button.disabled = true;
  button.setAttribute('aria-describedby', 'brief-status');
  status.textContent = 'Direct sending is not connected yet. You can prepare a brief here, or email Aditya below.';
  document.querySelector('#brief-privacy').textContent = 'This draft stays in your browser and is not submitted or saved. Please avoid confidential information.';
}
let requestId = '';
let previousPayload = '';
let sending = false;
let browserId;
function randomId() {
  return typeof crypto.randomUUID === 'function' ? crypto.randomUUID() :
    Array.from(crypto.getRandomValues(new Uint8Array(16)), value => value.toString(16).padStart(2,'0')).join('');
}
try {
  browserId = localStorage.getItem('portfolio-brief-browser') || randomId();
  localStorage.setItem('portfolio-brief-browser', browserId);
} catch (error) {
  browserId = randomId();
}
form.addEventListener('submit', event => {
  event.preventDefault();
  if (!connected || sending || !form.reportValidity()) return;
  const fields = Object.fromEntries(new FormData(form));
  const payload = JSON.stringify(fields);
  if (payload !== previousPayload) {
    requestId = randomId();
    previousPayload = payload;
  }
  sending = true;
  button.disabled = true;
  status.textContent = 'Sending your brief…';
  google.script.run
    .withSuccessHandler(result => {
      sending = false;
      button.disabled = false;
      if (!result || result.received !== true) {
        status.textContent = 'Receipt could not be confirmed. Please retry or email Aditya directly.';
        return;
      }
      status.textContent = 'Thanks! Your project brief has been received. I’ll review it and get back to you.';
      form.reset();
      updatePreview();
      previousPayload = '';
      requestId = '';
    })
    .withFailureHandler(() => {
      sending = false;
      button.disabled = false;
      status.textContent = 'Receipt could not be confirmed. Your entries are still here. Retry with this form, or email Aditya directly.';
    })
    .submitBrief({ ...fields, requestId, browserId, token });
});
})();
