// ------------------ MENU TOGGLING ------------------
const createBtn = document.getElementById("createBtn");
const createMenu = document.getElementById("createMenu");

createBtn?.addEventListener("click", (e) => {
  e.stopPropagation();
  createMenu.style.display =
    createMenu.style.display === "block" ? "none" : "block";
});

document.addEventListener("click", () => {
  if (createMenu) createMenu.style.display = "none";
});

document.addEventListener("keydown", (e) => {
  if (e.altKey && e.key.toLowerCase() === "t") {
    alert("New Task Created!");
  }
});

function toggleDropdown(id) {
  const dropdown = document.getElementById(id);
  if (!dropdown) return;
  const arrow = dropdown.previousElementSibling?.querySelector(".arrow");
  if (dropdown.style.display === "block") {
    dropdown.style.display = "none";
    if (arrow) arrow.style.transform = "rotate(0deg)";
  } else {
    dropdown.style.display = "block";
    if (arrow) arrow.style.transform = "rotate(180deg)";
  }
}

// ------------------ NAVIGATION ------------------
const navButtons = document.querySelectorAll(".teamspace-row2 button");
const boardView = document.querySelector(".board-view");

navButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    navButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    if (boardView)
      boardView.style.display = btn.textContent.includes("Board")
        ? "block"
        : "none";
  });
});

const toggleBtn = document.querySelector(".dropdown-toggle");
const menu = document.querySelector(".dropdown-menu");

toggleBtn?.addEventListener("click", (e) => {
  e.stopPropagation();
  if (!menu) return;
  menu.style.display = menu.style.display === "block" ? "none" : "block";
});

document.addEventListener("click", (e) => {
  if (
    toggleBtn &&
    menu &&
    !toggleBtn.contains(e.target) &&
    !menu.contains(e.target)
  ) {
    menu.style.display = "none";
  }
});

// ------------------ GLOBAL STATE ------------------
let currentTaskCard = null;

const taskComments = new Map(); // optional separate store
// Drawer references (acquired later if present)
const drawerEl = document.getElementById("taskDrawer");
const drawerTitleEl =
  drawerEl?.querySelector(".drawer-title") ||
  document.getElementById("taskTitle"); // fallback
const statusPillEl = drawerEl?.querySelector(".pill--status");
const markDoneBtn = drawerEl?.querySelector(".chip--check");
const activityList = drawerEl?.querySelector(".activity__list");
const composerBox = drawerEl?.querySelector(".composer__box");
const composerSendBtn = drawerEl?.querySelector(".composer .btn--primary");

// statuses for the picker
let statuses = [
  { key: "todo", label: "TO DO" },
  { key: "inprogress", label: "IN PROGRESS" },
  { key: "complete", label: "COMPLETE" },
];

function normalizeKey(name) {
  return name.toLowerCase().replace(/\s+/g, "");
}
function addStatus(name) {
  statuses.push({ key: normalizeKey(name), label: name.toUpperCase() });
}

// ------------------ GROUP CREATION ------------------
const addGroupBtn = document.getElementById("addGroupBtn");
const groupInputBox = document.getElementById("groupInputBox");
const boardContainer = document.querySelector(".board-container");
const statusInput = groupInputBox?.querySelector(".status-input");
const selectedColor = document.getElementById("selectedColor");
const colorPicker = document.getElementById("colorPicker");

