import React from 'react';
import { Todo } from './TodoItem';

export enum FilterOptions {
  All = 'all',
  Active = 'active',
  Completed = 'completed',
}

interface FooterProps {
  todos: Todo[];
  filter: FilterOptions;
  onFilterChange: (filter: FilterOptions) => void;
  onClearCompleted: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  todos,
  filter,
  onFilterChange,
  onClearCompleted,
}) => {
  const activeTodosCount = todos.filter(todo => {
    return !todo.completed;
  }).length;

  const filters = [
    { label: 'All', value: FilterOptions.All },
    { label: 'Active', value: FilterOptions.Active },
    { label: 'Completed', value: FilterOptions.Completed },
  ];

  return (
    <footer className="todoapp__footer" data-cy="Footer">
      <span className="todo-count" data-cy="TodosCounter">
        {activeTodosCount} items left
      </span>
      <nav className="filter" data-cy="Filter">
        {filters.map(({ label, value }) => {
          return (
            <a
              key={value}
              data-cy={`FilterLink${label}`}
              href={`#/${value === FilterOptions.All ? '' : value}`}
              className={`filter__link ${filter === value ? 'selected' : ''}`}
              onClick={() => {
                onFilterChange(value);
              }}
            >
              {label}
            </a>
          );
        })}
      </nav>
      <button
        data-cy="ClearCompletedButton"
        type="button"
        className="todoapp__clear-completed"
        onClick={onClearCompleted}
        disabled={
          !todos.some(todo => {
            return todo.completed;
          })
        }
      >
        Clear completed
      </button>
    </footer>
  );
};
