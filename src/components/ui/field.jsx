import * as React from 'react';
import { cn } from '@/lib/utils';

const FieldGroup = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('space-y-6', className)} {...props} />
));
FieldGroup.displayName = 'FieldGroup';

const FieldSet = React.forwardRef(({ className, ...props }, ref) => (
  <fieldset ref={ref} className={cn('space-y-4', className)} {...props} />
));
FieldSet.displayName = 'FieldSet';

const FieldLegend = React.forwardRef(({ className, ...props }, ref) => (
  <legend ref={ref} className={cn('text-base font-semibold', className)} {...props} />
));
FieldLegend.displayName = 'FieldLegend';

const Field = React.forwardRef(({ className, orientation = 'vertical', ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'space-y-2',
      orientation === 'horizontal' && 'flex items-center space-x-2 space-y-0',
      className
    )}
    {...props}
  />
));
Field.displayName = 'Field';

const FieldLabel = React.forwardRef(({ className, ...props }, ref) => (
  <label ref={ref} className={cn('text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70', className)} {...props} />
));
FieldLabel.displayName = 'FieldLabel';

const FieldDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
));
FieldDescription.displayName = 'FieldDescription';

const FieldSeparator = React.forwardRef(({ className, ...props }, ref) => (
  <hr ref={ref} className={cn('border-t border-border my-6', className)} {...props} />
));
FieldSeparator.displayName = 'FieldSeparator';

export { Field, FieldGroup, FieldSet, FieldLegend, FieldLabel, FieldDescription, FieldSeparator };

