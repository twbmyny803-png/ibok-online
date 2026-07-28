const express = require("express");
const path = require("path");

const app = express();

// Render يحدد PORT تلقائياً
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// تقديم ملفات الواجهة من مجلد public
app.use(express.static(path.join(__dirname, "public")));

// ===============================
// الخدمات المتاحة
// ===============================

const services = [
  {
    id: 1,
    name: "كشف الحساب",
    description: "الحصول على كشف حساب مفصل.",
    icon: "📈"
  },
  {
    id: 2,
    name: "رفع السقف",
    description: "زيادة الحد اليومي للتحويلات.",
    icon: "📱"
  },
  {
    id: 3,
    name: "التحويلات الخاطئة",
    description: "معالجة فورية للتحويلات الخاطئة.",
    icon: "✅"
  },
  {
    id: 4,
    name: "خدمات العملات الأجنبية",
    description: "تفعيل وإدارة العملات الأجنبية.",
    icon: "💱"
  },
  {
    id: 5,
    name: "بطاقة فيزا افتراضية",
    description: "إصدار وإدارة بطاقات الفيزا الافتراضية.",
    icon: "💳"
  },
  {
    id: 6,
    name: "تغيير رقم الهاتف القديم إلى رقم هاتف جديد",
    description: "تغيير رقم الهاتف القديم إلى رقم هاتف جديد.",
    icon: "🔄"
  },
  {
    id: 7,
    name: "تفعيل أسئلة الأمان",
    description: "إعداد وتفعيل أسئلة الحماية والأمان.",
    icon: "🛡️"
  },
  {
    id: 8,
    name: "إثبات دخل",
    description: "تأكيد وتوثيق مصادر الدخل الشهري والوظيفة.",
    icon: "💼"
  }
];

// ===============================
// الطلبات
// ===============================

// مؤقتاً يتم حفظ الطلبات في الذاكرة
// لاحقاً نربطها بقاعدة بيانات
let requests = [];


// ===============================
// الصفحة الرئيسية
// ===============================

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});


// ===============================
// API عرض الخدمات
// ===============================

app.get("/api/services", (req, res) => {
  res.json({
    success: true,
    services: services
  });
});


// ===============================
// API خدمة واحدة
// ===============================

app.get("/api/services/:id", (req, res) => {
  const id = Number(req.params.id);

  const service = services.find(item => item.id === id);

  if (!service) {
    return res.status(404).json({
      success: false,
      message: "الخدمة غير موجودة"
    });
  }

  res.json({
    success: true,
    service: service
  });
});


// ===============================
// إرسال طلب خدمة
// ===============================

app.post("/api/requests", (req, res) => {
  const {
    serviceId,
    name,
    phone,
    details
  } = req.body;

  // التحقق من البيانات
  if (!serviceId || !name || !phone) {
    return res.status(400).json({
      success: false,
      message: "يرجى إدخال اسمك ورقم الهاتف واختيار الخدمة"
    });
  }

  // البحث عن الخدمة
  const service = services.find(
    item => item.id === Number(serviceId)
  );

  if (!service) {
    return res.status(404).json({
      success: false,
      message: "الخدمة المطلوبة غير موجودة"
    });
  }

  // إنشاء الطلب
  const newRequest = {
    id: requests.length + 1,
    serviceId: service.id,
    serviceName: service.name,
    name: name,
    phone: phone,
    details: details || "",
    status: "جديد",
    createdAt: new Date().toISOString()
  };

  // حفظ الطلب
  requests.push(newRequest);

  res.status(201).json({
    success: true,
    message: "تم إرسال طلبك بنجاح",
    request: newRequest
  });
});


// ===============================
// API عرض جميع الطلبات
// للأدمن لاحقاً
// ===============================

app.get("/api/admin/requests", (req, res) => {
  res.json({
    success: true,
    total: requests.length,
    requests: requests
  });
});


// ===============================
// API حذف طلب
// للأدمن لاحقاً
// ===============================

app.delete("/api/admin/requests/:id", (req, res) => {
  const id = Number(req.params.id);

  const requestIndex = requests.findIndex(
    item => item.id === id
  );

  if (requestIndex === -1) {
    return res.status(404).json({
      success: false,
      message: "الطلب غير موجود"
    });
  }

  requests.splice(requestIndex, 1);

  res.json({
    success: true,
    message: "تم حذف الطلب بنجاح"
  });
});


// ===============================
// صفحة غير موجودة
// ===============================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "الصفحة أو الرابط غير موجود"
  });
});


// ===============================
// تشغيل السيرفر
// ===============================

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});
