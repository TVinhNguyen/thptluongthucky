import { useState } from "react";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { getMediaUrl, type Department, type Staff } from "@/lib/api";
import { useDepartments, useDepartmentStaff, useStaff } from "@/hooks/useApi";
import DepartmentCard from "./DepartmentCard";
import { SEO, breadcrumbSchema } from "@/components/SEO";

const LeadershipSkeleton = () => (
  <Card className="bg-card p-6 w-full max-w-md shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
    <div className="flex flex-col items-center text-center">
      <Skeleton className="w-24 h-24 rounded-full mb-4" />
      <Skeleton className="h-6 w-40 mb-2" />
      <Skeleton className="h-4 w-32 mb-3" />
      <div className="space-y-2 w-full">
        <Skeleton className="h-4 w-24 mx-auto" />
        <Skeleton className="h-4 w-32 mx-auto" />
      </div>
    </div>
  </Card>
);

const OrgChart = () => {
  const POSITION_PRINCIPAL = 'Hiệu trưởng';
  const POSITION_VICE_PRINCIPAL = 'Phó hiệu trưởng';

  const { data: principalList = [], isLoading: principalLoading } = useStaff({ position: POSITION_PRINCIPAL });
  const leadership = principalList[0];

  const { data: viceLeadership = [], isLoading: viceLoading } = useStaff({
    position: POSITION_VICE_PRINCIPAL,
  });

  const { data: departments = [], isLoading: loadingDepartments } = useDepartments();

  const isLoading = principalLoading || viceLoading || loadingDepartments;

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Cơ cấu tổ chức"
        description="Cơ cấu tổ chức Trường THPT Lương Thúc Kỳ - Ban giám hiệu, phòng ban, tổ chuyên môn và thông tin liên hệ."
        url="/co-cau-to-chuc"
        canonical="/co-cau-to-chuc"
        keywords={["cơ cấu tổ chức", "ban giám hiệu", "phòng ban", "tổ chuyên môn"]}
        jsonLd={breadcrumbSchema([{ label: "Cơ cấu tổ chức", href: "/co-cau-to-chuc" }])}
      />
      <Header />
      <Navigation />

      <div className="flex-1 bg-background">
        <div className="container mx-auto px-4 py-8">
          <Breadcrumb
            items={[
              { label: "Cơ cấu tổ chức" },
            ]}
          />

          <h1 className="text-3xl font-bold text-foreground mb-8 animate-fade-in">Cơ cấu tổ chức</h1>

          {isLoading ? (
            <div className="space-y-8">
              <section>
                <Skeleton className="h-8 w-48 mb-4" />
                <div className="flex justify-center mb-6">
                  <LeadershipSkeleton />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[1, 2].map((i) => (
                    <LeadershipSkeleton key={i} />
                  ))}
                </div>
              </section>
              <section>
                <Skeleton className="h-8 w-72 mb-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="bg-card p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                      <Skeleton className="h-6 w-32 mb-4" />
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-4 w-40 mb-4" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            </div>
          ) : (
            <>
              {/* Ban Giám hiệu */}
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">Ban Giám hiệu</h2>

                <div className="flex justify-center mb-6">
                  {leadership ? (
                    <Card className="bg-card hover:shadow-card-hover transition-all hover-scale p-6 w-full max-w-md animate-fade-in shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                      <div className="flex flex-col items-center text-center">
                        <Avatar className="w-24 h-24 mb-4">
                          <AvatarImage src={leadership.avatar ? getMediaUrl(leadership.avatar) : undefined} />
                          <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                            {leadership.full_name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <h3 className="text-xl font-semibold text-foreground">{leadership.full_name}</h3>
                        <p className="text-primary font-medium mb-3">{leadership.position}</p>
                        <div className="text-sm text-muted-foreground space-y-1">
                          {leadership.phone && <p>📞 {leadership.phone}</p>}
                          {leadership.email && <p>✉️ {leadership.email}</p>}
                        </div>
                      </div>
                    </Card>
                  ) : (
                    <Card className="bg-card p-8 w-full max-w-md text-center shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                      <p className="text-muted-foreground">Chưa có thông tin hiệu trưởng</p>
                    </Card>
                  )}
                </div>

                {viceLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[1, 2].map((i) => (
                      <LeadershipSkeleton key={i} />
                    ))}
                  </div>
                ) : viceLeadership.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {viceLeadership.map((person, index) => (
                      <Card key={index} className="bg-card hover:shadow-card-hover transition-all hover-scale p-6 animate-fade-in shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                        <div className="flex flex-col items-center text-center">
                          <Avatar className="w-20 h-20 mb-3">
                            <AvatarImage src={person.avatar ? getMediaUrl(person.avatar) : undefined} />
                            <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                              {person.full_name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <h3 className="text-lg font-semibold text-foreground">{person.full_name}</h3>
                          <p className="text-primary font-medium mb-2">{person.position}</p>
                          <div className="text-sm text-muted-foreground space-y-1">
                            {person.phone && <p>📞 {person.phone}</p>}
                            {person.email && <p>✉️ {person.email}</p>}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">Chưa có thông tin phó hiệu trưởng</p>
                  </div>
                )}
              </section>

              {/* Các phòng ban & tổ chuyên môn */}
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">Các phòng ban & Tổ chuyên môn</h2>
                {loadingDepartments ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                      <Card key={i} className="bg-card p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                        <Skeleton className="h-6 w-32 mb-4" />
                        <Skeleton className="h-4 w-24 mb-2" />
                        <Skeleton className="h-4 w-40 mb-4" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-3/4" />
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : departments.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {departments.map((dept: Department) => (
                      <DepartmentCard key={dept.id} dept={dept} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Chưa có thông tin phòng ban, tổ chuyên môn</p>
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default OrgChart;
