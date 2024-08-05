document.addEventListener('DOMContentLoaded', () => {
  const startButton = document.getElementById('startButton');
  const stopButton = document.getElementById('stopButton');
  const notesContainer = document.getElementById('notesContainer');

  let isRecording = false;
  let recognition;
  let currentNote;
  let noteId = 0;

  function initializeSpeechRecognition() {
      if (!('webkitSpeechRecognition' in window)) {
          alert("Speech recognition not supported");
          return;
      }

      recognition = new webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US'; // Set language

      recognition.onresult = (event) => {
          if (isRecording) {
              let transcript = '';
              for (let i = event.resultIndex; i < event.results.length; i++) {
                  transcript += event.results[i][0].transcript;
              }
              currentNote.querySelector('.note-content').innerHTML += transcript + '<br>';
          }
      };

      recognition.onerror = (event) => {
          console.error("Speech recognition error:", event.error);
          stopRecording(); // Automatically stop on error
      };

      recognition.onend = () => {
          if (isRecording) {
              stopRecording(); // Automatically stop if recognition ends unexpectedly
          }
      };
  }

  function startRecording() {
      if (!recognition) initializeSpeechRecognition();
      isRecording = true;
      recognition.start();
      currentNote = document.createElement('div');
      currentNote.className = 'note';
      noteId++;
      currentNote.dataset.id = noteId;
      const timestamp = new Date().toLocaleString();
      currentNote.innerHTML = `
          <div class="timestamp">${timestamp}</div>
          <div class="note-content"></div>
          <button class="delete-btn" onclick="deleteNote(${noteId})">
              <i class="ri-delete-bin-fill"></i>
          </button>`;
      notesContainer.appendChild(currentNote);
      startButton.disabled = true;
      stopButton.disabled = false;
      saveNotesToLocalStorage();
  }

  function stopRecording() {
      if (isRecording && recognition) {
          isRecording = false;
          recognition.stop();
          currentNote.querySelector('.note-content').innerHTML += '<br><strong>Note saved.</strong>';
          startButton.disabled = false;
          stopButton.disabled = true;
          saveNotesToLocalStorage();
      }
  }

  function deleteNote(id) {
      const noteToDelete = document.querySelector(`.note[data-id='${id}']`);
      if (noteToDelete) {
          noteToDelete.remove();
          saveNotesToLocalStorage();
      }
  }

  function saveNotesToLocalStorage() {
      const notes = Array.from(document.querySelectorAll('.note')).map(note => ({
          id: note.dataset.id,
          content: note.querySelector('.note-content').innerHTML,
          timestamp: note.querySelector('.timestamp').innerText
      }));
      localStorage.setItem('notes', JSON.stringify(notes));
  }

  function loadNotesFromLocalStorage() {
      const savedNotes = JSON.parse(localStorage.getItem('notes')) || [];
      savedNotes.forEach(note => {
          currentNote = document.createElement('div');
          currentNote.className = 'note';
          currentNote.dataset.id = note.id;
          currentNote.innerHTML = `
              <div class="timestamp">${note.timestamp}</div>
              <div class="note-content">${note.content}</div>
              <button class="delete-btn" onclick="deleteNote(${note.id})">
                  <i class="ri-delete-bin-fill"></i>
              </button>`;
          notesContainer.appendChild(currentNote);
      });
  }

  // Initialize notes on page load
  loadNotesFromLocalStorage();

  // Add event listeners for buttons
  startButton.addEventListener('click', startRecording);
  stopButton.addEventListener('click', stopRecording);

  // Expose deleteNote function to the global scope
  window.deleteNote = deleteNote;
});
