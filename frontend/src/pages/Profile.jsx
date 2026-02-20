import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // Importăm useParams
import api from '../services/api';
import { User, Save, Edit2, Grid, Heart, MessageCircle, Trash2, CornerDownRight } from 'lucide-react';
import CommentItem from '../components/CommentItem';

// Aceeași funcție helper pe care am folosit-o în Home.jsx
const buildCommentTree = (flatComments) => {
    const map = {};
    const roots = [];

    flatComments.forEach(c => {
        map[c.commentId] = { ...c, replies: [] };
    });

    flatComments.forEach(c => {
        if (c.parentId && map[c.parentId]) {
            map[c.parentId].replies.push(map[c.commentId]);
        } else {
            roots.push(map[c.commentId]);
        }
    });

    return roots;
};

const Profile = () => {
    const { userId } = useParams(); // Luăm ID-ul din URL (dacă există)

    const [user, setUser] = useState(null);
    const [currentUser, setCurrentUser] = useState(null); // Cine sunt eu (cel logat)
    const [myPosts, setMyPosts] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ postCount: 0, totalLikes: 0 });

    // Formular editare
    const [formData, setFormData] = useState({ bio: '', profilePicture: '' });

    // Comentarii
    const [activePostId, setActivePostId] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loadingComments, setLoadingComments] = useState(false);

    // Verificăm dacă e profilul meu (Propriul meu profil sau am dat click pe mine)
    const isOwnProfile = !userId || (currentUser && currentUser.userId === Number(userId));

    useEffect(() => {
        fetchData();
    }, [userId]); // Se reîncarcă dacă se schimbă ID-ul din URL

    const fetchData = async () => {
        setLoading(true);
        try {
            const meRes = await api.get('/users/me');
            setCurrentUser(meRes.data);

            let targetId = userId;
            if (!targetId) targetId = meRes.data.userId; // Dacă e profilul meu

            // Luăm Userul, Postările și STATISTICILE (Request Nou)
            const [profileRes, postsRes, statsRes] = await Promise.all([
                api.get(`/users/${targetId}`),
                api.get(`/users/${targetId}/posts`),
                api.get(`/users/${targetId}/stats`) // <--- Endpoint-ul nou
            ]);

            setUser(profileRes.data);
            setMyPosts(postsRes.data);
            setStats(statsRes.data); // <--- Salvăm statisticile

            // ... restul logicii de form fill ...
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    const handleUpdate = async () => {
        try {
            const res = await api.put('/users/profile', formData);
            setUser(res.data);
            setIsEditing(false);
        } catch (error) { alert("Error updating"); }
    };

    // --- Aceleași funcții helper ca înainte ---
    const renderSmartContent = (text) => {
        if (!text) return null;
        try {
            const urlRegex = /(https?:\/\/[^\s]+)/g;
            const parts = text.split(urlRegex);
            return parts.map((part, index) => {
                if (part.match(urlRegex)) {
                    const isImage = part.match(/\.(jpeg|jpg|gif|png|webp)$/i) != null;
                    if (isImage) {
                        return <div key={index} style={{margin:'10px 0'}}><img src={part} style={{maxWidth:'100%', borderRadius:'8px', maxHeight:'400px'}} /></div>;
                    }
                    return <a key={index} href={part} target="_blank" style={{color:'var(--primary)', textDecoration:'underline'}}>{part}</a>;
                }
                return <span key={index}>{part}</span>;
            });
        } catch (e) { return text; }
    };

    const renderAvatar = (u, size, fs) => {
        if (u?.profilePicture) return <div style={{width:size, height:size, borderRadius:'50%', overflow:'hidden', border:'1px solid #ddd'}}><img src={u.profilePicture} style={{width:'100%', height:'100%', objectFit:'cover'}}/></div>;
        return <div style={{width:size, height:size, borderRadius:'50%', background:'var(--primary)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:fs, fontWeight:'bold'}}>{u?.username?.[0].toUpperCase() || 'U'}</div>;
    };

    const formatDate = (s) => s ? new Date(s).toLocaleString() : '';

    // Interacțiuni (simplificate pentru brevity - logica e aceeași)
    const handleDeletePost = async (pid) => { if(confirm("Delete?")) { await api.delete(`/posts/${pid}`); setMyPosts(myPosts.filter(p=>p.postId!==pid)); }};
    const handleLike = async (pid) => {
        // Verificare rapidă locală (opțional, pentru UX)
        const post = myPosts.find(p => p.postId === pid);
        if (post && currentUser && post.author.userId === currentUser.userId) {
            alert("You cannot like your own post!");
            return;
        }

        try {
            const res = await api.post(`/posts/${pid}/like`);
            // Actualizăm postarea în listă, păstrând autorul original (care are obiectul complet)
            setMyPosts(myPosts.map(p => p.postId === pid ? { ...res.data, author: p.author } : p));
        } catch (error) {
            if (error.response && error.response.data) {
                alert(error.response.data); // Afișează "You cannot like your own post!"
            }
        }
    };
    const toggleComments = async (pid) => {
        if(activePostId===pid){setActivePostId(null);return;} setActivePostId(pid); setLoadingComments(true);
        try{const res=await api.get(`/comments/post/${pid}`); setComments(res.data);}finally{setLoadingComments(false);}
    };
    const handleSubmitComment = async (e)=>{e.preventDefault(); if(!newComment.trim())return; const res=await api.post(`/comments/post/${activePostId}`, {content:newComment}); setComments([...comments, {...res.data, author:currentUser}]); setNewComment('');};
    const handleDeleteComment = async (cid) => { if(confirm("Delete?")) { await api.delete(`/comments/${cid}`); setComments(comments.filter(c=>c.commentId!==cid)); }};

    if (loading || !user) return <div style={{textAlign:'center', marginTop:'2rem'}}>Loading...</div>;

    const totalLikes = myPosts.reduce((acc, p) => acc + p.likes, 0);

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>

            {/* HEADER PROFIL */}
            <div className="card" style={{ padding: '2rem', textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{ margin: '0 auto 1rem', display:'flex', justifyContent:'center' }}>
                    {renderAvatar(user, '120px', '2.5rem')}
                </div>

                {isEditing && isOwnProfile ? (
                    <div style={{maxWidth:'400px', margin:'0 auto', display:'flex', flexDirection:'column', gap:'10px'}}>
                        <input value={formData.profilePicture} onChange={e=>setFormData({...formData, profilePicture:e.target.value})} placeholder="Image URL" />
                        <textarea value={formData.bio} onChange={e=>setFormData({...formData, bio:e.target.value})} placeholder="Bio" />
                        <div style={{display:'flex', gap:'10px', justifyContent:'center'}}>
                            <button className="btn-primary" onClick={handleUpdate}><Save size={18}/> Save</button>
                            <button onClick={()=>setIsEditing(false)} style={{padding:'8px', background:'#fff', border:'1px solid #ccc', borderRadius:'8px'}}>Cancel</button>
                        </div>
                    </div>
                ) : (
                    <>
                        <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>{user.username}</h2>
                        <p style={{ color: 'var(--primary)', fontWeight: '600', marginBottom: '1rem' }}>
                            {user.role === 'REPRESENTATIVE' ? 'Student Representative' : 'Student'} @ {user.faculty || 'UVT'}
                        </p>
                        <p style={{ color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto 1.5rem' }}>
                            {user.bio || (isOwnProfile ? "Add a bio!" : "No bio yet.")}
                        </p>

                        <div style={{ display:'flex', justifyContent:'center', gap:'2rem', marginBottom:'1.5rem' }}>
                            <div style={{textAlign:'center'}}>
                                {/* Folosim stats din backend */}
                                <div style={{fontWeight:'700', fontSize:'1.2rem'}}>{stats.postCount}</div>
                                <div style={{fontSize:'0.8rem', color:'var(--text-muted)'}}>Posts</div>
                            </div>
                            <div style={{textAlign:'center'}}>
                                {/* Aici afișăm Karma Totală (Post + Comentarii) */}
                                <div style={{fontWeight:'700', fontSize:'1.2rem', color:'#ef4444'}}>{stats.totalLikes}</div>
                                <div style={{fontSize:'0.8rem', color:'var(--text-muted)'}}>Total Likes</div>
                            </div>
                        </div>

                        {/* Butonul de Editare apare DOAR dacă e profilul tău */}
                        {isOwnProfile && (
                            <button onClick={() => setIsEditing(true)} style={{ background: 'white', border: '1px solid var(--border-color)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                                <Edit2 size={16} /> Edit Profile
                            </button>
                        )}
                    </>
                )}
            </div>

            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Grid size={20} /> {isOwnProfile ? 'My Posts' : `${user.username}'s Posts`}
            </h3>

            {/* LISTA POSTARI - Aici refolosim logica de afisare (prescurtata pentru copy-paste usor, include delete conditions) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {myPosts.map(post => (
                    <div key={post.postId} className="card post-card">
                        <div className="post-header">
                            <div className="post-author-info">
                                {renderAvatar(post.author, '40px', '1rem')}
                                <div><h4 className="author-name">{post.author.username}</h4><div className="post-meta">{formatDate(post.timestamp)}</div></div>
                            </div>
                            {/* Delete Post: Doar dacă sunt eu proprietarul sau admin */}
                            {currentUser && (currentUser.userId === post.author.userId) && (
                                <button onClick={()=>handleDeletePost(post.postId)} className="icon-btn" style={{color:'#ef4444'}}><Trash2 size={18}/></button>
                            )}
                        </div>
                        <div className="post-body">
                            {post.title && <h3>{post.title}</h3>}
                            <div>{renderSmartContent(post.content)}</div>
                        </div>
                        <div className="post-actions">
                            <button className={`action-btn ${post.likes>0?'liked':''}`} onClick={()=>handleLike(post.postId)}><Heart size={20} fill={post.likes>0?"#ef4444":"none"}/> {post.likes}</button>
                            <button className="action-btn" onClick={()=>toggleComments(post.postId)}><MessageCircle size={20}/> Comments</button>
                        </div>
                        {activePostId === post.postId && (
                            <div className="comments-section" style={{
                                padding: '15px',
                                background: '#f8fafc',
                                borderRadius: '0 0 12px 12px',
                                borderTop: '1px solid #e2e8f0'
                            }}>

                                <div className="comments-list">
                                    {loadingComments ? (
                                        <p style={{textAlign:'center', fontSize:'0.9rem'}}>Loading...</p>
                                    ) : comments.length === 0 ? (
                                        <p style={{textAlign:'center', color:'#64748b', fontSize:'0.85rem', padding: '10px'}}>
                                            No comments yet.
                                        </p>
                                    ) : (
                                        // Folosim arborele pentru a permite Reply-uri infinite
                                        buildCommentTree(comments).map(rootComment => (
                                            <CommentItem
                                                key={rootComment.commentId}
                                                comment={rootComment}
                                                currentUser={currentUser}
                                                postId={post.postId}
                                                onDelete={handleDeleteComment}
                                                onReplySuccess={(newReply) => {
                                                    // Adăugăm noul reply în lista plată de comentarii
                                                    setComments(prev => [...prev, { ...newReply, author: currentUser }]);
                                                }}
                                            />
                                        ))
                                    )}
                                </div>

                                {/* SINGURA formă de comentariu root (principal) */}
                                <form onSubmit={handleSubmitComment} className="comment-form" style={{
                                    marginTop: '15px',
                                    display: 'flex',
                                    gap: '10px',
                                    padding: '10px 0'
                                }}>
                                    <input
                                        value={newComment}
                                        onChange={e => setNewComment(e.target.value)}
                                        placeholder="Write a comment..."
                                        style={{
                                            flex: 1,
                                            padding: '10px 15px',
                                            borderRadius: '25px',
                                            border: '1px solid #cbd5e1',
                                            outline: 'none'
                                        }}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newComment.trim()}
                                        style={{
                                            background: 'var(--primary)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '50%',
                                            width: '40px',
                                            height: '40px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <CornerDownRight size={20} />
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Profile;