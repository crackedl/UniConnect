import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { User, Mail, Lock, Building, GraduationCap, ArrowRight, AlertTriangle } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'STUDENT',
        faculty: '',
        department: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await api.post('/auth/register', formData);
            navigate('/login');
        } catch (err) {
            console.error(err);
            setError('Registration failed. Please check your data or try another email.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-card" style={{ maxWidth: '500px' }}>
                <h2 className="auth-title">Create Account</h2>
                <p className="auth-subtitle">Join the academic community</p>

                {error && (
                    <div className="error-msg">
                        <AlertTriangle size={18} style={{ display: 'inline', marginRight: '5px' }}/>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>

                    {/* Username */}
                    <div className="input-group">
                        <User className="input-icon" size={20} />
                        <input
                            type="text"
                            name="username"
                            className="input-with-icon"
                            placeholder="Username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* Email */}
                    <div className="input-group">
                        <Mail className="input-icon" size={20} />
                        <input
                            type="email"
                            name="email"
                            className="input-with-icon"
                            placeholder="Email address"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* Password */}
                    <div className="input-group">
                        <Lock className="input-icon" size={20} />
                        <input
                            type="password"
                            name="password"
                            className="input-with-icon"
                            placeholder="Choose a strong password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* Role Selection */}
                    <div className="input-group">
                        <GraduationCap className="input-icon" size={20} />
                        <select
                            name="role"
                            className="input-with-icon"
                            value={formData.role}
                            onChange={handleChange}
                            style={{ cursor: 'pointer' }}
                        >
                            <option value="STUDENT">Student</option>
                            <option value="REPRESENTATIVE">Student Representative</option>
                        </select>
                    </div>

                    {/* Faculty & Department */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="input-group">
                            <Building className="input-icon" size={20} />
                            <input
                                type="text"
                                name="faculty"
                                className="input-with-icon"
                                placeholder="Faculty"
                                value={formData.faculty}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="input-group">
                            <input
                                type="text"
                                name="department"
                                placeholder="Department"
                                value={formData.department}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Creating account...' : (
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                Sign Up <ArrowRight size={20} />
              </span>
                        )}
                    </button>
                </form>

                <div className="auth-footer">
                    Already have an account? <Link to="/login">Sign in here</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;