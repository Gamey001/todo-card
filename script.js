const DUE_DATE = new Date('2026-04-16T18:00:00Z');

function getTimeRemaining(due) {
  const diffMs  = due.getTime() - Date.now();
  const absSec  = Math.abs(Math.round(diffMs / 1000));
  const absMin  = Math.round(absSec / 60);
  const absHr   = Math.round(absSec / 3600);
  const absDays = Math.round(absSec / 86400);

  if (diffMs <= 0) {
    if (absSec < 60) return { text: 'Due now!',                                              overdue: false };
    if (absMin < 60) return { text: `Overdue by ${absMin} minute${absMin !== 1 ? 's' : ''}`, overdue: true  };
    if (absHr  < 24) return { text: `Overdue by ${absHr} hour${absHr !== 1 ? 's' : ''}`,     overdue: true  };
    return               { text: `Overdue by ${absDays} day${absDays !== 1 ? 's' : ''}`,     overdue: true  };
  }

  if (absSec < 60)   return { text: 'Due now!',                                              overdue: false };
  if (absMin < 60)   return { text: `Due in ${absMin} minute${absMin !== 1 ? 's' : ''}`,     overdue: false };
  if (absHr  < 24)   return { text: absHr === 1 ? 'Due in 1 hour' : `Due in ${absHr} hours`, overdue: false };
  if (absDays === 1) return { text: 'Due tomorrow',                                           overdue: false };
  return               { text: `Due in ${absDays} days`,                                     overdue: false };
}

function formatDueDate(due) {
  return due.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Populate due date on load
document.getElementById('due-date').textContent = formatDueDate(DUE_DATE);

// Update time remaining
function updateTimeRemaining() {
  const { text, overdue } = getTimeRemaining(DUE_DATE);
  const el   = document.getElementById('time-remaining');
  const span = document.getElementById('time-remaining-text');
  span.textContent = text;
  el.setAttribute('aria-label', text);
  el.classList.toggle('todo-card__time-remaining--overdue', overdue);
}

updateTimeRemaining();
setInterval(updateTimeRemaining, 60_000);

// Checkbox toggle
document.getElementById('todo-complete').addEventListener('change', function () {
  const done   = this.checked;
  const card   = document.getElementById('todo-card');
  const title  = document.getElementById('todo-title');
  const status = document.getElementById('todo-status');

  card.classList.toggle('todo-card--done', done);
  title.classList.toggle('todo-card__title--done', done);

  if (done) {
    status.textContent = 'Done';
    status.className   = 'todo-card__status-badge status--done';
    status.setAttribute('aria-label', 'Status: Done');
  } else {
    status.textContent = 'In Progress';
    status.className   = 'todo-card__status-badge status--in-progress';
    status.setAttribute('aria-label', 'Status: In Progress');
  }
});

function handleEdit()   { console.log('edit clicked'); }
function handleDelete() { alert('Delete clicked'); }
