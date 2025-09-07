const createBtn = document.getElementById("createBtn");
const createMenu = document.getElementById("createMenu");

createBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  createMenu.style.display =
    createMenu.style.display === "block" ? "none" : "block";
});

document.addEventListener("click", () => {
  createMenu.style.display = "none";
});

document.addEventListener("keydown", (e) => {
  if (e.altKey && e.key.toLowerCase() === "t") {
    alert("New Task Created!");
  }
});

function toggleDropdown(id) {
  const dropdown = document.getElementById(id);
  const arrow = dropdown.previousElementSibling.querySelector(".arrow");
  if (dropdown.style.display === "block") {
    dropdown.style.display = "none";
    arrow.style.transform = "rotate(0deg)";
  } else {
    dropdown.style.display = "block";
    arrow.style.transform = "rotate(180deg)";
  }
}

const navButtons = document.querySelectorAll(".teamspace-row2 button");
const boardView = document.querySelector(".board-view");

navButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    navButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    boardView.style.display = btn.textContent.includes("Board")
      ? "block"
      : "none";
  });
});

const toggleBtn = document.querySelector(".dropdown-toggle");
const menu = document.querySelector(".dropdown-menu");

toggleBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  menu.style.display = menu.style.display === "block" ? "none" : "block";
});

document.addEventListener("click", (e) => {
  if (!toggleBtn.contains(e.target) && !menu.contains(e.target)) {
    menu.style.display = "none";
  }
});

document.querySelectorAll(".add-task").forEach((button) => {
  button.addEventListener("click", () => {
    const wrapper = button.closest(".add-task-wrapper");
    const form = wrapper.querySelector(".task-form");
    form.style.display =
      form.style.display === "none" || form.style.display === ""
        ? "block"
        : "none";

    if (form.style.display === "block") {
      form.querySelector(".task-input").focus();
    }
  });
});

document.querySelectorAll(".task-form").forEach((form) => {
  const saveBtn = form.querySelector(".save-task");
  const cancelBtn = form.querySelector(".cancel-task");
  const input = form.querySelector(".task-input");

  saveBtn.addEventListener("click", () => {
    const column = form.closest(".board-column");
    const taskList = column.querySelector(".task-list");
    const taskText = input.value.trim();

    if (taskText !== "") {
      const newTask = document.createElement("div");
      newTask.classList.add("task-card");
      newTask.setAttribute("draggable", "true");

      // ✅ Updated HTML with footer (left 3 + right 2 icons)
      newTask.innerHTML = `
        <div class="task-header">
          <div class="task-title">${taskText}</div>
          <div class="task-actions">
            <button class="task-action-btn"><i class="fas fa-check"></i></button>
            <button class="task-action-btn"><i class="fas fa-plus"></i></button>
            <button class="task-action-btn"><i class="fas fa-pen"></i></button>
            <button class="task-action-btn"><i class="fas fa-ellipsis-h"></i></button>
          </div>
        </div>
        <div class="task-footer">
          <div class="footer-left">
            <span class="meta-icon"><i class="fas fa-user"></i></span>
            <span class="meta-icon"><i class="fas fa-calendar"></i></span>
            <span class="meta-icon"><i class="fas fa-flag"></i></span>
          </div>
          <div class="footer-right">
            <span class="meta-icon"><i class="fas fa-comment-dots"></i></span>
            <span class="meta-icon"><i class="fas fa-bell"></i></span>
          </div>
        </div>
      `;

      taskList.appendChild(newTask);
      input.value = "";
      form.style.display = "none";
      updateTaskCounts();
      enableDragAndDrop();
    }
  });

  cancelBtn?.addEventListener("click", () => {
    input.value = "";
    form.style.display = "none";
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveBtn.click();
    }
  });
});

function updateTaskCounts() {
  document.querySelectorAll(".board-column").forEach((column) => {
    const taskList = column.querySelector(".task-list");
    const count = taskList ? taskList.children.length : 0;
    column.querySelector(".task-count").textContent = count;
  });
}

window.addEventListener("load", () => {
  const boardBtn = [...navButtons].find((btn) =>
    btn.textContent.includes("Board")
  );
  if (boardBtn) {
    navButtons.forEach((b) => b.classList.remove("active"));
    boardBtn.classList.add("active");
    boardView.style.display = "block";
  }
  enableDragAndDrop();
});

