import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageSquare, Trash2, CornerDownRight } from 'lucide-react'; // Asigură-te că ai pachetul lucide-react
import api from '../services/api';

const CommentItem = ({ comment, currentUser, postId, onDelete, onReplySuccess }) => {
    // State-uri locale pentru interactivitate instantanee
    const [likes, setLikes] = useState(comment.likes || 0);
    const [showReplyInput, setShowReplyInput] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [isExpanded, setIsExpanded] = useState(true); // Pentru trunchiere (Collapse [-])

    // Funcția de Like la Comentariu
    const handleLike = async () => {
        // Verificare rapidă în frontend ca să nu mai facem request degeaba
        if (currentUser && currentUser.userId === comment.author.userId) {
            alert("You cannot like your own comment!");
            return;
        }

        try {
            const res = await api.post(`/comments/${comment.commentId}/like`);

            // Backend-ul returnează comentariul actualizat cu numărul corect de like-uri
            // Deoarece getLikes() din Java returnează mărimea listei, va fi un număr.
            setLikes(res.data.likes);

            // Aici poți face o logică de toggle vizual, dar e mai complex să știi dacă ai dat like deja
            // Momentan, simplul fapt că se schimbă numărul e suficient.
        } catch (e) {
            // Dacă backend-ul aruncă eroare (ex: "You cannot like..."), o afișăm
            if (e.response && e.response.data) {
                alert(e.response.data);
            }
        }
    };

    // Funcția de Reply
    const handleSendReply = async (e) => {
        e.preventDefault();
        if (!replyContent.trim()) return;

        try {
            // Trimitem parentId ca să știe backend-ul că e un răspuns
            const res = await api.post(`/comments/post/${postId}`, {
                content: replyContent,
                parentId: comment.commentId
            });

            // Resetăm input-ul și anunțăm pagina părinte
            setReplyContent('');
            setShowReplyInput(false);
            setIsExpanded(true); // Dacă era închis, îl deschidem să se vadă răspunsul
            if (onReplySuccess) onReplySuccess(res.data);
        } catch (e) {
            alert("Failed to reply.");
        }
    };

    // Helper pentru Avatar
    const renderAvatar = (u, size = '24px') => {
        if (u?.profilePicture) return <img src={u.profilePicture} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }} alt="avatar" />;
        return <div style={{ width: size, height: size, borderRadius: '50%', background: '#64748b', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 'bold' }}>{u?.username?.[0].toUpperCase()}</div>;
    };

    return (
        <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column' }}>

            {/* Container Principal */}
            <div style={{ display: 'flex', gap: '8px' }}>
                {renderAvatar(comment.author)}

                <div style={{ flex: 1 }}>
                    {/* Header Comentariu (Nume + Data + Buton Collapse) */}
                    <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Link to={`/profile/${comment.author?.userId}`} style={{ fontWeight: 'bold', color: '#334155', textDecoration: 'none' }}>
                            {comment.author?.username}
                        </Link>
                        <span>• {new Date(comment.timestamp).toLocaleString()}</span>

                        {/* Butonul [-] apare doar dacă sunt replies */}
                        {comment.replies && comment.replies.length > 0 && (
                            <span
                                onClick={() => setIsExpanded(!isExpanded)}
                                style={{cursor:'pointer', fontWeight:'bold', marginLeft:'5px'}}
                            >
                    [{isExpanded ? '-' : '+'}]
                </span>
                        )}
                    </div>

                    {isExpanded ? (
                        <>
                            {/* Conținutul Text */}
                            <div style={{ fontSize: '0.95rem', margin: '4px 0', color: '#1e293b' }}>
                                {comment.content}
                            </div>

                            {/* Bara de Acțiuni (Like, Reply, Delete) */}
                            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>

                                {/* Buton LIKE */}
                                <button onClick={handleLike} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b', fontSize: '0.8rem', padding: 0 }}>
                                    <Heart size={14} /> {likes}
                                </button>

                                {/* Buton REPLY */}
                                <button onClick={() => setShowReplyInput(!showReplyInput)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b', fontSize: '0.8rem', padding: 0 }}>
                                    <MessageSquare size={14} /> Reply
                                </button>

                                {/* Buton DELETE (doar pentru autor) */}
                                {currentUser && currentUser.userId === comment.author.userId && (
                                    <button onClick={() => onDelete(comment.commentId)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 0 }}>
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </div>

                            {/* Input-ul de Reply (apare doar când dai click pe Reply) */}
                            {/* Căută formularul de reply în CommentItem.jsx și înlocuiește-l cu acesta */}
                            {showReplyInput && (
                                <form onSubmit={handleSendReply} style={{
                                    marginTop: '10px',
                                    display: 'flex',
                                    gap: '8px',
                                    alignItems: 'center', // Aliniază-le pe verticală
                                    width: '100%'
                                }}>
                                    <div style={{ color: '#94a3b8' }}>
                                        <CornerDownRight size={16} />
                                    </div>
                                    <input
                                        type="text"
                                        value={replyContent}
                                        onChange={(e) => setReplyContent(e.target.value)}
                                        placeholder="Write a reply..."
                                        autoFocus
                                        style={{
                                            flex: 1, // <--- ACESTA face textbox-ul mare
                                            padding: '8px 12px',
                                            borderRadius: '20px',
                                            border: '1px solid #e2e8f0',
                                            fontSize: '0.9rem',
                                            outline: 'none'
                                        }}
                                    />
                                    <button
                                        type="submit"
                                        style={{
                                            width: 'auto', // <--- ACESTA face butonul mic
                                            padding: '8px 20px',
                                            background: '#2563eb',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '20px',
                                            cursor: 'pointer',
                                            fontWeight: '600',
                                            fontSize: '0.85rem'
                                        }}
                                    >
                                        Send
                                    </button>
                                </form>
                            )}
                        </>
                    ) : (
                        <div style={{fontSize:'0.8rem', color:'#94a3b8', fontStyle:'italic'}}>
                            Comment collapsed ({comment.replies.length} replies inside)
                        </div>
                    )}
                </div>
            </div>

            {/* --- RECURSIVITATE: Aici desenăm copiii (Replies) --- */}
            {isExpanded && comment.replies && comment.replies.length > 0 && (
                <div style={{ marginLeft: '20px', borderLeft: '2px solid #e2e8f0', paddingLeft: '10px' }}>
                    {comment.replies.map(reply => (
                        <CommentItem
                            key={reply.commentId}
                            comment={reply}
                            currentUser={currentUser}
                            postId={postId}
                            onDelete={onDelete}
                            onReplySuccess={onReplySuccess}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default CommentItem;