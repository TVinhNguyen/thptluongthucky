import { useMemo } from 'react';
import { TimetableCell } from './TimetableCell';
import type { TimetableEntry } from '@/hooks/useTimetable';

interface TimetableGridProps {
  entries: TimetableEntry[];
  loading?: boolean;
}

const DAYS_OF_WEEK = [
  { value: 2, label: 'Thứ 2' },
  { value: 3, label: 'Thứ 3' },
  { value: 4, label: 'Thứ 4' },
  { value: 5, label: 'Thứ 5' },
  { value: 6, label: 'Thứ 6' },
  { value: 7, label: 'Thứ 7' },
  { value: 8, label: 'Chủ nhật' },
];

const MORNING_PERIODS = [1, 2, 3, 4, 5];
const AFTERNOON_PERIODS = [6, 7, 8, 9, 10];

const PERIOD_TIMES: Record<number, string> = {
  1: '07:00',
  2: '07:50',
  3: '08:45',
  4: '09:50',
  5: '10:40',
  6: '13:30',
  7: '14:20',
  8: '15:15',
  9: '16:20',
  10: '17:10',
};

export function TimetableGrid({ entries, loading = false }: TimetableGridProps) {
  // Create lookup map for entries
  const entryMap = useMemo(() => {
    const map = new Map<string, TimetableEntry>();
    entries.forEach(entry => {
      const key = `${entry.day_of_week}-${entry.period}`;
      map.set(key, entry);
    });
    return map;
  }, [entries]);

  const getEntry = (dayOfWeek: number, period: number): TimetableEntry | undefined => {
    return entryMap.get(`${dayOfWeek}-${period}`);
  };

  const getPeriodTime = (period: number): string => {
    return PERIOD_TIMES[period] || '';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 border rounded-lg bg-card">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!entries || entries.length === 0) {
    return (
      <div className="border rounded-lg bg-card p-8 text-center text-muted-foreground">
        Chưa có dữ liệu thời khóa biểu. Vui lòng chọn lớp học.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border rounded-lg bg-card shadow-sm">
      <table className="w-full border-collapse min-w-[800px]">
        <thead>
          <tr className="bg-muted/50">
            <th className="border-b border-r p-3 text-left text-sm font-medium text-muted-foreground w-[100px]">
              Buổi
            </th>
            <th className="border-b border-r p-3 text-left text-sm font-medium text-muted-foreground w-[80px]">
              Tiết
            </th>
            {DAYS_OF_WEEK.map(day => (
              <th
                key={day.value}
                className="border-b border-r p-3 text-center text-sm font-medium text-muted-foreground min-w-[120px]"
              >
                {day.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Morning Session */}
          {MORNING_PERIODS.map((period, index) => (
            <tr key={`morning-${period}`} className="hover:bg-muted/30">
              {index === 0 && (
                <td
                  rowSpan={MORNING_PERIODS.length}
                  className="border-b border-r p-3 text-sm font-medium text-foreground bg-muted/30 align-middle text-center"
                >
                  Sáng
                </td>
              )}
              <td className="border-b border-r p-2 text-center">
                <div className="text-sm font-medium text-foreground">Tiết {period}</div>
                <div className="text-xs text-muted-foreground">
                  {getPeriodTime(period)}
                </div>
              </td>
              {DAYS_OF_WEEK.map(day => (
                <td
                  key={`${period}-${day.value}`}
                  className="border-b border-r p-1"
                >
                  <TimetableCell entry={getEntry(day.value, period)} />
                </td>
              ))}
            </tr>
          ))}

          {/* Afternoon Session */}
          {AFTERNOON_PERIODS.map((period, index) => (
            <tr key={`afternoon-${period}`} className="hover:bg-muted/30">
              {index === 0 && (
                <td
                  rowSpan={AFTERNOON_PERIODS.length}
                  className="border-b border-r p-3 text-sm font-medium text-foreground bg-muted/30 align-middle text-center"
                >
                  Chiều
                </td>
              )}
              <td className="border-b border-r p-2 text-center">
                <div className="text-sm font-medium text-foreground">Tiết {period}</div>
                <div className="text-xs text-muted-foreground">
                  {getPeriodTime(period)}
                </div>
              </td>
              {DAYS_OF_WEEK.map(day => (
                <td
                  key={`${period}-${day.value}`}
                  className="border-b border-r p-1"
                >
                  <TimetableCell entry={getEntry(day.value, period)} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
