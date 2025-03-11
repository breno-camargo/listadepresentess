document.addEventListener("DOMContentLoaded", loadTasks);
        
        function addTask() {
            let taskName = document.getElementById("taskName").value.trim();
            let taskLink = document.getElementById("taskLink").value.trim();
            if (taskName === "" || taskLink === "") return;
            
            let taskList = document.getElementById("taskList");
            let li = document.createElement("li");
            li.innerHTML = `<a href="${taskLink}" target="_blank">${taskName}</a> <button onclick="removeTask(this)">X</button>`;
            taskList.appendChild(li);
            
            saveTasks();
            document.getElementById("taskName").value = "";
            document.getElementById("taskLink").value = "";
        }
        
        function removeTask(button) {
            button.parentElement.remove();
            saveTasks();
        }
        
        function saveTasks() {
            let tasks = [];
            document.querySelectorAll("#taskList li").forEach(li => {
                let link = li.querySelector("a");
                tasks.push({ name: link.innerText, link: link.href });
            });
            localStorage.setItem("tasks", JSON.stringify(tasks));
        }
        
        function loadTasks() {
            let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
            let taskList = document.getElementById("taskList");
            tasks.forEach(task => {
                let li = document.createElement("li");
                li.innerHTML = `<a href="${task.link}" target="_blank">${task.name}</a> <button onclick="removeTask(this)">X</button>`;
                taskList.appendChild(li);
            });
        }