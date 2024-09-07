import { TaskModal } from "./taskModal.js";
import { TaskColumns } from "./kanbanColumns.js";

document.addEventListener("DOMContentLoaded", () => {
  const tasks = [];
  const assignedToList = ["Rodrigo Lujambio", "Michel Sampil", "Jose Abadie"];

  /**
   * Fetches the tasks from the API and stores them in the tasks array
   * @returns void
   */
  async function getData() {
    const url = "http://localhost:3000/api/tasks";
    try {
      const response = await fetch(url);

      if (!response.ok) {
        console.log(response.status);
      }

      // Adds the fetched tasks to the tasks array
      const json = await response.json();
      tasks.push(...json);

      taskColumns.renderColumns();
    } catch (error) {
      console.error(error.message);
    }
  }

  // Creates the task modal and columns
  const taskModal = new TaskModal(
    document.getElementById("task-modal"),
    document.getElementById("task-form"),
    tasks,
    () => taskColumns.renderColumns(),
    assignedToList
  );

  // Creates the task columns
  const taskColumns = new TaskColumns(
    document.getElementById("task-columns"),
    tasks,
    taskModal
  );

  // Fetches the tasks from the API
  getData();

  // Event listener for the new task button
  document.getElementById("new-task-button").addEventListener("click", () => {
    taskModal.openModal("Nueva Tarea");
  });

  // Event listener for the new task form
  const themeSwitch = document.getElementById("dark-mode-switch");
  const htmlElement = document.documentElement;

  // Event listener for the theme switch
  themeSwitch.addEventListener("change", () => {
    if (themeSwitch.checked) {
      htmlElement.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
    } else {
      htmlElement.setAttribute("data-theme", "light");
      localStorage.setItem("theme", "light");
    }
  });

  // Checks the theme based on the local storage
  if (localStorage.getItem("theme") === "dark") {
    htmlElement.setAttribute("data-theme", "dark");
    themeSwitch.checked = true;
  } else {
    htmlElement.setAttribute("data-theme", "light");
    themeSwitch.checked = false;
  }

  // Checks the theme switch based on the data-theme attribute
  if (htmlElement.getAttribute("data-theme") === "dark") {
    themeSwitch.checked = true;
  }
});
