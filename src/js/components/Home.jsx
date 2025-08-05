import React, { useState, useEffect } from "react";

// ===== API SERVICE =====
const API_BASE_URL = "https://playground.4geeks.com/todo";

const todoAPI = {
  initializeUser: async (username) => {
    const response = await fetch(`${API_BASE_URL}/users/${username}`);

    if (response.status === 404) {
      await fetch(`${API_BASE_URL}/users/${username}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
  },

  getUserTasks: async (username) => {
    const response = await fetch(`${API_BASE_URL}/users/${username}`);

    if (!response.ok) {
      throw new Error("Failed to fetch tasks");
    }

    return await response.json();
  },

  addTask: async (username, taskText) => {
    const response = await fetch(`${API_BASE_URL}/todos/${username}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        label: taskText,
        is_done: false,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to add task");
    }

    return await response.json();
  },

  deleteTask: async (taskId) => {
    const response = await fetch(`${API_BASE_URL}/todos/${taskId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete task");
    }
  },

  clearAllTasks: async (tasks) => {
    const deletePromises = tasks.map((task) =>
      fetch(`${API_BASE_URL}/todos/${task.id}`, {
        method: "DELETE",
      })
    );

    await Promise.all(deletePromises);
  },
};

// ===== SMALL COMPONENTS =====
const ErrorMessage = ({ message }) => {
  if (!message) return null;

  return <div className="error">{message}</div>;
};

const LoadingMessage = ({ isLoading }) => {
  if (!isLoading) return null;

  return <div className="loading">Loading</div>;
};

const TaskCounter = ({ totalCreated, currentCount }) => {
  return (
    <div className="counter-box">
      <div className="counter-total">Total Tasks Created: {totalCreated}</div>
      <div className="counter-current">Current Tasks: {currentCount}</div>
    </div>
  );
};

const TaskInput = ({ onAddTask, disabled }) => {
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = () => {
    if (inputValue.trim() === "") return;
    onAddTask(inputValue.trim());
    setInputValue("");
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div className="input-section">
      <input
        type="text"
        className="task-input"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="What needs to be done?"
        disabled={disabled}
      />
      <button
        onClick={handleSubmit}
        disabled={disabled || inputValue.trim() === ""}
        className="add-btn"
      >
        Add
      </button>
    </div>
  );
};

const ClearAllButton = ({ onClearAll, hasTasks, disabled }) => {
  if (!hasTasks) return null;

  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to clear all tasks?")) {
      onClearAll();
    }
  };

  return (
    <div className="clear-all-container">
      <button
        onClick={handleClearAll}
        disabled={disabled}
        className="clear-all-btn"
      >
        Clear All Tasks
      </button>
    </div>
  );
};

const TaskItem = ({ task, onDelete, disabled }) => {
  return (
    <li className="task-item">
      <span className="task-text">{task.label}</span>
      <button
        onClick={() => onDelete(task.id)}
        disabled={disabled}
        className="delete-btn"
      >
        ×
      </button>
    </li>
  );
};

const TaskList = ({ tasks, onDeleteTask, disabled }) => {
  return (
    <ol className="task-list">
      {tasks.length === 0 ? (
        <li className="no-tasks">No tasks, add a task</li>
      ) : (
        tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onDelete={onDeleteTask}
            disabled={disabled}
          />
        ))
      )}
    </ol>
  );
};

// ===== USERNAME FORM COMPONENT =====
const UsernameForm = ({ onSubmit }) => {
  const [inputUsername, setInputUsername] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputUsername.trim()) {
      onSubmit(inputUsername.trim());
    }
  };

  return (
    <div className="username-form">
      <h1 className="welcome-title">Let's Get it Done</h1>
      <form onSubmit={handleSubmit}>
        <label className="username-label">
          Enter your username to get started:
        </label>
        <input
          type="text"
          className="username-input"
          value={inputUsername}
          onChange={(e) => setInputUsername(e.target.value)}
          placeholder="Enter username"
          required
        />
        <button type="submit" className="start-btn">
          Start Using Todos
        </button>
      </form>
    </div>
  );
};

// ===== MAIN TODO APP COMPONENT =====
const TodoApp = ({ username, onLogout }) => {
  const [tasks, setTasks] = useState([]);
  const [totalTasksCreated, setTotalTasksCreated] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    initializeUser();
  }, [username]);

  const initializeUser = async () => {
    try {
      setLoading(true);
      setError("");

      await todoAPI.initializeUser(username);
      await loadTasks();
    } catch (err) {
      setError("Failed to initialize user. Please try again.");
      console.error("Error initializing user:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadTasks = async () => {
    try {
      setError("");
      const userData = await todoAPI.getUserTasks(username);
      setTasks(userData.todos || []);
      setTotalTasksCreated(userData.todos?.length || 0);
    } catch (err) {
      setError("Failed to load tasks. Please try again.");
      console.error("Error loading tasks:", err);
    }
  };

  const handleAddTask = async (taskText) => {
    try {
      setLoading(true);
      setError("");

      await todoAPI.addTask(username, taskText);
      await loadTasks();
    } catch (err) {
      setError("Failed to add task. Please try again.");
      console.error("Error adding task:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      setLoading(true);
      setError("");

      await todoAPI.deleteTask(taskId);
      await loadTasks();
    } catch (err) {
      setError("Failed to delete task. Please try again.");
      console.error("Error deleting task:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearAll = async () => {
    try {
      setLoading(true);
      setError("");

      await todoAPI.clearAllTasks(tasks);
      await loadTasks();
    } catch (err) {
      setError("Failed to clear all tasks. Please try again.");
      console.error("Error clearing all tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="header">
        <h1 className="title">{username}-Todo List </h1>
        <button onClick={onLogout} className="change-user-btn">
          Change User
        </button>
      </div>

      <ErrorMessage message={error} />
      <LoadingMessage isLoading={loading} />
      <TaskCounter
        totalCreated={totalTasksCreated}
        currentCount={tasks.length}
      />
      <TaskInput onAddTask={handleAddTask} disabled={loading} />
      <ClearAllButton
        onClearAll={handleClearAll}
        hasTasks={tasks.length > 0}
        disabled={loading}
      />
      <TaskList
        tasks={tasks}
        onDeleteTask={handleDeleteTask}
        disabled={loading}
      />
    </>
  );
};

// ===== MAIN HOME COMPONENT =====
const Home = () => {
  const [username, setUsername] = useState("");
  const [isUserSet, setIsUserSet] = useState(false);

  useEffect(() => {
    const savedUsername = sessionStorage.getItem("todoUsername");
    if (savedUsername) {
      setUsername(savedUsername);
      setIsUserSet(true);
    }
  }, []);

  const handleUsernameSubmit = (newUsername) => {
    sessionStorage.setItem("todoUsername", newUsername);
    setUsername(newUsername);
    setIsUserSet(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("todoUsername");
    setUsername("");
    setIsUserSet(false);
  };

  return (
    <div className="app-container">
      <div className="container">
        {!isUserSet ? (
          <UsernameForm onSubmit={handleUsernameSubmit} />
        ) : (
          <TodoApp username={username} onLogout={handleLogout} />
        )}
      </div>
    </div>
  );
};

export default Home;
