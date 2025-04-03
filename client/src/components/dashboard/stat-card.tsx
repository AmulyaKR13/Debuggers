import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  iconColor: string;
  trend?: number;
  trendLabel?: string;
  className?: string;
}

export default function StatCard({
  title,
  value,
  icon,
  iconColor,
  trend,
  trendLabel,
  className
}: StatCardProps) {
  const getTrendIcon = () => {
    if (trend === undefined) return null;
    if (trend > 0) return "arrow_upward";
    if (trend < 0) return "arrow_downward";
    return "remove";
  };
  
  const getTrendColor = () => {
    if (trend === undefined) return "";
    if (trend > 0) return "text-green-500";
    if (trend < 0) return "text-red-500";
    return "text-amber-500";
  };

  return (
    <div className={cn("bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-100 dark:border-gray-700", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
        <span className={`material-icons ${iconColor}`}>{icon}</span>
      </div>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
      {trend !== undefined && (
        <div className="mt-2 flex items-center text-sm">
          <span className={`${getTrendColor()} flex items-center`}>
            <span className="material-icons text-sm">{getTrendIcon()}</span> {Math.abs(trend)}%
          </span>
          {trendLabel && <span className="text-gray-600 dark:text-gray-400 ml-2">{trendLabel}</span>}
        </div>
      )}
    </div>
  );
}
