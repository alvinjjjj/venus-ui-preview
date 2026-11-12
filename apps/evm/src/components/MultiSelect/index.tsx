import { Button, cn } from '@venusprotocol/ui';
import { useLayoutEffect, useRef, useState } from 'react';

import { useBreakpointUp } from 'hooks/responsive';
import { useTranslation } from 'libs/translations';

import { TextField } from '../TextField';
import './styles.css';

import { Dropdown } from '../Dropdown';
import { Icon } from '../Icon';

export interface MultiSelectOption {
  value: string;
  label: React.ReactNode;
  /** Visible option text for labels rendered as rich content. */
  searchText?: string;
}

export interface MultiSelectProps {
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder: React.ReactNode;
  renderCount: (count: number) => React.ReactNode;
  title: React.ReactNode;
  resetLabel: React.ReactNode;
  className?: string;
  menuClassName?: string;
  optionsClassName?: string;
  size?: 'small' | 'medium';
  searchPlaceholder?: string;
  enableSearch?: boolean;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  value,
  onChange,
  placeholder,
  renderCount,
  title,
  resetLabel,
  className,
  menuClassName,
  optionsClassName,
  size = 'medium',
  searchPlaceholder,
  enableSearch = true,
}) => {
  const { t } = useTranslation();
  const isDesktop = useBreakpointUp('md');
  const [query, setQuery] = useState('');
  const listRef = useRef<HTMLDivElement>(null);
  const previousScrollTop = useRef(0);
  const searchable = enableSearch && options.length > 6;
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const matches = options.map(option => ({
    option,
    text: (
      option.searchText ?? (typeof option.label === 'string' ? option.label : option.value)
    ).toLocaleLowerCase(),
  }));
  const filteredOptions = normalizedQuery
    ? [
        ...matches.filter(({ text }) => text.startsWith(normalizedQuery)),
        ...matches.filter(
          ({ text }) => !text.startsWith(normalizedQuery) && text.includes(normalizedQuery),
        ),
      ].map(({ option }) => option)
    : options;

  useLayoutEffect(() => {
    if (listRef.current) listRef.current.scrollTop = query ? 0 : previousScrollTop.current;
  }, [query]);

  const changeQuery = (nextQuery: string) => {
    if (!query && nextQuery) previousScrollTop.current = listRef.current?.scrollTop ?? 0;
    setQuery(nextQuery);
  };
  const toggle = (optionValue: string) =>
    onChange(
      value.includes(optionValue) ? value.filter(v => v !== optionValue) : [...value, optionValue],
    );

  let triggerLabel = placeholder;
  if (value.length === 1) {
    triggerLabel = options.find(option => option.value === value[0])?.label ?? placeholder;
  } else if (value.length > 1) {
    triggerLabel = renderCount(value.length);
  }

  return (
    <Dropdown
      className={className}
      menuPosition="right"
      matchTriggerWidth
      manageContentScroll={searchable}
      onOpenChange={open => {
        if (!open) {
          setQuery('');
          previousScrollTop.current = 0;
        }
      }}
      // Clip the options to the menu's rounded corners, so the hover highlight of the last
      // option does not bleed past the border
      menuClassName={cn(
        'venus-multiselect-panel bg-background border-blue overflow-hidden',
        menuClassName,
      )}
      optionsDom={() => (
        <div
          className={cn('min-w-full', searchable && 'venus-multiselect-content', optionsClassName)}
        >
          <div className={cn(searchable && 'venus-multiselect-header')}>
            <div className="venus-multiselect-title flex min-h-12 items-center justify-between gap-3 px-4 py-3">
              <span className="text-b1r text-white">{title}</span>

              <button
                type="button"
                onClick={() => onChange([])}
                disabled={value.length === 0}
                className="venus-multiselect-reset text-blue text-b1r shrink-0 cursor-pointer disabled:cursor-default disabled:opacity-50"
              >
                {resetLabel}
              </button>
            </div>

            {searchable && (
              <div className="venus-multiselect-search px-4 pb-3">
                <TextField
                  aria-label={searchPlaceholder ?? t('multiSelect.search')}
                  placeholder={searchPlaceholder ?? t('multiSelect.search')}
                  value={query}
                  onChange={event => changeQuery(event.currentTarget.value)}
                  autoFocus={isDesktop}
                  size="sm"
                  leftIconSrc="magnifier"
                  rightAdornment={
                    query ? (
                      <button
                        type="button"
                        aria-label={t('multiSelect.clearSearch')}
                        className="flex cursor-pointer items-center text-grey hover:text-white"
                        onClick={() => changeQuery('')}
                      >
                        <Icon name="close" className="size-4" />
                      </button>
                    ) : undefined
                  }
                />
              </div>
            )}
          </div>
          <div
            ref={listRef}
            className={cn(searchable && 'venus-multiselect-options')}
            data-multiselect-scroll={searchable && filteredOptions.length > 6 ? 'true' : undefined}
          >
            {filteredOptions.length === 0 && (
              <p className="px-4 py-3 text-grey text-b1r" role="status">
                {t('multiSelect.noResults')}
              </p>
            )}
            {filteredOptions.map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => toggle(option.value)}
                aria-pressed={value.includes(option.value)}
                className="venus-multiselect-option hover:bg-background-hover active:bg-background-hover flex h-12 w-full cursor-pointer items-center justify-between px-4 py-3 text-left"
              >
                <span className="text-b1r whitespace-nowrap text-white">{option.label}</span>

                <Icon
                  name={value.includes(option.value) ? 'checked' : 'checkboxBorder'}
                  className="size-5 shrink-0"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    >
      {({ isDropdownOpen, handleToggleDropdown }) => (
        <Button
          aria-expanded={isDropdownOpen}
          data-multiselect-has-value={value.length > 0}
          onClick={handleToggleDropdown}
          contentClassName="text-b1s w-full justify-center"
          className={cn(
            'venus-multiselect-trigger border-dark-blue-hover hover:border-light-grey active:bg-dark-blue relative w-full rounded-lg bg-transparent px-4 hover:bg-transparent',
            size === 'small' ? 'h-10' : 'h-12',
            isDropdownOpen && 'bg-dark-blue-active border-blue',
            value.length > 0 && 'border-blue',
          )}
        >
          <span className="grow overflow-hidden text-ellipsis whitespace-nowrap text-left">
            {triggerLabel}
          </span>

          <Icon
            name="chevronDown"
            className={cn(
              'venus-dropdown-chevron text-grey ml-2 size-3 flex-none',
              isDropdownOpen && 'rotate-180',
            )}
          />
        </Button>
      )}
    </Dropdown>
  );
};
