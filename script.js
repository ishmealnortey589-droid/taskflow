// Week 4: drag and drop (plus saving, importing, searching)
const STATUSES = ["todo", "progress", "done"];
const STORAGE_KEY = "taskflow-tasks";
const API_URL = "https://jsonplaceholder.typicode.com/todos?_limit=5";

// ---------- Saving and loading ----------
function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch (error) {
    return []; // empty, blocked or corrupted storage: start with an empty board
  }
}

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    showStatus("Could not save your tasks in this browser.", true);
  }
}

let tasks = loadTasks();
let nextId = tasks.reduce((max, t) => Math.max(max, t.id), 0) + 1;

// ---------- Elements ----------
const form = document.getElementById("add-form");
const titleInput = document.getElementById("task-title");
const prioritySelect = document.getElementById("task-priority");
const searchInput = document.getElementById("search");
const filterSelect = document.getElementById("filter-priority");
const importBtn = document.getElementById("import-btn");
const clearBtn = document.getElementById("clear-btn");
const statusEl = document.getElementById("status");

function showStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.classList.toggle("error", isError);
}

// ---------- Rendering ----------
function createCard(task) {
  const index = STATUSES.indexOf(task.status);
  const card = document.createElement("article");
  card.className = "task-card";
  card.draggable = true;
  card.dataset.id = task.id;

  const title = document.createElement("h3");
  title.className = "task-title";
  title.textContent = task.title;

  const meta = document.createElement("div");
  meta.className = "task-meta";
  const badge = document.createElement("span");
  badge.className = `priority priority-${task.priority.toLowerCase()}`;
  badge.textContent = task.priority;
  const due = document.createElement("span");
  due.textContent = task.due ? "Due " + task.due : "";
  meta.append(badge, due);

  const actions = document.createElement("div");
  actions.className = "task-actions";
  if (index > 0) actions.append(makeButton("← Back", "move-back", task.id));
  if (index < STATUSES.length - 1) actions.append(makeButton("Move →", "move-forward", task.id));
  actions.append(makeButton("Delete", "delete", task.id));

  card.append(title, meta, actions);
  return card;
}

function makeButton(label, action, id) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.textContent = label;
  btn.className = action === "delete" ? "delete" : "";
  btn.dataset.action = action;
  btn.dataset.id = id;
  return btn;
}

function getVisibleTasks() {
  const query = searchInput.value.trim().toLowerCase();
  const priority = filterSelect.value;
  return tasks.filter(
    (t) =>
      t.title.toLowerCase().includes(query) &&
      (priority === "all" || t.priority === priority)
  );
}

function render() {
  const visible = getVisibleTasks();
  const filtering = visible.length !== tasks.length;
  STATUSES.forEach((status) => {
    const list = document.getElementById(`list-${status}`);
    const items = visible.filter((t) => t.status === status);
    list.replaceChildren(...items.map(createCard));
    if (items.length === 0) {
      const empty = document.createElement("p");
      empty.className = "empty";
      empty.textContent = filtering ? "No matching tasks" : "No tasks here";
      list.append(empty);
    }
    document.getElementById(`count-${status}`).textContent = `(${items.length})`;
  });
}

// ---------- Add ----------
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const title = titleInput.value.trim();
  if (!title) return;
  tasks.push({
    id: nextId++,
    title,
    priority: prioritySelect.value,
    due: "",
    status: "todo",
  });
  form.reset();
  saveTasks();
  render();
});

// ---------- Move and delete (buttons work with the keyboard) ----------
const board = document.querySelector(".board");

function moveTask(id, status) {
  const task = tasks.find((t) => t.id === id);
  if (!task || task.status === status) return;
  task.status = status;
  saveTasks();
  render();
}

board.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;
  const id = Number(btn.dataset.id);
  const task = tasks.find((t) => t.id === id);
  if (!task) return;

  const action = btn.dataset.action;
  const index = STATUSES.indexOf(task.status);

  if (action === "delete") {
    if (!confirm(`Delete "${task.title}"?`)) return;
    tasks = tasks.filter((t) => t.id !== id);
    saveTasks();
    render();
    return;
  }

  moveTask(id, STATUSES[action === "move-forward" ? index + 1 : index - 1]);

  // Keep keyboard focus on the moved card so users can keep going
  const same = document.querySelector(`button[data-id="${id}"][data-action="${action}"]`);
  (same || document.querySelector(`button[data-id="${id}"]`))?.focus();
});

// ---------- Drag and drop ----------
let draggedId = null;

board.addEventListener("dragstart", (e) => {
  const card = e.target.closest(".task-card");
  if (!card) return;
  draggedId = Number(card.dataset.id);
  e.dataTransfer.setData("text/plain", String(draggedId));
  e.dataTransfer.effectAllowed = "move";
  card.classList.add("dragging");
});

board.addEventListener("dragend", () => {
  draggedId = null;
  document.querySelectorAll(".dragging").forEach((el) => el.classList.remove("dragging"));
  document.querySelectorAll(".drag-over").forEach((el) => el.classList.remove("drag-over"));
});

STATUSES.forEach((status) => {
  const column = document.getElementById(`list-${status}`).closest(".column");

  column.addEventListener("dragover", (e) => {
    if (draggedId === null) return;
    e.preventDefault(); // required, otherwise dropping is not allowed
    e.dataTransfer.dropEffect = "move";
    column.classList.add("drag-over");
  });

  column.addEventListener("dragleave", (e) => {
    if (!column.contains(e.relatedTarget)) column.classList.remove("drag-over");
  });

  column.addEventListener("drop", (e) => {
    e.preventDefault();
    column.classList.remove("drag-over");
    const id = Number(e.dataTransfer.getData("text/plain")) || draggedId;
    moveTask(id, status);
  });
});

// ---------- Import sample tasks ----------
importBtn.addEventListener("click", async () => {
  importBtn.disabled = true;
  showStatus("Importing...");
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(`Request failed (${response.status})`);
    const todos = await response.json();

    const priorities = ["High", "Medium", "Low"];
    todos.forEach((todo, i) => {
      tasks.push({
        id: nextId++,
        title: todo.title,
        priority: priorities[i % priorities.length],
        due: "",
        status: todo.completed ? "done" : "todo",
      });
    });
    saveTasks();
    render();
    showStatus(`Imported ${todos.length} tasks.`);
  } catch (error) {
    showStatus("Couldn't import sample tasks. Check your internet connection and try again.", true);
  } finally {
    importBtn.disabled = false;
  }
});

// ---------- Search and filter (never changes saved data) ----------
searchInput.addEventListener("input", render);
filterSelect.addEventListener("change", render);

// ---------- Clear board ----------
clearBtn.addEventListener("click", () => {
  if (tasks.length === 0) return;
  if (!confirm("Remove all tasks from the board?")) return;
  tasks = [];
  saveTasks();
  render();
  showStatus("Board cleared.");
});

render();
