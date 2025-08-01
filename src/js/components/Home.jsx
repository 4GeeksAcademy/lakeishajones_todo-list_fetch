import React, { useState, useEffect } from "react";

const Home = () => {
	const [tasks, setTasks] = useState([]);
	const [inputTaskValue, setInputTaskValue] = useState('');
	const [totalTasksCreated, setTotalTasksCreated] = useState(0);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	const API_BASE_URL = 'https://playground.4geeks.com/todo';
	const [username, setUsername] = useState('');
	const [isUserSet, setIsUserSet] = useState(false);

	// Initialize user and load tasks on component mount
	useEffect(() => {
		if (isUserSet && username) {
			initializeUser();
		}
	}, [isUserSet, username]);

	const initializeUser = async () => {
		try {
			setLoading(true);
			setError('');
			
			// Try to get existing user or create new one
			const response = await fetch(`${API_BASE_URL}/users/${username}`);
			
			if (response.status === 404) {
				// User doesn't exist, create new user
				await fetch(`${API_BASE_URL}/users/${username}`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					}
				});
			}
			
			// Load tasks after user is ready
			await loadTasks();
		} catch (err) {
			setError('Failed to initialize user. Please try again.');
			console.error('Error initializing user:', err);
		} finally {
			setLoading(false);
		}
	};

	const loadTasks = async () => {
		try {
			setError('');
			const response = await fetch(`${API_BASE_URL}/users/${username}`);
			
			if (!response.ok) {
				throw new Error('Failed to fetch tasks');
			}
			
			const userData = await response.json();
			setTasks(userData.todos || []);
			setTotalTasksCreated(userData.todos?.length || 0);
		} catch (err) {
			setError('Failed to load tasks. Please try again.');
			console.error('Error loading tasks:', err);
		}
	};

	const handleUsernameSubmit = (e) => {
		e.preventDefault();
		if (username.trim()) {
			setIsUserSet(true);
		}
	};

	const handleInputChange = (e) => {
		setInputTaskValue(e.target.value);
	};

	const addTask = async () => {
		if (inputTaskValue.trim() === '') return;

		try {
			setLoading(true);
			setError('');

			const response = await fetch(`${API_BASE_URL}/todos/${username}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					label: inputTaskValue.trim(),
					is_done: false
				})
			});

			if (!response.ok) {
				throw new Error('Failed to add task');
			}

			// Clear input and reload tasks from server
			setInputTaskValue('');
			await loadTasks();
		} catch (err) {
			setError('Failed to add task. Please try again.');
			console.error('Error adding task:', err);
		} finally {
			setLoading(false);
		}
	};

	const handleKeyDown = (event) => {
		if (event.key === 'Enter') {
			addTask();
		}
	};

	const deleteTask = async (taskId) => {
		try {
			setLoading(true);
			setError('');

			const response = await fetch(`${API_BASE_URL}/todos/${taskId}`, {
				method: 'DELETE'
			});

			if (!response.ok) {
				throw new Error('Failed to delete task');
			}

			// Reload tasks from server
			await loadTasks();
		} catch (err) {
			setError('Failed to delete task. Please try again.');
			console.error('Error deleting task:', err);
		} finally {
			setLoading(false);
		}
	};

	const clearAllTasks = async () => {
		try {
			setLoading(true);
			setError('');

			// Delete all tasks one by one
			const deletePromises = tasks.map(task => 
				fetch(`${API_BASE_URL}/todos/${task.id}`, {
					method: 'DELETE'
				})
			);

			await Promise.all(deletePromises);

			// Reload tasks from server to confirm empty list
			await loadTasks();
		} catch (err) {
			setError('Failed to clear all tasks. Please try again.');
			console.error('Error clearing all tasks:', err);
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<div className="container">
				{!isUserSet ? (
					// Username Input Form
					<div className="username-form">
						<h1>Let's Get it Done</h1>
						<form onSubmit={handleUsernameSubmit}>
							<label>Enter your username to get started:</label>
							<input
								type="text"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								placeholder="Enter username"
								required
							/>
							<button type="submit">Start Using Todos</button>
						</form>
					</div>
				) : (
					// Main Todo App
					<>
						<h1>Todo List - {username}</h1>
						
						{/* Error Message */}
						{error && (
							<div className="error-message">
								{error}
							</div>
						)}

						{/* Loading Indicator */}
						{loading && (
							<div className="loading-message">
								Loading...
							</div>
						)}

						{/* Task Counter */}
						<div className="counter-box">
							<div style={{fontSize: '16px', fontWeight: 'bold', marginBottom: '5px'}}>
								Total Tasks Created: {totalTasksCreated}
							</div>
							<div style={{fontSize: '14px', color: '#666'}}>
								Current Tasks: {tasks.length}
							</div>
						</div>

						{/* Input Section */}
						<div className="input-section">
							<input
								type="text"
								value={inputTaskValue}
								onChange={handleInputChange}
								onKeyDown={handleKeyDown}
								placeholder="What needs to be done?"
								disabled={loading}
								style={{flex: 1, marginBottom: 0}}
							/>
							<button
								onClick={addTask}
								disabled={loading || inputTaskValue.trim() === ''}
								className="add-btn"
							>
								Add
							</button>
						</div>

						{/* Clear All Button */}
						{tasks.length > 0 && (
							<div style={{textAlign: 'center'}}>
								<button
									onClick={clearAllTasks}
									disabled={loading}
									className="clear-all-btn"
								>
									Clear All Tasks
								</button>
							</div>
						)}

						{/* Task List */}
						<ol>
							{tasks.length === 0 ? (
								<li className="no-task">No tasks, add a task</li>
							) : (
								tasks.map((task) => (
									<li key={task.id} className="task-item">
										<span>{task.label}</span>
										<button 
											onClick={() => deleteTask(task.id)} 
											disabled={loading}
											className="delete-btn"
										>
											×
										</button>
									</li>
								))
							)}
						</ol>
					</>
				)}
			</div>
		</>
	);
};

export default Home;