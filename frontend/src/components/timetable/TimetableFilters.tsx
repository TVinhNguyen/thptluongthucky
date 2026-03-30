import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { SchoolYear, SchoolClass } from '@/hooks/useTimetable';
import { useEffect, useMemo } from 'react';

interface TimetableFiltersProps {
  schoolYears: SchoolYear[];
  schoolClasses: SchoolClass[];
  onFiltersChange: (filters: { gradeId?: string; classId?: number; schoolYearId?: number }) => void;
  selectedGrade: string;
  setSelectedGrade: (value: string) => void;
  selectedClass: string;
  setSelectedClass: (value: string) => void;
  selectedYear: string;
  setSelectedYear: (value: string) => void;
}

export function TimetableFilters({
  schoolYears,
  schoolClasses,
  onFiltersChange,
  selectedGrade,
  setSelectedGrade,
  selectedClass,
  setSelectedClass,
  selectedYear,
  setSelectedYear
}: TimetableFiltersProps) {
  
  // Set default year to active year
  useEffect(() => {
    if (schoolYears.length > 0 && !selectedYear) {
      const activeYear = schoolYears.find(y => y.is_active);
      if (activeYear) {
        setSelectedYear(activeYear.id.toString());
      } else {
        setSelectedYear(schoolYears[0].id.toString());
      }
    }
  }, [schoolYears, selectedYear, setSelectedYear]);

  const filteredClasses = useMemo(() => {
    if (selectedGrade === 'all') return [];
    return schoolClasses.filter(cls => cls.grade === parseInt(selectedGrade));
  }, [selectedGrade, schoolClasses]);

  // Notify parent of filter changes
  useEffect(() => {
    onFiltersChange({
      gradeId: selectedGrade !== 'all' ? selectedGrade : undefined,
      classId: selectedClass !== 'all' ? parseInt(selectedClass) : undefined,
      schoolYearId: selectedYear ? parseInt(selectedYear) : undefined
    });
  }, [selectedGrade, selectedClass, selectedYear, onFiltersChange]);

  // Reset class when grade changes
  useEffect(() => {
    setSelectedClass('all');
  }, [selectedGrade, setSelectedClass]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
      {/* Grade Filter */}
      <Select value={selectedGrade} onValueChange={setSelectedGrade}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Khối lớp" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tất cả khối</SelectItem>
          <SelectItem value="10">Khối 10</SelectItem>
          <SelectItem value="11">Khối 11</SelectItem>
          <SelectItem value="12">Khối 12</SelectItem>
        </SelectContent>
      </Select>

      {/* Class Filter */}
      <Select 
        value={selectedClass} 
        onValueChange={setSelectedClass}
        disabled={!selectedGrade || selectedGrade === 'all'}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Chọn lớp" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tất cả lớp</SelectItem>
          {filteredClasses.map(cls => (
            <SelectItem key={cls.id} value={cls.id.toString()}>
              {cls.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* School Year Filter */}
      <Select value={selectedYear} onValueChange={setSelectedYear}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Năm học" />
        </SelectTrigger>
        <SelectContent>
          {schoolYears.map(year => (
            <SelectItem key={year.id} value={year.id.toString()}>
              {year.name} {year.is_active ? '(Hiện tại)' : ''}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

