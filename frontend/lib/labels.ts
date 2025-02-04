import { TaskStatus } from "@/services";

import { BadgeProps } from "@/components/ui/badge";

export const STATUS: {
  value: TaskStatus;
  label: string;
  variant?: BadgeProps["variant"];
}[] = [
  { value: TaskStatus.PENDING, label: "Pendente", variant: "secondary" },
  {
    value: TaskStatus.IN_PROGRESS,
    label: "Em andamento",
    variant: "secondary",
  },
  { value: TaskStatus.DONE, label: "Concluído", variant: "secondary" },
];

export const STATUS_MAP = Object.fromEntries(
  STATUS.map((status) => [status.value, { label: status.label, variant: status.variant }]),
) as {
  [key in TaskStatus]: { label: string; variant?: BadgeProps["variant"] };
};
