const taskInput = document.getElementById("taskInput");
const dueDateInput = document.getElementById("dueDateInput");
const categorySelect = document.getElementById("categorySelect");
const taskList = document.getElementById("taskList");
const addBtn = document.getElementById("addBtn");
const toggleBtn = document.getElementById("themeToggle");

// Filter elements
const filterDate = document.getElementById("filterDate");
const filterWeek = document.getElementById("filterWeek");
const clearFilters = document.getElementById("clearFilters");

let allTasks = [];

window.onload = () => {
  loadTasks();
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "light") {
    document.body.classList.add("light-mode");
    toggleBtn.textContent = "🌙 Dark Mode";
  }
};

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(allTasks));
}

function loadTasks() {
  const saved = JSON.parse(localStorage.getItem("tasks") || "[]");
  allTasks = saved;
  renderTasks(allTasks);
}

function renderTasks(taskArray) {
  taskList.innerHTML = "";
  taskArray.forEach(task => createTaskElement(task.text, task.completed, task.due, task.category));
}

function createTaskElement(text, completed = false, due = "", category = "") {
  const li = document.createElement("li");
  li.classList.add("fade-in");

  const span = document.createElement("span");
  span.textContent = text;
  if (completed) span.classList.add("completed");

  span.onclick = () => {
    span.classList.toggle("completed");
    const t = allTasks.find(t => t.text === text && t.due === due);
    if (t) t.completed = !t.completed;
    saveTasks();
  };

  // Inline editing
  span.ondblclick = () => {
    const input = document.createElement("input");
    input.type = "text";
    input.value = span.textContent;
    input.className = "edit-input";

    input.onblur = () => {
      span.textContent = input.value.trim() || span.textContent;
      const t = allTasks.find(t => t.text === text && t.due === due);
      if (t) t.text = span.textContent;
      input.remove();
      span.style.display = "inline";
      saveTasks();
    };

    input.onkeypress = e => {
      if (e.key === "Enter") input.blur();
    };

    li.insertBefore(input, span);
    span.style.display = "none";
    input.focus();
  };

  const meta = document.createElement("small");
  meta.textContent = `${due || "No date"} • ${category || "No category"}`;

  const delBtn = document.createElement("button");
  delBtn.textContent = "🗑";
  delBtn.onclick = () => {
    li.classList.add("fade-out");
    setTimeout(() => {
      allTasks = allTasks.filter(t => !(t.text === text && t.due === due));
      saveTasks();
      renderTasks(allTasks);
    }, 300);
  };

  li.appendChild(span);
  li.appendChild(meta);
  li.appendChild(delBtn);
  taskList.appendChild(li);
}

function addTask() {
  const text = taskInput.value.trim();
  const due = dueDateInput.value;
  const category = categorySelect.value;
  if (!text) {
    alert("Please enter a task!");
    return;
  }

  const task = { text, completed: false, due, category };
  allTasks.push(task);
  saveTasks();
  renderTasks(allTasks);

  taskInput.value = "";
  dueDateInput.value = "";
  categorySelect.value = "";
}

// Add and enter events
addBtn.addEventListener("click", addTask);
taskInput.addEventListener("keypress", e => {
  if (e.key === "Enter") addTask();
});

// Theme
toggleBtn.onclick = () => {
  document.body.classList.toggle("light-mode");
  const isLight = document.body.classList.contains("light-mode");
  toggleBtn.textContent = isLight ? "🌙 Dark Mode" : "🌞 Light Mode";
  localStorage.setItem("theme", isLight ? "light" : "dark");
};

// Filtering
function applyFilters() {
  let filtered = [...allTasks];
  const date = filterDate.value;
  const week = filterWeek.checked;

  if (date) {
    filtered = filtered.filter(task => task.due === date);
  } else if (week) {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - today.getDay());
    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    filtered = filtered.filter(task => {
      const taskDate = new Date(task.due);
      return task.due && taskDate >= start && taskDate <= end;
    });
  }

  renderTasks(filtered);
}

filterDate.addEventListener("change", applyFilters);
filterWeek.addEventListener("change", () => {
  if (filterWeek.checked) filterDate.value = "";
  applyFilters();
});
clearFilters.addEventListener("click", () => {
  filterDate.value = "";
  filterWeek.checked = false;
  renderTasks(allTasks);
});
