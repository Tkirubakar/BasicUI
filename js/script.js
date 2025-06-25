let notes = JSON.parse(localStorage.getItem('notes')) || [];
let selectedColor = '#EBCCED';
let colors = ['#EBCCED', '#FCFCFC', '#FFCA72', '#E5EE90', '#FFA78B'];
let currentNoteIndex = null;
let notesPerPage = 10;
let currentPage = 1;
let isTypingNew = false;
let isTypingEdit = false;
let lastModalId = null;

window.addEventListener('DOMContentLoaded', () => {
  renderModals();
  renderAppStructure();
  renderColorOptions(document.getElementById('colorOptions'), selectedColor);
  renderNotes();
  
  document.getElementById('newNoteBtn').addEventListener('click', () => showModal('modalNew'));
  document.getElementById('deleteAllBtn').addEventListener('click', () => showModal('modalDeleteAll'));
  document.getElementById('loadMoreBtn').addEventListener('click', loadMoreNotes);


  document.querySelectorAll('.closeModal').forEach(btn => {
    btn.addEventListener('click', event => {
      event.preventDefault();
      const modal = btn.closest('.modal');
      const id = modal?.id;

      if (id === 'modalNew') {
        const hasTyped = document.getElementById('noteTitle').value.trim() ||
                         document.getElementById('noteContentArea').value.trim() ||
                         document.getElementById('noteImage').value.trim();
        if (hasTyped) {
          lastModalId = id;
          document.getElementById('modalUnsavedChanges').classList.remove('hidden');
          return;
        }
      }
      if (id === 'modalEdit') {
        const hasTyped = document.getElementById('editTitle').value.trim() ||
                         document.getElementById('editContent').value.trim() ||
                         document.getElementById('editImage').value.trim();
        if (hasTyped) {
          lastModalId = id;
          document.getElementById('modalUnsavedChanges').classList.remove('hidden');
          return;
        }
      }

      closeModals();
    });
  });
  
  document.getElementById('noteTitle').addEventListener('input', () => { isTypingNew = true; updateAddButtonState(); });
  document.getElementById('noteContentArea').addEventListener('input', () => { isTypingNew = true; updateAddButtonState(); });
  document.getElementById('noteImage').addEventListener('input', () => { isTypingNew = true; });

  document.getElementById('editTitle').addEventListener('input', () => { isTypingEdit = true; });
  document.getElementById('editContent').addEventListener('input', () => { isTypingEdit = true; });
  document.getElementById('editImage').addEventListener('input', () => { isTypingEdit = true; });
  
  document.getElementById('confirmUnsavedExitBtn').addEventListener('click', () => {
    if (lastModalId === 'modalNew') {
      isTypingNew = false;
      clearNewNoteFields();
    }

    if (lastModalId === 'modalEdit') {
      isTypingEdit = false;
      document.getElementById('editTitle').value = '';
      document.getElementById('editContent').value = '';
      document.getElementById('editImage').value = '';
    }

    lastModalId = null;
    closeModals();
  });
  
  
  document.getElementById('cancelUnsavedExitBtn').addEventListener('click', () => {
    document.getElementById('modalUnsavedChanges').classList.add('hidden');
    if (lastModalId) {
      showModal(lastModalId);
    }
  });

  document.getElementById('noteTitle').addEventListener('input', updateAddButtonState);
  document.getElementById('noteContentArea').addEventListener('input', updateAddButtonState);

  document.getElementById('addNoteBtn').addEventListener('click', () => {
    const title = document.getElementById('noteTitle').value.trim();
    const content = document.getElementById('noteContentArea').value.trim();
    const image = document.getElementById('noteImage').value.trim();

    if (!title || !content) return;

    const note = {
      title,
      content,
      image,
      color: selectedColor,
      createdAt: new Date().toISOString()
    };

    notes.unshift(note);
    saveAndRender();
    closeModals();
    isTypingNew = false;
    clearNewNoteFields();
  });

  // Back button
    document.getElementById('backBtn').addEventListener('click', () => {
    document.querySelector('.header').classList.remove('hide');
    document.getElementById('noteDetailPage').style.display = 'none';
    document.getElementById('noteGrid').style.display = 'grid';
    document.querySelector('.load-more-wrapper').style.display = 'block';
  });

  // Edit button
  document.getElementById('editNoteBtn').addEventListener('click', () => {
    if (currentNoteIndex === null) return;
    const note = notes[currentNoteIndex];
    showModal('modalEdit');
    document.getElementById('editTitle').value = note.title;
    document.getElementById('editContent').value = note.content;
    document.getElementById('editImage').value = note.image || '';
    renderColorOptions(document.getElementById('editColorOptions'), note.color);
  });

  function saveAndRender() {
    localStorage.setItem('notes', JSON.stringify(notes));
    renderNotes();
  }

  document.getElementById('confirmDeleteAllBtn').addEventListener('click', () => {
    notes = [];
    saveAndRender();
    closeModals();
  });

  // Save edit
  document.getElementById('saveEditBtn').addEventListener('click', () => {
    if (currentNoteIndex === null) return;

    const title = document.getElementById('editTitle').value.trim();
    const content = document.getElementById('editContent').value.trim();
    const image = document.getElementById('editImage').value.trim();

    if (!title || !content) return;

    notes[currentNoteIndex] = {
      ...notes[currentNoteIndex],
      title,
      content,
      image,
      color: selectedColor,
      createdAt: new Date().toISOString()
    };

    notes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    saveAndRender();
    closeModals();
    isTypingEdit = false;

    document.getElementById('noteDetailPage').style.display = 'none';
    document.getElementById('noteGrid').style.display = 'grid';
    document.querySelector('.load-more-wrapper').style.display = 'block';
    document.querySelector('.header').classList.remove('hide');
  });


  document.getElementById('deleteNoteBtn').addEventListener('click', () => {
    showModal('modalConfirmDeleteNote');
  });

  document.getElementById('confirmDeleteNoteBtn').addEventListener('click', () => {
    if (currentNoteIndex === null) return;

    notes.splice(currentNoteIndex, 1);
    currentNoteIndex = null;
    saveAndRender();
    closeModals();

    document.getElementById('noteDetailPage').style.display = 'none';
    document.getElementById('noteGrid').style.display = 'grid';
    document.querySelector('.load-more-wrapper').style.display = 'block';
    document.querySelector('.header').classList.remove('hide');
  });

  document.getElementById('loadMoreBtn').addEventListener('click', () => {
    currentPage++;
    renderNotes();
  });
});

