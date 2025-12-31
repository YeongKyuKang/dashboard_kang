import { Metadata } from 'next';
import { ReactNode } from 'react';

// 브라우저 탭 기본 설정
export const metadata: Metadata = {
  title: {
    default: '실시간 질문 게시판',
    template: '%s | 웹 문의'
  },
  description: '유희왕 스타일 실시간 Q&A 시스템',
};

interface LayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: LayoutProps) {
  return (
    <html lang="ko">
      <body style={{ margin: 0, padding: 0, backgroundColor: '#2b3974' }}>
        {children}
      </body>
    </html>
  );
}