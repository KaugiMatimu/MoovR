import React, { createContext, useContext, useEffect, useState } from "react";

const LANGUAGE_STORAGE_KEY = "language";
const AVAILABLE_LOCALES = ["en", "ar", "ur"];

const translations = {
  en: {
    back: "Back",
    ride: "Ride",
    rent: "Rent",
    driver: "Driver",
    package: "Package",
    intercityRide: "Intercity Ride",
    bill: "Bill",
    rideInProgress: "Ride in progress",
    accountSettings: "Account settings",
    language: "Language",
    legal: "Legal",
    logout: "Log out",
    user: "Passager",
    logIn: "Log In",
    signUp: "Sign Up",
    chooseAccountRole: "Choose Account Role",
    selectRoleDescription: "Please select your role to get started. Let us know if you're here to book rides or provide ride services.",
    driverAccountCard: "Create an account to receive ride requests and earn.",
    userAccountCard: "Create an account to book rides conveniently.",
    rideSmartArriveHappy: "Ride Smart, Arrive Happy With MoovR",
    addJourneyDetails: "Add your journey details, hop in, and go.",
    enterPickupLocation: "Enter pick-up location",
    enterDestination: "Enter destination",
    seePricing: "See Pricing",
    calculating: "Calculating...",
    discover: "Discover",
    learnMore: "Learn more",
    yourRideYourWay: "Your ride, your way, your time",
    reservationsLife: "Now more than ever, reservations are a way of life. Reserve a premium MoovR experience, up to 90 days in advance, for whenever you’re ready to ride.",
    rentCarAdventure: "Rent a car, rent an adventure",
    rentCarDescription: "Your priority for car rentals. Book online for family vacations, weekend getaways, and road trips.",
    driveWithoutDriving: "Drive without driving",
    driveWithoutDrivingDescription: "With MoovR, your car becomes a luxury ride at your convenience. Whether it’s a late-night airport pickup or a busy workday, our drivers are ready to take the wheel.",
    travelSafeWithUs: "Travel safe with us",
    travelSafeDescription: "Your trusted car riding app ensuring safe, reliable, and comfortable journeys every time. Enjoy peace of mind with our top-notch safety features and professional drivers.",
    rideTogetherThriveTogether: "Ride Together, Thrive Together",
    carpoolCommunity: "Join our carpool community and enjoy a smarter, greener way to commute. Share rides, reduce costs, and make new friends while helping the environment. Together, we can make every journey more enjoyable and sustainable.",
    downloadMoovRApp: "Download MoovR App",
    moveWithFreedom: "Move With Freedom",
    scanToDownload: "Scan to download the MoovR app for the best experience.",
    availableOn: "Available on",
    frequentlyAskedQuestions: "Frequently Asked Questions",
    lostItemQuestion: "Can I have a lost item delivered to me?",
    lostItemAnswer: "Yes, MoovR offers a lost item delivery service. You can contact customer support or the driver to arrange for the return of your item.",
    rentCarQuestion: "Can I rent a car using MoovR?",
    rentCarAnswer: "Absolutely! MoovR provides a car rental option for your convenience. Just navigate to the Rent section, choose a vehicle, and complete the booking process.",
    multiStopQuestion: "Can I request a ride that picks up friends in different locations?",
    multiStopAnswer: "Yes, with MoovR, you can add multiple stops to your trip to pick up friends from different locations. Simply add the additional stops when booking your ride.",
    company: "Company",
    about: "About",
    ourOffering: "Our Offering",
    newsRoom: "News Room",
    investors: "Investors",
    blog: "Blog",
    careers: "Careers",
    products: "Products",
    deliver: "Deliver",
    diversityAndInclusion: "Diversity and Inclusion",
    sustainability: "Sustainability",
    travel: "Travel",
    reserve: "Reserve",
    cities: "Cities",
    privacyPolicyTitle: "MoovR Privacy Policy",
    effectiveDate: "Effective Date: October 5, 2024",
    privacyIntro: "MoovR (\"we,\" \"our,\" or \"us\") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application (the \"App\"). Please read this Privacy Policy carefully. If you do not agree with the terms of this Privacy Policy, please do not access the App.",
    informationWeCollect: "Information We Collect",
    personalData: "Personal Data: We may collect personally identifiable information, such as your name, email address, and phone number, when you register for an account.",
    usageData: "Usage Data: We may collect information about your interactions with the App, such as the features you use and the time spent on the App.",
    locationData: "Location Data: We may collect your location data to provide location-based services.",
    howWeUseYourInformation: "How We Use Your Information",
    sharingYourInformation: "Sharing Your Information",
    securityOfYourInformation: "Security of Your Information",
    languageSelectionHeader: "Select a language",
    currentLanguage: "Current language of the app.",
    destinationReached: "Destination Reached",
    rateYourRide: "Rate your ride",
    paymentConfirmedThankYou: "Payment confirmed. Thank you!",
    paymentCanceledPleaseTryAnotherMethod: "Payment was canceled. Please try another method.",
    processingPayment: "Processing payment...",
    redirectingToPaymentGateway: "Redirecting to payment gateway...",
    paymentSuccessfulMessage: "Payment successful!",
    paymentPendingMessage: "Payment is pending. Please follow the next steps.",
    paymentFailedPleaseTryAgain: "Payment failed. Please try again.",
    payCashMessage: "Please pay {{fare}} NGN to the driver in cash.",
    paymentSuccessfullyDeductedFromWallet: "Payment successfully deducted from your MoovR Wallet.",
    totalFareSelectPaymentMethod: "Total Fare: {{fare}} NGN. Please select a payment method.",
    selectedPaymentMethodLabel: "Selected payment method",
    selectMoovR: "Select MoovR",
    moovRWallet: "MoovR Wallet",
    cash: "Cash",
    stripeCard: "Stripe (Card)",
    googlePay: "Google Pay",
    paystack: "Paystack",
  },
  ar: {
    back: "رجوع",
    ride: "ركوب",
    rent: "تأجير",
    driver: "سائق",
    package: "طرد",
    intercityRide: "رحلة بين المدن",
    bill: "فاتورة",
    rideInProgress: "الرحلة جارية",
    accountSettings: "إعدادات الحساب",
    language: "اللغة",
    legal: "قانوني",
    logout: "تسجيل الخروج",
    user: "راكب",
    logIn: "تسجيل الدخول",
    signUp: "إنشاء حساب",
    chooseAccountRole: "اختر نوع الحساب",
    selectRoleDescription: "يرجى اختيار دورك للبدء. أخبرنا إذا كنت هنا لحجز الرحلات أو تقديم خدمات الركوب.",
    driverAccountCard: "أنشئ حسابًا لتلقي طلبات الركوب والكسب.",
    userAccountCard: "أنشئ حسابًا لحجز الرحلات بسهولة.",
    rideSmartArriveHappy: "قد برشاقة، وصل بسعادة مع MoovR",
    addJourneyDetails: "أضف تفاصيل رحلتك، اركب، وانطلق.",
    enterPickupLocation: "أدخل موقع الالتقاط",
    enterDestination: "أدخل الوجهة",
    seePricing: "عرض الأسعار",
    calculating: "جارٍ الحساب...",
    discover: "اكتشف",
    learnMore: "اعرف المزيد",
    yourRideYourWay: "رحلتك بطريقتك، في وقتك",
    reservationsLife: "أصبحت الحجوزات الآن جزءًا من الحياة. احجز تجربة MoovR المميزة حتى 90 يومًا مقدمًا، متى ما كنت جاهزًا للركوب.",
    rentCarAdventure: "استأجر سيارة، واستأجر مغامرة",
    rentCarDescription: "أولوية تأجير السيارات الخاصة بك. احجز عبر الإنترنت للعطلات العائلية، والإجازات الأسبوعية، ورحلات الطريق.",
    driveWithoutDriving: "قد بدون قيادة",
    driveWithoutDrivingDescription: "مع MoovR، تصبح سيارتك رحلة فاخرة حسب راحتك. سواء كانت توصيلة مطار في وقت متأخر أو يوم عمل مزدحم، فإن سائقينا جاهزون لتولي القيادة.",
    travelSafeWithUs: "سافر بأمان معنا",
    travelSafeDescription: "تطبيق التنقل الموثوق به الذي يضمن رحلات آمنة وموثوقة ومريحة في كل مرة. استمتع براحة البال مع ميزات الأمان عالية المستوى والسائقين المحترفين.",
    rideTogetherThriveTogether: "اركب معًا، وازدهر معًا",
    carpoolCommunity: "انضم إلى مجتمع التشارك في الركوب واستمتع بطريقة أذكى وأكثر خضرة للتنقل. شارك الرحلات، قلل التكاليف، وتعرف على أصدقاء جدد بينما تساعد البيئة. معًا، يمكننا جعل كل رحلة أكثر متعة واستدامة.",
    downloadMoovRApp: "قم بتنزيل تطبيق MoovR",
    moveWithFreedom: "تحرك بحرية",
    scanToDownload: "امسح للتنزيل تطبيق MoovR للحصول على أفضل تجربة.",
    availableOn: "متاح على",
    frequentlyAskedQuestions: "الأسئلة الشائعة",
    lostItemQuestion: "هل يمكنني أن يتم تسليم عنصر ضائع لي؟",
    lostItemAnswer: "نعم، يوفر MoovR خدمة تسليم العناصر المفقودة. يمكنك الاتصال بدعم العملاء أو السائق لترتيب إعادة العنصر.",
    rentCarQuestion: "هل يمكنني استئجار سيارة باستخدام MoovR؟",
    rentCarAnswer: "بالتأكيد! يوفر MoovR خيار تأجير السيارات من أجل راحتك. فقط انتقل إلى قسم التأجير، واختر السيارة، وأكمل عملية الحجز.",
    multiStopQuestion: "هل يمكنني طلب رحلة تلتقط الأصدقاء من مواقع مختلفة؟",
    multiStopAnswer: "نعم، مع MoovR، يمكنك إضافة نقاط توقف متعددة إلى رحلتك لالتقاط الأصدقاء من مواقع مختلفة. ببساطة أضف التوقفات الإضافية عند حجز رحلتك.",
    company: "الشركة",
    about: "حول",
    ourOffering: "عرضنا",
    newsRoom: "غرفة الأخبار",
    investors: "المستثمرون",
    blog: "مدونة",
    careers: "الوظائف",
    products: "المنتجات",
    deliver: "توصيل",
    diversityAndInclusion: "التنوع والشمول",
    sustainability: "الاستدامة",
    travel: "السفر",
    reserve: "الحجز",
    cities: "المدن",
    privacyPolicyTitle: "سياسة الخصوصية الخاصة بـ MoovR",
    effectiveDate: "تاريخ السريان: ٥ أكتوبر ٢٠٢٤",
    privacyIntro: "MoovR (" + "نحن" + "," + "" + " او" + " ," + "" + "نا" + ") ملتزمة بحماية خصوصيتك. تشرح سياسة الخصوصية هذه كيفية جمع معلوماتك واستخدامها والإفصاح عنها وحمايتها عند استخدامك لتطبيقنا. يرجى قراءة سياسة الخصوصية هذه بعناية. إذا كنت لا توافق على شروط سياسة الخصوصية هذه، فيرجى عدم الوصول إلى التطبيق.",
    informationWeCollect: "المعلومات التي نجمعها",
    personalData: "البيانات الشخصية: قد نجمع معلومات تعريفية شخصية، مثل اسمك وعنوان بريدك الإلكتروني ورقم هاتفك، عندما تقوم بالتسجيل للحصول على حساب.",
    usageData: "بيانات الاستخدام: قد نجمع معلومات حول تفاعلاتك مع التطبيق، مثل الميزات التي تستخدمها والوقت الذي تقضيه في التطبيق.",
    locationData: "بيانات الموقع: قد نجمع بيانات موقعك لتقديم خدمات تعتمد على الموقع.",
    howWeUseYourInformation: "كيفية استخدام معلوماتك",
    sharingYourInformation: "مشاركة معلوماتك",
    securityOfYourInformation: "أمان معلوماتك",
    languageSelectionHeader: "اختر لغة",
    currentLanguage: "اللغة الحالية للتطبيق.",
    destinationReached: "تم الوصول إلى الوجهة",
    rateYourRide: "قيّم رحلتك",
    paymentConfirmedThankYou: "تم تأكيد الدفع. شكرًا لك!",
    paymentCanceledPleaseTryAnotherMethod: "تم إلغاء الدفع. يرجى تجربة طريقة أخرى.",
    processingPayment: "جارٍ معالجة الدفع...",
    redirectingToPaymentGateway: "جارٍ التحويل إلى بوابة الدفع...",
    paymentSuccessfulMessage: "تم الدفع بنجاح!",
    paymentPendingMessage: "الدفع معلق. يرجى اتباع الخطوات التالية.",
    paymentFailedPleaseTryAgain: "فشل الدفع. يرجى المحاولة مرة أخرى.",
    payCashMessage: "يرجى دفع {{fare}} NGN للسائق نقدًا.",
    paymentSuccessfullyDeductedFromWallet: "تم خصم الدفع بنجاح من محفظة MoovR الخاصة بك.",
    totalFareSelectPaymentMethod: "الإجمالي: {{fare}} NGN. يرجى اختيار طريقة الدفع.",
    selectedPaymentMethodLabel: "طريقة الدفع المختارة",
    selectMoovR: "اختر MoovR",
    moovRWallet: "محفظة MoovR",
    cash: "نقدًا",
    stripeCard: "Stripe (بطاقة)",
    googlePay: "Google Pay",
    paystack: "Paystack",
  },
  ur: {
    back: "واپس",
    ride: "سواری",
    rent: "کرایہ پر",
    driver: "ڈرائیور",
    package: "پیکیج",
    intercityRide: "انٹر سٹی سواری",
    bill: "بل",
    rideInProgress: "سواری جاری ہے",
    accountSettings: "کھاتہ ترتیبات",
    language: "زبان",
    legal: "قانونی",
    logout: "لاگ آؤٹ",
    user: "صارف",
    logIn: "لاگ ان",
    signUp: "سائن اپ",
    chooseAccountRole: "اکاؤنٹ کا کردار منتخب کریں",
    selectRoleDescription: "برائے مہربانی شروع کرنے کے لئے اپنا رول منتخب کریں۔ ہمیں بتائیں کہ آیا آپ سواری بک کرنے یا خدمت فراہم کرنے کے لئے یہاں ہیں۔",
    driverAccountCard: "سواری کی درخواستیں وصول کرنے اور کمانے کے لئے اکاؤنٹ بنائیں۔",
    userAccountCard: "آسانی سے سواری بک کرنے کے لئے اکاؤنٹ بنائیں۔",
    rideSmartArriveHappy: "سمارٹ سواری، خوش آمدید MoovR کے ساتھ",
    addJourneyDetails: "اپنی سفر کی تفصیلات شامل کریں، سوار ہوں، اور روانہ ہوں۔",
    enterPickupLocation: "پک اپ مقام درج کریں",
    enterDestination: "منزل درج کریں",
    seePricing: "قیمت دیکھیں",
    calculating: "حساب ہو رہا ہے...",
    discover: "دریافت کریں",
    learnMore: "مزید جانیں",
    yourRideYourWay: "آپ کی سواری، آپ کے طریقے سے، آپ کے وقت پر",
    reservationsLife: "اب پہلے سے بھی زیادہ، ریزرویشن زندگی کا حصہ ہے۔ جب بھی آپ سواری کے لئے تیار ہوں، 90 دن پہلے تک پریمیئر MoovR تجربہ محفوظ کریں۔",
    rentCarAdventure: "گاڑی کرایہ پر لیں، مہم کا آغاز کریں",
    rentCarDescription: "آپ کے کار کرائے کی ترجیح۔ فیملی تعطیلات، ہفتہ وار گہما گہمی، اور روڈ ٹرپ کے لئے آن لائن بک کریں۔",
    driveWithoutDriving: "ڈرائیو کیے بغیر ڈرائیو کریں",
    driveWithoutDrivingDescription: "MoovR کے ساتھ، آپ کی کار آپ کی سہولت کے مطابق ایک لگژری سواری بن جاتی ہے۔ چاہے دیر رات کا ایئرپورٹ پک اپ ہو یا مصروف ورک ڈے، ہمارے ڈرائیور وہیل سنبھالنے کے لئے تیار ہیں۔",
    travelSafeWithUs: "ہمارے ساتھ محفوظ سفر کریں",
    travelSafeDescription: "آپ کا معتبر کار رائیڈنگ ایپ جو ہر بار محفوظ، قابل اعتماد، اور آرام دہ سفر کی ضمانت دیتا ہے۔ ہمارے اعلیٰ معیار کے حفاظتی فیچرز اور پیشہ ور ڈرائیورز کے ساتھ ذہنی سکون سے لطف اٹھائیں۔",
    rideTogetherThriveTogether: "ساتھ سواری کریں، ساتھ ترقی کریں",
    carpoolCommunity: "ہمارے کارپول کمیونٹی میں شامل ہوں اور ایک ذہین، ماحول دوست طریقے سے سفر کا لطف اٹھائیں۔ سواری شیئر کریں، اخراجات کم کریں، اور نئے دوست بنائیں جبکہ ماحول کی مدد کریں۔ ساتھ، ہم ہر سفر کو مزید خوشگوار اور قابلِ قیام بنا سکتے ہیں۔",
    downloadMoovRApp: "MoovR ایپ ڈاؤن لوڈ کریں",
    moveWithFreedom: "آزادی کے ساتھ حرکت کریں",
    scanToDownload: "بہترین تجربہ کے لئے MoovR ایپ ڈاؤن لوڈ کرنے کے لئے اسکین کریں۔",
    availableOn: "دستیاب ہے",
    frequentlyAskedQuestions: "اکثر پوچھی جانے والی سوالات",
    lostItemQuestion: "کیا میں کھوئی ہوئی چیز مجھے پہنچوائی جا سکتی ہے؟",
    lostItemAnswer: "ہاں، MoovR کھوئی ہوئی چیز کی ڈیلیوری سروس فراہم کرتا ہے۔ آپ واپسی کے انتظام کے لئے کسٹمر سپورٹ یا ڈرائیور سے رابطہ کر سکتے ہیں۔",
    rentCarQuestion: "کیا میں MoovR کے ذریعے کار کرایہ پر لے سکتا ہوں؟",
    rentCarAnswer: "بالکل! MoovR آپ کی آسانی کے لئے کار کرایہ کا آپشن فراہم کرتا ہے۔ بس کرائے کے سیکشن پر جائیں، گاڑی منتخب کریں، اور بکنگ کا عمل مکمل کریں۔",
    multiStopQuestion: "کیا میں ایسی سواری درخواست کر سکتا ہوں جو دوستوں کو مختلف مقامات سے پکڑ لے؟",
    multiStopAnswer: "ہاں، MoovR کے ساتھ، آپ اپنی سواری میں متعدد اسٹاپس شامل کر سکتے ہیں تاکہ مختلف مقامات سے دوستوں کو پکڑا جا سکے۔ بس اپنی سواری بک کرتے وقت اضافی اسٹاپس شامل کریں۔",
    company: "کمپنی",
    about: "ہمارے بارے میں",
    ourOffering: "ہماری پیشکش",
    newsRoom: "نیوز روم",
    investors: "سرمایہ کار",
    blog: "بلاگ",
    careers: "کیریئر",
    products: "مصنوعات",
    deliver: "ڈلیور",
    diversityAndInclusion: "تنوع اور شمولیت",
    sustainability: "پائیداری",
    travel: "سفر",
    reserve: "ریزرو",
    cities: "شہریں",
    privacyPolicyTitle: "MoovR پرائیویسی پالیسی",
    effectiveDate: "موثر تاریخ: 5 اکتوبر 2024",
    privacyIntro: "MoovR (" + "ہم" + ") آپ کی رازداریت کے تحفظ کے لئے پرعزم ہے۔ یہ پرائیویسی پالیسی وضاحت کرتی ہے کہ جب آپ ہمارے موبائل ایپ (" + "ایپ" + ") کو استعمال کرتے ہیں تو ہم آپ کی معلومات کو کیسے جمع، استعمال، افشا، اور محفوظ کرتے ہیں۔ براہ کرم اس پرائیویسی پالیسی کو غور سے پڑھیں۔ اگر آپ اس پرائیویسی پالیسی کی شرائط سے متفق نہیں ہیں، تو براہ کرم ایپ تک رسائی نہ کریں۔",
    informationWeCollect: "ہم کون سی معلومات جمع کرتے ہیں",
    personalData: "ذاتی ڈیٹا: ہم ذاتی شناختی معلومات جمع کر سکتے ہیں، جیسے آپ کا نام، ای میل ایڈریس، اور فون نمبر، جب آپ اکاؤنٹ کے لئے سائن اپ کرتے ہیں۔",
    usageData: "استعمال کا ڈیٹا: ہم آپ کی ایپ کے ساتھ تعاملات کے بارے میں معلومات جمع کر سکتے ہیں، جیسے آپ کون سی خصوصیات استعمال کرتے ہیں اور ایپ میں گزارا گیا وقت۔",
    locationData: "مقام کا ڈیٹا: ہم مقام پر مبنی خدمات فراہم کرنے کے لئے آپ کا مقام ڈیٹا جمع کر سکتے ہیں۔",
    howWeUseYourInformation: "ہم آپ کی معلومات کا استعمال کیسے کرتے ہیں",
    sharingYourInformation: "آپ کی معلومات کا اشتراک",
    securityOfYourInformation: "آپ کی معلومات کی حفاظت",
    languageSelectionHeader: "ایک زبان منتخب کریں",
    currentLanguage: "ایپ کی موجودہ زبان۔",
    destinationReached: "منزل مقصود پر پہنچ گیا",
    rateYourRide: "اپنی سواری کی درجہ بندی کریں",
    paymentConfirmedThankYou: "ادائیگی کی تصدیق ہو گئی۔ شکریہ!",
    paymentCanceledPleaseTryAnotherMethod: "ادائیگی منسوخ کر دی گئی۔ براہ کرم کوئی اور طریقہ آزمائیں.",
    processingPayment: "ادائیگی کی پراسیسنگ ہو رہی ہے...",
    redirectingToPaymentGateway: "ادائیگی گیٹ وے پر بھیجا جا رہا ہے...",
    paymentSuccessfulMessage: "ادائیگی کامیاب ہوئی!",
    paymentPendingMessage: "ادائیگی زیر التواء ہے. براہ کرم اگلے اقدامات پر عمل کریں.",
    paymentFailedPleaseTryAgain: "ادائیگی ناکام ہو گئی۔ براہ کرم دوبارہ کوشش کریں.",
    payCashMessage: "براہ کرم ڈرائیور کو {{fare}} NGN نقد ادا کریں.",
    paymentSuccessfullyDeductedFromWallet: "آپ کے MoovR والیٹ سے ادائیگی کامیابی کے ساتھ منہا کر دی گئی۔",
    totalFareSelectPaymentMethod: "کل کرایہ: {{fare}} NGN۔ براہ کرم ادائیگی کا طریقہ منتخب کریں۔",
    selectedPaymentMethodLabel: "منتخب کردہ ادائیگی کا طریقہ",
    selectMoovR: "MoovR منتخب کریں",
    moovRWallet: "MoovR والیٹ",
    cash: "نقد",
    stripeCard: "Stripe (کارڈ)",
    googlePay: "Google Pay",
    paystack: "Paystack",
  },
};

