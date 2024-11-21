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

    const result = await response.text();
    const responseMessage = document.getElementById("responseMessage");
    if (response.ok) {
      responseMessage.className = "card-panel teal lighten-4 center-align";
      responseMessage.innerText = result;
      // Append the new todo to the list
      appendTodoItem(userInput, todoInput);
    } else {
      responseMessage.className = "card-panel red lighten-4 center-align";
      responseMessage.innerText = `Error: ${result}`;
    }
    responseMessage.hidden = false;

    // Clear the input fields
    document.getElementById("userInput").value = "";
    document.getElementById("todoInput").value = "";
  } catch (error) {
    const responseMessage = document.getElementById("responseMessage");
    responseMessage.className = "card-panel red lighten-4 center-align";
    responseMessage.innerText = `Error: ${error.message}`;
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
