import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Send, Heart, MessageCircle, User, MapPin, Calendar, MoreHorizontal, Loader, CornerDownRight, Trash2, Search } from 'lucide-react';
import CommentItem from '../components/CommentItem';

const buildCommentTree = (flatComments) => {
    const map = {};
    const roots = [];

    // 1. Facem un map pentru acces rapid
    flatComments.forEach(c => {
        map[c.commentId] = { ...c, replies: [] };
    });

    // 2. Le punem la locul lor (ori în roots, ori în replies la părinte)
    flatComments.forEach(c => {
        if (c.parentId && map[c.parentId]) {
            map[c.parentId].replies.push(map[c.commentId]);
        } else {
            roots.push(map[c.commentId]);
        }
    });

    return roots;
};

const Home = () => {
    const [posts, setPosts] = useState([]);
    const [events, setEvents] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    // Post State
    const [newPostTitle, setNewPostTitle] = useState('');
    const [newPostContent, setNewPostContent] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Comment State
    const [activePostId, setActivePostId] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loadingComments, setLoadingComments] = useState(false);

    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    let displayUsername = 'Student';
    if (currentUser?.username) displayUsername = currentUser.username;
    const displayRole = role === 'REPRESENTATIVE' ? 'Student Representative' : 'Student @ UVT';

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [postsRes, eventsRes, userRes] = await Promise.all([
                    api.get('/posts'),
                    api.get('/events/upcoming'),
                    api.get('/users/me')
                ]);
                setPosts(postsRes.data || []);
                setEvents(eventsRes.data || []);
                setCurrentUser(userRes.data);
            } catch (error) { console.error(error); }
            finally { setLoading(false); }
        };
        fetchData();
    }, []);

    // --- SEARCH FUNCTION ---
    const handleSearch = async (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        if(query.length < 2) {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }
        setIsSearching(true);
        try {
            const res = await api.get(`/users/search?query=${query}`);
            setSearchResults(res.data);
        } catch(err) { console.error(err); }
        finally { setIsSearching(false); }
    };

    const renderSmartContent = (text) => {
        if (!text) return null;
        try {
            const urlRegex = /(https?:\/\/[^\s]+)/g;
            const parts = text.split(urlRegex);
            return parts.map((part, index) => {
                if (part.match(urlRegex)) {
                    const isImage = part.match(/\.(jpeg|jpg|gif|png|webp)$/i) != null;
                    if (isImage) return <div key={index} style={{margin:'10px 0'}}><img src={part} style={{maxWidth:'100%', borderRadius:'8px', maxHeight:'400px', objectFit:'cover', border:'1px solid var(--border-color)'}} /></div>;
                    return <a key={index} href={part} target="_blank" rel="noopener noreferrer" style={{color:'var(--primary)', textDecoration:'underline'}}>{part}</a>;
                }
                return <span key={index}>{part}</span>;
            });
        } catch (e) { return text; }
    };

    const renderAvatar = (userObj, size='40px', fs='1rem') => {
        // Încadrăm avatarul în LINK către profil
        const content = userObj?.profilePicture ?
            <img src={userObj.profilePicture} style={{width:'100%', height:'100%', objectFit:'cover'}} /> :
            <div style={{width:'100%', height:'100%', background:'var(--primary)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'bold', fontSize:fs}}>{userObj?.username?.[0].toUpperCase() || 'U'}</div>;

        // Dacă avem ID-ul, facem link
        if(userObj?.userId) {
            return (
                <Link to={`/profile/${userObj.userId}`} style={{display:'block', width:size, height:size, borderRadius:'50%', overflow:'hidden', border:'1px solid #e2e8f0', flexShrink:0}}>
                    {content}
                </Link>
            );
        }
        return <div style={{width:size, height:size, borderRadius:'50%', overflow:'hidden', border:'1px solid #e2e8f0', flexShrink:0}}>{content}</div>;
    };

    // ... (RESTUL FUNCȚIILOR createPost, delete, like, etc. RĂMÂN IDENTICE) ...
    const handleCreatePost = async (e) => { e.preventDefault(); if (!newPostContent.trim() || !newPostTitle.trim()) return; setSubmitting(true); try { const response = await api.post('/posts', { title: newPostTitle, content: newPostContent }); setPosts([{ ...response.data, author: currentUser }, ...posts]); setNewPostContent(''); setNewPostTitle(''); } catch (error) { alert('Error'); } finally { setSubmitting(false); } };
    const handleDeletePost = async (postId) => { if (!window.confirm("Delete?")) return; try { await api.delete(`/posts/${postId}`); setPosts(posts.filter(p => p.postId !== postId)); } catch (e) { alert("Failed."); } };
    const handleLike = async (postId) => {
        // Verificare rapidă locală (opțional)
        const post = posts.find(p => p.postId === postId);
        if (post && currentUser && post.author.userId === currentUser.userId) {
            alert("You cannot like your own post!");
            return;
        }

        try {
            const res = await api.post(`/posts/${postId}/like`);
            setPosts(posts.map(p => p.postId === postId ? { ...res.data, author: p.author } : p));
        } catch (e) {
            // Afișăm eroarea de la backend ("You cannot like...")
            if(e.response && e.response.data) {
                alert(e.response.data);
            }
        }
    };
    const toggleComments = async (postId) => { if (activePostId === postId) { setActivePostId(null); return; } setActivePostId(postId); setLoadingComments(true); setComments([]); try { const res = await api.get(`/comments/post/${postId}`); setComments(res.data); } catch (e) {} finally { setLoadingComments(false); } };
    const handleSubmitComment = async (e) => { e.preventDefault(); if (!newComment.trim()) return; try { const res = await api.post(`/comments/post/${activePostId}`, { content: newComment }); setComments([...comments, { ...res.data, author: currentUser }]); setNewComment(''); } catch (e) {} };
    const handleDeleteComment = async (commentId) => { if (!window.confirm("Delete?")) return; try { await api.delete(`/comments/${commentId}`); setComments(comments.filter(c => c.commentId !== commentId)); } catch (e) {} };
    const formatDate = (s) => s ? new Date(s).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
    const getEventDateParts = (s) => { const d = new Date(s); return { day: d.getDate(), month: d.toLocaleString('en-US', { month: 'short' }).toUpperCase() }; };

    return (
        <div className="dashboard-grid">

            {/* LEFT: PROFILE */}
            <div className="sidebar-left">
                <div className="card profile-card">
                    <div className="profile-bg"></div>
                    <div className="profile-content">
                        <div style={{ margin: '-35px auto 10px', display:'flex', justifyContent:'center' }}>{renderAvatar(currentUser, '70px', '1.5rem')}</div>
                        <h3 className="profile-name">{displayUsername}</h3>
                        <p className="profile-role" style={{ color: role === 'REPRESENTATIVE' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: role === 'REPRESENTATIVE' ? '700' : '400' }}>{displayRole}</p>
                        <div className="profile-stats">
                            <div className="stat"><span className="stat-val">{posts.filter(p => p.author?.username === displayUsername).length}</span><span className="stat-label">My Posts</span></div>
                            <div className="stat"><span className="stat-val">{posts.filter(p => p.author?.username === displayUsername).reduce((acc, curr) => acc + curr.likes, 0)}</span><span className="stat-label">Likes</span></div>
                        </div>
                    </div>
                </div>
                <div className="card mini-nav">
                    <Link to="/" className="nav-item active"><MapPin size={18}/> Feed</Link>
                    <Link to="/events" className="nav-item"><Calendar size={18}/> Events</Link>
                    <div className="nav-item"><MessageCircle size={18}/> Groups</div>
                </div>
            </div>

            {/* MIDDLE: FEED */}
            <div className="feed-column">
                <div className="card create-post-card">
                    <div style={{ marginBottom: '1rem' }}>
                        <input type="text" placeholder="Post Title" value={newPostTitle} onChange={(e) => setNewPostTitle(e.target.value)} style={{ width: '100%', marginBottom: '10px', fontWeight: 'bold', border: 'none', borderBottom: '1px solid var(--border-color)', borderRadius: 0, padding: '10px 0' }} />
                        <div style={{ display: 'flex', gap: '10px' }}>
                            {renderAvatar(currentUser, '40px')}
                            <textarea placeholder={`Share something...`} value={newPostContent} onChange={(e) => setNewPostContent(e.target.value)} rows={2} style={{border:'none', background:'transparent', resize:'none', width:'100%', outline:'none'}} />
                        </div>
                    </div>
                    <div className="create-post-footer">
                        <button onClick={handleCreatePost} className="btn-primary post-btn" disabled={submitting || !newPostContent.trim() || !newPostTitle.trim()}>
                            {submitting ? 'Posting...' : <><Send size={16} style={{marginRight:5}}/> Post</>}
                        </button>
                    </div>
                </div>

                {loading ? <div style={{textAlign:'center', padding:'2rem'}}><Loader className="spin" size={24}/> Loading...</div> : posts.map((post) => (
                    <div key={post.postId} className="card post-card">
                        <div className="post-header">
                            <div className="post-author-info">
                                {renderAvatar(post.author, '40px')}
                                <div>
                                    {/* LINK CĂTRE PROFIL ȘI PE NUME */}
                                    <Link to={`/profile/${post.author?.userId}`} style={{textDecoration:'none', color:'inherit'}}>
                                        <h4 className="author-name" style={{cursor:'pointer'}}>{post.author?.username || 'Unknown'}</h4>
                                    </Link>
                                    <div className="post-meta">{post.faculty || 'General'} • {formatDate(post.timestamp)}</div>
                                </div>
                            </div>
                            {currentUser && post.author && currentUser.username === post.author.username && (<button onClick={() => handleDeletePost(post.postId)} className="icon-btn" style={{color:'#ef4444'}}><Trash2 size={18}/></button>)}
                        </div>
                        <div className="post-body">
                            {post.title && <h3 style={{marginTop:0, marginBottom:'0.5rem', fontSize:'1.1rem'}}>{post.title}</h3>}
                            <div>{renderSmartContent(post.content)}</div>
                        </div>
                        <div className="post-actions">
                            <button className={`action-btn ${post.likes > 0 ? 'liked' : ''}`} onClick={() => handleLike(post.postId)}><Heart size={20} fill={post.likes > 0 ? "#ef4444" : "none"} /> {post.likes}</button>
                            <button className={`action-btn ${activePostId === post.postId ? 'active-comment-btn' : ''}`} onClick={() => toggleComments(post.postId)}><MessageCircle size={20} /> Comments</button>
                        </div>
                        {activePostId === post.postId && (
                            <div className="comments-section">
                                <div className="comments-list">
                                    {comments.length === 0 ? (
                                        <p style={{textAlign:'center', color:'#94a3b8', fontSize:'0.9rem', padding:'10px'}}>
                                            No comments yet. Be the first!
                                        </p>
                                    ) : (
                                        // AICI FOLOSIM FUNCȚIA ȘI COMPONENTA NOUĂ
                                        buildCommentTree(comments).map(rootComment => (
                                            <CommentItem
                                                key={rootComment.commentId}
                                                comment={rootComment}
                                                currentUser={currentUser}
                                                postId={post.postId}
                                                onDelete={handleDeleteComment}
                                                onReplySuccess={(newReply) => {
                                                    // Când dăm reply, adăugăm noul comentariu la lista mare
                                                    // și React va re-calcula arborele automat
                                                    setComments(prev => [...prev, { ...newReply, author: currentUser }]);
                                                }}
                                            />
                                        ))
                                    )}
                                </div>
                                <form onSubmit={handleSubmitComment} className="comment-form"><input type="text" placeholder="Comment..." value={newComment} onChange={(e) => setNewComment(e.target.value)} /><button type="submit" disabled={!newComment.trim()}><CornerDownRight size={16} /></button></form>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* RIGHT: EVENTS & SEARCH */}
            <div className="sidebar-right">

                {/* --- SEARCH BOX (NOU) --- */}
                <div className="card" style={{padding:'1rem'}}>
                    <h4 style={{margin:'0 0 10px 0', fontSize:'1rem'}}>Find Colleagues</h4>
                    <div style={{position:'relative'}}>
                        <input
                            type="text"
                            placeholder="Search username or email..."
                            value={searchQuery}
                            onChange={handleSearch}
                            style={{paddingLeft:'35px'}}
                        />
                        <Search size={18} style={{position:'absolute', left:'10px', top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)'}} />
                    </div>

                    {/* Rezultate Căutare */}
                    {searchResults.length > 0 && (
                        <div style={{marginTop:'10px', display:'flex', flexDirection:'column', gap:'10px'}}>
                            {searchResults.map(u => (
                                <Link to={`/profile/${u.userId}`} key={u.userId} style={{display:'flex', alignItems:'center', gap:'10px', textDecoration:'none', color:'inherit', padding:'5px', borderRadius:'5px', background:'#f8fafc'}}>
                                    {/* Mini Avatar in search */}
                                    <div style={{width:'30px', height:'30px', borderRadius:'50%', background:'var(--primary)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.8rem', overflow:'hidden'}}>
                                        {u.profilePicture ? <img src={u.profilePicture} style={{width:'100%', height:'100%', objectFit:'cover'}}/> : u.username[0].toUpperCase()}
                                    </div>
                                    <div style={{fontSize:'0.9rem', fontWeight:'500'}}>{u.username}</div>
                                </Link>
                            ))}
                        </div>
                    )}
                    {searchQuery && searchResults.length === 0 && !isSearching && (
                        <div style={{fontSize:'0.8rem', color:'var(--text-muted)', marginTop:'5px'}}>No users found.</div>
                    )}
                </div>

                <div className="card events-card">
                    <div style={{display:'flex', justifyContent:'space-between', padding:'1rem 1rem 0'}}>
                        <h4 style={{margin:0, fontSize:'1rem'}}>Upcoming Events</h4>
                        <Link to="/events" style={{fontSize:'0.8rem', color:'var(--primary)'}}>See all</Link>
                    </div>
                    <div style={{marginTop:'1rem'}}>
                        {events.slice(0, 3).map(event => {
                            const { day, month } = getEventDateParts(event.date);
                            return (
                                <div key={event.eventId} className="event-item">
                                    <div className="event-date"><span className="day">{day}</span><span className="month">{month}</span></div>
                                    <div className="event-info"><h5>{event.title}</h5><p>{event.faculty || 'University'}</p></div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className="footer-links"><p>© 2024 UniConnect</p></div>
            </div>
        </div>
    );
};

export default Home;