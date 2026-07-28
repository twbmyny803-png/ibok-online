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
// تخزين الطلبات مؤقتاً
// ملاحظة: الطلبات تختفي عند إعادة تشغيل Render
// لاحقاً نربط قاعدة بيانات
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
// المستخدم يرسل فقط الخدمة المختارة
// ========================================

app.post("/api/requests", (req, res) => {

  const {
    serviceId,
    serviceName
  } = req.body;


  // ========================================
  // التحقق من اختيار الخدمة
  // ========================================

  if (!serviceId && !serviceName) {

    return res.status(400).json({

      success: false,

      message: "يرجى اختيار الخدمة أولاً"

    });

  }


  // ========================================
  // البحث عن الخدمة
  // ========================================

  let selectedService = null;


  // البحث بواسطة ID

  if (serviceId) {

    selectedService = services.find(

      item =>
        item.id === Number(serviceId)

    );

  }


  // إذا لم يتم العثور عليها بواسطة ID
  // يتم البحث بواسطة اسم الخدمة

  if (!selectedService && serviceName) {

    selectedService = services.find(

      item =>
        item.name === serviceName

    );

  }


  // ========================================
  // التأكد أن الخدمة موجودة
  // ========================================

  if (!selectedService) {

    return res.status(404).json({

      success: false,

      message: "الخدمة المطلوبة غير موجودة"

    });

  }


  // ========================================
  // إنشاء الطلب
  // ========================================

  const newRequest = {

    id:
      requests.length > 0
        ? requests[requests.length - 1].id + 1
        : 1,

    serviceId:
      selectedService.id,

    serviceName:
      selectedService.name,

    status:
      "جديد",

    createdAt:
      new Date().toISOString()

  };


  // ========================================
  // حفظ الطلب
  // ========================================

  requests.push(newRequest);


  // ========================================
  // إرسال النتيجة
  // ========================================

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

      item =>
        item.id === id

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

      item =>
        item.id === id

    );


  if (!request) {

    return res.status(404).json({

      success: false,

      message:
        "الطلب غير موجود"

    });

  }


  // تحديث الحالة

  if (status) {

    request.status =
      status;

  }


  res
