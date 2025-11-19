"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type RangeKey = "7d" | "31d" | "lifetime";

const RANGE_OPTIONS: { label: string; value: RangeKey }[] = [
  { label: "Last 7 Days", value: "7d" },
  { label: "Last 31 Days", value: "31d" },
  { label: "Lifetime", value: "lifetime" },
];

interface DashboardRangePickerProps {
  currentRange: RangeKey;
}

export function DashboardRangePicker({ currentRange }: DashboardRangePickerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleChange = (nextValue: RangeKey) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams ?? undefined);
      if (nextValue === "7d") {
        params.delete("range");
      } else {
        params.set("range", nextValue);
      }

      const queryString = params.toString();
      const nextUrl = queryString ? `${pathname}?${queryString}` : pathname;
      router.replace(nextUrl, { scroll: false });
    });
  };

  return (
    <Select value={currentRange} onValueChange={handleChange} disabled={isPending}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select range" />
      </SelectTrigger>
      <SelectContent>
        {RANGE_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}


