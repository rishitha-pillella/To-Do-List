const taskInput = document.getElementById("taskInput");
const priorityInput = document.getElementById("priorityInput");
const dateInput = document.getElementById("dueDateInput");
const searchInput = document.getElementById("searchInput");
const taskList = document.getElementById("taskList");

let tasks = [];

// Load from storage
window.onload = () => {
  const saved = localStorage.getItem("colorTasks");
  if (saved) {
    tasks = JSON.parse(saved);
    tasks.forEach(task => renderTask(task));
  }
};

// Save to localStorage
function saveTasks() {
  localStorage.setItem("colorTasks", JSON.stringify(tasks));
}

// Add Task
function addTask() {
  const text = taskInput.value.trim();
  const due = dateInput.value;
  const priority = priorityInput.value;

  if (!text) return alert("Enter a task");

  const task = {
    id: Date.now().toString(),
    text,
    due,
    priority
  };
  tasks.push(task);
  renderTask(task);
  saveTasks();

  taskInput.value = "";
  dateInput.value = "";
}

// Render Task
function renderTask(task) {
  const li = document.createElement("li");
  li.classList.add(`priority-${task.priority}`);
  li.setAttribute("draggable", "true");
  li.dataset.id = task.id;

  const input = document.createElement("input");
  input.value = task.text;
  input.className = "task-text";
  input.setAttribute("readonly", true);
  input.addEventListener("dblclick", () => input.removeAttribute("readonly"));
  input.addEventListener("input", () => {
    const t = tasks.find(t => t.id === task.id);
    t.text = input.value;
    saveTasks();
  });

  const due = document.createElement("span");
  due.className = "due-date";
  due.textContent = task.due ? `📅 Due: ${new Date(task.due).toLocaleString()}` : "";

  const delBtn = document.createElement("button");
  delBtn.textContent = "×";
  delBtn.className = "delete-btn";
  delBtn.onclick = () => {
    li.classList.add("fade-out");
    setTimeout(() => {
      li.remove();
      tasks = tasks.filter(t => t.id !== task.id);
      saveTasks();
    }, 400);
  };

  li.appendChild(input);
  li.appendChild(due);
  li.appendChild(delBtn);
  taskList.appendChild(li);

  makeDraggable(li);
}

// Search Filter
searchInput.addEventListener("input", () => {
  const query = searchInput.value.toLowerCase();
  [...taskList.children].forEach(li => {
    const text = li.querySelector(".task-text").value.toLowerCase();
    li.style.display = text.includes(query) ? "block" : "none";
  });
});

// Drag and Drop
let draggedItem = null;

function makeDraggable(item) {
  item.addEventListener("dragstart", () => {
    draggedItem = item;
    item.classList.add("dragging");
  });

  item.addEventListener("dragend", () => {
    item.classList.remove("dragging");
    draggedItem = null;
    updateOrder();
  });
}

taskList.addEventListener("dragover", e => {
  e.preventDefault();
  const after = getDragAfterElement(taskList, e.clientY);
  if (after == null) {
    taskList.appendChild(draggedItem);
  } else {
    taskList.insertBefore(draggedItem, after);
  }
});

function getDragAfterElement(container, y) {
  const items = [...container.querySelectorAll("li:not(.dragging)")];
  return items.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - (box.top + box.height / 2);
    return offset < 0 && offset > closest.offset ? { offset, element: child } : closest;
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function updateOrder() {
  const newOrder = [...taskList.children].map(li => li.dataset.id);
  tasks.sort((a, b) => newOrder.indexOf(a.id) - newOrder.indexOf(b.id));
  saveTasks();
}