const languageNames = {
  en: "English",
  ar: "العربية",
  ur: "اردو",
};

const englishSourceText = Object.values(translations.en);
const localeMaps = {
  ar: Object.fromEntries(
    englishSourceText.map((text) => [text, translations.ar[text] || text])
  ),
  ur: Object.fromEntries(
    englishSourceText.map((text) => [text, translations.ur[text] || text])
  ),
};

const LanguageContext = createContext({
  locale: "en",
  languageName: "English",
  setLocale: () => {},
  t: (key, vars) => key,
});

const getSortedKeys = (locale) => {
  return Object.keys(translations.en).sort((a, b) => translations.en[b].length - translations.en[a].length);
};

const translateText = (text, locale) => {
  if (locale === "en") return text;
  const keys = getSortedKeys(locale);
  let translated = text;
  for (const key of keys) {
    const englishPhrase = translations.en[key];
    const localPhrase = translations[locale][key];
    if (!englishPhrase || !localPhrase || englishPhrase === localPhrase) continue;
    translated = translated.split(englishPhrase).join(localPhrase);
  }
  return translated;
};

const toDatasetKey = (attr) => {
  const normalized = attr.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
  return `i18n${normalized.charAt(0).toUpperCase()}${normalized.slice(1)}`;
};

const translateAttribute = (element, attr, locale) => {
  const datasetKey = toDatasetKey(attr);
  const original = element.dataset[datasetKey] || element.getAttribute(attr);
  if (!original) return;
  if (!element.dataset[datasetKey]) {
    element.dataset[datasetKey] = original;
  }
  const translated = translateText(original, locale);
  if (translated) {
    element.setAttribute(attr, translated);
  }
};

