import React from 'react';

interface HeaderProp {
  newTodo: string;
  isInputDisabled: boolean;
  onTodoChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onAddTodo: (event: React.FormEvent<HTMLFormElement>) => void;
  onToggleAll: () => void;
  inputRef: React.RefObject<HTMLInputElement>;
}

export const Header: React.FC<HeaderProp> = ({
  newTodo,
  isInputDisabled,
  onTodoChange,
  onAddTodo,
  inputRef,
  onToggleAll,
}) => {
  return (
    <header className="todoapp__header">
      <button
        type="button"
        data-cy="toggleAllButton"
        className="todoapp__toggle-all"
        onClick={onToggleAll}
      ></button>
      <form onSubmit={onAddTodo}>
        <input
          ref={inputRef}
          data-cy="NewTodoField"
          type="text"
          className="todoapp__new-todo"
          placeholder="What needs to be done?"
          value={newTodo}
          onChange={onTodoChange}
          disabled={isInputDisabled}
        />
      </form>
    </header>
  );
};
