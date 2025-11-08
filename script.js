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
    // ... (rest of selectors)

    // --- Persistence ---
    const saveState = () => localStorage.setItem('kanbanState', JSON.stringify(state));
    const loadState = () => { /* ... (no changes) ... */ };

    // --- Core Render Function ---
    const renderBoard = () => { /* ... (no changes) ... */ };
    
    // --- Element Creation ---
    const createColumnElement = (column) => { /* ... (no changes) ... */ };

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
        
        const deleteBtnHTML = `<button class="task-delete-btn" title="Delete task">&times;</button>`;

        el.innerHTML = `
            ${deleteBtnHTML}
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
        kanbanBoard.addEventListener('click', (e) => {
            // --- NEW: Delete Task Logic ---
            if (e.target.classList.contains('task-delete-btn')) {
                e.stopPropagation();
                const card = e.target.closest('.task-card');
                const taskId = card.dataset.id;
                const columnId = card.closest('.kanban-column').dataset.column;
                
                if (confirm('Are you sure you want to delete this task?')) {
                    state.columns[columnId].taskIds = state.columns[columnId].taskIds.filter(id => id !== taskId);
                    delete state.tasks[taskId];
                    saveState();
                    renderBoard();
                }
                return;
            }

            if (e.target.classList.contains('add-task-btn')) {
                const columnId = e.target.closest('.kanban-column').dataset.column;
                addTaskModal.dataset.column = columnId;
                addTaskModal.classList.remove('hidden');
                addTaskModal.querySelector('#task-title-input').focus();
                return; // Added return to prevent modal from opening
            }
            
            const card = e.target.closest('.task-card');
            if (card) {
                const taskId = card.dataset.id;
                openTaskDetails(taskId);
            }
        });

        // ... (rest of the event listeners: dragstart, dragend, dragover, etc. are unchanged)
    };
    
    // ... (rest of the script is unchanged)

    // --- Initial Load ---
    loadState();
    renderBoard();
    addEventListeners();
});

// ... (paste unchanged helper functions here)
