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
