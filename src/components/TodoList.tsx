import React from 'react';
import { Todo, TodoItem } from './TodoItem';

interface TodoListProps {
  todos: Todo[];
  filter: string;
  editingTodoId: number | null;
  newTitle: string;
  inputRef: React.RefObject<HTMLInputElement>;
  loading: boolean;
  onToggleTodo: (id: number) => void;
  onEditTodo: (todo: Todo) => void;
  onDeleteTodo: (id: number) => void;
  onSaveTitle: (id: number) => void;
  onChangeNewTitle: (e: React.ChangeEvent<HTMLInputElement>) => void;
  deletingTodoIds: number[];
  tempTodo?: Todo | null;
  updatingTodoId: number | null;
}

export const TodoList: React.FC<TodoListProps> = ({
  todos,
  filter,
  editingTodoId,
  newTitle,
  inputRef,
  onToggleTodo,
  onEditTodo,
  onDeleteTodo,
  onSaveTitle,
  onChangeNewTitle,
  deletingTodoIds,
  tempTodo,
  updatingTodoId,
}) => {
  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') {
      return !todo.completed;
    }

    if (filter === 'completed') {
      return todo.completed;
    }

    return true;
  });

  if (tempTodo && (filter === 'all' || filter === 'active')) {
    filteredTodos.push(tempTodo);
  }

  return (
    <section className="todo__main" data-cy="TodoList">
      <div>
        {filteredTodos.map(todo => {
          const isEditing = editingTodoId === todo.id;
          const isLoading =
            (tempTodo && todo.id === tempTodo.id) ||
            deletingTodoIds.includes(todo.id) ||
            updatingTodoId === todo.id;

          return (
            <TodoItem
              key={todo.id}
              todo={todo}
              isEditing={isEditing}
              newTitle={newTitle}
              inputRef={inputRef}
              loading={isLoading}
              onToggle={() => onToggleTodo(todo.id)}
              onEdit={() => onEditTodo(todo)}
              onChange={onChangeNewTitle}
              onBlur={() => {
                if (newTitle.trim() === '') {
                  onDeleteTodo(todo.id);
                } else {
                  onSaveTitle(todo.id);
                }
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  onSaveTitle(todo.id);
                }
              }}
              onDelete={() => onDeleteTodo(todo.id)}
              disabled={isEditing && updatingTodoId === todo.id}
            />
          );
        })}
      </div>
    </section>
  );
};
