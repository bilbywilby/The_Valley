import React, { useMemo } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CheckCircle2, XCircle, HelpCircle, Loader2 } from 'lucide-react';
import { useHealthStore } from '@/stores/useHealthStore';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
interface HealthStatusIconProps {
  url: string;
}
const statusConfig = {
  ok: { Icon: CheckCircle2, color: 'text-emerald-500', label: 'Healthy' },
  error: { Icon: XCircle, color: 'text-red-500', label: 'Feed Error' },
  loading: { Icon: Loader2, color: 'text-amber-500', label: 'Checking...' },
  unknown: { Icon: HelpCircle, color: 'text-muted-foreground', label: 'Unknown Status' },
};
const CACHE_DURATION = 60 * 60 * 1000;
export function HealthStatusIcon({ url }: HealthStatusIconProps) {
  const statuses = useHealthStore((s) => s.statuses) ?? {};
  const entry = statuses[url];
  const status = !entry
    ? 'unknown'
    : Date.now() - entry.timestamp > CACHE_DURATION
    ? 'unknown'
    : entry.status;
  const { Icon, color, label } = statusConfig[status];
  const lastChecked = useMemo(() => {
    return entry?.timestamp ? `Last checked: ${formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true })}` : '';
  }, [entry]);
  const isClickable = status === 'unknown';
  const handleInfoClick = (e: React.MouseEvent | React.KeyboardEvent) => {
    if (isClickable) {
      e.stopPropagation();
      toast.info("Enable Feed Health Checks in Settings", {
        description: "Opt-in to check if feed URLs are active. This sends URLs to a privacy-respecting Cloudflare Worker.",
        action: {
          label: "Settings",
          onClick: () => {
            // This is a bit of a hack, but a simple way to trigger the sheet
            // A more robust solution might use a global event bus or Zustand state
            const settingsButton = document.querySelector('[aria-label="Privacy settings"]') as HTMLElement;
            settingsButton?.click();
          },
        },
      });
    }
  };
  return (
    <TooltipProvider delayDuration={500}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              'flex-shrink-0 transition-transform duration-200',
              isClickable && 'cursor-pointer hover:scale-110'
            )}
            aria-label={`Feed status: ${label}${isClickable ? ' (click for info)' : ''}`}
            onClick={handleInfoClick}
            onKeyDown={(e) => {
              if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                handleInfoClick(e);
              }
            }}
            role={isClickable ? 'button' : undefined}
            tabIndex={isClickable ? 0 : -1}
          >
            <Icon className={cn('h-4 w-4', color, status === 'loading' && 'animate-spin')} />
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-center">
            {label}
            {lastChecked && <br />}
            {lastChecked && <span className="text-xs text-muted-foreground">{lastChecked}</span>}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}