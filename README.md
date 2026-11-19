# Taskflow – Kanban Board

A browser-based Kanban task board built for the SkillMe Full Stack Engineer Virtual Internship.

**Live demo:** https://kabantaskflow.netlify.app  
**Code:** https://github.com/ishmealnortey589-droid/taskflow

![Taskflow board](screenshot.png)

## Features
- Three columns: To Do, In Progress and Done, each with a live task count
- Add tasks with a title and priority (Low, Medium, High)
- **Drag and drop** cards between columns, with the target column highlighted
- **Keyboard-friendly:** Move and Delete buttons on every card, with clear focus styles
- Tasks are saved in `localStorage` and survive a refresh
- Import sample tasks from the JSONPlaceholder API (with loading and error messages)
- Live search by title, a priority filter and a Clear board button
- Responsive: columns stack vertically on screens narrower than 700px

## Tech
HTML, CSS (Grid + CSS variables), vanilla JavaScript (HTML Drag and Drop API, Fetch API, localStorage)

## Run locally
1. Download or clone this repository.
2. Open `index.html` in your browser. No build step or install is needed.

## Project structure
- `index.html` – page structure
- `style.css` – layout, priority colours, drag highlight, responsive styles
- `script.js` – tasks array, render(), saving, import, search and drag and drop

## Note
Drag and drop uses the HTML5 Drag and Drop API, which works with a mouse. On touch screens, use the Move buttons on each card.