if (addGroupBtn && groupInputBox && statusInput) {
  addGroupBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    groupInputBox.style.display =
      groupInputBox.style.display === "block" ? "none" : "block";
    if (groupInputBox.style.display === "block") statusInput.focus();
  });

  selectedColor.addEventListener("click", (e) => {
    e.stopPropagation();
    colorPicker.style.display =
      colorPicker.style.display === "grid" ? "none" : "grid";
  });

  document.querySelectorAll("#colorPicker .color-option").forEach((option) => {
    option.addEventListener("click", () => {
      const color = option.style.background;
      selectedColor.style.background = color;
      colorPicker.style.display = "none";
    });
  });

  document.addEventListener("click", (e) => {
    if (!groupInputBox.contains(e.target) && e.target !== addGroupBtn) {
      groupInputBox.style.display = "none";
      colorPicker.style.display = "none";
    }
  });

  statusInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const groupName = statusInput.value.trim();
      if (!groupName) return;
      const groupColor = selectedColor.style.background;

      const newColumn = document.createElement("div");
      const normalizedName = groupName.toLowerCase().replace(/\s+/g, "");
      newColumn.className = `board-column ${normalizedName}`;
      newColumn.innerHTML = `
        <div class="board-header">
          <span class="status-label" style="color:${groupColor}; font-weight:600;">
            ${groupName}
          </span>
          <span class="task-count">0</span>
          <span class="options">⋯</span>
        </div>
        <div class="task-list"></div>
        <div class="add-task-wrapper">
          <div class="add-task">+ Add Task</div>
          <div class="task-form" style="display:none;">
            <div class="task-form-header">
              <input type="text" placeholder="Task Name..." class="task-input" />
              <button class="save-task">Save</button>
            </div>
            <div class="task-options">
              <div class="task-option"><i class="fas fa-user"></i> Add assignee</div>
              <div class="task-option"><i class="fas fa-calendar"></i> Add dates</div>
              <div class="task-option"><i class="fas fa-flag"></i> Add priority</div>
            </div>
          </div>
        </div>
      `;

      boardContainer.insertBefore(
        newColumn,
        document.querySelector(".add-group-wrapper")
      );
      attachTaskEvents(newColumn);
      updateTaskCounts();

      statusInput.value = "";
      groupInputBox.style.display = "none";
    }
  });
}

// ------------------ HELPERS ------------------
function generateTaskId() {
  return "task-" + Math.random().toString(36).substr(2, 9);
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function updateTaskCounts() {
  document.querySelectorAll(".board-column").forEach((column) => {
    const taskList = column.querySelector(".task-list");
    const count = taskList ? taskList.children.length : 0;
    const countEl = column.querySelector(".task-count");
    if (countEl) countEl.textContent = count;
  });
}

function updateTaskBadge(taskCard, count) {
  if (!taskCard) return;
  const badge =
    taskCard.querySelector(".notification .badge") ||
    taskCard.querySelector(".meta-icon.notification .badge");
  if (!badge) return;
  if (count > 0) {
    badge.style.display = "inline-block";
    badge.textContent = count > 9 ? "9+" : String(count);
  } else {
    badge.style.display = "none";
  }
}

function updateChatBadge(taskCard, count) {
  if (!taskCard) return;
  const badge =
    taskCard.querySelector(".chat .badge") ||
    taskCard.querySelector(".meta-icon.chat .badge");
  if (!badge) return;
  if (count > 0) {
    badge.style.display = "inline-block";
    badge.textContent = count > 9 ? "9+" : String(count);
  } else {
    badge.style.display = "none";
  }
}

function getCommentsArrayFromCard(card) {
  try {
    return JSON.parse(card.dataset.comments || "[]");
  } catch {
    return [];
  }
}
function saveCommentsArrayToCard(card, arr) {
  card.dataset.comments = JSON.stringify(arr);
}

function getNotificationsArrayFromCard(card) {
  try {
    return JSON.parse(card.dataset.notifications || "[]");
  } catch {
    return [];
  }
}
function saveNotificationsArrayToCard(card, arr) {
  card.dataset.notifications = JSON.stringify(arr);
}

// ------------------ DRAG & DROP ------------------
function enableDragAndDrop() {
  const draggables = document.querySelectorAll(".task-card");
  const columns = document.querySelectorAll(".board-column");

  // make every card draggable
  draggables.forEach((card) => {
    if (!card.id) card.id = generateTaskId();
    card.setAttribute("draggable", true);

    if (!card.__dragHandlersAttached) {
      card.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/plain", card.id);
        e.dataTransfer.effectAllowed = "move";
        card.classList.add("dragging");
      });

      card.addEventListener("dragend", () => {
        card.classList.remove("dragging");
      });

      card.__dragHandlersAttached = true;
    }
  });

  // allow drop on both column + task-list
  columns.forEach((column) => {
    const taskList = column.querySelector(".task-list");
    if (!taskList) return;

    if (!column.__dropHandlersAttached) {
      // dragover on column (handles empty space)
      column.addEventListener("dragover", (e) => {
        e.preventDefault();
        column.classList.add("drag-over");
      });

      column.addEventListener("dragleave", () => {
        column.classList.remove("drag-over");
      });

      // drop on column
      column.addEventListener("drop", (e) => handleDrop(e, column, taskList));

      // drop on taskList (when cards already exist)
      taskList.addEventListener("dragover", (e) => {
        e.preventDefault();
        column.classList.add("drag-over");
      });

      taskList.addEventListener("drop", (e) => handleDrop(e, column, taskList));

      column.__dropHandlersAttached = true;
    }
  });

  function handleDrop(e, column, taskList) {
    e.preventDefault();
    column.classList.remove("drag-over");

    const id = e.dataTransfer.getData("text/plain");
    const draggedCard = document.getElementById(id);

    if (draggedCard) {
      taskList.appendChild(draggedCard);

      const status =
        column
          .querySelector(".status-label")
          ?.textContent.trim()
          .toLowerCase()
          .replace(/\s+/g, "") || "";

      if (status) draggedCard.dataset.status = status;

      updateTaskCounts();
    }
  }
}

