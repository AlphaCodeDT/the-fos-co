import { siteConfig } from '@/lib/site'

type EmailTemplateOptions = {
  title: string
  body: string
  cta?: { label: string; href: string }
}

export function wrapEmailHtml({ title, body, cta }: EmailTemplateOptions): string {
  const ctaBlock = cta
    ? `<p style="margin: 28px 0 0;">
        <a href="${cta.href}" style="display: inline-block; background: #FFD700; color: #000000; font-weight: 600; text-decoration: none; padding: 12px 24px; border-radius: 8px;">
          ${cta.label}
        </a>
      </p>`
    : ''

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>${title}</title></head>
<body style="margin: 0; padding: 0; background: #000000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: #000000; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 520px; background: #111111; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 32px;">
          <tr>
            <td>
              <p style="margin: 0 0 8px; font-size: 12px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #FFD700;">
                ${siteConfig.logoInitials}
              </p>
              <h1 style="margin: 0 0 16px; font-size: 22px; color: #FFFFFF;">${title}</h1>
              <div style="font-size: 15px; line-height: 1.6; color: rgba(255,255,255,0.8);">
                ${body}
              </div>
              ${ctaBlock}
              <p style="margin: 32px 0 0; font-size: 12px; color: rgba(255,255,255,0.45);">
                ${siteConfig.name} · ${siteConfig.tagline}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
