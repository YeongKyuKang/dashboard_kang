'use client';
import { useState, CSSProperties } from 'react';

export default function RootWritePage() {
  const [author, setAuthor] = useState('');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !text.trim() || loading) {
      alert('작성자와 내용을 모두 입력해주세요.');
      return;
    }
    setLoading(true);

    try {
      await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/posts`, {
        method: 'POST',
        headers: {
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          title: text, 
          category: author, 
          created_at: new Date().toISOString()
        })
      });

      alert('질문이 등록되었습니다!');
      setAuthor('');
      setText('');
    } catch (err) {
      alert('등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.body}>
      <div style={styles.container}>
        <div style={styles.topBar}>
          <div style={styles.topBarTitle}>질 문 쓰 기</div>
        </div>
        <div style={styles.subHeader}>웹 문의 작성</div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>작성자 명</label>
            <input 
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="NAME"
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>문의 내용</label>
            <textarea 
              value={text} 
              onChange={(e) => setText(e.target.value)}
              placeholder="질문 내용을 입력하세요..."
              style={styles.textarea}
            />
          </div>

          <div style={styles.footer}>
            <button type="submit" disabled={loading} style={styles.submitBtn}>
              {loading ? 'SENDING...' : '문의 쓰기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// CSSProperties 타입을 사용하여 TS 에러 해결
const styles: { [key: string]: CSSProperties } = {
  body: { backgroundColor: '#2b3974', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Dotum", sans-serif' },
  container: { width: '90%', maxWidth: '500px', backgroundColor: '#1a244d', border: '2px solid #4a9eff', boxShadow: '0 0 20px rgba(0,0,0,0.5)', overflow: 'hidden' },
  topBar: { background: 'linear-gradient(to bottom, #1e2a5a 0%, #0a0e2a 100%)', borderBottom: '2px solid #5a6fb3', padding: '12px', textAlign: 'center' },
  topBarTitle: { color: '#e2f1ff', fontSize: '20px', fontWeight: 'bold', textShadow: '0 0 8px #4a9eff', letterSpacing: '3px' },
  subHeader: { backgroundColor: '#3a3a3a', padding: '8px 15px', fontSize: '13px', color: '#ccc', borderBottom: '1px solid #555' },
  form: { padding: '25px' },
  inputGroup: { marginBottom: '20px' },
  label: { display: 'block', color: '#4a9eff', fontSize: '14px', marginBottom: '8px', fontWeight: 'bold' },
  input: { width: '100%', backgroundColor: '#0a0e2a', border: '1px solid #4a9eff', padding: '12px', color: '#f7d358', fontSize: '16px', outline: 'none', boxSizing: 'border-box' },
  textarea: { width: '100%', height: '180px', backgroundColor: '#0a0e2a', border: '1px solid #4a9eff', padding: '12px', color: '#f7d358', fontSize: '16px', outline: 'none', boxSizing: 'border-box', resize: 'none' },
  footer: { display: 'flex', justifyContent: 'flex-end', marginTop: '10px' },
  submitBtn: { background: 'linear-gradient(to bottom, #4a5a8a 0%, #1a244d 100%)', color: '#fff', border: '2px solid #aaa', padding: '10px 30px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }
};