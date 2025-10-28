// Глобальні змінні
let tasks = { day: [], week: [], month: [] };
let currentPeriod = '';
let editingIndex = -1;

// Елементи DOM
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const taskInput = document.getElementById('task-input');
const modalSave = document.getElementById('modal-save');
const modalCancel = document.getElementById('modal-cancel');

// Завантаження задач при старті
async function loadTasks() {
  try {
    const loadedTasks = await window.electronAPI.loadTasks();
    tasks = loadedTasks;
    renderTasks('day');
    renderTasks('week');
    renderTasks('month');
  } catch (error) {
    console.error('Помилка завантаження:', error);
  }
}

// Збереження задач
async function saveTasks() {
  try {
    await window.electronAPI.saveTasks(tasks);
  } catch (error) {
    console.error('Помилка збереження:', error);
  }
}

// Рендер списку задач
function renderTasks(period) {
  const container = document.getElementById(`${period}-tasks`);
  if (!container) return;

  container.innerHTML = '';
  
  tasks[period].forEach((task, index) => {
    const taskDiv = document.createElement('div');
    taskDiv.className = 'task-item';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed || false;
    checkbox.addEventListener('change', () => toggleTask(period, index));
    
    const text = document.createElement('span');
    text.textContent = task.text;
    text.className = task.completed ? 'completed' : '';
    
    const btnEdit = document.createElement('button');
    btnEdit.textContent = '✏️';
    btnEdit.className = 'btn-edit';
    btnEdit.addEventListener('click', () => editTask(period, index));
    
    const btnDelete = document.createElement('button');
    btnDelete.textContent = '🗑️';
    btnDelete.className = 'btn-delete';
    btnDelete.addEventListener('click', () => removeTask(period, index));
    
    taskDiv.appendChild(checkbox);
    taskDiv.appendChild(text);
    taskDiv.appendChild(btnEdit);
    taskDiv.appendChild(btnDelete);
    
    container.appendChild(taskDiv);
  });
}

// Відкрити модальне вікно для додавання
function addTask(period) {
  currentPeriod = period;
  editingIndex = -1;
  modalTitle.textContent = 'Додати завдання';
  taskInput.value = '';
  modal.style.display = 'flex';
  taskInput.focus();
}

// Відкрити модальне вікно для редагування
function editTask(period, index) {
  currentPeriod = period;
  editingIndex = index;
  modalTitle.textContent = 'Редагувати завдання';
  taskInput.value = tasks[period][index].text;
  modal.style.display = 'flex';
  taskInput.focus();
}

// Видалити задачу
function removeTask(period, index) {
  if (confirm('Видалити це завдання?')) {
    tasks[period].splice(index, 1);
    renderTasks(period);
    saveTasks();
  }
}

// Перемкнути статус виконання
function toggleTask(period, index) {
  tasks[period][index].completed = !tasks[period][index].completed;
  renderTasks(period);
  saveTasks();
}

// Зберегти задачу (додати або редагувати)
function saveTask() {
  const text = taskInput.value.trim();
  if (!text) {
    alert('Введіть текст завдання');
    return;
  }
  
  if (editingIndex === -1) {
    // Додати нову
    tasks[currentPeriod].push({ text, completed: false });
  } else {
    // Редагувати існуючу
    tasks[currentPeriod][editingIndex].text = text;
  }
  
  renderTasks(currentPeriod);
  saveTasks();
  closeModal();
}

// Закрити модальне вікно
function closeModal() {
  modal.style.display = 'none';
  taskInput.value = '';
  currentPeriod = '';
  editingIndex = -1;
}

// Ініціалізація при завантаженні
document.addEventListener('DOMContentLoaded', () => {
  // Перемикання вкладок
  const tabs = document.querySelectorAll('.tab');
  const contents = document.querySelectorAll('.tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      contents.forEach(c => c.style.display = 'none');
      const targetId = tab.dataset.tab;
      const targetContent = document.getElementById(targetId);
      if (targetContent) {
        targetContent.style.display = 'block';
      }
    });
  });

  // Кнопки додавання
  document.getElementById('day-add').addEventListener('click', () => addTask('day'));
  document.getElementById('week-add').addEventListener('click', () => addTask('week'));
  document.getElementById('month-add').addEventListener('click', () => addTask('month'));

  // Модальне вікно
  modalSave.addEventListener('click', saveTask);
  modalCancel.addEventListener('click', closeModal);
  
  // Закриття по Enter
  taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      saveTask();
    }
  });

  // Закриття по Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.style.display === 'flex') {
      closeModal();
    }
  });

  // Завантажити задачі
  loadTasks();
});