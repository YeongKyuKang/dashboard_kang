'use client';
import { useState, useEffect } from 'react';

export default function RootWritePage() {
  const [author, setAuthor] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState(''); 
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const lastWriteTime = localStorage.getItem('lastWriteTime');
    if (lastWriteTime) {
      const diff = Math.floor((Date.now() - parseInt(lastWriteTime)) / 1000);
      // [수정] 새로고침 시 대기 시간 체크를 15초에서 2초로 변경
      if (diff < 2) setTimeLeft(2 - diff);
    }
  }, []);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (timeLeft > 0 || loading) return;
    if (!author.trim() || !title.trim() || !content.trim()) {
      alert('모든 항목을 입력해주세요.');
      return;
    }

    setLoading(true);
    setStatusMsg('게시판으로 보내는 중입니다! 새로고침 또는 나가지 말아주세요!'); 
    
    // 퍼널: 0.5초 ~ 3.5초 랜덤 지연
    const randomDelay = Math.floor(Math.random() * 3000) + 500;
    await new Promise(resolve => setTimeout(resolve, randomDelay));

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/posts`, {
        method: 'POST',
        headers: {
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          title: title, category: author, content: content,
          created_at: new Date().toISOString()
        })
      });

      if (res.ok) {
        // [진동 피드백 추가] 0.2초간 진동
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(200); 
        }

        alert('질문이 등록되었습니다!');
        localStorage.setItem('lastWriteTime', Date.now().toString());
        // [수정] 작성 후 대기 시간을 30초에서 2초로 변경
        setTimeLeft(2);
        setAuthor(''); setTitle(''); setContent('');
      }
    } catch (err) {
      alert('접속량이 너무 많습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
      setStatusMsg('');
    }
  };

  return (
    <div style={styles.body}>
      <div style={styles.container}>
        <div style={styles.topBar}><div style={styles.topBarTitle}>질 문 쓰 기</div></div>
        <div style={styles.subHeader}>Network: Stable</div>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>작성자 명</label>
            <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="NAME" style={styles.input} disabled={loading} />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>문의 제목</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="TITLE" style={styles.input} disabled={loading} />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>문의 내용</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="내용을 입력하세요..." style={styles.textarea} disabled={loading} />
          </div>

          {statusMsg && <div style={styles.statusText}>{statusMsg}</div>}

          <div style={styles.footer}>
            <button type="submit" disabled={loading || timeLeft > 0} style={{
                ...styles.submitBtn,
                filter: (loading || timeLeft > 0) ? 'grayscale(1)' : 'none'
              }}>
              {loading ? 'WAIT...' : timeLeft > 0 ? `${timeLeft}초 대기` : '문의 쓰기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  body: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Dotum, sans-serif', backgroundColor: '#2b3974' },
  container: { width: '95%', maxWidth: '500px', backgroundColor: '#1a244d', border: '2px solid #4a9eff', boxShadow: '0 0 20px rgba(0,0,0,0.5)' },
  topBar: { background: 'linear-gradient(to bottom, #1e2a5a 0%, #0a0e2a 100%)', borderBottom: '2px solid #5a6fb3', padding: '12px', textAlign: 'center' },
  topBarTitle: { color: '#e2f1ff', fontSize: '18px', fontWeight: 'bold', textShadow: '0 0 8px #4a9eff', letterSpacing: '3px' },
  subHeader: { backgroundColor: '#3a3a3a', padding: '8px 15px', fontSize: '12px', color: '#ccc', borderBottom: '1px solid #555' },
  form: { padding: '20px' },
  inputGroup: { marginBottom: '15px' },
  label: { display: 'block', color: '#4a9eff', fontSize: '13px', marginBottom: '5px', fontWeight: 'bold' },
  input: { width: '100%', backgroundColor: '#0a0e2a', border: '1px solid #4a9eff', padding: '10px', color: '#f7d358', fontSize: '15px', outline: 'none', boxSizing: 'border-box' },
  textarea: { width: '100%', height: '100px', backgroundColor: '#0a0e2a', border: '1px solid #4a9eff', padding: '10px', color: '#f7d358', fontSize: '15px', outline: 'none', boxSizing: 'border-box', resize: 'none' },
  statusText: { color: '#fff', fontSize: '12px', textAlign: 'center', marginBottom: '15px', padding: '10px', backgroundColor: '#1e2a5a', border: '1px solid #4a9eff', animation: 'blink 1s infinite' },
  footer: { display: 'flex', justifyContent: 'flex-end' },
  submitBtn: { background: 'linear-gradient(to bottom, #4a5a8a 0%, #1a244d 100%)', color: '#fff', border: '1px solid #aaa', padding: '10px 25px', cursor: 'pointer', fontWeight: 'bold' }
};

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = `@keyframes blink { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }`;
  document.head.appendChild(styleSheet);
}