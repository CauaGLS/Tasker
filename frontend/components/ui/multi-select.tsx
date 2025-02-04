import { PopoverTriggerProps } from "@radix-ui/react-popover";
import { Check, Trash2Icon } from "lucide-react";
import React from "react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandLoading,
  CommandSeparator,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { cn } from "@/lib/utils";

import { Badge } from "./badge";
import { Button } from "./button";

export interface MultiSelectProps<T extends number | string> extends PopoverTriggerProps {
  icon?: React.ReactNode;
  placeholder?: React.ReactNode;
  searchPlaceholder?: string;
  selectedValues: T[];
  options: {
    label: string | React.ReactNode;
    value: T;
    keywords?: string[];
  }[];
  align?: "center" | "end" | "start";
  isLoading?: boolean;
  hideRemoveAll?: boolean;
  onSelectChange: (value: T[]) => void;
  onSelectAll?: () => void;
}

const MultiSelect = <T extends number | string>({
  placeholder = "Escolha uma opção",
  searchPlaceholder = "Buscar",
  options,
  selectedValues = [],
  onSelectChange,
  onSelectAll,
  hideRemoveAll,
  isLoading,
  className,
  align,
  icon: Icon,
  ...props
}: MultiSelectProps<T>) => {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen} modal>
      <PopoverTrigger asChild {...props}>
        <Button
          variant={"outline"}
          className={cn(
            "justify-start text-left font-normal",
            selectedValues.length == 0 && "text-muted-foreground",
            className,
          )}
        >
          {Icon}
          {selectedValues.length == 0 && <span className="truncate">{placeholder}</span>}
          {selectedValues.length == 1 && (
            <span className="truncate">{options.find((o) => o.value === selectedValues[0])?.label}</span>
          )}
          {selectedValues.length > 1 && (
            <span className="hidden truncate md:block">{selectedValues.length} selecionados</span>
          )}
          {selectedValues.length > 1 && (
            <Badge variant="secondary" className="md:hidden">
              {selectedValues.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0" align={align}>
        <Command loop>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            {!isLoading && <CommandEmpty>Nenhum encontrado</CommandEmpty>}
            {isLoading && (
              <CommandLoading>
                <p className="text-sm text-muted-foreground">Carregando</p>
              </CommandLoading>
            )}
            {onSelectAll && options.length != selectedValues?.length && (
              <>
                <CommandGroup>
                  <CommandItem onSelect={onSelectAll} className="justify-center text-center">
                    Selecionar tudo
                  </CommandItem>
                </CommandGroup>
              </>
            )}
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selectedValues.includes(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    value={option.value.toString()}
                    keywords={[
                      ...(option.keywords ?? []),
                      typeof option.label === "string" ? option.label : "",
                    ]}
                    onSelect={(e) => {
                      onSelectChange(
                        isSelected
                          ? selectedValues.filter((v) => v !== option.value)
                          : [...selectedValues, option.value],
                      );
                    }}
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        isSelected ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible",
                      )}
                    >
                      <Check className={cn("h-4 w-4")} />
                    </div>
                    <span className="truncate">{option.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
          {selectedValues.length > 0 && !hideRemoveAll && (
            <>
              <CommandSeparator />
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    onSelectChange([]);
                    setOpen(false);
                  }}
                  className="justify-center text-center"
                >
                  <Trash2Icon className="mr-2 size-3.5" />
                  Remover todos
                </CommandItem>
              </CommandGroup>
            </>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export { MultiSelect };
