import { useState, useEffect } from "react";
import { doc, onSnapshot, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "./firebase";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import OverviewTab from "./components/OverviewTab";
import FarmersTab from "./components/FarmersTab";
import InvoicesTab from "./components/InvoicesTab";
import SCFTab from "./components/SCFTab";
import FarmerPortalTab from "./components/FarmerPortalTab";
import InspectionTab from "./components/InspectionTab";
import OnboardingTab from "./components/OnboardingTab";
import RegistrationsTab from "./components/RegistrationsTab";
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
import BuyerSalesTab from "./components/BuyerSalesTab";
import { getTier, getPremiumPerKg, getScfTrack, MAX_FARMING, TIERS, SENIOR_PCT, JUNIOR_PCT, INSURANCE_FEE_PCT, SCF_TRACK, BUYER_EXPORT_PRICE, calcBankDiscount, BUYER_INV_STATUS, CREDIT_EVENTS, STABILITY_BONUS_INTERVAL, clampCredit } from "./lib/scoring";
import { initialStaff } from "./lib/staff";
import { initialBuyers } from "./lib/buyers";

export const generateHash = () => Math.random().toString(16).substring(2, 10);
export const generateId = (prefix) => prefix + Math.random().toString(36).substring(2, 6).toUpperCase();
export const formatVND = (n) => (n || 0).toLocaleString("vi-VN") + " VNĐ";

export const initialFarmers = [
  { id: "LT001", digitalId: "LT001", htx: "HTX Thoại Sơn", hoTen: "Nguyễn Văn An", diaChi: "Thoại Sơn, An Giang", dienTich: 12.5, creditScore: 280, farmingScore: 480, hanMucTinDung: 120000000, vuMuaHoanThanh: 4, trangThai: "Đang canh tác" },
  { id: "LT002", digitalId: "LT002", htx: "HTX Châu Phú", hoTen: "Trần Thị Bích", diaChi: "Châu Phú, An Giang", dienTich: 6.2, creditScore: 320, farmingScore: 520, hanMucTinDung: 80000000, vuMuaHoanThanh: 3, trangThai: "Đang canh tác" },
  { id: "LT003", digitalId: "LT003", htx: "HTX Tri Tôn", hoTen: "Lê Văn Cường", diaChi: "Tri Tôn, An Giang", dienTich: 15.0, creditScore: 200, farmingScore: 280, hanMucTinDung: 150000000, vuMuaHoanThanh: 2, trangThai: "Đang canh tác" },
  { id: "LT004", digitalId: "LT004", htx: "HTX Vĩnh Thạnh", hoTen: "Phạm Văn Dũng", diaChi: "Vĩnh Thạnh, Cần Thơ", dienTich: 2.5, creditScore: 80, farmingScore: 160, hanMucTinDung: 40000000, vuMuaHoanThanh: 1, trangThai: "Cảnh báo" },
  { id: "LT005", digitalId: "LT005", htx: "HTX Cờ Đỏ", hoTen: "Hoàng Thị Em", diaChi: "Cờ Đỏ, Cần Thơ", dienTich: 8.8, creditScore: 300, farmingScore: 460, hanMucTinDung: 95000000, vuMuaHoanThanh: 3, trangThai: "Đang canh tác" },
  { id: "LT006", digitalId: "LT006", htx: "HTX Tân Hiệp", hoTen: "Đinh Văn Phúc", diaChi: "Tân Hiệp, Kiên Giang", dienTich: 10.5, creditScore: 180, farmingScore: 320, hanMucTinDung: 110000000, vuMuaHoanThanh: 2, trangThai: "Đang canh tác" },
  { id: "LT007", digitalId: "LT007", htx: "HTX Châu Thành", hoTen: "Vũ Thị Giang", diaChi: "Châu Thành, Đồng Tháp", dienTich: 4.2, creditScore: 350, farmingScore: 500, hanMucTinDung: 65000000, vuMuaHoanThanh: 5, trangThai: "Đang canh tác" },
  { id: "LT008", digitalId: "LT008", htx: "HTX Thanh Bình", hoTen: "Bùi Văn Hải", diaChi: "Thanh Bình, Đồng Tháp", dienTich: 1.8, creditScore: 60, farmingScore: 140, hanMucTinDung: 20000000, vuMuaHoanThanh: 1, trangThai: "Cảnh báo" },
  { id: "LT009", digitalId: "LT009", htx: "HTX Thoại Sơn", hoTen: "Ngô Thị Thu", diaChi: "Thoại Sơn, An Giang", dienTich: 7.5, creditScore: 240, farmingScore: 380, hanMucTinDung: 85000000, vuMuaHoanThanh: 2, trangThai: "Đang canh tác" },
  { id: "LT010", digitalId: "LT010", htx: "HTX Hòn Đất", hoTen: "Lý Văn Tám", diaChi: "Hòn Đất, Kiên Giang", dienTich: 20.0, creditScore: 200, farmingScore: 280, hanMucTinDung: 220000000, vuMuaHoanThanh: 3, trangThai: "Đang canh tác" },
];

export const initialSupplies = [
  { id: "S001", ten: "Giống lúa OM5451", donVi: "kg", donGia: 45000 },
  { id: "S002", ten: "Phân NPK 20-20-15", donVi: "kg", donGia: 12000 },
  { id: "S003", ten: "Thuốc BVTV sinh học", donVi: "chai", donGia: 85000 },
  { id: "S004", ten: "Thuốc trừ sâu rầy", donVi: "chai", donGia: 120000 },
  { id: "S005", ten: "Giống lúa Đài Thơm 8", donVi: "kg", donGia: 50000 },
  { id: "S006", ten: "Phân hữu cơ vi sinh", donVi: "bao", donGia: 250000 },
  { id: "S007", ten: "Thuốc rải diệt cỏ mầm", donVi: "gói", donGia: 95000 },
  { id: "S008", ten: "Phân Ure Cà Mau", donVi: "kg", donGia: 15000 },
];

export const GIA_LUA = 8500; // VNĐ/kg cơ sở bao tiêu

const App = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("");
  const [staff] = useState(initialStaff);
  const [supplies] = useState(initialSupplies);

  const [farmers, setFarmersLocal] = useState(initialFarmers);
  const [transactions, setTransactionsLocal] = useState([]);
  const [invoices, setInvoicesLocal] = useState([]);
  const [supplyRequests, setSupplyRequestsLocal] = useState([]);
  const [deliveryQueue, setDeliveryQueueLocal] = useState([]);
  const [droneReports, setDroneReportsLocal] = useState([]);
  const [farmerApplications, setFarmerApplicationsLocal] = useState([]);
  const [insurancePool, setInsurancePoolLocal] = useState(0);

  // ─── V3: Buyer Receivables ─────────────────────────────────────────────────
  // BuyerInvoice = khoản phải thu của LT với Buyer xuất khẩu (Vinafood, Cargill…).
  // Đây là tài sản đảm bảo CHÍNH cho factoring với bank — giải quyết tắc nghẽn dòng tiền.
  // harvestLots = các lô lúa đã thu mua từ farmer, sẵn sàng gom thành buyer invoice.
  const [buyerInvoices, setBuyerInvoicesLocal] = useState([]);
  const [harvestLots, setHarvestLotsLocal] = useState([]);
  const [buyers] = useState(initialBuyers);
  const [blockchainLog, setBlockchainLogLocal] = useState([
    { timestamp: new Date().toISOString(), hash: generateHash(), action: "GENESIS_BLOCK", data: "Khởi tạo hệ thống LocTroi AgriChain v2.0" }
  ]);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "agrichain", "globalState"), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.farmers) setFarmersLocal(data.farmers);
        if (data.transactions) setTransactionsLocal(data.transactions);
        if (data.invoices) setInvoicesLocal(data.invoices);
        if (data.supplyRequests) setSupplyRequestsLocal(data.supplyRequests);
        if (data.deliveryQueue) setDeliveryQueueLocal(data.deliveryQueue);
        if (data.droneReports) setDroneReportsLocal(data.droneReports);
        if (data.blockchainLog) setBlockchainLogLocal(data.blockchainLog);
        if (data.farmerApplications) setFarmerApplicationsLocal(data.farmerApplications);
        if (typeof data.insurancePool === "number") setInsurancePoolLocal(data.insurancePool);
        if (data.buyerInvoices) setBuyerInvoicesLocal(data.buyerInvoices);
        if (data.harvestLots) setHarvestLotsLocal(data.harvestLots);
      } else {
        setDoc(doc(db, "agrichain", "globalState"), {
          farmers: initialFarmers,
          transactions: [],
          invoices: [],
          supplyRequests: [],
          deliveryQueue: [],
          droneReports: [],
          farmerApplications: [],
          insurancePool: 0,
          buyerInvoices: [],
          harvestLots: [],
          blockchainLog: [{ timestamp: new Date().toISOString(), hash: generateHash(), action: "GENESIS_BLOCK", data: "Khởi tạo hệ thống LocTroi AgriChain v2.0" }]
        });
      }
    });
    return () => unsub();
  }, []);

  const setFarmers = (val) => setFarmersLocal(prev => { const n = typeof val === "function" ? val(prev) : val; setDoc(doc(db, "agrichain", "globalState"), { farmers: n }, { merge: true }); return n; });
  const setTransactions = (val) => setTransactionsLocal(prev => { const n = typeof val === "function" ? val(prev) : val; setDoc(doc(db, "agrichain", "globalState"), { transactions: n }, { merge: true }); return n; });
  const setInvoices = (val) => setInvoicesLocal(prev => { const n = typeof val === "function" ? val(prev) : val; setDoc(doc(db, "agrichain", "globalState"), { invoices: n }, { merge: true }); return n; });
  const setSupplyRequests = (val) => setSupplyRequestsLocal(prev => { const n = typeof val === "function" ? val(prev) : val; setDoc(doc(db, "agrichain", "globalState"), { supplyRequests: n }, { merge: true }); return n; });
  const setDeliveryQueue = (val) => setDeliveryQueueLocal(prev => { const n = typeof val === "function" ? val(prev) : val; setDoc(doc(db, "agrichain", "globalState"), { deliveryQueue: n }, { merge: true }); return n; });
  const setDroneReports = (val) => setDroneReportsLocal(prev => { const n = typeof val === "function" ? val(prev) : val; setDoc(doc(db, "agrichain", "globalState"), { droneReports: n }, { merge: true }); return n; });
  const setBlockchainLog = (val) => setBlockchainLogLocal(prev => { const n = typeof val === "function" ? val(prev) : val; setDoc(doc(db, "agrichain", "globalState"), { blockchainLog: n }, { merge: true }); return n; });
  const setFarmerApplications = (val) => setFarmerApplicationsLocal(prev => { const n = typeof val === "function" ? val(prev) : val; setDoc(doc(db, "agrichain", "globalState"), { farmerApplications: n }, { merge: true }); return n; });
  const setInsurancePool = (val) => setInsurancePoolLocal(prev => { const n = typeof val === "function" ? val(prev) : val; setDoc(doc(db, "agrichain", "globalState"), { insurancePool: n }, { merge: true }); return n; });
  const setBuyerInvoices = (val) => setBuyerInvoicesLocal(prev => { const n = typeof val === "function" ? val(prev) : val; setDoc(doc(db, "agrichain", "globalState"), { buyerInvoices: n }, { merge: true }); return n; });
  const setHarvestLots = (val) => setHarvestLotsLocal(prev => { const n = typeof val === "function" ? val(prev) : val; setDoc(doc(db, "agrichain", "globalState"), { harvestLots: n }, { merge: true }); return n; });

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
      vuMuaHoanThanh: 0,            // hộ mới chưa có vụ → SCF Track 2 (tranching) vụ đầu
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

  // ─── Nông dân tự đăng ký ─ ghi vào hàng chờ duyệt của Giám đốc ─────────────
  const handleSubmitRegistration = (form) => {
    const trimmedSdt = String(form.sdt || "").trim();
    const dupApp = farmerApplications.find(a => a.sdt === trimmedSdt && a.status === "Chờ duyệt");
    if (dupApp) {
      return { ok: false, error: `Đã có đơn chờ duyệt với SĐT này (mã ${dupApp.id}). Vui lòng tra cứu trạng thái.` };
    }
    const appId = "APP-" + Math.random().toString(36).substring(2, 7).toUpperCase();
    const newApp = {
      id: appId,
      hoTen: form.hoTen.trim(),
      cccd: form.cccd,
      sdt: trimmedSdt,
      diaChi: form.diaChi.trim(),
      htx: form.htx,
      dienTich: parseFloat(form.dienTich),
      giong: form.giong,
      status: "Chờ duyệt",
      submittedAt: new Date().toISOString(),
      reviewedBy: null,
      reviewedAt: null,
      rejectReason: null,
      assignedFarmerId: null,
    };
    setFarmerApplications(prev => [newApp, ...prev]);
    logBlockchain(
      "REGISTRATION_SUBMITTED",
      `[Đăng ký] ${newApp.hoTen} (${newApp.htx} · ${newApp.dienTich}ha) gửi đơn ${appId} — chờ Giám đốc Vùng duyệt.`
    );
    return { ok: true, app: newApp };
  };

  const handleApproveRegistration = (app, manager) => {
    const newFarmer = handleCreateFarmer({
      hoTen: app.hoTen,
      cccd: app.cccd,
      sdt: app.sdt,
      diaChi: app.diaChi,
      htx: app.htx,
      dienTich: app.dienTich,
      giong: app.giong,
      onboardedBy: `${manager.id} (Tự đăng ký · duyệt bởi Giám đốc)`,
    });
    setFarmerApplications(prev => prev.map(a => a.id === app.id
      ? { ...a, status: "Đã duyệt", reviewedBy: manager.id, reviewedAt: new Date().toISOString(), assignedFarmerId: newFarmer.id }
      : a));
    logBlockchain(
      "REGISTRATION_APPROVED",
      `[Duyệt đơn] Giám đốc ${manager.hoTen} duyệt đơn ${app.id} của ${app.hoTen} → cấp Hộ chiếu Số ${newFarmer.id}.`
    );
    showToast(`✅ Đã duyệt ${app.hoTen} — cấp mã ${newFarmer.id}`);
  };

  const handleRejectRegistration = (app, manager, reason) => {
    setFarmerApplications(prev => prev.map(a => a.id === app.id
      ? { ...a, status: "Từ chối", reviewedBy: manager.id, reviewedAt: new Date().toISOString(), rejectReason: reason || "Không đạt điều kiện" }
      : a));
    logBlockchain(
      "REGISTRATION_REJECTED",
      `[Từ chối đơn] Giám đốc ${manager.hoTen} từ chối đơn ${app.id} của ${app.hoTen}. Lý do: ${reason || "Không đạt điều kiện"}.`
    );
    showToast(`❌ Đã từ chối đơn của ${app.hoTen}`);
  };

  const lookupApplication = (sdt) => {
    const s = String(sdt || "").trim();
    if (!s) return null;
    return farmerApplications.find(a => a.sdt === s) ?? null;
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

  // ─── B3: Tài xế confirm giao → +10 Credit, ghi nợ vật tư (KHÔNG tokenize) ─
  // V3: Bỏ hẳn luồng SCF cho farmer. Mỗi lần giao chỉ tạo 1 SupplyDebt đơn giản,
  // sẽ tự trừ vào tiền lúa khi Manager tất toán thu hoạch. Bank KHÔNG còn duyệt
  // từng khoản nhỏ lẻ của farmer — bank chỉ duyệt Buyer Receivables qua Buyer-SCF.
  const handleConfirmDelivery = (delivery, driver) => {
    const supply = supplies.find(s => s.id === delivery.supplyId);
    const tier = TIERS[delivery.tier] ?? TIERS.D;
    const hash = generateHash();
    const total = delivery.total;
    const deposit = Math.round(total * tier.deposit / 100);
    const credit = total - deposit; // phần còn nợ sau cọc

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
      // V3: Ghi nợ vật tư đơn giản — LT tự cấp vốn (lãi 0%), trừ vào tiền lúa cuối vụ.
      const debtInvoice = {
        id: generateId("DEBT-"),
        nongHoId: delivery.farmer.id,
        vuMua: delivery.season,
        amount: credit,
        totalValue: total,
        depositAmount: deposit,
        tier: tier.code,
        vatTuId: delivery.supplyId,
        vatTu: supply.ten,
        soLuong: delivery.quantity,
        donVi: supply.donVi,
        date: new Date().toISOString(),
        trangThai: "Nợ vật tư",            // sẽ chuyển sang "Đã tất toán" khi harvest
        recourseStatus: null,
      };
      setInvoices(prev => [debtInvoice, ...prev]);
      logBlockchain(
        "SUPPLY_DEBT_RECORDED",
        `[V3 Nợ vật tư] LT ghi sổ ${formatVND(credit)} cho ${delivery.farmer.hoTen} (Tier ${tier.code}, lãi 0%) — sẽ cấn trừ vào tiền lúa cuối vụ.`
      );
      showToast(`📒 Đã ghi nợ ${formatVND(credit)} vào sổ LT (sẽ trừ cuối vụ)`);
    } else {
      logBlockchain("CASH_PAYMENT", `[Tier C] ${delivery.farmer.hoTen} thanh toán tiền mặt ${formatVND(total)} — không tạo nợ.`);
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

    // Continuous re-scoring: so sánh tier trước/sau để báo "leo bậc" hoặc "tụt bậc"
    const tierBefore = getTier(farmer).code;
    const updatedFarmer = { ...farmer, farmingScore: newFarmingScore };
    const tierAfter = getTier(updatedFarmer).code;
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

    // Re-scoring liên tục: nếu tier thay đổi → log + show
    if (tierBefore !== tierAfter) {
      const up = TIERS[tierAfter].range[0] > TIERS[tierBefore].range[0];
      logBlockchain(
        up ? "TIER_UPGRADED" : "TIER_DOWNGRADED",
        `[Re-scoring] ${farmer.hoTen} ${up ? "LÊN" : "XUỐNG"} Tier ${tierBefore} → ${tierAfter} sau inspect SRP. ${up ? "Vụ tới đủ điều kiện SCF Track 1 ưu đãi hơn." : "Vụ tới có thể phải qua Track 2 tranching."}`
      );
      showToast(`${up ? "📈" : "📉"} ${farmer.hoTen}: Tier ${tierBefore} → ${tierAfter}`);
    } else {
      showToast(`🧑‍🌾 SRP đã ghi chain: ${passed}/${total} đạt · FS ${newFarmingScore}`);
    }
  };

  // ─── B5: Tất toán thu hoạch ──────────────────────────────────────────────
  const handleSettleHarvest = ({ farmer, yieldKg, pricePerKg, premium, grossPay, debt, netPay, moisture, impurity, operator, relatedInvoices }) => {
    const hash = generateHash();
    // Tất toán tất cả invoice liên quan
    setInvoices(prev => prev.map(inv =>
      relatedInvoices.includes(inv.id) ? { ...inv, trangThai: "Đã tất toán" } : inv
    ));

    // V3: Mỗi lần cân lúa → tạo 1 harvestLot, sẵn sàng gom vào BuyerInvoice
    const lotId = generateId("LOT-");
    const newLot = {
      id: lotId,
      farmerId: farmer.id,
      farmerName: farmer.hoTen,
      yieldKg,
      pricePerKg,
      premium,
      grossPay,
      netPaid: netPay,
      operator: operator.id,
      season: farmer.giong || "—",
      tier: getTier(farmer).code,
      farmingScore: farmer.farmingScore ?? 0,
      moisture,
      impurity,
      date: new Date().toISOString(),
      buyerInvoiceId: null, // chưa gom vào buyer invoice nào
    };
    setHarvestLots(prev => [newLot, ...prev]);

    logBlockchain(
      "HARVEST_SETTLED",
      `[B5 harvestSettlement()] ${operator.id} (${operator.hoTen}) thu mua ${farmer.hoTen}: ${(yieldKg / 1000).toFixed(2)} tấn × ${pricePerKg.toLocaleString("vi-VN")}đ (premium +${premium}đ) = ${formatVND(grossPay)}. Trừ nợ ${formatVND(debt)} → ròng ${formatVND(netPay)}. Độ ẩm ${moisture}% · tạp ${impurity}%. Lô ${lotId} sẵn sàng gom vào hợp đồng xuất khẩu.`,
      hash
    );

    // PDF Credit events: +200 (bán đủ SL cam kết) + +100 (trả nợ đúng hạn) = +300
    // BONUS +50 mỗi STABILITY_BONUS_INTERVAL vụ (PDF: "giao dịch ổn định 1 năm liên tục")
    setFarmers(prev => prev.map(f => {
      if (f.id !== farmer.id) return f;
      const baseBonus = CREDIT_EVENTS.SELL_FULL_QUOTA.delta + CREDIT_EVENTS.REPAY_ON_TIME.delta;
      const newSeasons = (f.vuMuaHoanThanh ?? 0) + 1;
      const stabilityBonus = newSeasons > 0 && newSeasons % STABILITY_BONUS_INTERVAL === 0
        ? CREDIT_EVENTS.STABLE_1_YEAR.delta
        : 0;
      const totalBonus = baseBonus + stabilityBonus;
      const newCredit = clampCredit((f.creditScore ?? 0) + totalBonus);
      const newLimit = (f.hanMucTinDung || 0) + 5000000;
      const oldTier = getTier(f).code;
      const updatedFarmer = { ...f, creditScore: newCredit, vuMuaHoanThanh: newSeasons };
      const newTier = getTier(updatedFarmer).code;
      logBlockchain(
        "CREDIT_HARVEST",
        `[+${totalBonus} Credit] ${f.hoTen}: +${CREDIT_EVENTS.SELL_FULL_QUOTA.delta} đủ SL + +${CREDIT_EVENTS.REPAY_ON_TIME.delta} trả đúng hạn${stabilityBonus ? ` + ${stabilityBonus} ổn định ${newSeasons} vụ` : ""} → ${newCredit}/400. Vụ thứ ${newSeasons}.`
      );
      if (stabilityBonus > 0) {
        logBlockchain("CREDIT_STABILITY_BONUS", `🏅 [+${stabilityBonus} Credit · PDF: ổn định 1 năm] ${f.hoTen} đã giao dịch ổn định ${newSeasons} vụ liên tục.`);
      }
      if (oldTier !== newTier) {
        logBlockchain("TIER_UPGRADE", `🎉 ${f.hoTen} thăng hạng Tier ${oldTier} → Tier ${newTier}!`);
      }
      return { ...f, creditScore: newCredit, hanMucTinDung: newLimit, vuMuaHoanThanh: newSeasons };
    }));

    showToast(`🌾 Tất toán ${farmer.hoTen}: ròng ${formatVND(netPay)} · +300 Credit · +1 vụ`);
  };

  // ─── V3: Vi phạm bao tiêu — bán lúa ra ngoài (PDF: −500 Credit) ──────────
  // Manager gọi khi phát hiện farmer bán lúa cho thương lái ngoài thay vì giao đủ
  // cho LT theo hợp đồng bao tiêu. Penalty cứng theo PDF.
  const handleViolateOfftake = (farmer, manager, evidence) => {
    const delta = CREDIT_EVENTS.VIOLATE_OFFTAKE.delta; // -500
    setFarmers(prev => prev.map(f => {
      if (f.id !== farmer.id) return f;
      const oldTier = getTier(f).code;
      const newCredit = clampCredit((f.creditScore ?? 0) + delta);
      const updated = { ...f, creditScore: newCredit, trangThai: "Cảnh báo" };
      const newTier = getTier(updated).code;
      logBlockchain(
        "CREDIT_VIOLATE_OFFTAKE",
        `[${delta} Credit · VI PHẠM] Giám đốc ${manager.hoTen} ghi nhận ${f.hoTen} bán lúa RA NGOÀI — vi phạm bao tiêu. ${evidence ? `Bằng chứng: ${evidence}. ` : ""}Credit ${newCredit}/400.`
      );
      if (oldTier !== newTier) {
        logBlockchain("TIER_DOWNGRADE", `📉 ${f.hoTen} tụt hạng Tier ${oldTier} → Tier ${newTier} do vi phạm bao tiêu.`);
      }
      return updated;
    }));
    showToast(`⚠ Đã ghi vi phạm bao tiêu cho ${farmer.hoTen} (−500 Credit)`);
  };

  // ─── Farmer self-report harvest (notify procurement) ─────────────────────
  const handleReportHarvest = (farmer) => {
    logBlockchain("HARVEST_REPORTED", `${farmer.hoTen} báo sắp thu hoạch — notification gửi Giám đốc Vùng chuẩn bị xe cân.`);
    showToast(`📞 Đã báo Lộc Trời. Giám đốc Vùng sẽ điều phối phiên cân lúa.`);
  };

  // ─── V3 BUYER-SCF HANDLERS ────────────────────────────────────────────────
  // 1) Manager gom các lô lúa đã thu hoạch → tạo BuyerInvoice + token hóa ngay
  const handleCreateBuyerInvoice = ({ buyer, lotIds, manager, contractRef }) => {
    const lots = harvestLots.filter(l => lotIds.includes(l.id));
    if (lots.length === 0) return;
    const totalKg = lots.reduce((s, l) => s + l.yieldKg, 0);
    const faceValue = totalKg * BUYER_EXPORT_PRICE;
    const tokenHash = generateHash();
    const tokenId = `TKN-BR-${tokenHash.substring(0, 5).toUpperCase()}`;
    const invoiceId = generateId("BINV-");
    const issuedAt = new Date();
    const maturityAt = new Date(issuedAt.getTime() + buyer.paymentTermDays * 24 * 60 * 60 * 1000);
    const discount = calcBankDiscount(faceValue, buyer.paymentTermDays, buyer.creditRating);

    const newBuyerInv = {
      id: invoiceId,
      buyerId: buyer.id,
      buyerName: buyer.hoTen,
      buyerRating: buyer.creditRating,
      lotIds,
      lotCount: lots.length,
      totalKg,
      exportPrice: BUYER_EXPORT_PRICE,
      faceValue,
      paymentTermDays: buyer.paymentTermDays,
      maturityAt: maturityAt.toISOString(),
      issuedAt: issuedAt.toISOString(),
      contractRef: contractRef || `LT-${buyer.id}-${Date.now().toString().slice(-6)}`,
      tokenId,
      tokenHash,
      bankDiscount: discount,
      trangThai: BUYER_INV_STATUS.TOKENIZED,
      managerId: manager.id,
      disbursedAt: null,
      buyerPaidAt: null,
    };
    setBuyerInvoices(prev => [newBuyerInv, ...prev]);
    setHarvestLots(prev => prev.map(l => lotIds.includes(l.id) ? { ...l, buyerInvoiceId: invoiceId } : l));

    logBlockchain(
      "BUYER_INVOICE_TOKENIZED",
      `[Buyer-SCF] Giám đốc ${manager.hoTen} ký HĐ xuất khẩu ${newBuyerInv.contractRef}: ${(totalKg / 1000).toFixed(2)} tấn × ${BUYER_EXPORT_PRICE.toLocaleString("vi-VN")}đ = ${formatVND(faceValue)} cho ${buyer.hoTen} (${buyer.creditRating}, T+${buyer.paymentTermDays}). Token ${tokenId} chào liên minh bank — chiết khấu dự kiến ${formatVND(discount.discountAmount)} (${(discount.discountPct * 100).toFixed(2)}%).`,
      tokenHash
    );
    showToast(`🪙 Đã token hóa HĐ xuất khẩu ${formatVND(faceValue)} → chào bank`);
    return newBuyerInv;
  };

  // 2) Bank duyệt + giải ngân BuyerInvoice (chiết khấu face value)
  const handleDisburseBuyerInvoice = (invoice) => {
    const hash = generateHash();
    const now = new Date().toISOString();
    setBuyerInvoices(prev => prev.map(inv => inv.id === invoice.id
      ? { ...inv, trangThai: BUYER_INV_STATUS.DISBURSED, disbursedAt: now, disburseHash: hash }
      : inv));
    logBlockchain(
      "BUYER_INVOICE_DISBURSED",
      `[Bank-SCF] Liên minh bank giải ngân ${formatVND(invoice.bankDiscount.disbursedAmount)} cho LT trên HĐ ${invoice.contractRef} (face ${formatVND(invoice.faceValue)}, chiết khấu ${formatVND(invoice.bankDiscount.discountAmount)}). LT có tiền NGAY để trả nông dân — dòng tiền không còn tắc nghẽn.`,
      hash
    );
    showToast(`💰 Bank giải ngân ${formatVND(invoice.bankDiscount.disbursedAmount)} — LT có tiền trả nông dân`);
  };

  // 3) Bank từ chối
  const handleRejectBuyerInvoice = (invoice) => {
    setBuyerInvoices(prev => prev.map(inv => inv.id === invoice.id
      ? { ...inv, trangThai: "Bank từ chối" } : inv));
    logBlockchain("BUYER_INVOICE_REJECTED", `[Bank-SCF] Bank từ chối token ${invoice.tokenId} (HĐ ${invoice.contractRef}). LT có thể chào bank khác hoặc giữ HĐ đến hạn.`);
    showToast("❌ Bank đã từ chối token");
  };

  // 4) Buyer thanh toán đến hạn — bank thu tiền, token đốt
  const handleBuyerPayoff = (invoice) => {
    const hash = generateHash();
    const now = new Date().toISOString();
    setBuyerInvoices(prev => prev.map(inv => inv.id === invoice.id
      ? { ...inv, trangThai: BUYER_INV_STATUS.BUYER_PAID, buyerPaidAt: now, payoffHash: hash } : inv));
    logBlockchain(
      "BUYER_PAYOFF",
      `[Buyer-Payoff] ${invoice.buyerName} thanh toán ${formatVND(invoice.faceValue)} cho liên minh bank trên HĐ ${invoice.contractRef}. Token ${invoice.tokenId} đã đốt. Đóng deal — vòng vốn hoàn tất.`,
      hash
    );
    showToast(`✅ ${invoice.buyerName} đã trả ${formatVND(invoice.faceValue)} — token đốt`);
  };

  // ─── SCF / Insurance handlers (giữ logic cũ) ─────────────────────────────
  const handleVerifyField = (invoice) => {
    const farmer = farmers.find(f => f.id === invoice.nongHoId);
    const currentScore = farmer?.farmingScore || 0;
    const isPassing = currentScore >= 250; // Ngưỡng đạt chuẩn SRP để đúc Token
    const isJunior = invoice.tranche === "Junior";
    const trancheTag = isJunior ? "[Junior tranche] " : "";

    setOracleModal({ isOpen: true, status: "loading", invoiceId: invoice.id, nongHoId: invoice.nongHoId });
    setTimeout(() => {
      // Đánh giá dựa trên dữ liệu THỰC TẾ từ đội 3 Cùng & drone scan
      if (!isPassing) {
        setOracleModal(m => ({ ...m, status: "failed" }));
        setTimeout(() => {
          const hash = generateHash();
          setInvoices(prev => prev.map(inv => inv.id === invoice.id ? { ...inv, trangThai: "Từ chối duyệt vay" } : inv));
          logBlockchain("ORACLE_REJECTED", `${trancheTag}Oracle: HĐ ${invoice.id} bị từ chối do Farming Score (${currentScore}/${MAX_FARMING}) không đạt chuẩn thế chấp`, hash);
          showToast(`❌ Từ chối Token hóa: Vi phạm thực địa (Score: ${currentScore})`);
          setOracleModal({ isOpen: false, status: "idle", invoiceId: null, nongHoId: null });
        }, 3000);
      } else {
        setOracleModal(m => ({ ...m, status: "success" }));
        setTimeout(() => {
          const hash = generateHash();
          const tokenId = isJunior ? `TKN-JR-${hash.substring(0, 5).toUpperCase()}` : `TKN-${hash.substring(0, 6).toUpperCase()}`;
          setInvoices(prev => prev.map(inv => inv.id === invoice.id ? { ...inv, trangThai: "Đã token hóa", tokenId } : inv));
          logBlockchain("INVOICE_TOKENIZED", `${trancheTag}Mã HĐ: ${invoice.id} → Token: ${tokenId}. Farming Score: ${currentScore}/${MAX_FARMING} (Đạt). Sẵn sàng chào bank.`, hash);
          showToast(`✅ Phát hành ${tokenId} ${isJunior ? "(Junior)" : ""} thành công`);
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
      logBlockchain("CREDIT_UPDATED", `[+300 Credit] ${f.hoTen} đủ SL + trả nợ đúng hạn → ${newCredit}/400. HM ${(newLimit / 1e6).toFixed(0)}Tr.`);
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
    disbursedAmount, pendingAmount, totalArea, stateCounts, formatVND, GIA_LUA, insurancePool,
    buyerInvoices, buyers, harvestLots,
  };

  // ─── Login & default tab ──────────────────────────────────────────────────
  const defaultTabFor = (user) => {
    if (user.role === "loctroi") {
      const map = { manager: "managerHome", fieldOfficer: "officerHome", driver: "driverHome" };
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

  // ─── DEMO: Reset toàn bộ Firestore + reload (chỉ dùng để test lại từ đầu) ──
  const handleResetDemoData = async () => {
    try {
      await deleteDoc(doc(db, "agrichain", "globalState"));
    } catch (err) {
      console.error("Reset failed:", err);
    }
    // Reload để re-init Firestore document từ initialFarmers
    window.location.reload();
  };

  if (!currentUser) {
    return (
      <GlobalLogin
        farmers={farmers}
        staff={staff}
        blockchainLog={blockchainLog}
        onLogin={handleLogin}
        onSubmitRegistration={handleSubmitRegistration}
        onLookupApplication={lookupApplication}
        onResetDemoData={handleResetDemoData}
      />
    );
  }

  // ─── Tab whitelist (V3) — tránh trắng màn hình nếu activeTab không match ───
  const tabsForRole = (() => {
    if (currentUser.role === "loctroi") {
      const map = {
        manager:      ["managerHome", "registrations", "overview", "farmers", "harvest", "buyerSales"],
        fieldOfficer: ["officerHome", "onboarding", "inspection"],
        driver:       ["driverHome", "delivery"],
      };
      return map[currentUser.subrole] ?? [];
    }
    if (currentUser.role === "bank")   return ["scf"];
    if (currentUser.role === "farmer") return ["farmerPortal"];
    return [];
  })();
  const hasAnyTab = tabsForRole.includes(activeTab);

  // Filter blockchain log for farmer (private view)
  const visibleBlockchainLog = currentUser.role === "farmer"
    ? blockchainLog.filter(l => l.data?.includes(currentUser.profile.hoTen) || l.data?.includes(currentUser.profile.id))
    : blockchainLog;

  return (
    <div className="flex w-screen bg-[#f6f8f5]" style={{ height: "100dvh", minHeight: "100vh", overflow: "hidden" }}>
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
        buyerInvoices={buyerInvoices}
        farmerApplications={farmerApplications}
        role={currentUser.role}
        subrole={currentUser.subrole}
        profile={currentUser.profile}
        onLogout={handleLogout}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      <main className="flex-1 flex flex-col h-full overflow-hidden w-full relative min-w-0">
        <Header activeTab={activeTab} user={currentUser} setIsSidebarOpen={setIsSidebarOpen} />
        <div className="flex-1 overflow-auto px-3 py-4 sm:px-5 sm:py-5 lg:p-6 xl:p-8 safe-pb">
          <div className="max-w-screen-xl mx-auto w-full">

            {/* Manager subrole tabs */}
            {currentUser.role === "loctroi" && currentUser.subrole === "manager" && activeTab === "managerHome" && (
              <StaffHome {...sharedProps} staff={currentUser.profile} />
            )}
            {currentUser.role === "loctroi" && currentUser.subrole === "manager" && activeTab === "registrations" && (
              <RegistrationsTab
                staff={currentUser.profile}
                farmerApplications={farmerApplications}
                onApprove={handleApproveRegistration}
                onReject={handleRejectRegistration}
              />
            )}
            {currentUser.role === "loctroi" && activeTab === "overview" && <OverviewTab {...sharedProps} />}
            {currentUser.role === "loctroi" && activeTab === "farmers" && (
              <FarmersTab {...sharedProps} onApproveRequest={handleApproveRequest} onRejectRequest={handleRejectSupplyRequest} />
            )}
            {currentUser.role === "loctroi" && activeTab === "invoices" && (
              <InvoicesTab {...sharedProps} onVerifyField={handleVerifyField} onSubmitSCF={handleSubmitSCF} onSettleInvoice={handleSettleInvoice} />
            )}

            {/* Manager V3: kiêm Procurement (harvest) + Buyer Sales */}
            {currentUser.role === "loctroi" && currentUser.subrole === "manager" && activeTab === "harvest" && (
              <HarvestTab
                staff={currentUser.profile}
                farmers={farmers}
                transactions={transactions}
                invoices={invoices}
                blockchainLog={blockchainLog}
                onSettleHarvest={handleSettleHarvest}
                onViolateOfftake={handleViolateOfftake}
                formatVND={formatVND}
                basePrice={GIA_LUA}
              />
            )}
            {currentUser.role === "loctroi" && currentUser.subrole === "manager" && activeTab === "buyerSales" && (
              <BuyerSalesTab
                staff={currentUser.profile}
                harvestLots={harvestLots}
                buyerInvoices={buyerInvoices}
                buyers={buyers}
                blockchainLog={blockchainLog}
                formatVND={formatVND}
                onCreateBuyerInvoice={handleCreateBuyerInvoice}
                onBuyerPayoff={handleBuyerPayoff}
              />
            )}

            {/* Field Officer V3: kiêm Drone Operator + 3 Cùng */}
            {currentUser.role === "loctroi" && currentUser.subrole === "fieldOfficer" && activeTab === "officerHome" && (
              <StaffHome {...sharedProps} staff={currentUser.profile} />
            )}
            {currentUser.role === "loctroi" && currentUser.subrole === "fieldOfficer" && activeTab === "onboarding" && (
              <OnboardingTab staff={currentUser.profile} farmers={farmers} blockchainLog={blockchainLog} onCreateFarmer={handleCreateFarmer} />
            )}
            {currentUser.role === "loctroi" && currentUser.subrole === "fieldOfficer" && activeTab === "inspection" && (
              <InspectionTab
                staff={currentUser.profile}
                farmers={farmers}
                droneReports={droneReports}
                blockchainLog={blockchainLog}
                onInspect={handleFieldInspection}
                onSubmitDroneReport={handleSubmitDroneReport}
              />
            )}

            {/* Driver tabs */}
            {currentUser.role === "loctroi" && currentUser.subrole === "driver" && activeTab === "driverHome" && (
              <StaffHome {...sharedProps} staff={currentUser.profile} />
            )}
            {currentUser.role === "loctroi" && currentUser.subrole === "driver" && activeTab === "delivery" && (
              <DeliveryTab staff={currentUser.profile} deliveryQueue={deliveryQueue} farmers={farmers} supplies={supplies} blockchainLog={blockchainLog} onConfirmDelivery={handleConfirmDelivery} formatVND={formatVND} />
            )}

            {/* Bank — duyệt cả Farmer Invoice cũ + Buyer Invoice mới (V3) */}
            {currentUser.role === "bank" && activeTab === "scf" && (
              <SCFTab
                {...sharedProps}
                onDisburse={handleDisburse}
                onReject={handleRejectSCF}
                onDeclareDefault={handleDeclareDefault}
                onDisburseBuyer={handleDisburseBuyerInvoice}
                onRejectBuyer={handleRejectBuyerInvoice}
                onBuyerPayoff={handleBuyerPayoff}
              />
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

            {/* Fallback: nếu activeTab không match bất kỳ route nào (vai trò cũ đã bỏ
                hoặc tab id sai), hiện thông báo + nút logout — tránh trắng màn hình */}
            {!hasAnyTab && (
              <div className="bg-white rounded-2xl border border-amber-200 p-8 text-center max-w-2xl mx-auto mt-8">
                <div className="text-4xl mb-3">⚠️</div>
                <h2 className="text-xl font-display font-semibold text-slate-900">Vai trò hoặc tab không khả dụng</h2>
                <p className="text-[14px] text-slate-600 mt-2 leading-relaxed">
                  Vai trò <b className="font-mono">{currentUser.subrole || currentUser.role}</b> không có tab <b className="font-mono">{activeTab || "(empty)"}</b> trong phiên bản V3.
                  Có thể bạn đăng nhập với tài khoản đã được gộp (Drone Operator → Field Officer, Procurement → Manager).
                </p>
                <div className="mt-5 flex gap-3 justify-center">
                  <button onClick={handleLogout} className="px-5 py-2.5 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 text-[14px]">
                    Đăng xuất & chọn lại tài khoản
                  </button>
                </div>
                <div className="mt-4 text-[12px] text-slate-500">
                  Mã được phép: <span className="font-mono">LT-MGR-001</span>, <span className="font-mono">LT-FO-002</span>, <span className="font-mono">LT-FO-003</span>, <span className="font-mono">LT-DR-005</span>, <span className="font-mono">LT001-LT010</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Ledger FAB */}
      <div
        className="fixed right-4 sm:right-6 z-40 flex flex-col items-end gap-3"
        style={{ bottom: "max(1rem, env(safe-area-inset-bottom))" }}
      >
        {ledgerOpen && <LedgerPanel blockchainLog={visibleBlockchainLog} onClose={() => setLedgerOpen(false)} />}
        <button
          onClick={() => setLedgerOpen(v => !v)}
          className="group inline-flex items-center gap-2 sm:gap-2.5 bg-slate-900 hover:bg-slate-800 text-white pl-2.5 pr-3 sm:pl-3 sm:pr-4 py-2 sm:py-2.5 rounded-full text-[13px] sm:text-[14px] font-semibold tracking-tight transition-colors ring-1 ring-white/10 shadow-[0_8px_24px_-12px_rgba(15,23,42,0.45)]"
        >
          <span className="relative flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5">
            <span className="absolute inset-0 rounded-full bg-emerald-400/30 ping"></span>
            <span className="relative w-1.5 h-1.5 rounded-full bg-emerald-300"></span>
          </span>
          <span className="tabular">{visibleBlockchainLog.length}</span>
          <span className="text-white/70 font-normal hidden xs:inline">blocks</span>
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
