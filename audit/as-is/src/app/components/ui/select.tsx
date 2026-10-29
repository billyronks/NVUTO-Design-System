"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import * as SelectPrimitive from "@radix-ui/react-select";
import { CheckCircle as CheckIcon, AltArrowDown as ChevronDownIcon, AltArrowUp as ChevronUpIcon } from "@solar-icons/react";
import { cn } from "./utils";
import { Label } from "./label";
import { useQuery } from "@tanstack/react-query";
import { getCoreOptions } from "../../../services/requisitionService";

export interface SelectOption {
  value: string;
  label: string;
}

export interface CustomSelectProps {
  label?: React.ReactNode;
  error?: string;
  required?: boolean;
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (e: { target: { name?: string; value: string } }) => void;
  name?: string;
  disabled?: boolean;
  placeholder?: string;
  containerClassName?: string;
  className?: string;
  id?: string;
  organizationDimension?: "departments" | "locations";
  [key: string]: any;
}

function extractTextContent(node: React.ReactNode): string {
  if (!node) return "";
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (React.isValidElement(node)) {
    const props = (node.props as any) || {};
    if (typeof props.children === "string") return props.children;
    if (Array.isArray(props.children)) {
      return props.children.map(extractTextContent).join(" ");
    }
    if (props.children) {
      return extractTextContent(props.children);
    }
  }
  return "";
}

