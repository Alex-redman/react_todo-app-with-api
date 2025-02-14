import React, { useEffect, useRef, useState } from 'react';
import { UserWarning } from './UserWarning';
import { fetchTodos, addTodo, updateTodo, deleteTodo } from './api/todoApi';
import { Header } from './components/Header';
import { TodoList } from './components/TodoList';
import { Footer } from './components/Footer';
import { Todo } from './components/TodoItem';

const USER_ID = 2311;

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [filter, setFilter] = useState('all');
  const [editingTodoId, setEditingTodoId] = useState<number | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isInputDisabled, setIsInputDisabled] = useState(false);
  const [deletingTodoIds, setDeletindTodo] = useState<number[]>([]);
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);
  const [updatingTodoId, setUpdatingTodoId] = useState<number | null>(null);

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
      inputRef.current?.focus();
    }, 0);
  };

  const handleSaveTitle = async (id: number) => {
    if (newTitle.trim() === '') {
      setErrorMessage('Title should not be empty');

      return;
    }

    setUpdatingTodoId(id);
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
      setUpdatingTodoId(null);
      setTimeout(() => inputRef.current?.focus(), 0);
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

    const tempTodoData: Todo = {
      id: Date.now(),
      title: newTodo,
      completed: false,
    };

    setTempTodo(tempTodoData);
    setLoading(true);
    setIsInputDisabled(true);
    try {
      const newTodoData = await addTodo({ title: newTodo, userId: USER_ID });

      setTodos([...todos, newTodoData]);
      setNewTodo('');
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage('Unable to add a todo');
    } finally {
      setLoading(false);
      setIsInputDisabled(false);
      setTempTodo(null);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  const handleToggleTodo = (id: number) => {
    setTodos(
      todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      ),
    );
  };

  const handleDeleteTodo = async (id: number) => {
    setDeletindTodo(prev => [...prev, id]);
    try {
      await deleteTodo(id);
      setTodos(prev => prev.filter(todo => todo.id !== id));
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage('Unable to delete a todo');
    } finally {
      setDeletindTodo(prev => prev.filter(todoId => todoId !== id));
      setTimeout(() => inputRef.current?.focus(), 0);
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
        <Header
          newTodo={newTodo}
          isInputDisabled={isInputDisabled}
          onTodoChange={handleNewTodoChange}
          onAddTodo={handleAddTodo}
          inputRef={inputRef}
          onToggleAll={handleToggleAll}
        />
        <TodoList
          todos={todos}
          filter={filter}
          editingTodoId={editingTodoId}
          newTitle={newTitle}
          inputRef={inputRef}
          loading={loading}
          onToggleTodo={handleToggleTodo}
          onEditTodo={handleEditTodo}
          onDeleteTodo={handleDeleteTodo}
          onSaveTitle={handleSaveTitle}
          onChangeNewTitle={e => setNewTitle(e.target.value)}
          deletingTodoIds={deletingTodoIds}
          tempTodo={tempTodo}
          updatingTodoId={updatingTodoId}
        />
        {todos.length > 0 && (
          <Footer
            todos={todos}
            filter={filter}
            onFilterChange={setFilter}
            onClearCompleted={handleClearCompleted}
          />
        )}
      </div>
      <div
        data-cy="ErrorNotification"
        className={`notification is-danger is-light has-text-weight-normal ${
          errorMessage ? '' : 'hidden'
        }`}
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
