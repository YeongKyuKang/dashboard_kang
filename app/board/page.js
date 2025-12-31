'use client';
import { useEffect, useState } from 'react';

export default function DisplayBoard() {
  const [posts, setPosts] = useState([]);

  const fetchPosts = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/posts?select=*&order=id.desc&limit=20`, {
        headers: {
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        }
      });
      const data = await res.json();
      if (data) setPosts(data);
    } catch (e) {
      console.error("데이터 로딩 실패");
    }
  };

  useEffect(() => {
    fetchPosts();
    // 2초마다 새 글이 있는지 확인 (실시간 느낌)
    const timer = setInterval(fetchPosts, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1 style={{ textAlign: 'center', fontSize: '40px' }}>실시간 질문 게시판</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse', borderTop: '3px solid #000' }}>
        <tbody>
          {posts.map((post) => (
            <tr key={post.id} style={{ borderBottom: '1px solid #eee', height: '65px', fontSize: '22px' }}>
              <td style={{ width: '10%', textAlign: 'center', color: '#888' }}>{post.id}</td>
              <td style={{ paddingLeft: '20px', fontWeight: '500' }}>{post.title}</td>
              <td style={{ width: '20%', textAlign: 'right', color: '#aaa', fontSize: '16px' }}>
                {new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}