export const metadata = {
  title: '알람 앱 프로토타입',
  description: 'Alarm App UT Prototype',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  )
}
