document.addEventListener("DOMContentLoaded", function () {
  init();
});

function init() {
  const todoForm = document.getElementById("todoForm");
  const searchForm = document.getElementById("searchForm");
  todoForm.addEventListener("submit", handleFormSubmit);
  searchForm.addEventListener("submit", handleSearchTodos);
}

async function handleFormSubmit(event) {
  event.preventDefault();

  const userInput = document.getElementById("userInput").value.trim();
  const todoInput = document.getElementById("todoInput").value.trim();

  if (!userInput || !todoInput) {
    displayMessage("Both fields are required.", "red lighten-4");
    return;
  }

  try {
    const response = await addTodo(userInput, todoInput);
    const result = await response.text();
    if (response.ok) {
      displayMessage(result, "teal lighten-4");
      const todos = await fetchTodos(userInput);
      displayTodos(todos.data);
    } else {
      displayMessage(`Error: ${result}`, "red lighten-4");
    }
    clearInputFields(["userInput", "todoInput"]);
  } catch (error) {
    displayMessage(`Error: ${error.message}`, "red lighten-4");
  }
}

async function handleSearchTodos(event) {
  event.preventDefault();

  const userInput = document.getElementById("searchInput").value.trim();

  if (!userInput) {
    displayMessage("User is required.", "red lighten-4");
    return;
  }

  await updateTodoList(userInput);
  clearInputFields(["searchInput"]);
}

async function addTodo(user, todo) {
  return fetch("/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name: user, todo: todo }),
  });
}

async function fetchTodos(user) {
  try {
    const response = await fetch(`/todos/${user}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const result = await response.json();
      return { success: true, data: result };
    } else {
      const result = await response.text();
      return { success: false, message: result };
    }
  } catch (error) {
    return {
      success: false,
      message: `Unable to fetch todos: ${error.message}`,
    };
  }
}

async function updateTodoList(user) {
  const result = await fetchTodos(user);
  if (result.success) {
    displayMessage(`Todos found for user ${user}`, "teal lighten-4");
    displayTodos(result.data);
  } else {
    displayMessage(result.message, "red lighten-4");
  }
}

function displayTodos(todos) {
  const todoList = document.getElementById("todoList");
  todoList.innerHTML = ""; // Clear previous results
  todos.forEach(appendTodoItem);
}

function appendTodoItem(todo) {
  const todoList = document.getElementById("todoList");
  const newTodoItem = document.createElement("li");
  const span = document.createElement("span");

  span.className = "secondary-content";
  span.innerHTML = `<i class="material-icons">task_alt</i>`;
  newTodoItem.className = "collection-item";
  newTodoItem.textContent = `${todo}`;
  newTodoItem.appendChild(span);
  todoList.appendChild(newTodoItem);
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
