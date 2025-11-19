"use client";

import * as React from "react";
import { ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Option {
  value: string;
  label: string;
}

interface MultiSelectDropdownProps {
  options: readonly Option[] | Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function MultiSelectDropdown({
  options,
  selected,
  onChange,
  placeholder = "Select options...",
  disabled = false,
}: MultiSelectDropdownProps) {
  
  const handleSelect = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((item) => item !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const selectedLabels = selected
    .map((val) => options.find((opt) => opt.value === val)?.label)
    .filter(Boolean);

  const labelText =
    selectedLabels.length > 0
      ? selectedLabels.join(", ")
      : placeholder;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className={cn(
            "w-full justify-between font-normal",
            selected.length === 0 && "text-muted-foreground"
          )}
          disabled={disabled}
        >
          <span className="truncate">{labelText}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-full min-w-[200px]" align="start">
        {options.map((option) => (
          <DropdownMenuCheckboxItem
            key={option.value}
            checked={selected.includes(option.value)}
            onCheckedChange={() => handleSelect(option.value)}
          >
            {option.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

