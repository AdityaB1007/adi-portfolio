'use strict';
const projects = {
  "realestate": {
    "category": "FREELANCE / DEPLOYED OPERATIONS AUTOMATION",
    "title": "Real Estate Operations Engine",
    "subtitle": "Connecting leasing, applicant processing, rent reporting, signed agreements, and team workflows.",
    "problem": "Property operations were spread across Buildium, Jira, PandaDoc, and Google Workspace. Relational records, lease deadlines, contract status, and outstanding balances had to be reconciled across disconnected tools.",
    "approach": "Designed and deployed a Google Apps Script integration layer using REST APIs and a central Google Sheets operations hub. Batched data fetching and in-memory relationship mapping prepare consistent records for downstream workflows, while scheduled synchronization and document polling keep operational views up to date.",
    "details": [
      "Synced ERP records into a Google Workspace operations hub for leasing, applicants, and overdue rent.",
      "Connected one-click agreement dispatch, signature tracking, signed PDF archival, and task updates."
    ],
    "metric": "Leasing, contracts, rent reporting, and team tasks connected.",
    "architecture": "<figure class=\"exact-architecture\"><figcaption>Freelance operations architecture</figcaption><a href=\"real-estate-architecture.svg\" aria-label=\"Open the full-size real estate architecture diagram\"><img src=\"real-estate-architecture.svg\" alt=\"Buildium feeds three Google Workspace modules. Leasing and Units syncs directly to Jira. Applicant Pipeline sends agreements through PandaDoc to Google Drive, then attaches signed file links to the same Jira workflow.\"></a><a class=\"text-link\" href=\"real-estate-architecture.svg\">Open full-size diagram ↗</a></figure>",
    "stack": [
      "Google Apps Script",
      "JavaScript / ES6+",
      "REST APIs",
      "JSON",
      "Buildium",
      "Jira Cloud",
      "PandaDoc",
      "Google Sheets",
      "Google Drive"
    ],
    "workstreams": [
      {
        "title": "Applicant pipeline & lease preparation",
        "problem": "Approved applicants, roommates, and custom terms need to be organized before agreements can be prepared.",
        "built": "Grouped roommates, matched units, deduplicated records, and gathered custom lease terms in a one-click action hub.",
        "benefit": "Keeps the applicant handoff and lease preparation in one place."
      },
      {
        "title": "Relational data integration",
        "problem": "Properties, units, tenants, and owners live in nested or separate ERP records that simple connectors struggle to join.",
        "built": "Batch-fetched API datasets, mapped related entities in memory, and staged clean operational records in Google Sheets. Batching was designed around API rate limits and Apps Script quotas.",
        "benefit": "Reduces repeated data transfer and keeps the same relationships available across operational tools."
      },
      {
        "title": "Lease lifecycle & Jira operations",
        "problem": "Lease expiries, turnovers, and maintenance tasks are hard to prioritize across spreadsheets and boards.",
        "built": "Synced leasing records with Jira, tracked unit stages from vacancy through renovation, eviction, and rental, and prioritized tasks using lease expiry dates. Maintenance requests create tasks with resident details and issue photos. Cards include rent and signed document links.",
        "benefit": "Gives teams a visual task pipeline and surfaces approaching deadlines with less manual triage."
      },
      {
        "title": "Agreement generation & archival",
        "problem": "Preparing agreements, requesting signatures, tracking completion, and filing PDFs creates a lengthy sequence of manual steps.",
        "built": "Routed state-specific templates with custom lease terms, deposits, and pet clauses. A one-click action dispatches agreements to tenants and the landlord. Signature tracking triggers executed PDF archival into year/property folders in Drive, with links written to Sheets and attached to Jira.",
        "benefit": "Connects agreement preparation, signature tracking, and document retrieval in one traceable workflow."
      },
      {
        "title": "Aging balances & fee breakdowns",
        "problem": "Overdue rent and fee categories require repeated manual ledger checks before teams can understand outstanding balances.",
        "built": "Synced overdue balances and late fees from the ERP ledger, separated charges into dynamic fee categories, and maintained staff audit logs in the operations hub.",
        "benefit": "Provides a clearer view of aging balances and fee composition without repeatedly rebuilding reports."
      }
    ],
    "note": "Architecture based on my freelance implementation. Business benefits describe the workflows delivered.",
    "role": "Freelance · Workflow architecture and implementation",
    "constraint": "The same property, unit, applicant, and lease information needed to stay useful across an ERP, spreadsheets, task boards, contracts, and file storage.",
    "decisions": [
      [
        "Keep the ERP as the source of record",
        "Buildium feeds a Google Workspace operations hub. Shared entity mapping gives leasing, applications, and rent reporting consistent records before they fan out to other tools.",
        "The hub needs stable relationships and deliberate deduplication as source records change."
      ],
      [
        "Use APIs for predictable operations",
        "Google Apps Script coordinates API calls, scheduled syncs, and one-click actions. Jira handles the team view, PandaDoc handles signatures, and Drive holds executed PDFs.",
        "Each service has its own identifiers, quotas, and completion states. The integration has to reconcile those differences."
      ],
      [
        "Close the loop after signing",
        "Signed PDFs are filed by year and property. Their links are written back to the sheet and attached to Jira.",
        "A signature is one stage of the workflow. Staff also need to find the resulting agreement from the place they already work."
      ]
    ],
    "evaluation": "The delivered workflow connects lease tracking, applicant preparation, agreement dispatch, signed-file archival, and receivables reporting. The architecture below shows the data handoffs. Quantitative time savings were not supplied for this engagement.",
    "reflection": "The integration work sits in the joins between systems—matching units, grouping applicants, tracking a document to completion, and returning its link to the team."
  },
  "secres": {
    "category": "AGENTIC AI / PERSONAL PROJECT",
    "title": "SecRes",
    "subtitle": "Deterministic Multi-Agent Plan-and-Execute Research System",
    "problem": "How can a local-first research agent use small language models without depending on fragile model tool-calling behavior?",
    "approach": "Separated LLM planning from deterministic execution loops. The system uses LangGraph for orchestration, Ollama for local models, FAISS for retrieval, and Streamlit for the interface.",
    "details": [
      "A plan-and-execute architecture separates reasoning from tool execution.",
      "A security gateway uses Microsoft Presidio for PII redaction and Llama Guard to help screen unsafe inputs.",
      "Research steps feed a synthesis workflow designed to keep the output grounded in retrieved information."
    ],
    "metric": "Local-first reasoning. Deterministic execution.",
    "stack": [
      "Python",
      "LangGraph",
      "Ollama",
      "FAISS",
      "Streamlit",
      "Presidio"
    ],
    "repo": "https://github.com/AdityaB1007/SecRes",
    "note": "Architecture summarized from my resume. The project illustration is a conceptual workflow, not a screenshot of the app.",
    "role": "Personal project · Agent orchestration and security gateway",
    "constraint": "Small local models can plan useful research, but their tool-calling behavior can make a multi-step workflow fragile.",
    "decisions": [
      [
        "Separate planning from execution",
        "The model produces a plan. Deterministic execution loops run its steps through LangGraph.",
        "More orchestration logic lives in code, in exchange for less dependence on a model choosing and invoking tools correctly."
      ],
      [
        "Keep a local-first model path",
        "Ollama runs the reasoning models, with FAISS supporting retrieval and Streamlit providing the interface.",
        "Model size and available hardware constrain response quality and latency. Local execution makes those constraints part of the design."
      ],
      [
        "Put checks around the research",
        "Microsoft Presidio redacts personal information, while Llama Guard helps screen unsafe inputs.",
        "These layers reduce specific risks. Research quality still depends on the retrieved material and the checks applied to the synthesis."
      ]
    ],
    "evaluation": "The implemented system combines a plan-and-execute flow, local models, retrieval, and a security gateway. The repository contains the implementation. A comparative quality or latency benchmark was not provided.",
    "reflection": "A useful agent needs an execution strategy as much as a prompt. Here, the model plans while code controls how that plan is carried out."
  },
  "voice": {
    "category": "MACHINE LEARNING / ACADEMIC PROJECT",
    "title": "Fraudulent AI Voice Detection",
    "subtitle": "A real-time pipeline for spoofed vs. bona fide audio.",
    "problem": "Distinguish synthesized voice from genuine audio while keeping the inference pipeline suitable for real-time fraud detection use cases.",
    "approach": "Engineered and selected audio features using ANOVA and Random Forest feature importance, then trained and optimized Random Forest and XGBoost models with cross-validation and hyperparameter tuning.",
    "details": [
      "Reduced feature redundancy to improve generalization.",
      "Reached approximately 98% test accuracy and approximately 97% unseen/validation accuracy.",
      "Designed a low-latency inference pipeline and Flask integration, tested with Postman."
    ],
    "metric": "~97% unseen / validation accuracy",
    "stack": [
      "Python",
      "Librosa",
      "Random Forest",
      "XGBoost",
      "Flask",
      "Postman"
    ],
    "note": "Results are reported in my resume on the project’s test and validation data. They are not a guarantee of performance on other audio sources. The waveform is illustrative.",
    "role": "Academic project · Feature engineering, evaluation, and inference API",
    "constraint": "The model needed to distinguish spoofed speech from genuine audio and carry that decision through a real-time inference interface.",
    "decisions": [
      [
        "Start with the features",
        "ANOVA and Random Forest feature importance informed feature selection. Redundant inputs were reduced before model tuning.",
        "Feature selection changes what the model can learn and how well it generalizes beyond the training data."
      ],
      [
        "Compare and tune model families",
        "Random Forest and XGBoost were trained with cross-validation and hyperparameter tuning.",
        "The evaluation has to support the chosen model. Training accuracy alone would say little about unfamiliar recordings."
      ],
      [
        "Treat inference as part of the project",
        "A Flask API exposes the classifier, with requests exercised through Postman.",
        "An offline classifier becomes useful only when the same feature-processing path can serve a new recording."
      ]
    ],
    "evaluation": "Reported accuracy was approximately 98% on test data and 97% on unseen / validation data. Those figures describe the project datasets. They do not establish a production false-positive rate or measured end-to-end latency.",
    "reflection": "The important boundary is between a strong result on known data and a useful decision on the next recording. Feature consistency and held-out evaluation matter at that boundary."
  },
  "spotify": {
    "category": "RECOMMENDER SYSTEMS / PERSONAL PROJECT",
    "title": "SpotifyXplore",
    "subtitle": "Hybrid music discovery across a 1M+ song dataset.",
    "problem": "Combine personalized recommendations with fast similarity search and flexible metadata filtering for music discovery.",
    "approach": "Combined Neural Collaborative Filtering and K-Means clustering, with a FAISS vector database for high-speed embedding retrieval. A FastAPI backend serves discovery endpoints.",
    "details": [
      "Used a dataset with more than one million songs.",
      "Built metadata filtering, smart search, and similar-track endpoints.",
      "Reported sub-millisecond embedding retrieval using FAISS."
    ],
    "metric": "1M+ songs. Hybrid recommendations.",
    "stack": [
      "Python",
      "PyTorch",
      "FastAPI",
      "FAISS",
      "Scikit-learn",
      "Pandas"
    ],
    "repo": "https://github.com/AdityaB1007/SpotifyXplore",
    "note": "Dataset size and retrieval performance are reported in my resume. The record artwork is a conceptual illustration, not a product screenshot.",
    "role": "Personal project · Recommendation engine and backend API",
    "constraint": "Music discovery needed both personalized recommendations and fast similar-track search across a dataset of more than one million songs.",
    "decisions": [
      [
        "Combine different recommendation signals",
        "Neural Collaborative Filtering models personalization, while K-Means adds a clustering view of the catalogue.",
        "Personal preference and broad similarity answer different discovery questions, so the system uses more than one signal."
      ],
      [
        "Use embeddings for retrieval",
        "FAISS indexes song embeddings to support similar-track lookup.",
        "Fast retrieval is only one part of a recommendation system. The relevance of the embeddings still shapes the result."
      ],
      [
        "Expose discovery through an API",
        "FastAPI serves metadata filters, smart search, and similar-track endpoints.",
        "The product needs controls for exploring the catalogue, alongside the model-generated recommendations."
      ]
    ],
    "evaluation": "The project used a 1M+ song dataset and reported sub-millisecond embedding retrieval. That is a retrieval result, rather than a benchmark for the full API or a measurement of recommendation relevance.",
    "reflection": "A recommendation engine has two jobs—find plausible candidates quickly and make them useful to the listener. The API gives the retrieval layer a practical way into a product."
  }
};

