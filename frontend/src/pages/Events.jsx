import { useState, useEffect } from 'react';
import api from '../services/api';
import { Calendar, MapPin, Plus, X } from 'lucide-react';

const Events = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // VERIFICĂM ROLUL DIN LOCAL STORAGE
    const userRole = localStorage.getItem('role'); // "STUDENT" sau "REPRESENTATIVE"
    const isRepresentative = userRole === 'REPRESENTATIVE';

    const [newEvent, setNewEvent] = useState({
        title: '',
        description: '',
        date: '',
        faculty: ''
    });

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const response = await api.get('/events/upcoming');
            setEvents(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.post('/events', newEvent);
            setShowModal(false);
            setNewEvent({ title: '', description: '', date: '', faculty: '' });
            fetchEvents();
        } catch (error) {
            alert('Error creating event');
        }
    };

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>

            {/* HEADER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--text-main)', display:'flex', alignItems:'center', gap:'10px' }}>
                        Events <span style={{fontSize:'1rem', background:'#eff6ff', color:'var(--primary)', padding:'2px 10px', borderRadius:'12px'}}>{events.length}</span>
                    </h2>
                    <p style={{ color: 'var(--text-muted)' }}>Discover what's happening on campus</p>
                </div>

                {/* --- AICI ESTE CONDIȚIA --- */}
                {/* Butonul apare DOAR dacă ești Reprezentant */}
                {isRepresentative && (
                    <button className="btn-primary" onClick={() => setShowModal(true)}>
                        <Plus size={20} /> Create Event
                    </button>
                )}
            </div>

            {/* ... RESTUL CODULUI RĂMÂNE LA FEL CA ÎNAINTE (Grid-ul de evenimente) ... */}
            {loading ? <p>Loading events...</p> : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    {events.map(event => (
                        <div key={event.eventId} className="card" style={{ padding: '0', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ height: '100px', background: 'var(--primary)', position: 'relative' }}>
                                <div style={{
                                    position: 'absolute', bottom: '-20px', left: '20px',
                                    background: 'white', padding: '10px', borderRadius: '8px',
                                    boxShadow: 'var(--shadow-sm)', textAlign: 'center', minWidth: '60px'
                                }}>
                                    <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--primary)' }}>
                                        {new Date(event.date).getDate()}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>
                                        {new Date(event.date).toLocaleString('en-US', { month: 'short' })}
                                    </div>
                                </div>
                            </div>

                            <div style={{ padding: '2rem 1.5rem 1.5rem', flex: 1 }}>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{event.title}</h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                                    <MapPin size={16} /> {event.faculty || 'Campus'}
                                </div>
                                <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: '1.5' }}>
                                    {event.description || 'No description provided.'}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* --- MODALUL ESTE RANDAT DOAR DACĂ EȘTI REPREZENTANT ȘI AI DAT CLICK --- */}
            {isRepresentative && showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }}>
                    <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h3>Add New Event</h3>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor:'pointer' }}><X /></button>
                        </div>

                        <form onSubmit={handleCreate}>
                            <div className="input-group">
                                <input
                                    type="text" placeholder="Event Title" required
                                    value={newEvent.title}
                                    onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                                />
                            </div>
                            <div className="input-group">
                <textarea
                    placeholder="Description" rows={3}
                    value={newEvent.description}
                    onChange={e => setNewEvent({...newEvent, description: e.target.value})}
                />
                            </div>
                            <div className="input-group">
                                <input
                                    type="datetime-local" required
                                    value={newEvent.date}
                                    onChange={e => setNewEvent({...newEvent, date: e.target.value})}
                                />
                            </div>
                            <div className="input-group">
                                <input
                                    type="text" placeholder="Faculty / Location"
                                    value={newEvent.faculty}
                                    onChange={e => setNewEvent({...newEvent, faculty: e.target.value})}
                                />
                            </div>
                            <button type="submit" className="btn-primary" style={{ width: '100%' }}>Create Event</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Events;