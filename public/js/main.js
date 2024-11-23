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
  document
    .getElementById("search")
    .addEventListener("click", handleSearchTodos);
};

const apiRequest = async (url, options) => {
  try {
    const response = await fetch(url, options);
    const result = await response.json();
    const { success, message, data } = result;
    if (response.ok) {
      return { success: true, data: data, message: message };
    } else {
      return { success: false, message: message };
    }
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
    displaySuccessMessage(result.message);
    currentUser = userInput;
    renderTodos(result.data);
    showCurrentUserSection(userInput);
  } else {
    handleError(result.message, displayErrorMsg);
    hideCurrentUserSection();
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
  if (result.success) {
    displaySuccessMessage(result.message);
  } else {
    displayErrorMsg(result.message);
  }
  clearInputFields(["searchInput"]);
};

const handleDeleteUser = async () => {
  if (!currentUser) {
    displayErrorMsg("No user selected.");
    return;
  }
  const result = await deleteUser(currentUser);
  if (result.success) {
    displaySuccessMessage(result.message);
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

const fetchTodos = async (user) =>
  await apiRequest(`/todos/${user}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

const deleteUser = async (user) =>
  await apiRequest("/delete", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: user }),
  });

const fetchAndDisplayTodos = async (user) => {
  const result = await fetchTodos(user);
  if (result.success) {
    renderTodos(result.data);
    showCurrentUserSection(user);
  } else {
    handleError(result.message, displayErrorMsg);
    document.getElementById("todoList").innerHTML = "";
    hideCurrentUserSection();
  }
  return result;
};

const handleDeleteTodo = async (event) => {
  const { index, todo } = event.target.dataset;
  const result = await apiRequest("/update", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: currentUser,
      todo: todo,
    }),
  });

  if (result.success) {
    displaySuccessMessage(result.message);
    renderTodos(result.data);
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
const displaySuccessMessage = (message) => {
  displayMessage(message, "teal lighten-4");
};
