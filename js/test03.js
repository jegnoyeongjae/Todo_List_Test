// 리스트 요소
let todos = [];
const todoInputEl = document.getElementById('todoInput');
const addBtnEl = document.getElementById('addBtn');
const printListEl = document.getElementById('todoList');
const todoTempEl = document.getElementById('todo-template');

// 모달 관련 요소
const modal = document.getElementById('modal');
const modalText = document.getElementById('modalText');
const closeBtn = document.querySelector('.closeBtn');
const saveBtn = document.getElementById('saveBtn');
const modalRankSelect = document.getElementById('modal-rank-select');
const startDateInput = document.getElementById('startDate');
const endDateInput = document.getElementById('endDate');

let editingTodo = null; // 수정 중인 todo 참조용

// 저장된 데이터 로드
function loadTodos() {
  const data = sessionStorage.getItem('todosData');
  if (data) {
    const parsed = JSON.parse(data);
    todos.push(...parsed);
  }
}

// 데이터 저장
function saveTodos() {
  sessionStorage.setItem('todosData', JSON.stringify(todos));
}

// 새 항목 추가
addBtnEl.addEventListener('click', function () {
  let value = todoInputEl.value.trim();
  if (!value) return;

  todos.push({
    content: value,
    isDone: false,
    createdAt: new Date(),
    rank: 3,
    startAt: new Date(),
    endAt: new Date(new Date().setDate(new Date().getDate() + 1)),
  });

  todoInputEl.value = '';
  saveTodos();
  renderTodo();
});

// 리스트 렌더링
function renderTodo() {
  printListEl.innerHTML = '';

  todos.forEach((todo, idx) => {
    const cloneLi = todoTempEl.content.firstElementChild.cloneNode(true);
    cloneLi.className = todo.isDone ? 'done' : '';

    const checkBoxEl = cloneLi.querySelector('.checkDone');
    checkBoxEl.checked = todo.isDone;
    checkBoxEl.addEventListener('change', () => {
      todo.isDone = checkBoxEl.checked;
      saveTodos();
      renderTodo();
    });

    cloneLi.querySelector('.content').textContent = todo.content;
    cloneLi.querySelector('.date').textContent = new Date(
      todo.createdAt
    ).toLocaleDateString();

    // 수정 버튼을 통해 모달 열기
    const updateBtn = cloneLi.querySelector('.updateBtn');
    updateBtn.addEventListener('click', () => {
      editingTodo = todo;
      modalText.textContent = todo.content;
      modalText.setAttribute('contenteditable', 'true');

      // 날짜 입력 초기값
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const start = new Date(todo.startAt).toISOString().split('T')[0];
      const end = new Date(todo.endAt).toISOString().split('T')[0];

      startDateInput.value = start;
      endDateInput.value = end;

      // 제약 조건 설정
      startDateInput.min = today; // 시작일은 오늘까지
      endDateInput.min = today; // 마감일은 시작일 이후

      // select box 설정
      modalRankSelect.value = todo.rank;
      modal.classList.remove('hidden');

      // 중요도 선택박스 값 설정
      modalRankSelect.value = todo.rank;
      modal.classList.remove('hidden');
    });

    // 삭제 버튼
    const removeBtn = cloneLi.querySelector('.removeBtn');
    removeBtn.addEventListener('click', () => {
      let confirmDel = confirm('삭제하시겠습니까?');
      if (confirmDel) {
        todos.splice(idx, 1);
        saveTodos();
        renderTodo();
      }
    });

    printListEl.appendChild(cloneLi);
  });
  const countEl = document.getElementById('todo-count');
  if (countEl) countEl.textContent = todos.length;
}

startDateInput.addEventListener('change', () => {
  const start = new Date(startDateInput.value);
  const nextDate = new Date(start);
  nextDate.setDate(start.getDate() + 1);

  // 마감일 최소값 설정
  const minEnd = nextDate.toISOString().split('T')[0];
  endDateInput.min = minEnd;

  // 만약 현재 마감일이 유효하지 않으면 자동으로 다음날로 바꾸기
  if (new Date(endDateInput.value) < nextDate) {
    endDateInput.value = minEnd;
  }
});

// 모달 수정 완료 버튼
saveBtn.addEventListener('click', () => {
  const newContent = modalText.textContent.trim();
  const newRank = modalRankSelect.value;
  const newStart = startDateInput.value;
  const newEnd = endDateInput.value;

  if (newContent && editingTodo && newStart && newEnd && newEnd >= newStart) {
    editingTodo.content = newContent;
    editingTodo.rank = parseInt(newRank);
    editingTodo.startAt = new Date(newStart);
    editingTodo.endAt = new Date(newEnd);
    saveTodos();
    renderTodo();
    modal.classList.add('hidden');
    editingTodo = null;
  } else {
    alert('날짜 설정이 잘못되었습니다!');
  }
});

// 모달 닫기
closeBtn.addEventListener('click', () => {
  modal.classList.add('hidden');
  editingTodo = null;
});

// 모달 외부 클릭 시 닫기
window.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.classList.add('hidden');
    editingTodo = null;
  }
});

// 초기 실행
loadTodos();
renderTodo();
