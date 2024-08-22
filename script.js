const taskInput = document.querySelector('#taskInput');
const taskList = document.querySelector('#taskList'); 
const taskCountText = document.querySelector('.count h3'); 

const noTasksSection = document.querySelector('.noTasksSection'); 
const taskListSection = document.querySelector('.taskListSection'); 
const taskFilterSection = document.querySelector('.taskFilterSection'); 
const countClearSection = document.querySelector('.countClearSection');
const errorMsgSection = document.querySelector('.errorMsgSection');

document.addEventListener('DOMContentLoaded', () => { 
    localStorage.setItem('statusFilter', 'all');
    document.querySelector(`input[value="all"]`).checked = true;
    renderTasks(); 
});

document.querySelectorAll('input[name="taskFilter"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        const filter = e.target.value;
        localStorage.setItem('statusFilter', filter);
        renderTasks();
    });
});

document.querySelector('form').addEventListener('submit', (event) => {
    event.preventDefault();
    addTask();
});

// document.querySelector('#taskInput').addEventListener('focus', () => {
//     taskInput.style.borderBottom = '2px solid #461b80';
// });

document.querySelector('#taskInput').addEventListener('blur', () => {
    errorMsgSection.style.visibility = 'hidden';
    taskInput.style.borderBottom = 'none';
});

document.querySelector('#clear').addEventListener('click', clearTasks);


function renderTasks() {
    const allTasks = localStorage.getItem('tasks') ? JSON.parse(localStorage.getItem('tasks')) : [];
    const filter = localStorage.getItem('statusFilter') || 'all';

    taskList.innerHTML = ''; 
    toggleTaskListVisibility(allTasks); 
    displayTaskCounts(allTasks, filter); 

    const clearButton = document.querySelector('#clear');
    const inProgressTasks = allTasks.filter(task => !task.completed).length;
    const completedTasks = allTasks.filter(task => task.completed).length;

    let filteredTasks;
    if (filter === 'inprogress') {
        filteredTasks = allTasks.filter(task => !task.completed);
        clearButton.disabled = inProgressTasks === 0;
    } else if (filter === 'completed') {
        filteredTasks = allTasks.filter(task => task.completed);
        clearButton.disabled = completedTasks === 0;
    } else {
        filteredTasks = allTasks;
        clearButton.disabled = allTasks.length === 0;
    }

    filteredTasks.forEach(task => {
        renderAndAppendTask(task);
    });   
}



function displayTaskCounts(tasks, filter) {

    const totalTasks = tasks.length;
    const inProgressTasks = tasks.filter(task => !task.completed).length;
    const completedTasks = totalTasks - inProgressTasks;

    switch (filter) {
        case 'inprogress':
            if (inProgressTasks === 0) {
                taskCountText.textContent = "You have no tasks to do!";
            }else {
                taskCountText.textContent = inProgressTasks === 1 ? `You have ${inProgressTasks} task to do!` : `You have ${inProgressTasks} tasks to do!`;
            }
            break;
        case 'completed':
            if (completedTasks === 0) {
                taskCountText.textContent = "You have not completed any tasks!";
            }else {
                taskCountText.textContent = completedTasks === 1 ? `You have completed ${completedTasks} task!` : `You have completed ${completedTasks} tasks!`;
            }
            break;
        case 'all':
            if (totalTasks === 0) {
                taskCountText.textContent = "You have no tasks here!";
            }else {
                taskCountText.textContent = totalTasks === 1 ? `You have a total of ${totalTasks} task!` : `You have a total of ${totalTasks} tasks!`;
            }
            break;
        default:
            taskCountText.textContent = "You have no tasks here!";
    }
}

