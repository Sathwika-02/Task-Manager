# Real-Time Task Manager

## Overview
This project is a Real-Time Task Manager application that allows users to create, update, and track tasks. The application features real-time notifications using Socket.io, ensuring that users receive instant updates on task changes. It provides an intuitive user interface and supports various task management functionalities.

## Table of Contents
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Usage](#usage)
- [How to Run](#how-to-run)

## Features
- **Task Creation**: Add new tasks with details such as title, content, priority, and due date.
- **Task Updating**: Edit existing tasks and update their details.
- **Task Deletion**: Remove tasks that are no longer needed.
- **Real-Time Notifications**: Receive instant notifications for task updates, creations, and deletions via Socket.io.
- **Task Status Tracking**: Track the status of tasks (e.g., In Progress, Completed, Pending).
- **Filtering and Sorting**: Filter tasks by status and sort them by due date.
- **Responsive Design**: Fully responsive interface that works on various screen sizes.

## Technologies Used
- **Frontend**: React.js
- **Backend**: Node.js with Express
- **Database**: MongoDB
- **Real-Time Communication**: Socket.io
- **Styling**: Tailwind CSS or similar
- **Version Control**: Git & GitHub

## Installation

### Prerequisites
Ensure you have the following installed on your machine:
- Node.js (v14 or later)
- npm (Node Package Manager)
- MongoDB (for local development)

### Step 1: Clone the Repository
```bash
git clone https://github.com/Sathwika-02/Task-Manager.git
```

### Step 2: Navigate to the Project Directory
Change into the project directory:
```
cd Task-Manager
```

### Step 3: Install Dependencies
Run the following command to install the necessary dependencies for both the frontend and backend:
```
npm install
```

### Step 4: Set Up the Environment Variables
Create a .env file in the root of your project directory and configure the required environment variables, such as MongoDB connection string and port settings. The .env file should look something like this:

```

MONGODB_URI=mongodb://localhost:27017/task-manager
PORT=5000

```

### Usage
After setting up the environment variables, you can start the application.


### How to Run
### Step 1: Start the Backend Server
Navigate to the server directory and start the backend server:
```
cd backend
node index.js
```

### Step 2: Start the Frontend
In a new terminal window, navigate to the client directory and start the React application:
```
cd client
npm start
```

### Step 3: Access the Application
Open your web browser and go to http://localhost:3000 to access the Task Manager application.
