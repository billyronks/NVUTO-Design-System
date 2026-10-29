// ─────────────────────────────────────────────────────────────────────────────
// NVUTO Platform — Typable & Searchable Combobox Component
// src/app/components/ui/SearchableCombobox.tsx
//
// Matches atomic Select design system component 100% in trigger styling, label
// rendering, dark mode background (#F3F4F6 / #171E2E), borders, focus rings (#00D1B2/40),
// and error state handling while providing direct typable search & custom input.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle as CheckIcon, AltArrowDown as ChevronDownIcon, CloseCircle as CloseCircleRounded } from '@solar-icons/react';
import { cn } from './utils';
import { Label } from './label';

export interface ComboboxOption {
  value: string;
  label: string;
  flag?: string;
}

export interface SearchableComboboxProps {
  label?: React.ReactNode;
  value?: string;
  onChange?: (e: { target: { name?: string; value: string } }) => void;
  options: ComboboxOption[];
  placeholder?: string;
  error?: string;
  required?: boolean;
  className?: string;
  containerClassName?: string;
  disabled?: boolean;
  id?: string;
  name?: string;
  allowCustom?: boolean;
}

export const SearchableCombobox: React.FC<SearchableComboboxProps> = ({
  label,
  value = '',
  onChange,
  options = [],
  placeholder = 'Type or select option...',
  error,
  required,
  className = '',
  containerClassName = '',
  disabled = false,
  id,
  name,
  allowCustom = true,
  ...props
}) => {
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
  const triggerBoxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const selectId = id || `combobox-${Math.random().toString(36).substring(2, 9)}`;

  // Find active matching option from options prop
  const activeOption = useMemo(() => {
    if (!value) return null;
    const valStr = String(value).toLowerCase();
    return options.find((opt) => {
      const optVal = String(opt?.value ?? '').toLowerCase();
      const optLab = String(opt?.label ?? '').toLowerCase();
      return optVal === valStr || optLab === valStr;
    });
  }, [options, value]);

  // Display value for trigger when closed
  const displayLabel = useMemo(() => {
    if (activeOption) {
      return activeOption.label;
    }
    return typeof value === 'string' ? value : String(value || '');
  }, [activeOption, value]);

  // Filtered options based on user typing
  const filteredOptions = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return options;
    return options.filter((opt) => {
      const optVal = String(opt?.value ?? '').toLowerCase();
      const optLab = String(opt?.label ?? '').toLowerCase();
      return optLab.includes(term) || optVal.includes(term);
    });
  }, [options, searchTerm]);

  // Check if current search term exactly matches an option
  const hasExactMatch = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return options.some((opt) => {
      const optVal = String(opt?.value ?? '').toLowerCase();
      const optLab = String(opt?.label ?? '').toLowerCase();
      return optLab === term || optVal === term;
    });
  }, [options, searchTerm]);

  const updateCoords = useCallback(() => {
    if (!triggerBoxRef.current) return;
    const rect = triggerBoxRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const estimatedHeight = 256;
    const placement: 'bottom' | 'top' =
      spaceBelow < estimatedHeight && rect.top > spaceBelow ? 'top' : 'bottom';

    setCoords({
      top: placement === 'bottom' ? rect.bottom + 4 : Math.max(8, rect.top - 4),
      left: rect.left,
      width: rect.width,
      placement,
    });
  }, []);

  const emitChange = (newValue: string) => {
    if (onChange) {
      const event = {
        target: { name: name || selectId, value: newValue },
        currentTarget: { name: name || selectId, value: newValue },
      };
      onChange(event as any);
    }
  };

  const handleOpen = () => {
    if (!disabled && !isOpen) {
      updateCoords();
      setIsOpen(true);
      setSearchTerm('');
      setActiveIndex(0);
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 50);
    }
  };

  const handleSelectOption = (optValue: string) => {
    emitChange(optValue);
    setIsOpen(false);
    setSearchTerm('');
    setActiveIndex(-1);
  };

  // Handle outside click and scroll/resize
  useEffect(() => {
    if (!isOpen) return;

    updateCoords();

    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as Node;
      const isInsideContainer = containerRef.current && containerRef.current.contains(target);
      const isInsidePopover = popoverRef.current && popoverRef.current.contains(target);

      if (!isInsideContainer && !isInsidePopover) {
        // If custom allowed and user typed something not matching, submit custom value
        if (allowCustom && searchTerm.trim() && !hasExactMatch) {
          emitChange(searchTerm.trim());
        }
        setIsOpen(false);
        setSearchTerm('');
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
  }, [isOpen, searchTerm, allowCustom, hasExactMatch, updateCoords]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'Enter')) {
      e.preventDefault();
      handleOpen();
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((prev) => {
          const max = filteredOptions.length + (allowCustom && searchTerm.trim() && !hasExactMatch ? 1 : 0);
          return prev + 1 < max ? prev + 1 : prev;
        });
        break;

      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((prev) => (prev - 1 >= 0 ? prev - 1 : prev));
        break;

      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < filteredOptions.length) {
          handleSelectOption(filteredOptions[activeIndex].value);
        } else if (allowCustom && searchTerm.trim()) {
          handleSelectOption(searchTerm.trim());
        } else if (filteredOptions.length > 0) {
          handleSelectOption(filteredOptions[0].value);
        }
        break;

      case 'Escape':
        setIsOpen(false);
        setSearchTerm('');
        setActiveIndex(-1);
        break;

      case 'Tab':
        if (isOpen && allowCustom && searchTerm.trim() && !hasExactMatch) {
          emitChange(searchTerm.trim());
        }
        setIsOpen(false);
        setSearchTerm('');
        setActiveIndex(-1);
        break;

      default:
        break;
    }
  };

  // Scroll active option into view when navigating via arrow keys
  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const activeEl = listRef.current.children[activeIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [activeIndex]);

  return (
    <div
      ref={containerRef}
      className={cn('flex flex-col relative w-full', containerClassName)}
    >
      {label && <Label htmlFor={selectId} required={required}>{label}</Label>}

      <div className="relative w-full">
        {/* Trigger Box — Functions as an editable typable input when open or focused */}
        <div
          ref={triggerBoxRef}
          onClick={handleOpen}
          role="combobox"
          aria-expanded={isOpen}
          aria-label={(typeof label === 'string' && label) || placeholder || "Select option"}
          className={cn(
            'w-full min-h-[44px] bg-[#F3F4F6] dark:bg-[#171E2E] rounded-lg px-4 py-2 text-base text-slate-800 dark:text-[#F8FAFC] flex justify-between items-center transition-all cursor-pointer border border-slate-300 dark:border-[#232D42] text-left focus-within:ring-2 focus-within:ring-[#00D1B2]/40 outline-none disabled:opacity-50 disabled:pointer-events-none',
            error && 'ring-2 ring-red-500/50 bg-red-50/20 dark:bg-red-950/30 border-red-500',
            className
          )}
        >
          {isOpen ? (
            <input
              ref={inputRef}
              id={selectId}
              type="text"
              name={name}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setActiveIndex(0);
              }}
              onKeyDown={handleKeyDown}
              placeholder={displayLabel || placeholder}
              className="w-full bg-transparent text-slate-900 dark:text-[#F8FAFC] placeholder-slate-400 outline-none border-0 p-0 text-base"
              {...props}
            />
          ) : (
            <span className="truncate flex items-center gap-2 select-none w-full">
              {activeOption ? (
                <>
                  {activeOption.flag && <span className="text-base">{activeOption.flag}</span>}
                  <span className="truncate">{activeOption.label}</span>
                </>
              ) : value ? (
                <span className="truncate">{value}</span>
              ) : (
                <span className="text-slate-400 dark:text-[#94A3B8] font-normal">{placeholder}</span>
              )}
            </span>
          )}

          <div className="flex items-center gap-1 shrink-0 ml-2">
            {isOpen && searchTerm && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSearchTerm('');
                  emitChange('');
                  inputRef.current?.focus();
                }}
                className="text-slate-400 hover:text-slate-600 dark:text-[#94A3B8] dark:hover:text-slate-200 transition-colors p-0.5"
                title="Clear input"
              >
                <CloseCircleRounded size={16} />
              </button>
            )}
            <ChevronDownIcon
              size={18}
              className={cn(
                'text-slate-400 dark:text-[#94A3B8] transition-transform duration-200 shrink-0',
                isOpen && 'rotate-180'
              )}
            />
          </div>
        </div>

        {/* Popover Filtered Options List */}
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
            className="bg-white dark:bg-[#111625] border border-slate-200 dark:border-[#232D42] rounded-xl shadow-2xl max-h-64 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-100"
          >
            <div ref={listRef} className="overflow-y-auto max-h-60 p-1 flex flex-col">
              {/* Custom Value Option if user typed text not in options list */}
              {allowCustom && searchTerm.trim() && !hasExactMatch && (
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelectOption(searchTerm.trim());
                  }}
                  onClick={() => handleSelectOption(searchTerm.trim())}
                  onMouseEnter={() => setActiveIndex(filteredOptions.length)}
                  className={cn(
                    'w-full px-4 py-2.5 text-sm flex items-center justify-between text-left transition-colors cursor-pointer min-h-[44px] rounded-lg border-b border-slate-100 dark:border-[#232D42]',
                    activeIndex === filteredOptions.length
                      ? 'bg-[#00D1B2]/10 text-[#00D1B2] font-bold'
                      : 'text-[#00D1B2] hover:bg-slate-50 dark:bg-[#0B0F19] dark:hover:bg-[#171E2E] font-medium'
                  )}
                >
                  <span className="truncate italic">Use custom: &quot;{searchTerm.trim()}&quot;</span>
                  <span className="text-xs px-2 py-0.5 bg-[#00D1B2]/20 rounded font-semibold text-[#00D1B2]">Custom</span>
                </button>
              )}

              {filteredOptions.length === 0 && (!allowCustom || !searchTerm.trim()) ? (
                <div className="px-4 py-3 text-sm text-slate-400 dark:text-[#94A3B8] italic text-center">
                  No matching options found. Type to enter custom value.
                </div>
              ) : (
                filteredOptions.map((opt, index) => {
                  const optVal = String(opt?.value ?? '');
                  const optLab = String(opt?.label ?? optVal);
                  const isSelected =
                    optVal.toLowerCase() === String(value ?? '').toLowerCase() ||
                    optLab.toLowerCase() === String(value ?? '').toLowerCase();
                  const isActive = index === activeIndex;

                  return (
                    <button
                      key={`${optVal}-${index}`}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSelectOption(optVal);
                      }}
                      onClick={() => handleSelectOption(optVal)}
                      onMouseEnter={() => setActiveIndex(index)}
                      className={cn(
                        'w-full px-4 py-2.5 text-sm flex items-center justify-between text-left transition-colors cursor-pointer min-h-[44px] rounded-lg',
                        isSelected
                          ? 'bg-[#111184]/5 dark:bg-[#171E2E] text-[#FF4F00] font-bold'
                          : isActive
                          ? 'bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-[#F8FAFC]'
                          : 'text-slate-700 dark:text-[#F8FAFC] hover:bg-slate-50 dark:hover:bg-[#171E2E]'
                      )}
                    >
                      <span className="truncate flex items-center gap-2.5">
                        {opt.flag && <span className="text-base">{opt.flag}</span>}
                        <span className="truncate">{optLab}</span>
                      </span>
                      {isSelected && (
                        <CheckIcon size={18} className="text-[#FF4F00] shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>,
          document.body
        )}
      </div>

      {error && (
        <span className="text-sm text-[#BE123C] font-semibold mt-1">
          {error}
        </span>
      )}
    </div>
  );
};
