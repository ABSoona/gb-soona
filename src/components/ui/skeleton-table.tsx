import { Skeleton } from "@/components/ui/skeleton";

type TableSkeletonProps = {
  rows?: number;
  columns?: number;
};

export function TableSkeleton({ rows = 3, columns = 4 }: TableSkeletonProps) {
  // Définir dynamiquement la largeur en fonction du nombre de colonnes
  const columnWidthClass = () => {
    if (columns >= 6) return "w-full";
    if (columns === 5) return "w-60";
    if (columns === 4) return "w-80";
    if (columns === 3) return "w-100";
    return "w-150";
  };

  const widthClass = columnWidthClass();

  return (
    <div className="space-y-3">
      {/* Ligne des en-têtes de colonnes (plus haute) */}
      <div className="flex items-center gap-4">
        {[...Array(columns)].map((_, index) => (
          <Skeleton
            key={`header-${index}`}
            className={`h-8 ${widthClass} rounded-md`}
          />
        ))}
      </div>

      {/* Lignes de contenu */}
      {[...Array(rows)].map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="flex items-center gap-4">
          {[...Array(columns)].map((_, colIndex) => (
            <Skeleton
              key={`cell-${rowIndex}-${colIndex}`}
              className={`h-4 ${widthClass}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
