// Week 2: add, move and delete tasks (no saving yet - that's Week 3)
const STATUSES = ["todo", "progress", "done"];

let nextId = 7;
let tasks = [
  { id: 1, title: "Design the login page",  priority: "High",   due: "25 Nov", status: "todo" },
  { id: 2, title: "Write project README",   priority: "Low",    due: "30 Nov", status: "todo" },
  { id: 3, title: "Plan database schema",   priority: "Medium", due: "27 Nov", status: "todo" },
  { id: 4, title: "Build navbar component", priority: "Medium", due: "22 Nov", status: "progress" },
  { id: 5, title: "Fix mobile spacing bugs", priority: "High",   due: "21 Nov", status: "progress" },
  { id: 6, title: "Set up Git repository",  priority: "Low",    due: "18 Nov", status: "done" },
];

const form = document.getElementById("add-form");
const titleInput = document.getElementById("task-title");
const prioritySelect = document.getElementById("task-priority");

function createCard(task) {
  const index = STATUSES.indexOf(task.status);
  const card = document.createElement("article");
  card.className = "task-card";

  const title = document.createElement("h3");
  title.className = "task-title";
  title.textContent = task.title; // textContent keeps user input safe

  const meta = document.createElement("div");
  meta.className = "task-meta";
  meta.innerHTML = `<span class="priority priority-${task.priority.toLowerCase()}">${task.priority}</span>
                    <span>${task.due ? "Due " + task.due : ""}</span>`;

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

function render() {
  STATUSES.forEach((status) => {
    const list = document.getElementById(`list-${status}`);
    const items = tasks.filter((t) => t.status === status);
    list.replaceChildren(...items.map(createCard));
    if (items.length === 0) {
      const empty = document.createElement("p");
      empty.className = "empty";
      empty.textContent = "No tasks here";
      list.append(empty);
    }
    document.getElementById(`count-${status}`).textContent = `(${items.length})`;
  });
}

// Add
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
  render();
});

// Move and delete (one listener for all buttons)
document.querySelector(".board").addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;
  const id = Number(btn.dataset.id);
  const task = tasks.find((t) => t.id === id);
  if (!task) return;

  const index = STATUSES.indexOf(task.status);
  if (btn.dataset.action === "move-forward") task.status = STATUSES[index + 1];
  if (btn.dataset.action === "move-back") task.status = STATUSES[index - 1];
  if (btn.dataset.action === "delete") {
    if (!confirm(`Delete "${task.title}"?`)) return;
    tasks = tasks.filter((t) => t.id !== id);
  }
  render();
});

render();
