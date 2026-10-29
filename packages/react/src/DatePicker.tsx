// Extracted from src/app/components/ui/DatePicker.tsx @ 0d10fa1e5ebeab3c41882c5c7688dcfd38af3f09.
// See audit/components.json and audit/remediations.json for provenance/differences.
import React, { forwardRef } from 'react';
import { Input, InputProps } from './input';

export interface DatePickerProps extends Omit<InputProps, 'type'> {}

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  (props, ref) => {
    return <Input type="date" ref={ref} {...props} />;
  }
);

DatePicker.displayName = 'DatePicker';
export default DatePicker;
