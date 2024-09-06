export class TaskColumns {
  constructor(containerElement, tasks, modal) {
    this.containerElement = containerElement;
    this.tasks = tasks;
    this.modal = modal;
    this.taskStatuses = ["Backlog", "To Do", "In Progress", "Blocked", "Done"];

    this.renderColumns();
  }

  /**
   * Renderizes the columns in the container element
   */
  renderColumns() {
    this.containerElement.innerHTML = "";
    this.taskStatuses.forEach((status) => {
      const column = this.createColumn(status);
      this.containerElement.appendChild(column);
    });
    this.loadTasksToColumns();
  }

  /**
   * Creates a column div element
   * @param {*} status the status of the column
   * @returns the column div element
   */
  createColumn(status) {
    const columnDiv = document.createElement("div");
    columnDiv.classList.add("column", "is-one-fifth");
    columnDiv.dataset.status = status;
    columnDiv.innerHTML = `
            <div class="column">
                <header class="card-header">
                    <p class="card-header-title">${status}</p>
                </header>
                <div class="card-content" id="column-${status.replace(/\s+/g, "")}" ondrop="event.stopPropagation(); return false;">
                </div>
            </div>
        `;
    columnDiv.addEventListener("dragover", this.allowDrop);
    columnDiv.addEventListener("drop", (event) => this.drop(event));
    return columnDiv;
  }

  /**
   * Loads the tasks to the columns
   */
  loadTasksToColumns() {
    this.taskStatuses.forEach((status) => {
      const columnContent = document.getElementById(
        `column-${status.replace(/\s+/g, "")}`
      );
      columnContent.innerHTML = "";

      const tasksForStatus = this.tasks.filter(
        (task) => task.status === status
      );

      tasksForStatus.forEach((task) => {
        const taskElement = this.createTaskElement(task);
        columnContent.appendChild(taskElement);
      });

      if (columnContent.scrollHeight > columnContent.clientHeight) {
        columnContent.parentElement.classList.add("scrollable");
      } else {
        columnContent.parentElement.classList.remove("scrollable");
      }
    });
  }

  /**
   * Creates a task div element and includes the drag and drop events
   * @param {*} task the task to create the element
   * @returns the task div element
   */
  createTaskElement(task) {
    const taskDiv = document.createElement("div");
    taskDiv.classList.add(
      "card",
      "mb-3",
      "task-card",
      `task-${task.status.replace(/\s+/g, "").toLowerCase()}`
    );
    taskDiv.dataset.taskId = task.id;
    taskDiv.draggable = true;
    taskDiv.ondragstart = (event) => this.drag(event);

    // Sets the priority color
    let priorityColor;
    switch (task.priority.toLowerCase()) {
      case "alta":
      case "high":
        priorityColor = "red";
        break;
      case "media":
      case "medium":
        priorityColor = "#e4be00";
        break;
      case "baja":
      case "low":
        priorityColor = "green";
        break;
      default:
        priorityColor = "gray";
    }

    taskDiv.innerHTML = `
            <div class="priority-indicator" style="background-color: ${priorityColor};"></div>
            <div class="card-content">
                <p class="title is-5">${task.title}</p>
                <p class="description is-7">${task.description}</p>
                <p class="assigned is-6">${task.assignedTo}</p>
            </div>
        `;

    // Opens the modal to edit the task
    taskDiv.addEventListener("click", () => {
      const taskToEdit = this.tasks.find((t) => t.id === task.id);
      this.modal.openModal("Editar Tarea", taskToEdit);
    });

    return taskDiv;
  }

  /**
   * Sets the task id to the dataTransfer object
   * @param {*} event the drag event
   * @returns the task id
   */
  drag(event) {
    event.dataTransfer.setData("text", event.target.dataset.taskId);
  }

  /**
   * Allows the drop event
   * @param {*} event the dragover event
   */
  allowDrop(event) {
    event.preventDefault();
  }

  /**
   * Drops the task in the new column and updates the server
   * @param {*} event the drop event
   */
  async drop(event) {
    event.preventDefault();
    const taskId = event.dataTransfer.getData("text");
    const newStatus = event.currentTarget.dataset.status;

    // Updates the task status
    const taskToUpdate = this.tasks.find((task) => task.id === taskId);
    taskToUpdate.status = newStatus;

    // Makes the PUT request to update the task status in the server
    try {
      const response = await fetch(
        `http://localhost:3000/api/tasks/${taskId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(taskToUpdate),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Error al actualizar el estado de la tarea en el servidor."
        );
      }

      const updatedTask = await response.json();
      const taskIndex = this.tasks.findIndex((task) => task.id === taskId);
      if (taskIndex !== -1) {
        this.tasks[taskIndex] = updatedTask;
      }
    } catch (error) {
      console.error("Error al actualizar el estado de la tarea:", error);
    }

    this.loadTasksToColumns();
  }
}