const iconPaths = {
  arrow: 'M7 17 17 7M7 7h10v10',
  close: 'm6 6 12 12M18 6 6 18'
};

function icon(name) {
  return `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${iconPaths[name]}"></path></svg>`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}

const projectDialog = document.querySelector('#project-dialog');
const briefDialog = document.querySelector('#brief-dialog');
const openers = new WeakMap();

function openDialog(dialog, trigger) {
  openers.set(dialog, trigger);
  dialog.showModal();
  dialog.scrollTop = 0;
  document.body.classList.add('modal-open');
  if (dialog === briefDialog) document.dispatchEvent(new Event('brief:opened'));
}

function renderProject(project) {
  const decisions = project.decisions.map(([title, choice, tradeoff], index) => `
    <article class="case-decision">
      <span class="mono">DECISION 0${index + 1}</span>
      <h3>${escapeHtml(title)}</h3>
      <p>${escapeHtml(choice)}</p>
      <p class="case-tradeoff">${escapeHtml(tradeoff)}</p>
    </article>`).join('');
  const workstreams = (project.workstreams || []).map(workstream => `
    <details class="case-workstream">
      <summary>${escapeHtml(workstream.title)}</summary>
      <p>${escapeHtml(workstream.problem)}</p>
      <p>${escapeHtml(workstream.built)}</p>
      <p class="case-benefit">${escapeHtml(workstream.benefit)}</p>
    </details>`).join('');
  return `
    <div class="eyebrow section-kicker">${escapeHtml(project.category)}</div>
    <h2 id="project-title">${escapeHtml(project.title)}</h2>
    <p class="case-subtitle">${escapeHtml(project.subtitle)}</p>
    <p class="case-role">${escapeHtml(project.role)}</p>
    <strong class="metric">${escapeHtml(project.metric)}</strong>
    <section class="case-section"><h3>The brief and the constraint</h3><p>${escapeHtml(project.constraint)}</p></section>
    <section class="case-section"><h3>How the system works</h3><p>${escapeHtml(project.approach)}</p></section>
    ${project.architecture ? `<details class="case-architecture-disclosure"><summary>Explore the full architecture</summary>${project.architecture}</details>` : ''}
    <details class="case-section case-extra"><summary>Decisions and tradeoffs</summary>${decisions}</details>
    ${workstreams ? `<section class="case-section"><h3>Inside the workflows</h3>${workstreams}</section>` : ''}
    <section class="case-section"><h3>Results and evaluation</h3><p>${escapeHtml(project.evaluation)}</p></section>
    <details class="case-section case-extra"><summary>What the design taught me</summary><p>${escapeHtml(project.reflection)}</p></details>
    <div class="tags">${project.stack.map(tool => `<span>${escapeHtml(tool)}</span>`).join('')}</div>
    ${project.repo ? `<a class="button primary" href="${project.repo}">Explore the source ${icon('arrow')}</a>` : ''}
  `;
}

