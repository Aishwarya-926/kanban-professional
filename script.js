document.addEventListener('DOMContentLoaded', () => {
    // --- State Management ---
    let state = {
        tasks: {},
        columns: {
            'todo': { id: 'todo', title: 'To Do', taskIds: [] },
            'inprogress': { id: 'inprogress', title: 'In Progress', taskIds: [] },
            'done': { id: 'done', title: 'Done', taskIds: [] }
        },
        columnOrder: ['todo', 'inprogress', 'done']
    };

    // --- Selectors ---
    const kanbanBoard = document.querySelector('.kanban-board');
    const addTaskModal = document.getElementById('add-task-modal');
    const taskDetailsModal = document.getElementById('task-details-modal');
    const searchInput = document.getElementById('search-input');
    const themeToggle = document.getElementById('theme-toggle');

    // --- Persistence ---
    const saveState = () => localStorage.setItem('kanbanState', JSON.stringify(state));
    const loadState = () => {
        const storedState = localStorage.getItem('kanbanState');
        if (storedState) {
            state = JSON.parse(storedState);
        }
        const savedTheme = localStorage.getItem('kanbanTheme') || 'light';
        document.body.classList.toggle('dark-mode', savedTheme === 'dark');
        themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
    };

    // --- Core Render Function ---
    const renderBoard = () => {
        kanbanBoard.innerHTML = ''; // Clear board
        state.columnOrder.forEach(columnId => {
            const column = state.columns[columnId];
            const columnEl = createColumnElement(column);
            kanbanBoard.appendChild(columnEl);

            const tasksContainer = columnEl.querySelector('.tasks-container');
            column.taskIds.forEach(taskId => {
                const task = state.tasks[taskId];
                if (task) {
                    const taskEl = createTaskElement(task);
                    tasksContainer.appendChild(taskEl);
                }
            });
        });
        // THE FIX: The call to addEventListeners() has been REMOVED from here.
    };
    
    // --- Element Creation ---
    const createColumnElement = (column) => {
        const el = document.createElement('div');
        el.className = 'kanban-column';
        el.dataset.column = column.id;
        el.innerHTML = `
            <h2 class="column-title">${column.title}</h2>
            <div class="tasks-container"></div>
            <button class="add-task-btn">+ Add Task</button>
        `;
        return el;
    };

    const createTaskElement = (task) => {
        const el = document.createElement('div');
        el.className = 'task-card';
        el.dataset.id = task.id;
        el.dataset.priority = task.priority;
        el.draggable = true;

        const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.column !== 'done';
        el.classList.toggle('overdue', isOverdue);

        const completedSubtasks = task.subtasks.filter(s => s.completed).length;
        const totalSubtasks = task.subtasks.length;
        const progress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

        el.innerHTML = `
            <h4>${task.title}</h4>
            <div class="task-meta">
                <span class="due-date ${isOverdue ? 'overdue-text' : ''}">${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</span>
                <span class="subtask-count">${completedSubtasks}/${totalSubtasks}</span>
            </div>
            ${totalSubtasks > 0 ? `<div class="progress-bar"><div class="progress-bar-inner" style="width: ${progress}%"></div></div>` : ''}
        `;
        return el;
    };

    // --- Event Listener Setup (Now runs only ONCE) ---
    let draggedTask = { id: null, fromColumn: null };

    const addEventListeners = () => {
        // Using event delegation on the main board for dynamic elements
        kanbanBoard.addEventListener('click', (e) => {
            // Add Task Button
            if (e.target.classList.contains('add-task-btn')) {
                const columnId = e.target.closest('.kanban-column').dataset.column;
                addTaskModal.dataset.column = columnId;
                addTaskModal.classList.remove('hidden');
                addTaskModal.querySelector('#task-title-input').focus();
            }
            // Open Task Details Modal
            const card = e.target.closest('.task-card');
            if (card) {
                const taskId = card.dataset.id;
                openTaskDetails(taskId);
            }
        });

        // Drag and Drop
        kanbanBoard.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('task-card')) {
                draggedTask.id = e.target.dataset.id;
                draggedTask.fromColumn = e.target.closest('.kanban-column').dataset.column;
                e.target.classList.add('dragging');
            }
        });

        kanbanBoard.addEventListener('dragend', (e) => {
            if (e.target.classList.contains('task-card')) e.target.classList.remove('dragging');
        });

        kanbanBoard.addEventListener('dragover', (e) => {
            e.preventDefault();
            const columnEl = e.target.closest('.kanban-column');
            if (columnEl) columnEl.querySelector('.tasks-container').classList.add('drag-over');
        });

        kanbanBoard.addEventListener('dragleave', (e) => {
            const el = e.target.closest('.tasks-container');
            if (el) el.classList.remove('drag-over');
        });

        kanbanBoard.addEventListener('drop', (e) => {
            e.preventDefault();
            const columnEl = e.target.closest('.kanban-column');
            if (columnEl) {
                columnEl.querySelector('.tasks-container').classList.remove('drag-over');
                const toColumn = columnEl.dataset.column;

                if (draggedTask.fromColumn && draggedTask.fromColumn !== toColumn) {
                    const task = state.tasks[draggedTask.id];
                    task.column = toColumn;
                    state.columns[draggedTask.fromColumn].taskIds = state.columns[draggedTask.fromColumn].taskIds.filter(id => id !== draggedTask.id);
                    state.columns[toColumn].taskIds.push(draggedTask.id);
                    saveState();
                    renderBoard();
                }
            }
        });
    };

    // --- Modal Logic ---
    addTaskModal.querySelector('form').addEventListener('submit', (e) => { /* ... (no changes) ... */ });
    document.querySelectorAll('.cancel-btn').forEach(btn => { /* ... (no changes) ... */ });
    let currentTaskId = null;
    const openTaskDetails = (taskId) => { /* ... (no changes) ... */ };
    const renderChecklist = () => { /* ... (no changes) ... */ };
    taskDetailsModal.querySelector('#add-subtask-form').addEventListener('submit', (e) => { /* ... (no changes) ... */ });
    searchInput.addEventListener('input', (e) => { /* ... (no changes) ... */ });
    themeToggle.addEventListener('click', () => { /* ... (no changes) ... */ });

    // --- Initial Load ---
    loadState();
    renderBoard();
    addEventListeners(); // THE FIX: Call this ONCE after the initial render.
});


