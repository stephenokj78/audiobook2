import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={metadataBase:new URL('https://audiobook2.stephenokj.chatgpt.site'),title:'오디오북 2 | 강의별 PDF · 한국어와 영어 TTS',description:'PDF를 강의별 전문으로 나누고 DOCX·TXT로 저장하세요. 한국어와 영어는 각각의 목소리로 읽습니다.'};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="ko"><body>{children}</body></html>}
