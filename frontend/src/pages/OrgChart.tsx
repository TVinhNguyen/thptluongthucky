import { useState } from "react";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getMediaUrl, type Department, type Staff } from "@/lib/api";
import { useDepartments, useDepartmentStaff, useStaff } from "@/hooks/useApi";
import DepartmentCard from "./DepartmentCard";
import { SEO } from "@/components/SEO";

const OrgChart = () => {
  const POSITION_PRINCIPAL = 'Hiệu trưởng';
  const POSITION_VICE_PRINCIPAL = 'Phó hiệu trưởng';

  const { data: principalList = [] } = useStaff({ position: POSITION_PRINCIPAL });
  const leadership = principalList[0];

  const { data: viceLeadership = [], isLoading: viceLoading } = useStaff({
    position: POSITION_VICE_PRINCIPAL,
  });

  const { data: departments = [], isLoading: loadingDepartments } = useDepartments();
  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Cơ cấu tổ chức"
        description="Cơ cấu tổ chức Trường THPT Lương Thúc Kỳ - Ban giám hiệu, các phòng ban và tổ chuyên môn."
        url="/co-cau-to-chuc"
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
          
          {/* Ban Giám hiệu */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Ban Giám hiệu</h2>
            
            <div className="flex justify-center mb-6">
              <Card className="bg-card hover:shadow-card-hover transition-all hover-scale p-6 w-full max-w-md animate-fade-in shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="w-24 h-24 mb-4">
                    <AvatarImage src={leadership?.avatar ? getMediaUrl(leadership.avatar) : undefined} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                      {(leadership?.full_name || 'Unnamed Staff').charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-xl font-semibold text-foreground">{leadership?.full_name || 'Unnamed Staff'}</h3>
                  <p className="text-primary font-medium mb-3">{leadership?.position || 'Position not specified'}</p>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>📞 {leadership?.phone}</p>
                    <p>✉️ {leadership?.email}</p>
                  </div>
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      <p>📞 {person.phone}</p>
                      <p>✉️ {person.email}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          {/* Các phòng ban & tổ chuyên môn */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Các phòng ban & Tổ chuyên môn</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {departments.map((dept: Department) => (
                <DepartmentCard key={dept.id} dept={dept} />
              ))}
            </div>
          </section>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default OrgChart;
