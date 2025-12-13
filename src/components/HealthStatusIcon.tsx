import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CheckCircle2, XCircle, HelpCircle, Loader2 } from 'lucide-react';
import { useHealthStore } from '@/stores/useHealthStore';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
interface HealthStatusIconProps {
  url: string;
}
const statusConfig = {
  ok: { Icon: CheckCircle2, color: 'text-emerald-500', label: 'Healthy' },
  error: { Icon: XCircle, color: 'text-red-500', label: 'Feed Error' },
  loading: { Icon: Loader2, color: 'text-amber-500', label: 'Checking...' },
  unknown: { Icon: HelpCircle, color: 'text-muted-foreground', label: 'Unknown Status' },
};
export function HealthStatusIcon({ url }: HealthStatusIconProps) {
  const status = useHealthStore((state) => state.getStatus(url));
  const { Icon, color, label } = statusConfig[status];
  const isClickable = status === 'unknown';
  const handleInfoClick = () => {
    if (isClickable) {
      toast.info("LV Intelligence Feed Index: 140+ Categorized RSS/Atom Feeds for the Lehigh Valley Region.");
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
            aria-label={`Feed status: ${label}${isClickable ? ' (click for app info)' : ''}`}
            onClick={handleInfoClick}
            onKeyDown={(e) => {
              if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                handleInfoClick();
              }
            }}
            role={isClickable ? 'button' : undefined}
            tabIndex={isClickable ? 0 : -1}
          >
            <Icon className={cn('h-4 w-4', color, status === 'loading' && 'animate-spin')} />
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}