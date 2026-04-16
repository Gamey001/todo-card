// ── Constants ─────────────────────────────────────────────────
const COLLAPSE_THRESHOLD = 120; // chars — show accordion toggle above this
const PANEL_ANIM_MS = 210; // must match CSS animation duration

// ── State ─────────────────────────────────────────────────────
const state = {
  title: "Build a Testable Todo Item Card",
  description:
    "Designing the basic structure of the Todo Card component. Focus on " +
    "accessibility, semantic HTML, and all required testid attributes. " +
    "This component should be fully keyboard navigable and visually " +
    "appealing across all screen sizes, including mobile, tablet, and " +
    "desktop viewports with no layout breaking.",
  priority: "High", // 'Low' | 'Medium' | 'High'
  dueDate: new Date("2026-04-16T18:00:00Z"),
  status: "In Progress", // 'Pending' | 'In Progress' | 'Done'
  expanded: false,
};

let editSnapshot = null; // saved before entering edit mode
let timerInterval = null;

// ── DOM refs ──────────────────────────────────────────────────
const wrapper = document.getElementById("todo-card-wrapper");
const card = document.getElementById("todo-card");
const viewPanel = document.getElementById("todo-view-panel");
const checkbox = document.getElementById("todo-complete");
const titleEl = document.getElementById("todo-title");
const priorityLabelEl = document.getElementById("todo-priority-label");
const priorityInd = document.getElementById("todo-priority-indicator");
const statusBadge = document.getElementById("todo-status");
const statusControl = document.getElementById("todo-status-control");
const collapsible = document.getElementById("todo-collapsible");
const descEl = document.getElementById("todo-description");
const expandToggle = document.getElementById("todo-expand-toggle");
const toggleLabel = expandToggle.querySelector(".toggle-label");
const editButton = document.getElementById("todo-edit-button");
const deleteButton = document.getElementById("todo-delete-button");
const timeEl = document.getElementById("time-remaining");
const timeText = document.getElementById("time-remaining-text");
const overdueEl = document.getElementById("todo-overdue-indicator");
const dueDateEl = document.getElementById("due-date");
const editForm = document.getElementById("todo-edit-form");
const cancelButton = document.getElementById("todo-cancel-button");
const editTitleInput = document.getElementById("edit-title");
const editDescInput = document.getElementById("edit-description");
const editPriorityEl = document.getElementById("edit-priority");
const editDueDateInput = document.getElementById("edit-due-date");

// ── Helpers ───────────────────────────────────────────────────
function statusClass(s) {
  return (
    {
      Pending: "status--pending",
      "In Progress": "status--in-progress",
      Done: "status--done",
    }[s] || "status--pending"
  );
}

function priorityKey(p) {
  return { High: "high", Medium: "medium", Low: "low" }[p] || "high";
}