function renderColorOptions(container, current) {
  container.innerHTML = '';
  colors.forEach(color => {
    const btn = document.createElement('button');
    btn.style.backgroundColor = color;
    btn.classList.add('color-option');
    if (current === color) {
      btn.classList.add('selected');
      btn.innerHTML = '&#10003;';
      selectedColor = color;
    }
    btn.addEventListener('click', () => {
      selectedColor = color;
      renderColorOptions(container, color);
    });
    container.appendChild(btn);
  });
}

function renderNotes() {
  const container = document.getElementById('noteGrid');
  const emptyState = document.getElementById('emptyState');
  const deleteAllBtn = document.getElementById('deleteAllBtn');
  const loadMoreBtn = document.getElementById('loadMoreBtn');

  container.innerHTML = '';
  const end = notesPerPage * currentPage;
  const paginatedNotes = notes.slice(0, end);

  if (notes.length === 0) {
    emptyState.style.display = 'flex';
    container.style.display = 'none';
    deleteAllBtn.style.display = 'none';
    loadMoreBtn.style.display = 'none';
    return;
  }

  emptyState.style.display = 'none';
  container.style.display = 'grid';
  deleteAllBtn.style.display = 'inline-block';

  paginatedNotes.forEach((note, index) => {
    const card = document.createElement('div');
    card.className = 'note-card';
    card.style.backgroundColor = note.color;

    const createdDate = new Date(note.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    card.innerHTML = `
      <h3>${note.title}</h3>
      <p style="color: #31311E; font-size: 0.85rem; margin: 0.25rem 0;">${createdDate}</p>
      ${note.image ? `<img src="${note.image}" alt="Note Image" class="note-card-image" />` : ''}
      <p>${note.content.length > 80 ? note.content.substring(0, 250) + '...' : note.content}</p>
    `;

    card.addEventListener('click', () => openNote(index));
    container.appendChild(card);
  });

  loadMoreBtn.style.display = notes.length > paginatedNotes.length ? 'inline-block' : 'none';
}

function loadMoreNotes() {
  currentPage++;
  renderNotes();
}

function openNote(index) {
  currentNoteIndex = index;
  const note = notes[index];
  document.getElementById('noteGrid').style.display = 'none';
  document.querySelector('.load-more-wrapper').style.display = 'none';
  document.getElementById('noteDetailPage').style.display = 'block';
  document.querySelector('.header').classList.add('hide');

  const createdDate = new Date(note.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });

  const content = document.getElementById('noteContent');
  content.innerHTML = `
    <div class="note-detail-header">
      <span class="note-color-circle" style="background-color: ${note.color};"></span>
      <div>
        <h2 class="innerPageheading">${note.title}</h2>
        <p class="note-date">${createdDate}</p>
      </div>
    </div>
    ${note.image ? `<img src="${note.image}" alt="Note Image" style="max-width: 100%; margin-top: 1rem;">` : ''}
    <p>${note.content}</p>
  `;  
}

function showModal(id) {
  const modal = document.getElementById(id);
  const wrapper = document.getElementById(id + 'Wrapper');
  if (wrapper) wrapper.classList.add('show');
  modal.classList.remove('hidden');
  modal.classList.add('show');

  lastModalId = id;

  if (id === 'modalNew') {
    isTypingNew = false;
  }
  if (id === 'modalEdit') {
    isTypingEdit = false;
  }
}

function closeModals() {
  document.querySelectorAll('.modal-wrapper').forEach(wrapper => wrapper.classList.remove('show'));
  document.querySelectorAll('.modal').forEach(modal => {
    modal.classList.remove('show');
    modal.classList.add('hidden');
  });
  document.querySelectorAll('.confirm-modal').forEach(modal => modal.classList.add('hidden'));
}

