import { CopyIcon, ExternalLinkIcon, UnlinkIcon } from "lucide-react";
import * as React from "react";

import { Separator } from "@/components/ui/separator";

import { ToolbarButton } from "../toolbar-button";

interface LinkPopoverBlockProps {
  url: string;
  onClear: () => void;
  onEdit: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export const LinkPopoverBlock: React.FC<LinkPopoverBlockProps> = ({ url, onClear, onEdit }) => {
  const [copyTitle, setCopyTitle] = React.useState<string>("Copiar");

  const handleCopy = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      navigator.clipboard
        .writeText(url)
        .then(() => {
          setCopyTitle("Copiado!");
          setTimeout(() => setCopyTitle("Copiar"), 1000);
        })
        .catch(console.error);
    },
    [url],
  );

  const handleOpenLink = React.useCallback(() => {
    window.open(url, "_blank", "noopener,noreferrer");
  }, [url]);

  return (
    <div className="flex h-10 overflow-hidden rounded bg-background p-2 shadow-lg">
      <div className="inline-flex items-center gap-1">
        <ToolbarButton tooltip="Editar link" onClick={onEdit} className="w-auto px-2">
          Editar link
        </ToolbarButton>
        <Separator orientation="vertical" />
        <ToolbarButton tooltip="Abrir link em nova aba" onClick={handleOpenLink}>
          <ExternalLinkIcon className="size-4" />
        </ToolbarButton>
        <Separator orientation="vertical" />
        <ToolbarButton tooltip="Remover link" onClick={onClear}>
          <UnlinkIcon className="size-4" />
        </ToolbarButton>
        <Separator orientation="vertical" />
        <ToolbarButton
          tooltip={copyTitle}
          onClick={handleCopy}
          tooltipOptions={{
            onPointerDownOutside: (e) => {
              if (e.target === e.currentTarget) e.preventDefault();
            },
          }}
        >
          <CopyIcon className="size-4" />
        </ToolbarButton>
      </div>
    </div>
  );
};