const CustomOptionSelect = React.forwardRef<HTMLButtonElement, CustomSelectProps>(
  function CustomOptionSelect(
    {
      label,
      error,
      required,
      options,
      value,
      defaultValue,
      onChange,
      name,
      disabled = false,
      placeholder = "Select option...",
      containerClassName = "",
      className = "",
      id,
      organizationDimension,
      ...props
    }: CustomSelectProps,
    forwardedRef
  ) {
    const [isOpen, setIsOpen] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const triggerRef = React.useRef<HTMLButtonElement | null>(null);
    const popoverRef = React.useRef<HTMLDivElement>(null);
    const [coords, setCoords] = React.useState<{
      top: number;
      left: number;
      width: number;
      placement: 'bottom' | 'top';
    }>({ top: 0, left: 0, width: 0, placement: 'bottom' });
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

    const normalizeSelectValue = (val: any): string => {
      if (val === null || val === undefined) return "";
      if (typeof val === "object") {
        if ("value" in val && typeof val.value !== "object") return String(val.value);
        if (val.target && "value" in val.target) return String(val.target.value);
      }
      return String(val);
    };

    // Handle both controlled and uncontrolled usage cleanly
    const [internalValue, setInternalValue] = React.useState<string>(
      value !== undefined
        ? normalizeSelectValue(value)
        : (defaultValue !== undefined ? normalizeSelectValue(defaultValue) : (props.defaultValue !== undefined ? normalizeSelectValue(props.defaultValue) : ""))
    );

    React.useEffect(() => {
      if (value !== undefined) {
        setInternalValue(normalizeSelectValue(value));
      }
    }, [value]);

    const currentValue = value !== undefined ? normalizeSelectValue(value) : internalValue;

    // Ref merging: safely merge forwardedRef, internal triggerRef, and any props.ref
    const { ref: propRef, ...buttonProps } = props;
    const setTriggerRef = React.useCallback(
      (node: HTMLButtonElement | null) => {
        triggerRef.current = node;
        if (typeof forwardedRef === 'function') {
          forwardedRef(node);
        } else if (forwardedRef) {
          (forwardedRef as React.MutableRefObject<HTMLButtonElement | null>).current = node;
        }
        if (typeof propRef === 'function') {
          propRef(node);
        } else if (propRef && typeof propRef === 'object' && 'current' in propRef) {
          (propRef as React.MutableRefObject<HTMLButtonElement | null>).current = node;
        }
      },
      [forwardedRef, propRef]
    );

    const rawLabelText = extractTextContent(label);
    const normalizedLabel = rawLabelText.trim().toLowerCase();
    const inferredDimension = organizationDimension
      || (normalizedLabel.includes("department") ? "departments" : undefined)
      || (["location", "office location", "work location", "target location", "target locations"].includes(normalizedLabel) ? "locations" : undefined);
    const { data: canonicalOptionsResponse } = useQuery({
      queryKey: ["coreOptions", inferredDimension],
      queryFn: () => getCoreOptions(inferredDimension!),
      enabled: Boolean(inferredDimension),
      staleTime: 60_000
    });
    const effectiveOptions = React.useMemo(() => {
      if (!inferredDimension) return options;

      // If caller already provided meaningful options (more than just empty/all sentinels), prioritize caller's options
      const nonSentinelCallerOptions = options.filter((option) => {
        const normalizedValue = String(option?.value ?? "").trim().toLowerCase();
        return normalizedValue !== "" && normalizedValue !== "all" && !normalizedValue.startsWith("all ");
      });
      if (nonSentinelCallerOptions.length > 0) {
        return options;
      }

      const sentinels = options.filter((option) => {
        const normalizedValue = String(option?.value ?? "").trim().toLowerCase();
        return normalizedValue === "" || normalizedValue === "all" || normalizedValue.startsWith("all ");
      });
      const canonical = (canonicalOptionsResponse?.data || []).map((option: any) => {
        const name = typeof option === "string" ? option : option.name;
        return { value: name, label: name };
      }).filter((option: SelectOption) => Boolean(option.value));
      return [...sentinels, ...canonical];
    }, [canonicalOptionsResponse, inferredDimension, options]);

    const activeOption = effectiveOptions.find((opt) => String(opt.value) === String(currentValue));
    const displayLabel = activeOption ? activeOption.label : placeholder;

    const updateCoords = React.useCallback(() => {
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

    const handleToggle = () => {
      if (!disabled) {
        if (!isOpen) {
          updateCoords();
        }
        setIsOpen((prev) => !prev);
      }
    };

    const handleSelectOption = (optValue: string) => {
      setInternalValue(optValue);
      if (onChange) {
        onChange({ target: { name, value: optValue } });
      }
      setIsOpen(false);
    };

    React.useEffect(() => {
      if (!isOpen) return;

      updateCoords();

      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Node;
        if (
          containerRef.current &&
          !containerRef.current.contains(target) &&
          popoverRef.current &&
          !popoverRef.current.contains(target)
        ) {
          setIsOpen(false);
        }
      };

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          setIsOpen(false);
        }
      };

      const handleScrollOrResize = () => {
        updateCoords();
      };

      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
      window.addEventListener("scroll", handleScrollOrResize, true);
      window.addEventListener("resize", handleScrollOrResize);

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleKeyDown);
        window.removeEventListener("scroll", handleScrollOrResize, true);
        window.removeEventListener("resize", handleScrollOrResize);
      };
    }, [isOpen, updateCoords]);

    return (
      <div
        ref={containerRef}
        className={cn("flex flex-col relative w-full", containerClassName)}
      >
        {label && <Label required={required}>{label}</Label>}

        <div className="relative w-full">
          {name && (
            <input
              type="hidden"
              name={name}
              value={currentValue}
              readOnly
            />
          )}
          <button
            ref={setTriggerRef}
            id={selectId}
            type="button"
            aria-label={buttonProps['aria-label'] || (rawLabelText ? rawLabelText.trim() : undefined) || placeholder || "Select option"}
            disabled={disabled}
            onClick={handleToggle}
            className={cn(
              "w-full min-h-[44px] bg-[#F3F4F6] dark:bg-[#171E2E] rounded-lg px-4 py-2.5 text-base text-slate-700 dark:text-[#F8FAFC] flex justify-between items-center transition-all cursor-pointer select-none border border-slate-300 dark:border-[#232D42] text-left focus:ring-2 focus:ring-[#FF4F00]/30 focus:border-[#FF4F00] outline-none disabled:opacity-50 disabled:pointer-events-none",
              error && "ring-2 ring-red-500/50 bg-red-50/20 dark:bg-red-950/30 border-red-500",
              className
            )}
            {...buttonProps}
          >
            <span className="truncate">{displayLabel}</span>
            <ChevronDownIcon
              size={18}
              className={cn(
                "text-slate-400 dark:text-[#94A3B8] transition-transform duration-200 shrink-0 ml-2",
                isOpen && "rotate-180"
              )}
            />
          </button>

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
              className="bg-white dark:bg-[#111625] border border-slate-200 dark:border-[#232D42] rounded-xl shadow-2xl max-h-60 overflow-y-auto py-1 animate-in fade-in zoom-in-95 duration-100"
            >
              {effectiveOptions.length === 0 ? (
                <div className="px-4 py-3 text-sm text-slate-400 dark:text-[#94A3B8] italic">
                  No options available
                </div>
              ) : (
                effectiveOptions.map((opt) => {
                  const isSelected = String(opt.value) === String(currentValue);
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleSelectOption(opt.value)}
                      className={cn(
                        "w-full px-4 py-2.5 text-sm flex items-center justify-between text-left transition-colors cursor-pointer min-h-[44px]",
                        isSelected
                          ? "bg-[#FF4F00]/10 dark:bg-[#171E2E] text-[#FF4F00] font-bold"
                          : "text-slate-700 dark:text-[#F8FAFC] hover:bg-slate-50 dark:hover:bg-[#171E2E]"
                      )}
                    >
                      <span className="truncate">{opt.label}</span>
                      {isSelected && <CheckIcon size={18} className="text-[#FF4F00] shrink-0 ml-2" />}
                    </button>
                  );
                })
              )}
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
  }
);

