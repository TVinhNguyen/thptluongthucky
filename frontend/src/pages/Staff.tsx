import { useMemo, useEffect, useState } from "react";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStaff, useDepartments } from "@/hooks/useApi";
import { getMediaUrl } from "@/lib/api";
import { useLocation } from "react-router-dom";
import { SEO } from "@/components/SEO";

const normalizeSlug = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const Staff = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [sidebarFilter, setSidebarFilter] = useState<string | undefined>(undefined);
  const location = useLocation();
  
  const { data: departments, isLoading: loadingDepartments } = useDepartments();
  const { data: staffList, isLoading: loadingStaff } = useStaff({
    department: selectedDepartment !== "all" ? parseInt(selectedDepartment) : undefined,
    search: searchTerm || undefined,
    filter: sidebarFilter,
  });

  const filterParam = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("filter");
  }, [location.search]);

  useEffect(() => {
    if (!filterParam) {
      setSidebarFilter(undefined);
      return;
    }
    if (!departments?.length) return;

    const matched = departments.find(
      (dept) => normalizeSlug(dept.name) === normalizeSlug(filterParam)
    );

    if (matched) {
      setSelectedDepartment(matched.id.toString());
      setSidebarFilter(undefined);
    } else {
      setSelectedDepartment("all");
      setSidebarFilter(normalizeSlug(filterParam));
    }
  }, [filterParam, departments]);

  const filteredStaff = staffList?.filter(staff => 
    staff.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Cán bộ - Giáo viên"
        description="Danh sách cán bộ, giáo viên Trường THPT Lương Thúc Kỳ."
        url="/can-bo-giao-vien"
      />
      <Header />
      <Navigation />

      <div className="flex-1 bg-background">
        <div className="container mx-auto px-4 py-8">
          <Breadcrumb
            items={[
              { label: "Cán bộ - Giáo viên" },
            ]}
          />
          
          <h1 className="text-3xl font-bold text-foreground mb-6 animate-fade-in">
            Đội ngũ Cán bộ - Giáo viên
          </h1>
          
          {/* Search and Filter */}
          <Card className="bg-card shadow-card p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Tìm kiếm theo tên..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <Select 
                value={selectedDepartment} 
                onValueChange={setSelectedDepartment}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Lọc theo phòng ban" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  {!loadingDepartments && departments?.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id.toString()}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </Card>

          {/* Staff Grid */}
          {loadingStaff ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="bg-card shadow-card p-6">
                  <div className="flex flex-col items-center">
                    <Skeleton className="w-24 h-24 rounded-full mb-4" />
                    <Skeleton className="h-6 w-32 mb-2" />
                    <Skeleton className="h-4 w-24 mb-4" />
                    <Skeleton className="h-px w-full my-3" />
                    <div className="space-y-2 w-full">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : filteredStaff && filteredStaff.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStaff.map((staff) => (
                <Card 
                  key={staff.id} 
                  className="bg-card shadow-card hover:shadow-card-hover transition-all hover-scale p-6 animate-fade-in"
                >
                  <div className="flex flex-col items-center text-center">
                    <Avatar className="w-24 h-24 mb-4">
                      <AvatarImage src={staff.avatar ? getMediaUrl(staff.avatar) : undefined} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                        {staff.full_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      {staff.full_name}
                    </h3>
                    
                    <p className="text-primary font-medium mb-1">
                      {staff.position}
                    </p>
                    
                    <div className="w-full border-t border-border my-3"></div>
                    
                    <div className="text-sm text-muted-foreground space-y-1 w-full">
                      {staff.department_name && (
                        <p className="flex items-center justify-center gap-2">
                          <span className="font-medium">Phòng ban:</span> {staff.department_name}
                        </p>
                      )}
                      {staff.phone && <p>📞 {staff.phone}</p>}
                      {staff.email && <p>✉️ {staff.email}</p>}
                    </div>
                    
                    {staff.bio && (
                      <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                        {staff.bio}
                      </p>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Không tìm thấy cán bộ, giáo viên nào</p>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Staff;
