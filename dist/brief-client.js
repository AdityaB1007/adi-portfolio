(() => {
  'use strict';
  const host = document.querySelector('#brief-embed-host');
  const builder = document.querySelector('#brief-local-builder');
  const separate = document.querySelector('#brief-separate');
  let ready = false;
  document.addEventListener('brief:opened', () => {
    if (ready) return;
    const candidate = window.PORTFOLIO_BRIEF_URL;
    // Restrict editable configuration to Google's production Apps Script web apps.
    if (typeof candidate !== 'string' || !/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(candidate)) return;
    const frame = document.createElement('iframe');
    frame.src = candidate;
    frame.title = 'Create and send Aditya a project brief';
    frame.className = 'brief-embed';
    frame.referrerPolicy = 'no-referrer';
    // Apps Script supplies its own nested iframe sandbox and authenticated RPC.
    host.append(frame);
    host.hidden = false;
    builder.hidden = true;
    document.querySelector('#brief-intro').hidden = true;
    // The hosted form supplies its own title, avoiding duplicated headings.
    document.querySelector('#brief-title').classList.add('sr-only');
    separate.href = candidate;
    separate.hidden = false;
    ready = true;
  });
})();
