document.addEventListener("DOMContentLoaded", () => {
    const todoInput = document.getElementById("todo-input");
    const addButton = document.getElementById("add-button");
    const todoList = document.getElementById("todo-list");

    function addTodo() {
        const todoText = todoInput.value.trim();
        if (todoText === "") return;

        const todoItem = document.createElement("li");
        todoItem.classList.add("todo-item");

        const todoTextElement = document.createElement("p");
        todoTextElement.textContent = todoText;
        todoItem.appendChild(todoTextElement);

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.classList.add("delete-button");
        deleteButton.addEventListener("click", () => {
            todoItem.classList.add("fade-out");
            setTimeout(() => {
                todoList.removeChild(todoItem);
            }, 300);
        });

        todoItem.appendChild(deleteButton);
        todoList.appendChild(todoItem);

        // Add fade-in animation
        setTimeout(() => {
            todoItem.classList.add("fade-in");
        }, 10);

        todoInput.value = "";
    }

    addButton.addEventListener("click", addTodo);
    todoInput.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            addTodo();
        }
    });
});
