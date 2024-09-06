export class TaskModal {
  constructor(modalElement, taskFormElement, tasks, onSave, assignedToList) {
    this.modalElement = modalElement;
    this.taskFormElement = taskFormElement;
    this.tasks = tasks;
    this.onSave = onSave;
    this.assignedToList = assignedToList;

    this.saveTaskButton = document.getElementById("save-task");
    this.cancelModalButton = document.getElementById("cancel-modal");
    this.modalTitle = document.getElementById("modal-title");

    this.saveTaskButton.addEventListener("click", this.saveTask.bind(this));
    this.cancelModalButton.addEventListener(
      "click",
      this.closeModal.bind(this)
    );
  }

  // Function to format the date in yyyy-mm-dd format for the input
  formatDateForInput(dateString) {
    if (!dateString) return "";
    const [day, month, year] = dateString.split("/");
    return `${year}-${month}-${day}`;
  }

  // Function to format the date in dd/mm/yyyy format without altering the original value
  formatDateForJSON(dateString) {
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`; // Convertir yyyy-mm-dd a dd/mm/yyyy
  }

  /**
   * Opens the modal with the given title and task data
   * @param {string} title the title of the modal
   * @param {object} task the task data
   * @returns void
   * @example
   * openModal("Nueva Tarea");
   * openModal("Editar Tarea", task);
   */
  openModal(title, task = null) {
    this.modalTitle.textContent = title;
    this.taskFormElement.innerHTML = "";

    // Creates the form fields
    const titleInput = this.createInput(
      "title",
      "Título",
      "text",
      task ? task.title : ""
    );
    const descriptionInput = this.createInput(
      "description",
      "Descripción",
      "text",
      task ? task.description : ""
    );
    const assignedSelect = this.createSelect(
      "assignedTo",
      "Asignado a",
      this.assignedToList,
      task ? task.assignedTo : ""
    );
    const prioritySelect = this.createSelect(
      "priority",
      "Prioridad",
      ["Alta", "Media", "Baja"],
      task ? task.priority : ""
    );
    const statusSelect = this.createSelect(
      "status",
      "Estado",
      ["Backlog", "To Do", "In Progress", "Blocked", "Done"],
      task ? task.status : "Backlog"
    );
    const endDateInput = this.createInput(
      "endDate",
      "Fecha límite",
      "date",
      task ? this.formatDateForInput(task.endDate) : ""
    );

    // Appends the form fields to the form element
    const fieldContainer = document.createElement("div");
    fieldContainer.classList.add("columns", "is-multiline");

    fieldContainer.appendChild(this.wrapInColumn(titleInput));
    fieldContainer.appendChild(this.wrapInColumn(descriptionInput));
    fieldContainer.appendChild(this.wrapInColumn(assignedSelect));
    fieldContainer.appendChild(this.wrapInColumn(prioritySelect));
    fieldContainer.appendChild(this.wrapInColumn(statusSelect));
    fieldContainer.appendChild(this.wrapInColumn(endDateInput));

    this.taskFormElement.appendChild(fieldContainer);

    // Adds the hidden id input if the task exists
    if (task) {
      const hiddenIdInput = document.createElement("input");
      hiddenIdInput.type = "hidden";
      hiddenIdInput.name = "id";
      hiddenIdInput.value = task.id;
      this.taskFormElement.appendChild(hiddenIdInput);
    }

    this.modalElement.classList.add("is-active");
  }

  /**
   * Creates an input field div element
   * @param {string} id the id of the input field
   * @param {string} labelText the label text of the input field
   * @param {string} type the type of the input field
   * @param {string} value the value of the input field
   * @returns the input field div element
   * @example
   * createInput("title", "Título", "text", task ? task.title : "");
   * createInput("description", "Descripción", "text", task ? task.description : "");
   */
  createInput(id, labelText, type, value = "") {
    const fieldDiv = document.createElement("div");
    fieldDiv.classList.add("field");
    fieldDiv.innerHTML = `
        <label class="label" for="${id}">${labelText}</label>
        <div class="control">
          <input class="input" type="${type}" id="${id}" name="${id}" value="${value}">
        </div>
      `;
    return fieldDiv;
  }

  /**
   * Creates a select field div element
   * @param {string} id the id of the select field
   * @param {string} labelText the label text of the select field
   * @param {Array} options the options of the select field
   * @param {string} selectedValue the selected value of the select field
   * @returns the select field div element
   * @example
   * createSelect("assigned", "Asignado a", ["Persona 1", "Persona 2", "Persona 3"], task ? task.assigned : "");
   * createSelect("priority", "Prioridad", ["Alta", "Media", "Baja"], task ? task.priority : "");
   */
  createSelect(id, labelText, options, selectedValue = "") {
    const fieldDiv = document.createElement("div");
    fieldDiv.classList.add("field");
    const optionsHtml = options
      .map(
        (option) =>
          `<option value="${option}" ${option === selectedValue ? "selected" : ""}>${option}</option>`
      )
      .join("");
    fieldDiv.innerHTML = `
        <label class="label" for="${id}">${labelText}</label>
        <div class="control">
          <div class="select">
            <select id="${id}" name="${id}">
              ${optionsHtml}
            </select>
          </div>
        </div>
      `;
    return fieldDiv;
  }

  /**
   * Wraps the given element in a column div element
   * @param element the element to wrap
   * @returns the column div element
   * @example
   * wrapInColumn(titleInput);
   * wrapInColumn(descriptionInput);
   * wrapInColumn(assignedSelect);
   * wrapInColumn(prioritySelect);
   * wrapInColumn(statusSelect);
   * wrapInColumn(dueDateInput);
   */
  wrapInColumn(element) {
    const columnDiv = document.createElement("div");
    columnDiv.classList.add("column", "is-half");
    columnDiv.appendChild(element);
    return columnDiv;
  }

  /**
   * Closes the modal and resets the form
   * @returns void
   */
  closeModal() {
    this.modalElement.classList.remove("is-active");
    this.taskFormElement.reset();
  }

  /**
   * Saves the task data to the server
   * @returns void
   * @example
   */
  async saveTask() {
    const titleInput = document.getElementById("title");

    // Validates that the title input exists
    if (titleInput.value.trim() === "") {
      alert("El título es obligatorio");
      return;
    }

    // Gets the form data and creates an ordered task object
    const formData = new FormData(this.taskFormElement);

    const orderedTaskData = {
      id: formData.get("id") || Date.now().toString(), // Si no hay ID, genera uno nuevo para POST
      title: formData.get("title") || "",
      description: formData.get("description") || "",
      assignedTo: formData.get("assignedTo") || "",
      startDate: formData.get("startDate") || "", // Si no tiene valor, lo deja vacío
      endDate: formData.get("endDate")
        ? this.formatDateForJSON(formData.get("endDate"))
        : "", // Formatear a dd/mm/yyyy
      status: formData.get("status") || "",
      priority: formData.get("priority") || "",
      comments: formData.get("comments")
        ? formData.get("comments").split(",")
        : [], // Si no tiene comentarios, usa un array vacío
    };

    try {
      // If the task has an id, do a PUT to update it
      if (formData.get("id")) {
        const taskId = orderedTaskData.id;
        const response = await fetch(
          `http://localhost:3000/api/tasks/${taskId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(orderedTaskData),
          }
        );

        if (!response.ok) {
          throw new Error("Error al actualizar la tarea");
        }

        // Updates the task in the tasks array
        const updatedTask = await response.json();
        const taskIndex = this.tasks.findIndex((task) => task.id === taskId);
        if (taskIndex !== -1) {
          this.tasks[taskIndex] = updatedTask;
        }
      } else {
        // If there is no id, do a POST to create a new task
        const response = await fetch("http://localhost:3000/api/tasks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(orderedTaskData),
        });

        if (!response.ok) {
          throw new Error("Error al crear la tarea");
        }

        // Adds the new task to the tasks array
        const newTask = await response.json();
        this.tasks.push(newTask);
      }

      // Closes the modal and calls the onSave function
      this.closeModal();
      this.onSave();
    } catch (error) {
      console.error("Error al guardar la tarea:", error);
    }
  }
}
