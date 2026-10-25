import { ImageResponse } from 'next/og'

export const alt = 'verilix — AI knowledge base via MCP'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// 기본 폰트에 한글 글리프가 없어 영문으로만 구성한다.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 96,
          background: '#FAF9F6',
          color: '#1A1A18',
        }}
      >
        <div style={{ fontSize: 120, fontWeight: 700, color: '#1A3D2B' }}>verilix</div>
        <div style={{ fontSize: 48, marginTop: 24 }}>
          Conversations that scatter become knowledge that stays.
        </div>
        <div style={{ fontSize: 30, marginTop: 32, color: '#5A5A56' }}>
          Connect your AI via MCP · Free
        </div>
      </div>
    ),
    size,
  )
}