// --- PASTE THE UNCHANGED HELPER FUNCTIONS HERE ---
function addTaskModalSubmit(e) {
    e.preventDefault();
    const state = window.appState; // Assuming state is accessible
    const addTaskModal = document.getElementById('add-task-modal');
    const form = e.target;
    const columnId = addTaskModal.dataset.column;
    const newTask = {
        id: `task-${Date.now()}`, column: columnId,
        title: form.querySelector('#task-title-input').value.trim(),
        desc: form.querySelector('#task-desc-input').value.trim(),
        priority: form.querySelector('#task-priority').value,
        dueDate: form.querySelector('#task-due-date').value,
        subtasks: []
    };
    state.tasks[newTask.id] = newTask;
    state.columns[columnId].taskIds.push(newTask.id);
    window.saveState(); window.renderBoard();
    form.reset(); addTaskModal.classList.add('hidden');
}
// Stubbing functions from the main scope to avoid ReferenceErrors
// In the final code, these will be inside the main IIFE or accessible globally.
let currentTaskId = null;
const openTaskDetails = (taskId) => {
    currentTaskId = taskId;
    const task = state.tasks[taskId];
    const taskDetailsModal = document.getElementById('task-details-modal');
    taskDetailsModal.querySelector('#details-title').textContent = task.title;
    taskDetailsModal.querySelector('#details-desc').textContent = task.desc || 'No description provided.';
    taskDetailsModal.querySelector('#details-priority').textContent = `Priority: ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}`;
    taskDetailsModal.querySelector('#details-due-date').textContent = `Due: ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}`;
    renderChecklist();
    taskDetailsModal.classList.remove('hidden');
};
const renderChecklist = () => {
    const taskDetailsModal = document.getElementById('task-details-modal');
    const checklistContainer = taskDetailsModal.querySelector('#checklist-container');
    checklistContainer.innerHTML = '';
    const task = state.tasks[currentTaskId];
    task.subtasks.forEach((subtask, index) => {
        const subtaskEl = document.createElement('div');
        subtaskEl.className = `subtask ${subtask.completed ? 'completed' : ''}`;
        subtaskEl.innerHTML = `<input type="checkbox" id="subtask-${index}" ${subtask.completed ? 'checked' : ''}><label for="subtask-${index}">${subtask.text}</label>`;
        subtaskEl.querySelector('input').addEventListener('change', () => {
            subtask.completed = !subtask.completed;
            saveState();
            renderChecklist();
            renderBoard();
        });
        checklistContainer.appendChild(subtaskEl);
    });
};
// Add the rest of the modal/feature logic here, outside the main IIFE if they are called from it
document.getElementById('add-task-modal').querySelector('form').addEventListener('submit', (e) => {
    e.preventDefault();
    const addTaskModal = document.getElementById('add-task-modal');
    const form = e.target;
    const columnId = addTaskModal.dataset.column;
    const newTask = {
        id: `task-${Date.now()}`, column: columnId,
        title: form.querySelector('#task-title-input').value.trim(),
        desc: form.querySelector('#task-desc-input').value.trim(),
        priority: form.querySelector('#task-priority').value,
        dueDate: form.querySelector('#task-due-date').value,
        subtasks: []
    };
    state.tasks[newTask.id] = newTask;
    state.columns[columnId].taskIds.push(newTask.id);
    saveState(); renderBoard();
    form.reset(); addTaskModal.classList.add('hidden');
});
document.querySelectorAll('.cancel-btn').forEach(btn => btn.addEventListener('click', () => btn.closest('.modal-overlay').classList.add('hidden')));
document.getElementById('add-subtask-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = e.target.querySelector('#subtask-input');
    const text = input.value.trim();
    if (text) {
        state.tasks[currentTaskId].subtasks.push({ text, completed: false });
        saveState(); renderChecklist(); renderBoard();
        input.value = '';
    }
});
document.getElementById('search-input').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    document.querySelectorAll('.task-card').forEach(card => {
        const title = state.tasks[card.dataset.id].title.toLowerCase();
        card.classList.toggle('hidden', !title.includes(searchTerm));
    });
});
document.getElementById('theme-toggle').addEventListener('click', () => {
    const isDarkMode = document.body.classList.toggle('dark-mode');
    document.getElementById('theme-toggle').textContent = isDarkMode ? '☀️' : '🌙';
    localStorage.setItem('kanbanTheme', isDarkMode ? 'dark' : 'light');
});
