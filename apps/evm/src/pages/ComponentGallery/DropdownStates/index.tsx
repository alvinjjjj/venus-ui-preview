import { Select } from 'components';
import { SelectOptionRow } from 'components/Select/Option';
import { useState } from 'react';
import './states.css';

export const DropdownStates = () => {
  const [value, setValue] = useState<string | number>('USDT');
  const [chosen, setChosen] = useState('');
  const options = [
    { value: 'USDT', label: 'USDT' },
    { value: 'USDC', label: 'USDC' },
    { value: 'Unavailable', label: 'Unavailable', disabled: true },
  ];
  return (
    <section
      className="dropdown-states md:col-span-3 space-y-6"
      aria-label="Dropdown component states"
    >
      <h2 className="text-p1s">Dropdown states</h2>
      <p className="text-light-grey">
        80% surface opacity · 24px backdrop blur. V3 uses 8px corners; V4 uses soft rounded
        surfaces.
      </p>
      <h3 className="text-p2s">Trigger</h3>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {['Default / Hover', 'Active', 'Disabled'].map(state => (
          <div key={state} data-trigger-preview={state} className="space-y-3">
            <h4 className="text-sm">{state}</h4>
            <Select
              value={value}
              onChange={setValue}
              options={options}
              disabled={state === 'Disabled'}
              size="small"
            />
          </div>
        ))}
      </div>
      <h3 className="text-p2s">Options</h3>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {['Default', 'Hover', 'Selected', 'Disabled'].map(state => (
          <div key={state} className="space-y-3">
            <h4 className="text-sm">{state}</h4>
            <div className="">
              <div className="venus-select-options p-1">
                {['Text', 'Icon + text', 'Text + value', 'Icon + text + value'].map(
                  (label, index) => (
                    <SelectOptionRow
                      key={label}
                      selected={state === 'Selected' || chosen === state + label}
                      disabled={state === 'Disabled'}
                      previewState={state.toLowerCase()}
                      onClick={() => setChosen(state + label)}
                      className="px-3"
                    >
                      <span className="flex items-center gap-2">
                        {(index === 1 || index === 3) && (
                          <span aria-hidden="true" className="size-4 rounded bg-blue/30 shrink-0" />
                        )}
                        <span className="grow">Asset</span>
                        {index >= 2 && <span>123</span>}
                      </span>
                    </SelectOptionRow>
                  ),
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="text-sm text-light-grey">
        Labeled states are pinned for comparison. Open any enabled trigger to test the shared
        dropdown. Select an option to update it; disabled options cannot be selected.
      </p>
    </section>
  );
};
