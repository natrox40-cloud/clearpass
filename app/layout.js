export const metadata = {
  title: 'ClearPass — 해외직구 통관 리스크 판독기',
  description: '식약처 위해식품 DB 4,631건 기반 AI 통관 리스크 자동 판독 서비스',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  )
}
