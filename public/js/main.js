document.addEventListener("DOMContentLoaded", function () {
  init();
});

let currentUser = null;

function handleError(error, displayFunction) {
  const errorMessage = error instanceof Error ? error.message : error;
  displayFunction(errorMessage);
}

function init() {
  const todoForm = document.getElementById("todoForm");
  const searchForm = document.getElementById("searchForm");
  todoForm.addEventListener("submit", handleAddTodos);
  searchForm.addEventListener("submit", handleSearchTodos);
  document
    .getElementById("deleteUser")
    .addEventListener("click", handleDeleteUser);
}
async function apiRequest(url, options) {
  try {
    const response = await fetch(url, options);
    const contentType = response.headers.get("content-type");
    let result;
    if (contentType && contentType.includes("application/json")) {
      result = await response.json();
    } else {
      result = await response.text();
    }
    if (response.ok) {
      return { success: true, data: result };
    } else {
      return { success: false, message: result.message || result };
    }
  } catch (error) {
    return { success: false, message: error.message };
  }
}

async function handleAddTodos(event) {
  event.preventDefault();

  const userInput = document.getElementById("userInput").value.trim();
  const todoInput = document.getElementById("todoInput").value;

  if (!userInput || !todoInput) {
    displayErrorMsg("User and Todo are required.");
    return;
  }

  const result = await addTodo(userInput, todoInput);

  if (result.success) {
    displaySuccessMessage(result.data);
    currentUser = userInput;
    await fetchAndDisplayTodos(userInput);
  } else {
    handleError(result.message, displayErrorMsg);
  }
  clearInputFields(["todoInput"]);
}

async function handleSearchTodos(event) {
  event.preventDefault();

  const searchInput = document.getElementById("searchInput").value.trim();

  if (!userInput) {
    displayErrorMsg("User is required.");
    return;
  }

  currentUser = searchInput;
  document.getElementById("userInput").value = currentUser;
  const result = await fetchAndDisplayTodos(currentUser);
  if (result.success) {
    displaySuccessMessage(`Todos fetched successfully for ${currentUser}.`);
  }
  clearInputFields(["searchInput"]);
}
async function handleDeleteUser() {
  if (!currentUser) {
    displayErrorMsg("No user selected.");
    return;
  }
  const result = await deleteUser(currentUser);
  if (result.success) {
    displaySuccessMessage(result.data);
    document.getElementById("todoList").innerHTML = ""; // Clear the todo list
    hideCurrentUserSection();
  } else {
    handleError(result.message, displayErrorMsg);
  }
}
async function addTodo(user, todo) {
  return apiRequest("/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: encodeURIComponent(user),
      todo: encodeURIComponent(todo),
    }),
  });
}

async function fetchTodos(user) {
  const result = await apiRequest(`/todos/${encodeURIComponent(user)}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return result;
}

async function deleteUser(user) {
  return apiRequest("/delete", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name: encodeURIComponent(user) }),
  });
}

async function fetchAndDisplayTodos(user) {
  const result = await fetchTodos(user);
  if (result.success) {
    renderTodos(result.data);
    showCurrentUserSection(user);
  } else {
    displayErrorMsg(result.message);
    document.getElementById("todoList").innerHTML = ""; // Clear the todo list
    hideCurrentUserSection();
  }
  return result;
}
async function handleDeleteTodo(event) {
  const todoIndex = event.target.dataset.index;
  const todoText = event.target.dataset.todo;

  const result = await apiRequest("/update", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: encodeURIComponent(currentUser),
      todo: encodeURIComponent(todoText),
    }),
  });

  if (result.success) {
    displaySuccessMessage(result.data);
    await fetchAndDisplayTodos(currentUser);
  } else {
    handleError(result.message, displayErrorMsg);
  }
}
function renderTodoItem(todo, index) {
  const todoList = document.getElementById("todoList");
  const newTodoItem = document.createElement("li");
  const span = document.createElement("a");
  span.href = "#!";

  span.className = "secondary-content link";
  span.innerHTML = `<i class="material-icons delete-task" data-index="${index}" data-todo="${todo}">delete</i>`;
  newTodoItem.className = "collection-item";
  newTodoItem.textContent = `${todo}`;
  newTodoItem.appendChild(span);
  todoList.appendChild(newTodoItem);
}

function renderTodos(todos) {
  const todoList = document.getElementById("todoList");
  todoList.innerHTML = ""; // Clear previous results
  todos.forEach((todo, index) => renderTodoItem(todo, index));

  const deleteTaskElements = document.querySelectorAll(".delete-task");
  deleteTaskElements.forEach((element) =>
    element.addEventListener("click", handleDeleteTodo)
  );
}

function displayMessage(message, colorClass) {
  const responseMessage = document.getElementById("responseMessage");
  responseMessage.className = `card-panel ${colorClass} center-align`;
  responseMessage.innerText = message;
  responseMessage.hidden = false;
}

function clearInputFields(fieldIds) {
  fieldIds.forEach((id) => {
    document.getElementById(id).value = "";
  });
}

function showCurrentUserSection(user) {
  console.log(user);
  currentUser = user; // Save the current user
  const currentUserSection = document.getElementById("currentUserSection");
  const currentUserElement = document.getElementById("currentUserElement");
  currentUserElement.innerText = user;
  currentUserSection.hidden = false;
}

function hideCurrentUserSection() {
  currentUser = ""; // Clear the current user
  const currentUserSection = document.getElementById("currentUserSection");
  currentUserSection.hidden = true;
}

function displayErrorMsg(message) {
  displayMessage(message, "red lighten-4");
}

function displaySuccessMessage(message) {
  displayMessage(message, "teal lighten-4");
}