function renderAndAppendTask(task) {
    let aTask = document.createElement("div"); 
    aTask.classList.add("atask"); 
    aTask.style.opacity = task.completed ? '0.6' : '1';

    let taskHTML = `
        <div class="taskContent">
            <input type="text" id="onetask-${task.id}" value="${task.text}" maxlength="150" readonly="true"> 
        </div>
        <div class="editdel" id="edit-${task.id}">
            <button id="checkbox-${task.id}" title="Status">
                <img src="${task.completed ? 'img/done.png' : 'img/notdone.png'}" alt="checkbox">
            </button>
            <button title="Edit Task">
                <img src="img/edit.png" alt="edit icon">
            </button>
            <button title="Delete Task">
                <img src="img/delete.png" alt="delete icon">
            </button>
        </div>
        <div class="savecancel" id="save-${task.id}" style="display:none">
            <button id="checkbox-${task.id}" title="Status" disabled="true">
                <img src="${task.completed ? 'img/done.png' : 'img/notdone.png'}" alt="checkbox">
            </button>
            <button title="Save Task">
                <img src="img/save.png" alt="save icon">
            </button>
            <button title="Cancel Edit">
                <img src="img/wrong.png" alt="cancel icon">
            </button>
        </div>
    `;
    
    aTask.innerHTML = taskHTML;

    aTask.querySelector(`#checkbox-${task.id}`).addEventListener('click', () => statusChange(task.id));
    aTask.querySelector('button[title="Delete Task"]').addEventListener('click', () => deleteTask(task.id));
    aTask.querySelector('button[title="Save Task"]').addEventListener('click', () => saveTask(task.id));
    aTask.querySelector('button[title="Cancel Edit"]').addEventListener('click', () => cancelEdit(task.id));
    aTask.querySelector('button[title="Edit Task"]').addEventListener('click', () => {
        if (!task.completed){
            toggleEdit(task.id);
        }else{
            showNotification('Cannot edit completed task!');
        }
    });

    taskList.appendChild(aTask);
}

function toggleTaskListVisibility(tasks) {

    if (tasks.length === 0) {
        noTasksSection.style.display = 'flex'; 
        taskListSection.style.display = 'none'; 
        taskFilterSection.style.display = 'none';
        countClearSection.style.display = 'none';
    } else {
        noTasksSection.style.display = 'none'; 
        taskListSection.style.display = 'flex'; 
        taskFilterSection.style.display = 'flex';
        countClearSection.style.display = 'flex';
    }

}

function generateTaskId() {
    const allTasks = localStorage.getItem('tasks') ? JSON.parse(localStorage.getItem('tasks')) : [];
    return allTasks.length ? allTasks[allTasks.length - 1].id + 1 : 1;
}

function addTask(){
 
    const inputValue = taskInput.value;

    if (!validateInput(inputValue)) {
        taskInput.value = "";
        taskInput.style.borderBottom = '2px solid red';
        taskInput.focus();
        return;
    }

    let task = {
        id: generateTaskId(),
        text: taskInput.value.trim().replace(/\s+/g, ' '),
        completed: false
    };

    let allTasks = localStorage.getItem('tasks') ? JSON.parse(localStorage.getItem('tasks')) : [];
    allTasks.push(task);
    localStorage.setItem('tasks', JSON.stringify(allTasks));
    localStorage.setItem('statusFilter', 'all');

    showNotification('Task added successfully', 'green'); 
    const statusFilter = document.querySelector('input[name="taskFilter"][value="all"]');
    statusFilter.checked = true;
    
    renderTasks();

    taskInput.value = "";
    taskInput.focus();
}

function validateInput(taskText, currentId = -1) {

    if (taskText === '') {
        showErrormsg('Task cannot be empty!');
        return false;
    } else if (taskText.replace(/\s+/g, ' ') === ' ') {
        showErrormsg('Task cannot contain only spaces!');
        return false;
    } else if (isTaskAlreadyExists(taskText.trim().replace(/\s+/g, ' '), currentId)) {
        showErrormsg('Task already exists!');
        return false;
    }
    return true;
}

function isTaskAlreadyExists(taskText, currentId) { 

    let allTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    return allTasks.some(task => task.text.toLowerCase() === taskText.toLowerCase() && task.id !== currentId); 
}

function statusChange(taskId) {

    let allTasks = JSON.parse(localStorage.getItem('tasks'));
    let task = allTasks.find(task => task.id === taskId);

    task.completed = !task.completed;

    localStorage.setItem('tasks', JSON.stringify(allTasks));
    renderTasks();
}

function deleteTask(taskId) {

    showToast('Are you sure you want to delete this task?', () => {
        
        let allTasks = JSON.parse(localStorage.getItem('tasks'));
        allTasks = allTasks.filter(task => task.id !== taskId);
        localStorage.setItem('tasks', JSON.stringify(allTasks));

        showNotification('Task deleted successfully', 'green');
        renderTasks();
    }, () => {});
}

