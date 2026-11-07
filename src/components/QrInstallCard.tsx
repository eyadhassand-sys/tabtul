import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Check, Copy, Smartphone } from 'lucide-react';

export function QrInstallCard() {
  const appUrl = window.location.origin;
  const [qrSrc, setQrSrc] = useState<string | null>(null);
  const [qrFailed, setQrFailed] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(appUrl, { width: 240, margin: 2, color: { dark: '#000000', light: '#ffffff' } })
      .then((src) => {
        if (active) setQrSrc(src);
      })
      .catch(() => {
        if (active) setQrFailed(true);
      });
    return () => {
      active = false;
    };
  }, [appUrl]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(appUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="rounded-3xl border border-line bg-card p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-100 text-brand-800 dark:bg-brand-900/40 dark:text-gold-300">
          <Smartphone className="h-5 w-5" />
        </span>
        <h2 className="font-display text-xl font-bold">استخدم التطبيق على هاتفك</h2>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        امسح الرمز بكاميرا هاتفك لفتح التطبيق مباشرة، ثم اختر "إضافة إلى الشاشة الرئيسية" من قائمة المتصفح ليصبح أيقونة بجوار تطبيقاتك.
      </p>

      <div className="mt-6 flex flex-col items-center gap-5 sm:flex-row sm:items-start">
        <div className="grid h-[224px] w-[224px] shrink-0 place-items-center rounded-2xl bg-white p-3 shadow-inner">
          {qrSrc && <img src={qrSrc} alt="رمز QR لفتح التطبيق" width={200} height={200} className="animate-fade-up" />}
          {!qrSrc && !qrFailed && <span className="text-sm text-muted">جارٍ إنشاء الرمز...</span>}
          {qrFailed && <span className="px-4 text-center text-sm text-red-700">تعذّر إنشاء الرمز، حاول مرة أخرى لاحقاً.</span>}
        </div>

        <div className="w-full min-w-0 space-y-4">
          <div className="rounded-2xl bg-paper px-4 py-3">
            <span className="text-xs text-muted">رابط التطبيق</span>
            <p dir="ltr" className="mt-1 break-all text-start text-sm font-medium text-ink">
              {appUrl}
            </p>
          </div>
          <button
            type="button"
            onClick={copyLink}
            className="inline-flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm font-medium text-ink transition hover:bg-paper"
          >
            {copied ? <Check className="h-4 w-4 text-brand-700 dark:text-gold-300" /> : <Copy className="h-4 w-4" />}
            {copied ? 'تم نسخ الرابط' : 'نسخ الرابط'}
          </button>
        </div>
      </div>
    </section>
  );
}