// ------------------ TASK CARD CLICK (Drawer open) ------------------
// central handler - works for existing and newly created tasks
function attachTaskCardClick(taskCard) {
  if (!taskCard) return;
  if (taskCard.__clickAttached) return;

  taskCard.addEventListener("click", (e) => {
    // ignore clicks on interactive elements
    if (
      e.target.closest(".task-action-btn") ||
      e.target.closest(".no-drawer") ||
      e.target.closest("button") ||
      e.target.closest(".fa-user") || // ✅ assignee
      e.target.closest(".fa-calendar") || // ✅ due date
      e.target.closest(".fa-flag") // ✅ priority
    ) {
      return; // icons ya buttons ka apna popup chale, drawer na khule
    }
    currentTaskCard = taskCard;
    openDrawer(taskCard);
  });

  taskCard.__clickAttached = true;
}

// Attach click to all cards in a container
function attachTaskCardClicksIn(container) {
  container.querySelectorAll?.(".task-card").forEach(attachTaskCardClick);
}

// ------------------ TASK CREATION (per column) ------------------
function attachTaskEvents(column) {
  if (!column) return;
  const addTaskBtn = column.querySelector(".add-task");
  const taskForm = column.querySelector(".task-form");
  const saveTaskBtn = column.querySelector(".save-task");
  const taskInput = column.querySelector(".task-input");
  const taskList = column.querySelector(".task-list");

  if (!addTaskBtn || !taskForm || !saveTaskBtn || !taskInput || !taskList)
    return;

  // toggle form
  if (!addTaskBtn.__toggleAttached) {
    addTaskBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isVisible = window.getComputedStyle(taskForm).display === "block";
      if (isVisible) {
        taskForm.style.display = "none";
        addTaskBtn.style.display = "block";
        taskInput.value = "";
      } else {
        taskForm.style.display = "block";
        addTaskBtn.style.display = "block";
        taskInput.focus();
      }
    });
    addTaskBtn.__toggleAttached = true;
  }

  // close form when clicking outside
  if (!taskForm.__outsideCloseAttached) {
    document.addEventListener("click", (e) => {
      if (
        taskForm.style.display === "block" &&
        !taskForm.contains(e.target) &&
        !addTaskBtn.contains(e.target)
      ) {
        taskForm.style.display = "none";
        addTaskBtn.style.display = "block";
        taskInput.value = "";
      }
    });
    taskForm.__outsideCloseAttached = true;
  }

  // save task
  if (!saveTaskBtn.__saveAttached) {
    saveTaskBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const taskName = taskInput.value.trim();
      if (!taskName) return;

      const taskItem = document.createElement("div");
      taskItem.className = "task-card";
      taskItem.id = generateTaskId();
      taskItem.setAttribute("draggable", "true");
      taskItem.innerHTML = `
        <div class="task-header">
          <div class="task-title">${escapeHtml(taskName)}</div>
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
            <span class="meta-icon chat">
              <i class="fas fa-comment-dots"></i>
              <span class="badge" style="display:none">0</span>
            </span>
            <span class="meta-icon notification">
              <i class="fas fa-bell"></i>
              <span class="badge" style="display:none">0</span>
            </span>
          </div>
        </div>
      `;

      // initialize datasets
      taskItem.dataset.comments = JSON.stringify([]);
      taskItem.dataset.notifications = JSON.stringify([]);
      taskItem.dataset.attachments = "0";
      taskItem.dataset.status = "todo";

      taskList.appendChild(taskItem);

      // attach click & drag to the new card
      attachTaskCardClick(taskItem);
      enableDragAndDrop();

      // close form and reset
      taskInput.value = "";
      taskForm.style.display = "none";
      addTaskBtn.style.display = "block";

      updateTaskCounts();
    });
    saveTaskBtn.__saveAttached = true;
  }

  // enter = save
  if (!taskInput.__enterAttached) {
    taskInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        saveTaskBtn.click();
      }
    });
    taskInput.__enterAttached = true;
  }

  // ensure existing cards in this column have click handlers
  attachTaskCardClicksIn(column);
}

