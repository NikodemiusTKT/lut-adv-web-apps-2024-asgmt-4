document.addEventListener("DOMContentLoaded", () => init());

let currentUser = null;

const handleError = (error, displayFunction) => {
  const errorMessage = error instanceof Error ? error.message : error;
  displayFunction(errorMessage);
};

const init = () => {
  document
    .getElementById("todoForm")
    .addEventListener("submit", handleAddTodos);
  document
    .getElementById("searchForm")
    .addEventListener("submit", handleSearchTodos);
  document
    .getElementById("deleteUser")
    .addEventListener("click", handleDeleteUser);
};

const apiRequest = async (url, options) => {
  try {
    const response = await fetch(url, options);
    const contentType = response.headers.get("content-type");
    const result =
      contentType && contentType.includes("application/json")
        ? await response.json()
        : await response.text();
    return response.ok
      ? { success: true, data: result }
      : { success: false, message: result.message || result };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const handleAddTodos = async (event) => {
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
    await fetchAndDisplayTodos(currentUser);
  } else {
    handleError(result.message, displayErrorMsg);
  }
  clearInputFields(["todoInput"]);
};

const handleSearchTodos = async (event) => {
  event.preventDefault();
  const searchInput = document.getElementById("searchInput").value.trim();

  if (!searchInput) {
    displayErrorMsg("User is required.");
    return;
  }

  currentUser = searchInput;
  document.getElementById("userInput").value = currentUser;
  const result = await fetchAndDisplayTodos(currentUser);
  if (result) displaySuccessMessage("User found.");
  clearInputFields(["searchInput"]);
};

const handleDeleteUser = async () => {
  if (!currentUser) {
    displayErrorMsg("No user selected.");
    return;
  }
  const result = await deleteUser(currentUser);
  if (result.success) {
    displaySuccessMessage(result.data);
    document.getElementById("todoList").innerHTML = "";
    hideCurrentUserSection();
  } else {
    handleError(result.message, displayErrorMsg);
  }
};

const addTodo = (user, todo) =>
  apiRequest("/add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: user,
      todo: todo,
    }),
  });

const fetchTodos = (user) =>
  apiRequest(`/todos/${user}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

const deleteUser = (user) =>
  apiRequest("/delete", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: user }),
  });

const fetchAndDisplayTodos = async (user) => {
  const result = await fetchTodos(user);
  if (result.success) {
    renderTodos(result.data);
    showCurrentUserSection(user);
    return true;
  } else {
    handleError(result.message, displayErrorMsg);
    document.getElementById("todoList").innerHTML = "";
    hideCurrentUserSection();
    return false;
  }
};

const handleDeleteTodo = async (event) => {
  const { index, todo } = event.target.dataset;
  const result = await apiRequest("/update", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: decodeURIComponent(currentUser),
      todo: decodeURIComponent(todo),
    }),
  });

  if (result.success) {
    displaySuccessMessage(result.data);
    event.target.closest("li").remove();
  } else {
    handleError(result.message, displayErrorMsg);
  }
};

const renderTodoItem = (todo, index) => {
  const todoList = document.getElementById("todoList");
  const newTodoItem = document.createElement("li");
  newTodoItem.className = "collection-item";
  newTodoItem.innerHTML = `${todo} <a href="#!" class="secondary-content link"><i class="material-icons delete-task" data-index="${index}" data-todo="${todo}">delete</i></a>`;
  newTodoItem.addEventListener("click", handleDeleteTodo);
  todoList.appendChild(newTodoItem);
};

const renderTodos = (todos) => {
  const todoList = document.getElementById("todoList");
  todoList.innerHTML = "";
  todos.forEach((todo, index) => renderTodoItem(todo, index));
};

const displayMessage = (message, colorClass) => {
  const responseMessage = document.getElementById("responseMessage");
  responseMessage.className = `card-panel ${colorClass} center-align`;
  responseMessage.innerText = message;
  responseMessage.hidden = false;
};

const clearInputFields = (fieldIds) => {
  fieldIds.forEach((id) => (document.getElementById(id).value = ""));
};

const showCurrentUserSection = (user) => {
  currentUser = user;
  document.getElementById("currentUserElement").innerText = user;
  document.getElementById("currentUserSection").hidden = false;
};

const hideCurrentUserSection = () => {
  currentUser = "";
  document.getElementById("currentUserSection").hidden = true;
};

const displayErrorMsg = (message) => displayMessage(message, "red lighten-4");
const displaySuccessMessage = (message) =>
  displayMessage(message, "teal lighten-4");
