'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function DisplayBoard() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const { data } = await supabase.from('posts').select('*').order('id', { ascending: false }).limit(20);
      if (data) setPosts(data);
    };
    fetchPosts();

    const channel = supabase.channel('realtime-posts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, 
      (payload) => {
        setPosts((prev) => [payload.new, ...prev].slice(0, 20));
      }).subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  return (
    <div style={{ padding: '40px' }}>
      <h1 style={{ textAlign: 'center' }}>실시간 Q&A 현황</h1>
      <table style={{ width: '100%', borderTop: '2px solid #000', borderCollapse: 'collapse' }}>
        <tbody>
          {posts.map((post) => (
            <tr key={post.id} style={{ borderBottom: '1px solid #eee', height: '60px', fontSize: '20px' }}>
              <td style={{ width: '10%', textAlign: 'center' }}>{post.id}</td>
              <td style={{ paddingLeft: '20px' }}>{post.title}</td>
              <td style={{ width: '15%', color: '#999' }}>
                {new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}