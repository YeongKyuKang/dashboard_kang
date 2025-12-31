'use client';
import { useEffect, useState } from 'react';

export default function DisplayBoard() {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);

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
    const timer = setInterval(fetchPosts, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={styles.container}>
      {/* 상단 헤더 */}
      <div style={styles.header}>
        <div style={styles.headerTitle}>웹 문의</div>
      </div>
      <div style={styles.subHeader}>웹문의 보기</div>

      {/* 리스트 테이블 */}
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.thRow}>
              <th style={{ width: '10%' }}>문의번호</th>
              <th style={{ width: '15%' }}>작성자</th> {/* 작성자 컬럼 추가 */}
              <th style={{ width: '60%' }}>문의제목</th>
              <th style={{ width: '15%' }}>작성일</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id} style={styles.tr} onClick={() => setSelectedPost(post)}>
                <td style={styles.tdCenter}>{post.id}</td>
                <td style={styles.tdCenter}>{post.category || '익명'}</td> {/* 작성자 표시 */}
                <td style={styles.tdTitle}>
                   {post.title}
                </td>
                <td style={styles.tdCenter}>
                  {new Date(post.created_at).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' }).replace(/\. /g, '.')} {new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 상세 보기 팝업 (모달) */}
      {selectedPost && (
        <div style={styles.modalOverlay} onClick={() => setSelectedPost(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            {/* 팝업 상단 정보바 */}
            <div style={styles.modalInfoGrid}>
              <div style={styles.infoLabel}>제 목</div>
              <div style={styles.infoValue}>{selectedPost.title}</div>
              
              <div style={styles.infoLabel}>작성자</div>
              <div style={styles.infoValueSub}>{selectedPost.category || '익명'}</div>
              
              <div style={styles.infoLabel}>처리상태</div>
              <div style={styles.infoValueStatus}>확인완료</div> {/* 대기중 -> 확인완료 변경 */}
              
              <div style={styles.infoLabelNo}>문의번호</div>
              <div style={styles.infoValueNo}>{selectedPost.id}</div>
            </div>

            {/* 본문 내용 영역 */}
            <div style={styles.modalBody}>
              <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                {selectedPost.title}
              </p>
            </div>

            {/* 하단 닫기 버튼 */}
            <div style={styles.modalFooter}>
              <button style={styles.backBtn} onClick={() => setSelectedPost(null)}>뒤로</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { backgroundColor: '#2b3974', minHeight: '100vh', padding: '20px', color: '#fff', fontFamily: 'Dotum, sans-serif' },
  header: { background: 'linear-gradient(to bottom, #1e2a5a 0%, #0a0e2a 100%)', border: '2px solid #5a6fb3', padding: '10px', textAlign: 'center' },
  headerTitle: { color: '#e2f1ff', fontSize: '22px', fontWeight: 'bold', textShadow: '0 0 5px #4a9eff', letterSpacing: '3px' },
  subHeader: { backgroundColor: '#3a3a3a', padding: '5px 15px', fontSize: '13px', color: '#ccc', marginBottom: '15px' },
  tableWrapper: { border: '2px solid #4a9eff', backgroundColor: '#1a244d' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thRow: { borderBottom: '2px solid #4a9eff', height: '35px', fontSize: '14px', color: '#e2f1ff', backgroundColor: '#2b3974' },
  tr: { borderBottom: '1px solid #4a9eff', height: '45px', cursor: 'pointer', transition: 'background 0.2s' },
  tdCenter: { textAlign: 'center', fontSize: '13px' },
  tdTitle: { paddingLeft: '15px', fontSize: '15px', color: '#f7d358', textDecoration: 'underline' },

  // 모달(팝업) 스타일
  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalContent: { width: '650px', backgroundColor: '#fff', border: '2px solid #4a9eff', boxShadow: '0 0 20px #000' },
  
  // 모달 상단 헤더 그리드
  modalInfoGrid: { display: 'grid', gridTemplateColumns: '80px 1fr 80px 120px 80px 60px', backgroundColor: '#1a244d', borderBottom: '2px solid #4a9eff' },
  infoLabel: { backgroundColor: '#2b3974', padding: '10px', borderRight: '1px solid #4a9eff', borderBottom: '1px solid #4a9eff', color: '#4a9eff', fontSize: '12px', textAlign: 'center' },
  infoValue: { gridColumn: '2 / 7', padding: '10px', borderBottom: '1px solid #4a9eff', color: '#fff', fontSize: '14px' },
  
  infoValueSub: { padding: '10px', color: '#fff', fontSize: '13px', borderRight: '1px solid #4a9eff', borderBottom: '1px solid #4a9eff' },
  infoValueStatus: { padding: '10px', color: '#00ff00', fontSize: '13px', fontWeight: 'bold', borderRight: '1px solid #4a9eff', borderBottom: '1px solid #4a9eff', textAlign: 'center' }, // 확인완료 초록색 강조
  
  infoLabelNo: { backgroundColor: '#2b3974', padding: '10px', borderRight: '1px solid #4a9eff', borderBottom: '1px solid #4a9eff', color: '#4a9eff', fontSize: '12px', textAlign: 'center' },
  infoValueNo: { padding: '10px', color: '#fff', fontSize: '13px', textAlign: 'center', borderBottom: '1px solid #4a9eff' },

  modalBody: { padding: '40px', minHeight: '250px', color: '#000', fontSize: '16px', lineHeight: '1.6', backgroundColor: '#fff' },
  
  modalFooter: { backgroundColor: '#1a244d', padding: '12px', display: 'flex', justifyContent: 'flex-end' },
  backBtn: { background: 'linear-gradient(to bottom, #4a5a8a 0%, #1a244d 100%)', color: '#fff', border: '1px solid #aaa', padding: '6px 25px', cursor: 'pointer', fontWeight: 'bold' }
};