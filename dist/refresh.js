'use strict';

// Each workflow owns its stages and artifacts. Navigation derives its length from
// that data; these are sample records explaining real professional projects.
const workflowExamples = {
  property: {
    context: 'Approved applicants become signed, archived leases—with the links returned to the team.',
    target: 'real-estate',
    stages: [
      {
        system: 'BUILDIUM / SOURCE RECORDS', title: 'Start with the relationships.', short: 'ERP', next: 'Sync to the operations hub',
        artifact: { type: 'records', label: '01 · Source records', status: 'Ready to sync', rows: [['Property / unit', 'Example Property · Unit 04'], ['Approved applicants', 'Applicant A + Applicant B'], ['Lease terms', 'Unit, dates, rent, deposit'], ['Other ERP data', 'Maintenance requests + ledger balances']], footer: 'Related entities arrive as separate ERP records.' },
        decision: 'Property, unit, tenant, and lease IDs connect the records. Pulling isolated rows would lose that context.'
      },
      {
        system: 'GOOGLE WORKSPACE / OPERATIONS HUB', title: 'One hub. Three workstreams.', short: 'Hub', next: 'Prepare the agreement',
        artifact: { type: 'branches', label: '02 · Shared operations view', status: 'Records matched', rows: [['Leasing & units → Jira', 'Unit match, lease expiry, task urgency'], ['Applicant pipeline → PandaDoc', 'Roommates grouped · custom terms ready'], ['Late rent ledger', 'Overdue balances · fee splits · audit log']], selected: 1, footer: 'This tour follows the applicant branch. Leasing and rent stay separate.' },
        decision: 'Group roommates and deduplicate applicants before document preparation. Keep all three workstreams on consistent source records.'
      },
      {
        system: 'PANDADOC / AGREEMENT PREPARATION', title: 'The right terms. The right signers.', short: 'Terms', next: 'Follow the signatures',
        artifact: { type: 'document', label: '03 · Agreement assembly', status: 'Prepared for dispatch', rows: [['Template routing', 'State-specific lease template'], ['Lease fields', 'Dates, rent, deposit + custom terms'], ['Optional clauses', 'Pet terms where applicable'], ['Signer routing', 'Applicant A · Applicant B · Landlord']], footer: 'A staff action dispatches the agreement for signing.' },
        decision: 'Template rules and structured fields handle lease variation. Staff control the dispatch instead of retyping the agreement.'
      },
      {
        system: 'PANDADOC / SIGNATURE TRACKING', title: 'Track the whole agreement.', short: 'Sign', next: 'Archive the executed PDF',
        artifact: { type: 'checklist', label: '04 · Sample signature state', status: 'All signatures collected', rows: [['Applicant A', 'Signed'], ['Applicant B', 'Signed'], ['Landlord', 'Signed'], ['Agreement state', 'Executed PDF available']], footer: 'Signature status is checked before the file is archived.' },
        decision: 'Dispatch is not completion. The executed document is the handoff that triggers signed-file archival.'
      },
      {
        system: 'GOOGLE DRIVE / SIGNED DOCUMENTS', title: 'File it where it can be found.', short: 'Archive', next: 'Return the link to the team',
        artifact: { type: 'file', label: '05 · Structured document vault', status: 'Archived', rows: [['Folder hierarchy', 'Year / Example Property'], ['File', 'Unit-04_signed-lease.pdf'], ['Operations sheet', 'Direct document link written back']], footer: 'Signed agreements follow a consistent year/property hierarchy.' },
        decision: 'Signing only solves half the problem. The team needs a predictable archive and a direct link from the operations sheet.'
      },
      {
        system: 'JIRA / TEAM HANDOFF', title: 'Bring the context back to work.', short: 'Handoff', next: 'Start this flow again',
        artifact: { type: 'task', label: '06 · Unit operations card', status: 'Context connected', rows: [['Board', 'Vacant → Renovation → In Eviction → Rented'], ['Priority', 'Calculated from lease expiry'], ['Card context', 'Rent + resident details'], ['Signed agreement', 'Drive document link attached']], footer: 'Leasing tasks also sync directly from the hub; maintenance creates tasks with issue photos.' },
        decision: 'Keep one team workflow in Jira. Staff can reach the signed lease from the same card they use to manage the unit.'
      }
    ]
  },
  sales: {
    context: 'Buyer research becomes a relevant licensing pitch, ready for human review.',
    target: 'outreach-project',
    stages: [
      {
        system: 'CONTILOE / IP LICENSING OUTREACH', title: 'Find buyers worth researching.', short: 'Discover', next: 'Check the evidence',
        artifact: { type: 'records', label: '01 · Example prospect brief', status: 'Candidate for research', rows: [['Buyer', 'Example broadcaster'], ['Search context', 'Content acquisition / licensing'], ['Contact', 'Relevant decision-maker to verify'], ['Research needed', 'Current buying signals + catalogue fit']], footer: 'Buyer discovery starts the pipeline; it does not authorize an email.' },
        decision: 'Research should establish a reason to engage. A company name and an email address are not enough for a useful pitch.'
      },
      {
        system: 'RESEARCH / CONTACT & SOURCE CHECKS', title: 'Evidence before personalization.', short: 'Verify', next: 'Match titles and draft',
        artifact: { type: 'checklist', label: '02 · Example research checks', status: 'Checked before drafting', rows: [['News signal', 'Dated source on catalogue expansion'], ['Contact check', 'Verified decision-maker retained'], ['Unsupported claims', 'Removed from personalization'], ['Catalogue relevance', 'Family content fits the sample brief']], footer: 'Python checks remove unverified contacts and unsupported personalization.' },
        decision: 'Keep dated evidence behind the outreach angle. The model should not invent familiarity or send to unverified contacts.'
      },
      {
        system: 'CATALOGUE MATCHING / PERSONALIZED DRAFT', title: 'Give the team something reviewable.', short: 'Draft', next: 'Hand off for approval',
        artifact: { type: 'draft', label: '03 · Illustrative email draft', status: 'Draft · not sent', rows: [['To', 'Verified buyer contact'], ['Subject', 'A shortlist for your family catalogue']], excerpt: 'Your recent catalogue expansion caught my attention. Our family titles may fit that direction. Would you be open to reviewing a shortlist?', footer: 'Catalogue matches and source-backed research inform the draft.' },
        decision: 'Separate generation from sending. A researched draft gives the licensing team a concrete message to edit and approve.'
      },
      {
        system: 'APPROVAL PAGE / SMTP & SEND RECORDS', title: 'A human owns the send.', short: 'Review', next: 'Start this flow again',
        artifact: { type: 'handoff', label: '04 · Approval workflow', status: 'Human review required', rows: [['Team review', 'Edit the proposed message'], ['Approval', 'Choose the draft to send'], ['Delivery', 'SMTP after approval'], ['Send history', 'Record retained to prevent duplicates']], footer: 'Generated research does not bypass the approval step.' },
        decision: 'Keep judgment with the team, and track what was sent so rerunning the workflow does not repeat the outreach.'
      }
    ]
  },
  finance: {
    context: 'Take an invoice through extraction, checks, two-person approval, and a balanced Tally XML export.',
    target: 'finance-project',
    stages: [
      {
        system: 'CONTILOE / FINANCE AI INTAKE', title: 'Start with the source document.', short: 'Intake', next: 'Extract structured fields',
        artifact: { type: 'document', label: '01 · Illustrative invoice', status: 'Received for review', rows: [['Document', 'Sample-vendor-invoice.pdf'], ['Vendor', 'Example Vendor'], ['Invoice', 'INV-DEMO-001'], ['Total on document', '₹11,800']], footer: 'Sample values illustrate the document intake.' },
        decision: 'Keep the document attached to its review workflow so extraction, validation, and approval refer to the same bill.'
      },
      {
        system: 'AI EXTRACTION / STRUCTURED DATA', title: 'Make the bill usable as data.', short: 'Extract', next: 'Run validation checks',
        artifact: { type: 'ledger', label: '02 · Extracted example fields', status: 'Awaiting validation', rows: [['Vendor / invoice', 'Example Vendor · INV-DEMO-001'], ['Classification', 'Purchase invoice'], ['Taxable value', '₹10,000'], ['Tax / total', '₹1,800 / ₹11,800']], footer: 'Extraction and classification feed the rule-based checks.' },
        decision: 'Use AI to interpret the document, then turn the result into explicit fields the application can check and reviewers can inspect.'
      },
      {
        system: 'VALIDATION / DUPLICATE DETECTION', title: 'Check before it moves forward.', short: 'Validate', next: 'Route to two reviewers',
        artifact: { type: 'checklist', label: '03 · Example validation results', status: 'Ready for review', rows: [['Required fields', 'Present'], ['Amount check', '₹10,000 + ₹1,800 = ₹11,800'], ['Duplicate check', 'No matching invoice in this sample'], ['Next handoff', 'Two-stage approval']], footer: 'Rule-based checks and duplicate detection precede approval.' },
        decision: 'A plausible extraction is not enough. Validate the record and check for duplicates before asking people to authorize it.'
      },
      {
        system: 'APPROVAL WORKFLOW / SEPARATE REVIEWERS', title: 'Two stages. Different people.', short: 'Approve', next: 'Generate the voucher XML',
        artifact: { type: 'handoff', label: '04 · Example approval trail', status: 'Approved for export', rows: [['First reviewer', 'Review and approve the record'], ['Second reviewer', 'Separate person approves'], ['Approval history', 'Retained with the bill'], ['Accounting action', 'Generate the approved voucher']], footer: 'The approval stages are assigned to different people.' },
        decision: 'Keep document extraction separate from financial authorization, with a traceable handoff between reviewers.'
      },
      {
        system: 'TALLY XML / VOUCHER EXPORT', title: 'Export a balanced voucher.', short: 'Export', next: 'Start this flow again',
        artifact: { type: 'ledger', label: '05 · Sample purchase voucher', status: 'XML ready for import', rows: [['Expense debit', '₹10,000'], ['Tax debit', '₹1,800'], ['Supplier credit', '₹11,800'], ['Balance check', 'Debits ₹11,800 = credits ₹11,800']], footer: 'Approved purchase/sales vouchers export as Tally XML for import.' },
        decision: 'Produce balanced, importable XML from the approved data, ready for the accounts team to import into Tally.'
      }
    ]
  }
};

