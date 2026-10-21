export function MarketModeSwitch({
  activeIndex,
  onChange,
}: {
  activeIndex: number;
  onChange: (index: number) => void;
}) {
  return (
    <div className="lite-mode-pills flex" role="group" aria-label="Market mode">
      {['Earn', 'Borrow'].map((label, index) => (
        <button
          type="button"
          key={label}
          className={activeIndex === index ? 'text-white font-semibold' : 'text-grey font-normal'}
          aria-pressed={activeIndex === index}
          onClick={() => onChange(index)}
        >
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}
