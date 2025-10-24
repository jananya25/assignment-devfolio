## Project Requirements

Build a **Project & Task Management System** with an AI-powered assistant using the **MERN Stack** and **Gemini AI Integration**.

### Tech Stack (Mandatory)

- **MongoDB** - Database
- **Express.js** - Backend framework
- **React.js** - Frontend framework
- **Node.js** - Runtime environment
- **Gemini AI** - AI integration for task summarization and Q&A

---

## Functional Requirements

### 1. Project Management

- Create, read, update, and delete projects
- Each project should have:
    - Name
    - Description
    - Created date
- View list of all projects
- Select a project to view its task board

### 2. Task Management (within a project)

- Create, read, update, and delete tasks/cards
- Each card should contain:
    - Title
    - Description
    - Status/Column assignment
- Organize cards into columns (e.g., To Do, In Progress, Done)

### 3. Kanban Board Interface (Trello-like)

- Visual pipeline/board view for each project
- **Drag and drop** functionality to move cards between columns
- Switch between different projects
- Cards should display key information at a glance

### 4. AI Features (Gemini Integration)

- **Summarize**: AI can summarize all tasks in the current project
- **Question & Answer**: Ask questions about specific cards and get AI-powered responses
- Integration with Google's Gemini API

### 5. Data Persistence

- Store all projects and tasks in MongoDB
- Maintain proper relationships (tasks belong to projects)
- Changes should persist across sessions

---

## Project Hierarchy

```
Projects
  └── Columns/Statuses (To Do, In Progress, Done, etc.)
       └── Tasks/Cards (individual task items)

```

---

## Non-Functional Requirements

- **Responsive UI** - Should work on different screen sizes
- **User-friendly** - Intuitive drag-and-drop interactions
- **API-based Architecture** - Frontend communicates with backend via RESTful APIs
- **Clean Code** - Well-structured, readable, and maintainable code