const demoRoot = document.querySelector('.workflow-demo');
const demoButtons = Array.from(demoRoot.querySelectorAll('[data-demo]'));
const stageList = demoRoot.querySelector('.demo-stages');
const artifactHost = demoRoot.querySelector('#demo-artifact');
const backButton = demoRoot.querySelector('#demo-back');
const nextButton = demoRoot.querySelector('#demo-next');
let currentExample = 'property';
let currentStep = 0;

function makeElement(tag, className, content) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (content !== undefined) node.textContent = content;
  return node;
}

function renderArtifact(artifact) {
  const fragment = document.createDocumentFragment();
  const top = makeElement('div', 'artifact-top');
  top.append(makeElement('span', 'mono', artifact.label), makeElement('span', 'artifact-status', artifact.status));
  const rows = makeElement('dl', 'artifact-rows');
  artifact.rows.forEach(([label, value], index) => {
    const row = makeElement('div', 'artifact-row');
    if (index === artifact.selected) row.classList.add('artifact-branch-selected');
    row.append(makeElement('dt', '', label), makeElement('dd', '', value));
    rows.append(row);
  });
  fragment.append(top, rows);
  if (artifact.excerpt) fragment.append(makeElement('blockquote', 'artifact-excerpt', artifact.excerpt));
  fragment.append(makeElement('p', 'artifact-footer', artifact.footer));
  artifactHost.dataset.type = artifact.type;
  artifactHost.replaceChildren(fragment);
}

