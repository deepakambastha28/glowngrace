import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const Stepper = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center", className)} {...props} />
));
Stepper.displayName = "Stepper";

const StepperItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    label: string;
    step: number;
    completed?: boolean;
    active?: boolean;
    "data-last"?: boolean;
  }
>(({ className, label, step, completed, active, ...props }, ref) => {
  const isLast = props["data-last"];
  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-1 items-center",
        isLast && "last:flex-none",
        className
      )}
      {...props}
    >
      <div className="flex flex-col items-center">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all",
            completed && "border-emerald bg-emerald text-white",
            active && "border-rose bg-rose text-white shadow-rose",
            !completed && !active && "border-rose/20 bg-white text-charcoal/40"
          )}
        >
          {completed ? <Check className="h-5 w-5" /> : step}
        </div>
        <span
          className={cn(
            "mt-1 text-xs font-medium hidden sm:block",
            active && "text-rose",
            completed && "text-emerald",
            !completed && !active && "text-charcoal/40"
          )}
        >
          {label}
        </span>
      </div>
      {!isLast && (
        <div
          className={cn(
            "h-0.5 flex-1 mx-2 mt-1 rounded-full",
            completed ? "bg-emerald" : "bg-rose/15"
          )}
        />
      )}
    </div>
  );
});
StepperItem.displayName = "StepperItem";

export { Stepper, StepperItem };
