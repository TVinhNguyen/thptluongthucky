import type { TimetableEntry } from '@/hooks/useTimetable';

interface TimetableCellProps {
  entry?: TimetableEntry;
}

export function TimetableCell({ entry }: TimetableCellProps) {
  if (!entry) {
    return <div className="h-full min-h-[60px]" />;
  }

  return (
    <div className="h-full min-h-[60px] p-2 border-l-4 rounded-r transition-colors border-l-primary bg-primary/5 hover:bg-primary/10">
      <div className="font-medium text-sm text-foreground">
        {entry.subject_name}
      </div>
      <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
        {entry.teacher_name && <div>GV: {entry.teacher_name}</div>}
        {entry.room && <div>Phòng: {entry.room}</div>}
      </div>
    </div>
  );
}
