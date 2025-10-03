class Todo {
    selectors = {
        root: '[data-js-todo]',
        newTaskForm: '[data-js-todo-new-task-form]',
        newTaskInput: '[data-js-todo-new-task-input]',
        searchTaskForm: '[data-js-todo-search-task-form]',
        searchTaskInput: '[data-js-todo-search-task-input]',
        totalTasks: '[data-js-todo-total-tasks]',
        deleteAllButton: '[data-js-todo-delete-all-button]',
        list: '[data-js-todo-list]',
        item: '[data-js-todo-item]',
        itemCheckbox: '[data-js-todo-item-checkbox]',
        itemLabel: '[data-js-todo-label]',
        itemDeleteButton: '[data-js-todo-item-delete-button]',
        emptyMessage: '[data-js-todo-empty-message]',
    }

    stateClasses = {
        isVisible: 'is-visible',
        isDisappearing: 'is-disappearing',
    }

    localStorageKey = 'todo-items'

    constructor() {
        this.rootElement = document.querySelector(this.selectors.root)
        this.newTaskFormElement = this.rootElement.querySelector(this.selectors.newTaskForm)
        this.newTaskInputElement = this.rootElement.querySelector(this.selectors.newTaskInput)
        this.searchTaskFormElement = this.rootElement.querySelector(this.selectors.searchTaskForm)
        this.searchTaskInputElement = this.rootElement.querySelector(this.selectors.searchTaskInput)
        this.totalTasksElement = this.rootElement.querySelector(this.selectors.totalTasks)
        this.deleteAllButtonElement = this.rootElement.querySelector(this.selectors.deleteAllButton)
        this.listElement = this.rootElement.querySelector(this.selectors.list)
        this.emptyMessageElement = this.rootElement.querySelector(this.selectors.emptyMessage)
        this.state = {
            items: this.getItemsFromLocalStorage(),
            filteredItems: null,
            searchQuery: '',
        }
        this.render()
        this.bindEvents()
    }

    getItemsFromLocalStorage() {
        const rawData = localStorage.getItem(this.localStorageKey)

        if (!rawData) {
            return []
        }

        try {
            const parsedData = JSON.parse(rawData)

            return Array.isArray(parsedData) ? parsedData : []
        } catch {
            console.error('Todo items parse error')
            return []
        }
    }

    saveItemToLocalStorage() {
        localStorage.setItem(
            this.localStorageKey,
            JSON.stringify(this.state.items)
        )
    }

    render() {
        this.totalTasksElement.textContent = this.state.items.length

        this.deleteAllButtonElement.classList.toggle(
            this.stateClasses.isVisible,
            this.state.items.length > 0
        )

        const items = this.state.filteredItems ?? this.state.items

        this.listElement.innerHTML = items.map(({ id, title, isChecked }) => `
            <li class="todo__item todo-item" data-js-todo-item>
                <input type="checkbox" class="todo-item__checkbox" ${isChecked ? 'checked' : ''} id="${id}" data-js-todo-item-checkbox>
                <label class="todo-item__label" for="${id}" data-js-todo-item-label>${title}</label>
                <button class="todo-item__delete-button" type="button" area-label="Delete" title="Delete" data-js-todo-item-delete-button>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="#020202"/>
                    </svg>
                </button>
            </li>
        `).join('')

        const isEmptyFileredItems = this.state.filteredItems?.length === 0
        const isEmptyItems = this.state.items.length === 0

        this.emptyMessageElement.textContent =
            isEmptyFileredItems ? 'Tasks not found'
                : isEmptyItems ? 'There are no tasks yet'
                    : '                                                             '
    }

    addItem(title) {
        this.state.items.push({
            id: crypto?.randomUUID() ?? Date.now().toString(),
            title, 
            isChecked: false,
        })
        this.saveItemToLocalStorage()
        this.render()
    }

    deleteItem(id) {
        this.state.items = this.state.items.filter((item) => item.id !== id)
        this.saveItemToLocalStorage()
        this.render()
    }

    toggleCheckedState(id) {
        this.state.items = this.state.items.map((item) => {
            if (item.id === id) {
                return {
                    ...item,
                    isChecked: !item.isChecked,
                }
            }
            return item
        })
        this.saveItemToLocalStorage()
        this.render()
    }

    filter() {
        const queryFormatted = this.state.searchQuery.toLowerCase()

        this.state.filteredItems = this.state.items.filter(({ title }) => {
            const titleFormatted = title.toLowerCase()
            return titleFormatted.includes(queryFormatted)
        })
        this.render()
    }

    resetFilter() {
        this.state.filteredItems = null
        this.state.searchQuery = ''
        this.render()
    }

    onNewTaskFormSubmit = (event) => {
        event.preventDefault()

        const newTodoItemTitle = this.newTaskInputElement.value

        if (newTodoItemTitle.trim().length > 0) {
            this.addItem(newTodoItemTitle)
            this.resetFilter()
            this.newTaskInputElement.value = ''
            this.newTaskInputElement.focus()
        }
    }

    onSearchTaskFormSubmit = (event) => {
        event.preventDefault()
    }

    onSearchTaskInputChange = ({target}) => {
        const value = target.value.trim()

        if (value.length > 0) {
            this.state.searchQuery = value
            this.filter()
        } else {
            this.resetFilter()
        }
    }

    onDeleteAllButtonClick = () => {
        const isConfirmed = confirm('Are you sure you want to delete all?')

        if (isConfirmed) {
            this.state.items = []
            this.saveItemToLocalStorage()
            this.render()
        }
    }

    onClick = ({ target }) => {
        if (target.matches(this.selectors.itemDeleteButton)) {
            const itemElement = target.closest(this.selectors.item)
            const itemCheckboxElement = itemElement.querySelector(this.selectors.itemCheckbox)

            itemElement.classList.add(this.stateClasses.isDisappearing)

            setTimeout(() => {
                this.deleteItem(itemCheckboxElement.id)
            }, 400);
        }
    }

    onChange = ({ target }) => {
        if (target.matches(this.selectors.itemCheckbox)) {
            this.toggleCheckedState(target.id)
        }
    }

    bindEvents() {
        this.newTaskFormElement.addEventListener('submit', this.onNewTaskFormSubmit)
        this.searchTaskFormElement.addEventListener('submit', this.onSearchTaskFormSubmit)
        this.searchTaskInputElement.addEventListener('input', this.onSearchTaskInputChange)
        this.deleteAllButtonElement.addEventListener('click', this.onDeleteAllButtonClick)
        this.listElement.addEventListener('click', this.onClick)
        this.listElement.addEventListener('change', this.onChange)
    }
}

new Todo()