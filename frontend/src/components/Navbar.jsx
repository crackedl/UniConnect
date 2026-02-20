import { Link, useNavigate } from 'react-router-dom';
import { LogOut, GraduationCap, Home, Calendar, MessageCircle } from 'lucide-react';
import { User as UserIcon } from 'lucide-react'; // Rename ca să nu facă conflict

const Navbar = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    // If not logged in, return nothing (or just the logo if you prefer)
    if (!token) return null;

    return (
        <nav style={{
            backgroundColor: 'var(--bg-card)',
            borderBottom: '1px solid var(--border-color)',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            padding: '0.8rem 0'
        }}>
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

                {/* LOGO */}
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '700', fontSize: '1.2rem', color: 'var(--primary)' }}>
                    <GraduationCap size={28} />
                    UniConnect
                </Link>

                {/* MENU */}
                <div style={{ display: 'flex', gap: '20px' }}>
                    <Link to="/" style={navLinkStyle}>
                        <Home size={20} /> Feed
                    </Link>
                    <Link to="/events" style={navLinkStyle}>
                        <Calendar size={20} /> Events
                    </Link>
                    <Link to="/messages" style={navLinkStyle}>
                        <MessageCircle size={20} /> Messages
                    </Link>
                    <Link to="/profile" style={navLinkStyle}>
                        <UserIcon size={20} /> Profile
                    </Link>
                </div>

                {/* LOGOUT */}
                <button
                    onClick={handleLogout}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'transparent',
                        border: '1px solid var(--border-color)',
                        padding: '8px 16px',
                        borderRadius: 'var(--radius)',
                        color: 'var(--secondary)'
                    }}
                >
                    <LogOut size={18} /> Logout
                </button>
            </div>
        </nav>
    );
};

const navLinkStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: 'var(--text-muted)',
    fontWeight: '500',
    padding: '8px 12px',
    borderRadius: 'var(--radius)',
    transition: 'background 0.2s'
};

export default Navbar;