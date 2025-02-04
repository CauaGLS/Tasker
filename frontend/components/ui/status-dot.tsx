import { TaskStatus } from "@/services";
import { VariantProps, cva } from "class-variance-authority";

import { STATUS_MAP } from "@/lib/labels";
import { cn } from "@/lib/utils";

const statusDotVariants = cva("flex items-center gap-2", {
  variants: {
    variant: {
      PENDING: "[&>svg]:text-amber-500",
      IN_PROGRESS: "[&>svg]:text-blue-500",
      DONE: "[&>svg]:text-emerald-600",
    },
  },
  defaultVariants: {
    variant: "PENDING",
  },
});

export interface StatusDotProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusDotVariants> {
  variant: TaskStatus;
}

export function StatusDot({ className, variant, ...props }: StatusDotProps) {
  return (
    <div className={cn(statusDotVariants({ variant, className }))} {...props}>
      <svg
        width="8"
        height="8"
        fill="currentColor"
        viewBox="0 0 8 8"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-hidden="true"
      >
        <circle cx="4" cy="4" r="4" />
      </svg>
      <span className="truncate">{STATUS_MAP[variant].label}</span>
    </div>
  );
}
