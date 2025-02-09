/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable max-len */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useEffect, useRef, useState } from 'react';
import { UserWarning } from './UserWarning';
import { fetchTodos, addTodo, updateTodo, deleteTodo } from './api/todoApi';

const USER_ID = 2311;

interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [filter, setFilter] = useState('all');
  const [editingTodoId, setEditingTodoId] = useState<number | null>(null);
  const [newTitle, setNewTitle] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isInputDesavled, setIsInputDesavled] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const loadTodos = async () => {
      setLoading(true);
      try {
        const todosData = await fetchTodos(USER_ID);

        setTodos(todosData);
      } catch (error) {
        setErrorMessage('Unable to load todos');
      } finally {
        setLoading(false);
      }
    };

    loadTodos();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setErrorMessage(null);
    }, 4000);

    return () => clearTimeout(timer);
  }, [errorMessage]);

  useEffect(() => {
    if (newTodo.trim() === '') {
      inputRef.current?.focus();
    }
  }, [newTodo]);

  const handleEditTodo = (todo: Todo) => {
    setEditingTodoId(todo.id);
    setNewTitle(todo.title);

    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 0);
  };

  const handleSaveTitle = async (id: number) => {
    if (newTitle.trim() === '') {
      setErrorMessage('Title should not be empty');

      return;
    }

    setLoading(true);

    try {
      const existingTodo = todos.find(todo => todo.id === id);

      if (!existingTodo) {
        return;
      }

      const updatedTodo = await updateTodo(id, {
        title: newTitle,
        completed: existingTodo.completed,
      });

      setTodos(todos.map(todo => (todo.id === id ? updatedTodo : todo)));
      setEditingTodoId(null);
      setNewTitle('');
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage('Unable to update a todo');
    } finally {
      setLoading(false);
    }
  };

  const handleNewTodoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    setNewTodo(event.target.value);
  };

  const handleAddTodo = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (newTodo.trim() === '') {
      setErrorMessage('Title should not be empty');

      return;
    }

    setLoading(true);
    setIsInputDesavled(true);

    try {
      const newTodoData = await addTodo({ title: newTodo, userId: USER_ID });

      setTodos([...todos, newTodoData]);
      setNewTodo('');
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage('Unable to add a todo');
    } finally {
      setLoading(false);
      setIsInputDesavled(false);
    }
  };

  const handleToggleTodo = (id: number) => {
    setTodos(
      todos.map(todo => {
        return todo.id === id ? { ...todo, completed: !todo.completed } : todo;
      }),
    );
  };

  const handleDeleteTodo = async (id: number) => {
    setLoading(true);
    try {
      await deleteTodo(id);
      setTodos(todos.filter(todo => todo.id !== id));
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage('Unable to delete a todo');
    } finally {
      setLoading(false);
    }
  };

  const handleClearCompleted = () => {
    setTodos(todos.filter(todo => !todo.completed));
  };

  const handleToggleAll = () => {
    const allCompleted = todos.every(todo => todo.completed);

    setTodos(todos.map(todo => ({ ...todo, completed: !allCompleted })));
  };

  if (!USER_ID) {
    return <UserWarning />;
  }

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>
      <div className="todoapp__content">
        <header className="todoapp__header">
          <button
            type="button"
            data-cy="toggleAllButton"
            className="todoapp__toggle-all"
            onClick={handleToggleAll}
          ></button>
          <form onSubmit={handleAddTodo}>
            <input
              ref={inputRef}
              data-cy="NewTodoField"
              type="text"
              className="todoapp__new-todo"
              placeholder="What needs to be done?"
              value={newTodo}
              onChange={handleNewTodoChange}
              disabled={isInputDesavled}
            />
          </form>
        </header>
        <section className="todo__main" data-cy="TodoList">
          <div>
            {todos
              .filter(todo => {
                if (filter === 'active') {
                  return !todo.completed;
                }

                if (filter === 'completed') {
                  return todo.completed;
                }

                return true;
              })
              .map(todo => (
                <div
                  data-cy="Todo"
                  key={todo.id}
                  className={`todo ${todo.completed ? 'completed' : ''}`}
                >
                  <label className="todo__status-label">
                    <input
                      type="checkbox"
                      data-cy="TodoStatus"
                      className="todo__status"
                      checked={todo.completed}
                      onChange={() => handleToggleTodo(todo.id)}
                    />
                  </label>
                  {editingTodoId === todo.id ? (
                    <input
                      ref={inputRef}
                      type="text"
                      className="todo__title-field"
                      placeholder="Empty todo will be deleted"
                      value={newTitle}
                      onChange={e => setNewTitle(e.target.value)}
                      onBlur={() => {
                        if (newTitle.trim() === '') {
                          handleDeleteTodo(todo.id);
                        } else {
                          handleSaveTitle(todo.id);
                        }
                      }}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          handleSaveTitle(todo.id);
                        }
                      }}
                    />
                  ) : (
                    <>
                      <span
                        data-cy="TodoTitle"
                        className="todo__title"
                        onDoubleClick={() => handleEditTodo(todo)}
                      >
                        {todo.title}
                      </span>
                      <button
                        type="button"
                        className="todo__remove"
                        data-cy="TodoDelete"
                        onClick={() => handleDeleteTodo(todo.id)}
                      >
                        x
                      </button>
                    </>
                  )}
                  <div
                    data-cy="TodoLoader"
                    className={`modal overlay ${loading ? 'is-active' : ''}`}
                  >
                    <div className="modal-background has-background-white-ter"></div>
                    <div className="loader"></div>
                  </div>
                </div>
              ))}
          </div>
        </section>
        {todos.length > 0 && (
          <footer className="todoapp__footer" data-cy="Footer">
            <span className="todo-count" data-cy="TodosCounter">
              {todos.filter(todo => !todo.completed).length} items left
            </span>
            <nav className="filter" data-cy="Filter">
              <a
                data-cy="FilterLinkAll"
                href="#/"
                className={`filter__link ${filter === 'all' ? 'selected' : ''}`}
                onClick={() => setFilter('all')}
              >
                All
              </a>
              <a
                data-cy="FilterLinkActive"
                href="#/active"
                className={`filter__link ${filter === 'active' ? 'selected' : ''}`}
                onClick={() => setFilter('active')}
              >
                Active
              </a>
              <a
                data-cy="FilterLinkCompleted"
                href="#/completed"
                className={`filter__link ${filter === 'completed' ? 'selected' : ''}`}
                onClick={() => setFilter('completed')}
              >
                Comleted
              </a>
            </nav>
            <button
              data-cy="ClearCompletedButton"
              type="button"
              className="todoapp__clear-completed"
              onClick={handleClearCompleted}
              disabled={!todos.some(todo => todo.completed)}
            >
              Clear completed
            </button>
          </footer>
        )}
      </div>

      <div
        data-cy="ErrorNotification"
        className={`notification is-danger is-light has-text-weight-normal ${errorMessage ? '' : 'hidden'}`}
      >
        {errorMessage}
        <button
          data-cy="HideErrorButton"
          type="button"
          className="delete"
          onClick={() => setErrorMessage(null)}
        ></button>
      </div>
    </div>
  );
};
