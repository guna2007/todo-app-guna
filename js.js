// roadmap
// 1.take input from form and console it ::ok
// 2.add it to the parent div ::ok
// 3.delete tasks ::ok
// 4.strike when completed ::ok
// 5.animation when delted or added ::ok
// 6.add a caption and remove it when a task is added ::ok
// 7.pin to top ::ok
// 8.fadein only for new task ::ok

let taskcount = 0;
let tasks = [];
let currentFilter = 'all';


let addform = document.getElementById("addform");
let task = document.getElementById("task");
let displaytasks = document.querySelector(".displaytasks");
let caption = document.querySelector(".caption");

function isnotask() {
  if (taskcount !== 0) {
    caption.classList.add("invisible");
  } else {
    caption.classList.remove("invisible");
  }
}

function saveTasksToLocal() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function setFilter(filterType) {
  currentFilter = filterType;
  renderTasks();

  // Update active class on buttons
  const allFilterButtons = document.querySelectorAll(".filters button");
  allFilterButtons.forEach(btn => btn.classList.remove("active"));

  const activeBtn = document.getElementById(`filter-${filterType}`);
  if (activeBtn) {
    activeBtn.classList.add("active");
  }
}


function renderTasks(animateNew = false, newTaskId = null) {
  displaytasks.innerHTML = "";

  let filteredTasks = tasks.slice(); // clone array

  // Apply filter
  if (currentFilter === 'completed') {
    filteredTasks = filteredTasks.filter(task => task.completed);
  } else if (currentFilter === 'incomplete') {
    filteredTasks = filteredTasks.filter(task => !task.completed);
  }

  // Sorting
  if (currentFilter === 'newest') {
    filteredTasks.sort((a, b) => b.id - a.id);
  } else if (currentFilter === 'oldest') {
    filteredTasks.sort((a, b) => a.id - b.id);
  } else {
    // Default: Pinned first, then rest
    filteredTasks.sort((a, b) => b.pinned - a.pinned);
  }

  // Render each task
  filteredTasks.forEach(taskObj => {
    const newtask = document.createElement("p");
    newtask.classList.add("eachtask");
    if (taskObj.completed) newtask.classList.add("deleted");
    if (taskObj.pinned) newtask.classList.add("pinned");

    newtask.innerHTML = `
  <div class="eachtask-top">
    <span class="timestamp">${taskObj.time || "--:--"}</span>
    <input id="iscomplete" type="checkbox" data-id="${taskObj.id}" ${taskObj.completed ? "checked" : ""}>
    <span class="text">${taskObj.text}</span>
  </div>
  <div class="eachtask-bottom">
    <button id="pinbutton" onclick="togglePin(this)" data-id="${taskObj.id}">${taskObj.pinned ? "⭐" : "☆"}</button>
    <button id="deletebutton" onclick="deletetask(this)" data-id="${taskObj.id}">❌</button>
  </div>
`;


    if (animateNew && taskObj.id === newTaskId) {
      newtask.classList.add("fadein");
    }

    displaytasks.appendChild(newtask);
  });

  // ✅ This part must be after the loop
  if (filteredTasks.length === 0) {
    caption.textContent = "No tasks available.";
    caption.classList.remove("invisible");
  } else {
    caption.textContent = "Add some tasks...";
    caption.classList.add("invisible");
  }
}



function togglePin(button) {
  const id = Number(button.getAttribute("data-id"));
  tasks = tasks.map(task =>
    task.id === id ? { ...task, pinned: !task.pinned } : task
  );
  saveTasksToLocal();
  renderTasks(); // no animation
}

function deletetask(button) {
  const id = Number(button.getAttribute("data-id"));
  tasks = tasks.filter(task => task.id !== id);
  taskcount--;
  saveTasksToLocal();

  // ✅ Fix: find the full .eachtask wrapper
  let taskElem = button.closest(".eachtask");
  if (!taskElem) return;

  taskElem.classList.add("fadeout");
  taskElem.addEventListener("animationend", () => {
    taskElem.remove();
    isnotask();
  });
}


addform.addEventListener("submit", (event) => {
  event.preventDefault();
  if (task.value.trim() === "") {
    alert("Enter Valid Task....");
    return;
  }


const now = new Date();

let taskObj = {
  id: Date.now(),
  text: task.value.trim(),
  completed: false,
  pinned: false,
  time: now.getHours().toString().padStart(2, '0') + ":" + now.getMinutes().toString().padStart(2, '0')
};

  tasks.push(taskObj);
  taskcount++;
  saveTasksToLocal();
  renderTasks(true, taskObj.id); // animate only new task
  addform.reset();
  isnotask();
  document.body.scrollTop = document.body.scrollHeight - 100;
});

displaytasks.addEventListener("click", (event) => {
  if (event.target.id === "iscomplete") {
    const id = Number(event.target.getAttribute("data-id"));
    let taskElem = event.target.parentElement;
    const taskObj = tasks.find(task => task.id === id);
    taskObj.completed = event.target.checked;

    if (event.target.checked) {
      taskElem.classList.remove("undo");
      taskElem.classList.add("deleted");
    } else {
      taskElem.classList.remove("deleted");
      taskElem.classList.add("undo");
    }

    saveTasksToLocal();
  }
});

window.onload = () => {
  const stored = localStorage.getItem("tasks");
  if (stored) {
    tasks = JSON.parse(stored);
    taskcount = tasks.length;
    renderTasks(); // no animation on load
    isnotask();
  }
};
