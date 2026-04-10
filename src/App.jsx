import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import OverviewTab from "./components/OverviewTab";
import FarmersTab from "./components/FarmersTab";
import InvoicesTab from "./components/InvoicesTab";
import SCFTab from "./components/SCFTab";
import FarmerPortalTab from "./components/FarmerPortalTab";
import GlobalLogin from "./components/GlobalLogin";
import SupplyModal from "./components/SupplyModal";
import OracleModal from "./components/OracleModal";
import SCFModal from "./components/SCFModal";
import DisasterModal from "./components/DisasterModal";
import LedgerPanel from "./components/LedgerPanel";
import Toast from "./components/Toast";

export const generateHash = () => Math.random().toString(16).substring(2, 10);
export const generateId = (prefix) => prefix + Math.random().toString(36).substring(2, 6).toUpperCase();
export const formatVND = (n) => (n || 0).toLocaleString("vi-VN") + " VNĐ";

export const initialFarmers = [
  { id: "#LT-001", hoTen: "Nguyễn Văn An", diaChi: "Thoại Sơn, An Giang", dienTich: 12.5, kpiScore: 85, hanMucTinDung: 120000000, trangThai: "Đang canh tác" },
  { id: "#LT-002", hoTen: "Trần Thị Bích", diaChi: "Châu Phú, An Giang", dienTich: 6.2, kpiScore: 92, hanMucTinDung: 80000000, trangThai: "Đang canh tác" },
  { id: "#LT-003", hoTen: "Lê Văn Cường", diaChi: "Tri Tôn, An Giang", dienTich: 15.0, kpiScore: 73, hanMucTinDung: 150000000, trangThai: "Đang canh tác" },
  { id: "#LT-004", hoTen: "Phạm Văn Dũng", diaChi: "Vĩnh Thạnh, Cần Thơ", dienTich: 2.5, kpiScore: 55, hanMucTinDung: 40000000, trangThai: "Cảnh báo" },
  { id: "#LT-005", hoTen: "Hoàng Thị Em", diaChi: "Cờ Đỏ, Cần Thơ", dienTich: 8.8, kpiScore: 88, hanMucTinDung: 95000000, trangThai: "Đang canh tác" },
  { id: "#LT-006", hoTen: "Đinh Văn Phúc", diaChi: "Tân Hiệp, Kiên Giang", dienTich: 10.5, kpiScore: 68, hanMucTinDung: 110000000, trangThai: "Đang canh tác" },
  { id: "#LT-007", hoTen: "Vũ Thị Giang", diaChi: "Châu Thành, Đồng Tháp", dienTich: 4.2, kpiScore: 95, hanMucTinDung: 65000000, trangThai: "Đang canh tác" },
  { id: "#LT-008", hoTen: "Bùi Văn Hải", diaChi: "Thanh Bình, Đồng Tháp", dienTich: 1.8, kpiScore: 45, hanMucTinDung: 20000000, trangThai: "Cảnh báo" },
  { id: "#LT-009", hoTen: "Ngô Thị Thu", diaChi: "Thoại Sơn, An Giang", dienTich: 7.5, kpiScore: 81, hanMucTinDung: 85000000, trangThai: "Đang canh tác" },
  { id: "#LT-010", hoTen: "Lý Văn Tám", diaChi: "Hòn Đất, Kiên Giang", dienTich: 20.0, kpiScore: 77, hanMucTinDung: 220000000, trangThai: "Đang canh tác" },
];

