import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  CheckCircle as CheckCircleRounded,
  CloseCircle as CloseCircleRounded,
  AltArrowDown as ChevronDownIcon
} from '@solar-icons/react';
import { Label } from './label';
import { cn } from './utils';

export interface MultiSelectOption {
  value: string;
  label: string;
}

export interface MultiSelectComboboxProps {
  label?: string;
  options: MultiSelectOption[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  emptyText?: string;
  renderSelectedChips?: boolean;
  className?: string;
  containerClassName?: string;
  disabled?: boolean;
  id?: string;
}

export const MultiSelectCombobox: React.FC<MultiSelectComboboxProps> = ({
  label,
  options,
  selectedValues,
  onChange,
  placeholder = 'Select options...',
  error,
  required = false,
  emptyText = 'No options found',
  renderSelectedChips = true,
  className = '',
  containerClassName = '',
  disabled = false,
  id
}) => {
  const [internalId] = useState(() => id || `multiselect-${Math.random().toString(36).substr(2, 9)}`);
  const inputId = id || internalId;
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const [coords, setCoords] = useState<{
    top: number;
    left: number;
    width: number;
    placement: 'bottom' | 'top';
  }>({ top: 0, left: 0, width: 0, placement: 'bottom' });

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter(opt => {
    const optLab = String(opt?.label ?? '').toLowerCase();
    const optVal = String(opt?.value ?? '').toLowerCase();
    const term = searchTerm.toLowerCase();
    return optLab.includes(term) || optVal.includes(term);
  });

  const updateCoords = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const estimatedHeight = 240;
    const placement: 'bottom' | 'top' =
      spaceBelow < estimatedHeight && rect.top > spaceBelow ? 'top' : 'bottom';

    setCoords({
      top: placement === 'bottom' ? rect.bottom + 4 : Math.max(8, rect.top - 4),
      left: rect.left,
      width: rect.width,
      placement,
    });
  }, []);

  // Close when clicking outside and scroll/resize
  useEffect(() => {
    if (!isOpen) return;

    updateCoords();

    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as Node;
      const isInsideContainer = containerRef.current && containerRef.current.contains(target);
      const isInsidePopover = popoverRef.current && popoverRef.current.contains(target);

      if (!isInsideContainer && !isInsidePopover) {
        setIsOpen(false);
      }
    };

    const handleScrollOrResize = () => {
      updateCoords();
    };

    document.addEventListener('mousedown', handleOutsideClick);
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen, updateCoords]);

  const handleToggleOption = (val: string) => {
    if (selectedValues.includes(val)) {
      onChange(selectedValues.filter(v => v !== val));
    } else {
      onChange([...selectedValues, val]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        updateCoords();
        setIsOpen(true);
        setActiveIndex(0);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(prev => (prev + 1 < filteredOptions.length ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(prev => (prev - 1 >= 0 ? prev - 1 : prev));
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < filteredOptions.length) {
          handleToggleOption(filteredOptions[activeIndex].value);
        }
        break;
      case 'Escape':
      case 'Tab':
        setIsOpen(false);
        setActiveIndex(-1);
        break;
      default:
        break;
    }
  };

  // Scroll active option into view inside scrollable wrapper
  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const activeEl = listRef.current.children[activeIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [activeIndex]);

  return (
    <div ref={containerRef} className={cn('flex flex-col relative w-full', containerClassName)}>
      {label && (
        <Label htmlFor={inputId} required={required} className="mb-1.5">
          {label}
        </Label>
      )}

      {/* Input / Search Anchor */}
      <div ref={triggerRef} className="relative">
        <input
          id={inputId}
          ref={inputRef}
          type="text"
          disabled={disabled}
          value={searchTerm}
          onChange={e => {
            setSearchTerm(e.target.value);
            if (!isOpen) {
              updateCoords();
              setIsOpen(true);
            }
            setActiveIndex(0);
          }}
          onFocus={() => {
            if (!disabled) {
              updateCoords();
              setIsOpen(true);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full h-11 pl-4 pr-10 py-2 border rounded-xl bg-white dark:bg-[#111625] text-slate-800 dark:text-[#F8FAFC] placeholder-slate-400 dark:placeholder-[#64748B] text-sm outline-none transition-all ${
            isOpen ? 'border-[#FF4F00] ring-1 ring-[#FF4F00]/20' : 'border-slate-200 dark:border-[#232D42] hover:border-slate-300 dark:hover:border-slate-600'
          } ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
        />
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {searchTerm ? (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                inputRef.current?.focus();
              }}
              className="text-slate-400 hover:text-slate-600 dark:text-[#94A3B8] dark:hover:text-[#F8FAFC] transition-colors"
            >
              <CloseCircleRounded size={18} />
            </button>
          ) : (
            <ChevronDownIcon
              size={18}
              className={`text-slate-400 dark:text-[#94A3B8] pointer-events-none transition-transform duration-200 ${
                isOpen ? 'rotate-180 text-[#FF4F00]' : ''
              }`}
            />
          )}
        </div>
      </div>

      {error && <span className="text-xs font-semibold text-red-500 select-none">{error}</span>}

      {/* Removable chips/badges footprint display */}
      {renderSelectedChips && selectedValues.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-1.5 select-none">
          {selectedValues.map((val: string) => {
            const opt = options.find(o => o.value === val);
            const labelText = opt ? opt.label : val;
            return (
              <div
                key={val}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-[#171E2E] border border-slate-200 dark:border-[#283248] rounded-lg text-xs font-semibold text-slate-800 dark:text-[#F8FAFC] shadow-sm transition-all"
              >
                <span>{labelText}</span>
                <button
                  type="button"
                  onClick={() => handleToggleOption(val)}
                  className="text-slate-400 hover:text-[#FF4F00] dark:text-[#94A3B8] dark:hover:text-[#FF4F00] transition-colors p-0.5 rounded-full"
                  aria-label={`Remove ${labelText}`}
                >
                  <CloseCircleRounded size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Popover list */}
      {isOpen && typeof document !== 'undefined' && createPortal(
        <div
          ref={popoverRef}
          style={{
            position: 'fixed',
            top: coords.placement === 'bottom' ? `${coords.top}px` : undefined,
            bottom: coords.placement === 'top' ? `${window.innerHeight - coords.top}px` : undefined,
            left: `${coords.left}px`,
            width: `${coords.width}px`,
            zIndex: 9999,
          }}
          className="bg-white dark:bg-[#111625] border border-slate-200 dark:border-[#232D42] shadow-2xl rounded-xl max-h-60 overflow-y-auto p-1.5 flex flex-col gap-0.5 animate-in fade-in zoom-in-95 duration-100"
        >
          {filteredOptions.length === 0 ? (
            <span className="text-xs text-slate-400 dark:text-[#94A3B8] p-3 italic select-none">
              {emptyText}
            </span>
          ) : (
            <div ref={listRef} className="flex flex-col gap-0.5">
              {filteredOptions.map((opt, index) => {
                const isChecked = selectedValues.includes(opt.value);
                const isActive = index === activeIndex;

                return (
                  <div
                    key={opt.value}
                    onClick={() => handleToggleOption(opt.value)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm cursor-pointer select-none transition-colors ${
                      isChecked
                        ? 'bg-orange-50/50 dark:bg-[#171E2E] text-[#FF4F00] font-semibold'
                        : isActive
                        ? 'bg-slate-50 dark:bg-[#171E2E] text-slate-800 dark:text-[#F8FAFC]'
                        : 'text-slate-700 dark:text-[#F8FAFC] hover:bg-slate-50 dark:hover:bg-[#171E2E]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        readOnly
                        className="rounded border-slate-300 dark:border-[#232D42] text-[#FF4F00] focus:ring-[#FF4F00] shrink-0"
                      />
                      <span className="truncate">{opt.label}</span>
                    </div>
                    {isChecked && <CheckCircleRounded size={18} className="text-[#FF4F00] shrink-0 ml-2" />}
                  </div>
                );
              })}
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
};
