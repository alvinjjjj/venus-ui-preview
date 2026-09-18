import { Button, cn } from '@venusprotocol/ui';
import { forwardRef, useCallback, useMemo } from 'react';
import './glass.css';

import { Dropdown } from '../Dropdown';
import { Icon } from '../Icon';
import { SelectOptionRow } from './Option';
import { renderLabel } from './renderLabel';
import type { SelectProps } from './types';

export * from './types';

export const Select = forwardRef<HTMLInputElement, SelectProps>(
  <TValue extends string | number = string | number>(
    {
      className,
      dropdownClassName,
      buttonClassName,
      options,
      optionClassName = 'px-4 h-12',
      value,
      onChange,
      size = 'medium',
      variant,
      disabled = false,
      modalPortalContainer,
      label,
      placeLabelToLeft,
      menuTitle,
      menuPosition,
      triggerOnHover,
      ...otherProps
    }: SelectProps,
    ref: React.Ref<HTMLInputElement>,
  ) => {
    const selectedOption = options.find(option => option.value === value);

    const buttonSizeClasses = useMemo(() => {
      if (size === 'large') {
        return cn('px-4 h-14');
      }

      if (size === 'medium') {
        return cn('px-4 h-12');
      }

      return cn('px-3 h-10');
    }, [size]);

    const getVariantClasses = ({
      variant,
      isDropdownOpen,
    }: {
      variant: SelectProps['variant'];
      isDropdownOpen: boolean;
    }) => {
      switch (variant) {
        case 'secondary':
          return cn(
            'border-lightGrey bg-lightGrey hover:border-blue hover:bg-lightGrey active:border-blue active:bg-lightGrey',
            isDropdownOpen && 'border-blue hover:border-blue',
          );
        case 'tertiary':
          return cn(
            'border-transparent bg-cards hover:bg-cards hover:border-white active:bg-cards active:border-blue',
            isDropdownOpen && 'border-blue hover:border-blue',
          );
        case 'quaternary':
          return cn(
            'border-transparent bg-lightGrey rounded-xl hover:bg-lightGrey hover:border-grey active:bg-lightGrey active:border-blue',
            isDropdownOpen && 'border-blue bg-lightGrey hover:border-blue',
          );
        // primary
        default:
          return cn(
            'rounded-lg border-dark-blue-hover bg-transparent hover:bg-transparent hover:border-light-grey active:bg-dark-blue',
            isDropdownOpen && 'bg-dark-blue-active border-blue',
          );
      }
    };

    const optionsDom = useCallback(
      ({ setIsDropdownOpen }: { setIsDropdownOpen: (v: boolean) => void }) => {
        const handleChange = (newValue: typeof value) => {
          onChange(newValue);
          setIsDropdownOpen(false);
        };
        return (
          <div className={cn('venus-select-options', dropdownClassName)}>
            {options.map(option => (
              <SelectOptionRow
                key={option.value}
                selected={value === option.value}
                disabled={option.disabled}
                onClick={() => handleChange(option.value)}
                className={optionClassName}
              >
                {renderLabel({ label: option.label })}
              </SelectOptionRow>
            ))}
          </div>
        );
      },
      [onChange, options, optionClassName, dropdownClassName, value],
    );

    return (
      <Dropdown
        menuClassName="venus-select-panel"
        className={className}
        modalPortalContainer={modalPortalContainer}
        optionsDom={optionsDom}
        size={size}
        label={label}
        placeLabelToLeft={placeLabelToLeft}
        menuTitle={menuTitle}
        menuPosition={menuPosition}
        triggerOnHover={triggerOnHover}
        {...otherProps}
      >
        {({ isDropdownOpen, handleToggleDropdown }) => (
          <Button
            data-select-trigger
            aria-expanded={isDropdownOpen}
            onClick={handleToggleDropdown}
            className={cn(
              'relative w-full',
              getVariantClasses({ variant, isDropdownOpen }),
              buttonSizeClasses,
              buttonClassName,
            )}
            disabled={disabled}
            contentClassName={cn('w-full justify-center text-sm font-semibold')}
          >
            <input
              ref={ref}
              value={value}
              className="hidden"
              disabled={disabled}
              onChange={e => {
                const formattedValue = (
                  typeof value === 'number' ? +e.currentTarget.value : e.currentTarget.value
                ) as TValue;

                onChange(formattedValue);
              }}
              {...otherProps}
            />

            <span className="grow overflow-hidden text-ellipsis whitespace-nowrap text-left">
              {selectedOption &&
                renderLabel({ label: selectedOption.label, isRenderedInButton: true })}
            </span>

            {!disabled && (
              <Icon
                name="chevronDown"
                className={cn('venus-dropdown-chevron text-grey ml-2 size-3 flex-none', isDropdownOpen && 'rotate-180')}
              />
            )}
          </Button>
        )}
      </Dropdown>
    );
  },
);
