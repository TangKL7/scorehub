import React from 'react';
import { Button } from '@/components/ui/button';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex flex-shrink-0 items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}

interface PageHeaderActionProps {
  children: React.ReactNode;
  onClick?: () => void;
  primary?: boolean;
  href?: string;
}

export function PageHeaderAction({ 
  children, 
  onClick, 
  primary = false,
  href
}: PageHeaderActionProps) {
  const variant = primary ? 'default' as const : 'outline' as const;
  
  if (href) {
    return (
      <Button 
        asChild 
        variant={variant} 
        onClick={onClick} 
        className={primary ? 'shadow-sm' : ''}
      >
        <a href={href}>{children}</a>
      </Button>
    );
  }

  return (
    <Button 
      variant={variant} 
      onClick={onClick} 
      className={primary ? 'shadow-sm' : ''}
    >
      {children}
    </Button>
  );
} 