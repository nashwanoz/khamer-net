import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  UserCheck, 
  KeyRound, 
  ShoppingCart, 
  Receipt, 
  Users, 
  Package, 
  ArrowLeftRight, 
  BarChart3, 
  LogOut, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Smartphone, 
  Search, 
  Printer, 
  Send, 
  DollarSign,
  ShieldCheck,
  Building2,
  Trash2,
  Edit,
  FileText,
  CreditCard,
  Layers,
  TrendingUp,
  X,
  History,
  Power,
  UserPlus,
  AlertTriangle,
  FileCheck2,
  ArrowRight,
  User as UserIcon,
  Check,
  Tag,
  MessageCircle,
  Copy,
  Share2,
  Calendar,
  Settings,
  Sliders,
  Database,
  Download,
  Upload,
  HardDrive,
  Cloud,
  RefreshCw,
  Globe,
  Phone,
  MapPin,
  Save,
  CheckCircle
} from 'lucide-react';

interface User {
  id: number;
  userCode: string;
  displayName: string;
  role: 'ADMIN' | 'CASHIER';
  passwordHash: string;
  active: boolean;
}

interface Product {
  id: number;
  name: string;
  barcode: string;
  unitName: string;
  price: number;
  caseUnitName: string;
  caseQuantity: number;
  casePrice: number;
  stockMain: number;
  stockCashier: Record<string, number>;
}

interface Customer {
  id: number;
  name: string;
  mobile: string;
  balance: number;
}

interface InvoiceItem {
  product: Product;
  quantity: number;
  unit: 'unit' | 'case';
  unitName: string;
  unitPrice: number;
  total: number;
}

interface InvoiceItemSummary {
  name: string;
  unitName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Invoice {
  id: string;
  userCode: string;
  userName: string;
  customerName: string;
  customerMobile?: string;
  productName: string;
  quantity: number;
  unit: string;
  paymentType: 'نقدي' | 'آجل';
  total: number;
  date: string;
  previousBalance?: number;
  newBalance?: number;
  items?: InvoiceItemSummary[];
}

interface Bond {
  id: string;
  customerId: number;
  customerName: string;
  userCode: string;
  userName: string;
  type: 'سند قبض' | 'سند صرف';
  amount: number;
  date: string;
  note: string;
  balanceAfter: number;
}

interface SystemSettings {
  companyName: string;
  tagline: string;
  mobile: string;
  address: string;
  currencyName: string;
  currencySymbol: string;
  googleDriveConnected: boolean;
  googleDriveEmail: string;
  lastBackupDate: string;
}

const DEFAULT_SETTINGS: SystemSettings = {
  companyName: 'شبكة خمر اللاسلكية',
  tagline: 'نظام إدارة المبيعات ونقاط البيع السريعة',
  mobile: '776323844',
  address: 'الجمهورية اليمنية',
  currencyName: 'ريال يمني',
  currencySymbol: 'YER',
  googleDriveConnected: false,
  googleDriveEmail: '',
  lastBackupDate: ''
};

export default function App() {
  // Users state
  const [users, setUsers] = useState<User[]>([
    { id: 1, userCode: '1', displayName: 'المدير العام', role: 'ADMIN', passwordHash: '1', active: true },
    { id: 2, userCode: '2', displayName: 'أحمد الكاشير', role: 'CASHIER', passwordHash: '1', active: true },
    { id: 3, userCode: '3', displayName: 'خالد كاشير المساء', role: 'CASHIER', passwordHash: '1234', active: false },
  ]);

  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loginUserCode, setLoginUserCode] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');

  // Active Screen / Tab
  const [activeTab, setActiveTab] = useState<'home' | 'pos' | 'invoices' | 'bonds' | 'products' | 'users' | 'customers' | 'transfer' | 'settings'>('home');

