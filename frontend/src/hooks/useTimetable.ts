import { useState, useEffect, useCallback } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export interface SchoolYear {
  id: number;
  name: string;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
}

export interface SchoolClass {
  id: number;
  name: string;
  grade: number;
  grade_display: string;
}

export interface TimetableEntry {
  id: number;
  school_year: number;
  school_class: number;
  school_class_name?: string;
  day_of_week: number;
  day_of_week_display?: string;
  period: number;
  subject_name: string;
  teacher_name: string;
  room: string;
}

export function useSchoolYears() {
  const [data, setData] = useState<SchoolYear[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSchoolYears = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/school-years/`);
      if (!response.ok) throw new Error('Network response was not ok');
      const result = await response.json();
      setData(result);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Lỗi khi tải danh sách năm học';
      setError(errorMessage);
      // console.error('Error fetching school years:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchoolYears();
  }, [fetchSchoolYears]);

  const activeSchoolYear = data.find(y => y.is_active);

  return { data, loading, error, refetch: fetchSchoolYears, activeSchoolYear };
}

export function useSchoolClasses(grade?: number) {
  const [data, setData] = useState<SchoolClass[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSchoolClasses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = grade ? `${API_BASE_URL}/school-classes/?grade=${grade}` : `${API_BASE_URL}/school-classes/`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Network response was not ok');
      const result = await response.json();
      setData(result);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Lỗi khi tải danh sách lớp học';
      setError(errorMessage);
      // console.error('Error fetching school classes:', e);
    } finally {
      setLoading(false);
    }
  }, [grade]);

  useEffect(() => {
    fetchSchoolClasses();
  }, [fetchSchoolClasses]);

  return { data, loading, error, refetch: fetchSchoolClasses };
}

export function useTimetable() {
  const [data, setData] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchByClass = useCallback(async (classId: number, schoolYearId?: number) => {
    setLoading(true);
    setError(null);
    try {
      const url = schoolYearId 
        ? `${API_BASE_URL}/timetable/by_class/?class_id=${classId}&school_year_id=${schoolYearId}`
        : `${API_BASE_URL}/timetable/by_class/?class_id=${classId}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Network response was not ok');
      const result = await response.json();
      setData(result);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Lỗi khi tải thời khóa biểu';
      setError(errorMessage);
      // console.error('Error fetching timetable:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, fetchByClass };
}