function updateAddButtonState() {
  const titleFilled = document.getElementById('noteTitle').value.trim().length > 0;
  const contentFilled = document.getElementById('noteContentArea').value.trim().length > 0;
  document.getElementById('addNoteBtn').disabled = !(titleFilled && contentFilled);
}

document.getElementById('confirmDeleteAllBtn').addEventListener('click', () => {
  notes = [];
  saveAndRender();
  closeModals();
});

function clearNewNoteFields() {
  document.getElementById('noteTitle').value = '';
  document.getElementById('noteContentArea').value = '';
  document.getElementById('noteImage').value = '';
  document.getElementById('addNoteBtn').disabled = true;
  selectedColor = colors[0];
  renderColorOptions(document.getElementById('colorOptions'), selectedColor);
}

function renderModals() {
  const modals = document.createElement('div');
  modals.innerHTML = `
  <!-- Modal 1: New Note -->
    <div id="modalNewWrapper" class="modal-wrapper hidden">
      <div id="modalNew" class="modal hidden">
        <div class="modal-content">
          <div class="modal-header">
            <h2>New Note</h2>
            <button class="closeModal">&times;</button>
          </div>
          <input type="text" id="noteTitle" placeholder="Notes Title" maxlength="100" />
          <input type="url" id="noteImage" placeholder="Add Image URL" />
          <textarea id="noteContentArea" placeholder="Add Content Here"></textarea>
          <div class="color-picker-row">
            <div id="colorOptions" class="color-buttons"></div>
            <button id="addNoteBtn" disabled>Add</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal 2: Edit Note -->
    <div id="modalEditWrapper" class="modal-wrapper hidden">
      <div id="modalEdit" class="modal hidden">
        <div class="modal-content">
          <div class="modal-header">
            <h2>Edit Note</h2>
            <button class="closeModal">&times;</button>
          </div>
          <input type="text" id="editTitle" maxlength="100" />
          <input type="url" id="editImage" placeholder="Edit Image URL" />
          <textarea id="editContent" placeholder="Edit your content..."></textarea>
          <div class="color-picker-row">
            <div id="editColorOptions" class="color-buttons"></div>
            <button id="saveEditBtn">Save</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal 4: Confirm Delete All -->
    <div id="modalDeleteAll" class="confirm-modal hidden">
      <div class="confirm-box">
        <div class="modal-header">
          <h2>Delete All Notes</h2>
          <button class="closeModal">&times;</button>
        </div>
        <p>Are you sure you want to delete <strong>all</strong> notes?</p>
        <div class="confirm-actions">
          <button id="confirmDeleteAllBtn" class="danger">Yes, Delete All</button>
        </div>
      </div>
    </div>

    <!-- Modal 6: Confirm Delete Single Note -->
    <div id="modalConfirmDeleteNote" class="confirm-modal hidden">
      <div class="confirm-box">
        <div class="modal-header">
          <h2>Delete Note</h2>
          <button class="closeModal">&times;</button>
        </div>
        <p>Are you sure you want to delete this note?</p>
        <div class="confirm-actions">
          <button id="confirmDeleteNoteBtn" class="danger">Yes, Delete</button>
        </div>
      </div>
    </div>

    <!-- Modal 7: Unsaved Changes -->
    <div id="modalUnsavedChanges" class="confirm-modal hidden">
      <div class="confirm-box">
        <div class="modal-header">
          <h2>Confirm</h2>
          <button id="cancelUnsavedExitBtn" class="closeModal">&times;</button>
        </div>
        <p>Seems like you are in the middle of adding/editing content. Do you want to leave?</p>
        <div class="confirm-actions">
          <button id="confirmUnsavedExitBtn" class="danger">Yes, Leave</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modals);
}

function renderAppStructure() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <!-- Header -->
    <header class="header">
      <h1>Pocket <span style="font-weight: 600;">Notes</span></h1>
      <div class="header-actions">
        <button id="deleteAllBtn" class="deleteall">Delete All</button>
        <button id="newNoteBtn" class="new-post">New</button>
      </div>
    </header>

    <!-- Main Content -->
    <main id="noteGrid" class="note-grid"></main>

    <!-- Load More Button -->
    <div class="load-more-wrapper">
      <button id="loadMoreBtn" class="new-post">Load More</button>
    </div>

    <!-- Detail View -->
    <div id="noteDetailPage" class="note-detail hidden">
      <div class="header">
        <div class="header-left">
          <button id="backBtn"><i class="fas fa-arrow-left"></i></button>
          <h1>Pocket <span style="font-weight: 600;">Notes</span></h1>
        </div>
        <div class="header-actions">
          <button id="deleteNoteBtn" class="deleteall">Delete</button>
          <button id="editNoteBtn" class="new-post">Edit</button>
        </div>
      </div>    
      <section id="noteContent" class="note-content"></section>
    </div>

    <!-- Empty State -->
    <div id="emptyState" class="empty-state" style="display: none;">
      <img src="assets/images/empty-icon.png" alt="Empty State Icon" class="empty-icon" />
      <p>Notes you add appear here</p>
    </div>
  `;
}