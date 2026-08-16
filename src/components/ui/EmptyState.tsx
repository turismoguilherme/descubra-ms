import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from './alert';
import { Button } from './button';

interface EmptyStateProps {
  message: string;
  description?: string;
  action?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  message,
  description,
  action,
  onAction
}) => {
  return (
    <Alert>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        <p className="font-medium">{message}</p>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
        {action && onAction && (
          <Button variant="outline" size="sm" className="mt-4" onClick={onAction}>
            {action}
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};