function initAttachmentUpload() {
  const fileInput = document.getElementById("fileInput");
  const uploadLink = document.getElementById("uploadLink");
  const preview = document.getElementById("preview");
  const dropArea = document.querySelector(".attachment-drop");

  if (!fileInput || !uploadLink || !preview || !dropArea) return;

  // Upload link click
  uploadLink.addEventListener("click", (e) => {
    e.preventDefault();
    fileInput.click();
  });

  // File select hone par
  fileInput.addEventListener("change", () => {
    Array.from(fileInput.files).forEach((file) => {
      const item = document.createElement("div");
      item.classList.add("preview-item");

      // Agar image hai to thumbnail
      if (file.type.startsWith("image/")) {
        const img = document.createElement("img");
        img.src = URL.createObjectURL(file);
        item.appendChild(img);
      }

      // File name
      const name = document.createElement("span");
      name.textContent = file.name;
      item.appendChild(name);

      preview.appendChild(item);
    });
  });

  // Drag & Drop support
  dropArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropArea.classList.add("drag-over");
  });

  dropArea.addEventListener("dragleave", () => {
    dropArea.classList.remove("drag-over");
  });

  dropArea.addEventListener("drop", (e) => {
    e.preventDefault();
    dropArea.classList.remove("drag-over");

    const files = e.dataTransfer.files;
    fileInput.files = files;
    fileInput.dispatchEvent(new Event("change"));
  });
}

function initAttachmentPreview() {
  const fileInput = document.getElementById("fileInput");
  const uploadLink = document.getElementById("uploadLink");
  const preview = document.getElementById("preview");
  const dropArea = document.getElementById("dropArea");

  if (!fileInput || !uploadLink || !preview || !dropArea) return; // safety check

  // Click on "upload" link
  uploadLink.addEventListener("click", (e) => {
    e.preventDefault();
    fileInput.click();
  });

  // Handle file input
  fileInput.addEventListener("change", (e) => {
    handleFiles(e.target.files);
    fileInput.value = ""; // reset so same file can be uploaded again
  });

  // Handle drag & drop
  dropArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropArea.classList.add("drag-over");
  });

  dropArea.addEventListener("dragleave", () => {
    dropArea.classList.remove("drag-over");
  });

  dropArea.addEventListener("drop", (e) => {
    e.preventDefault();
    dropArea.classList.remove("drag-over");
    handleFiles(e.dataTransfer.files);
  });

  // Function to preview files
  function handleFiles(files) {
    for (let file of files) {
      const fileContainer = document.createElement("div");
      fileContainer.classList.add("file-item");

      // File name
      const fileName = document.createElement("span");
      fileName.textContent = file.name;
      fileContainer.appendChild(fileName);

      // Thumbnail if image
      if (file.type.startsWith("image/")) {
        const img = document.createElement("img");
        img.src = URL.createObjectURL(file);
        img.onload = () => URL.revokeObjectURL(img.src); // free memory
        img.classList.add("thumb");
        fileContainer.appendChild(img);
      }

      preview.appendChild(fileContainer);
    }
  }
}

// ------------------ OPEN / CLOSE DRAWER ------------------
function openDrawer(taskCard) {
  if (!drawerEl) return;
  // set title
  const titleEl = drawerTitleEl;
  const titleText =
    taskCard.querySelector(".task-title")?.textContent || "Task";
  if (titleEl) titleEl.textContent = titleText;

  // attach dataset to drawer for reference
  drawerEl.dataset.taskId = taskCard.id;

  // render existing comments and notifications (if any)
  renderActivityForTask(taskCard);

  drawerEl.classList.add("show"); // your code toggles .show elsewhere; keep consistent
}

function closeDrawer() {
  if (!drawerEl) return;
  drawerEl.classList.remove("show");
  currentTaskCard = null;
}

