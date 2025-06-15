# React To‑Do List

A simple React component for managing a to‑do list, with support for:

- **Add**, **remove**, and **mark complete** tasks  
- **Validate** empty/duplicate task input  
- **Sort** by date or status (optional)  
- **Filter** by all/active/completed (optional)  
- **Persist** tasks in **localStorage** (optional)

---

## 🚀 Getting Started

1. **Clone your repo** (if you haven’t yet):
   ```bash
   git clone https://github.com/aartthh/ToDoList.git
   cd ToDoList
✅ Features & Testing Guidance
Follow these steps to verify everything works:

Add Tasks

Try submitting an empty task → should be prevented with an error/alert.

Add “Buy groceries”, “Walk dog”, etc.

Complete / Remove Tasks

Click the ✔️ icon to mark a task complete → it should visually update.

Click the 🗑️ icon to remove any task.

Sorting & Filtering (if implemented)

Use the Sort dropdown to order tasks by creation date or status.

Switch between All, Active, and Completed filters.

Persistence (localStorage)

Add a few tasks, then refresh the page.

All tasks and their completion states should remain.

Edge Cases

Add the same task text twice → should warn or prevent duplicates.

Delete all tasks and confirm the list clears correctly.




