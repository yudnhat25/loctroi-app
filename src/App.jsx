import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import OverviewTab from "./components/OverviewTab";
import FarmersTab from "./components/FarmersTab";
import InvoicesTab from "./components/InvoicesTab";
import SCFTab from "./components/SCFTab";
import FarmerPortalTab from "./components/FarmerPortalTab";
import InspectionTab from "./components/InspectionTab";
import OnboardingTab from "./components/OnboardingTab";
import DroneOperatorTab from "./components/DroneOperatorTab";
import DeliveryTab from "./components/DeliveryTab";
import HarvestTab from "./components/HarvestTab";
import StaffHome from "./components/StaffHome";
import GlobalLogin from "./components/GlobalLogin";
import SupplyModal from "./components/SupplyModal";
import OracleModal from "./components/OracleModal";
import SCFModal from "./components/SCFModal";
import DisasterModal from "./components/DisasterModal";
import LedgerPanel from "./components/LedgerPanel";
import Toast from "./components/Toast";
import { getTier, getPremiumPerKg, MAX_FARMING, TIERS } from "./lib/scoring";
import { initialStaff } from "./lib/staff";

export const generateHash = () => Math.random().toString(16).substring(2, 10);
export const generateId = (prefix) => prefix + Math.random().toString(36).substring(2, 6).toUpperCase();
export const formatVND = (n) => (n || 0).toLocaleString("vi-VN") + " VNĐ";

export const initialFarmers = [
  { id: "LT001", digitalId: "LT001", htx: "HTX Thoại Sơn",  hoTen: "Nguyễn Văn An",  diaChi: "Thoại Sơn, An Giang",   dienTich: 12.5, creditScore: 280, farmingScore: 480, hanMucTinDung: 120000000, trangThai: "Đang canh tác" },
  { id: "LT002", digitalId: "LT002", htx: "HTX Châu Phú",   hoTen: "Trần Thị Bích",  diaChi: "Châu Phú, An Giang",    dienTich:  6.2, creditScore: 320, farmingScore: 520, hanMucTinDung:  80000000, trangThai: "Đang canh tác" },
  { id: "LT003", digitalId: "LT003", htx: "HTX Tri Tôn",    hoTen: "Lê Văn Cường",   diaChi: "Tri Tôn, An Giang",     dienTich: 15.0, creditScore: 200, farmingScore: 280, hanMucTinDung: 150000000, trangThai: "Đang canh tác" },
  { id: "LT004", digitalId: "LT004", htx: "HTX Vĩnh Thạnh", hoTen: "Phạm Văn Dũng",  diaChi: "Vĩnh Thạnh, Cần Thơ",   dienTich:  2.5, creditScore:  80, farmingScore: 160, hanMucTinDung:  40000000, trangThai: "Cảnh báo" },
  { id: "LT005", digitalId: "LT005", htx: "HTX Cờ Đỏ",      hoTen: "Hoàng Thị Em",   diaChi: "Cờ Đỏ, Cần Thơ",        dienTich:  8.8, creditScore: 300, farmingScore: 460, hanMucTinDung:  95000000, trangThai: "Đang canh tác" },
  { id: "LT006", digitalId: "LT006", htx: "HTX Tân Hiệp",   hoTen: "Đinh Văn Phúc",  diaChi: "Tân Hiệp, Kiên Giang",  dienTich: 10.5, creditScore: 180, farmingScore: 320, hanMucTinDung: 110000000, trangThai: "Đang canh tác" },
  { id: "LT007", digitalId: "LT007", htx: "HTX Châu Thành", hoTen: "Vũ Thị Giang",   diaChi: "Châu Thành, Đồng Tháp", dienTich:  4.2, creditScore: 350, farmingScore: 500, hanMucTinDung:  65000000, trangThai: "Đang canh tác" },
  { id: "LT008", digitalId: "LT008", htx: "HTX Thanh Bình", hoTen: "Bùi Văn Hải",    diaChi: "Thanh Bình, Đồng Tháp", dienTich:  1.8, creditScore:  60, farmingScore: 140, hanMucTinDung:  20000000, trangThai: "Cảnh báo" },
  { id: "LT009", digitalId: "LT009", htx: "HTX Thoại Sơn",  hoTen: "Ngô Thị Thu",    diaChi: "Thoại Sơn, An Giang",   dienTich:  7.5, creditScore: 240, farmingScore: 380, hanMucTinDung:  85000000, trangThai: "Đang canh tác" },
  { id: "LT010", digitalId: "LT010", htx: "HTX Hòn Đất",    hoTen: "Lý Văn Tám",     diaChi: "Hòn Đất, Kiên Giang",   dienTich: 20.0, creditScore: 200, farmingScore: 280, hanMucTinDung: 220000000, trangThai: "Đang canh tác" },
];

