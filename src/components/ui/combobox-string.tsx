// src/components/ui/combobox-string.tsx

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
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
import { Label } from "@/components/ui/label";

interface ComboboxStringProps {
  options: { value: string; label: string }[];
  value: string | null | undefined;
  onValueChange: (value: string | null) => void; // Explicitly allow null
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export const ComboboxString: React.FC<ComboboxStringProps> = ({
  options,
  value,
  onValueChange,
  placeholder = "Sélectionnez...",
  label,
  disabled = false,
  className,
}) => {
  const [open, setOpen] = React.useState(false);

  // Find the selected label based on the 'value' (string code)
  const selectedLabel = options.find((option) => option.value === value)?.label;

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
                {options.some(opt => opt.value === null) || (options.length > 0 && !value && placeholder === "Sélectionnez...") ? (
                  <CommandItem
                    value="aucun-string-value" // A unique value for "none" in string context for Command's internal search
                    onSelect={() => {
                      onValueChange(null); // Pass null when "Aucun" is selected
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
                    key={option.value} // Use 'value' as key
                    value={option.label} // Use label for search matching
                    onSelect={() => {
                      onValueChange(option.value); // Pass the string 'value' back
                      setOpen(false);
                    }}
                  >
                    {option.label}
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        value === option.value ? "opacity-100" : "opacity-0"
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