document
  .getElementById("closeTaskDrawer")
  ?.addEventListener("click", closeDrawer);
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeDrawer();
});

// ------------------ ACTIVITY / COMMENTS / NOTIFICATIONS ------------------
function renderActivityForTask(taskCard) {
  if (!activityList) return;
  // clear old generated entries
  activityList
    .querySelectorAll(".generated-comment, .generated-notification")
    .forEach((el) => el.remove());

  // comments
  const comments = getCommentsArrayFromCard(taskCard);
  comments.forEach((c) => {
    const li = document.createElement("li");
    li.className = "activity__item activity__card generated-comment";
    li.innerHTML = `
      <div class="avatar">S</div>
      <div class="card">
        <div class="card__head">
          <span class="author">you</span>
          <time>${c.time || new Date().toLocaleString()}</time>
        </div>
        <div class="card__body">${escapeHtml(c.text || c)}</div>
      </div>
    `;
    activityList.appendChild(li);
  });

  // notifications (uploads)
  const notifs = getNotificationsArrayFromCard(taskCard);
  notifs.forEach((n) => {
    const li = document.createElement("li");
    li.className = "activity__item activity__card generated-notification";

    // check if file is image
    let bodyHtml = `Uploaded file: <strong>${escapeHtml(n.fileName)}</strong>`;
    if (n.type && n.type.startsWith("image/") && n.url) {
      bodyHtml += `<div class="preview-thumb">
                   <img src="${n.url}" alt="${escapeHtml(
        n.fileName
      )}" style="max-width:120px; border-radius:6px; margin-top:4px;">
                 </div>`;
    }

    li.innerHTML = `
    <div class="avatar">S</div>
    <div class="card">
      <div class="card__head">
        <span class="author">you</span>
        <time>${n.time}</time>
      </div>
      <div class="card__body">${bodyHtml}</div>
    </div>
  `;
    activityList.appendChild(li);
  });
}

// composer send (comments)
composerSendBtn?.addEventListener("click", () => {
  if (!currentTaskCard || !composerBox) return;
  const text = composerBox.innerText.trim();
  if (!text || text === "Write a comment...") return;

  const time = new Date().toLocaleString();
  const arr = getCommentsArrayFromCard(currentTaskCard);
  arr.push({ text, time });
  saveCommentsArrayToCard(currentTaskCard, arr);

  // update UI: activity list + badge
  if (activityList) {
    const li = document.createElement("li");
    li.className = "activity__item activity__card generated-comment";
    li.innerHTML = `
      <div class="avatar">S</div>
      <div class="card">
        <div class="card__head">
          <span class="author">you</span>
          <time>${time}</time>
        </div>
        <div class="card__body">${escapeHtml(text)}</div>
      </div>
    `;
    activityList.appendChild(li);
  }

  updateChatBadge(currentTaskCard, arr.length);
  composerBox.innerText = "";
});

// composer placeholder behavior
if (composerBox) {
  composerBox.addEventListener("focus", () => {
    if (composerBox.innerText.trim() === "Write a comment...")
      composerBox.innerText = "";
  });
  composerBox.addEventListener("blur", () => {
    if (!composerBox.innerText.trim())
      composerBox.innerText = "Write a comment...";
  });
}

// ------------------ FILE UPLOADS / ATTACHMENTS ------------------
// drawer file input
const drawerFileInput = document.getElementById("drawerFileInput");
drawerFileInput?.addEventListener("change", (e) => {
  if (!currentTaskCard) {
    // attempt to get task from drawer dataset if not set
    const id = drawerEl?.dataset.taskId;
    if (id) currentTaskCard = document.getElementById(id);
    if (!currentTaskCard) return;
  }
  const files = Array.from(e.target.files || []);
  if (!files.length) return;

  files.forEach((file) => {
    // store notification per task
    const arr = getNotificationsArrayFromCard(currentTaskCard);
    const time = new Date().toLocaleString();
    arr.push({
      fileName: file.name,
      time,
      type: file.type,
      url: URL.createObjectURL(file),
    });
    saveNotificationsArrayToCard(currentTaskCard, arr);

    // increase attachments count
    const currentCount =
      parseInt(currentTaskCard.dataset.attachments || "0", 10) || 0;
    currentTaskCard.dataset.attachments = String(currentCount + 1);
  });

  // update drawer and badge
  renderActivityForTask(currentTaskCard);
  updateTaskBadge(
    currentTaskCard,
    parseInt(currentTaskCard.dataset.attachments || "0", 10)
  );

  // clear input
  drawerFileInput.value = "";
});

