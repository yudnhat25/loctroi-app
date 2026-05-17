// Nhân sự Lộc Trời — sau refactor V3 còn 3 sub-role chính:
//   • manager       — kiêm Procurement (thu mua) + Buyer Sales (bán cho buyer xuất khẩu)
//   • fieldOfficer  — kiêm Drone Operator (1 chuyến xuống = bay drone + tick SRP)
//   • driver        — giao vật tư, ký số
// Role droneOperator & procurement cũ đã GỘP vào 2 role trên để giảm chi phí nhân sự và
// rút ngắn handoff trong luồng end-to-end.

export const LT_SUBROLES = {
  manager: {
    code: "manager",
    label: "Quản lý cấp Vùng",
    icon: "👔",
    desc: "Duyệt yêu cầu vật tư, điều phối phiên thu mua, ký hợp đồng bán lúa cho buyer xuất khẩu và token hóa khoản phải thu.",
    color: "from-blue-500 to-indigo-600",
    bg: "bg-blue-50",
    text: "text-blue-700",
    tabs: ["managerHome", "registrations", "overview", "farmers", "harvest", "buyerSales", "invoices"],
  },
  fieldOfficer: {
    code: "fieldOfficer",
    label: "Cán bộ Đồng ruộng (3 Cùng + Drone)",
    icon: "🧑‍🌾",
    desc: "Onboard hộ. Bay drone đa phổ + tick checklist SRP trong cùng 1 chuyến xuống đồng. Re-tier nông dân real-time.",
    color: "from-emerald-500 to-green-600",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    tabs: ["officerHome", "onboarding", "droneUpload", "inspection"],
  },
  driver: {
    code: "driver",
    label: "Tài xế giao vật tư",
    icon: "🚛",
    desc: "Quét QR Hộ chiếu Số nông dân, ký số xác nhận giao vật tư trên blockchain.",
    color: "from-amber-500 to-orange-500",
    bg: "bg-amber-50",
    text: "text-amber-700",
    tabs: ["driverHome", "delivery"],
  },
};

export const SUBROLE_ORDER = ["manager", "fieldOfficer", "driver"];

export const initialStaff = [
  {
    id: "LT-MGR-001",
    subrole: "manager",
    hoTen: "Nguyễn Quốc Tuấn",
    chucDanh: "Giám đốc Vùng ĐBSCL",
    khuVuc: "Toàn vùng — An Giang, Cần Thơ, Kiên Giang, Đồng Tháp",
    ngayVaoLam: "2018-03-15",
    kpi: { hopDongDuyet: 0, doanhThuVuMua: 0, soLanDuyet: 0 },
  },
  {
    id: "LT-FO-002",
    subrole: "fieldOfficer",
    hoTen: "Trần Minh Đức",
    chucDanh: "Cán bộ Đồng ruộng — Khu Thoại Sơn (Drone + 3 Cùng)",
    khuVuc: "Thoại Sơn, Châu Phú — An Giang",
    ngayVaoLam: "2021-06-01",
    kpi: { hoOnboard: 0, soLanKiemTra: 0, soLanBay: 0, srpDiemTrungBinh: 0 },
  },
  {
    id: "LT-FO-003",
    subrole: "fieldOfficer",
    hoTen: "Lê Thị Hồng",
    chucDanh: "Cán bộ Đồng ruộng — Khu Cần Thơ (Drone + 3 Cùng)",
    khuVuc: "Vĩnh Thạnh, Cờ Đỏ — Cần Thơ",
    ngayVaoLam: "2022-09-12",
    kpi: { hoOnboard: 0, soLanKiemTra: 0, soLanBay: 0, srpDiemTrungBinh: 0 },
  },
  {
    id: "LT-DR-005",
    subrole: "driver",
    hoTen: "Hoàng Văn Sang",
    chucDanh: "Tài xế giao vật tư",
    khuVuc: "Đội xe Long Xuyên",
    ngayVaoLam: "2020-04-20",
    kpi: { donGiao: 0, kmDiChuyen: 0 },
  },
];