function enableDragAndDrop() {
  const draggables = document.querySelectorAll(".task-card");
  const columns = document.querySelectorAll(".board-column");

  draggables.forEach((card, index) => {
    if (!card.id) {
      card.id = `task-${Date.now()}-${index}`;
    }

    card.setAttribute("draggable", true);

    card.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", card.id);
      e.dataTransfer.effectAllowed = "move";
      card.classList.add("dragging");
    });

    card.addEventListener("dragend", () => {
      card.classList.remove("dragging");
    });
  });

  columns.forEach((column) => {
    column.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      column.classList.add("drag-over");
    });

    column.addEventListener("dragleave", () => {
      column.classList.remove("drag-over");
    });

    column.addEventListener("drop", (e) => {
      e.preventDefault();
      column.classList.remove("drag-over");

      const cardId = e.dataTransfer.getData("text/plain");
      const card = document.getElementById(cardId);
      const taskList = column.querySelector(".task-list");

      if (card && taskList && card.parentElement !== taskList) {
        taskList.appendChild(card);
        updateTaskCounts();
      }
    });
  });
}

// ================= Existing popups remain unchanged =================

// Assignee Popup
const assigneePopup = document.getElementById("assigneePopup");
const assigneeInput = document.getElementById("assigneeInput");
const suggestionsBox = document.getElementById("suggestions");

document.addEventListener("click", (e) => {
  if (e.target.closest(".fa-user") && e.target.closest(".meta-icon")) {
    const icon = e.target.closest(".meta-icon");
    const rect = icon.getBoundingClientRect();

    assigneePopup.style.top = rect.bottom + window.scrollY + "px";
    assigneePopup.style.left = rect.left + window.scrollX + "px";
    assigneePopup.style.display = "block";
    assigneeInput.focus();
  } else if (!assigneePopup.contains(e.target)) {
    assigneePopup.style.display = "none";
  }
});

assigneeInput.addEventListener("focus", () => {
  suggestionsBox.style.display = "block";
});

assigneeInput.addEventListener("blur", () => {
  setTimeout(() => (suggestionsBox.style.display = "none"), 200);
});

document.querySelectorAll(".suggestion-item").forEach((item) => {
  item.addEventListener("click", () => {
    assigneeInput.value = item.textContent;
    assigneePopup.style.display = "none";
  });
});

// Due Date Popup
const dueDatePopup = document.getElementById("dueDatePopup");
let currentDate = new Date();

function renderCalendar(date) {
  const monthYear = document.getElementById("monthYear");
  const calendar = document.getElementById("calendar");
  const year = date.getFullYear();
  const month = date.getMonth();

  monthYear.textContent = date.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  let html = "<tr>";
  const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  daysOfWeek.forEach((d) => (html += `<th>${d}</th>`));
  html += "</tr><tr>";

  for (let i = 0; i < firstDay; i++) {
    html += "<td></td>";
  }

  for (let day = 1; day <= daysInMonth; day++) {
    if ((firstDay + day - 1) % 7 === 0 && day !== 1) html += "</tr><tr>";
    html += `<td>${day}</td>`;
  }

  html += "</tr>";
  calendar.innerHTML = html;
}

document.addEventListener("click", (e) => {
  if (e.target.closest(".fa-calendar") && e.target.closest(".meta-icon")) {
    const icon = e.target.closest(".meta-icon");
    const rect = icon.getBoundingClientRect();

    dueDatePopup.style.top = rect.bottom + window.scrollY + "px";
    dueDatePopup.style.left = rect.left + window.scrollX + "px";
    dueDatePopup.style.display = "block";
    renderCalendar(currentDate);
  } else if (!dueDatePopup.contains(e.target)) {
    dueDatePopup.style.display = "none";
  }
});

document.getElementById("prevMonth").addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar(currentDate);
});

document.getElementById("nextMonth").addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar(currentDate);
});

// Priority Popup
const priorityPopup = document.getElementById("priorityPopup");

document.addEventListener("click", (e) => {
  if (e.target.closest(".fa-flag") && e.target.closest(".meta-icon")) {
    const icon = e.target.closest(".meta-icon");
    const rect = icon.getBoundingClientRect();

    priorityPopup.style.top = rect.bottom + window.scrollY + "px";
    priorityPopup.style.left = rect.left + window.scrollX + "px";
    priorityPopup.style.display = "block";
  } else if (!priorityPopup.contains(e.target)) {
    priorityPopup.style.display = "none";
  }
});

document.querySelectorAll(".priority-item").forEach((item) => {
  item.addEventListener("click", () => {
    priorityPopup.style.display = "none";
  });
});