function clearTasks() {
    const filter = localStorage.getItem('statusFilter');
    let message = '';

    if (filter === 'all') {
        message = 'Are you sure you want to clear all tasks?';
    } else if (filter === 'inprogress') {
        message = 'Are you sure you want to clear all in-progress tasks?';
    } else if (filter === 'completed') {
        message = 'Are you sure you want to clear all completed tasks?';
    }

    showToast(message, () => { 
        let allTasks = JSON.parse(localStorage.getItem('tasks'));

        if (filter === 'all') {
            localStorage.removeItem('tasks');
        } else if (filter === 'inprogress') {
            allTasks = allTasks.filter(task => task.completed);
            localStorage.setItem('tasks', JSON.stringify(allTasks));
        } else if (filter === 'completed') {
            allTasks = allTasks.filter(task => !task.completed);
            localStorage.setItem('tasks', JSON.stringify(allTasks));
        }

        showNotification(`${filter.charAt(0).toUpperCase() + filter.slice(1)} tasks cleared!`, 'green');
        renderTasks();

    }, () => {});
}


function toggleEdit(taskId) {

    disableOtherElements(true);
    toggleTaskControls(taskId, false);

    let taskText = document.querySelector(`#onetask-${taskId}`);
    taskText.removeAttribute('readonly');
    taskText.focus();
    taskText.setSelectionRange(taskText.value.length, taskText.value.length);
    taskText.style.borderBottom = '2px solid #461b80';

    taskText.addEventListener('input', () => {
        taskText.style.borderBottom = '2px solid #461b80';
    });

}

function disableOtherElements(disabled) {

    const addButton = document.querySelector('#taskAddBtn');
    const clearButton = document.querySelector('#clear');
    const allEditButtons = document.querySelectorAll('.editdel button');
    const radioButtons = document.querySelectorAll('input[name="taskFilter"]');

    taskInput.disabled = disabled;
    addButton.disabled = disabled;
    clearButton.disabled = disabled;

    allEditButtons.forEach(button => {
        button.disabled = disabled;
    });

    radioButtons.forEach(radio => {
        radio.disabled = disabled;
    });

}


function saveTask(taskId) {

    let allTasks = JSON.parse(localStorage.getItem('tasks'));
    let taskText = document.querySelector(`#onetask-${taskId}`);
    let editedText = taskText.value;

    if (!validateInput(editedText, taskId)) {
        taskText.focus();
        taskText.style.borderBottom = '2px solid red';
        return;
    }

    const confirmSave = () => {

    let task = allTasks.find(task => task.id === taskId);
    task.text = editedText;
    localStorage.setItem('tasks', JSON.stringify(allTasks));
    showNotification('Task updated successfully!', 'green');
    toggleSave(taskId);
    renderTasks();

    };

    const cancelSave = () => {
        cancelEdit(taskId);
    };

    showToast('Are you sure you want to save changes to this task?', confirmSave, cancelSave);
}


function cancelEdit(taskId) {

    let tasks = JSON.parse(localStorage.getItem('tasks'));
    let task = tasks.find(task => task.id === taskId);

    let taskText = document.querySelector(`#onetask-${taskId}`);

    taskText.value = task.text; 
    toggleSave(taskId);
}


function toggleSave(taskId) {

    disableOtherElements(false);

    toggleTaskControls(taskId, true);

    let taskText = document.querySelector(`#onetask-${taskId}`);
    taskText.setAttribute('readonly', 'true');
    taskText.style.borderStyle = 'none';

    errorMsgSection.style.visibility = 'hidden';
}

function toggleTaskControls(taskId, showEdit) {

    document.querySelector(`#edit-${taskId}`).style.display = showEdit ? 'flex' : 'none';
    document.querySelector(`#save-${taskId}`).style.display = showEdit ? 'none' : 'flex';
}


function showErrormsg(text){
    
    errorMsgSection.style.visibility = 'visible';

    const errorMsg = document.querySelector('#errorMsgContent');
    errorMsg.textContent = text;

}


function showNotification(text = 'Notification', color = 'blue') {

    const notification = document.querySelector('.notification');

    notification.textContent = text;
    notification.style.backgroundColor = color;
    notification.style.visibility = 'visible';

    setTimeout(() => {
        notification.textContent = "";
        notification.style.visibility = 'hidden';
    }, 3000);
}

function showToast(message, onConfirm, onCancel) {

    const messageText = document.getElementById('message-text');
    const confirmButton = document.getElementById('confirm-button');
    const cancelButton = document.getElementById('cancel-button');

    toggleToast(true);
    messageText.textContent = message;

    confirmButton.onclick = () => {
        onConfirm();
        toggleToast(false);
    };

    cancelButton.onclick = () => {
        onCancel();
        toggleToast(false);
    };
}

function toggleToast(visible) {
    const toastContainer = document.getElementById('toast-container');
    toastContainer.style.display = visible ? 'flex' : 'none';
}
