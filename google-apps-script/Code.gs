/* Public functions are limited to doGet and submitBrief.
 * Owner setup, delivery, and review functions end in "_" and cannot be invoked
 * with google.script.run from the public form.
 */
var NOTIFICATION_EMAIL = 'adityaworkone@gmail.com';
var DAILY_EMAIL_LIMIT = 20;
var HEADERS = [
  'Reference', 'Received UTC', 'Name', 'Email', 'Project or company', 'Area',
  'Brief', 'Timeline', 'Review status', 'Flag reasons', 'Email status',
  'Email updated UTC', 'Request ID', 'Content fingerprint', 'Browser fingerprint',
  'Form fingerprint', 'Email detail', 'Payload JSON'
];
var SERVICES = [
  'Workflow integrations & automation', 'Agentic AI & knowledge assistants',
  'Machine learning & prediction', 'Data science & explainability',
  'Let’s figure it out together'
];

function setup_() {
  var book = SpreadsheetApp.getActiveSpreadsheet();
  if (!book) throw new Error('Open this script from your private Google Sheet using Extensions → Apps Script.');
  var properties = PropertiesService.getScriptProperties();
  properties.setProperty('SPREADSHEET_ID', book.getId());
  if (!properties.getProperty('SIGNING_SECRET')) {
    properties.setProperty('SIGNING_SECRET', Utilities.getUuid() + Utilities.getUuid());
  }
  properties.setProperty('NOTIFICATION_EMAIL', NOTIFICATION_EMAIL);
  var messages = book.getSheetByName('Enquiries') || book.insertSheet('Enquiries');
  if (!messages.getLastRow()) messages.appendRow(HEADERS);
  if (messages.getRange(1, 1, 1, HEADERS.length).getValues()[0].join('|') !== HEADERS.join('|')) {
    throw new Error('Enquiries headers have changed. Restore the supplied column headers before continuing.');
  }
  var audit = book.getSheetByName('Audit') || book.insertSheet('Audit');
  if (!audit.getLastRow()) audit.appendRow(['Recorded UTC', 'Reference', 'Event', 'Detail']);
  messages.setFrozenRows(1);
  audit.setFrozenRows(1);
  messages.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  messages.setColumnWidth(7, 400);
  if (!messages.getFilter()) messages.getRange(1, 1, messages.getMaxRows(), HEADERS.length).createFilter();
  if (!ScriptApp.getProjectTriggers().some(function(trigger) { return trigger.getHandlerFunction() === 'deliverNext_'; })) {
    ScriptApp.newTrigger('deliverNext_').timeBased().everyMinutes(1).create();
  }
  // Requests the send-only permission during owner setup, before public use.
  MailApp.getRemainingDailyQuota();
  onOpen();
  console.log('Setup complete. Enquiry records: ' + book.getUrl());
}

function onOpen() {
  SpreadsheetApp.getUi().createMenu('Enquiry review')
    .addItem('Approve selected briefs', 'approveSelected_')
    .addItem('Mark selected as irrelevant', 'markIrrelevant_')
    .addItem('Retry selected email after checking mailbox', 'retrySelected_')
    .addItem('Process the next queued email', 'deliverNext_')
    .addToUi();
}

function settings_() {
  var props = PropertiesService.getScriptProperties();
  var spreadsheet = props.getProperty('SPREADSHEET_ID');
  var secret = props.getProperty('SIGNING_SECRET');
  if (!spreadsheet || !secret) throw new Error('Run setup_ in the Apps Script editor first.');
  return {
    spreadsheet: spreadsheet,
    secret: secret,
    recipient: props.getProperty('NOTIFICATION_EMAIL') || NOTIFICATION_EMAIL
  };
}

function book_() {
  return SpreadsheetApp.openById(settings_().spreadsheet);
}

function safeCell_(value) {
  var text = String(value == null ? '' : value);
  // A visitor must never be able to create a spreadsheet formula.
  return /^[\s\u200b\ufeff]*[=+\-@]/.test(text) ? "'" + text : text;
}

function appendSafe_(sheet, values) {
  sheet.appendRow(values.map(safeCell_));
}

