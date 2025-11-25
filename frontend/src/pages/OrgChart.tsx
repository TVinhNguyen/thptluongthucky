import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const OrgChart = () => {
  const leadership = [
    {
      name: "Nguyễn Văn A",
      position: "Hiệu trưởng",
      phone: "0123.456.789",
      email: "hieutruong@truong.edu.vn",
    },
  ];

  const viceLeadership = [
    {
      name: "Trần Thị B",
      position: "Phó Hiệu trưởng",
      phone: "0123.456.788",
      email: "pho1@truong.edu.vn",
    },
    {
      name: "Lê Văn C",
      position: "Phó Hiệu trưởng",
      phone: "0123.456.787",
      email: "pho2@truong.edu.vn",
    },
  ];

  const departments = [
    {
      name: "Phòng Hành chính - Tổng hợp",
      head: "Phạm Văn D",
      members: ["Nguyễn Thị E", "Trần Văn F"],
    },
    {
      name: "Phòng Giáo vụ",
      head: "Hoàng Thị G",
      members: ["Vũ Văn H", "Đặng Thị I", "Lý Văn K"],
    },
    {
      name: "Tổ Văn - Sử - Địa",
      head: "Mai Văn L",
      members: ["Bùi Thị M", "Đinh Văn N", "Trương Thị O"],
    },
    {
      name: "Tổ Toán - Lý - Hóa",
      head: "Ngô Văn P",
      members: ["Phan Thị Q", "Võ Văn R", "Lâm Thị S"],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
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
              <Card className="bg-card shadow-card hover:shadow-card-hover transition-all hover-scale p-6 w-full max-w-md animate-fade-in">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="w-24 h-24 mb-4">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                      {leadership[0].name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-xl font-semibold text-foreground">{leadership[0].name}</h3>
                  <p className="text-primary font-medium mb-3">{leadership[0].position}</p>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>📞 {leadership[0].phone}</p>
                    <p>✉️ {leadership[0].email}</p>
                  </div>
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {viceLeadership.map((person, index) => (
                <Card key={index} className="bg-card shadow-card hover:shadow-card-hover transition-all hover-scale p-6 animate-fade-in">
                  <div className="flex flex-col items-center text-center">
                    <Avatar className="w-20 h-20 mb-3">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                        {person.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="text-lg font-semibold text-foreground">{person.name}</h3>
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
              {departments.map((dept, index) => (
                <Card key={index} className="bg-card shadow-card hover:shadow-card-hover transition-all hover-scale overflow-hidden animate-fade-in">
                  <div className="bg-primary text-primary-foreground px-4 py-3 font-semibold">
                    {dept.name}
                  </div>
                  <div className="p-4">
                    <div className="mb-3">
                      <p className="text-sm text-muted-foreground">Trưởng phòng/Tổ trưởng</p>
                      <p className="font-semibold text-foreground">{dept.head}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Thành viên</p>
                      <ul className="space-y-1">
                        {dept.members.map((member, idx) => (
                          <li key={idx} className="text-foreground text-sm">• {member}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>
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