function formatDueDate(d) {
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Local-time YYYY-MM-DD string for <input type="date"> */
function toDateInput(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getTimeRemaining(due) {
  const diffMs = due.getTime() - Date.now();
  const absSec = Math.abs(Math.round(diffMs / 1000));
  const absMin = Math.round(absSec / 60);
  const absHr = Math.round(absSec / 3600);
  const absDays = Math.round(absSec / 86400);

  if (diffMs <= 0) {
    if (absSec < 60) return { text: "Due now!", overdue: false };
    if (absMin < 60)
      return {
        text: `Overdue by ${absMin} minute${absMin !== 1 ? "s" : ""}`,
        overdue: true,
      };
    if (absHr < 24)
      return {
        text: `Overdue by ${absHr} hour${absHr !== 1 ? "s" : ""}`,
        overdue: true,
      };
    return {
      text: `Overdue by ${absDays} day${absDays !== 1 ? "s" : ""}`,
      overdue: true,
    };
  }
  if (absSec < 60) return { text: "Due now!", overdue: false };
  if (absMin < 60)
    return {
      text: `Due in ${absMin} minute${absMin !== 1 ? "s" : ""}`,
      overdue: false,
    };
  if (absHr < 24)
    return {
      text: absHr === 1 ? "Due in 1 hour" : `Due in ${absHr} hours`,
      overdue: false,
    };
  if (absDays === 1) return { text: "Due tomorrow", overdue: false };
  return { text: `Due in ${absDays} days`, overdue: false };
}

// ══════════════════════════════════════════════════════
// RENDER
// ══════════════════════════════════════════════════════
function renderAll() {
  const isDone = state.status === "Done";
  const pk = priorityKey(state.priority);

  // ── Card-level state classes ──────────────────────
  card.classList.toggle("todo-card--done", isDone);
  card.classList.toggle(
    "todo-card--in-progress",
    state.status === "In Progress"
  );
  card.classList.remove("todo-card--overdue"); // recalculated by updateTimeRemaining

  // ── Priority wrapper gradient ─────────────────────
  wrapper.className = `todo-card-wrapper wrapper--${pk}`;

  // ── Priority label (top of coloured header band) ──
  const labelMap = {
    High:   "⬥ HIGH PRIORITY",
    Medium: "⬥ MEDIUM PRIORITY",
    Low:    "⬥ LOW PRIORITY",
  };
  priorityLabelEl.textContent = labelMap[state.priority] || state.priority;
  priorityLabelEl.setAttribute("aria-label", `${state.priority} priority`);

  // ── Priority indicator (left bar inside white card)
  priorityInd.className = `todo-card__priority-indicator priority-indicator--${pk}`;

  // ── Title ─────────────────────────────────────────
  titleEl.textContent = state.title;
  titleEl.classList.toggle("todo-card__title--done", isDone);

  // ── Status badge (hidden, for testid compat) ──────
  statusBadge.textContent = state.status;
  statusBadge.className = `todo-card__status-badge ${statusClass(
    state.status
  )} sr-only`;
  statusBadge.setAttribute("aria-label", `Status: ${state.status}`);

  // ── Status control (interactive select) ──────────
  statusControl.value = state.status;
  statusControl.className = `todo-card__status-control ${statusClass(
    state.status
  )}`;

  // ── Checkbox ──────────────────────────────────────
  checkbox.checked = isDone;

  // ── Description + accordion ───────────────────────
  descEl.textContent = state.description;
  refreshAccordion(/* animate = */ false);

  // ── Due date ──────────────────────────────────────
  dueDateEl.textContent = formatDueDate(state.dueDate);
  dueDateEl.setAttribute("datetime", state.dueDate.toISOString());
  dueDateEl.setAttribute(
    "aria-label",
    `Due date: ${formatDueDate(state.dueDate)}`
  );
  timeEl.setAttribute("datetime", state.dueDate.toISOString());

  // ── Time remaining / overdue ──────────────────────
  updateTimeRemaining();
}

/**
 * Sync the accordion toggle and collapsible height with `state.expanded`.
 * @param {boolean} animate  — pass false on initial render to skip transition
 */
function refreshAccordion(animate = true) {
  const isLong = state.description.length > COLLAPSE_THRESHOLD;

  expandToggle.hidden = !isLong;

  if (!animate) {
    // Suppress transition on first paint / after programmatic state changes
    collapsible.style.transition = "none";
    requestAnimationFrame(() => {
      collapsible.style.transition = "";
    });
  }

  if (!isLong) {
    // Short description — always fully open, no toggle needed
    collapsible.classList.remove("todo-card__collapsible--collapsed");
    expandToggle.setAttribute("aria-expanded", "true");
    return;
  }

  // Long description — apply collapsed/expanded class
  collapsible.classList.toggle(
    "todo-card__collapsible--collapsed",
    !state.expanded
  );
  expandToggle.setAttribute("aria-expanded", String(state.expanded));
  toggleLabel.textContent = state.expanded ? "Show less" : "Show more";
}

// ── Time remaining ────────────────────────────────────────────
function updateTimeRemaining() {
  if (state.status === "Done") {
    timeText.textContent = "Completed";
    timeEl.setAttribute("aria-label", "Completed");
    timeEl.classList.remove("todo-card__time-remaining--overdue");
    overdueEl.hidden = true;
    card.classList.remove("todo-card--overdue");
    return;
  }
  const { text, overdue } = getTimeRemaining(state.dueDate);
  timeText.textContent = text;
  timeEl.setAttribute("aria-label", text);
  timeEl.classList.toggle("todo-card__time-remaining--overdue", overdue);
  overdueEl.hidden = !overdue;
  card.classList.toggle("todo-card--overdue", overdue);
}

// ── Timer ─────────────────────────────────────────────────────
function startTimer() {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(updateTimeRemaining, 30_000);
}
function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

// ══════════════════════════════════════════════════════
// STATUS LOGIC  (checkbox ↔ select stay in sync)
// ══════════════════════════════════════════════════════
function setStatus(newStatus) {
  state.status = newStatus;
  newStatus === "Done" ? stopTimer() : startTimer();
  renderAll();
}

checkbox.addEventListener("change", function () {
  setStatus(this.checked ? "Done" : "Pending");
});
statusControl.addEventListener("change", function () {
  setStatus(this.value);
});

// ══════════════════════════════════════════════════════
// ACCORDION TOGGLE
// ══════════════════════════════════════════════════════
expandToggle.addEventListener("click", function () {
  state.expanded = !state.expanded;
  refreshAccordion(/* animate = */ true);
});

// ══════════════════════════════════════════════════════
// PANEL SWAP HELPERS
// Hides/shows view ↔ edit panels with a short fade.
// ══════════════════════════════════════════════════════
function swapToEdit() {
  viewPanel.hidden = true;
  editForm.hidden = false;
  editForm.classList.add("panel--enter-right");
  setTimeout(
    () => editForm.classList.remove("panel--enter-right"),
    PANEL_ANIM_MS + 30
  );
  editButton.setAttribute("aria-expanded", "true");
  editTitleInput.focus();
}

function swapToView() {
  renderAll(); // update DOM before revealing
  editForm.hidden = true;
  viewPanel.hidden = false;
  viewPanel.classList.add("panel--enter-left");
  setTimeout(
    () => viewPanel.classList.remove("panel--enter-left"),
    PANEL_ANIM_MS + 30
  );
  editButton.setAttribute("aria-expanded", "false");
  editButton.focus(); // return focus per a11y spec
}

// ══════════════════════════════════════════════════════
// EDIT MODE
// ══════════════════════════════════════════════════════
function openEdit() {
  // Deep-copy current state before editing so Cancel can fully restore it
  editSnapshot = {
    title: state.title,
    description: state.description,
    priority: state.priority,
    dueDate: new Date(state.dueDate),
    status: state.status,
    expanded: state.expanded,
  };

  // Pre-fill form with current values
  editTitleInput.value = state.title;
  editDescInput.value = state.description;
  editPriorityEl.value = state.priority;
  editDueDateInput.value = toDateInput(state.dueDate);

  swapToEdit();
}

function applyEdit() {
  const newTitle = editTitleInput.value.trim();
  if (newTitle) state.title = newTitle;

  state.description = editDescInput.value;
  state.priority = editPriorityEl.value;

  if (editDueDateInput.value) {
    const [y, mo, d] = editDueDateInput.value.split("-").map(Number);
    state.dueDate = new Date(y, mo - 1, d, 18, 0, 0);
  }

  // After content changes, re-evaluate expand state
  state.expanded = state.description.length <= COLLAPSE_THRESHOLD;

  // Restart timer in case due date changed
  if (state.status !== "Done") startTimer();
}

function restoreSnapshot() {
  state.title = editSnapshot.title;
  state.description = editSnapshot.description;
  state.priority = editSnapshot.priority;
  state.dueDate = new Date(editSnapshot.dueDate);
  state.status = editSnapshot.status;
  state.expanded = editSnapshot.expanded;
}

editButton.addEventListener("click", openEdit);

editForm.addEventListener("submit", function (e) {
  e.preventDefault();
  applyEdit();
  swapToView(); // shows the updated card after the slide animation
});

cancelButton.addEventListener("click", function () {
  restoreSnapshot();
  swapToView(); // shows the unchanged (previously saved) card
});

// Esc also cancels
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape" && !editForm.hidden) {
    restoreSnapshot();
    swapToView();
  }
});

// ══════════════════════════════════════════════════════
// DELETE
// ══════════════════════════════════════════════════════
deleteButton.addEventListener("click", function () {
  if (confirm("Delete this task?")) {
    stopTimer();
    wrapper.remove();
  }
});

// ══════════════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════════════
renderAll();
startTimer();
