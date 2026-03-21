import { Card } from "@/components/ui/card";
import { useDepartmentStaff } from "@/hooks/useApi";
import { Staff } from "@/lib/api";

interface DepartmentCardProps {
  dept: {
    id: number;
    name: string;
    head?: string;
    leader_name?: string;
  };
}

const DepartmentCard = ({ dept }: DepartmentCardProps) => {
  const { data: staff = [], isLoading } = useDepartmentStaff(dept.id);

  return (
    <Card className="bg-card hover:shadow-card-hover transition-all hover-scale overflow-hidden animate-fade-in shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
      <div className="bg-primary text-primary-foreground px-4 py-3 font-semibold">
        {dept.name}
      </div>

      <div className="p-4">
        <div className="mb-3">
          <p className="text-sm text-muted-foreground">
            Trưởng phòng / Tổ trưởng
          </p>
          <p className="font-semibold text-foreground">
            {dept.leader_name || "-"}
          </p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground mb-2">Thành viên</p>

          {isLoading ? (
            <p className="text-sm text-muted-foreground">Đang tải...</p>
          ) : (
            <ul className="space-y-1">
              {staff.map((m: Staff, idx: number) => (
                <li key={m.id ?? idx} className="text-foreground text-sm">
                    • {m.full_name || 'Unnamed Staff'}
                </li>
            ))}
            </ul>
          )}
        </div>
      </div>
    </Card>
  );
};

export default DepartmentCard;