// attachment drop area inside drawer (if present)
const attachmentDrop = document.querySelector(".attachment-drop");
if (attachmentDrop) {
  attachmentDrop.addEventListener("dragover", (e) => {
    e.preventDefault();
    attachmentDrop.classList.add("drag-over");
  });
  attachmentDrop.addEventListener("dragleave", () =>
    attachmentDrop.classList.remove("drag-over")
  );
  attachmentDrop.addEventListener("drop", (e) => {
    e.preventDefault();
    attachmentDrop.classList.remove("drag-over");
    const files = Array.from(e.dataTransfer.files || []);
    if (!files.length) return;

    // delegate to same logic as drawerFileInput
    if (!currentTaskCard && drawerEl?.dataset.taskId) {
      currentTaskCard = document.getElementById(drawerEl.dataset.taskId);
    }
    files.forEach((file) => {
      const arr = getNotificationsArrayFromCard(currentTaskCard);
      const time = new Date().toLocaleString();
      arr.push({
        fileName: file.name,
        time,
        type: file.type,
        url: URL.createObjectURL(file),
      });
      saveNotificationsArrayToCard(currentTaskCard, arr);

      const currentCount =
        parseInt(currentTaskCard.dataset.attachments || "0", 10) || 0;
      currentTaskCard.dataset.attachments = String(currentCount + 1);
    });

    renderActivityForTask(currentTaskCard);
    updateTaskBadge(
      currentTaskCard,
      parseInt(currentTaskCard.dataset.attachments || "0", 10)
    );
  });
}

// uploadLink + fileInput elsewhere (non-drawer)
const uploadLink = document.getElementById("uploadLink");
const fileInput = document.getElementById("fileInput");
if (uploadLink && fileInput) {
  uploadLink.addEventListener("click", (e) => {
    e.preventDefault();
    fileInput.click();
  });
  fileInput.addEventListener("change", () => {
    const files = Array.from(fileInput.files || []);
    if (!files.length) return;
    // if uploading outside drawer, associate with currentTaskCard
    if (!currentTaskCard && drawerEl?.dataset.taskId) {
      currentTaskCard = document.getElementById(drawerEl.dataset.taskId);
    }
    files.forEach((file) => {
      const arr = getNotificationsArrayFromCard(currentTaskCard);
      const time = new Date().toLocaleString();
      arr.push({
        fileName: file.name,
        time,
        type: file.type,
        url: URL.createObjectURL(file),
      });
      saveNotificationsArrayToCard(currentTaskCard, arr);

      const currentCount =
        parseInt(currentTaskCard.dataset.attachments || "0", 10) || 0;
      currentTaskCard.dataset.attachments = String(currentCount + 1);

      if (file.type.startsWith("image/")) {
        const imgURL = URL.createObjectURL(file); // Preview image

        // Avoid duplicate image insertion
        if (!currentTaskCard.querySelector(".task-image")) {
          const img = document.createElement("img");
          img.src = imgURL;
          img.className = "task-image";

          // Insert image at the top of the task card
          currentTaskCard.insertBefore(img, currentTaskCard.firstChild);
        }
      }
    });

    renderActivityForTask(currentTaskCard);
    updateTaskBadge(
      currentTaskCard,
      parseInt(currentTaskCard.dataset.attachments || "0", 10)
    );
    fileInput.value = "";
  });
}


// ------------------ POPUPS: Assignee / DueDate / Priority (unchanged behavior) ------------------
// Assignee popup
const assigneePopup = document.getElementById("assigneePopup");
const assigneeInput = document.getElementById("assigneeInput");
const suggestionsBox = document.getElementById("suggestions");

document.addEventListener("click", (e) => {
  if (e.target.closest(".fa-user") && e.target.closest(".meta-icon")) {
    const icon = e.target.closest(".meta-icon");
    const rect = icon.getBoundingClientRect();
    if (!assigneePopup) return;
    assigneePopup.style.top = rect.bottom + window.scrollY + "px";
    assigneePopup.style.left = rect.left + window.scrollX + "px";
    assigneePopup.style.display = "block";
    assigneeInput?.focus();
  } else if (
    assigneePopup &&
    !assigneePopup.contains(e.target) &&
    !e.target.closest(".fa-user")
  ) {
    assigneePopup.style.display = "none";
  }
});

