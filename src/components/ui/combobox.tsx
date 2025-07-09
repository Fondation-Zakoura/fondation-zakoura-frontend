import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils"; // Assuming you have a utility for class names
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label"; // Assuming Label is used for accessibility

interface ComboboxProps {
  options: { value: string; label: string; id: number }[];
  value: number | null; // The selected ID
  onValueChange: (value: number | null) => void;
  placeholder?: string;
  label?: string; // Label for the combobox
  disabled?: boolean;
  className?: string;
}

export const Combobox: React.FC<ComboboxProps> = ({
  options,
  value,
  onValueChange,
  placeholder = "Sélectionnez...",
  label,
  disabled = false,
  className,
}) => {
  const [open, setOpen] = React.useState(false);
  const selectedLabel = options.find((option) => option.id === value)?.label;

  return (
    <div className={className}>
      {label && <Label className="mb-1 block">{label}</Label>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between truncate"
            disabled={disabled}
          >
            <span className="truncate">
              {selectedLabel || placeholder}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          <Command>
            <CommandInput placeholder="Rechercher..." />
            <CommandList>
              <CommandEmpty>Aucun résultat trouvé.</CommandEmpty>
              <CommandGroup>
                {/* Option for "None" or "Aucun" if the field is nullable */}
                {options.some(opt => opt.id === null) || options.length > 0 && !options.some(opt => opt.id === null) && !value && placeholder === "Sélectionnez..." ? (
                    <CommandItem
                        value="aucun" // A unique value for "none"
                        onSelect={() => {
                            onValueChange(null);
                            setOpen(false);
                        }}
                    >
                        Aucun
                        <Check
                            className={cn(
                                "ml-auto h-4 w-4",
                                value === null ? "opacity-100" : "opacity-0"
                            )}
                        />
                    </CommandItem>
                ) : null}

                {options.map((option) => (
                  <CommandItem
                    key={option.id}
                    value={option.label} // Use label for search matching
                    onSelect={() => {
                      onValueChange(option.id);
                      setOpen(false);
                    }}
                  >
                    {option.label}
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        value === option.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