export const initialSupplies = [
  { id: "S001", ten: "Giống lúa OM5451",          donVi: "kg",   donGia: 45000 },
  { id: "S002", ten: "Phân NPK 20-20-15",         donVi: "kg",   donGia: 12000 },
  { id: "S003", ten: "Thuốc BVTV sinh học",       donVi: "chai", donGia: 85000 },
  { id: "S004", ten: "Thuốc trừ sâu rầy",         donVi: "chai", donGia: 120000 },
  { id: "S005", ten: "Giống lúa Đài Thơm 8",      donVi: "kg",   donGia: 50000 },
  { id: "S006", ten: "Phân hữu cơ vi sinh",       donVi: "bao",  donGia: 250000 },
  { id: "S007", ten: "Thuốc rải diệt cỏ mầm",     donVi: "gói",  donGia: 95000 },
  { id: "S008", ten: "Phân Ure Cà Mau",           donVi: "kg",   donGia: 15000 },
];

export const GIA_LUA = 8500; // VNĐ/kg cơ sở bao tiêu

const App = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("");
  const [farmers, setFarmers] = useState(initialFarmers);
  const [staff] = useState(initialStaff);
  const [supplies] = useState(initialSupplies);
  const [transactions, setTransactions] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [supplyRequests, setSupplyRequests] = useState([]);
  const [deliveryQueue, setDeliveryQueue] = useState([]); // các đơn đã duyệt nhưng chưa giao (B3)
  const [droneReports, setDroneReports] = useState([]);   // ảnh drone đã upload + AI phân tích
  const [blockchainLog, setBlockchainLog] = useState([
    { timestamp: new Date().toISOString(), hash: generateHash(), action: "GENESIS_BLOCK", data: "Khởi tạo hệ thống LocTroi AgriChain v2.0" }
  ]);

  // Modals
  const [supplyModal, setSupplyModal] = useState({ isOpen: false, farmer: null, season: "Vụ Đông Xuân 2026-2027" });
  const [oracleModal, setOracleModal] = useState({ isOpen: false, status: "idle", invoiceId: null, nongHoId: null });
  const [scfModal, setScfModal] = useState({ isOpen: false, status: "idle", data: null, hash: null });
  const [disasterModal, setDisasterModal] = useState({ isOpen: false, step: 0, data: null, insuranceAmount: null, recourseAmount: null });
  const [ledgerOpen, setLedgerOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 4000); };
  const logBlockchain = (action, data, hash = null) => {
    const h = hash || generateHash();
    setBlockchainLog(prev => [{ timestamp: new Date().toISOString(), hash: h, action, data }, ...prev]);
    return h;
  };

  // ─── Onboard nông dân mới ────────────────────────────────────────────────
  const handleCreateFarmer = ({ hoTen, cccd, sdt, diaChi, htx, dienTich, giong, onboardedBy }) => {
    const idx = farmers.length + 1;
    const digitalId = `LT${String(idx).padStart(3, "0")}`;
    const newFarmer = {
      id: digitalId,
      digitalId,
      htx,
      hoTen,
      diaChi,
      dienTich,
      cccdHash: generateHash(), // hash của CCCD
      sdt,
      giong,
      creditScore: 0,
      farmingScore: 0,
      hanMucTinDung: 0,
      trangThai: "Đang canh tác",
    };
    setFarmers(prev => [...prev, newFarmer]);
    logBlockchain(
      "PASSPORT_CREATED",
      `Hộ chiếu Số ${digitalId} tạo cho ${hoTen} (${dienTich}ha · ${htx}) — onboard bởi ${onboardedBy}. Tier D · Score 0/0.`
    );
    showToast(`🪪 Đã tạo Hộ chiếu Số ${digitalId} cho ${hoTen}`);
    return newFarmer;
  };

  // ─── B1-B2: Yêu cầu vật tư + smart contract auto duyệt ───────────────────
  const handleCreateSupplyRequest = ({ farmer, season, cart, chosenTier }) => {
    if (!farmer || Object.keys(cart).length === 0) return;
    const items = Object.entries(cart).map(([sid, qty]) => {
      const s = supplies.find(x => x.id === sid);
      return { supplyId: sid, ten: s.ten, donVi: s.donVi, donGia: s.donGia, quantity: qty };
    });
    const total = items.reduce((s, i) => s + i.donGia * i.quantity, 0);
    const hash = generateHash();
    const newReq = {
      id: generateId("REQ-"),
      farmer, season, items, total, chosenTier,
      status: "Chờ duyệt",
      date: new Date().toISOString(),
    };
    setSupplyRequests(prev => [newReq, ...prev]);
    const summary = items.map(i => `${i.quantity}${i.donVi} ${i.ten}`).join(", ");
    logBlockchain("SUPPLY_REQUESTED", `[B1] ${farmer.hoTen} yêu cầu (${chosenTier}) ${summary} (${season}) · Tổng ${formatVND(total)}`, hash);

    // +5 Credit Score: tham gia hệ thống
    setFarmers(prev => prev.map(f => f.id === farmer.id ? { ...f, creditScore: Math.min(400, (f.creditScore ?? 0) + 5) } : f));
    setSupplyModal(m => ({ ...m, isOpen: false }));
    showToast(`🛒 Đã gửi yêu cầu lên Lộc Trời (+5 Credit cho tham gia)`);
  };

  // ─── B2: Quản lý LT duyệt → đẩy vào delivery queue (chưa giao ngay) ──────
  const handleApproveRequest = (req) => {
    setSupplyRequests(prev => prev.filter(r => r.id !== req.id));
    const tier = TIERS[req.chosenTier] ?? getTier(req.farmer);
    // Đẩy từng item vào delivery queue (mỗi item là 1 đơn giao riêng)
    const queueItems = req.items.map(it => ({
      id: generateId("DLV-"),
      reqId: req.id,
      farmer: req.farmer,
      supplyId: it.supplyId,
      quantity: it.quantity,
      season: req.season,
      tier: tier.code,
      total: it.donGia * it.quantity,
      date: new Date().toISOString(),
    }));
    setDeliveryQueue(prev => [...queueItems, ...prev]);
    logBlockchain(
      "SUPPLY_APPROVED",
      `[B2] Smart contract requestSupply() duyệt đơn ${req.id} cho ${req.farmer.hoTen} theo Tier ${tier.code} — ${tier.payment}. Vào hàng chờ giao.`
    );
    showToast(`✅ Đã duyệt theo Tier ${tier.code} — chuyển tài xế giao ${queueItems.length} lô vật tư`);
  };

  const handleRejectSupplyRequest = (req) => {
    setSupplyRequests(prev => prev.filter(r => r.id !== req.id));
    logBlockchain("SUPPLY_REJECTED", `Lộc Trời TỪ CHỐI yêu cầu ${req.id} của ${req.farmer.hoTen}`);
    showToast(`❌ Đã từ chối yêu cầu của ${req.farmer.hoTen}`);
  };

  // ─── B3: Tài xế confirm giao → +10 Credit, tạo invoice nếu có nợ ─────────
  const handleConfirmDelivery = (delivery, driver) => {
    const supply = supplies.find(s => s.id === delivery.supplyId);
    const tier = TIERS[delivery.tier] ?? TIERS.D;
    const hash = generateHash();
    const total = delivery.total;
    const deposit = Math.round(total * tier.deposit / 100);
    const credit = total - deposit;
    const riskLevel = tier.code === "A" ? "LOW" : tier.code === "B" ? "MEDIUM" : tier.code === "C" ? "MEDIUM" : "HIGH";

    setDeliveryQueue(prev => prev.filter(d => d.id !== delivery.id));

    const newTx = {
      id: generateId("TX-"),
      nongHoId: delivery.farmer.id,
      vatTu: supply.ten,
      soLuong: delivery.quantity,
      vuMua: delivery.season,
      ngay: new Date().toISOString(),
      trangThai: "Đã giao",
      hash,
      tier: tier.code,
      depositAmount: deposit,
      creditAmount: credit,
      driverId: driver.id,
    };
    setTransactions(prev => [newTx, ...prev]);
    logBlockchain(
      "DELIVERY_CONFIRMED",
      `[B3] Tài xế ${driver.id} (${driver.hoTen}) giao ${delivery.quantity} ${supply.donVi} ${supply.ten} cho ${delivery.farmer.hoTen} — ký số 2 bên`,
      hash
    );

    // +10 Credit
    setFarmers(prev => prev.map(f => {
      if (f.id !== delivery.farmer.id) return f;
      const newCredit = Math.min(400, (f.creditScore ?? 0) + 10);
      logBlockchain("CREDIT_DELIVERY", `[+10 Credit] ${f.hoTen} ký nhận giao vật tư → Credit ${newCredit}/400`);
      return { ...f, creditScore: newCredit };
    }));

    if (credit > 0) {
      const newInvoice = {
        id: generateId("INV-"),
        nongHoId: delivery.farmer.id,
        vuMua: delivery.season,
        amount: credit,
        totalValue: total,
        depositAmount: deposit,
        tier: tier.code,
        vatTuId: delivery.supplyId,
        trangThai: "Chờ xác nhận",
        date: new Date().toISOString(),
        guarantorId: "LOC-TROI-CORP",
        riskLevel,
        insurancePolicyId: generateId("INS-"),
        maturityDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
        recourseStatus: null,
      };
      setInvoices(prev => [newInvoice, ...prev]);
      showToast(`🚛 Đã giao + ghi nợ ${formatVND(credit)} (Tier ${tier.code})`);
    } else {
      logBlockchain("CASH_PAYMENT", `[Tier C] ${delivery.farmer.hoTen} thanh toán tiền mặt ${formatVND(total)} — không tạo AR`);
      showToast(`🚛 Đã giao + thu tiền mặt ${formatVND(total)}`);
    }
  };

  // ─── Phi công drone upload ảnh ───────────────────────────────────────────
  const handleSubmitDroneReport = (report) => {
    const id = generateId("DRN-");
    const fullReport = { ...report, id };
    setDroneReports(prev => [fullReport, ...prev]);
    logBlockchain(
      "DRONE_REPORT",
      `Phi công ${report.operatorId} (${report.operatorName}) bay drone ${report.farmerName} (${report.farmerArea}ha): xanh ${report.greenPct}% · NDVI ${report.ndvi} · ${report.qualityNote}. IPFS ${report.fileHash}.`
    );
    showToast(`🚁 Đã ghi DRONE_REPORT — AI chấm phủ xanh ${report.greenPct}%`);
  };

  // ─── 3 Cùng tick checklist + AI phân tích ảnh thực địa ───────────────────
  const handleFieldInspection = ({ farmer, checked, newFarmingScore, droneReportHash, fieldImageHash, operator, analysis }) => {
    const hash = generateHash();
    setFarmers(prev => prev.map(f => f.id === farmer.id ? { ...f, farmingScore: newFarmingScore } : f));

    const passed = Object.values(checked).filter(Boolean).length;
    const total = Object.keys(checked).length;
    const evid = [
      droneReportHash ? `drone#${droneReportHash}` : null,
      fieldImageHash ? `field#${fieldImageHash}` : null,
      `sig#${operator.id}`,
    ].filter(Boolean).join(" · ");
    logBlockchain(
      "FIELD_INSPECTION",
      `[Oracle 3 Cùng] ${operator.id} (${operator.hoTen}) kiểm tra ${farmer.hoTen}: ${passed}/${total} SRP → Farming Score ${newFarmingScore}/${MAX_FARMING}. Bằng chứng: ${evid}`,
      hash
    );
    showToast(`🧑‍🌾 SRP đã ghi chain: ${passed}/${total} đạt · FS ${newFarmingScore}`);
  };

  // ─── B5: Tất toán thu hoạch ──────────────────────────────────────────────
  const handleSettleHarvest = ({ farmer, yieldKg, pricePerKg, premium, grossPay, debt, netPay, moisture, impurity, operator, relatedInvoices }) => {
    const hash = generateHash();
    // Tất toán tất cả invoice liên quan
    setInvoices(prev => prev.map(inv =>
      relatedInvoices.includes(inv.id) ? { ...inv, trangThai: "Đã tất toán" } : inv
    ));

    logBlockchain(
      "HARVEST_SETTLED",
      `[B5 harvestSettlement()] ${operator.id} (${operator.hoTen}) thu mua ${farmer.hoTen}: ${(yieldKg/1000).toFixed(2)} tấn × ${pricePerKg.toLocaleString("vi-VN")}đ (premium +${premium}đ) = ${formatVND(grossPay)}. Trừ nợ ${formatVND(debt)} → ròng ${formatVND(netPay)}. Độ ẩm ${moisture}% · tạp ${impurity}%.`,
      hash
    );

    // +200 (giao đủ SL) + +100 (trả nợ đúng hạn) = +300
    setFarmers(prev => prev.map(f => {
      if (f.id !== farmer.id) return f;
      const newCredit = Math.min(400, (f.creditScore ?? 0) + 300);
      const newLimit = (f.hanMucTinDung || 0) + 5000000;
      const oldTier = getTier(f).code;
      const newTier = getTier({ ...f, creditScore: newCredit }).code;
      logBlockchain("CREDIT_HARVEST", `[+300 Credit] ${f.hoTen}: +200 đủ SL + +100 trả nợ đúng hạn → ${newCredit}/400. Hạn mức ${(newLimit/1e6).toFixed(0)}Tr.`);
      if (oldTier !== newTier) {
        logBlockchain("TIER_UPGRADE", `🎉 ${f.hoTen} thăng hạng Tier ${oldTier} → Tier ${newTier}!`);
      }
      return { ...f, creditScore: newCredit, hanMucTinDung: newLimit };
    }));

    showToast(`🌾 Đã tất toán cho ${farmer.hoTen}: ròng ${formatVND(netPay)} · +300 Credit`);
  };

  // ─── Farmer self-report harvest (notify procurement) ─────────────────────
  const handleReportHarvest = (farmer) => {
    logBlockchain("HARVEST_REPORTED", `${farmer.hoTen} báo sắp thu hoạch — notification gửi cán bộ thu mua chuẩn bị xe.`);
    showToast(`📞 Đã báo Lộc Trời. Cán bộ thu mua sẽ liên hệ xếp lịch cân lúa.`);
  };

  // ─── SCF / Insurance handlers (giữ logic cũ) ─────────────────────────────
  const handleVerifyField = (invoice) => {
    const farmer = farmers.find(f => f.id === invoice.nongHoId);
    const currentScore = farmer?.farmingScore || 0;
    const isPassing = currentScore >= 250; // Ngưỡng đạt chuẩn SRP để đúc Token

    setOracleModal({ isOpen: true, status: "loading", invoiceId: invoice.id, nongHoId: invoice.nongHoId });
    setTimeout(() => {
      // Đánh giá dựa trên dữ liệu THỰC TẾ từ đội 3 Cùng ghi nhận
      if (!isPassing) {
        setOracleModal(m => ({ ...m, status: "failed" }));
        setTimeout(() => {
          const hash = generateHash();
          setInvoices(prev => prev.map(inv => inv.id === invoice.id ? { ...inv, trangThai: "Từ chối duyệt vay" } : inv));
          logBlockchain("ORACLE_REJECTED", `Oracle: HĐ ${invoice.id} bị từ chối do Farming Score (${currentScore}/${MAX_FARMING}) không đạt chuẩn thế chấp`, hash);
          showToast(`❌ Từ chối Token hóa: Vi phạm thực địa (Score: ${currentScore})`);
          setOracleModal({ isOpen: false, status: "idle", invoiceId: null, nongHoId: null });
        }, 3000);
      } else {
        setOracleModal(m => ({ ...m, status: "success" }));
        setTimeout(() => {
          const hash = generateHash();
          const tokenId = `TKN-${hash.substring(0, 6).toUpperCase()}`;
          setInvoices(prev => prev.map(inv => inv.id === invoice.id ? { ...inv, trangThai: "Đã token hóa", tokenId } : inv));
          logBlockchain("INVOICE_TOKENIZED", `Mã HĐ: ${invoice.id} → Token: ${tokenId}. Farming Score: ${currentScore}/${MAX_FARMING} (Đạt)`, hash);
          showToast(`✅ Phát hành ${tokenId} thành công`);
          setOracleModal({ isOpen: false, status: "idle", invoiceId: null, nongHoId: null });
        }, 1500);
      }
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
    setInvoices(prev => prev.map(inv => inv.id === invoice.id ? { ...inv, trangThai: "Đã tất toán" } : inv));
    const farmer = farmers.find(f => f.id === invoice.nongHoId);
    const fScore = farmer?.farmingScore ?? 0;
    const premium = getPremiumPerKg(fScore);
    const fsPct = Math.round((fScore / MAX_FARMING) * 100);
    logBlockchain("LOAN_REPAID_ON_TIME", `HĐ ${invoice.id} tất toán đúng hạn. Token ${invoice.tokenId ?? "—"} đã đốt. Premium +${premium}đ/kg (FS ${fsPct}%).`);
    setFarmers(prev => prev.map(f => {
      if (f.id !== invoice.nongHoId) return f;
      const newCredit = Math.min(400, (f.creditScore ?? 0) + 300);
      const newLimit = f.hanMucTinDung + 5000000;
      logBlockchain("CREDIT_UPDATED", `[+300 Credit] ${f.hoTen} đủ SL + trả nợ đúng hạn → ${newCredit}/400. HM ${(newLimit/1e6).toFixed(0)}Tr.`);
      return { ...f, creditScore: newCredit, hanMucTinDung: newLimit };
    }));
    showToast(`💵 Tất toán! +300 Credit · ${premium > 0 ? `+${premium}đ/kg premium` : "không premium"}`);
  };

  const handleDeclareDefault = (invoice) => {
    setInvoices(prev => prev.map(inv =>
      inv.id === invoice.id ? { ...inv, trangThai: "Nợ xấu", recourseStatus: "DEFAULTED" } : inv
    ));
    logBlockchain("LOAN_DEFAULT", `HĐ ${invoice.id} (${invoice.tokenId}) — Thiên tai. Kích hoạt Oracle & Bảo hiểm.`);
    setDisasterModal({ isOpen: true, step: 0, data: invoice, insuranceAmount: null, recourseAmount: null });
    showToast("🌊 Khai báo thiên tai — Oracle xác minh...");
    setTimeout(() => {
      const insuranceAmount = Math.round(invoice.amount * 0.8);
      const recourseAmount = Math.round(invoice.amount * 0.2);
      setInvoices(prev => prev.map(inv => inv.id === invoice.id ? { ...inv, recourseStatus: "INSURANCE_CLAIMED", insurancePayout: insuranceAmount } : inv));
      logBlockchain("INSURANCE_TRIGGERED", `Bảo hiểm chi ${formatVND(insuranceAmount)} | Lộc Trời recourse ${formatVND(recourseAmount)}`);
      setDisasterModal(m => ({ ...m, step: 1, insuranceAmount, recourseAmount }));
      setTimeout(() => {
        setInvoices(prev => prev.map(inv => inv.id === invoice.id ? { ...inv, trangThai: "Đã tất toán", recourseStatus: "RECOURSE_SETTLED" } : inv));
        logBlockchain("RECOURSE_SETTLED", `HĐ ${invoice.id} tất toán. Lộc Trời hoàn trả ngân hàng theo cam kết bảo lãnh.`);
        setDisasterModal(m => ({ ...m, step: 2 }));
        showToast("✅ Recourse tất toán");
      }, 2500);
    }, 2500);
  };

  // ─── Computed ─────────────────────────────────────────────────────────────
  const disbursedAmount = invoices.filter(i => i.trangThai === "Đã giải ngân").reduce((s, i) => s + i.amount, 0);
  const pendingAmount = invoices.filter(i => i.trangThai !== "Đã giải ngân").reduce((s, i) => s + i.amount, 0);
  const totalArea = farmers.reduce((s, f) => s + f.dienTich, 0);
  const stateCounts = {
    "Chờ xác nhận": invoices.filter(i => i.trangThai === "Chờ xác nhận").reduce((s, i) => s + i.amount, 0),
    "Đã token hóa": invoices.filter(i => i.trangThai === "Đã token hóa").reduce((s, i) => s + i.amount, 0),
    "Chào bán ngân hàng": invoices.filter(i => i.trangThai === "Chào bán ngân hàng").reduce((s, i) => s + i.amount, 0),
    "Đã giải ngân": disbursedAmount,
  };

  const sharedProps = {
    farmers, supplies, invoices, supplyRequests, blockchainLog, transactions, droneReports, deliveryQueue, staff,
    disbursedAmount, pendingAmount, totalArea, stateCounts, formatVND, GIA_LUA,
  };

  // ─── Login & default tab ──────────────────────────────────────────────────
  const defaultTabFor = (user) => {
    if (user.role === "loctroi") {
      const map = { manager: "managerHome", fieldOfficer: "officerHome", droneOperator: "droneHome", driver: "driverHome", procurement: "procurementHome" };
      return map[user.subrole] ?? "managerHome";
    }
    if (user.role === "bank") return "scf";
    return "farmerPortal";
  };

  const handleLogin = (user) => {
    setCurrentUser(user);
    setActiveTab(defaultTabFor(user));
    setIsSidebarOpen(false);
  };
  const handleLogout = () => { setCurrentUser(null); setActiveTab(""); setIsSidebarOpen(false); };

  if (!currentUser) {
    return <GlobalLogin farmers={farmers} staff={staff} blockchainLog={blockchainLog} onLogin={handleLogin} />;
  }

  // Filter blockchain log for farmer (private view)
  const visibleBlockchainLog = currentUser.role === "farmer"
    ? blockchainLog.filter(l => l.data?.includes(currentUser.profile.hoTen) || l.data?.includes(currentUser.profile.id))
    : blockchainLog;

  return (
    <div className="flex w-screen h-screen overflow-hidden bg-[#f6f8f5]">
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        .fade-in { animation: fadeIn 0.32s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
        @keyframes spinAnim { to { transform: rotate(360deg); } }
        .spin { animation: spinAnim 1s linear infinite; }
        @keyframes ping { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(1.5)} }
        .ping { animation: ping 1.4s cubic-bezier(0.22, 1, 0.36, 1) infinite; }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cdd6c8; border-radius: 999px; border: 2px solid transparent; background-clip: padding-box; }
        ::-webkit-scrollbar-thumb:hover { background: #aab5a3; border: 2px solid transparent; background-clip: padding-box; }
        .tabular { font-variant-numeric: tabular-nums; }
        .hairline { box-shadow: inset 0 0 0 1px rgb(15 23 42 / 0.06); }
      `}} />

      <Sidebar
        activeTab={activeTab}
        setActiveTab={(id) => { setActiveTab(id); setIsSidebarOpen(false); }}
        blockchainLog={blockchainLog}
        invoices={invoices}
        role={currentUser.role}
        subrole={currentUser.subrole}
        profile={currentUser.profile}
        onLogout={handleLogout}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      <main className="flex-1 flex flex-col h-full overflow-hidden w-full relative">
        <Header activeTab={activeTab} user={currentUser} setIsSidebarOpen={setIsSidebarOpen} />
        <div className="flex-1 overflow-auto p-6 xl:p-8">
          <div className="max-w-screen-xl mx-auto w-full">

            {/* Manager subrole tabs */}
            {currentUser.role === "loctroi" && currentUser.subrole === "manager" && activeTab === "managerHome" && (
              <StaffHome {...sharedProps} staff={currentUser.profile} />
            )}
            {currentUser.role === "loctroi" && activeTab === "overview" && <OverviewTab {...sharedProps} />}
            {currentUser.role === "loctroi" && activeTab === "farmers" && (
              <FarmersTab {...sharedProps} onApproveRequest={handleApproveRequest} onRejectRequest={handleRejectSupplyRequest} />
            )}
            {currentUser.role === "loctroi" && activeTab === "invoices" && (
              <InvoicesTab {...sharedProps} onVerifyField={handleVerifyField} onSubmitSCF={handleSubmitSCF} onSettleInvoice={handleSettleInvoice} />
            )}

            {/* Field Officer subrole tabs */}
            {currentUser.role === "loctroi" && currentUser.subrole === "fieldOfficer" && activeTab === "officerHome" && (
              <StaffHome {...sharedProps} staff={currentUser.profile} />
            )}
            {currentUser.role === "loctroi" && currentUser.subrole === "fieldOfficer" && activeTab === "onboarding" && (
              <OnboardingTab staff={currentUser.profile} farmers={farmers} blockchainLog={blockchainLog} onCreateFarmer={handleCreateFarmer} />
            )}
            {currentUser.role === "loctroi" && currentUser.subrole === "fieldOfficer" && activeTab === "inspection" && (
              <InspectionTab staff={currentUser.profile} farmers={farmers} droneReports={droneReports} blockchainLog={blockchainLog} onInspect={handleFieldInspection} />
            )}

            {/* Drone Operator tabs */}
            {currentUser.role === "loctroi" && currentUser.subrole === "droneOperator" && activeTab === "droneHome" && (
              <StaffHome {...sharedProps} staff={currentUser.profile} />
            )}
            {currentUser.role === "loctroi" && currentUser.subrole === "droneOperator" && activeTab === "droneUpload" && (
              <DroneOperatorTab staff={currentUser.profile} farmers={farmers} droneReports={droneReports} blockchainLog={blockchainLog} onSubmitDroneReport={handleSubmitDroneReport} />
            )}

            {/* Driver tabs */}
            {currentUser.role === "loctroi" && currentUser.subrole === "driver" && activeTab === "driverHome" && (
              <StaffHome {...sharedProps} staff={currentUser.profile} />
            )}
            {currentUser.role === "loctroi" && currentUser.subrole === "driver" && activeTab === "delivery" && (
              <DeliveryTab staff={currentUser.profile} deliveryQueue={deliveryQueue} farmers={farmers} supplies={supplies} blockchainLog={blockchainLog} onConfirmDelivery={handleConfirmDelivery} formatVND={formatVND} />
            )}

            {/* Procurement tabs */}
            {currentUser.role === "loctroi" && currentUser.subrole === "procurement" && activeTab === "procurementHome" && (
              <StaffHome {...sharedProps} staff={currentUser.profile} />
            )}
            {currentUser.role === "loctroi" && currentUser.subrole === "procurement" && activeTab === "harvest" && (
              <HarvestTab staff={currentUser.profile} farmers={farmers} transactions={transactions} invoices={invoices} blockchainLog={blockchainLog} onSettleHarvest={handleSettleHarvest} formatVND={formatVND} basePrice={GIA_LUA} />
            )}

            {/* Bank */}
            {currentUser.role === "bank" && activeTab === "scf" && (
              <SCFTab {...sharedProps} onDisburse={handleDisburse} onReject={handleRejectSCF} onDeclareDefault={handleDeclareDefault} />
            )}

            {/* Farmer */}
            {currentUser.role === "farmer" && activeTab === "farmerPortal" && (
              <FarmerPortalTab
                {...sharedProps}
                farmer={currentUser?.profile}
                onSubmitSCF={handleSubmitSCF}
                onRequestSupply={(farmer) => setSupplyModal(m => ({ ...m, isOpen: true, farmer }))}
                onReportHarvest={handleReportHarvest}
              />
            )}
          </div>
        </div>
      </main>

      {/* Ledger FAB */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
        {ledgerOpen && <LedgerPanel blockchainLog={visibleBlockchainLog} onClose={() => setLedgerOpen(false)} />}
        <button
          onClick={() => setLedgerOpen(v => !v)}
          className="group inline-flex items-center gap-2.5 bg-slate-900 hover:bg-slate-800 text-white pl-3 pr-4 py-2.5 rounded-full text-[14px] font-semibold tracking-tight transition-colors ring-1 ring-white/10 shadow-[0_8px_24px_-12px_rgba(15,23,42,0.45)]"
        >
          <span className="relative flex items-center justify-center w-5 h-5">
            <span className="absolute inset-0 rounded-full bg-emerald-400/30 ping"></span>
            <span className="relative w-1.5 h-1.5 rounded-full bg-emerald-300"></span>
          </span>
          <span className="tabular">{visibleBlockchainLog.length}</span>
          <span className="text-white/70 font-normal">blocks</span>
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
