import { type CSSProperties, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import './glass.css';
import { AnimatePresence, motion, useIsPresent, useReducedMotion } from 'motion/react';

const NavigationPresence = ({ children, animated }: { children: React.ReactNode; animated: boolean }) => {
  const present = useIsPresent();
  return <motion.div
    className="relative z-50 hidden min-w-full md:block"
    inert={!present}
    style={{ pointerEvents: present ? 'auto' : 'none' }}
    initial={animated ? 'hidden' : false}
    animate="visible"
    exit="closed"
    variants={{
      hidden: { y: -4 },
      visible: { y: 0, transition: { duration: animated ? 0.22 : 0, ease: 'easeOut' } },
      closed: { y: animated ? -2 : 0, transition: { duration: animated ? 0.14 : 0, ease: 'easeOut' } },
    }}
  >{children}</motion.div>;
};

const FloatingPresence = ({ children, animated, position, className, onEscape }: {
  children: React.ReactNode;
  animated: boolean;
  position: CSSProperties;
  className: string;
  onEscape: () => void;
}) => {
  const present = useIsPresent();
  return <div className="fixed z-100001" style={{ ...position, pointerEvents: present ? 'auto' : 'none' }} inert={!present}>
    <motion.div
      className={className}
      style={{ maxHeight: position.maxHeight, overflowY: 'auto' }}
      initial={animated ? { opacity: 0, y: -4 } : false}
      animate={{ opacity: 1, y: 0, transition: { duration: animated ? .22 : 0, ease: 'easeOut' } }}
      exit={{ opacity: 0, y: animated ? -2 : 0, transition: { duration: animated ? .14 : 0, ease: 'easeOut' } }}
      onKeyDown={event => { if (event.key === 'Escape') onEscape(); }}
    >{children}</motion.div>
  </div>;
};

import { cn } from '@venusprotocol/ui';
import { useBreakpointUp } from 'hooks/responsive';

import { Modal } from '../Modal';
import type { DropdownProps } from './types';

export * from './types';

export const Dropdown = ({
  className,
  children,
  optionsDom,
  optionClassName,
  menuClassName,
  onBlur,
  label,
  placeLabelToLeft = false,
  variant = 'primary',
  menuTitle,
  menuPosition = 'left',
  matchTriggerWidth = false,
  triggerOnHover = false,
  modalPortalContainer,
}: DropdownProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const animateMenu = !reduceMotion &&
    typeof document !== 'undefined' && ['v5', 'v6'].includes(document.documentElement.dataset.glassPreview ?? '');
  const anchorRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({
    top: 0,
    left: 0,
    width: 240,
    maxHeight: 320,
    transform: 'none',
  });
  useLayoutEffect(() => {
    if (!isDropdownOpen || triggerOnHover) return;
    const update = () => {
      const rect = anchorRef.current?.getBoundingClientRect();
      if (!rect) return;
      const useTriggerWidth = matchTriggerWidth && ['v5', 'v6'].includes(document.documentElement.dataset.glassPreview ?? '');
      const width = Math.min(useTriggerWidth ? rect.width : Math.max(rect.width, 240), window.innerWidth - 32);
      const below = window.innerHeight - rect.bottom - 16;
      const above = rect.top - 16;
      const height = Math.min(320, Math.max(below, above));
      const top = below >= Math.min(240, above) ? rect.bottom + 8 : rect.top - 8;
      setPosition({
        top,
        left: Math.max(
          16,
          Math.min(
            menuPosition === 'right' ? rect.right - width : rect.left,
            window.innerWidth - width - 16,
          ),
        ),
        width,
        maxHeight: height,
        transform: below >= Math.min(240, above) ? 'none' : 'translateY(-100%)',
      });
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [isDropdownOpen, triggerOnHover, menuPosition, matchTriggerWidth]);
  const handleToggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const isMdOrUp = useBreakpointUp('md');

  return (
    <>
      <div
        data-dropdown-open={isDropdownOpen}
        className={cn(placeLabelToLeft && 'inline-flex items-center', className)}
      >
        {!!label && (
          <div
            data-dropdown-open={isDropdownOpen}
            className={cn(placeLabelToLeft ? 'mr-3 shrink-0' : 'mb-1')}
          >
            <p className={cn('text-grey text-sm font-semibold')}>{label}</p>
          </div>
        )}

        <div
          ref={anchorRef}
          onKeyDown={event => {
            if (event.key === 'Escape') {
              setIsDropdownOpen(false);
              event.currentTarget.querySelector<HTMLButtonElement>('button')?.focus();
            }
          }}
          className="relative w-full"
          onMouseEnter={triggerOnHover && isMdOrUp ? () => setIsDropdownOpen(true) : undefined}
          onMouseLeave={triggerOnHover && isMdOrUp ? () => setIsDropdownOpen(false) : undefined}
        >
          {/* MD and up backdrop — click mode only */}
          {isDropdownOpen && !triggerOnHover && (
            <div
              className="fixed bottom-0 left-0 right-0 top-0 hidden md:block z-50"
              onClick={() => setIsDropdownOpen(false)}
            />
          )}

          {children({ isDropdownOpen, handleToggleDropdown })}

          {/* MD and up menu */}
          <AnimatePresence>
          {isDropdownOpen && triggerOnHover && (
            <NavigationPresence animated={animateMenu}>
              <div
                className={cn('pt-2 absolute min-w-full', menuPosition === 'right' && 'right-0')}
              >
                <motion.div
                  variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 1, transition: { duration: animateMenu ? 0.22 : 0, ease: 'easeOut' } },
                    closed: { opacity: 0, transition: { duration: animateMenu ? 0.14 : 0, ease: 'easeOut' } },
                  }}
                  className={cn(
                    'venus-dropdown-surface border-lightGrey bg-cards overflow-visible border shadow',
                    variant === 'quaternary' ? 'rounded-xl' : 'rounded-lg',
                    menuClassName,
                  )}
                >
                  {!!menuTitle && (
                    <div
                      className={cn(
                        'text-grey w-full py-3 text-xs',
                        variant === 'primary' ? 'px-3 sm:px-4' : 'px-3',
                      )}
                    >
                      {menuTitle}
                    </div>
                  )}

                  {optionsDom({ setIsDropdownOpen, optionClassName })}
                </motion.div>
              </div>
            </NavigationPresence>
          )}
          </AnimatePresence>
        </div>
      </div>

      {isMdOrUp &&
        !triggerOnHover &&
        createPortal(
          <>
            {isDropdownOpen && <div className="fixed inset-0 z-100000" onClick={() => setIsDropdownOpen(false)} />}
            <AnimatePresence>
            {isDropdownOpen && <FloatingPresence
              animated={animateMenu}
              position={position}
              className={cn(
                'venus-dropdown-surface overflow-auto rounded-lg border bg-cards p-1',
                menuClassName,
              )}
              onEscape={() => {
                  setIsDropdownOpen(false);
                  anchorRef.current?.querySelector('button')?.focus();
              }}
            >
              {!!menuTitle && <div className="px-3 py-3 text-grey text-xs">{menuTitle}</div>}
              {optionsDom({ setIsDropdownOpen, optionClassName })}
            </FloatingPresence>}
            </AnimatePresence>
          </>,
          document.body,
        )}
      {/* XS to MD menu */}
      <Modal
        isOpen={isDropdownOpen && !isMdOrUp}
        handleClose={handleToggleDropdown}
        backdropClassName="z-100000"
        rootClassName="z-100001"
        noHorizontalPadding
        onBlur={onBlur}
        title={menuTitle}
        portalContainer={modalPortalContainer}
      >
        {optionsDom({ setIsDropdownOpen, optionClassName })}
      </Modal>
    </>
  );
};
