class TodoApp {
    constructor() {
        this.todos = this.loadTodos();
        this.currentFilter = 'all';
        this.currentCategoryFilter = 'all';

        this.initElements();
        this.attachEvents();
        this.render();
    }

    initElements() {
        this.todoInput = document.getElementById('todoInput');
        this.categoryInput = document.getElementById('categoryInput');
        this.addBtn = document.getElementById('addBtn');
        this.todoList = document.getElementById('todoList');
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.categoryFilter = document.getElementById('categoryFilter');
        this.totalCount = document.getElementById('totalCount');
        this.activeCount = document.getElementById('activeCount');
        this.completedCount = document.getElementById('completedCount');
    }

    attachEvents() {
        this.addBtn.addEventListener('click', () => this.addTodo());
        this.todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });
        this.categoryInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });

        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filterBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.render();
            });
        });

        this.categoryFilter.addEventListener('change', (e) => {
            this.currentCategoryFilter = e.target.value;
            this.render();
        });
    }

    loadTodos() {
        const stored = localStorage.getItem('todos');
        return stored ? JSON.parse(stored) : [];
    }

    saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }

    addTodo() {
        const text = this.todoInput.value.trim();
        const category = this.categoryInput.value.trim();

        if (!text) {
            alert('TODOを入力してください');
            return;
        }

        const todo = {
            id: Date.now(),
            text: text,
            category: category || 'その他',
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.todos.unshift(todo);
        this.saveTodos();
        this.todoInput.value = '';
        this.categoryInput.value = '';
        this.todoInput.focus();
        this.render();
    }

    deleteTodo(id) {
        this.todos = this.todos.filter(todo => todo.id !== id);
        this.saveTodos();
        this.render();
    }

    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();
            this.render();
        }
    }

    getFilteredTodos() {
        let filtered = this.todos;

        if (this.currentFilter === 'active') {
            filtered = filtered.filter(todo => !todo.completed);
        } else if (this.currentFilter === 'completed') {
            filtered = filtered.filter(todo => todo.completed);
        }

        if (this.currentCategoryFilter !== 'all') {
            filtered = filtered.filter(todo => todo.category === this.currentCategoryFilter);
        }

        return filtered;
    }

    getAllCategories() {
        const categories = new Set(this.todos.map(todo => todo.category));
        return Array.from(categories).sort();
    }

    updateCategoryFilter() {
        const categories = this.getAllCategories();
        this.categoryFilter.innerHTML = '<option value="all">すべてのカテゴリー</option>';

        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            if (category === this.currentCategoryFilter) {
                option.selected = true;
            }
            this.categoryFilter.appendChild(option);
        });
    }

    updateStats() {
        const total = this.todos.length;
        const active = this.todos.filter(t => !t.completed).length;
        const completed = this.todos.filter(t => t.completed).length;

        this.totalCount.textContent = `合計: ${total}`;
        this.activeCount.textContent = `未完了: ${active}`;
        this.completedCount.textContent = `完了: ${completed}`;
    }

    renderTodoItem(todo) {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'todo-checkbox';
        checkbox.checked = todo.completed;
        checkbox.addEventListener('change', () => this.toggleTodo(todo.id));

        const content = document.createElement('div');
        content.className = 'todo-content';

        const text = document.createElement('div');
        text.className = 'todo-text';
        text.textContent = todo.text;

        const category = document.createElement('span');
        category.className = 'todo-category';
        category.textContent = todo.category;

        content.appendChild(text);
        content.appendChild(category);

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = '削除';
        deleteBtn.addEventListener('click', () => {
            if (confirm('このTODOを削除しますか？')) {
                this.deleteTodo(todo.id);
            }
        });

        li.appendChild(checkbox);
        li.appendChild(content);
        li.appendChild(deleteBtn);

        return li;
    }

    render() {
        this.todoList.innerHTML = '';
        const filtered = this.getFilteredTodos();

        if (filtered.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'empty-state';
            empty.textContent = this.todos.length === 0
                ? 'TODOがありません。新しいTODOを追加してください。'
                : 'フィルター条件に一致するTODOがありません。';
            this.todoList.appendChild(empty);
        } else {
            filtered.forEach(todo => {
                this.todoList.appendChild(this.renderTodoItem(todo));
            });
        }

        this.updateCategoryFilter();
        this.updateStats();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});
