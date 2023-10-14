import "./App.css";
import { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faTrash, faRectangleList } from "@fortawesome/free-solid-svg-icons";
library.add(faTrash, faRectangleList);

function App() {
  const [input, setInput] = useState("");
  const [tasks, setTasks] = useState([]);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/tasks`);
      setTasks(response.data);
    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    console.log("Component mounted.");
    fetchTasks();
  }, []);

  const handleChange = (e) => {
    setInput(e.target.value);
  };
  const sortAndSetTasks = (tasks) => {
    const sortedTasks = tasks.slice().sort((a, b) => {
      return a.isDone === b.isDone ? 0 : a.isDone ? 1 : -1;
    });

    setTasks(sortedTasks);
  };
  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      if (!input) {
        alert("Veuillez rentrer une nouvelle tâche");
      } else {
        await axios.post(
          `http://localhost:3000/tasks`,
          {
            name: input,
            isDone: false,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        setTasks([...tasks, { name: input, isDone: false }]);
        setInput("");
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleClickCheck = async (index) => {
    try {
      const taskId = tasks[index].id;
      console.log("Task ID:", taskId);
      if (!taskId) {
        console.error("ID de tâche non défini ou invalide.");
        return;
      }
      const updatedTasks = [...tasks];
      updatedTasks[index].isDone = !updatedTasks[index].isDone;

      await axios.put(`http://localhost:3000/tasks/done/${taskId}`, {
        isDone: updatedTasks[index].isDone,
      });

      setTasks(updatedTasks);
    } catch (error) {
      console.error(
        "Erreur lors de la mise à jour de la tâche :",
        error.message
      );
    }
  };

  const handleClickTrash = async (index) => {
    try {
      let tasksCopy = [...tasks];
      const taskIdToDelete = tasksCopy[index].id;
      await axios.delete(`http://localhost:3000/tasks/${taskIdToDelete}`);

      tasksCopy.splice(index, 1);
      setTasks(tasksCopy);
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <div className="App">
      <header>
        <div>
          <FontAwesomeIcon
            className="rectangle-list"
            icon="rectangle-list"
            size="2x"
            color="#5c47d3"
          />
          <h1>Todo List</h1>
        </div>
      </header>

      <h2>
        Toutes les tâches
        <span> ({tasks.length})</span>
      </h2>
      <ul className="tasks">
        {tasks.length > 0 &&
          tasks.map((task, index) => {
            return (
              <li key={task.id}>
                <div>
                  <input
                    type="checkbox"
                    checked={task.isDone}
                    onChange={() => handleClickCheck(index)}
                  />
                  <span className={task.isDone ? "done" : ""} key={index}>
                    {task.name}
                  </span>
                </div>

                <FontAwesomeIcon
                  onClick={() => handleClickTrash(index)}
                  className="trash"
                  icon="trash"
                  size="1x"
                />
              </li>
            );
          })}
      </ul>
      <h2>
        Tâches restantes
        <span> ({tasks.filter((task) => !task.isDone).length})</span>
      </h2>

      <ul className="tasks">
        {tasks.length > 0 &&
          tasks
            .filter((task) => !task.isDone)
            .map((task, index) => {
              return (
                <li key={task.id}>
                  <div>
                    <input
                      type="checkbox"
                      checked={task.isDone}
                      onChange={() => handleClickCheck(index)}
                    />
                    <span className={task.isDone ? "done" : ""} key={index}>
                      {task.name}
                    </span>
                  </div>

                  <FontAwesomeIcon
                    onClick={() => handleClickTrash(index)}
                    className="trash"
                    icon="trash"
                    size="1x"
                  />
                </li>
              );
            })}
      </ul>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="nouvelle tâche"
          value={input}
          onChange={handleChange}
        />
        <input
          type="submit"
          value="Ajouter une tâche"
          className="submit-button"
          onClick={handleSubmit}
        />
      </form>
    </div>
  );
}

export default App;
