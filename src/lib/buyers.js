// Buyer xuất khẩu — đối tác mua lúa của Lộc Trời. Khoản phải thu từ các buyer này
// chính là tài sản đảm bảo cho cơ chế factoring với liên minh ngân hàng (Buyer-SCF).
// Bank duyệt NHANH vì rủi ro nằm ở pháp nhân buyer (có credit rating, có lịch sử
// thanh toán quốc tế), không phải ở hộ nông dân nhỏ lẻ.

export const initialBuyers = [
  {
    id: "BYR-VNF",
    hoTen: "Vinafood II",
    chucDanh: "Tổng công ty Lương thực miền Nam",
    quocGia: "Việt Nam",
    creditRating: "BBB+",
    paymentTermDays: 60,
    desc: "Buyer nội địa lớn nhất · payment T+60 · lịch sử 20 năm với Lộc Trời",
  },
  {
    id: "BYR-CGL",
    hoTen: "Cargill Trading SG",
    chucDanh: "Singapore Commodities Trading",
    quocGia: "Singapore",
    creditRating: "A",
    paymentTermDays: 90,
    desc: "Trading desk xuất khẩu gạo Châu Phi · payment T+90 · L/C HSBC",
  },
  {
    id: "BYR-HSB",
    hoTen: "HSBC Commodities Desk",
    chucDanh: "Hong Kong · Agri-trade Finance",
    quocGia: "Hong Kong",
    creditRating: "A+",
    paymentTermDays: 30,
    desc: "Bank-backed buyer · payment T+30 · ưu tiên SRP-certified rice",
  },
];

// Demo buyer user — để bank/manager có thể login dạng buyer xem hợp đồng
export const buyerLoginAccount = {
  id: "BYR-VNF",
  role: "buyer",
  profile: initialBuyers[0],
};
