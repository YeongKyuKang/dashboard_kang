'use client';
import { useState } from 'react';

export default function WritePage() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || loading) return;
    setLoading(true);

    // 라이브러리 없이 직접 API 호출
    await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/posts`, {
      method: 'POST',
      headers: {
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title: text, category: '질문' })
    });

    alert('질문이 등록되었습니다!');
    setText('');
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center' }}>질문하기</h2>
      <form onSubmit={handleSubmit}>
        <textarea 
          value={text} 
          onChange={(e) => setText(e.target.value)}
          placeholder="여기에 질문을 입력하세요"
          style={{ width: '100%', height: '150px', padding: '15px', borderRadius: '10px', border: '1px solid #ddd' }}
        />
        <button disabled={loading} style={{ width: '100%', padding: '15px', background: '#000', color: '#fff', border: 'none', borderRadius: '10px', marginTop: '10px', cursor: 'pointer', fontWeight: 'bold' }}>
          {loading ? '보내는 중...' : '보내기'}
        </button>
      </form>
    </div>
  );
}