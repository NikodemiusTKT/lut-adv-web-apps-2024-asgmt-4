document.addEventListener("DOMContentLoaded", function () {
  init();
});

function init() {
  const todoForm = document.getElementById("todoForm");
  todoForm.addEventListener("submit", handleFormSubmit);
}

async function handleFormSubmit(event) {
  event.preventDefault();

  const userInput = document.getElementById("userInput").value.trim();
  const todoInput = document.getElementById("todoInput").value.trim();

  if (!userInput || !todoInput) {
    document.getElementById("responseMessage").textContent =
      "Both fields are required.";
    return;
  }

  try {
    const response = await fetch("/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: userInput, todo: todoInput }),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const result = await response.text();
    document.getElementById("responseMessage").textContent = result;

    // Append the new todo to the list
    appendTodoItem(userInput, todoInput);

    // Clear the input fields
    document.getElementById("userInput").value = "";
    document.getElementById("todoInput").value = "";
  } catch (error) {
    document.getElementById(
      "responseMessage"
    ).textContent = `Error: ${error.message}`;
  }
}

function appendTodoItem(user, todo) {
  const todoList = document.getElementById("todoList");
  const newTodoItem = document.createElement("li");
  const span = document.createElement("span");

  span.className = "secondary-content";
  span.innerHTML = `<i class="material-icons">task_alt</i>`;
  newTodoItem.className = "collection-item";
  newTodoItem.textContent = `${user}: ${todo}`;
  newTodoItem.appendChild(span);
  todoList.appendChild(newTodoItem);
}
