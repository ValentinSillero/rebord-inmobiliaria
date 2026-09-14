'use client';

import { createPortal } from 'react-dom';
import { KeyboardEvent, useEffect, useId, useRef, useState } from 'react';

export type AccessibleSelectOption = {
  value: string;
  label: string;
  group?: string;
};

type AccessibleSelectProps = {
  id: string;
  label: string;
  value: string;
  options: AccessibleSelectOption[];
  onChange: (value: string) => void;
};

type MenuPosition = {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
};

const MAX_MENU_HEIGHT = 240;
const MENU_GAP = 4;
const VIEWPORT_GUTTER = 8;

export function AccessibleSelect({ id, label, value, options, onChange }: AccessibleSelectProps) {
  const reactId = useId().replace(/:/g, '');
  const labelId = `${id}-${reactId}-label`;
  const listboxId = `${id}-${reactId}-listbox`;
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const typeahead = useRef('');
  const typeaheadTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);

  const selectedIndex = options.findIndex(option => option.value === value);
  const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : options[0];

  function calculateMenuPosition() {
    const trigger = buttonRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const width = Math.min(rect.width, viewportWidth - VIEWPORT_GUTTER * 2);
    const left = Math.min(
      Math.max(rect.left, VIEWPORT_GUTTER),
      Math.max(VIEWPORT_GUTTER, viewportWidth - width - VIEWPORT_GUTTER),
    );
    const desiredHeight = Math.min(MAX_MENU_HEIGHT, options.length * 44 + 8);
    const spaceBelow = viewportHeight - rect.bottom - MENU_GAP - VIEWPORT_GUTTER;
    const spaceAbove = rect.top - MENU_GAP - VIEWPORT_GUTTER;
    const shouldOpenAbove = spaceBelow < Math.min(120, desiredHeight) && spaceAbove > spaceBelow;
    const maxHeight = Math.max(0, Math.min(
      MAX_MENU_HEIGHT,
      shouldOpenAbove ? spaceAbove : spaceBelow,
    ));
    const top = shouldOpenAbove
      ? Math.max(VIEWPORT_GUTTER, rect.top - MENU_GAP - maxHeight)
      : rect.bottom + MENU_GAP;

    setMenuPosition({ top, left, width, maxHeight });
  }

  function openMenu(initialIndex = selectedIndex >= 0 ? selectedIndex : 0) {
    calculateMenuPosition();
    setActiveIndex(initialIndex);
    setOpen(true);
  }

  function closeMenu(restoreFocus = false) {
    setOpen(false);
    if (restoreFocus) buttonRef.current?.focus();
  }

  function selectOption(index: number) {
    const option = options[index];
    if (!option) return;
    onChange(option.value);
    setOpen(false);
    buttonRef.current?.focus();
  }

  function moveActive(step: number) {
    setActiveIndex(current => {
      if (!options.length) return -1;
      const start = current >= 0 ? current : (selectedIndex >= 0 ? selectedIndex : 0);
      return (start + step + options.length) % options.length;
    });
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!open) {
        const initial = event.key === 'ArrowDown'
          ? (selectedIndex >= 0 ? selectedIndex : 0)
          : (selectedIndex >= 0 ? selectedIndex : options.length - 1);
        openMenu(initial);
      } else {
        moveActive(event.key === 'ArrowDown' ? 1 : -1);
      }
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (open) selectOption(activeIndex);
      else openMenu();
      return;
    }

    if (event.key === 'Escape' && open) {
      event.preventDefault();
      closeMenu(true);
      return;
    }

    if (event.key === 'Home' && open) {
      event.preventDefault();
      setActiveIndex(0);
      return;
    }

    if (event.key === 'End' && open) {
      event.preventDefault();
      setActiveIndex(options.length - 1);
      return;
    }

    if (event.key === 'Tab') {
      setOpen(false);
      return;
    }

    if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      typeahead.current += event.key.toLocaleLowerCase('es');
      if (typeaheadTimer.current) clearTimeout(typeaheadTimer.current);
      typeaheadTimer.current = setTimeout(() => {
        typeahead.current = '';
      }, 650);

      const start = activeIndex >= 0 ? activeIndex + 1 : 0;
      const orderedOptions = [...options.slice(start), ...options.slice(0, start)];
      const match = orderedOptions.find(option => option.label.toLocaleLowerCase('es').startsWith(typeahead.current));
      if (match) {
        event.preventDefault();
        if (!open) openMenu(options.indexOf(match));
        else setActiveIndex(options.indexOf(match));
      }
    }
  }

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (!buttonRef.current?.contains(target) && !listRef.current?.contains(target)) closeMenu();
    }

    function updatePosition() {
      calculateMenuPosition();
    }

    document.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [open, options.length]);

  useEffect(() => {
    if (!open || activeIndex < 0) return;
    const menu = listRef.current;
    const option = menu?.querySelector<HTMLElement>(`#${listboxId}-option-${activeIndex}`);
    if (!menu || !option) return;

    if (option.offsetTop < menu.scrollTop) menu.scrollTop = option.offsetTop;
    else if (option.offsetTop + option.offsetHeight > menu.scrollTop + menu.clientHeight) {
      menu.scrollTop = option.offsetTop + option.offsetHeight - menu.clientHeight;
    }
  }, [activeIndex, listboxId, open]);

  useEffect(() => () => {
    if (typeaheadTimer.current) clearTimeout(typeaheadTimer.current);
  }, []);

  let currentGroup: string | undefined;

  return <div className="search-filter">
    <span className="search-filter-label" id={labelId}>{label}</span>
    <div className="custom-select">
      <button
        aria-activedescendant={open && activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined}
        aria-controls={listboxId}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-labelledby={labelId}
        className="custom-select-trigger"
        id={id}
        onClick={() => open ? closeMenu() : openMenu()}
        onKeyDown={handleKeyDown}
        ref={buttonRef}
        role="combobox"
        type="button"
      >
        <span>{selectedOption?.label ?? ''}</span>
        <span aria-hidden="true" className="custom-select-chevron" />
      </button>
      {open && menuPosition && createPortal(
        <div
          aria-labelledby={labelId}
          className="custom-select-menu"
          id={listboxId}
          ref={listRef}
          role="listbox"
          style={menuPosition}
        >
          {options.map((option, index) => {
            const groupChanged = option.group && option.group !== currentGroup;
            currentGroup = option.group;
            return <div key={option.value} role="presentation">
              {groupChanged && <div aria-hidden="true" className="custom-select-group">{option.group}</div>}
              <div
                aria-selected={option.value === value}
                className={`custom-select-option${index === activeIndex ? ' is-active' : ''}${option.value === value ? ' is-selected' : ''}`}
                id={`${listboxId}-option-${index}`}
                onClick={() => selectOption(index)}
                onMouseMove={() => setActiveIndex(index)}
                role="option"
              >
                {option.label}
              </div>
            </div>;
          })}
        </div>,
        document.body,
      )}
    </div>
  </div>;
}
