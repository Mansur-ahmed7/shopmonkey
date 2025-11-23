import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { AnimatedLoader } from '@/components/ui/animated-loader';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export function TableSkeleton({ rows = 5, columns = 5 }: TableSkeletonProps) {
  return (
    <div className="flex items-center justify-center py-12">
      <AnimatedLoader />
    </div>
  );
}
