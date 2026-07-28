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
// تقديم الملفات الموجودة في المجلد الرئيسي
// index.html موجود بجانب server.js
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
// تخزين الطلبات مؤقتاً في الذاكرة
// ملاحظة: الطلبات ستختفي عند إعادة تشغيل السيرفر
// ========================================

let requests = [];


// ========================================
// الصفحة الرئيسية
// ========================================

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});


// ========================================
// API عرض جميع الخدمات
// ========================================

app.get("/api/services", (req, res) => {
  res.json({
    success: true,
    services: services
  });
});


// ========================================
// API عرض خدمة واحدة
// ========================================

app.get("/api/services/:id", (req, res) => {
  const id = Number(req.params.id);

  const service = services.find(
    item => item.id === id
  );

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


// ========================================
// API إرسال طلب جديد
// ========================================

app.post("/api/requests", (req, res) => {

  const {
    serviceId,
    serviceName,
    name,
    phone,
    accountNumber,
    details
  } = req.body;


  // التحقق من البيانات الأساسية

  if (!name || !phone) {
    return res.status(400).json({
      success: false,
      message: "يرجى إدخال الاسم الكامل ورقم الهاتف"
    });
  }


  // البحث عن الخدمة بواسطة ID إذا تم إرساله

  let selectedService = null;

  if (serviceId) {

    selectedService = services.find(
      item => item.id === Number(serviceId)
    );

    if (!selectedService) {
      return res.status(404).json({
        success: false,
        message: "الخدمة المطلوبة غير موجودة"
      });
    }

  }


  // اسم الخدمة
  // يدعم أيضاً index.html الحالي الذي يرسل اسم الخدمة

  const finalServiceName =
    selectedService?.name ||
    serviceName ||
    "غير محددة";


  // إنشاء الطلب

  const newRequest = {

    id:
      requests.length > 0
        ? requests[requests.length - 1].id + 1
        : 1,

    serviceId:
      selectedService?.id || null,

    serviceName:
      finalServiceName,

    name:
      name.trim(),

    phone:
      phone.trim(),

    accountNumber:
      accountNumber
        ? accountNumber.trim()
        : "",

    details:
      details
        ? details.trim()
        : "",

    status:
      "جديد",

    createdAt:
      new Date().toISOString()

  };


  // حفظ الطلب

  requests.push(newRequest);


  // إرسال النتيجة

  res.status(201).json({

    success: true,

    message:
      "تم إرسال طلبك بنجاح",

    request:
      newRequest

  });

});


// ========================================
// API عرض جميع الطلبات
// للأدمن
// ========================================

app.get("/api/admin/requests", (req, res) => {

  res.json({

    success: true,

    total:
      requests.length,

    requests:
      requests

  });

});


// ========================================
// API عرض طلب واحد
// ========================================

app.get("/api/admin/requests/:id", (req, res) => {

  const id =
    Number(req.params.id);

  const request =
    requests.find(
      item => item.id === id
    );


  if (!request) {

    return res.status(404).json({

      success: false,

      message:
        "الطلب غير موجود"

    });

  }


  res.json({

    success: true,

    request:
      request

  });

});


// ========================================
// API تغيير حالة الطلب
// ========================================

app.patch("/api/admin/requests/:id", (req, res) => {

  const id =
    Number(req.params.id);

  const {
    status
  } = req.body;


  const request =
    requests.find(
      item => item.id === id
    );


  if (!request) {

    return res.status(404).json({

      success: false,

      message:
        "الطلب غير موجود"

    });

  }


  if (status) {

    request.status =
      status;

  }


  res.json({

    success: true,

    message:
      "تم تحديث حالة الطلب",

    request:
      request

  });

});


// ========================================
// API حذف طلب
// للأدمن
// ========================================

app.delete("/api/admin/requests/:id", (req, res) => {

  const id =
    Number(req.params.id);


  const requestIndex =
    requests.findIndex(
      item => item.id === id
    );


  if (requestIndex === -1) {

    return res.status(404).json({

      success: false,

      message:
        "الطلب غير موجود"

    });

  }


  requests.splice(
    requestIndex,
    1
  );


  res.json({

    success: true,

    message:
      "تم حذف الطلب بنجاح"

  });

});


// ========================================
// معالجة الروابط غير الموجودة
// ========================================

app.use((req, res) => {

  // إذا كان الطلب API
  if (req.path.startsWith("/api/")) {

    return res.status(404).json({

      success: false,

      message:
        "رابط API غير موجود"

    });

  }


  // أي صفحة غير موجودة

  res.status(404).send("Not Found");

});


// ========================================
// تشغيل السيرفر
// ========================================

app.listen(
  PORT,
  "0.0.0.0",
  () => {

    console.log(
      `iBOK Server is running on port ${PORT}`
    );

  }
);
