'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase'; // lib/supabase.js 파일 경로에 맞게 조정

export default function DisplayBoard() {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  
  // 페이지네이션 & 필터 상태 관리
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('active'); // 'active'(미처리) | 'archived'(보관됨) | 'all'(전체)
  const [totalCount, setTotalCount] = useState(0);
  const ITEMS_PER_PAGE = 10; // 페이지당 보여줄 개수

  // 데이터 불러오기 함수
  const fetchPosts = async () => {
    try {
      // 1. 기본 쿼리 생성 (최신순 정렬)
      let query = supabase
        .from('posts')
        .select('*', { count: 'exact' }) // 전체 개수도 같이 가져옴
        .order('created_at', { ascending: false });

      // 2. 필터링 조건 적용
      if (filter === 'active') {
        query = query.is('is_archived', false); // 보관 안 된 것만 (기본값 null/false 처리 고려)
      } else if (filter === 'archived') {
        query = query.eq('is_archived', true); // 보관된 것만
      }
      // 'all'일 경우 필터링 없음

      // 3. 페이지네이션 범위 설정 (Supabase는 0부터 시작)
      const from = (page - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      
      const { data, error, count } = await query.range(from, to);

      if (error) throw error;

      setPosts(data || []);
      setTotalCount(count || 0);
    } catch (e) {
      console.error("데이터 로딩 실패:", e);
    }
  };

  // 상태 변경 시 데이터 재호출 (페이지 이동 또는 필터 변경 시)
  useEffect(() => {
    fetchPosts();
  }, [page, filter]);

  // 보관 상태 토글 함수
  const toggleArchive = async (post, e) => {
    e.stopPropagation(); // 행 클릭 이벤트(상세보기) 방지
    
    try {
      const newStatus = !post.is_archived;
      const { error } = await supabase
        .from('posts')
        .update({ is_archived: newStatus })
        .eq('id', post.id);

      if (error) throw error;

      // 목록 새로고침 (현재 상태 유지)
      fetchPosts();
      
      // 만약 상세보기 중이었다면 닫기
      if (selectedPost && selectedPost.id === post.id) {
        setSelectedPost(null);
      }
    } catch (e) {
      alert('상태 변경에 실패했습니다.');
      console.error(e);
    }
  };

  // 날짜 포맷 함수
  const formatListDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const h = String(d.getHours()).padStart(2, '0');
    const i = String(d.getMinutes()).padStart(2, '0');
    return `${m}.${day} ${h}:${i}`;
  };

  const formatDetailDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const h = String(d.getHours()).padStart(2, '0');
    const i = String(d.getMinutes()).padStart(2, '0');
    return `${y}.${m}.${day} ${h}:${i}`;
  };

  // 총 페이지 수 계산
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div style={styles.container}>
      <div style={styles.header}><div style={styles.headerTitle}>무엇이든 물어보세요!</div></div>
      
      {/* 상단 컨트롤 영역 (필터 버튼) */}
      <div style={styles.controlBar}>
        <div style={styles.filterGroup}>
          <button 
            style={{...styles.filterBtn, backgroundColor: filter === 'active' ? '#4a9eff' : '#1a244d'}}
            onClick={() => { setFilter('active'); setPage(1); }}
          >
            진행중 (미처리)
          </button>
          <button 
            style={{...styles.filterBtn, backgroundColor: filter === 'archived' ? '#4a9eff' : '#1a244d'}}
            onClick={() => { setFilter('archived'); setPage(1); }}
          >
            보관함
          </button>
          <button 
            style={{...styles.filterBtn, backgroundColor: filter === 'all' ? '#4a9eff' : '#1a244d'}}
            onClick={() => { setFilter('all'); setPage(1); }}
          >
            전체보기
          </button>
        </div>
        <div style={styles.counter}>
          총 {totalCount}개
        </div>
      </div>

      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.thRow}>
              <th style={{ width: '8%' }}>번호</th>
              <th style={{ width: '10%' }}>상태</th>
              <th style={{ width: '15%' }}>작성자</th>
              <th style={{ width: '45%' }}>문의제목</th>
              <th style={{ width: '12%' }}>작성일</th>
              <th style={{ width: '10%' }}>관리</th>
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '30px', textAlign: 'center', color: '#aaa' }}>
                  게시글이 없습니다.
                </td>
              </tr>
            ) : (
              posts.map((post) => (
                <tr key={post.id} style={styles.tr} onClick={() => setSelectedPost(post)}>
                  <td style={styles.tdCenter}>{post.id}</td>
                  <td style={styles.tdCenter}>
                    {post.is_archived ? 
                      <span style={{color: '#aaa'}}>보관됨</span> : 
                      <span style={{color: '#00ff00'}}>진행중</span>
                    }
                  </td>
                  <td style={styles.tdCenter}>{post.category || '익명'}</td>
                  <td style={styles.tdTitle}>{post.title}</td>
                  <td style={styles.tdCenter}>{formatListDate(post.created_at)}</td>
                  <td style={styles.tdCenter}>
                    <button 
                      style={{
                        ...styles.actionBtn,
                        backgroundColor: post.is_archived ? '#555' : '#e67e22'
                      }}
                      onClick={(e) => toggleArchive(post, e)}
                    >
                      {post.is_archived ? '복구' : '보관'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 버튼 */}
      {totalPages > 0 && (
        <div style={styles.pagination}>
          <button 
            style={styles.pageBtn} 
            disabled={page === 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            &lt; 이전
          </button>
          
          <span style={styles.pageInfo}>{page} / {totalPages}</span>
          
          <button 
            style={styles.pageBtn} 
            disabled={page === totalPages}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          >
            다음 &gt;
          </button>
        </div>
      )}

      {/* 상세보기 모달 */}
      {selectedPost && (
        <div style={styles.modalOverlay} onClick={() => setSelectedPost(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalInfoGrid}>
              <div style={styles.infoLabel}>제 목</div>
              <div style={styles.infoValue}>{selectedPost.title}</div>
              <div style={styles.infoLabel}>작성자</div>
              <div style={styles.infoValueSub}>{selectedPost.category || '익명'}</div>
              <div style={styles.infoLabel}>상태</div>
              <div style={styles.infoValueStatus}>
                {selectedPost.is_archived ? '보관됨' : '확인완료'}
              </div>
              <div style={styles.infoLabelNo}>번호</div>
              <div style={styles.infoValueNo}>{selectedPost.id}</div>
              <div style={styles.infoLabelDate}>작성일</div>
              <div style={styles.infoValueDate}>{formatDetailDate(selectedPost.created_at)}</div>
            </div>
            <div style={styles.modalBody}>
              <p style={{ margin: 0, whiteSpace: 'pre-wrap', color: '#000' }}>
                {selectedPost.content || '내용이 없습니다.'}
              </p>
            </div>
            <div style={styles.modalFooter}>
              <button 
                style={{...styles.backBtn, marginRight: 'auto', backgroundColor: selectedPost.is_archived ? '#555' : '#e67e22'}}
                onClick={(e) => toggleArchive(selectedPost, e)}
              >
                {selectedPost.is_archived ? '보관 해제(복구)' : '이 질문 보관하기'}
              </button>
              <button style={styles.backBtn} onClick={() => setSelectedPost(null)}>닫기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { backgroundColor: '#2b3974', minHeight: '100vh', padding: '20px', color: '#fff', fontFamily: 'Dotum, sans-serif' },
  header: { background: 'linear-gradient(to bottom, #1e2a5a 0%, #0a0e2a 100%)', border: '2px solid #5a6fb3', padding: '10px', textAlign: 'center', marginBottom: '15px' },
  headerTitle: { color: '#e2f1ff', fontSize: '22px', fontWeight: 'bold', textShadow: '0 0 5px #4a9eff', letterSpacing: '3px' },
  
  controlBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
  filterGroup: { display: 'flex', gap: '5px' },
  filterBtn: { border: '1px solid #4a9eff', padding: '8px 15px', color: '#fff', cursor: 'pointer', fontSize: '13px', borderRadius: '4px' },
  counter: { fontSize: '13px', color: '#ccc' },

  tableWrapper: { border: '2px solid #4a9eff', backgroundColor: '#1a244d', minHeight: '400px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thRow: { borderBottom: '2px solid #4a9eff', height: '35px', fontSize: '14px', color: '#e2f1ff', backgroundColor: '#2b3974' },
  tr: { borderBottom: '1px solid #4a9eff', height: '45px', cursor: 'pointer' },
  tdCenter: { textAlign: 'center', fontSize: '13px' },
  tdTitle: { paddingLeft: '15px', fontSize: '15px', color: '#f7d358', textDecoration: 'underline' },
  
  actionBtn: { border: 'none', padding: '4px 10px', borderRadius: '3px', color: '#fff', cursor: 'pointer', fontSize: '11px' },

  pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '20px' },
  pageBtn: { background: '#1a244d', border: '1px solid #4a9eff', color: '#fff', padding: '5px 15px', cursor: 'pointer' },
  pageInfo: { fontSize: '14px', fontWeight: 'bold' },

  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalContent: { width: '95%', maxWidth: '650px', backgroundColor: '#fff', border: '2px solid #4a9eff', boxShadow: '0 0 20px #000' },
  modalInfoGrid: { display: 'grid', gridTemplateColumns: '80px 1fr 80px 120px 80px 60px', backgroundColor: '#1a244d', borderBottom: '2px solid #4a9eff' },
  infoLabel: { backgroundColor: '#2b3974', padding: '10px', borderRight: '1px solid #4a9eff', borderBottom: '1px solid #4a9eff', color: '#4a9eff', fontSize: '12px', textAlign: 'center' },
  infoValue: { gridColumn: '2 / 7', padding: '10px', borderBottom: '1px solid #4a9eff', color: '#fff', fontSize: '14px' },
  infoValueSub: { padding: '10px', color: '#fff', fontSize: '13px', borderRight: '1px solid #4a9eff', borderBottom: '1px solid #4a9eff' },
  infoValueStatus: { padding: '10px', color: '#00ff00', fontSize: '13px', fontWeight: 'bold', borderRight: '1px solid #4a9eff', borderBottom: '1px solid #4a9eff', textAlign: 'center' },
  infoLabelNo: { backgroundColor: '#2b3974', padding: '10px', borderRight: '1px solid #4a9eff', borderBottom: '1px solid #4a9eff', color: '#4a9eff', fontSize: '12px', textAlign: 'center' },
  infoValueNo: { padding: '10px', color: '#fff', fontSize: '13px', textAlign: 'center', borderBottom: '1px solid #4a9eff' },
  infoLabelDate: { backgroundColor: '#2b3974', padding: '10px', borderRight: '1px solid #4a9eff', color: '#4a9eff', fontSize: '12px', textAlign: 'center' },
  infoValueDate: { gridColumn: '2 / 5', padding: '10px', color: '#fff', fontSize: '13px' },
  modalBody: { padding: '30px', minHeight: '200px', color: '#000', fontSize: '16px', lineHeight: '1.6', backgroundColor: '#fff' },
  modalFooter: { backgroundColor: '#1a244d', padding: '12px', display: 'flex', justifyContent: 'flex-end', gap: '10px' },
  backBtn: { background: 'linear-gradient(to bottom, #4a5a8a 0%, #1a244d 100%)', color: '#fff', border: '1px solid #aaa', padding: '6px 25px', cursor: 'pointer', fontWeight: 'bold' }
};