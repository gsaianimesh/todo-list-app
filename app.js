document.addEventListener("DOMContentLoaded", () => {
    loadStoredTasks();
    startReminderCheck();
    requestNotificationPermission();
});

let tasks = [];
let editIndex = null; 


const loadStoredTasks = () => {
    const storedTasks = JSON.parse(localStorage.getItem("tasks"));
    if (storedTasks) {
        tasks = storedTasks;
        updateTasksList();
        updateStats();
    }
};


const saveTasks = () => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
};


const addOrEditTask = () => {
    const taskInput = document.getElementById("taskInput");
    const reminderInput = document.getElementById("reminderInput");
    const taskText = taskInput.value.trim();
    const reminderTime = reminderInput.value;

    if (!taskText) return; 

    if (editIndex !== null) {
        
        tasks[editIndex].text = taskText;
        tasks[editIndex].reminderTime = reminderTime;
        editIndex = null;
        setAddButtonIcon("+"); 
    } else {
        
        tasks.push({ text: taskText, completed: false, reminderTime: reminderTime });
    }

    clearInputs();
    updateTasksList();
    updateStats();
    saveTasks();
};


const setAddButtonIcon = (symbol) => {
    document.getElementById("newTask").innerHTML = symbol === "+" ? "+" : '<img src="./img/save.png" alt="Save" style="width: 100%; height: 100%;">';
};


const clearInputs = () => {
    document.getElementById("taskInput").value = "";
    document.getElementById("reminderInput").value = "";
};


const editTask = (index) => {
    const taskInput = document.getElementById("taskInput");
    const reminderInput = document.getElementById("reminderInput");

    taskInput.value = tasks[index].text;
    reminderInput.value = tasks[index].reminderTime;
    editIndex = index; 
    setAddButtonIcon("save");
};


const toggleTaskComplete = (index) => {
    tasks[index].completed = !tasks[index].completed;
    updateTasksList();
    updateStats();
    saveTasks();

    
    if (tasks.every(task => task.completed)) {
        blastConfetti();
    }
};


const deleteTask = (index) => {
    tasks.splice(index, 1);
    updateTasksList();
    updateStats();
    saveTasks();
};


const updateStats = () => {
    const completedTasks = tasks.filter(task => task.completed).length;
    const totalTasks = tasks.length;
    const progress = totalTasks ? (completedTasks / totalTasks) * 100 : 0;
    document.getElementById("progress").style.width = `${progress}%`;
    document.getElementById("numbers").innerText = `${completedTasks} / ${totalTasks}`;
    updateStatusMessage(completedTasks, totalTasks);
};


const updateStatusMessage = (completedTasks, totalTasks) => {
    const statusMessage = document.querySelector(".details p");

    if (totalTasks === 0) {
        statusMessage.innerText = "Please add your tasks";
    } else if (completedTasks === totalTasks) {
        statusMessage.innerText = "Keep it up!";
    } else if (completedTasks >= totalTasks / 2) {
        statusMessage.innerText = "Good Job!";
    } else {
        statusMessage.innerText = "Keep working";
    }
};


const updateTasksList = () => {
    const taskList = document.getElementById("task-list");
    taskList.innerHTML = "";

    tasks.forEach((task, index) => {
        const listItem = document.createElement("li");
        listItem.className = "taskItem";

        const timeLeftText = calculateTimeLeft(task.reminderTime);

        listItem.innerHTML = `
            <div class="task ${task.completed ? 'completed' : ''}">
                <input type="checkbox" class="checkbox" ${task.completed ? "checked" : ""} />
                <p>${task.text}</p>
                <small>${timeLeftText}</small>
            </div>
            <div class="icons">
                <img src="./edit.png" onclick="editTask(${index})" />
                <img src="./bin.png" onclick="deleteTask(${index})" />
            </div>
        `;

        listItem.querySelector(".checkbox").addEventListener("change", () => toggleTaskComplete(index));
        taskList.append(listItem);
    });
};


const calculateTimeLeft = (reminderTime) => {
    if (!reminderTime) return "";

    const now = new Date();
    const reminderDate = new Date(reminderTime);
    const timeDiff = reminderDate - now;

    if (timeDiff <= 0) return "Due now";

    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    return `Time left: ${hours}h ${minutes}m`;
};


const blastConfetti = () => {
    const count = 200;
    const defaults = { origin: { y: 0.7 } };

    const fire = (particleRatio, opts) => {
        confetti(Object.assign({}, defaults, opts, { particleCount: Math.floor(count * particleRatio) }));
    };

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
};


const requestNotificationPermission = () => {
    if ("Notification" in window) {
        Notification.requestPermission().then(permission => {
            if (permission !== "granted") {
                alert("Enable notifications to receive task reminders.");
            }
        });
    }
};


const startReminderCheck = () => {
    setInterval(() => {
        const now = new Date();
        tasks.forEach((task, index) => {
            if (task.reminderTime && !task.completed && new Date(task.reminderTime) <= now) {
                showReminder(task.text);
                task.reminderTime = null; 
                saveTasks();
                updateTasksList(); 
            }
        });
    }, 60000);
};


const showReminder = (taskText) => {
    if ("Notification" in window) {
        if (Notification.permission === "granted") {
            new Notification("Task Reminder", { body: `Reminder: ${taskText}` });
        } else {
            console.log("Notification permission denied or not yet granted.");
        }
    } else {
        alert(`Reminder: ${taskText}`); 
    }
};


document.getElementById("newTask").addEventListener("click", function (e) {
    e.preventDefault();
    addOrEditTask();
});