assigneeInput?.addEventListener("focus", () => {
  if (suggestionsBox) suggestionsBox.style.display = "block";
});
assigneeInput?.addEventListener("blur", () =>
  setTimeout(
    () => suggestionsBox && (suggestionsBox.style.display = "none"),
    200
  )
);
document.querySelectorAll(".suggestion-item").forEach((item) =>
  item.addEventListener("click", () => {
    if (assigneeInput) {
      assigneeInput.value = item.textContent;
      if (assigneePopup) assigneePopup.style.display = "none";
    }
  })
);

// Due date popup
const dueDatePopup = document.getElementById("dueDatePopup");
let currentDate = new Date();

function renderCalendar(date) {
  if (!dueDatePopup) return;
  const monthYear = document.getElementById("monthYear");
  const calendar = document.getElementById("calendar");
  if (!monthYear || !calendar) return;

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

  for (let i = 0; i < firstDay; i++) html += "<td></td>";

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
    if (!dueDatePopup) return;
    dueDatePopup.style.top = rect.bottom + window.scrollY + "px";
    dueDatePopup.style.left = rect.left + window.scrollX + "px";
    dueDatePopup.style.display = "block";
    renderCalendar(currentDate);
  } else if (
    dueDatePopup &&
    !dueDatePopup.contains(e.target) &&
    !e.target.closest(".fa-calendar")
  ) {
    dueDatePopup.style.display = "none";
  }
});

document.getElementById("prevMonth")?.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar(currentDate);
});
document.getElementById("nextMonth")?.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar(currentDate);
});

// Priority popup
const priorityPopup = document.getElementById("priorityPopup");
document.addEventListener("click", (e) => {
  if (e.target.closest(".fa-flag") && e.target.closest(".meta-icon")) {
    const icon = e.target.closest(".meta-icon");
    const rect = icon.getBoundingClientRect();
    if (!priorityPopup) return;
    priorityPopup.style.top = rect.bottom + window.scrollY + "px";
    priorityPopup.style.left = rect.left + window.scrollX + "px";
    priorityPopup.style.display = "block";
  } else if (
    priorityPopup &&
    !priorityPopup.contains(e.target) &&
    !e.target.closest(".fa-flag")
  ) {
    priorityPopup.style.display = "none";
  }
});
document.querySelectorAll(".priority-item").forEach((item) =>
  item.addEventListener("click", () => {
    if (priorityPopup) priorityPopup.style.display = "none";
  })
);

// ------------------ PREVENT DRAWER OPENING FROM BUTTON CLICKS ------------------
// This is to avoid the drawer opening when clicking buttons inside the task card.
// We rely on attachTaskCardClick (per card) for opening the drawer.
document.addEventListener(
  "click",
  (e) => {
    // if clicking a button inside .task-card we stop propagation up to global drawer handler
    if (
      e.target.closest(".task-card") &&
      (e.target.closest("button") ||
        e.target.closest(".task-action-btn") ||
        e.target.closest(".no-drawer"))
    ) {
      // let button's own handler run, but prevent the global open drawer code that would run if you used a document-level open
      e.stopPropagation();
    }
  },
  true
);

// ------------------ INITIALIZATION ------------------
function initializeBoard() {
  // attach events to existing columns
  document.querySelectorAll(".board-column").forEach((column) => {
    attachTaskEvents(column);
  });

  // attach clicks to all existing task-cards
  document.querySelectorAll(".task-card").forEach((card) => {
    attachTaskCardClick(card);
  });

  enableDragAndDrop();
  updateTaskCounts();

  // Initialize badges for existing tasks (if dataset present)
  document.querySelectorAll(".task-card").forEach((task) => {
    const comments = getCommentsArrayFromCard(task).length;
    const attachments = parseInt(task.dataset.attachments || "0", 10) || 0;
    updateChatBadge(task, comments);
    updateTaskBadge(task, attachments);
  });

  // If you want board view selected by default
  if (boardView) boardView.style.display = "block";
}

// run on DOM ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeBoard);
} else {
  initializeBoard();
  initAttachmentUpload();
  initAttachmentPreview();
}
