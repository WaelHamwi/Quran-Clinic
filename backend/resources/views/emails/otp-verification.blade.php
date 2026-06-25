<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>رمز التحقق</title>
<style>
  body { margin: 0; padding: 0; background: #f5f5f5; font-family: Arial, sans-serif; }
  .wrapper { max-width: 480px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,.08); }
  .header { background: #135452; padding: 32px 24px; text-align: center; }
  .header h1 { color: #ffffff; margin: 0; font-size: 22px; }
  .body { padding: 32px 24px; text-align: center; }
  .body p { color: #414651; font-size: 15px; line-height: 1.6; margin: 0 0 24px; }
  .otp-box { display: inline-block; background: #ebfafa; border: 2px solid #d5e9e9; border-radius: 12px; padding: 16px 40px; margin: 8px 0 24px; }
  .otp-code { font-size: 36px; font-weight: bold; color: #135452; letter-spacing: 12px; }
  .note { color: #717680; font-size: 13px; }
  .footer { background: #f9f9f9; padding: 16px 24px; text-align: center; color: #717680; font-size: 12px; border-top: 1px solid #e9eaeb; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="header">
    <h1>المشفى القرآني</h1>
  </div>
  <div class="body">
    <p>مرحباً بك! استخدم رمز التحقق أدناه لإتمام تسجيلك.</p>
    <div class="otp-box">
      <div class="otp-code">{{ $otp }}</div>
    </div>
    <p class="note">هذا الرمز صالح لمدة <strong>10 دقائق</strong> فقط.<br>إذا لم تطلب هذا الرمز، يُرجى تجاهل هذا البريد.</p>
  </div>
  <div class="footer">
    Quranic Clinic · جميع الحقوق محفوظة
  </div>
</div>
</body>
</html>
