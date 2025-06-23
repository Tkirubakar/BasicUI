let notes = JSON.parse(localStorage.getItem('notes')) || [];
let selectedColor = '#EBCCED';
let colors = ['#EBCCED', '#FCFCFC', '#FFCA72', '#E5EE90', '#FFA78B'];
let currentNoteIndex = null;
let notesPerPage = 10;
let currentPage = 1;

window.addEventListener('DOMContentLoaded', () => {
  renderColorOptions(document.getElementById('colorOptions'), selectedColor);
  renderNotes();

  document.getElementById('newNoteBtn').addEventListener('click', () => showModal('modalNew'));
  document.getElementById('deleteAllBtn').addEventListener('click', () => showModal('modalDeleteAll'));
  document.getElementById('loadMoreBtn').addEventListener('click', loadMoreNotes);

  document.querySelectorAll('.closeModal').forEach(btn => {
    btn.addEventListener('click', event => {
      event.preventDefault();
      closeModals();
    });
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
    document.getElementById('noteTitle').value = '';
    document.getElementById('noteContentArea').value = '';
    document.getElementById('noteImage').value = '';
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
      color: selectedColor
    };

    saveAndRender();
    closeModals();

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
  console.log(end)
  console.log(paginatedNotes)

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

  if (notes.length > paginatedNotes.length) {
    loadMoreBtn.style.display = 'inline-block';
  } else {
    loadMoreBtn.style.display = 'none';
  }
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
    <h2 class="innerPageheading">${note.title}</h2>
    <p style="font-size: 0.9rem; color: #bbb; margin: 0.25rem 0 1rem;">
      ${createdDate}
    </p>
    
    ${note.image ? `<img src="${note.image}" alt="Note Image" style="max-width: 100%; margin-top: 1rem;">` : ''}
    <p>${note.content}</p>`;
}


function showModal(id) {
  const modal = document.getElementById(id);
  const wrapper = document.getElementById(id + 'Wrapper');

  if (wrapper) wrapper.classList.add('show');
  modal.classList.remove('hidden');
  modal.classList.add('show');

  if (id === 'modalNew') {
    document.getElementById('noteTitle').value = '';
    document.getElementById('noteContentArea').value = '';
    document.getElementById('noteImage').value = '';
    document.getElementById('addNoteBtn').disabled = true;
    selectedColor = colors[0];
    renderColorOptions(document.getElementById('colorOptions'), selectedColor);
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