  // Master Data (default products with smaller and larger units for Khamer Wireless Network)
  const DEFAULT_PRODUCTS: Product[] = [
    { id: 1, name: 'كروت ابو 100', barcode: '100001', unitName: 'كرت', price: 90.0, caseUnitName: 'صفحة', caseQuantity: 60, casePrice: 5400.0, stockMain: 500, stockCashier: { '2': 120, '3': 60 } },
    { id: 2, name: 'كرت ابو 200', barcode: '100002', unitName: 'كرت', price: 180.0, caseUnitName: 'صفحة', caseQuantity: 60, casePrice: 10800.0, stockMain: 500, stockCashier: { '2': 120, '3': 60 } },
    { id: 3, name: 'كروت ابو 250', barcode: '100003', unitName: 'كرت', price: 225.0, caseUnitName: 'صفحة', caseQuantity: 60, casePrice: 13500.0, stockMain: 500, stockCashier: { '2': 120, '3': 60 } },
    { id: 4, name: 'كروت ابو 300', barcode: '100004', unitName: 'كرت', price: 270.0, caseUnitName: 'صفحة', caseQuantity: 60, casePrice: 16200.0, stockMain: 500, stockCashier: { '2': 120, '3': 60 } },
    { id: 5, name: 'كروت ابو 500', barcode: '100005', unitName: 'كرت', price: 450.0, caseUnitName: 'صفحة', caseQuantity: 60, casePrice: 27000.0, stockMain: 500, stockCashier: { '2': 120, '3': 60 } },
  ];

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('khamernet_products_v3');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return DEFAULT_PRODUCTS;
  });

  useEffect(() => {
    localStorage.setItem('khamernet_products_v3', JSON.stringify(products));
  }, [products]);

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('khamernet_customers_v3');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return [
      { id: 1, name: 'الشعوبي ماركت', mobile: '783888185', balance: 0.0 },
      { id: 2, name: 'كهروب', mobile: '776323844', balance: 0.0 },
    ];
  });

  useEffect(() => {
    localStorage.setItem('khamernet_customers_v3', JSON.stringify(customers));
  }, [customers]);

  const [invoices, setInvoices] = useState<Invoice[]>([
    { 
      id: '26140001', 
      userCode: '1', 
      userName: 'المدير العام', 
      customerName: 'الشعوبي ماركت', 
      customerMobile: '783888185',
      productName: 'كروت ابو 100', 
      quantity: 1, 
      unit: 'صفحة', 
      paymentType: 'نقدي', 
      total: 5400.0, 
      date: '2026/08/14 10:15', 
      previousBalance: 0,
      newBalance: 0,
      items: [
        { name: 'كروت ابو 100', unitName: 'صفحة', quantity: 1, unitPrice: 5400.0, total: 5400.0 }
      ]
    },
  ]);
    { 
      id: '26240001', 
      userCode: '2', 
      userName: 'أحمد الكاشير', 
      customerName: 'مبيعات نقدية', 
      customerMobile: '',
      productName: 'عصير ربيع برتقال', 
      quantity: 4, 
      unit: 'حبة', 
      paymentType: 'نقدي', 
      total: 10.0, 
      date: '2026/08/14 11:30', 
      previousBalance: 0,
      newBalance: 0,
      items: [
        { name: 'عصير ربيع برتقال', unitName: 'حبة', quantity: 4, unitPrice: 2.5, total: 10.0 }
      ]
    },
  ]);

  const [bonds, setBonds] = useState<Bond[]>([
    { id: 'B26001', customerId: 1, customerName: 'مؤسسة الرياض للتوريد', userCode: '1', userName: 'المدير العام', type: 'سند قبض', amount: 500.0, date: '2026/08/14 - 09:30', note: 'دفعة نقدية تحت الحساب', balanceAfter: 3450.0 }
  ]);

  // Modals
  const [showUserModal, setShowUserModal] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formDisplayName, setFormDisplayName] = useState<string>('');
  const [formUserCode, setFormUserCode] = useState<string>('');
  const [formPassword, setFormPassword] = useState<string>('');
  const [formActive, setFormActive] = useState<boolean>(true);
  const [userError, setUserError] = useState<string>('');

  // Add Customer Modal
  const [showAddCustomerModal, setShowAddCustomerModal] = useState<boolean>(false);
  const [custName, setCustName] = useState<string>('');
  const [custMobile, setCustMobile] = useState<string>('');
  const [custInitialBalance, setCustInitialBalance] = useState<string>('0');

  // Receipt Bond Modal (سند قبض)
  const [showBondModal, setShowBondModal] = useState<boolean>(false);
  const [bondCustomerId, setBondCustomerId] = useState<string>('');
  const [bondAmount, setBondAmount] = useState<string>('');
  const [bondNote, setBondNote] = useState<string>('');

  // Add / Edit Product Modal State (إدارة وإضافة الأصناف بالوحدتين)
  const [showProductModal, setShowProductModal] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productFormName, setProductFormName] = useState<string>('');
  const [productFormBarcode, setProductFormBarcode] = useState<string>('');
  const [productFormUnitName, setProductFormUnitName] = useState<string>('حبة');
  const [productFormPrice, setProductFormPrice] = useState<string>('');
  const [productFormCaseUnitName, setProductFormCaseUnitName] = useState<string>('كرتون');
  const [productFormCaseQuantity, setProductFormCaseQuantity] = useState<string>('24');
  const [productFormCasePrice, setProductFormCasePrice] = useState<string>('');
  const [productFormStockMain, setProductFormStockMain] = useState<string>('100');
  const [productFormError, setProductFormError] = useState<string>('');
  const [productDirSearch, setProductDirSearch] = useState<string>('');

  // -------------------------------------------------------------
  // POS NEW INTERACTIVE STATE
  // -------------------------------------------------------------
  // 1. Customer Search Box (مربع بحث عن العميل)
  const [customerSearchQuery, setCustomerSearchQuery] = useState<string>('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState<boolean>(false);

  // 2. Product Search Box (مربع صغير للبحث عن الأصناف)
  const [productSearchQuery, setProductSearchQuery] = useState<string>('');

  // 3. Selected Product for Quantity & Unit popup / card
  const [selectedProductForQty, setSelectedProductForQty] = useState<Product | null>(null);
  const [posSelectedUnit, setPosSelectedUnit] = useState<'unit' | 'case'>('unit');
  const [posQuantityInput, setPosQuantityInput] = useState<number>(1);

  // 4. POS Cart Items (or current invoice line items)
  const [cartItems, setCartItems] = useState<InvoiceItem[]>([]);
  const [posPaymentType, setPosPaymentType] = useState<'نقدي' | 'آجل'>('نقدي');

  // 5. Customer Directory Search (شاشة دليل العملاء)
  const [customerDirSearch, setCustomerDirSearch] = useState<string>('');

  // 6. POS Exit Confirmation State (تأكيد الخروج عند وجود أصناف بالفاتورة)
  const [showExitPosConfirm, setShowExitPosConfirm] = useState<boolean>(false);
  const [pendingTab, setPendingTab] = useState<string | null>(null);

  // 7. Bonds Search & Receipt Approval Dialog State (سندات القبض وبحث العميل والرسالة المعتمدة)
  const [bondCustomerSearch, setBondCustomerSearch] = useState<string>('');
  const [showBondCustomerDropdown, setShowBondCustomerDropdown] = useState<boolean>(false);
  const [completedBondReceipt, setCompletedBondReceipt] = useState<{
    bondId: string;
    customerName: string;
    customerMobile: string;
    userName: string;
    previousBalance: number;
    amount: number;
    balanceAfter: number;
    date: string;
    note: string;
  } | null>(null);

  // 8. Invoice Completion / Preview Dialog State (معاينة الفاتورة المنبثقة + واتساب وطباعة)
  const [completedInvoiceReceipt, setCompletedInvoiceReceipt] = useState<{
    invoiceId: string;
    paymentType: 'نقدي' | 'آجل';
    date: string;
    userName: string;
    customerName: string;
    customerMobile: string;
    items: InvoiceItemSummary[];
    invoiceTotal: number;
    previousBalance: number;
    finalTotal: number;
  } | null>(null);

  // Notification Toast
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Find Customer with highest debt
  const topDebtor = [...customers].sort((a, b) => b.balance - a.balance)[0];

  // Find Products with stock < 100 in lowest unit (حبة)
  const lowStockProducts = products.filter(p => {
    const totalQty = p.stockMain + Object.values(p.stockCashier).reduce((a: number, b: number) => a + b, 0);
    return totalQty < 100;
  });

  // Filter Customers based on search box
  const filteredCustomers = customers.filter(c => 
    c.name.includes(customerSearchQuery) || c.mobile.includes(customerSearchQuery)
  );

  // Filter Customers for Bonds Search Modal (مربع بحث العملاء للسندات)
  const filteredBondCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(bondCustomerSearch.toLowerCase().trim()) ||
    c.mobile.includes(bondCustomerSearch.trim())
  );

  // -------------------------------------------------------------
  // SYSTEM SETTINGS & BACKUP/RESTORE STATE (تهيئة النظام والنسخ الاحتياطي)
  // -------------------------------------------------------------
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem('khamernet_settings_v2');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return DEFAULT_SETTINGS;
  });

  const [settingsForm, setSettingsForm] = useState<SystemSettings>(systemSettings);
  const [showRestoreModal, setShowRestoreModal] = useState<boolean>(false);
  const [pendingRestoreData, setPendingRestoreData] = useState<any>(null);
  const [restoreError, setRestoreError] = useState<string>('');
  const [googleEmailInput, setGoogleEmailInput] = useState<string>(systemSettings.googleDriveEmail || '');
  const [isSyncingCloud, setIsSyncingCloud] = useState<boolean>(false);

  // Save settings handler
  const handleSaveSettings = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSystemSettings(settingsForm);
    localStorage.setItem('khamernet_settings_v2', JSON.stringify(settingsForm));
    showToast('تم حفظ إعدادات تهيئة النظام بنجاح ✨');
  };

  // Full Database JSON Export (تصدير نسخة احتياطية كاملة)
  const handleExportBackup = (isCloud = false) => {
    const now = new Date();
    const timestamp = now.toISOString().slice(0, 10) + '_' + now.getHours() + '-' + now.getMinutes();
    const backupData = {
      app: 'khamernet_pos',
      version: '2.0',
      exportDate: now.toLocaleString('ar-SA'),
      systemSettings,
      products,
      customers,
      invoices,
      bonds,
      users
    };

    const jsonStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `khamernet_backup_${timestamp}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    const updatedSettings = {
      ...systemSettings,
      lastBackupDate: now.toLocaleString('ar-SA')
    };
    setSystemSettings(updatedSettings);
    setSettingsForm(updatedSettings);
    localStorage.setItem('khamernet_settings_v2', JSON.stringify(updatedSettings));

    if (isCloud) {
      showToast('تم تجهيز وتنزيل ملف النسخة الاحتياطية لمزامنتها مع سحابة جوجل درايف ☁️');
    } else {
      showToast('تم تنزيل النسخة الاحتياطية بنجاح 💾');
    }
  };

  // Handle file upload for restore (قراءة ملف النسخة الاحتياطية)
  const handleFileRestoreSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (!data || (!data.products && !data.customers && !data.invoices && !data.systemSettings)) {
          setRestoreError('الملف المحدد غير صالح أو لا يحتوي على بنية بيانات نظام خمر نت');
          return;
        }
        setPendingRestoreData(data);
        setRestoreError('');
        setShowRestoreModal(true);
      } catch (err) {
        setRestoreError('تعذر قراءة الملف، تأكد من اختيار ملف JSON صالح');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Confirm restore (اعتماد استعادة البيانات)
  const handleConfirmRestore = () => {
    if (!pendingRestoreData) return;

    if (pendingRestoreData.systemSettings) {
      setSystemSettings(pendingRestoreData.systemSettings);
      setSettingsForm(pendingRestoreData.systemSettings);
      localStorage.setItem('khamernet_settings_v2', JSON.stringify(pendingRestoreData.systemSettings));
    }
    if (Array.isArray(pendingRestoreData.products)) {
      setProducts(pendingRestoreData.products);
    }
    if (Array.isArray(pendingRestoreData.customers)) {
      setCustomers(pendingRestoreData.customers);
    }
    if (Array.isArray(pendingRestoreData.invoices)) {
      setInvoices(pendingRestoreData.invoices);
    }
    if (Array.isArray(pendingRestoreData.bonds)) {
      setBonds(pendingRestoreData.bonds);
    }
    if (Array.isArray(pendingRestoreData.users)) {
      setUsers(pendingRestoreData.users);
    }

    setShowRestoreModal(false);
    setPendingRestoreData(null);
    showToast('تمت استعادة كافة البيانات والإعدادات بنجاح 🚀');
  };

  // Connect Google Drive Account (ربط حساب Google Drive)
  const handleConnectGoogleDrive = () => {
    if (!googleEmailInput.trim()) {
      showToast('يرجى كتابة بريد Gmail الخاص بحساب جوجل', 'error');
      return;
    }
    setIsSyncingCloud(true);
    setTimeout(() => {
      const updated: SystemSettings = {
        ...settingsForm,
        googleDriveConnected: true,
        googleDriveEmail: googleEmailInput.trim(),
        lastBackupDate: new Date().toLocaleString('ar-SA')
      };
      setSettingsForm(updated);
      setSystemSettings(updated);
      localStorage.setItem('khamernet_settings_v2', JSON.stringify(updated));
      setIsSyncingCloud(false);
      showToast(`تم ربط حساب Google بنجاح: ${googleEmailInput.trim()} ☁️`);
    }, 600);
  };

  // Disconnect Google Drive
  const handleDisconnectGoogleDrive = () => {
    const updated: SystemSettings = {
      ...settingsForm,
      googleDriveConnected: false,
      googleDriveEmail: ''
    };
    setSettingsForm(updated);
    setSystemSettings(updated);
    localStorage.setItem('khamernet_settings_v2', JSON.stringify(updated));
    showToast('تم إلغاء ربط حساب Google');
  };

  // Navigation with Exit Confirmation for active POS cart (حماية الفاتورة عند الخروج)
  const navigateToTab = (targetTab: string) => {
    if (activeTab === 'pos' && cartItems.length > 0 && targetTab !== 'pos') {
      setPendingTab(targetTab);
      setShowExitPosConfirm(true);
      return;
    }
    if (targetTab === 'settings') {
      setSettingsForm(systemSettings);
      setGoogleEmailInput(systemSettings.googleDriveEmail || '');
    }
    setActiveTab(targetTab);
  };

  // Generate WhatsApp Bond Text (تجهيز رسالة السند للواتساب بالتنسيق المطلوب)
  const getWhatsAppBondText = (data: {
    bondId?: string;
    customerName: string;
    userName?: string;
    date?: string;
    previousBalance: number;
    amount: number;
    balanceAfter: number;
  }) => {
    const prev = data.previousBalance.toFixed(2);
    const amt = data.amount.toFixed(2);
    const sym = systemSettings.currencySymbol;
    let balanceLabel = '';

    if (data.balanceAfter > 0) {
      balanceLabel = `عليكم ${data.balanceAfter.toFixed(2)} ${sym}`;
    } else if (data.balanceAfter < 0) {
      balanceLabel = `لكم ${Math.abs(data.balanceAfter).toFixed(2)} ${sym}`;
    } else {
      balanceLabel = `0.00 ${sym} (تم تسوية الحساب)`;
    }

    return `📄 سند قبض نقدية
${systemSettings.companyName}
رقم السند: ${data.bondId || ''}
تاريخ السند: ${data.date || ''}
صندوق مبيعات: ${data.userName || ''}
--------------------------------
عزيزي العميل (${data.customerName})
رصيدكم السابق (${prev} ${sym})
مبلغ السند (${amt} ${sym})
الاجمالي (${balanceLabel})

شكراً لتعاملكم معنا - ${systemSettings.companyName}`;
  };

  // Send Bond to WhatsApp (نسخ الرسالة وفتح واتساب)
  const handleSendBondWhatsApp = (data: {
    bondId: string;
    customerName: string;
    customerMobile: string;
    userName: string;
    date: string;
    previousBalance: number;
    amount: number;
    balanceAfter: number;
  }) => {
    const msg = getWhatsAppBondText(data);

    // 1. Copy to clipboard
    if (navigator.clipboard) {
      navigator.clipboard.writeText(msg).catch(() => {});
    }

    // 2. Format Mobile number for WhatsApp
    let cleanMobile = data.customerMobile.replace(/\D/g, '');
    if (cleanMobile.startsWith('05')) {
      cleanMobile = '966' + cleanMobile.slice(1);
    } else if (cleanMobile.startsWith('7') && cleanMobile.length === 9) {
      cleanMobile = '967' + cleanMobile;
    }

    const waUrl = cleanMobile 
      ? `https://api.whatsapp.com/send?phone=${cleanMobile}&text=${encodeURIComponent(msg)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;

    window.open(waUrl, '_blank');
    showToast('تم نسخ نص السند للحافظة وجاري فتح واتساب 📱');
  };

  // Generate WhatsApp Invoice Text (تجهيز رسالة الفاتورة للواتساب بالتنسيق المطلوب)
  const getWhatsAppInvoiceText = (data: {
    invoiceId: string;
    customerName: string;
    paymentType: 'نقدي' | 'آجل';
    invoiceTotal: number;
    previousBalance?: number;
    finalTotal?: number;
    date?: string;
    userName?: string;
  }) => {
    const sym = systemSettings.currencySymbol;
    const invAmt = data.invoiceTotal.toFixed(2);
    const finalBal = data.finalTotal !== undefined 
      ? data.finalTotal 
      : (data.previousBalance || 0) + data.invoiceTotal;
    
    let balanceLabel = '';
    if (data.paymentType === 'آجل') {
      if (finalBal > 0) {
        balanceLabel = `عليكم ${finalBal.toFixed(2)} ${sym}`;
      } else if (finalBal < 0) {
        balanceLabel = `لكم ${Math.abs(finalBal).toFixed(2)} ${sym}`;
      } else {
        balanceLabel = `0.00 ${sym} (تمت التصفية)`;
      }
    } else {
      balanceLabel = `تم السداد نقداً (${invAmt} ${sym})`;
    }

    if (data.paymentType === 'آجل') {
      return `📄 فاتورة مبيعات (آجل)
${systemSettings.companyName}
رقم الفاتورة: #${data.invoiceId}
تاريخ الفاتورة: ${data.date || ''}
صندوق مبيعات: ${data.userName || ''}
--------------------------------
عزيزي العميل (${data.customerName})
عليكم فاتورة مبيعات رقم (#${data.invoiceId})
مبلغ الفاتورة (${invAmt} ${sym})
الرصيد الاجمالي (${balanceLabel})

شكراً لتعاملكم معنا - ${systemSettings.companyName}`;
    } else {
      return `📄 فاتورة مبيعات (نقدي)
${systemSettings.companyName}
رقم الفاتورة: #${data.invoiceId}
تاريخ الفاتورة: ${data.date || ''}
صندوق مبيعات: ${data.userName || ''}
--------------------------------
عزيزي العميل (${data.customerName})
فاتورة مبيعات رقم (#${data.invoiceId})
مبلغ الفاتورة (${invAmt} ${sym})
الرصيد الاجمالي (${balanceLabel})

شكراً لتعاملكم معنا - ${systemSettings.companyName}`;
    }
  };

  // Send Invoice to WhatsApp (نسخ الرسالة وفتح واتساب)
  const handleSendInvoiceWhatsApp = (data: {
    invoiceId: string;
    customerName: string;
    customerMobile: string;
    paymentType: 'نقدي' | 'آجل';
    invoiceTotal: number;
    previousBalance?: number;
    finalTotal?: number;
    date?: string;
    userName?: string;
  }) => {
    const msg = getWhatsAppInvoiceText(data);

    // 1. Copy to clipboard
    if (navigator.clipboard) {
      navigator.clipboard.writeText(msg).catch(() => {});
    }

    // 2. Format Mobile number for WhatsApp
    let cleanMobile = (data.customerMobile || '').replace(/\D/g, '');
    if (cleanMobile.startsWith('05')) {
      cleanMobile = '966' + cleanMobile.slice(1);
    } else if (cleanMobile.startsWith('7') && cleanMobile.length === 9) {
      cleanMobile = '967' + cleanMobile;
    }

    const waUrl = cleanMobile 
      ? `https://api.whatsapp.com/send?phone=${cleanMobile}&text=${encodeURIComponent(msg)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;

    window.open(waUrl, '_blank');
    showToast('تم نسخ نص الفاتورة للحافظة وجاري فتح واتساب 📱');
  };

  // Filter Products based on search query (for items outside the top 6 or general search)
  const filteredProducts = productSearchQuery.trim() === '' 
    ? [] 
    : products.filter(p => p.name.includes(productSearchQuery) || p.barcode.includes(productSearchQuery));

  // Current fixed 6 products from inventory
  const fixedSixProducts = products.slice(0, 6);

  // Calculate Next Invoice Number & Date
  const currentYear = '26';
  const docType = '4';
  const nextSeq = String(invoices.length + 1).padStart(4, '0');
  const nextInvoiceNumber = `${currentYear}${currentUser ? currentUser.userCode : '1'}${docType}${nextSeq}`;
  const currentDateFormatted = new Date().toLocaleDateString('ar-SA') + ' ' + new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });

  // Login Handler (ONLY USER CODE & PASSWORD)
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const trimmedCode = loginUserCode.trim();
    if (!trimmedCode) {
      setLoginError('يرجى إدخال كود المستخدم الرقمي');
      return;
    }

    const found = users.find(u => u.userCode === trimmedCode);
    if (!found) {
      setLoginError(`كود المستخدم (${trimmedCode}) غير مسجل بالنظام`);
      return;
    }

    if (!found.active) {
      setLoginError('⛔ هذا الحساب موقوف عن الدخول حالياً! يُرجى مراجعة المدير.');
      return;
    }

    if (loginPassword === found.passwordHash || (found.userCode === '1' && loginPassword === '1')) {
      setCurrentUser(found);
      setActiveTab('home');
      setLoginUserCode('');
      setLoginPassword('');
      showToast(`مرحباً بك ${found.displayName}`);
    } else {
      setLoginError('كلمة المرور غير صحيحة');
    }
  };

  // Save User (Create/Edit)
  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    setUserError('');

    const trimmedCode = formUserCode.trim();
    const trimmedName = formDisplayName.trim();
    const trimmedPass = formPassword.trim();

    if (!trimmedCode || !trimmedName || (!editingUser && !trimmedPass)) {
      setUserError('جميع الحقول الإلزامية مطلوبة');
      return;
    }

    const isDuplicate = users.some(u => 
      u.userCode === trimmedCode && (!editingUser || u.id !== editingUser.id)
    );

    if (isDuplicate) {
      setUserError(`⚠️ خطأ: كود المستخدم (${trimmedCode}) مستخدم مسبقاً! يُرجى اختيار كود آخر.`);
      return;
    }

    if (editingUser) {
      setUsers(users.map(u => {
        if (u.id === editingUser.id) {
          return {
            ...u,
            displayName: trimmedName,
            userCode: trimmedCode,
            passwordHash: trimmedPass ? trimmedPass : u.passwordHash,
            active: formActive
          };
        }
        return u;
      }));
      setShowUserModal(false);
      showToast(`تم تحديث بيانات المستخدم (${trimmedName}) بنجاح`);
    } else {
      const newUser: User = {
        id: Date.now(),
        userCode: trimmedCode,
        displayName: trimmedName,
        role: 'CASHIER',
        passwordHash: trimmedPass,
        active: formActive
      };
      setUsers([...users, newUser]);
      setShowUserModal(false);
      showToast(`تمت إضافة المستخدم (${trimmedName}) بنجاح`);
    }
  };

  // Open Quantity & Unit Selector for a given product
  const handleSelectProduct = (product: Product) => {
    setSelectedProductForQty(product);
    setPosSelectedUnit('unit');
    setPosQuantityInput(1);
    setProductSearchQuery(''); // clear search
  };

  // Confirm adding or setting product quantity & unit to invoice
  const handleConfirmProductQty = () => {
    if (!selectedProductForQty || !currentUser) return;

    const isCase = posSelectedUnit === 'case';
    const unitTitle = isCase ? selectedProductForQty.caseUnitName : selectedProductForQty.unitName;
    const unitPrice = isCase ? selectedProductForQty.casePrice : selectedProductForQty.price;
    const totalAmount = unitPrice * posQuantityInput;
    const pieceEquivalent = isCase ? posQuantityInput * selectedProductForQty.caseQuantity : posQuantityInput;

    const currentStock = currentUser.role === 'ADMIN' 
      ? selectedProductForQty.stockMain 
      : (selectedProductForQty.stockCashier[currentUser.userCode] || 0);

    if (currentStock < pieceEquivalent) {
      showToast(`الكمية غير متوفرة! المتاح: ${currentStock} ${selectedProductForQty.unitName}`, 'error');
      return;
    }

    const newItem: InvoiceItem = {
      product: selectedProductForQty,
      quantity: posQuantityInput,
      unit: posSelectedUnit,
      unitName: unitTitle,
      unitPrice: unitPrice,
      total: totalAmount
    };

    // Add to cart items
    setCartItems([newItem, ...cartItems.filter(item => item.product.id !== selectedProductForQty.id)]);
    setSelectedProductForQty(null);
    showToast(`تمت إضافة ${posQuantityInput} ${unitTitle} (${selectedProductForQty.name})`);
  };

  // Save / Print POS Sale
  const handleExecuteFullSale = () => {
    if (!currentUser) return;
    if (cartItems.length === 0) {
      showToast('يرجى اختيار صنف واحد على الأقل لإصدار الفاتورة', 'error');
      return;
    }

    if (posPaymentType === 'آجل' && !selectedCustomer) {
      showToast('يرجى البحث واختيار العميل للفاتورة الآجلة', 'error');
      return;
    }

    const customerName = posPaymentType === 'نقدي' ? 'مبيعات نقدية' : (selectedCustomer ? selectedCustomer.name : 'مبيعات نقدية');
    const totalInvoiceAmount = cartItems.reduce((acc, curr) => acc + curr.total, 0);

    let newBalance = selectedCustomer?.balance;
    if (posPaymentType === 'آجل' && selectedCustomer) {
      newBalance = selectedCustomer.balance + totalInvoiceAmount;
      setCustomers(customers.map(c => c.id === selectedCustomer.id ? { ...c, balance: newBalance! } : c));
    }

    // Deduct stock for all items
    let updatedProducts = [...products];
    cartItems.forEach(item => {
      const isCase = item.unit === 'case';
      const pieceEquivalent = isCase ? item.quantity * item.product.caseQuantity : item.quantity;
      
      updatedProducts = updatedProducts.map(p => {
        if (p.id === item.product.id) {
          if (currentUser.role === 'ADMIN') {
            return { ...p, stockMain: p.stockMain - pieceEquivalent };
          } else {
            const cashierStk = (p.stockCashier[currentUser.userCode] || 0) - pieceEquivalent;
            return { ...p, stockCashier: { ...p.stockCashier, [currentUser.userCode]: cashierStk } };
          }
        }
        return p;
      });
    });
    setProducts(updatedProducts);

    // Create Invoice Record & Items Summary
    const mainItem = cartItems[0];
    const itemsSummary = cartItems.length === 1 
      ? mainItem.product.name 
      : `${mainItem.product.name} (+${cartItems.length - 1} أصناف)`;

    const invoiceItemsSummary: InvoiceItemSummary[] = cartItems.map(item => ({
      name: item.product.name,
      unitName: item.unitName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.total
    }));

    const prevCustBalance = selectedCustomer ? selectedCustomer.balance : 0;
    const finalCustBalance = posPaymentType === 'آجل' && selectedCustomer ? (selectedCustomer.balance + totalInvoiceAmount) : totalInvoiceAmount;
    const customerMobile = selectedCustomer?.mobile || '';

    const newInv: Invoice = {
      id: nextInvoiceNumber,
      userCode: currentUser.userCode,
      userName: currentUser.displayName,
      customerName: customerName,
      customerMobile: customerMobile,
      productName: itemsSummary,
      quantity: cartItems.reduce((acc, curr) => acc + curr.quantity, 0),
      unit: mainItem.unitName,
      paymentType: posPaymentType,
      total: totalInvoiceAmount,
      date: currentDateFormatted,
      previousBalance: prevCustBalance,
      newBalance: finalCustBalance,
      items: invoiceItemsSummary
    };

    setInvoices([newInv, ...invoices]);

    // Open the invoice receipt preview modal (معاينة الفاتورة المنبثقة للطباعة والواتساب)
    setCompletedInvoiceReceipt({
      invoiceId: nextInvoiceNumber,
      paymentType: posPaymentType,
      date: currentDateFormatted,
      userName: currentUser.displayName,
      customerName: customerName,
      customerMobile: customerMobile,
      items: invoiceItemsSummary,
      invoiceTotal: totalInvoiceAmount,
      previousBalance: prevCustBalance,
      finalTotal: finalCustBalance
    });

    setCartItems([]);
    setSelectedCustomer(null);
    setCustomerSearchQuery('');
    showToast(`تم حفظ الفاتورة #${nextInvoiceNumber} بمبلغ ${totalInvoiceAmount.toFixed(2)} ر.س بنجاح`);
  };

  // Add Customer Handler (مع منع تكرار رقم الجوال)
  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = custName.trim();
    const trimmedMobile = custMobile.trim();

    if (!trimmedName) {
      showToast('يرجى إدخال اسم العميل', 'error');
      return;
    }

    if (!trimmedMobile) {
      showToast('يرجى إدخال رقم جوال العميل', 'error');
      return;
    }

    // التحقق الصارم من عدم تكرار رقم الجوال
    const cleanMobile = trimmedMobile.replace(/\D/g, '');
    const duplicate = customers.find(c => {
      const existingClean = c.mobile.replace(/\D/g, '');
      return (existingClean && cleanMobile && existingClean === cleanMobile) || c.mobile.trim() === trimmedMobile;
    });

    if (duplicate) {
      showToast(`⚠️ رقم الجوال (${trimmedMobile}) مسجل مسبقاً للعميل (${duplicate.name})! لا يمكن تكرار رقم الجوال.`, 'error');
      return;
    }

    const newCust: Customer = {
      id: Date.now(),
      name: trimmedName,
      mobile: trimmedMobile,
      balance: parseFloat(custInitialBalance) || 0
    };

    setCustomers([...customers, newCust]);
    setSelectedCustomer(newCust);
    setShowAddCustomerModal(false);
    setCustName('');
    setCustMobile('');
    setCustInitialBalance('0');
    showToast(`تم إضافة العميل (${newCust.name}) بنجاح`);
  };

  // Create Receipt Bond (سند قبض)
  const handleSaveBond = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find(c => String(c.id) === bondCustomerId);
    const amount = parseFloat(bondAmount);

    if (!cust) {
      showToast('يرجى اختيار العميل', 'error');
      return;
    }
    if (!amount || amount <= 0) {
      showToast('يرجى إدخال مبلغ صحيح', 'error');
      return;
    }

    const previousBalance = cust.balance;
    const newBalance = previousBalance - amount;
    setCustomers(customers.map(c => c.id === cust.id ? { ...c, balance: newBalance } : c));

    const newBond: Bond = {
      id: `B26${String(bonds.length + 1).padStart(3, '0')}`,
      customerId: cust.id,
      customerName: cust.name,
      userCode: currentUser?.userCode || '1',
      userName: currentUser?.displayName || '',
      type: 'سند قبض',
      amount: amount,
      date: currentDateFormatted,
      note: bondNote || 'سداد دفعة نقدية',
      balanceAfter: newBalance
    };

    setBonds([newBond, ...bonds]);
    setShowBondModal(false);
    setBondCustomerId('');
    setBondCustomerSearch('');
    setBondAmount('');
    setBondNote('');
    
    // إظهار بطاقة رسالة اعتماد السند والواتساب والطباعة
    setCompletedBondReceipt({
      bondId: newBond.id,
      customerName: cust.name,
      customerMobile: cust.mobile,
      userName: currentUser?.displayName || 'مستخدم المبيعات',
      previousBalance: previousBalance,
      amount: amount,
      balanceAfter: newBalance,
      date: newBond.date,
      note: newBond.note
    });

    showToast(`تم اعتماد سند قبض بمبلغ ${amount.toFixed(2)} ر.س بنجاح`);
  };

  // -------------------------------------------------------------
  // PRODUCT MANAGEMENT HANDLERS (إدارة وإضافة الأصناف بالوحدتين)
  // -------------------------------------------------------------
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductFormName('');
    setProductFormBarcode(`6281000${String(products.length + 1).padStart(3, '0')}`);
    setProductFormUnitName('حبة');
    setProductFormPrice('');
    setProductFormCaseUnitName('كرتون');
    setProductFormCaseQuantity('24');
    setProductFormCasePrice('');
    setProductFormStockMain('100');
    setProductFormError('');
    setShowProductModal(true);
  };

  const handleOpenEditProduct = (p: Product) => {
    setEditingProduct(p);
    setProductFormName(p.name);
    setProductFormBarcode(p.barcode || '');
    setProductFormUnitName(p.unitName);
    setProductFormPrice(String(p.price));
    setProductFormCaseUnitName(p.caseUnitName);
    setProductFormCaseQuantity(String(p.caseQuantity));
    setProductFormCasePrice(String(p.casePrice));
    setProductFormStockMain(String(p.stockMain));
    setProductFormError('');
    setShowProductModal(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    setProductFormError('');

    const trimmedName = productFormName.trim();
    if (!trimmedName) {
      setProductFormError('يرجى إدخال اسم الصنف');
      return;
    }

    const unitPrice = parseFloat(productFormPrice);
    if (isNaN(unitPrice) || unitPrice <= 0) {
      setProductFormError('يرجى إدخال سعر بيع صحيح للوحدة الصغرى (أكبر من 0)');
      return;
    }

    const caseQty = parseInt(productFormCaseQuantity) || 1;
    if (caseQty <= 0) {
      setProductFormError('يرجى إدخال عدد/سعة صحيحة للوحدة الكبرى (مثال: 24 حبة)');
      return;
    }

    const casePrice = parseFloat(productFormCasePrice);
    if (isNaN(casePrice) || casePrice <= 0) {
      setProductFormError('يرجى إدخال سعر بيع صحيح للوحدة الكبرى (أكبر من 0)');
      return;
    }

    const stockVal = parseInt(productFormStockMain) || 0;
    const barcodeVal = productFormBarcode.trim() || `6281000${String(Date.now()).slice(-4)}`;

    if (editingProduct) {
      // Update product
      setProducts(products.map(p => p.id === editingProduct.id ? {
        ...p,
        name: trimmedName,
        barcode: barcodeVal,
        unitName: productFormUnitName.trim() || 'حبة',
        price: unitPrice,
        caseUnitName: productFormCaseUnitName.trim() || 'كرتون',
        caseQuantity: caseQty,
        casePrice: casePrice,
        stockMain: stockVal
      } : p));
      setShowProductModal(false);
      showToast(`تم تحديث بيانات الصنف (${trimmedName}) بنجاح ✨`);
    } else {
      // Create new product
      const newProduct: Product = {
        id: Date.now(),
        name: trimmedName,
        barcode: barcodeVal,
        unitName: productFormUnitName.trim() || 'حبة',
        price: unitPrice,
        caseUnitName: productFormCaseUnitName.trim() || 'كرتون',
        caseQuantity: caseQty,
        casePrice: casePrice,
        stockMain: stockVal,
        stockCashier: { '2': Math.floor(stockVal * 0.3) }
      };
      setProducts([...products, newProduct]);
      setShowProductModal(false);
      showToast(`تمت إضافة الصنف (${trimmedName}) بالوحدتين بنجاح ✨`);
    }
  };

  const handleDeleteProduct = (productId: number, productName: string) => {
    if (products.length <= 1) {
      showToast('لا يمكن حذف الصنف الوحيد المتبقي في النظام', 'error');
      return;
    }
    setProducts(products.filter(p => p.id !== productId));
    showToast(`تم حذف الصنف (${productName})`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans dir-rtl flex flex-col items-center justify-center p-2 sm:p-4" dir="rtl">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 z-50 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-bold animate-bounce ${toast.type === 'success' ? 'bg-teal-600 text-white' : 'bg-rose-600 text-white'}`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* MOBILE DEVICE CONTAINER */}
      <div className="w-full max-w-[430px] bg-slate-900 text-slate-900 rounded-[40px] shadow-2xl border-8 border-slate-800 overflow-hidden flex flex-col h-[850px] max-h-[98vh] relative">
        
        {/* Top Status Bar */}
        <div className="bg-slate-950 text-slate-300 px-6 py-2 flex items-center justify-between text-xs font-mono select-none">
          <div className="flex items-center gap-1.5 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>خمر نت POS</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-teal-800 text-teal-200 px-1.5 py-0.5 rounded font-sans">Android v1.0</span>
            <Smartphone className="w-3.5 h-3.5 text-teal-400" />
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* VIEW 1: AUTH / LOGIN */}
        {/* ------------------------------------------------------------- */}
        {!currentUser ? (
          <div className="flex-1 bg-gradient-to-b from-slate-950 via-[#102A43] to-[#0F766E] text-white p-6 flex flex-col justify-between overflow-y-auto">
            <div className="text-center pt-4 space-y-3">
              <div className="w-20 h-20 bg-teal-500/20 rounded-3xl mx-auto flex items-center justify-center border-2 border-teal-400/30 shadow-lg shadow-teal-500/20">
                <Building2 className="w-10 h-10 text-teal-300" />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white">خمر نت</h1>
              <p className="text-xs text-teal-200/90 font-medium">نظام المبيعات ونقاط البيع السريعة</p>
            </div>

            <form onSubmit={handleLogin} className="bg-white text-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
              <div className="text-center border-b border-slate-100 pb-3">
                <h2 className="font-bold text-lg text-[#102A43]">تسجيل الدخول</h2>
                <p className="text-xs text-slate-400 mt-0.5">أدخل كود المستخدم الرقمي وكلمة المرور</p>
              </div>

              {loginError && (
                <div className="p-3 rounded-2xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{loginError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">كود المستخدم (رقمي):</label>
                <div className="relative">
                  <input
                    type="number"
                    pattern="[0-9]*"
                    inputMode="numeric"
                    value={loginUserCode}
                    onChange={(e) => setLoginUserCode(e.target.value)}
                    placeholder="مثال: 1 أو 2"
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-[#0F766E] focus:outline-none pl-11"
                    required
                  />
                  <UserCheck className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">كلمة المرور:</label>
                <div className="relative">
                  <input
                    type="password"
                    pattern="[0-9]*"
                    inputMode="numeric"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="كلمة المرور"
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-[#0F766E] focus:outline-none pl-11"
                    required
                  />
                  <KeyRound className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => { setLoginUserCode('1'); setLoginPassword('1'); }}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[11px] font-bold border border-slate-200 transition"
                >
                  دخول المدير (1)
                </button>
                <button
                  type="button"
                  onClick={() => { setLoginUserCode('2'); setLoginPassword('1'); }}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[11px] font-bold border border-slate-200 transition"
                >
                  دخول الكاشير (2)
                </button>
              </div>

              <button
                type="submit"
                className="w-full bg-[#0F766E] hover:bg-[#0d635c] active:scale-[0.98] text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-teal-700/25 transition text-sm flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-5 h-5" />
                <span>دخول النظام</span>
              </button>
            </form>

            <div className="text-center text-[11px] text-teal-200/70 pt-2">
              جميع الحقوق محفوظة Smart Link 2026
            </div>
          </div>
        ) : (
          /* ------------------------------------------------------------- */
          /* VIEW 2: LOGGED-IN APPLICATION */
          /* ------------------------------------------------------------- */
          <div className="flex-1 flex flex-col bg-slate-100 overflow-hidden text-slate-800">
            
            {/* TOP HEADER: ONLY SHOWN ON NON-POS SCREENS (حذف الهيدر العلوي في فاتورة المبيعات) */}
            {activeTab !== 'pos' && (
              <div className="bg-[#102A43] text-white px-4 py-3 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-[#0F766E] text-white font-extrabold flex items-center justify-center text-sm shadow-sm border border-teal-400/30">
                    {currentUser.userCode}
                  </div>
                  <div>
                    <h3 className="font-bold text-xs leading-tight text-white">{currentUser.displayName}</h3>
                    <span className="text-[10px] text-teal-300">
                      {currentUser.role === 'ADMIN' ? 'المدير العام' : 'كاشير مبيعات'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {currentUser.role === 'ADMIN' && (
                    <button
                      onClick={() => navigateToTab('settings')}
                      className={`p-2 rounded-xl transition ${activeTab === 'settings' ? 'text-teal-300 bg-slate-800' : 'text-slate-300 hover:text-teal-300 hover:bg-slate-800/80'}`}
                      title="تهيئة النظام والإعدادات"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                  )}
                  <button 
                    onClick={() => setCurrentUser(null)}
                    className="p-2 rounded-xl text-slate-300 hover:text-rose-300 hover:bg-slate-800/80 transition"
                    title="تسجيل الخروج"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Scrollable Body Content */}
            <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5">
              
              {/* ------------------------------------------------------------- */}
              {/* TAB 1: HOME (الرئيسية) */}
              {/* ------------------------------------------------------------- */}
              {activeTab === 'home' && (
                <div className="space-y-4">
                  {/* Header: ONLY "مرحباً بك [الاسم]" WITHOUT userCode */}
                  <div className="bg-gradient-to-r from-[#102A43] to-[#0F766E] text-white p-5 rounded-3xl shadow-sm space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-teal-200 font-bold uppercase tracking-wider block">{systemSettings.companyName}</span>
                      <span className="text-[10px] bg-teal-800/80 text-teal-200 px-2 py-0.5 rounded-full border border-teal-600/40 font-mono">
                        {systemSettings.currencyName} ({systemSettings.currencySymbol})
                      </span>
                    </div>
                    <h2 className="font-extrabold text-2xl">مرحباً بك {currentUser.displayName}</h2>
                  </div>

                  {/* THREE CENTRAL MAIN ACTION BUTTONS */}
                  <div className="space-y-2">
                    <h3 className="font-extrabold text-xs text-slate-700 px-1">العمليات السريعة الرئيسية:</h3>
                    
                    <div className="grid grid-cols-3 gap-2.5">
                      {/* Button 1: فاتورة مبيعات */}
                      <button
                        onClick={() => navigateToTab('pos')}
                        className="bg-white hover:bg-teal-50 border-2 border-teal-600/30 hover:border-teal-600 rounded-2xl p-3 flex flex-col items-center justify-center text-center shadow-sm transition active:scale-95 group"
                      >
                        <div className="w-11 h-11 rounded-2xl bg-teal-100 text-[#0F766E] flex items-center justify-center mb-1.5 group-hover:scale-110 transition">
                          <ShoppingCart className="w-6 h-6" />
                        </div>
                        <span className="font-extrabold text-xs text-slate-900">فاتورة مبيعات</span>
                        <span className="text-[9px] text-slate-400 mt-0.5">نقطة البيع</span>
                      </button>

                      {/* Button 2: سند قبض */}
                      <button
                        onClick={() => setShowBondModal(true)}
                        className="bg-white hover:bg-amber-50 border-2 border-amber-500/30 hover:border-amber-500 rounded-2xl p-3 flex flex-col items-center justify-center text-center shadow-sm transition active:scale-95 group"
                      >
                        <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mb-1.5 group-hover:scale-110 transition">
                          <FileCheck2 className="w-6 h-6" />
                        </div>
                        <span className="font-extrabold text-xs text-slate-900">سند قبض</span>
                        <span className="text-[9px] text-slate-400 mt-0.5">تحصيل نقد</span>
                      </button>

                      {/* Button 3: إضافة عميل */}
                      <button
                        onClick={() => setShowAddCustomerModal(true)}
                        className="bg-white hover:bg-purple-50 border-2 border-purple-500/30 hover:border-purple-500 rounded-2xl p-3 flex flex-col items-center justify-center text-center shadow-sm transition active:scale-95 group"
                      >
                        <div className="w-11 h-11 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center mb-1.5 group-hover:scale-110 transition">
                          <UserPlus className="w-6 h-6" />
                        </div>
                        <span className="font-extrabold text-xs text-slate-900">إضافة عميل</span>
                        <span className="text-[9px] text-slate-400 mt-0.5">فتح حساب</span>
                      </button>
                    </div>
                  </div>

                  {/* أعلى مديونية عميل */}
                  {topDebtor && (
                    <div className="bg-white p-4 rounded-3xl border border-rose-200/80 shadow-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
                            <CreditCard className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-[11px] font-bold text-slate-500 block">أعلى مديونية عميل</span>
                            <h4 className="font-extrabold text-sm text-slate-900">{topDebtor.name}</h4>
                          </div>
                        </div>
                        <div className="text-left">
                          <span className="text-[10px] text-slate-400 block">المبلغ المطلوب</span>
                          <span className="text-base font-extrabold text-rose-600">{topDebtor.balance.toFixed(2)} {systemSettings.currencySymbol}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* تنبيه نواقص المخزون (أقل من 100 حبة) */}
                  <div className="bg-white p-4 rounded-3xl border border-amber-200 shadow-sm space-y-2.5">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-xl bg-amber-100 text-amber-800">
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-xs text-slate-900">نواقص المخزون (أقل من 100 {products[0]?.unitName || 'حبة'})</h4>
                          <span className="text-[10px] text-slate-500">{lowStockProducts.length} أصناف بحاجة للطلب أو التحويل</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      {lowStockProducts.map(p => {
                        const totalUnits = p.stockMain + Object.values(p.stockCashier).reduce((a: number, b: number) => a + b, 0);
                        return (
                          <div key={p.id} className="flex items-center justify-between bg-amber-50/50 p-2 rounded-xl text-xs">
                            <div className="font-bold text-slate-800">{p.name}</div>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-extrabold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-lg">
                                المتبقي: {totalUnits} {p.unitName}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Navigation Links */}
                  <div className="space-y-2.5 pt-1">
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        onClick={() => navigateToTab('products')}
                        className="bg-white p-3 rounded-2xl border border-teal-200 flex items-center gap-2.5 text-right shadow-sm hover:border-teal-400 bg-teal-50/20 transition"
                      >
                        <Package className="w-4 h-4 text-[#0F766E]" />
                        <div>
                          <div className="font-bold text-xs text-teal-950">دليل وإدارة الأصناف</div>
                          <span className="text-[10px] text-teal-700 font-bold">{products.length} أصناف مسجلة</span>
                        </div>
                      </button>

                      {currentUser.role === 'ADMIN' ? (
                        <button
                          onClick={() => navigateToTab('invoices')}
                          className="bg-white p-3 rounded-2xl border border-slate-200 flex items-center gap-2.5 text-right shadow-sm hover:border-amber-400 transition"
                        >
                          <Receipt className="w-4 h-4 text-amber-700" />
                          <div>
                            <div className="font-bold text-xs">سجل الفواتير</div>
                            <span className="text-[10px] text-slate-400">{invoices.length} فواتير</span>
                          </div>
                        </button>
                      ) : (
                        <button
                          onClick={() => navigateToTab('customers')}
                          className="bg-white p-3 rounded-2xl border border-teal-200 flex items-center gap-2.5 text-right shadow-sm hover:border-teal-400 bg-teal-50/30 transition"
                        >
                          <Users className="w-4 h-4 text-teal-700" />
                          <div>
                            <div className="font-bold text-xs text-teal-950">دليل وبحث العملاء</div>
                            <span className="text-[10px] text-teal-700 font-bold">{customers.length} عملاء</span>
                          </div>
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        onClick={() => navigateToTab('bonds')}
                        className="bg-white p-3 rounded-2xl border border-slate-200 flex items-center gap-2.5 text-right shadow-sm hover:border-teal-400 transition"
                      >
                        <FileText className="w-4 h-4 text-teal-700" />
                        <div>
                          <div className="font-bold text-xs">سجل السندات</div>
                          <span className="text-[10px] text-slate-400">{bonds.length} سندات</span>
                        </div>
                      </button>

                      {currentUser.role === 'ADMIN' ? (
                        <button
                          onClick={() => navigateToTab('customers')}
                          className="bg-white p-3 rounded-2xl border border-slate-200 flex items-center gap-2.5 text-right shadow-sm hover:border-teal-300 transition"
                        >
                          <CreditCard className="w-4 h-4 text-rose-600" />
                          <div>
                            <div className="font-bold text-xs">العملاء والديون</div>
                            <span className="text-[10px] text-slate-400">{customers.length} عملاء</span>
                          </div>
                        </button>
                      ) : (
                        <button
                          onClick={() => navigateToTab('invoices')}
                          className="bg-white p-3 rounded-2xl border border-slate-200 flex items-center gap-2.5 text-right shadow-sm hover:border-amber-400 transition"
                        >
                          <Receipt className="w-4 h-4 text-amber-700" />
                          <div>
                            <div className="font-bold text-xs">سجل الفواتير</div>
                            <span className="text-[10px] text-slate-400">{invoices.length} فواتير</span>
                          </div>
                        </button>
                      )}
                    </div>
                  </div>

                  {currentUser.role === 'ADMIN' && (
                    <>
                      <div className="grid grid-cols-2 gap-2.5">
                        <button
                          onClick={() => navigateToTab('users')}
                          className="bg-white p-3 rounded-2xl border border-purple-200 flex items-center gap-2.5 text-right shadow-sm hover:border-purple-300 transition"
                        >
                          <Users className="w-4 h-4 text-purple-700" />
                          <div>
                            <div className="font-bold text-xs text-purple-900">المستخدمين</div>
                            <span className="text-[10px] text-purple-500">تعديل وإيقاف</span>
                          </div>
                        </button>

                        <button
                          onClick={() => navigateToTab('settings')}
                          className="bg-white p-3 rounded-2xl border border-teal-200 flex items-center gap-2.5 text-right shadow-sm hover:border-teal-300 transition"
                        >
                          <Settings className="w-4 h-4 text-teal-700" />
                          <div>
                            <div className="font-bold text-xs text-teal-900">تهيئة النظام</div>
                            <span className="text-[10px] text-teal-600">الإعدادات والنسخ</span>
                          </div>
                        </button>
                      </div>

                      {/* بطاقة تهيئة النظام وإعدادات Google Drive */}
                      <button
                        onClick={() => navigateToTab('settings')}
                        className="w-full bg-gradient-to-r from-slate-900 via-[#102A43] to-[#0F766E] text-white p-3.5 rounded-2xl flex items-center justify-between shadow-sm hover:opacity-95 active:scale-[0.99] transition border border-teal-500/30"
                      >
                        <div className="flex items-center gap-3 text-right">
                          <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300 shrink-0">
                            <Sliders className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-extrabold text-xs flex items-center gap-1.5">
                              <span>تهيئة النظام والنسخ الاحتياطي</span>
                              <span className="text-[9px] bg-teal-400/20 text-teal-200 px-1.5 py-0.5 rounded font-normal">إعدادات</span>
                            </div>
                            <span className="text-[10px] text-teal-200/80 line-clamp-1">اسم المؤسسة، العملات، وربط Google Drive</span>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-teal-300 shrink-0 rotate-180" />
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* TAB 2: POS (فاتورة المبيعات المحدثة والمختصرة بدون سكرول) */}
              {/* ------------------------------------------------------------- */}
              {activeTab === 'pos' && (
                <div className="flex flex-col h-full space-y-2 select-none">
                  
                  {/* 1. SINGLE LINE HEADER: رقم الفاتورة + التاريخ في سطر واحد بدون هيدر علوي */}
                  <div className="bg-[#102A43] text-white px-3 py-2 rounded-xl shadow-xs flex items-center justify-between text-xs shrink-0">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => navigateToTab('home')}
                        className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 transition"
                        title="عودة للرئيسية"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-teal-300 font-bold">الفاتورة:</span>
                        <span className="font-mono font-extrabold text-xs text-teal-100">#{nextInvoiceNumber}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-[10px] text-slate-300">
                      <span>التاريخ:</span>
                      <span className="font-mono text-slate-200">{currentDateFormatted}</span>
                    </div>
                  </div>

                  {/* 2. INVOICE TYPE (نقدي / آجل) + CUSTOMER SEARCH IN THE EXACT SAME ROW */}
                  <div className="bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 shadow-xs relative shrink-0 flex items-center gap-2">
                    {/* زر تبديل نوع الفاتورة بنفس الزر (نقدي / آجل) */}
                    <div className="flex items-center bg-slate-100 p-0.5 rounded-lg shrink-0 border border-slate-200">
                      <button
                        type="button"
                        onClick={() => {
                          setPosPaymentType('نقدي');
                          setSelectedCustomer(null);
                          setCustomerSearchQuery('');
                          setShowCustomerDropdown(false);
                        }}
                        className={`px-2 py-1 rounded-md text-[11px] font-extrabold transition flex items-center gap-1 ${
                          posPaymentType === 'نقدي'
                            ? 'bg-emerald-700 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                        title="فاتورة نقدية كاش"
                      >
                        <span>💵 نقدي</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPosPaymentType('آجل');
                          setShowCustomerDropdown(true);
                        }}
                        className={`px-2 py-1 rounded-md text-[11px] font-extrabold transition flex items-center gap-1 ${
                          posPaymentType === 'آجل'
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                        title="فاتورة آجلة على الحساب"
                      >
                        <span>📋 آجل</span>
                      </button>
                    </div>

                    {/* مربع العميل - يظهر مبيعات نقدية مقفلة إذا نقدي، ويتفعل البحث إذا آجل */}
                    <div className="flex-1 min-w-0 relative">
                      {posPaymentType === 'نقدي' ? (
                        /* إذا كانت نقدية: يظهر اسم العميل "مبيعات نقدية" ولا يمكن اختيار أي عميل */
                        <div className="flex items-center justify-between bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="text-[11px] font-bold text-slate-500">العميل:</span>
                            <span className="font-extrabold text-xs text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded border border-emerald-200">
                              مبيعات نقدية
                            </span>
                          </div>
                          <span className="text-[9px] text-slate-400 font-medium">مغلق (نقدي)</span>
                        </div>
                      ) : (
                        /* إذا كانت آجلة: يتفعل مربع اختيار وبحث العميل */
                        selectedCustomer ? (
                          <div className="flex items-center justify-between bg-amber-50 border border-amber-300 px-2 py-1 rounded-lg">
                            <div className="flex items-center gap-1.5 truncate">
                              <UserIcon className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                              <span className="font-bold text-xs text-slate-900 truncate">{selectedCustomer.name}</span>
                              <span className="text-[10px] text-slate-600 font-medium whitespace-nowrap">
                                (الرصيد: <strong className="text-rose-700">{selectedCustomer.balance.toFixed(2)} ر.س</strong>)
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => { setSelectedCustomer(null); setCustomerSearchQuery(''); }}
                              className="p-0.5 text-slate-400 hover:text-rose-600 rounded"
                              title="تغيير العميل"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <div className="relative flex-1">
                              <input
                                type="text"
                                value={customerSearchQuery}
                                onFocus={() => setShowCustomerDropdown(true)}
                                onChange={(e) => {
                                  setCustomerSearchQuery(e.target.value);
                                  setShowCustomerDropdown(true);
                                }}
                                placeholder="🔍 اختر أو ابحث عن العميل الآجل..."
                                className="w-full bg-amber-50/40 border border-amber-300 rounded-lg px-2 py-1 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500 pl-6"
                              />
                              <UserIcon className="w-3 h-3 text-amber-600 absolute left-1.5 top-1.5" />

                              {/* Search Dropdown for Credit Customers */}
                              {showCustomerDropdown && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-30 max-h-40 overflow-y-auto p-1 space-y-0.5">
                                  {filteredCustomers.length === 0 ? (
                                    <div className="p-2 text-center text-[10px] text-slate-400">لا يوجد عميل مطابق</div>
                                  ) : (
                                    filteredCustomers.map(c => (
                                      <button
                                        key={c.id}
                                        type="button"
                                        onClick={() => {
                                          setSelectedCustomer(c);
                                          setCustomerSearchQuery(c.name);
                                          setShowCustomerDropdown(false);
                                        }}
                                        className="w-full text-right px-2 py-1.5 rounded-lg hover:bg-amber-50 text-[11px] font-bold text-slate-800 flex items-center justify-between border-t border-slate-100 first:border-0"
                                      >
                                        <span className="truncate">{c.name}</span>
                                        <span className="text-[10px] text-rose-600 font-bold shrink-0">{c.balance.toFixed(2)} ر.س</span>
                                      </button>
                                    ))
                                  )}
                                </div>
                              )}
                            </div>

                            <button 
                              type="button"
                              onClick={() => setShowAddCustomerModal(true)}
                              className="px-2 py-1 bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-900 rounded-lg text-[10px] font-bold shrink-0 flex items-center gap-0.5"
                              title="فتح حساب عميل جديد"
                            >
                              <Plus className="w-3 h-3" />
                              <span>عميل جديد</span>
                            </button>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  {/* 3. ROW OF QUICK PRODUCTS TITLE + SEARCH BOX SIDE-BY-SIDE */}
                  <div className="space-y-1.5 shrink-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-extrabold text-slate-700 whitespace-nowrap">
                        الأصناف السريعة:
                      </span>

                      {/* مربع البحث عن الأصناف بجانب كلمة الأصناف السريعة */}
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={productSearchQuery}
                          onChange={(e) => setProductSearchQuery(e.target.value)}
                          placeholder="🔍 بحث عن صنف أو باركود..."
                          className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-[11px] font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600 pl-6"
                        />
                        {productSearchQuery && (
                          <button 
                            onClick={() => setProductSearchQuery('')}
                            className="absolute left-1.5 top-1.5 text-slate-400 hover:text-slate-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}

                        {/* Search Dropdown Popup for Product Query */}
                        {filteredProducts.length > 0 && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-30 max-h-36 overflow-y-auto p-1 space-y-0.5">
                            {filteredProducts.map(p => {
                              const available = currentUser.role === 'ADMIN' ? p.stockMain : (p.stockCashier[currentUser.userCode] || 0);
                              return (
                                <button
                                  key={p.id}
                                  type="button"
                                  onClick={() => handleSelectProduct(p)}
                                  className="w-full text-right px-2 py-1 hover:bg-teal-50 rounded-lg text-[11px] flex items-center justify-between border-b border-slate-100 last:border-0"
                                >
                                  <span className="font-bold text-slate-800 truncate">{p.name} ({p.price} ر.س)</span>
                                  <span className="text-[9px] text-slate-500 font-bold shrink-0">متاح: {available} {p.unitName}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 6 COMPACT BUTTONS (سطرين فقط، فقط اسم الصنف وعلامة إضافة والكمية صغيرة) */}
                    <div className="grid grid-cols-3 gap-1.5">
                      {fixedSixProducts.map(p => {
                        const available = currentUser.role === 'ADMIN' ? p.stockMain : (p.stockCashier[currentUser.userCode] || 0);
                        const isSelected = selectedProductForQty?.id === p.id;
                        
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => handleSelectProduct(p)}
                            className={`h-9 px-2 py-0.5 rounded-xl border text-right flex items-center justify-between transition active:scale-95 shadow-xs group ${
                              isSelected 
                                ? 'border-[#0F766E] bg-teal-50 ring-1 ring-teal-600' 
                                : 'border-slate-200 bg-white hover:border-teal-500 hover:bg-teal-50/50'
                            }`}
                          >
                            <div className="truncate flex-1 pr-0.5">
                              <span className="font-bold text-[10px] text-slate-900 block truncate leading-tight">
                                {p.name}
                              </span>
                              <span className="text-[8px] text-slate-400 leading-none">
                                متاح: <strong className={available > 20 ? 'text-emerald-700' : 'text-rose-700'}>{available} {p.unitName}</strong>
                              </span>
                            </div>

                            <div className="w-5 h-5 rounded-lg bg-teal-100 text-[#0F766E] flex items-center justify-center shrink-0 mr-1 group-hover:bg-[#0F766E] group-hover:text-white transition">
                              <Plus className="w-3.5 h-3.5" />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 4. LIST OF SELECTED ITEMS IN CURRENT INVOICE (جدول أصناف الفاتورة مدمج ومضغوط) */}
                  <div className="flex-1 bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs flex flex-col min-h-0 overflow-hidden">
                    <div className="flex items-center justify-between text-[11px] font-extrabold text-slate-800 border-b border-slate-100 pb-1 shrink-0">
                      <span>الأصناف المدرجة ({cartItems.length}):</span>
                      {cartItems.length > 0 && (
                        <button 
                          type="button" 
                          onClick={() => setCartItems([])}
                          className="text-[9px] text-rose-600 hover:underline font-bold"
                        >
                          مسح الأصناف
                        </button>
                      )}
                    </div>

                    <div className="flex-1 overflow-y-auto py-1 space-y-1">
                      {cartItems.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 text-[11px] py-4 text-center">
                          <ShoppingCart className="w-6 h-6 mb-1 text-slate-300" />
                          <span>لم يتم إضافة أي صنف بعد</span>
                          <span className="text-[9px] text-slate-400">اضغط على أي صنف أعلاه لإضافته للفاتورة</span>
                        </div>
                      ) : (
                        cartItems.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-[11px] bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                            <div className="truncate flex-1 pr-1">
                              <span className="font-bold text-slate-800 block truncate">{item.product.name}</span>
                              <span className="text-[9px] text-slate-500">
                                {item.quantity} {item.unitName} × {item.unitPrice.toFixed(2)} ر.س
                              </span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="font-extrabold text-[#0F766E] text-xs">{item.total.toFixed(2)} ر.س</span>
                              <button 
                                onClick={() => setCartItems(cartItems.filter((_, i) => i !== idx))}
                                className="text-slate-400 hover:text-rose-600 p-0.5 rounded"
                                title="حذف الصنف"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* 5. FINAL ACTION BAR (شريط الإجمالي والحفظ أسفل الشاشة) */}
                  <div className="bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between shrink-0">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] text-slate-400 font-bold block leading-none">الإجمالي النهائي:</span>
                        <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded ${posPaymentType === 'نقدي' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'}`}>
                          {posPaymentType === 'نقدي' ? 'نقدي (كاش)' : 'آجل (حساب)'}
                        </span>
                      </div>
                      <span className="text-lg font-black text-[#0F766E] leading-tight">
                        {cartItems.reduce((acc, curr) => acc + curr.total, 0).toFixed(2)} <span className="text-xs font-bold text-slate-500">ر.س</span>
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleExecuteFullSale}
                      className="bg-[#0F766E] hover:bg-[#0d635c] active:scale-95 text-white px-4 py-2 rounded-xl font-extrabold text-xs shadow-md shadow-teal-700/20 flex items-center gap-1.5 transition"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>حفظ وطباعة الفاتورة</span>
                    </button>
                  </div>

                  {/* 6. MODAL POPUP: تحديد كمية الصنف والوحدة (نافذة منبثقة لا تأخذ حيزاً من الفاتورة) */}
                  {selectedProductForQty && (
                    <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
                      <div className="bg-slate-900 text-white w-full max-w-xs rounded-2xl p-4 shadow-2xl space-y-3 border-2 border-teal-500">
                        <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                          <div className="truncate pr-1">
                            <span className="text-[10px] text-teal-300 font-bold block">إدخال كمية الصنف والوحدة</span>
                            <h4 className="font-extrabold text-xs text-white truncate">{selectedProductForQty.name}</h4>
                          </div>
                          <button 
                            type="button" 
                            onClick={() => setSelectedProductForQty(null)}
                            className="p-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Unit Selector: حبة أو كرتون */}
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-300 font-bold block">الوحدة:</label>
                          <div className="grid grid-cols-2 gap-1.5">
                            <button
                              type="button"
                              onClick={() => setPosSelectedUnit('unit')}
                              className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border transition ${
                                posSelectedUnit === 'unit' 
                                  ? 'bg-[#0F766E] text-white border-teal-400' 
                                  : 'bg-slate-800 text-slate-300 border-slate-700'
                              }`}
                            >
                              {selectedProductForQty.unitName} ({selectedProductForQty.price} ر.س)
                            </button>
                            <button
                              type="button"
                              onClick={() => setPosSelectedUnit('case')}
                              className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border transition ${
                                posSelectedUnit === 'case' 
                                  ? 'bg-[#0F766E] text-white border-teal-400' 
                                  : 'bg-slate-800 text-slate-300 border-slate-700'
                              }`}
                            >
                              {selectedProductForQty.caseUnitName} ({selectedProductForQty.casePrice} ر.س)
                            </button>
                          </div>
                        </div>

                        {/* Quantity Stepper */}
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-300 font-bold block">الكمية:</label>
                          <div className="flex items-center gap-2">
                            <button 
                              type="button"
                              onClick={() => setPosQuantityInput(Math.max(1, posQuantityInput - 1))}
                              className="w-9 h-9 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-base border border-slate-700"
                            >-</button>
                            <input
                              type="number"
                              min="1"
                              value={posQuantityInput}
                              onChange={(e) => setPosQuantityInput(Math.max(1, parseInt(e.target.value) || 1))}
                              className="flex-1 text-center bg-slate-800 border border-slate-600 rounded-xl py-1.5 text-sm font-extrabold text-white"
                            />
                            <button 
                              type="button"
                              onClick={() => setPosQuantityInput(posQuantityInput + 1)}
                              className="w-9 h-9 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-base border border-slate-700"
                            >+</button>
                          </div>
                        </div>

                        {/* Total & Confirm */}
                        <div className="pt-1 border-t border-slate-700 flex items-center justify-between">
                          <div>
                            <span className="text-[9px] text-slate-400 block leading-none">الإجمالي:</span>
                            <span className="text-sm font-extrabold text-teal-300">
                              {((posSelectedUnit === 'case' ? selectedProductForQty.casePrice : selectedProductForQty.price) * posQuantityInput).toFixed(2)} ر.س
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={handleConfirmProductQty}
                            className="bg-[#0F766E] hover:bg-teal-600 text-white px-3.5 py-1.5 rounded-xl font-bold text-xs shadow-md flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>إدراج بالفاتورة</span>
                          </button>
                        </div>

                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* TAB 3: INVOICES (سجل الفواتير) */}
              {/* ------------------------------------------------------------- */}
              {activeTab === 'invoices' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-slate-800">سجل فواتير المبيعات</h3>
                    <span className="text-xs text-slate-500 font-bold">{invoices.length} فاتورة</span>
                  </div>

                  <div className="space-y-2">
                    {invoices.map(inv => (
                      <div key={inv.id} className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-sm space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-extrabold text-xs text-[#0F766E]">#{inv.id}</span>
                          <span className="font-extrabold text-sm text-slate-900">{inv.total.toFixed(2)} ر.س</span>
                        </div>

                        <div className="text-[11px] text-slate-600 space-y-0.5">
                          <div className="flex justify-between">
                            <span>العميل: <strong>{inv.customerName}</strong></span>
                            <span className="text-slate-400">كود: {inv.userCode}</span>
                          </div>
                          <div>الصنف: {inv.productName}</div>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                          <span className={`px-2 py-0.5 rounded font-bold ${inv.paymentType === 'نقدي' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                            {inv.paymentType}
                          </span>
                          <span className="text-slate-400">{inv.date}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const cust = customers.find(c => c.name === inv.customerName);
                              const itemsList: InvoiceItemSummary[] = inv.items && inv.items.length > 0
                                ? inv.items
                                : [{
                                    name: inv.productName,
                                    unitName: inv.unit,
                                    quantity: inv.quantity,
                                    unitPrice: inv.quantity > 0 ? inv.total / inv.quantity : inv.total,
                                    total: inv.total
                                  }];

                              setCompletedInvoiceReceipt({
                                invoiceId: inv.id,
                                paymentType: inv.paymentType,
                                date: inv.date,
                                userName: inv.userName || currentUser?.displayName || 'مستخدم المبيعات',
                                customerName: inv.customerName,
                                customerMobile: inv.customerMobile || cust?.mobile || '',
                                items: itemsList,
                                invoiceTotal: inv.total,
                                previousBalance: inv.previousBalance !== undefined ? inv.previousBalance : (cust ? cust.balance - inv.total : 0),
                                finalTotal: inv.newBalance !== undefined ? inv.newBalance : (inv.paymentType === 'آجل' && cust ? cust.balance : inv.total)
                              });
                            }}
                            className="text-[#0F766E] hover:underline font-bold flex items-center gap-1"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>عرض الفاتورة / واتساب</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* TAB 4: BONDS (سجل السندات) */}
              {activeTab === 'bonds' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-slate-800">سجل السندات المالية</h3>
                    <button
                      onClick={() => setShowBondModal(true)}
                      className="bg-[#0F766E] hover:bg-[#0d635c] text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>سند جديد</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {bonds.map(b => (
                      <div key={b.id} className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-sm space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-extrabold text-xs text-amber-800">{b.id}</span>
                          <span className="font-extrabold text-sm text-emerald-700">{b.amount.toFixed(2)} ر.س</span>
                        </div>
                        <div className="text-xs font-bold text-slate-800">العميل: {b.customerName}</div>
                        <div className="text-[11px] text-slate-500">{b.note}</div>
                        <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                          <span>صندوق مبيعات: {b.userName}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const cust = customers.find(c => c.id === b.customerId);
                              setCompletedBondReceipt({
                                bondId: b.id,
                                customerName: b.customerName,
                                customerMobile: cust?.mobile || '',
                                userName: b.userName || currentUser?.displayName || 'مستخدم المبيعات',
                                previousBalance: b.balanceAfter + b.amount,
                                amount: b.amount,
                                balanceAfter: b.balanceAfter,
                                date: b.date,
                                note: b.note
                              });
                            }}
                            className="text-[#0F766E] hover:underline font-bold flex items-center gap-1"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>عرض السند / واتساب</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* TAB 5: USERS (إدارة المستخدمين - للأدمن) */}
              {activeTab === 'users' && currentUser.role === 'ADMIN' && (
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900">إدارة المستخدمين والكاشيرية</h3>
                      <p className="text-[11px] text-slate-500">تعديل البيانات، تغيير كلمة المرور، أو إيقاف الدخول</p>
                    </div>
                    <button
                      onClick={() => {
                        setEditingUser(null);
                        setFormDisplayName('');
                        setFormUserCode('');
                        setFormPassword('');
                        setFormActive(true);
                        setUserError('');
                        setShowUserModal(true);
                      }}
                      className="bg-[#0F766E] hover:bg-[#0d635c] text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span>إضافة كاشير</span>
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {users.map(u => (
                      <div 
                        key={u.id} 
                        className={`bg-white rounded-2xl border p-4 shadow-sm space-y-3 transition ${u.active ? 'border-slate-200' : 'border-rose-200 bg-rose-50/20'}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-extrabold text-base ${u.active ? 'bg-teal-50 text-[#0F766E] border border-teal-200' : 'bg-rose-100 text-rose-700 border border-rose-300'}`}>
                              {u.userCode}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-sm text-slate-900">{u.displayName}</h4>
                                <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${u.active ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                                  {u.active ? '🟢 مفعل' : '⛔ موقوف'}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-500 mt-0.5 space-x-2 space-x-reverse">
                                <span>كود: <strong className="text-slate-800">{u.userCode}</strong></span>
                                <span>•</span>
                                <span>الرتبة: <strong className="text-[#0F766E]">{u.role === 'ADMIN' ? 'مدير عام' : 'كاشير'}</strong></span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setEditingUser(u);
                                setFormDisplayName(u.displayName);
                                setFormUserCode(u.userCode);
                                setFormPassword(u.passwordHash);
                                setFormActive(u.active);
                                setUserError('');
                                setShowUserModal(true);
                              }}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                            >
                              <Edit className="w-3.5 h-3.5 text-slate-600" />
                              <span>تعديل</span>
                            </button>

                            {u.role !== 'ADMIN' && (
                              <button
                                onClick={() => {
                                  const nextState = !u.active;
                                  setUsers(users.map(usr => usr.id === u.id ? { ...usr, active: nextState } : usr));
                                  showToast(nextState ? `تم تفعيل حساب ${u.displayName}` : `تم إيقاف حساب ${u.displayName}`);
                                }}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${u.active ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'}`}
                              >
                                <Power className="w-3.5 h-3.5" />
                                <span>{u.active ? 'إيقاف' : 'تفعيل'}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* TAB 6: CUSTOMERS (دليل وسجل العملاء مع البحث والإضافة السريعة) */}
              {activeTab === 'customers' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-[#0F766E]" />
                        <span>دليل وبحث العملاء</span>
                      </h3>
                      <p className="text-[10px] text-slate-500">البحث، استعراض المديونيات، وإضافة حسابات العملاء</p>
                    </div>
                    <button
                      onClick={() => {
                        setCustName('');
                        setCustMobile(customerDirSearch);
                        setCustInitialBalance('0');
                        setShowAddCustomerModal(true);
                      }}
                      className="bg-[#0F766E] hover:bg-[#0d635c] text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm transition active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ إضافة عميل</span>
                    </button>
                  </div>

                  {/* مربع البحث المخصص للعملاء */}
                  <div className="relative">
                    <input
                      type="text"
                      value={customerDirSearch}
                      onChange={(e) => setCustomerDirSearch(e.target.value)}
                      placeholder="🔍 ابحث عن العميل بالاسم أو رقم الجوال..."
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600 pl-8 shadow-xs"
                    />
                    {customerDirSearch && (
                      <button
                        type="button"
                        onClick={() => setCustomerDirSearch('')}
                        className="absolute left-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* قائمة العملاء المفلترة */}
                  {(() => {
                    const filteredList = customers.filter(c => 
                      c.name.toLowerCase().includes(customerDirSearch.toLowerCase().trim()) || 
                      c.mobile.includes(customerDirSearch.trim())
                    );

                    if (filteredList.length === 0) {
                      return (
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center space-y-3">
                          <div className="w-10 h-10 rounded-full bg-teal-50 text-[#0F766E] flex items-center justify-center mx-auto">
                            <Users className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-xs text-slate-800">لا يوجد عميل مطابق للبحث ({customerDirSearch})</h4>
                            <p className="text-[10px] text-slate-400 mt-0.5">يمكنك إضافة هذا العميل الآن بضغطة زر واحدة</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const isPhone = /^\d+$/.test(customerDirSearch.trim());
                              setCustName(isPhone ? '' : customerDirSearch.trim());
                              setCustMobile(isPhone ? customerDirSearch.trim() : '');
                              setCustInitialBalance('0');
                              setShowAddCustomerModal(true);
                            }}
                            className="bg-[#0F766E] text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md"
                          >
                            + إضافة هذا العميل الآن
                          </button>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-2 max-h-[480px] overflow-y-auto pr-0.5">
                        {filteredList.map(c => (
                          <div key={c.id} className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs space-y-2 hover:border-teal-300 transition">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                                  <span>{c.name}</span>
                                </h4>
                                <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                                  📱 <span>{c.mobile}</span>
                                </span>
                              </div>
                              <div className="text-left">
                                <span className="text-[9px] text-slate-400 block">الرصيد الحالي:</span>
                                <span className={`text-xs font-black ${c.balance > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                                  {c.balance.toFixed(2)} ر.س
                                </span>
                              </div>
                            </div>

                            {/* أزرار الإجراء السريع للعميل */}
                            <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedCustomer(c);
                                  setActiveTab('pos');
                                  showToast(`تم تحديد العميل (${c.name}) لفاتورة المبيعات`);
                                }}
                                className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 border border-teal-200 text-[#0F766E] rounded-lg text-[11px] font-bold flex items-center gap-1"
                              >
                                <ShoppingCart className="w-3 h-3" />
                                <span>فاتورة بيع</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setBondCustomerId(String(c.id));
                                  setBondCustomerSearch(c.name);
                                  setShowBondCustomerDropdown(false);
                                  setBondAmount(c.balance > 0 ? String(c.balance) : '');
                                  setShowBondModal(true);
                                }}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold flex items-center gap-1"
                              >
                                <FileText className="w-3 h-3" />
                                <span>سند قبض</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* TAB: PRODUCTS (دليل وإدارة الأصناف والمخزون بالوحدتين) */}
              {/* ------------------------------------------------------------- */}
              {activeTab === 'products' && (
                <div className="space-y-3 pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                        <Package className="w-4 h-4 text-[#0F766E]" />
                        <span>دليل وإدارة الأصناف والمخزون</span>
                      </h3>
                      <p className="text-[10px] text-slate-500">إضافة وتعديل الأصناف بالوحدتين (الصغرى والكبرى) والأسعار</p>
                    </div>
                    <button
                      onClick={handleOpenAddProduct}
                      className="bg-[#0F766E] hover:bg-[#0d635c] text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm transition active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ إضافة صنف</span>
                    </button>
                  </div>

                  {/* مربع البحث عن الأصناف */}
                  <div className="relative">
                    <input
                      type="text"
                      value={productDirSearch}
                      onChange={(e) => setProductDirSearch(e.target.value)}
                      placeholder="🔍 ابحث بالاسم أو الباركود..."
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600 pl-8 shadow-xs"
                    />
                    {productDirSearch && (
                      <button
                        type="button"
                        onClick={() => setProductDirSearch('')}
                        className="absolute left-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* قائمة الأصناف */}
                  {(() => {
                    const searchKey = productDirSearch.toLowerCase().trim();
                    const filteredList = products.filter(p => 
                      !searchKey ||
                      p.name.toLowerCase().includes(searchKey) ||
                      (p.barcode && p.barcode.includes(searchKey))
                    );

                    if (filteredList.length === 0) {
                      return (
                        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center space-y-3">
                          <Package className="w-10 h-10 text-slate-300 mx-auto" />
                          <div>
                            <h4 className="font-bold text-xs text-slate-700">لا توجد أصناف مطابقة للبحث</h4>
                            <p className="text-[10px] text-slate-400 mt-0.5">يمكنك إضافة صنف جديد بهذا الاسم مباشرة</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              handleOpenAddProduct();
                              setProductFormName(productDirSearch.trim());
                            }}
                            className="bg-[#0F766E] text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md"
                          >
                            + إضافة هذا الصنف الآن
                          </button>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-0.5">
                        {filteredList.map(p => {
                          const totalUnits = p.stockMain + Object.values(p.stockCashier || {}).reduce((a: number, b: number) => a + b, 0);
                          return (
                            <div key={p.id} className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs space-y-2.5 hover:border-teal-300 transition">
                              {/* رأس الصنف: الاسم والباركود والمخزون الكلي */}
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                                    <span>{p.name}</span>
                                  </h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] text-slate-500 font-mono bg-slate-100 px-1.5 py-0.5 rounded">
                                      باركون: {p.barcode || '—'}
                                    </span>
                                  </div>
                                </div>
                                <div className="text-left shrink-0">
                                  <span className="text-[9px] text-slate-400 block">إجمالي المخزون:</span>
                                  <span className={`text-xs font-black ${totalUnits < 100 ? 'text-amber-700' : 'text-emerald-700'}`}>
                                    {totalUnits} {p.unitName}
                                  </span>
                                </div>
                              </div>

                              {/* تفاصيل الوحدتين: الصغرى والكبرى جنباً إلى جنب */}
                              <div className="grid grid-cols-2 gap-2 text-right">
                                {/* الوحدة الصغرى */}
                                <div className="bg-teal-50/50 border border-teal-100 rounded-xl p-2 space-y-0.5">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[9px] font-extrabold text-teal-800">الوحدة الصغرى:</span>
                                    <span className="text-[10px] font-bold text-teal-950 bg-teal-100/70 px-1.5 rounded">{p.unitName}</span>
                                  </div>
                                  <div className="text-xs font-black text-slate-800 pt-0.5">
                                    {p.price.toFixed(2)} <span className="text-[10px] font-normal text-slate-500">{systemSettings.currencySymbol}</span>
                                  </div>
                                </div>

                                {/* الوحدة الكبرى */}
                                <div className="bg-purple-50/50 border border-purple-100 rounded-xl p-2 space-y-0.5">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[9px] font-extrabold text-purple-800">الوحدة الكبرى:</span>
                                    <span className="text-[10px] font-bold text-purple-950 bg-purple-100/70 px-1.5 rounded">{p.caseUnitName}</span>
                                  </div>
                                  <div className="flex items-center justify-between pt-0.5">
                                    <span className="text-xs font-black text-slate-800">
                                      {p.casePrice.toFixed(2)} <span className="text-[10px] font-normal text-slate-500">{systemSettings.currencySymbol}</span>
                                    </span>
                                    <span className="text-[9px] font-bold text-purple-700">({p.caseQuantity} {p.unitName})</span>
                                  </div>
                                </div>
                              </div>

                              {/* أزرار الإجراءات */}
                              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditProduct(p)}
                                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold flex items-center gap-1 transition"
                                  >
                                    <Edit className="w-3 h-3 text-slate-600" />
                                    <span>تعديل</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (confirm(`هل أنت متأكد من حذف الصنف (${p.name})؟`)) {
                                        handleDeleteProduct(p.id, p.name);
                                      }
                                    }}
                                    className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-lg text-[11px] font-bold flex items-center gap-1 transition"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    <span>حذف</span>
                                  </button>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => {
                                    handleSelectProduct(p);
                                    setActiveTab('pos');
                                    showToast(`تم فتح تحديد كمية (${p.name}) في نقطة البيع`);
                                  }}
                                  className="px-3 py-1 bg-teal-50 hover:bg-teal-100 border border-teal-200 text-[#0F766E] rounded-lg text-[11px] font-bold flex items-center gap-1 shadow-xs transition"
                                >
                                  <ShoppingCart className="w-3 h-3" />
                                  <span>بيع في الفاتورة</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* TAB 7: SYSTEM SETTINGS & BACKUP (تهيئة النظام والنسخ الاحتياطي) */}
              {/* ------------------------------------------------------------- */}
              {activeTab === 'settings' && (
                <div className="space-y-3.5 pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                        <Settings className="w-4 h-4 text-[#0F766E]" />
                        <span>تهيئة وإعدادات النظام</span>
                      </h3>
                      <p className="text-[10px] text-slate-500">اسم المؤسسة، العملات، والنسخ الاحتياطي السحابي</p>
                    </div>
                    <button
                      onClick={handleSaveSettings}
                      className="bg-[#0F766E] hover:bg-[#0d635c] text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition active:scale-95"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>حفظ</span>
                    </button>
                  </div>

                  {/* Section 1: بيانات المؤسسة والنشاط */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-xs space-y-3">
                    <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                      <Building2 className="w-4 h-4 text-teal-700" />
                      <span>بيانات المنشأة والنشاط التجاري</span>
                    </h4>

                    <div className="space-y-2.5">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          اسم المؤسسة / النشاط (يتغير في الفاتورة والسندات فوراً):
                        </label>
                        <input
                          type="text"
                          value={settingsForm.companyName}
                          onChange={(e) => setSettingsForm({ ...settingsForm, companyName: e.target.value })}
                          placeholder="مثال: مؤسسة خمر نت للتجارة والخدمات"
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-teal-600 focus:outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          وصف النشاط / الشعار الفرعي:
                        </label>
                        <input
                          type="text"
                          value={settingsForm.tagline}
                          onChange={(e) => setSettingsForm({ ...settingsForm, tagline: e.target.value })}
                          placeholder="مثال: نظام إدارة المبيعات ونقاط البيع السريعة"
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-teal-600 focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[11px] font-bold text-slate-700 block mb-1">
                            رقم الجوال:
                          </label>
                          <input
                            type="text"
                            value={settingsForm.mobile}
                            onChange={(e) => setSettingsForm({ ...settingsForm, mobile: e.target.value })}
                            placeholder="05xxxxxxxx"
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-teal-600 focus:outline-none font-mono"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-700 block mb-1">
                            العنوان والمدينة:
                          </label>
                          <input
                            type="text"
                            value={settingsForm.address}
                            onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                            placeholder="المملكة العربية السعودية"
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-teal-600 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: إعدادات العملة ورمز العملة */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-xs space-y-3">
                    <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                      <DollarSign className="w-4 h-4 text-emerald-700" />
                      <span>إعدادات العملة ورمز العملة</span>
                    </h4>

                    {/* خيارات عملات سريعة */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] text-slate-500 font-bold block">نماذج عملات سريعة للاختيار المباشر:</span>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { name: 'ريال سعودي', symbol: 'ر.س' },
                          { name: 'ريال يمني', symbol: 'ر.ي' },
                          { name: 'درهم إماراتي', symbol: 'د.إ' },
                          { name: 'دولار أمريكي', symbol: '$' },
                          { name: 'دينار كويتي', symbol: 'د.ك' },
                          { name: 'جنيه مصري', symbol: 'ج.م' },
                        ].map((curr, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setSettingsForm({
                                ...settingsForm,
                                currencyName: curr.name,
                                currencySymbol: curr.symbol
                              });
                            }}
                            className={`p-1.5 rounded-xl border text-[11px] font-bold text-center transition ${
                              settingsForm.currencySymbol === curr.symbol 
                                ? 'bg-teal-50 border-teal-600 text-[#0F766E]' 
                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                            }`}
                          >
                            <div className="font-mono">{curr.symbol}</div>
                            <div className="text-[9px] text-slate-400 font-medium">{curr.name}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          اسم العملة:
                        </label>
                        <input
                          type="text"
                          value={settingsForm.currencyName}
                          onChange={(e) => setSettingsForm({ ...settingsForm, currencyName: e.target.value })}
                          placeholder="مثال: ريال سعودي"
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-teal-600 focus:outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          رمز العملة:
                        </label>
                        <input
                          type="text"
                          value={settingsForm.currencySymbol}
                          onChange={(e) => setSettingsForm({ ...settingsForm, currencySymbol: e.target.value })}
                          placeholder="مثال: ر.س أو ر.ي"
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-teal-600 focus:outline-none font-mono"
                          required
                        />
                      </div>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">معاينة عرض الأسعار:</span>
                      <span className="font-extrabold text-teal-800 font-mono">
                        150.00 {settingsForm.currencySymbol} ({settingsForm.currencyName})
                      </span>
                    </div>
                  </div>

                  {/* Section 3: إعدادات النسخ الاحتياطي وربط Google Drive */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-xs space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                        <Database className="w-4 h-4 text-blue-600" />
                        <span>النسخ الاحتياطي وربط Google Drive</span>
                      </h4>
                      {systemSettings.lastBackupDate && (
                        <span className="text-[9px] text-slate-400 font-mono">آخر نسخ: {systemSettings.lastBackupDate}</span>
                      )}
                    </div>

                    {/* بطاقة ربط حساب Google Drive */}
                    <div className="bg-gradient-to-br from-blue-50/70 to-indigo-50/50 border border-blue-200/80 rounded-2xl p-3 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-white text-blue-600 shadow-xs flex items-center justify-center font-bold">
                            <Cloud className="w-4 h-4" />
                          </div>
                          <div>
                            <h5 className="font-extrabold text-xs text-slate-900">سحابة Google Drive</h5>
                            <span className="text-[10px] text-slate-500">حفظ ومزامنة قواعد البيانات سحابياً</span>
                          </div>
                        </div>

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          systemSettings.googleDriveConnected 
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                            : 'bg-slate-200 text-slate-600'
                        }`}>
                          {systemSettings.googleDriveConnected ? '🟢 متصل' : '⚪ غير متصل'}
                        </span>
                      </div>

                      {systemSettings.googleDriveConnected ? (
                        <div className="space-y-2 pt-1">
                          <div className="bg-white/90 rounded-xl p-2.5 border border-blue-100 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1.5 truncate">
                              <span className="text-slate-400">الحساب:</span>
                              <span className="font-bold text-blue-900 truncate font-mono text-[11px]">
                                {systemSettings.googleDriveEmail}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={handleDisconnectGoogleDrive}
                              className="text-[10px] text-rose-600 font-bold hover:underline shrink-0 mr-2"
                            >
                              إلغاء الربط
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleExportBackup(true)}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-98 transition"
                          >
                            <Cloud className="w-4 h-4" />
                            <span>مزامنة وتصدير فوري إلى Google Drive</span>
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2 pt-1">
                          <div>
                            <label className="text-[10px] font-bold text-slate-600 block mb-1">
                              بريد حساب Google (Gmail):
                            </label>
                            <input
                              type="email"
                              value={googleEmailInput}
                              onChange={(e) => setGoogleEmailInput(e.target.value)}
                              placeholder="example@gmail.com"
                              className="w-full bg-white border border-blue-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={handleConnectGoogleDrive}
                            disabled={isSyncingCloud}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition active:scale-98"
                          >
                            {isSyncingCloud ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Cloud className="w-4 h-4" />}
                            <span>ربط حساب Google Drive الآن</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* عمليات النسخ الاحتياطي والاستعادة المحلية */}
                    <div className="space-y-2 pt-1">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => handleExportBackup(false)}
                          className="bg-slate-800 hover:bg-slate-900 text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition active:scale-98"
                        >
                          <Download className="w-4 h-4 text-teal-400" />
                          <span>تنزيل نسخة (JSON)</span>
                        </button>

                        <label className="bg-teal-50 hover:bg-teal-100 border border-teal-300 text-[#0F766E] py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition active:scale-98 text-center">
                          <Upload className="w-4 h-4 text-[#0F766E]" />
                          <span>استعادة نسخة</span>
                          <input
                            type="file"
                            accept=".json"
                            onChange={handleFileRestoreSelect}
                            className="hidden"
                          />
                        </label>
                      </div>

                      {restoreError && (
                        <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>{restoreError}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* زر الحفظ النهائي */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={handleSaveSettings}
                      className="w-full bg-[#0F766E] hover:bg-[#0d635c] text-white py-3 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-teal-700/20 active:scale-98 transition"
                    >
                      <Save className="w-4 h-4" />
                      <span>حفظ وتطبيق إعدادات تهيئة النظام</span>
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Bottom Navigation Bar */}
            <div className="bg-white border-t border-slate-200 px-2 py-1.5 flex items-center justify-around text-[10px] font-bold text-slate-500 shadow-inner">
              <button
                onClick={() => navigateToTab('home')}
                className={`p-2 rounded-xl flex flex-col items-center gap-1 transition ${activeTab === 'home' ? 'text-[#0F766E] font-extrabold' : 'hover:text-slate-800'}`}
              >
                <Building2 className="w-4 h-4" />
                <span>الرئيسية</span>
              </button>

              <button
                onClick={() => navigateToTab('pos')}
                className={`p-2 rounded-xl flex flex-col items-center gap-1 transition ${activeTab === 'pos' ? 'text-[#0F766E] font-extrabold' : 'hover:text-slate-800'}`}
              >
                <ShoppingCart className="w-4 h-4" />
                <span>المبيعات</span>
              </button>

              {/* للكاشير (المستخدم الثاني): يظهر العملاء بدلاً من الفواتير */}
              {currentUser.role === 'ADMIN' ? (
                <button
                  onClick={() => navigateToTab('invoices')}
                  className={`p-2 rounded-xl flex flex-col items-center gap-1 transition ${activeTab === 'invoices' ? 'text-[#0F766E] font-extrabold' : 'hover:text-slate-800'}`}
                >
                  <Receipt className="w-4 h-4" />
                  <span>الفواتير</span>
                </button>
              ) : (
                <button
                  onClick={() => navigateToTab('customers')}
                  className={`p-2 rounded-xl flex flex-col items-center gap-1 transition ${activeTab === 'customers' ? 'text-[#0F766E] font-extrabold' : 'hover:text-slate-800'}`}
                >
                  <Users className="w-4 h-4" />
                  <span>العملاء</span>
                </button>
              )}

              <button
                onClick={() => navigateToTab('bonds')}
                className={`p-2 rounded-xl flex flex-col items-center gap-1 transition ${activeTab === 'bonds' ? 'text-[#0F766E] font-extrabold' : 'hover:text-slate-800'}`}
              >
                <FileText className="w-4 h-4" />
                <span>السندات</span>
              </button>

              <button
                onClick={() => navigateToTab('products')}
                className={`p-2 rounded-xl flex flex-col items-center gap-1 transition ${activeTab === 'products' ? 'text-[#0F766E] font-extrabold' : 'hover:text-slate-800'}`}
              >
                <Package className="w-4 h-4" />
                <span>الأصناف</span>
              </button>

              {currentUser.role === 'ADMIN' && (
                <button
                  onClick={() => navigateToTab('settings')}
                  className={`p-2 rounded-xl flex flex-col items-center gap-1 transition ${activeTab === 'settings' ? 'text-[#0F766E] font-extrabold' : 'hover:text-slate-800'}`}
                >
                  <Settings className="w-4 h-4" />
                  <span>الإعدادات</span>
                </button>
              )}
            </div>

          </div>
        )}

      </div>

      {/* ------------------------------------------------------------- */}
      {/* MODAL: ADD / EDIT USER */}
      {/* ------------------------------------------------------------- */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white text-slate-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-[#102A43]">
                {editingUser ? 'تعديل بيانات المستخدم' : 'إضافة كاشير جديد'}
              </h3>
              <button onClick={() => setShowUserModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {userError && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{userError}</span>
              </div>
            )}

            <form onSubmit={handleSaveUser} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">اسم المستخدم / الكاشير:</label>
                <input
                  type="text"
                  value={formDisplayName}
                  onChange={(e) => setFormDisplayName(e.target.value)}
                  placeholder="مثال: صالح كاشير المساء"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">كود المستخدم الرقمي (فريد):</label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={formUserCode}
                  onChange={(e) => setFormUserCode(e.target.value)}
                  placeholder="مثال: 4"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {editingUser ? 'كلمة المرور الجديدة (اتركه فارغاً للإبقاء على الحالية):' : 'كلمة المرور الرقمية:'}
                </label>
                <input
                  type="password"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  placeholder="••••"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900"
                  required={!editingUser}
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">حالة الحساب:</label>
                <button
                  type="button"
                  onClick={() => setFormActive(!formActive)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold ${formActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}
                >
                  {formActive ? '🟢 مفعل ونشط' : '⛔ موقوف عن الدخول'}
                </button>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="flex-1 bg-slate-100 text-slate-700 py-2.5 rounded-xl text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#0F766E] text-white py-2.5 rounded-xl text-xs font-bold"
                >
                  حفظ البيانات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: ADD CUSTOMER */}
      {/* ------------------------------------------------------------- */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white text-slate-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-[#102A43]">إضافة عميل جديد</h3>
              <button onClick={() => setShowAddCustomerModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCustomer} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">اسم العميل / المؤسسة:</label>
                <input
                  type="text"
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  placeholder="مثال: تموينات الشرقية"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">رقم الجوال:</label>
                <input
                  type="tel"
                  value={custMobile}
                  onChange={(e) => setCustMobile(e.target.value)}
                  placeholder="05xxxxxxxx"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">الرصيد الافتتاحي (مديونية سابقة):</label>
                <input
                  type="number"
                  value={custInitialBalance}
                  onChange={(e) => setCustInitialBalance(e.target.value)}
                  placeholder="0.0"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddCustomerModal(false)}
                  className="flex-1 bg-slate-100 text-slate-700 py-2.5 rounded-xl text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#0F766E] text-white py-2.5 rounded-xl text-xs font-bold"
                >
                  إضافة العميل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: RECEIPT BOND (سند قبض مع مربع بحث العميل الذكي) */}
      {/* ------------------------------------------------------------- */}
      {showBondModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white text-slate-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-base text-[#102A43]">إصدار سند قبض نقدية</h3>
              </div>
              <button 
                onClick={() => {
                  setShowBondModal(false);
                  setBondCustomerSearch('');
                  setShowBondCustomerDropdown(false);
                }} 
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBond} className="space-y-3.5">
              {/* مربع بحث العميل الذكي (بدون قائمة منسدلة ثابتة) */}
              <div className="relative">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">العميل المقبوض منه:</label>
                  {bondCustomerId && (
                    <button
                      type="button"
                      onClick={() => {
                        setBondCustomerId('');
                        setBondCustomerSearch('');
                        setShowBondCustomerDropdown(true);
                      }}
                      className="text-[10px] text-amber-700 hover:underline font-bold"
                    >
                      تغيير العميل
                    </button>
                  )}
                </div>

                {(() => {
                  const selectedBondCust = customers.find(c => String(c.id) === bondCustomerId);
                  if (selectedBondCust) {
                    return (
                      <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-amber-700" />
                            <span>{selectedBondCust.name}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            جوال: {selectedBondCust.mobile || 'غير مسجل'}
                          </div>
                        </div>
                        <div className="text-left">
                          <span className="text-[9px] text-slate-400 block">الرصيد السابق</span>
                          <span className={`text-xs font-extrabold ${selectedBondCust.balance > 0 ? 'text-rose-600' : (selectedBondCust.balance < 0 ? 'text-emerald-600' : 'text-slate-700')}`}>
                            {selectedBondCust.balance.toFixed(2)} ر.س
                          </span>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div>
                      <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={bondCustomerSearch}
                          onFocus={() => setShowBondCustomerDropdown(true)}
                          onChange={(e) => {
                            setBondCustomerSearch(e.target.value);
                            setShowBondCustomerDropdown(true);
                          }}
                          placeholder="ابحث عن العميل بالاسم أو رقم الجوال..."
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl pr-9 pl-3 py-2.5 text-xs font-bold text-slate-900 placeholder:font-normal"
                          required={!bondCustomerId}
                        />
                      </div>

                      {showBondCustomerDropdown && (
                        <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-48 overflow-y-auto divide-y divide-slate-100">
                          {filteredBondCustomers.length === 0 ? (
                            <div className="p-3 text-center text-xs text-slate-400">
                              لا يوجد عميل مطابق للبحث
                            </div>
                          ) : (
                            filteredBondCustomers.map(c => (
                              <button
                                key={c.id}
                                type="button"
                                onClick={() => {
                                  setBondCustomerId(String(c.id));
                                  setBondCustomerSearch(c.name);
                                  setShowBondCustomerDropdown(false);
                                  if (!bondAmount && c.balance > 0) {
                                    setBondAmount(String(c.balance));
                                  }
                                }}
                                className="w-full text-right p-2.5 hover:bg-amber-50/50 flex items-center justify-between transition"
                              >
                                <div>
                                  <div className="font-bold text-xs text-slate-800">{c.name}</div>
                                  <div className="text-[10px] text-slate-400">{c.mobile || 'بدون جوال'}</div>
                                </div>
                                <div className="text-left">
                                  <span className={`text-[11px] font-extrabold ${c.balance > 0 ? 'text-rose-600' : 'text-slate-500'}`}>
                                    {c.balance.toFixed(2)} ر.س
                                  </span>
                                </div>
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">المبلغ المقبوض (ر.س):</label>
                <input
                  type="number"
                  step="any"
                  value={bondAmount}
                  onChange={(e) => setBondAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">البيان / الملاحظة:</label>
                <input
                  type="text"
                  value={bondNote}
                  onChange={(e) => setBondNote(e.target.value)}
                  placeholder="سداد دفعة تحت الحساب"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowBondModal(false);
                    setBondCustomerSearch('');
                    setShowBondCustomerDropdown(false);
                  }}
                  className="flex-1 bg-slate-100 text-slate-700 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-200 transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={!bondCustomerId}
                  className="flex-1 bg-amber-700 hover:bg-amber-800 disabled:opacity-50 text-white py-2.5 rounded-xl text-xs font-bold shadow-md transition"
                >
                  اعتماد السند
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: APPROVED RECEIPT BOND POPUP (رسالة عزيزي العميل + واتساب + طباعة) */}
      {/* ------------------------------------------------------------- */}
      {completedBondReceipt && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white text-slate-800 rounded-3xl p-5 w-full max-w-sm shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="border-b border-slate-200 pb-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 leading-tight">سند قبض نقدية</h3>
                    <span className="text-[10px] text-slate-500 font-bold block">{systemSettings.companyName}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 font-mono bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                    رقم السند: <strong className="text-slate-900 font-extrabold">{completedBondReceipt.bondId}</strong>
                  </span>
                  <button 
                    type="button"
                    onClick={() => setCompletedBondReceipt(null)}
                    className="text-slate-400 hover:text-slate-600 p-1 no-print print:hidden"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* السطر الثاني: تاريخ السند وصندوق مبيعات (اسم المستخدم) */}
              <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1.5 border-t border-slate-100">
                <div className="flex items-center gap-1 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>تاريخ السند:</span>
                  <span className="font-bold text-slate-800 font-mono">{completedBondReceipt.date}</span>
                </div>

                <div className="flex items-center gap-1 font-medium">
                  <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                  <span>صندوق مبيعات:</span>
                  <span className="font-extrabold text-teal-900 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                    {completedBondReceipt.userName}
                  </span>
                </div>
              </div>
            </div>

            {/* تفاصيل السند المالية الأساسية (تظهر في الطباعة والشاشة) */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                <span className="text-slate-500 font-medium">المستلم منه (العميل):</span>
                <span className="font-extrabold text-slate-900">{completedBondReceipt.customerName}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">المبلغ المقبوض:</span>
                <span className="font-extrabold text-emerald-700 font-mono text-sm">
                  {completedBondReceipt.amount.toFixed(2)} {systemSettings.currencySymbol}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-600">
                <span className="text-slate-500">الرصيد السابق:</span>
                <span className="font-bold text-slate-800 font-mono">
                  {completedBondReceipt.previousBalance.toFixed(2)} {systemSettings.currencySymbol}
                </span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-200/80">
                <span className="font-extrabold text-slate-900">الرصيد بعد السند:</span>
                <span className={`font-extrabold text-xs px-2.5 py-0.5 rounded-lg ${
                  completedBondReceipt.balanceAfter > 0 
                    ? 'bg-rose-100 text-rose-800' 
                    : (completedBondReceipt.balanceAfter < 0 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-slate-200 text-slate-800')
                }`}>
                  {completedBondReceipt.balanceAfter > 0 
                    ? `(عليكم ${completedBondReceipt.balanceAfter.toFixed(2)} ${systemSettings.currencySymbol})` 
                    : (completedBondReceipt.balanceAfter < 0 
                        ? `(لكم ${Math.abs(completedBondReceipt.balanceAfter).toFixed(2)} ${systemSettings.currencySymbol})` 
                        : `(0.00 ${systemSettings.currencySymbol} - مسدد بالكامل)`)}
                </span>
              </div>
            </div>

            {/* رسالة السند المنسقة المطلوبة (مخفية تماماً عند الطباعة وتظهر فقط على الشاشة وللواتساب) */}
            <div className="bg-slate-50 border-2 border-dashed border-teal-600/40 rounded-2xl p-4 space-y-2.5 text-right font-sans text-xs no-print print:hidden whatsapp-box">
              <div className="font-extrabold text-teal-900 pb-1 border-b border-slate-200 flex items-center justify-between">
                <span>عزيزي العميل ({completedBondReceipt.customerName})</span>
                <span className="text-[10px] text-slate-500 font-normal">{systemSettings.companyName}</span>
              </div>

              <div className="space-y-1.5 text-slate-700 font-medium">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">رصيدكم السابق:</span>
                  <span className="font-bold text-slate-800 font-mono">
                    ({completedBondReceipt.previousBalance.toFixed(2)} {systemSettings.currencySymbol})
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">مبلغ السند:</span>
                  <span className="font-extrabold text-emerald-700 font-mono">
                    ({completedBondReceipt.amount.toFixed(2)} {systemSettings.currencySymbol})
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                  <span className="font-extrabold text-slate-900">الإجمالي:</span>
                  <span className={`font-extrabold text-xs px-2 py-0.5 rounded-lg ${completedBondReceipt.balanceAfter > 0 ? 'bg-rose-100 text-rose-800' : (completedBondReceipt.balanceAfter < 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-800')}`}>
                    {completedBondReceipt.balanceAfter > 0 
                      ? `(عليكم ${completedBondReceipt.balanceAfter.toFixed(2)} ${systemSettings.currencySymbol})` 
                      : (completedBondReceipt.balanceAfter < 0 
                          ? `(لكم ${Math.abs(completedBondReceipt.balanceAfter).toFixed(2)} ${systemSettings.currencySymbol})` 
                          : `(0.00 ${systemSettings.currencySymbol} - تمت التصفية)`)}
                  </span>
                </div>
              </div>
            </div>

            {/* أزرار الإجراءات: طباعة + إرسال واتساب مع النسخ */}
            <div className="space-y-2 pt-1 no-print print:hidden">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    window.print();
                    showToast('تم إرسال السند لأمر الطباعة');
                  }}
                  className="bg-slate-800 hover:bg-slate-900 active:scale-95 text-white py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-sm transition"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة السند</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSendBondWhatsApp(completedBondReceipt)}
                  className="bg-[#25D366] hover:bg-[#20bd5a] active:scale-95 text-white py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-600/20 transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>إرسال للواتس اب</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setCompletedBondReceipt(null)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-xl text-xs font-bold transition"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: APPROVED SALES INVOICE POPUP (معاينة فاتورة مبيعات + أصناف مصغرة + واتساب وطباعة) */}
      {/* ------------------------------------------------------------- */}
      {completedInvoiceReceipt && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white text-slate-800 rounded-3xl p-5 w-full max-w-sm shadow-2xl space-y-3.5 animate-in fade-in zoom-in duration-200 max-h-[92vh] overflow-y-auto">
            {/* Header: الترويسة الرئيسية والنوع ورقم الفاتورة واسم المؤسسة */}
            <div className="border-b border-slate-200 pb-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-teal-100 text-[#0F766E] flex items-center justify-center shrink-0">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-extrabold text-sm text-slate-900 leading-tight">فاتورة مبيعات</h3>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                        completedInvoiceReceipt.paymentType === 'نقدي' 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                          : 'bg-amber-100 text-amber-900 border border-amber-200'
                      }`}>
                        {completedInvoiceReceipt.paymentType === 'نقدي' ? 'نقدي (كاش)' : 'آجل (على الحساب)'}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold block">{systemSettings.companyName}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 font-mono bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                    رقم: <strong className="text-slate-900 font-extrabold">#{completedInvoiceReceipt.invoiceId}</strong>
                  </span>
                  <button 
                    type="button"
                    onClick={() => setCompletedInvoiceReceipt(null)}
                    className="text-slate-400 hover:text-slate-600 p-1 no-print print:hidden"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Subheader: تاريخ الفاتورة + صندوق مبيعات (اسم المستخدم) */}
              <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1.5 border-t border-slate-100">
                <div className="flex items-center gap-1 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>تاريخ الفاتورة:</span>
                  <span className="font-bold text-slate-800 font-mono">{completedInvoiceReceipt.date}</span>
                </div>

                <div className="flex items-center gap-1 font-medium">
                  <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                  <span>صندوق مبيعات:</span>
                  <span className="font-extrabold text-teal-900 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                    {completedInvoiceReceipt.userName}
                  </span>
                </div>
              </div>

              {/* Customer info: اسم العميل */}
              <div className="flex items-center justify-between text-[11px] bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-100">
                <span className="text-slate-500 font-bold">العميل:</span>
                <span className="font-extrabold text-slate-900">
                  {completedInvoiceReceipt.customerName}
                  {completedInvoiceReceipt.customerMobile ? ` (${completedInvoiceReceipt.customerMobile})` : ''}
                </span>
              </div>
            </div>

            {/* الأصناف الخاصة بالفاتورة بشكل مصغر: اسم الصنف | الوحده | الكمية | السعر | الإجمالي */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] font-extrabold text-slate-500 px-1">
                <span>الأصناف ({completedInvoiceReceipt.items.length})</span>
                <span>السعر × الكمية = الإجمالي</span>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-2.5 max-h-36 overflow-y-auto space-y-1.5 divide-y divide-slate-100">
                {completedInvoiceReceipt.items.map((item, idx) => (
                  <div key={idx} className={`flex items-center justify-between text-xs pt-1.5 ${idx === 0 ? 'pt-0' : ''}`}>
                    <div className="truncate flex-1 pr-1">
                      <div className="font-bold text-slate-800 truncate text-[11px]">{item.name}</div>
                      <div className="text-[9px] text-slate-500 font-medium">
                        الوحدة: {item.unitName} | الكمية: {item.quantity} | السعر: {item.unitPrice.toFixed(2)} {systemSettings.currencySymbol}
                      </div>
                    </div>
                    <div className="text-left shrink-0">
                      <span className="font-extrabold text-slate-900 font-mono text-[11px]">
                        {item.total.toFixed(2)} <span className="text-[9px] font-normal text-slate-500">{systemSettings.currencySymbol}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ملخص الحسابات والمجاميع */}
            <div className="bg-teal-50/60 border border-teal-200 rounded-2xl p-3 space-y-1.5 text-right text-xs">
              <div className="flex items-center justify-between text-slate-700">
                <span className="font-bold text-slate-600">إجمالي الفاتورة:</span>
                <span className="font-extrabold text-[#0F766E] font-mono text-sm">
                  {completedInvoiceReceipt.invoiceTotal.toFixed(2)} {systemSettings.currencySymbol}
                </span>
              </div>

              {completedInvoiceReceipt.paymentType === 'آجل' && (
                <div className="flex items-center justify-between text-slate-600 text-[11px]">
                  <span>الرصيد السابق:</span>
                  <span className="font-bold text-slate-800 font-mono">
                    {completedInvoiceReceipt.previousBalance.toFixed(2)} {systemSettings.currencySymbol}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between pt-1.5 border-t border-teal-200 font-extrabold">
                <span className="text-slate-900">الإجمالي الكلي:</span>
                {completedInvoiceReceipt.paymentType === 'آجل' ? (
                  <span className={`text-xs px-2.5 py-0.5 rounded-lg font-mono ${
                    completedInvoiceReceipt.finalTotal > 0 
                      ? 'bg-rose-100 text-rose-800' 
                      : (completedInvoiceReceipt.finalTotal < 0 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-slate-200 text-slate-800')
                  }`}>
                    {completedInvoiceReceipt.finalTotal > 0 
                      ? `(عليكم ${completedInvoiceReceipt.finalTotal.toFixed(2)} ${systemSettings.currencySymbol})` 
                      : (completedInvoiceReceipt.finalTotal < 0 
                          ? `(لكم ${Math.abs(completedInvoiceReceipt.finalTotal).toFixed(2)} ${systemSettings.currencySymbol})` 
                          : `(0.00 ${systemSettings.currencySymbol} - مسدد بالكامل)`)}
                  </span>
                ) : (
                  <span className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-lg font-mono">
                    (تم السداد نقداً {completedInvoiceReceipt.invoiceTotal.toFixed(2)} {systemSettings.currencySymbol})
                  </span>
                )}
              </div>
            </div>

            {/* نص الرسالة المصمم للواتس اب (مخفي تماماً عند الطباعة ويظهر فقط في شاشة العرض ولإرسال الواتساب) */}
            <div className="bg-slate-50 border-2 border-dashed border-teal-600/40 rounded-2xl p-3 space-y-1.5 text-right font-sans text-xs no-print print:hidden whatsapp-box">
              <div className="font-extrabold text-teal-900 pb-1 border-b border-slate-200 flex items-center justify-between">
                <span>عزيزي العميل ({completedInvoiceReceipt.customerName})</span>
                <span className="text-[10px] text-slate-500 font-normal">{systemSettings.companyName}</span>
              </div>

              <div className="space-y-1 text-slate-700 font-medium text-[11px]">
                <div>
                  {completedInvoiceReceipt.paymentType === 'آجل' ? 'عليكم فاتورة مبيعات رقم:' : 'فاتورة مبيعات رقم:'}{' '}
                  <strong className="text-slate-900 font-mono">#{completedInvoiceReceipt.invoiceId}</strong>
                </div>
                <div>
                  مبلغ الفاتورة:{' '}
                  <strong className="text-[#0F766E] font-mono">({completedInvoiceReceipt.invoiceTotal.toFixed(2)} {systemSettings.currencySymbol})</strong>
                </div>
                <div>
                  الرصيد الإجمالي:{' '}
                  <strong className="text-slate-900 font-mono">
                    {completedInvoiceReceipt.paymentType === 'آجل' 
                      ? (completedInvoiceReceipt.finalTotal > 0 
                          ? `(عليكم ${completedInvoiceReceipt.finalTotal.toFixed(2)} ${systemSettings.currencySymbol})` 
                          : (completedInvoiceReceipt.finalTotal < 0 
                              ? `(لكم ${Math.abs(completedInvoiceReceipt.finalTotal).toFixed(2)} ${systemSettings.currencySymbol})` 
                              : `(0.00 ${systemSettings.currencySymbol})`))
                      : `(تم السداد نقداً ${completedInvoiceReceipt.invoiceTotal.toFixed(2)} ${systemSettings.currencySymbol})`
                    }
                  </strong>
                </div>
              </div>
            </div>

            {/* أزرار الإجراءات: طباعة + إرسال واتساب مع النسخ */}
            <div className="space-y-2 pt-1 no-print print:hidden">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    window.print();
                    showToast('تم إرسال الفاتورة لأمر الطباعة');
                  }}
                  className="bg-slate-800 hover:bg-slate-900 active:scale-95 text-white py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-sm transition"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة الفاتورة</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSendInvoiceWhatsApp(completedInvoiceReceipt)}
                  className="bg-[#25D366] hover:bg-[#20bd5a] active:scale-95 text-white py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-600/20 transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>إرسال للواتس اب</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setCompletedInvoiceReceipt(null)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-xl text-xs font-bold transition"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: BACKUP RESTORE CONFIRMATION */}
      {/* ------------------------------------------------------------- */}
      {showRestoreModal && pendingRestoreData && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white text-slate-800 rounded-3xl p-5 w-full max-w-sm shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
              <Database className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="font-extrabold text-base text-slate-900">تأكيد استعادة النسخة الاحتياطية</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                سيتم استبدال البيانات الحالية بالبيانات الموجودة في ملف النسخة الاحتياطية.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 text-xs space-y-1.5 text-slate-700 font-medium">
              <div className="flex justify-between">
                <span className="text-slate-500">تاريخ تصدير النسخة:</span>
                <span className="font-bold font-mono">{pendingRestoreData.exportDate || 'غير محدد'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">عدد المنتجات:</span>
                <span className="font-bold font-mono">{pendingRestoreData.products?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">عدد العملاء:</span>
                <span className="font-bold font-mono">{pendingRestoreData.customers?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">عدد الفواتير:</span>
                <span className="font-bold font-mono">{pendingRestoreData.invoices?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">عدد السندات:</span>
                <span className="font-bold font-mono">{pendingRestoreData.bonds?.length || 0}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowRestoreModal(false);
                  setPendingRestoreData(null);
                }}
                className="flex-1 bg-slate-100 text-slate-700 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-200 transition"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleConfirmRestore}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-2.5 rounded-xl text-xs font-bold shadow-md transition"
              >
                نعم، استعادة الآن
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: POS EXIT CONFIRMATION (تأكيد الخروج من الفاتورة عند وجود أصناف) */}
      {/* ------------------------------------------------------------- */}
      {showExitPosConfirm && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white text-slate-800 rounded-3xl p-5 w-full max-w-sm shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="font-extrabold text-base text-slate-900">هل تريد الخروج من الفاتورة؟</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                توجد أصناف مضافة في الفاتورة الحالية لم يتم حفظها بعد. عند الخروج سيتم إلغاء الأصناف الحالية ومسح الفاتورة.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowExitPosConfirm(false);
                  setPendingTab(null);
                }}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-xs font-bold transition"
              >
                البقاء في الفاتورة
              </button>

              <button
                type="button"
                onClick={() => {
                  setCartItems([]);
                  setSelectedCustomer(null);
                  setCustomerSearchQuery('');
                  setShowExitPosConfirm(false);
                  if (pendingTab) {
                    setActiveTab(pendingTab);
                    setPendingTab(null);
                  }
                }}
                className="flex-1 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white py-2.5 rounded-xl text-xs font-bold shadow-md shadow-rose-600/20 transition"
              >
                نعم، خروج وإلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: ADD / EDIT PRODUCT (نافذة إضافة وتعديل الصنف بالوحدتين) */}
      {/* ------------------------------------------------------------- */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white text-slate-900 rounded-3xl w-full max-w-md p-5 shadow-2xl border border-slate-200 space-y-4 max-h-[92vh] overflow-y-auto">
            {/* عنوان النافذة */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-2xl bg-teal-50 border border-teal-200 text-[#0F766E]">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">
                    {editingProduct ? 'تعديل بيانات الصنف' : 'إضافة صنف جديد بالوحدتين'}
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    تحديد اسم الصنف، الوحدة الصغرى وسعرها، والوحدة الكبرى وسعتها وسعرها
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowProductModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* رسالة الخطأ إن وجدت */}
            {productFormError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold p-3 rounded-2xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{productFormError}</span>
              </div>
            )}

            {/* نموذج إدخال بيانات الصنف */}
            <form onSubmit={handleSaveProduct} className="space-y-4">
              {/* القسم 1: البيانات الأساسية */}
              <div className="space-y-2.5 bg-slate-50/80 p-3 rounded-2xl border border-slate-200">
                <div className="text-[11px] font-extrabold text-slate-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-teal-600"></span>
                  <span>1. بيانات الصنف الأساسية</span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    اسم الصنف <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={productFormName}
                    onChange={(e) => setProductFormName(e.target.value)}
                    placeholder="مثال: مياه هنا 330 مل أو عصير ربيع"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      الباركود / الكود
                    </label>
                    <input
                      type="text"
                      value={productFormBarcode}
                      onChange={(e) => setProductFormBarcode(e.target.value)}
                      placeholder="6281000..."
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      الرصيد المبدئي ({productFormUnitName || 'حبة'})
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={productFormStockMain}
                      onChange={(e) => setProductFormStockMain(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600 text-center"
                    />
                  </div>
                </div>
              </div>

              {/* القسم 2: الوحدة الصغرى (التجزئة الأساسية) */}
              <div className="space-y-2.5 bg-teal-50/50 p-3 rounded-2xl border border-teal-200">
                <div className="text-[11px] font-extrabold text-teal-900 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#0F766E]"></span>
                    <span>2. الوحدة الصغرى (التجزئة الأساسية)</span>
                  </div>
                  <span className="text-[10px] text-teal-700 bg-teal-100 px-1.5 py-0.5 rounded font-bold">وحدة القياس الأصغر</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      اسم الوحدة الصغرى <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={productFormUnitName}
                      onChange={(e) => setProductFormUnitName(e.target.value)}
                      placeholder="مثال: حبة، علبة، كيس"
                      className="w-full bg-white border border-teal-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      سعر بيع الصغرى ({systemSettings.currencySymbol}) <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0.01"
                      required
                      value={productFormPrice}
                      onChange={(e) => setProductFormPrice(e.target.value)}
                      placeholder="مثال: 1.00"
                      className="w-full bg-white border border-teal-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600 text-center"
                    />
                  </div>
                </div>

                {/* خيارات سريعة لاسم الوحدة الصغرى */}
                <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                  <span className="text-[10px] text-slate-500 font-medium">اختيار سريع:</span>
                  {['حبة', 'علبة', 'كيس', 'قطعة', 'لتر', 'متر'].map(u => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => setProductFormUnitName(u)}
                      className={`text-[10px] px-2 py-0.5 rounded-lg font-bold border transition ${productFormUnitName === u ? 'bg-[#0F766E] text-white border-[#0F766E]' : 'bg-white text-slate-700 border-slate-200 hover:border-teal-300'}`}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>

              {/* القسم 3: الوحدة الكبرى (الجملة / التجميعية) */}
              <div className="space-y-2.5 bg-purple-50/50 p-3 rounded-2xl border border-purple-200">
                <div className="text-[11px] font-extrabold text-purple-900 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                    <span>3. الوحدة الكبرى (الجملة / التجميعية)</span>
                  </div>
                  <span className="text-[10px] text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded font-bold">تحتوي عدة وحدات صغرى</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      اسم الكبرى <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={productFormCaseUnitName}
                      onChange={(e) => setProductFormCaseUnitName(e.target.value)}
                      placeholder="مثال: كرتون"
                      className="w-full bg-white border border-purple-300 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>

                  <div className="col-span-1">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      سعة/عدد الصغرى <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={productFormCaseQuantity}
                      onChange={(e) => setProductFormCaseQuantity(e.target.value)}
                      placeholder="مثال: 24"
                      className="w-full bg-white border border-purple-300 rounded-xl px-2.5 py-2 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600 text-center"
                    />
                  </div>

                  <div className="col-span-1">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      سعر الكبرى ({systemSettings.currencySymbol}) <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0.01"
                      required
                      value={productFormCasePrice}
                      onChange={(e) => setProductFormCasePrice(e.target.value)}
                      placeholder="مثال: 35.00"
                      className="w-full bg-white border border-purple-300 rounded-xl px-2.5 py-2 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600 text-center"
                    />
                  </div>
                </div>

                {/* خيارات سريعة لاسم الوحدة الكبرى */}
                <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                  <span className="text-[10px] text-slate-500 font-medium">اختيار سريع:</span>
                  {['كرتون', 'باكت', 'شدة', 'صندوق', 'درزن', 'شوال'].map(u => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => setProductFormCaseUnitName(u)}
                      className={`text-[10px] px-2 py-0.5 rounded-lg font-bold border transition ${productFormCaseUnitName === u ? 'bg-purple-700 text-white border-purple-700' : 'bg-white text-slate-700 border-slate-200 hover:border-purple-300'}`}
                    >
                      {u}
                    </button>
                  ))}
                </div>

                {/* توضيح تحويل الوحدة */}
                <div className="text-[10px] text-purple-900 bg-purple-100/70 p-2 rounded-xl flex items-center justify-between font-bold">
                  <span>المعادلة: 1 {productFormCaseUnitName || 'كرتون'} = {productFormCaseQuantity || '1'} {productFormUnitName || 'حبة'}</span>
                  <span>السعر: {productFormCasePrice || '0.00'} {systemSettings.currencySymbol}</span>
                </div>
              </div>

              {/* أزرار الحفظ والإلغاء */}
              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-2xl text-xs font-bold transition"
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  className="flex-1 bg-[#0F766E] hover:bg-[#0d635c] active:scale-98 text-white py-2.5 rounded-2xl text-xs font-bold shadow-lg shadow-teal-700/20 transition flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingProduct ? 'حفظ التعديلات' : 'إضافة الصنف للنظام'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
