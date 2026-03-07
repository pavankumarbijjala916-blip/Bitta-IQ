type BatteryStatus = "healthy" | "repairable" | "recyclable";

interface AnimatedBatteryIconProps {
  soh: number;
  status: BatteryStatus;
  size?: "sm" | "md" | "lg" | "xl";
  animate?: boolean;
  className?: string;
}

const cx = (...classes: (string | false | undefined)[]) =>
  classes.filter(Boolean).join(" ");

export const AnimatedBatteryIcon = ({
  soh,
  status,
  size = "md",
  animate = true,
  className,
}: AnimatedBatteryIconProps) => {
  const shouldAnimate = Boolean(animate);

  const sizeClasses: Record<"sm" | "md" | "lg" | "xl", string> = {
    sm: "w-8 h-4",
    md: "w-12 h-6",
    lg: "w-16 h-8",
    xl: "w-24 h-12",
  };

  const tipSizes: Record<"sm" | "md" | "lg" | "xl", string> = {
    sm: "w-1 h-2",
    md: "w-1.5 h-3",
    lg: "w-2 h-4",
    xl: "w-3 h-6",
  };

  // ✅ IMPORTANT FIX
  const statusColors: Record<BatteryStatus, string> = {
    healthy: "bg-green-500",
    repairable: "bg-yellow-500",
    recyclable: "bg-red-500",
  };

  return (
    <div className={cx("flex items-center gap-0.5", className)}>
      <div
        className={cx(
          "relative rounded-sm border-2 border-gray-400 bg-gray-200 overflow-hidden",
          sizeClasses[size],
          shouldAnimate && "transition-all duration-300"
        )}
      >
        <div
          className={cx(
            "absolute inset-0.5 rounded origin-left transition-all duration-1000",
            statusColors[status] // ✅ ERROR FIXED HERE
          )}
          style={{ width: `${soh}%` }}
        >
          {shouldAnimate && status === "healthy" && (
            <div className="absolute inset-0 opacity-30" />
          )}
        </div>

        <div className="absolute inset-0 flex gap-px p-0.5">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex-1 border-r border-gray-300 last:border-r-0"
            />
          ))}
        </div>
      </div>

      <div className={cx("rounded-r-sm bg-gray-400", tipSizes[size])} />
    </div>
  );
};