function showStep(index, announce = true) {
  const stages = workflowExamples[currentExample].stages;
  if (!Number.isInteger(index) || index < 0 || index >= stages.length) return;
  currentStep = index;
  demoRoot.querySelector('.demo-decision').open = false;
  const stage = stages[index];
  stageList.querySelectorAll('button').forEach((button, position) => {
    button.setAttribute('aria-pressed', String(position === index));
    button.classList.toggle('stage-visited', position < index);
  });
  demoRoot.querySelector('#demo-system').textContent = stage.system;
  demoRoot.querySelector('#demo-stage-title').textContent = stage.title;
  demoRoot.querySelector('#demo-counter').textContent = `${index + 1} / ${stages.length}`;
  demoRoot.querySelector('#demo-decision').textContent = stage.decision;
  demoRoot.querySelector('#demo-next-label').textContent = stage.next;
  // Keep the previous control focusable while clearly marking the first boundary.
  backButton.setAttribute('aria-disabled', String(index === 0));
  nextButton.setAttribute('aria-label', stage.next);
  renderArtifact(stage.artifact);
  if (announce) demoRoot.querySelector('#demo-announcement').textContent =
    `Step ${index + 1} of ${stages.length}: ${stage.title}`;
}

function selectExample(key, announce = true) {
  const example = workflowExamples[key];
  if (!example) return;
  currentExample = key;
  demoButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.demo === key)));
  demoRoot.querySelector('#demo-context').textContent = example.context;
  demoRoot.querySelector('#demo-tour-label').textContent = `Walk through ${example.stages.length} stages`;
  demoRoot.querySelector('.demo-decision').open = false;
  const steps = example.stages.map((stage, index) => {
    const item = makeElement('li');
    const button = makeElement('button');
    button.type = 'button';
    button.dataset.step = String(index);
    button.setAttribute('aria-label', `Step ${index + 1} of ${example.stages.length}: ${stage.title}`);
    button.setAttribute('title', stage.title);
    button.append(makeElement('span', 'stage-number', String(index + 1).padStart(2, '0')), makeElement('span', 'stage-name', stage.short));
    button.addEventListener('click', () => showStep(index));
    item.append(button);
    return item;
  });
  stageList.replaceChildren(...steps);
  const detailLink = demoRoot.querySelector('#demo-professional-detail');
  demoRoot.querySelector('#demo-case-study').hidden = key !== 'property';
  detailLink.hidden = key === 'property';
  detailLink.setAttribute('href', `#${example.target}`);
  showStep(0, announce);
}

demoButtons.forEach(button => button.addEventListener('click', () => selectExample(button.dataset.demo)));
backButton.addEventListener('click', () => { if (currentStep > 0) showStep(currentStep - 1); });
nextButton.addEventListener('click', () => {
  const count = workflowExamples[currentExample].stages.length;
  showStep(currentStep === count - 1 ? 0 : currentStep + 1);
});

// Reveal the relevant professional-project details before following an anchor.
function revealProject(id) {
  const target = document.getElementById(id);
  if (!target) return;
  for (let element = target; element; element = element.parentElement) {
    if (element.tagName === 'DETAILS') element.open = true;
  }
}
demoRoot.querySelector('#demo-professional-detail').addEventListener('click', () => {
  revealProject(workflowExamples[currentExample].target);
});
window.addEventListener('hashchange', () => revealProject(location.hash.slice(1)));
revealProject(location.hash.slice(1));
selectExample('property', false);
demoRoot.querySelector('#workflow-interactive').hidden = false;