document.querySelectorAll('[data-project]').forEach(button => {
  button.addEventListener('click', () => {
    const project = projects[button.dataset.project];
    document.querySelector('#project-detail').innerHTML = renderProject(project);
    openDialog(projectDialog, button);
  });
});

document.querySelectorAll('dialog').forEach(dialog => {
  dialog.querySelector('.modal-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    const bounds = dialog.getBoundingClientRect();
    const outside = event.clientX < bounds.left || event.clientX > bounds.right ||
      event.clientY < bounds.top || event.clientY > bounds.bottom;
    if (event.target === dialog && outside) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('modal-open');
    openers.get(dialog)?.focus();
  });
});

document.querySelectorAll('[data-filter]').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-filter]').forEach(item => {
      const active = item === button;
      item.classList.toggle('active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    document.querySelectorAll('.project').forEach(card => {
      card.hidden = button.dataset.filter !== 'all' &&
        card.dataset.category !== button.dataset.filter;
    });
  });
});

document.querySelector('#open-brief').addEventListener('click', event => {
  openDialog(briefDialog, event.currentTarget);
});

const waveform = document.querySelector('.waveform');
for (let index = 0; index < 62; index++) {
  const bar = document.createElement('i');
  bar.style.height = `${8 + Math.abs(Math.sin(index * 1.7) * Math.cos(index * .22)) * 100}px`;
  waveform.append(bar);
}
document.querySelector('#year').textContent = new Date().getFullYear();