function audit_(reference, action, detail) {
  appendSafe_(book_().getSheetByName('Audit'), [new Date().toISOString(), reference, action, detail || '']);
}

function clean_(value, limit) {
  return typeof value === 'string' ? value.replace(/\u0000/g, '').slice(0, limit).trim() : '';
}

function signature_(value) {
  return Utilities.base64EncodeWebSafe(
    Utilities.computeHmacSha256Signature(value, settings_().secret)
  ).replace(/=+$/, '');
}

function createToken_() {
  var payload = Date.now() + '.' + Utilities.getUuid();
  return payload + '.' + signature_(payload);
}

function tokenInfo_(value) {
  var token = String(value || '');
  var parts = token.split('.');
  if (parts.length !== 3) return { valid: false };
  var payload = parts[0] + '.' + parts[1];
  var expected = signature_(payload);
  var supplied = parts[2];
  var difference = expected.length ^ supplied.length;
  for (var index = 0; index < expected.length; index++) {
    difference |= expected.charCodeAt(index) ^ (supplied.charCodeAt(index) || 0);
  }
  var age = Date.now() - Number(parts[0]);
  return {
    valid: difference === 0 && age >= 0 && age <= 2 * 60 * 60 * 1000,
    age: age,
    fingerprint: signature_(payload)
  };
}

