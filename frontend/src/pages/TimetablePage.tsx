import { useState, useEffect, useCallback, useMemo } from 'react';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Breadcrumb from '@/components/Breadcrumb';
import { TimetableFilters } from '@/components/timetable/TimetableFilters';
import { TimetableGrid } from '@/components/timetable/TimetableGrid';
import { useSchoolYears, useSchoolClasses, useTimetable } from '@/hooks/useTimetable';
import { SEO, breadcrumbSchema } from '@/components/SEO';

export default function TimetablePage() {
  const { data: schoolYears, loading: yearsLoading } = useSchoolYears();
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const { data: schoolClasses, loading: classesLoading } = useSchoolClasses(
    selectedGrade !== 'all' ? parseInt(selectedGrade) : undefined
  );
  const { data: timetableEntries, loading: timetableLoading, fetchByClass } = useTimetable();

  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('');

  const selectedClassData = useMemo(() =>
    schoolClasses.find(c => c.id === parseInt(selectedClass))
  , [schoolClasses, selectedClass]);

  const selectedYearData = useMemo(() =>
    schoolYears.find(y => y.id === parseInt(selectedYear))
  , [schoolYears, selectedYear]);

  const handleFiltersChange = useCallback(async (filters: { 
    gradeId?: string; 
    classId?: number; 
    schoolYearId?: number 
  }) => {
    if (filters.classId) {
      await fetchByClass(filters.classId, filters.schoolYearId);
    }
  }, [fetchByClass]);

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Thời khóa biểu"
        description="Thời khóa biểu chi tiết các lớp học Trường THPT Lương Thúc Kỳ - Lịch học theo năm học và khối lớp."
        url="/chuyen-muc/thoi-khoa-bieu"
        canonical="/chuyen-muc/thoi-khoa-bieu"
        keywords={["thời khóa biểu", "lịch học", "lịch biểu", "năm học"]}
        jsonLd={breadcrumbSchema([{ label: "Thời khóa biểu", href: "/chuyen-muc/thoi-khoa-bieu" }])}
      />
      <Header />
      <Navigation />
      
      <main className="flex-1 container mx-auto py-8 px-4">
        <Breadcrumb items={[{ label: 'Thời khóa biểu' }]} />

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Thời Khóa Biểu</h1>
          <p className="text-muted-foreground">
            Xem thời khóa biểu theo lớp học và năm học
          </p>
        </div>

        {/* Filters */}
        <TimetableFilters
          schoolYears={schoolYears}
          schoolClasses={schoolClasses}
          onFiltersChange={handleFiltersChange}
          selectedGrade={selectedGrade}
          setSelectedGrade={setSelectedGrade}
          selectedClass={selectedClass}
          setSelectedClass={setSelectedClass}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
        />

        {/* Selected Class Info */}
        {selectedClassData && (
          <div className="mb-4 p-4 bg-primary/10 rounded-lg border border-primary/20">
            <h2 className="text-xl font-semibold text-foreground">
              Thời khóa biểu lớp {selectedClassData.name}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Năm học: {selectedYearData?.name || 'N/A'}
            </p>
          </div>
        )}

        {/* Timetable Grid */}
        <TimetableGrid 
          entries={timetableEntries} 
          loading={timetableLoading} 
        />

        {/* No class selected message */}
        {!selectedClass || selectedClass === 'all' ? (
          <div className="mt-6 p-8 bg-muted/30 rounded-lg text-center">
            <p className="text-muted-foreground">
              Vui lòng chọn khối lớp và lớp học để xem thời khóa biểu
            </p>
          </div>
        ) : null}
      </main>

      <Footer />
    </div>
  );
}
