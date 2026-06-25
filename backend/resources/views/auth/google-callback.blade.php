<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Quranic Clinic</title>
<style>
  body{font-family:-apple-system,"Segoe UI",Roboto,sans-serif;background:#135452;color:#fff;
       margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;text-align:center}
  .card{padding:32px}
  .spinner{width:42px;height:42px;margin:0 auto 18px;border:4px solid rgba(255,255,255,.3);
       border-top-color:#fff;border-radius:50%;animation:spin 1s linear infinite}
  @keyframes spin{to{transform:rotate(360deg)}}
  p{font-size:15px;line-height:1.6;opacity:.95}
  .btn{display:inline-block;margin-top:24px;padding:14px 30px;background:#fff;color:#135452;
       border-radius:999px;text-decoration:none;font-weight:700;font-size:15px}
</style>
</head>
<body>
  <div class="card">
    <div class="spinner"></div>
    <p>جارٍ العودة إلى التطبيق…<br>Returning to the app…</p>
    <a id="deeplink" class="btn" href="{{ $deepLink }}">العودة إلى التطبيق · Open the app</a>
  </div>
  <script>
    (function () {
      var url = document.getElementById('deeplink').getAttribute('href');
      function go(){ try { window.location.replace(url); } catch (e) { window.location.href = url; } }
      go();
      setTimeout(go, 500);
    })();
  </script>
</body>
</html>