const Select = React.forwardRef<any, any>(function Select(props, ref) {
  if (props && "options" in props && Array.isArray(props.options)) {
    return <CustomOptionSelect ref={ref} {...props} />;
  }

  // Defensive fallback: if caller passed <option> child elements into <Select>, extract them into structured options
  if (props && props.children) {
    const childrenArray = React.Children.toArray(props.children);
    const hasOptionTags = childrenArray.some(
      (child: any) => React.isValidElement(child) && (child.type === 'option' || (child.type as any)?.displayName === 'option')
    );
    if (hasOptionTags) {
      const extractedOptions = childrenArray
        .filter((child: any) => React.isValidElement(child) && (child.type === 'option' || (child.type as any)?.displayName === 'option'))
        .map((child: any) => ({
          value: child.props.value ?? String(child.props.children ?? ''),
          label: String(child.props.children ?? child.props.value ?? '')
        }));
      const { children, ...restProps } = props;
      return <CustomOptionSelect ref={ref} options={extractedOptions} {...restProps} />;
    }
  }

  return <SelectPrimitive.Root data-slot="select" {...props} />;
});

function SelectGroup({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

function SelectValue({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />;
}

function SelectTrigger({
  className,
  size = "default",
  children,
  'aria-label': ariaLabel,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  size?: "sm" | "default";
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      aria-label={ariaLabel || (typeof children === 'string' ? children : 'Select option')}
      data-size={size}
      className={cn(
        "border-slate-200 dark:border-[#232D42] data-[placeholder]:text-muted-foreground dark:data-[placeholder]:text-[#94A3B8] [&_svg:not([class*='text-'])]:text-muted-foreground dark:[&_svg:not([class*='text-'])]:text-[#94A3B8] focus-visible:border-[#FF4F00] focus-visible:ring-2 focus-visible:ring-[#FF4F00]/30 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-[#171E2E] dark:text-[#F8FAFC] dark:hover:bg-[#171E2E]/80 flex w-full items-center justify-between gap-2 rounded-md border bg-input-background px-3 py-2 text-sm whitespace-nowrap transition-colors outline-none disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:min-h-[44px] data-[size=sm]:min-h-[44px] *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="size-4 opacity-50" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

function SelectContent({
  className,
  children,
  position = "popper",
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          "bg-white dark:bg-[#111625] text-slate-800 dark:text-[#F8FAFC] border-slate-200 dark:border-[#232D42] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-[9999] max-h-60 min-w-[var(--radix-select-trigger-width)] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-xl border shadow-2xl",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className
        )}
        position={position}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            "p-1",
            position === "popper" &&
              "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1"
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn("text-slate-400 dark:text-[#94A3B8] px-2 py-1.5 text-sm", className)}
      {...props}
    />
  );
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "focus:bg-slate-100 dark:bg-[#171E2E] dark:focus:bg-[#171E2E] focus:text-slate-900 dark:text-[#F8FAFC] dark:focus:text-[#FF4F00] text-slate-700 dark:text-[#F8FAFC] relative flex w-full cursor-pointer items-center gap-2 rounded-sm py-2 pr-8 pl-2 text-sm outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 min-h-[44px]",
        className
      )}
      {...props}
    >
      <span className="absolute right-2 flex size-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("bg-border pointer-events-none -mx-1 my-1 h-px", className)}
      {...props}
    />
  );
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className
      )}
      {...props}
    >
      <ChevronUpIcon className="size-4" />
    </SelectPrimitive.ScrollUpButton>
  );
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className
      )}
      {...props}
    >
      <ChevronDownIcon className="size-4" />
    </SelectPrimitive.ScrollDownButton>
  );
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
