import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      
      <div className="flex-1 overflow-hidden flex gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-full w-80 rounded-lg bg-slate-100 p-2 space-y-4">
            <div className="flex items-center justify-between p-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-8 rounded-full" />
            </div>
            <div className="space-y-2">
              {[...Array(3)].map((_, j) => (
                <Skeleton key={j} className="h-24 w-full rounded-lg" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

