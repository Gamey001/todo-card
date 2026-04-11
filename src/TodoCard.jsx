import { useState, useEffect, useCallback } from 'react'
import './TodoCard.css'

// Fixed due date: April 16 2026 18:00 UTC (submission deadline)
const DUE_DATE = new Date('2026-04-16T18:00:00Z')

const TAGS = [
  { id: 'work',   label: 'Work',   testId: 'test-todo-tag-work' },
  { id: 'urgent', label: 'Urgent', testId: 'test-todo-tag-urgent' },
  { id: 'design', label: 'Design', testId: 'test-todo-tag-design' },
]

function getTimeRemaining(due) {
  const diffMs  = due.getTime() - Date.now()
  const absSec  = Math.abs(Math.round(diffMs / 1000))
  const absMin  = Math.round(absSec / 60)
  const absHr   = Math.round(absSec / 3600)
  const absDays = Math.round(absSec / 86400)

  if (diffMs <= 0) {
    if (absSec < 60)  return { text: 'Due now!',                                                    overdue: false }
    if (absMin < 60)  return { text: `Overdue by ${absMin} minute${absMin !== 1 ? 's' : ''}`,       overdue: true }
    if (absHr  < 24)  return { text: `Overdue by ${absHr} hour${absHr !== 1 ? 's' : ''}`,           overdue: true }
    return               { text: `Overdue by ${absDays} day${absDays !== 1 ? 's' : ''}`,            overdue: true }
  }

  if (absSec < 60)   return { text: 'Due now!',                                                     overdue: false }
  if (absMin < 60)   return { text: `Due in ${absMin} minute${absMin !== 1 ? 's' : ''}`,            overdue: false }
  if (absHr  < 24)   return { text: absHr === 1 ? 'Due in 1 hour' : `Due in ${absHr} hours`,        overdue: false }
  if (absDays === 1) return { text: 'Due tomorrow',                                                  overdue: false }
  return               { text: `Due in ${absDays} days`,                                            overdue: false }
}

function formatDueDate(due) {
  return due.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const PRIORITY_META = {
  High:   { className: 'priority--high',   ariaLabel: 'High priority' },
  Medium: { className: 'priority--medium', ariaLabel: 'Medium priority' },
  Low:    { className: 'priority--low',    ariaLabel: 'Low priority' },
}

export default function TodoCard() {
  const [completed, setCompleted]     = useState(false)
  const [status, setStatus]           = useState('In Progress')
  const [timeLeft, setTimeLeft]       = useState(() => getTimeRemaining(DUE_DATE))

  const priority = 'High'
  const { className: priorityClass, ariaLabel: priorityAriaLabel } = PRIORITY_META[priority]

  const refresh = useCallback(() => setTimeLeft(getTimeRemaining(DUE_DATE)), [])

  useEffect(() => {
    const id = setInterval(refresh, 60_000)
    return () => clearInterval(id)
  }, [refresh])

  function handleToggle(e) {
    const checked = e.target.checked
    setCompleted(checked)
    setStatus(checked ? 'Done' : 'In Progress')
  }

  const statusClass = {
    'Pending':     'status--pending',
    'In Progress': 'status--in-progress',
    'Done':        'status--done',
  }[status]

  return (
    <article
      data-testid="test-todo-card"
      className={`todo-card${completed ? ' todo-card--done' : ''}`}
      aria-label="Todo task card"
    >
      {/* ── Header: checkbox + title + priority ── */}
      <header className="todo-card__header">
        <label className="todo-card__checkbox-label" htmlFor="todo-complete">
          <input
            id="todo-complete"
            type="checkbox"
            data-testid="test-todo-complete-toggle"
            className="todo-card__checkbox"
            checked={completed}
            onChange={handleToggle}
            aria-label="Mark task as complete"
          />
          <span className="todo-card__checkbox-custom" aria-hidden="true" />
        </label>

        <h2
          data-testid="test-todo-title"
          className={`todo-card__title${completed ? ' todo-card__title--done' : ''}`}
        >
          Build a Testable Todo Item Card
        </h2>

        <span
          data-testid="test-todo-priority"
          className={`todo-card__badge ${priorityClass}`}
          aria-label={priorityAriaLabel}
        >
          {priority}
        </span>
      </header>

      {/* ── Description ── */}
      <p data-testid="test-todo-description" className="todo-card__description">
        Design and implement a fully accessible, responsive Todo Card component
        with all required data-testid attributes, semantic HTML, and keyboard
        navigation support for Stage 0 submission.
      </p>

      {/* ── Status ── */}
      <div className="todo-card__meta-row">
        <span className="todo-card__meta-label">Status</span>
        <span
          data-testid="test-todo-status"
          className={`todo-card__badge ${statusClass}`}
          aria-label={`Status: ${status}`}
        >
          {status}
        </span>
      </div>

      {/* ── Due date ── */}
      <div className="todo-card__meta-row">
        <span className="todo-card__meta-label">Due date</span>
        <time
          data-testid="test-todo-due-date"
          className="todo-card__due-date"
          dateTime={DUE_DATE.toISOString()}
          aria-label={`Due date: ${formatDueDate(DUE_DATE)}`}
        >
          Due {formatDueDate(DUE_DATE)}
        </time>
      </div>

      {/* ── Time remaining ── */}
      <div className="todo-card__meta-row">
        <span className="todo-card__meta-label">Time left</span>
        <time
          data-testid="test-todo-time-remaining"
          className={`todo-card__time-remaining${timeLeft.overdue ? ' todo-card__time-remaining--overdue' : ''}`}
          dateTime={DUE_DATE.toISOString()}
          aria-live="polite"
          aria-atomic="true"
          aria-label={timeLeft.text}
        >
          {timeLeft.text}
        </time>
      </div>

      {/* ── Tags ── */}
      <ul
        data-testid="test-todo-tags"
        className="todo-card__tags"
        role="list"
        aria-label="Task tags"
      >
        {TAGS.map(({ id, label, testId }) => (
          <li key={id} role="listitem">
            <span data-testid={testId} className={`todo-card__tag todo-card__tag--${id}`}>
              {label}
            </span>
          </li>
        ))}
      </ul>

      {/* ── Actions ── */}
      <div className="todo-card__actions">
        <button
          data-testid="test-todo-edit-button"
          className="todo-card__btn todo-card__btn--edit"
          type="button"
          aria-label="Edit task"
          onClick={() => console.log('edit clicked')}
        >
          <svg aria-hidden="true" focusable="false" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          Edit
        </button>

        <button
          data-testid="test-todo-delete-button"
          className="todo-card__btn todo-card__btn--delete"
          type="button"
          aria-label="Delete task"
          onClick={() => alert('Delete clicked')}
        >
          <svg aria-hidden="true" focusable="false" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6M14 11v6"/>
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
          </svg>
          Delete
        </button>
      </div>
    </article>
  )
}