function doGet() {
  var template = HtmlService.createTemplateFromFile('Form');
  template.formToken = createToken_();
  template.contactEmail = settings_().recipient;
  return template.evaluate()
    .setTitle('Send Aditya a project brief')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function normalize_(input) {
  var value = input && typeof input === 'object' ? input : {};
  return {
    name: clean_(value.name, 120),
    email: clean_(value.email, 254).toLowerCase(),
    company: clean_(value.company, 120),
    service: clean_(value.service, 100),
    problem: clean_(value.problem, 4000),
    timeline: clean_(value.timeline, 120),
    website: clean_(value.website, 200)
  };
}

function classify_(message) {
  var reasons = [];
  if (message.website) reasons.push('honeypot');
  if (!/^[^\s@<>\r\n]+@[^\s@<>\r\n]+\.[^\s@<>\r\n]+$/.test(message.email)) reasons.push('invalid_email');
  if (message.name.length < 2 || message.company.length < 2 || message.problem.length < 40) reasons.push('incomplete_brief');
  if (SERVICES.indexOf(message.service) < 0) reasons.push('invalid_service');
  if ((message.problem.match(/https?:\/\//gi) || []).length > 3) reasons.push('excessive_links');
  if (/\b(casino bonus|buy backlinks|guest post service|crypto giveaway|adult dating)\b/i.test(message.problem)) reasons.push('unsolicited_promotion');
  if (!/\b(automat\w*|agent\w*|data\w*|model\w*|predict\w*|classif\w*|recommend\w*|integrat\w*|workflow\w*|report\w*|document\w*|invoice\w*|research\w*|api\w*|software|machine learning|ai|crm|erp|python|website|app|dashboard|build|develop|hir\w*|role|engineer\w*|project)\b/i.test(message.problem)) reasons.push('unclear_project_fit');
  return {
    status: reasons.some(function(reason) {
      return ['honeypot', 'excessive_links', 'unsolicited_promotion'].indexOf(reason) >= 0;
    }) ? 'likely_spam' : reasons.length ? 'needs_review' : 'accepted',
    reasons: reasons
  };
}

function rows_(sheet) {
  if (sheet.getLastRow() < 2) return [];
  return sheet.getRange(2, 1, sheet.getLastRow() - 1, HEADERS.length).getValues();
}

function updateField_(sheet, row, name, value) {
  sheet.getRange(row, HEADERS.indexOf(name) + 1).setValue(safeCell_(value));
}

function submitBrief(input) {
  var message = normalize_(input);
  var token = tokenInfo_(input && input.token);
  var requestId = clean_(input && input.requestId, 100) || Utilities.getUuid();
  var contentHash = signature_(JSON.stringify(message));
  var browserHash = signature_(clean_(input && input.browserId, 100) || 'not_supplied');
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) throw new Error('The inbox is busy. Your brief is not confirmed saved. Please retry with the same form.');
  var result;
  try {
    var sheet = book_().getSheetByName('Enquiries');
    var existing = rows_(sheet);
    var previous = existing.find(function(row) {
      return row[12] === requestId && row[13] === contentHash;
    });
    if (previous) {
      audit_(previous[0], 'submission_retry', 'Same request ID and content; original reference reused.');
      return { received: true, reference: previous[0] };
    }

    var verdict = classify_(message);
    if (!token.valid) verdict.reasons.push('invalid_or_expired_form');
    else if (token.age < 2000) verdict.reasons.push('submitted_too_quickly');
    var recent = existing.filter(function(row) { return Date.now() - Date.parse(row[1]) < 86400000; });
    if (recent.some(function(row) { return row[13] === contentHash; })) verdict.reasons.push('duplicate_content');
    if (recent.filter(function(row) { return row[3] === message.email; }).length >= 3) verdict.reasons.push('email_rate_limit');
    if (recent.filter(function(row) {
      return Date.now() - Date.parse(row[1]) < 3600000 && (row[14] === browserHash || (token.valid && row[15] === token.fingerprint));
    }).length >= 3) verdict.reasons.push('browser_or_form_rate_limit');
    if (verdict.status !== 'likely_spam' && verdict.reasons.length) verdict.status = 'needs_review';

    var reference = Utilities.getUuid();
    var timestamp = new Date().toISOString();
    var delivery = verdict.status === 'accepted' ? 'queued' : 'held';
    appendSafe_(sheet, [
      reference, timestamp, message.name, message.email, message.company,
      message.service, message.problem, message.timeline, verdict.status,
      verdict.reasons.join(', '), delivery, timestamp, requestId, contentHash,
      browserHash, token.fingerprint || '', '', JSON.stringify(message)
    ]);
    SpreadsheetApp.flush();
    audit_(reference, 'received', verdict.status + ': ' + verdict.reasons.join(', '));
    result = { received: true, reference: reference };
  } finally {
    lock.releaseLock();
  }
  // The record is already durable if delivery fails or the client disconnects.
  try { deliverNext_(); } catch (error) { console.error('Notification processing needs owner review.'); }
  return result;
}

function dailyAttempts_() {
  var properties = PropertiesService.getScriptProperties();
  var date = new Date().toISOString().slice(0, 10);
  var state;
  try { state = JSON.parse(properties.getProperty('DAILY_EMAIL_ATTEMPTS') || '{}'); } catch (error) { state = {}; }
  if (state.date !== date) state = { date: date, count: 0 };
  return state;
}

function deliverNext_() {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) return;
  var claimed;
  try {
    var sheet = book_().getSheetByName('Enquiries');
    var records = rows_(sheet);
    records.forEach(function(record, index) {
      if (record[10] === 'sending' && Date.now() - Date.parse(record[11]) > 10 * 60000) {
        updateField_(sheet, index + 2, 'Email status', 'delivery_uncertain');
        audit_(record[0], 'delivery_uncertain', 'Previous attempt interrupted; check mailbox before manually retrying.');
      }
    });
    var daily = dailyAttempts_();
    if (daily.count >= DAILY_EMAIL_LIMIT || MailApp.getRemainingDailyQuota() < 1) return;
    var index = records.findIndex(function(record) { return record[10] === 'queued' && record[8] === 'accepted'; });
    if (index < 0) return;
    var record = records[index];
    var snapshot = JSON.parse(record[17]);
    if (!/^[^\s@<>\r\n]+@[^\s@<>\r\n]+\.[^\s@<>\r\n]+$/.test(snapshot.email)) {
      updateField_(sheet, index + 2, 'Email status', 'held');
      audit_(record[0], 'notification_blocked', 'Invalid reply address.');
      return;
    }
    updateField_(sheet, index + 2, 'Email status', 'sending');
    updateField_(sheet, index + 2, 'Email updated UTC', new Date().toISOString());
    daily.count++;
    PropertiesService.getScriptProperties().setProperty('DAILY_EMAIL_ATTEMPTS', JSON.stringify(daily));
    audit_(record[0], 'notification_attempt', 'Recipient is the configured owner only.');
    SpreadsheetApp.flush();
    claimed = { row: index + 2, id: record[0], message: snapshot };
  } finally {
    lock.releaseLock();
  }
  if (!claimed) return;

  var state = 'sent';
  var detail = 'MailApp accepted the notification.';
  try {
    var message = claimed.message;
    MailApp.sendEmail({
      to: settings_().recipient,
      replyTo: message.email,
      name: 'Aditya portfolio',
      subject: 'Project enquiry — ' + message.company.replace(/[\r\n]/g, ' ').slice(0, 80),
      body: [
        'Reference: ' + claimed.id, '',
        'Name: ' + message.name,
        'Email: ' + message.email,
        'Project / company: ' + message.company,
        'Area: ' + message.service, '',
        message.problem, '',
        'Timeline: ' + (message.timeline || 'Open to discussion'), '',
        'Private tracking sheet: ' + book_().getUrl()
      ].join('\n')
    });
  } catch (error) {
    state = 'delivery_needs_review';
    detail = 'Email attempt failed or its outcome is uncertain. Check the mailbox before retrying.';
  }

  if (!lock.tryLock(10000)) return; // A stale sending row is held for review by the next run.
  try {
    var messages = book_().getSheetByName('Enquiries');
    // Find by reference again, so sorting the sheet during delivery is safe.
    var current = rows_(messages).findIndex(function(record) { return record[0] === claimed.id; });
    if (current < 0) return;
    updateField_(messages, current + 2, 'Email status', state);
    updateField_(messages, current + 2, 'Email updated UTC', new Date().toISOString());
    updateField_(messages, current + 2, 'Email detail', detail);
    audit_(claimed.id, 'notification_' + state, detail);
  } finally {
    lock.releaseLock();
  }
}

function selectedRows_() {
  var range = SpreadsheetApp.getActiveRange();
  if (!range || range.getSheet().getName() !== 'Enquiries' || range.getRow() < 2) {
    throw new Error('Select message rows, starting below the header, in the Enquiries tab.');
  }
  var end = Math.min(range.getLastRow(), range.getSheet().getLastRow());
  var rows = [];
  for (var row = range.getRow(); row <= end; row++) rows.push(row);
  return rows;
}

function reviewSelected_(action) {
  var selected = selectedRows_();
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var sheet = book_().getSheetByName('Enquiries');
    selected.forEach(function(row) {
      var record = sheet.getRange(row, 1, 1, HEADERS.length).getValues()[0];
      if (record[10] === 'sending') return;
      if (action === 'irrelevant') {
        updateField_(sheet, row, 'Review status', 'irrelevant');
        if (record[10] === 'queued') updateField_(sheet, row, 'Email status', 'held');
      } else {
        if (action === 'approve' && record[10] !== 'held') return;
        if (action === 'retry' && ['delivery_needs_review', 'delivery_uncertain'].indexOf(record[10]) < 0) return;
        var snapshot = JSON.parse(record[17]);
        if (!/^[^\s@<>\r\n]+@[^\s@<>\r\n]+\.[^\s@<>\r\n]+$/.test(snapshot.email)) return;
        updateField_(sheet, row, 'Review status', 'accepted');
        updateField_(sheet, row, 'Email status', 'queued');
      }
      audit_(record[0], 'owner_' + action, 'Explicit action from the private Sheet menu.');
    });
  } finally {
    lock.releaseLock();
  }
}

function approveSelected_() { reviewSelected_('approve'); }
function markIrrelevant_() { reviewSelected_('irrelevant'); }
function retrySelected_() {
  var ui = SpreadsheetApp.getUi();
  var answer = ui.alert('Check the mailbox first', 'A previous email may already have arrived. Retry the selected uncertain notifications?', ui.ButtonSet.YES_NO);
  if (answer === ui.Button.YES) reviewSelected_('retry');
}