const originalTextMap = new WeakMap();

const translateDocument = (locale) => {
  if (typeof document === "undefined") return;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
  let node = walker.nextNode();
  while (node) {
    const parent = node.parentElement;
    if (parent && !["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA", "CODE", "PRE"].includes(parent.tagName)) {
      const originalText = originalTextMap.get(node) || node.textContent;
      if (!originalTextMap.has(node)) {
        originalTextMap.set(node, originalText);
      }
      const translated = translateText(originalText, locale);
      if (translated !== node.textContent) {
        node.textContent = translated;
      }
    }
    node = walker.nextNode();
  }

  const attrNames = ["placeholder", "title", "aria-label", "alt", "value"];
  const elements = document.querySelectorAll(attrNames.map((attr) => `[${attr}]`).join(","));
  elements.forEach((el) => {
    attrNames.forEach((attr) => translateAttribute(el, attr, locale));
  });
};

export const LanguageProvider = ({ children }) => {
  const [locale, setLocaleState] = useState("en");

  useEffect(() => {
    const storedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (storedLanguage && AVAILABLE_LOCALES.includes(storedLanguage)) {
      setLocaleState(storedLanguage);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, locale);
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" || locale === "ur" ? "rtl" : "ltr";
    translateDocument(locale);

    const observer = new MutationObserver(() => translateDocument(locale));
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => observer.disconnect();
  }, [locale]);

  const setLocale = (value) => {
    if (!AVAILABLE_LOCALES.includes(value)) {
      value = "en";
    }
    setLocaleState(value);
  };

  const t = (key, vars = {}) => {
    const translation = translations[locale]?.[key] ?? translations.en?.[key] ?? key;
    return Object.entries(vars).reduce(
      (text, [varKey, varValue]) => text.replace(`{{${varKey}}}`, varValue),
      translation
    );
  };

  return (
    <LanguageContext.Provider
      value={{ locale, languageName: languageNames[locale] || languageNames.en, setLocale, t }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
