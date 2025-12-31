'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function WritePage() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || loading) return;
    setLoading(true);
    const { error } = await supabase.from('posts').insert([{ title: text, category: '질문' }]);
    if (error) alert('실패했습니다.');
    else { alert('등록 완료!'); setText(''); }
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
      <h2>실시간 질문하기</h2>
      <form onSubmit={handleSubmit}>
        <textarea 
          value={text} 
          onChange={(e) => setText(e.target.value)}
          placeholder="질문을 입력하세요"
          style={{ width: '100%', height: '150px', padding: '10px', marginBottom: '10px' }}
        />
        <button disabled={loading} style={{ width: '100%', padding: '15px', background: '#000', color: '#fff' }}>
          보내기
        </button>
      </form>
    </div>
  );
}