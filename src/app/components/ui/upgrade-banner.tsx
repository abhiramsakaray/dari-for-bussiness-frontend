import { X, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from './button';
import { Badge } from './badge';
import { cn } from './utils';
import type { UpgradeMessage } from '../../../utils/upgradeMessaging';

interface UpgradeBannerProps {
  message: UpgradeMessage;
  onDismiss?: () => void;
  onUpgrade?: () => void;
  onSecondaryAction?: () => void;
  className?: string;
}

export function UpgradeBanner({
  message,
  onDismiss,
  onUpgrade,
  onSecondaryAction,
  className,
}: UpgradeBannerProps) {
  const urgencyStyles = {
    critical: 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900',
    high: 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900',
    medium: 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900',
    low: 'bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900',
  };

  const urgencyTextStyles = {
    critical: 'text-red-900 dark:text-red-100',
    high: 'text-orange-900 dark:text-orange-100',
    medium: 'text-blue-900 dark:text-blue-100',
    low: 'text-purple-900 dark:text-purple-100',
  };

  return (
    <div
      className={cn(
        'relative rounded-lg border p-4 transition-all duration-200',
        urgencyStyles[message.urgency],
        className
      )}
    >
      {/* Dismiss button */}
      {message.dismissible && onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="shrink-0 mt-0.5">
          <Sparkles className={cn('h-5 w-5', urgencyTextStyles[message.urgency])} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-8">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={cn('text-sm font-semibold', urgencyTextStyles[message.urgency])}>
              {message.title}
            </h3>
            {message.showFreeTrial && (
              <Badge variant="secondary" className="text-xs">
                7-day free trial
              </Badge>
            )}
          </div>
          <p className={cn('text-sm', urgencyTextStyles[message.urgency], 'opacity-90')}>
            {message.message}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-2 mt-3">
            <Button
              size="sm"
              onClick={onUpgrade}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              {message.cta}
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
            {message.secondaryCta && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onSecondaryAction}
                className={urgencyTextStyles[message.urgency]}
              >
                {message.secondaryCta}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Compact inline banner for smaller spaces
export function UpgradeBannerCompact({
  message,
  onDismiss,
  onUpgrade,
  className,
}: UpgradeBannerProps) {
  const urgencyColors = {
    critical: 'border-l-red-500',
    high: 'border-l-orange-500',
    medium: 'border-l-blue-500',
    low: 'border-l-purple-500',
  };

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 p-3 bg-muted/50 border-l-4 rounded-r-lg',
        urgencyColors[message.urgency],
        className
      )}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{message.title}</p>
        <p className="text-xs text-muted-foreground truncate">{message.message}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Button size="sm" onClick={onUpgrade} className="text-xs">
          {message.cta}
        </Button>
        {message.dismissible && onDismiss && (
          <button
            onClick={onDismiss}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

// Modal/Popup version
export function UpgradeModal({
  message,
  onDismiss,
  onUpgrade,
  onSecondaryAction,
  className,
}: UpgradeBannerProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className={cn(
          'relative w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-2xl',
          className
        )}
      >
        {/* Close button */}
        {message.dismissible && onDismiss && (
          <button
            onClick={onDismiss}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
        </div>

        {/* Content */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold mb-2">{message.title}</h2>
          {message.showFreeTrial && (
            <Badge variant="secondary" className="mb-3">
              🎉 7-day free trial available
            </Badge>
          )}
          <p className="text-sm text-muted-foreground">{message.message}</p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <Button onClick={onUpgrade} className="w-full bg-primary hover:bg-primary/90">
            {message.cta}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          {message.secondaryCta && (
            <Button onClick={onSecondaryAction} variant="outline" className="w-full">
              {message.secondaryCta}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