// ================= Attach Task Events Function =================
function attachTaskEvents(column) {
  const addTaskBtn = column.querySelector(".add-task");
  const taskForm = column.querySelector(".task-form");
  const saveTaskBtn = column.querySelector(".save-task");
  const taskInput = column.querySelector(".task-input");
  const taskList = column.querySelector(".task-list");

  if (!addTaskBtn || !taskForm) return;

  // ✅ Toggle form on Add Task click
  addTaskBtn.addEventListener("click", () => {
    const isFormVisible = window.getComputedStyle(taskForm).display === "block";

    if (isFormVisible) {
      taskForm.style.display = "none";
      taskInput.value = "";
    } else {
      taskForm.style.display = "block";
      taskInput.focus();
    }
  });


  // Save task
  saveTaskBtn.addEventListener("click", () => {
    const taskName = taskInput.value.trim();
    if (!taskName) return;

    const taskItem = document.createElement("div");
    taskItem.classList.add("task-card");
    taskItem.setAttribute("draggable", "true");
    taskItem.innerHTML = `
      <div class="task-header">
        <div class="task-title">${taskName}</div>
        <div class="task-actions">
          <button class="task-action-btn"><i class="fas fa-check"></i></button>
          <button class="task-action-btn"><i class="fas fa-plus"></i></button>
          <button class="task-action-btn"><i class="fas fa-pen"></i></button>
          <button class="task-action-btn"><i class="fas fa-ellipsis-h"></i></button>
        </div>
      </div>
      <div class="task-footer">
        <div class="footer-left">
          <span class="meta-icon"><i class="fas fa-user"></i></span>
          <span class="meta-icon"><i class="fas fa-calendar"></i></span>
          <span class="meta-icon"><i class="fas fa-flag"></i></span>
        </div>
        <div class="footer-right">
          <span class="meta-icon"><i class="fas fa-comment-dots"></i></span>
          <span class="meta-icon"><i class="fas fa-bell"></i></span>
        </div>
      </div>
    `;

    taskList.appendChild(taskItem);
    taskInput.value = "";
    taskForm.style.display = "none";
    addTaskBtn.style.display = "block";

    updateTaskCounts();
    enableDragAndDrop();
  });

  
  // Enter key = save
  taskInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveTaskBtn.click();
    }
  });
}



// ================= Add Group Functionality =================
const addGroupBtn = document.getElementById("addGroupBtn");
const groupInputBox = document.getElementById("groupInputBox");
const boardContainer = document.querySelector(".board-container");
const statusInput = groupInputBox?.querySelector(".status-input");
const selectedColor = document.getElementById("selectedColor");
const colorPicker = document.getElementById("colorPicker");

// Toggle input box when clicking + Add group
if (addGroupBtn && groupInputBox && statusInput) {
  addGroupBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    groupInputBox.style.display =
      groupInputBox.style.display === "block" ? "none" : "block";

    if (groupInputBox.style.display === "block") {
      statusInput.focus();
    }
  });

  // Toggle color picker
  selectedColor.addEventListener("click", (e) => {
    e.stopPropagation();
    colorPicker.style.display =
      colorPicker.style.display === "grid" ? "none" : "grid";
  });

  // Handle color selection
  document.querySelectorAll("#colorPicker .color-option").forEach((option) => {
    option.addEventListener("click", () => {
      const color = option.style.background;
      selectedColor.style.background = color;
      colorPicker.style.display = "none";
    });
  });

  // Hide input & color picker when clicking outside
  document.addEventListener("click", (e) => {
    if (!groupInputBox.contains(e.target) && e.target !== addGroupBtn) {
      groupInputBox.style.display = "none";
      colorPicker.style.display = "none";
    }
  });

  // Press Enter → create new group
  statusInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const groupName = statusInput.value.trim();
      if (!groupName) return;

      const groupColor = selectedColor.style.background;

      const newColumn = document.createElement("div");
newColumn.classList.add("board-column");

newColumn.innerHTML = `
  <div class="board-header">
    <span class="status-label" style="color:${groupColor}; font-weight:600;">
      ${groupName}
    </span>
    <span class="task-count">0</span>
    <span class="options">⋯</span>
  </div>
  <div class="task-list"></div>

  <!-- Add Task Wrapper -->
  <div class="add-task-wrapper">
    <div class="add-task">+ Add Task</div>

    <div class="task-form" style="display: none">
      <div class="task-form-header">
        <input
          type="text"
          placeholder="Task Name..."
          class="task-input"
        />
        <button class="save-task">Save</button>
      </div>

      <div class="task-options">
        <div class="task-option">
          <i class="fas fa-user"></i> Add assignee
        </div>
        <div class="task-option">
          <i class="fas fa-calendar"></i> Add dates
        </div>
        <div class="task-option">
          <i class="fas fa-flag"></i> Add priority
        </div>
      </div>
    </div>
  </div>
`;



      // Insert before the + Add Group wrapper
      boardContainer.insertBefore(
        newColumn,
        document.querySelector(".add-group-wrapper")
      );

      // Reset input
      statusInput.value = "";
      groupInputBox.style.display = "none";

      // Re-attach task logic
      if (typeof attachTaskEvents === "function") attachTaskEvents(newColumn);
      if (typeof updateTaskCounts === "function") updateTaskCounts();
      if (typeof enableDragAndDrop === "function") enableDragAndDrop();
    }
  });
}