export const initialSupplies = [
  { id: "S001", ten: "Giống lúa OM5451", donVi: "kg", donGia: 45000 },
  { id: "S002", ten: "Phân bón NPK 20-20-15", donVi: "kg", donGia: 12000 },
  { id: "S003", ten: "Thuốc BVTV sinh học", donVi: "chai", donGia: 85000 },
  { id: "S004", ten: "Thuốc trừ sâu rầy", donVi: "chai", donGia: 120000 },
  { id: "S005", ten: "Giống lúa Đài Thơm 8", donVi: "kg", donGia: 50000 },
  { id: "S006", ten: "Phân hữu cơ vi sinh", donVi: "bao", donGia: 250000 },
  { id: "S007", ten: "Thuốc rải diệt cỏ mầm", donVi: "gói", donGia: 95000 },
  { id: "S008", ten: "Phân Ure Cà Mau", donVi: "kg", donGia: 15000 },
];

export const GIA_LUA = 8500; // VNĐ/kg

const App = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("");
  const [farmers, setFarmers] = useState(initialFarmers);
  const [supplies] = useState(initialSupplies);
  const [transactions, setTransactions] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [supplyRequests, setSupplyRequests] = useState([]);
  const [blockchainLog, setBlockchainLog] = useState([
    { timestamp: new Date().toISOString(), hash: generateHash(), action: "GENESIS_BLOCK", data: "Khởi tạo hệ thống LocTroi AgriChain v2.0" }
  ]);

  // Modal states
  const [supplyModal, setSupplyModal] = useState({ isOpen: false, farmer: null, supplyId: "S001", quantity: 1, season: "Vụ Hè Thu 2025" });
  const [oracleModal, setOracleModal] = useState({ isOpen: false, status: "idle", invoiceId: null });
  const [scfModal, setScfModal] = useState({ isOpen: false, status: "idle", data: null, hash: null });
  const [disasterModal, setDisasterModal] = useState({ isOpen: false, step: 0, data: null, insuranceAmount: null, recourseAmount: null });
  const [ledgerOpen, setLedgerOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 4000); };

  const logBlockchain = (action, data, hash = null) => {
    const h = hash || generateHash();
    setBlockchainLog(prev => [{ timestamp: new Date().toISOString(), hash: h, action, data }, ...prev]);
    return h;
  };

  const handleCreateSupplyRequest = () => {
    const { farmer, supplyId, quantity, season } = supplyModal;
    if (!farmer) return;
    const supply = supplies.find(s => s.id === supplyId);
    if (!supply) return;
    const hash = generateHash();
    const newReq = { id: generateId("REQ-"), farmer, supplyId, quantity, season, status: "Pending", date: new Date().toISOString() };
    setSupplyRequests(prev => [newReq, ...prev]);
    logBlockchain("SUPPLY_REQUESTED", `Hộ ${farmer.hoTen} gửi yêu cầu ${quantity} ${supply.donVi} ${supply.ten} (${season})`, hash);
    setSupplyModal(m => ({ ...m, isOpen: false }));
    showToast(`🛒 Gửi lệnh yêu cầu vật tư lên Lộc Trời thành công`);
  };

  const handleApproveRequest = (req) => {
    const { farmer, supplyId, quantity, season } = req;
    const supply = supplies.find(s => s.id === supplyId);
    const hash = generateHash();
    const qty = Number(quantity);

    // Remove from pending requests
    setSupplyRequests(prev => prev.filter(r => r.id !== req.id));

    const newTx = { id: generateId("TX-"), nongHoId: farmer.id, vatTu: supply.ten, soLuong: qty, vuMua: season, ngay: new Date().toISOString(), trangThai: "Đã giao", hash };
    logBlockchain("SUPPLY_ISSUED", `Lộc Trời CẤP DUYỆT ${qty} ${supply.donVi} ${supply.ten} cho ${farmer.hoTen} (${season})`, hash);
    setTransactions(prev => [newTx, ...prev]);
    
    const amount = qty * supply.donGia;
    const riskLevel = farmer.kpiScore > 80 ? "LOW" : farmer.kpiScore >= 60 ? "MEDIUM" : "HIGH";
    const newInvoice = {
      id: generateId("INV-"),
      nongHoId: farmer.id,
      vuMua: season,
      amount,
      vatTuId: supply.id,
      trangThai: "Chờ xác nhận",
      date: new Date().toISOString(),
      guarantorId: "LOC-TROI-CORP",
      riskLevel,
      insurancePolicyId: generateId("INS-"),
      maturityDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
      recourseStatus: null,
    };
    setInvoices(prev => [newInvoice, ...prev]);
    showToast(`✅ Đã duyệt lệnh cấp phát vật tư thành công`);
  };

  const handleRejectSupplyRequest = (req) => {
    const { farmer, supplyId, quantity, season } = req;
    const supply = supplies.find(s => s.id === supplyId);
    
    // Remove from pending requests
    setSupplyRequests(prev => prev.filter(r => r.id !== req.id));

    logBlockchain("SUPPLY_REJECTED", `Lộc Trời TỪ CHỐI cấp yêu cầu ${quantity} ${supply.donVi} ${supply.ten} cho ${farmer.hoTen} (${season})`);
    showToast(`❌ Đã từ chối lệnh yêu cầu vật tư của ${farmer.hoTen}`);
  };

  const handleVerifyField = (invoice) => {
    setOracleModal({ isOpen: true, status: "loading", invoiceId: invoice.id });
    setTimeout(() => {
      setOracleModal(m => ({ ...m, status: "success" }));
      setTimeout(() => {
        const hash = generateHash();
        const tokenId = `TKN-${hash.substring(0, 6).toUpperCase()}`;
        setInvoices(prev => prev.map(inv => inv.id === invoice.id ? { ...inv, trangThai: "Đã token hóa", tokenId } : inv));
        logBlockchain("INVOICE_TOKENIZED", `Mã HĐ: ${invoice.id} → Token: ${tokenId}`, hash);
        showToast(`✅ Phát hành ${tokenId} thành công`);
        setOracleModal({ isOpen: false, status: "idle", invoiceId: null });
      }, 1500);
    }, 8500);
  };

  const handleSubmitSCF = (invoice) => {
    setInvoices(prev => prev.map(inv => inv.id === invoice.id ? { ...inv, trangThai: "Chào bán ngân hàng" } : inv));
    logBlockchain("SCF_SUBMITTED", `HĐ ${invoice.id} (${invoice.tokenId}) chào bán liên minh ngân hàng`);
    showToast("📤 Đã gửi tới liên minh ngân hàng");
  };

  const handleDisburse = (invoice) => {
    setScfModal({ isOpen: true, status: "loading", data: invoice, hash: null });
    setTimeout(() => {
      const hash = generateHash();
      setInvoices(prev => prev.map(inv => inv.id === invoice.id ? { ...inv, trangThai: "Đã giải ngân" } : inv));
      logBlockchain("LOAN_DISBURSED", `Giải ngân ${formatVND(invoice.amount)} cho HĐ ${invoice.id} (${invoice.tokenId})`, hash);
      setScfModal({ isOpen: true, status: "success", data: invoice, hash });
    }, 2000);
  };

  const handleRejectSCF = (invoice) => {
    setInvoices(prev => prev.map(inv => inv.id === invoice.id ? { ...inv, trangThai: "Từ chối duyệt vay" } : inv));
    logBlockchain("SCF_REJECTED", `Ngân hàng từ chối duyệt khoản vay cho HĐ ${invoice.id}`);
    showToast("❌ Đã từ chối hồ sơ vay");
  };

  const handleSettleInvoice = (invoice) => {
    // Thu hoạch & Tất toán chuẩn (Happy Path)
    setInvoices(prev => prev.map(inv => inv.id === invoice.id ? { ...inv, trangThai: "Đã tất toán" } : inv));
    logBlockchain("LOAN_REPAID_ON_TIME", `HĐ ${invoice.id} được tất toán đúng hạn từ tiền lúa. Token ${invoice.tokenId} đã bị đốt (Burn). Lợi nhuận ghi nhận về Nông dân.`);
    
    // Nâng điểm tín nhiệm (KPI) và hạn mức tự động
    setFarmers(prev => prev.map(f => {
      if (f.id === invoice.nongHoId) {
        const newKpi = Math.min(100, f.kpiScore + 3);
        const newLimit = f.hanMucTinDung + 5000000;
        logBlockchain("CREDIT_UPDATED", `Giao dịch uy tín. Hộ nông dân [${f.id}] nhận +3 KPI. Nâng hạn mức lên ${(newLimit/1000000).toFixed(0)}Tr VNĐ.`);
        return { ...f, kpiScore: newKpi, hanMucTinDung: newLimit };
      }
      return f;
    }));
    showToast("💵 Đã tất toán & nâng điểm tín dụng hộ nông dân!");
  };

  const handleDeclareDefault = (invoice) => {
    // Bước 1: Đánh dấu nợ xấu
    setInvoices(prev => prev.map(inv =>
      inv.id === invoice.id
        ? { ...inv, trangThai: "Nợ xấu", recourseStatus: "DEFAULTED" }
        : inv
    ));
    logBlockchain("LOAN_DEFAULT", `HĐ ${invoice.id} (${invoice.tokenId}) — Thiên tai. Kích hoạt Oracle & Bảo hiểm.`);
    setDisasterModal({ isOpen: true, step: 0, data: invoice, insuranceAmount: null, recourseAmount: null });
    showToast("🌊 Khai báo thiên tai — Oracle đang xác minh...");

    // Bước 2: Oracle xác nhận thiên tai → Bảo hiểm kích hoạt
    setTimeout(() => {
      const insuranceAmount = Math.round(invoice.amount * 0.8);
      const recourseAmount  = Math.round(invoice.amount * 0.2);
      setInvoices(prev => prev.map(inv =>
        inv.id === invoice.id
          ? { ...inv, recourseStatus: "INSURANCE_CLAIMED", insurancePayout: insuranceAmount }
          : inv
      ));
      logBlockchain("INSURANCE_TRIGGERED",
        `Bảo hiểm chi ${formatVND(insuranceAmount)} | Lộc Trời truy đòi ${formatVND(recourseAmount)}`
      );
      setDisasterModal(m => ({ ...m, step: 1, insuranceAmount, recourseAmount }));

      // Bước 3: Lộc Trời hoàn trả ngân hàng → Tất toán
      setTimeout(() => {
        setInvoices(prev => prev.map(inv =>
          inv.id === invoice.id
            ? { ...inv, trangThai: "Đã tất toán", recourseStatus: "RECOURSE_SETTLED" }
            : inv
        ));
        logBlockchain("RECOURSE_SETTLED",
          `HĐ ${invoice.id} tất toán. Lộc Trời hoàn trả ngân hàng theo cam kết bảo lãnh.`
        );
        setDisasterModal(m => ({ ...m, step: 2 }));
        showToast("✅ Recourse tất toán — Ngân hàng đã thu đủ gốc lãi");
      }, 2500);
    }, 2500);
  };

  // Computed values
  const disbursedAmount = invoices.filter(i => i.trangThai === "Đã giải ngân").reduce((s, i) => s + i.amount, 0);
  const pendingAmount = invoices.filter(i => i.trangThai !== "Đã giải ngân").reduce((s, i) => s + i.amount, 0);
  const totalArea = farmers.reduce((s, f) => s + f.dienTich, 0);

  const stateCounts = {
    "Chờ xác nhận": invoices.filter(i => i.trangThai === "Chờ xác nhận").reduce((s, i) => s + i.amount, 0),
    "Đã token hóa": invoices.filter(i => i.trangThai === "Đã token hóa").reduce((s, i) => s + i.amount, 0),
    "Chào bán ngân hàng": invoices.filter(i => i.trangThai === "Chào bán ngân hàng").reduce((s, i) => s + i.amount, 0),
    "Đã giải ngân": disbursedAmount,
  };

  const sharedProps = { farmers, supplies, invoices, supplyRequests, blockchainLog, transactions, disbursedAmount, pendingAmount, totalArea, stateCounts, formatVND, GIA_LUA };

  const handleLogin = (user) => {
    setCurrentUser(user);
    if (user.role === "loctroi") setActiveTab("overview");
    else if (user.role === "bank") setActiveTab("scf");
    else if (user.role === "farmer") setActiveTab("farmerPortal");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab("");
  };

  if (!currentUser) {
    return <GlobalLogin farmers={farmers} onLogin={handleLogin} />;
  }

  return (
    <div className="flex w-screen h-screen overflow-hidden bg-slate-50" style={{ fontFamily: "'Inter', sans-serif" }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        .fade-in { animation: fadeIn 0.35s ease-out forwards; }
        @keyframes spinAnim { to { transform: rotate(360deg); } }
        .spin { animation: spinAnim 1s linear infinite; }
        @keyframes ping { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(1.5)} }
        .ping { animation: ping 1.2s ease-in-out infinite; }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #f1f5f9; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
      `}} />

      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        blockchainLog={blockchainLog} 
        invoices={invoices} 
        role={currentUser.role}
        onLogout={handleLogout}
      />

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <Header activeTab={activeTab} />
        <div className="flex-1 overflow-auto p-6 xl:p-8">
          <div className="max-w-screen-xl mx-auto w-full">
            {activeTab === "overview" && <OverviewTab {...sharedProps} />}
            {activeTab === "farmers" && (
              <FarmersTab {...sharedProps}
                onApproveRequest={handleApproveRequest}
                onRejectRequest={handleRejectSupplyRequest}
              />
            )}
            {activeTab === "invoices" && (
              <InvoicesTab {...sharedProps}
                onVerifyField={handleVerifyField}
                onSubmitSCF={handleSubmitSCF}
                onSettleInvoice={handleSettleInvoice}
              />
            )}
            {activeTab === "scf" && (
              <SCFTab {...sharedProps}
                onDisburse={handleDisburse}
                onReject={handleRejectSCF}
                onDeclareDefault={handleDeclareDefault}
              />
            )}
            {activeTab === "farmerPortal" && (
              <FarmerPortalTab {...sharedProps}
                farmer={currentUser?.profile}
                onSubmitSCF={handleSubmitSCF}
                onRequestSupply={(farmer) => setSupplyModal(m => ({ ...m, isOpen: true, farmer }))} 
              />
            )}
          </div>
        </div>
      </main>

      {/* Ledger FAB */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
        {ledgerOpen && <LedgerPanel blockchainLog={blockchainLog} onClose={() => setLedgerOpen(false)} />}
        <button
          onClick={() => setLedgerOpen(v => !v)}
          className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2.5 rounded-full shadow-xl text-sm font-bold transition-all border border-gray-700"
        >
          ⛓️ {blockchainLog.length} blocks
        </button>
      </div>

      {/* Modals */}
      {supplyModal.isOpen && (
        <SupplyModal modal={supplyModal} setModal={setSupplyModal} supplies={supplies} onConfirm={handleCreateSupplyRequest} formatVND={formatVND} />
      )}
      {oracleModal.isOpen && <OracleModal modal={oracleModal} />}
      {scfModal.isOpen && (
        <SCFModal modal={scfModal} onClose={() => setScfModal({ isOpen: false, status: "idle", data: null, hash: null })} formatVND={formatVND} />
      )}
      {disasterModal.isOpen && (
        <DisasterModal
          modal={disasterModal}
          onClose={() => setDisasterModal({ isOpen: false, step: 0, data: null, insuranceAmount: null, recourseAmount: null })}
          formatVND={formatVND}
        />
      )}
      {toast && <Toast message={toast} />}
    </div>
  );
};

export default App;
