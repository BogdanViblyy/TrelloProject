// Wait for the HTML document to be fully loaded before running the script
document.addEventListener("DOMContentLoaded", () => {
    // Get references to all the important HTML elements
    const notesListEl = document.getElementById("notes-list");
    const addNoteBtn = document.getElementById("add-note-btn");
    const deleteNoteBtn = document.getElementById("delete-note-btn");
    
    const editorPlaceholder = document.getElementById("editor-placeholder");
    const editorMain = document.getElementById("editor-main");
    
    const noteTitleInput = document.getElementById("note-title-input");
    const noteContentInput = document.getElementById("note-content-input");
    const noteColorInput = document.getElementById("note-color-input");

    let notes = [];
    let activeNoteId = null;

    // --- DATA MANAGEMENT FUNCTIONS ---

    // Function to get notes from localStorage
    function getNotesFromStorage() {
        const storedNotes = localStorage.getItem('focusnotes-notes');
        return storedNotes ? JSON.parse(storedNotes) : [];
    }

    // Function to save notes to localStorage
    function saveNotesToStorage() {
        localStorage.setItem('focusnotes-notes', JSON.stringify(notes));
    }

    // --- UI RENDERING FUNCTIONS ---

    // Function to render the list of notes in the sidebar
    function renderNotesList() {
        // Clear the current list
        notesListEl.innerHTML = "";
        
        // If there are no notes, show a message
        if (notes.length === 0) {
            notesListEl.innerHTML = `<div class="note-item" style="text-align: center; cursor: default;">No notes yet.</div>`;
            return;
        }

        // Sort notes by most recently updated
        const sortedNotes = [...notes].sort((a, b) => b.updatedAt - a.updatedAt);

        // Create an HTML element for each note
        sortedNotes.forEach(note => {
            const noteItem = document.createElement("div");
            noteItem.classList.add("note-item");
            noteItem.dataset.noteId = note.id; // Store the note's ID in a data attribute
            noteItem.style.borderLeft = `5px solid ${note.color}`;

            // Add a selected class if it's the active note
            if (note.id === activeNoteId) {
                noteItem.classList.add("selected");
            }

            // Create title element
            const noteTitle = document.createElement("div");
            noteTitle.classList.add("note-item-title");
            noteTitle.textContent = note.title;

            noteItem.appendChild(noteTitle);
            
            // Add a click event to select the note
            noteItem.addEventListener("click", () => selectNote(note.id));

            notesListEl.appendChild(noteItem);
        });
    }

    // Function to show or hide the editor
    function updateEditorVisibility() {
        if (activeNoteId === null) {
            editorMain.classList.add("hidden");
            editorPlaceholder.classList.remove("hidden");
        } else {
            editorMain.classList.remove("hidden");
            editorPlaceholder.classList.add("hidden");
        }
    }

    // --- CORE LOGIC FUNCTIONS ---

    // Function to handle selecting a note
    function selectNote(noteId) {
        activeNoteId = noteId;
        const selectedNote = notes.find(note => note.id === noteId);
        
        if (selectedNote) {
            noteTitleInput.value = selectedNote.title;
            noteContentInput.value = selectedNote.content;
            noteColorInput.value = selectedNote.color;
        }
        
        updateEditorVisibility();
        renderNotesList(); // Re-render to show the "selected" state
    }

    // Function to add a new note
    function addNote() {
        const newNote = {
            id: Date.now(), // Use timestamp as a simple unique ID
            title: "New Note",
            content: "",
            color: "#66ccff", // A default color
            updatedAt: Date.now()
        };

        notes.push(newNote);
        saveNotesToStorage();
        activeNoteId = newNote.id; // Automatically select the new note
        selectNote(newNote.id);
    }
    
    // Function to update the active note
    function updateActiveNote() {
        if (activeNoteId === null) return;
        
        const noteToUpdate = notes.find(note => note.id === activeNoteId);
        if (noteToUpdate) {
            noteToUpdate.title = noteTitleInput.value;
            noteToUpdate.content = noteContentInput.value;
            noteToUpdate.color = noteColorInput.value;
            noteToUpdate.updatedAt = Date.now();
            
            saveNotesToStorage();
            renderNotesList(); // Re-render to reflect potential title change
        }
    }

    // Function to delete the active note
    function deleteActiveNote() {
        if (activeNoteId === null) return;

        // User confirmation
        const confirmed = confirm("Are you sure you want to delete this note?");
        if (!confirmed) return;

        // Filter out the note to be deleted
        notes = notes.filter(note => note.id !== activeNoteId);
        activeNoteId = null; // Deselect the note

        saveNotesToStorage();
        updateEditorVisibility();
        renderNotesList();
    }

    // --- EVENT LISTENERS ---

    addNoteBtn.addEventListener("click", addNote);
    deleteNoteBtn.addEventListener("click", deleteActiveNote);

    // Auto-save when user types in title or content
    noteTitleInput.addEventListener("input", updateActiveNote);
    noteContentInput.addEventListener("input", updateActiveNote);
    
    // Update color when changed
    noteColorInput.addEventListener("change", updateActiveNote);

    // --- INITIALIZATION ---

    // Load initial data and render the UI
    function initialize() {
        notes = getNotesFromStorage();
        updateEditorVisibility();
        renderNotesList();
    }

    initialize();
});
