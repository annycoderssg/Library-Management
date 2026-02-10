import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api';
import { ErrorMessage, Modal, FormInput, FormActions } from './common';
import '../styles/MyProfile.css';

function MyProfile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        profile_picture: '',
        password: '',
        confirmPassword: '',
    });
    const [profileImagePreview, setProfileImagePreview] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        loadProfile();
    }, [navigate]);

    const loadProfile = useCallback(async (forceRefresh = false) => {
        try {
            // Use shared API cache to prevent duplicate calls
            // Only force refresh if explicitly requested (e.g., after update)
            const response = await authAPI.getProfile(forceRefresh);
            const profileData = response.data;
            setProfile(profileData);

            // Set form data from profile
            if (profileData.member) {
                setFormData({
                    name: profileData.member.name || '',
                    email: profileData.member.email || profileData.user.email || '',
                    phone: profileData.member.phone || '',
                    profile_picture: profileData.member.profile_picture || '',
                    password: '',
                    confirmPassword: '',
                });
                setProfileImagePreview(profileData.member.profile_picture || null);
            } else {
                // Admin without member profile
                setFormData({
                    name: '',
                    email: profileData.user.email || '',
                    phone: '',
                    profile_picture: '',
                    password: '',
                    confirmPassword: '',
                });
            }
        } catch (err) {
            if (err.response?.status === 401) {
                navigate('/login');
            } else {
                setError(err.response?.data?.detail || 'Error loading profile');
            }
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
        setSuccess('');
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setError('Please select an image file');
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError('Image size should be less than 5MB');
                return;
            }

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImagePreview(reader.result);
                setFormData(prev => ({ ...prev, profile_picture: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validate password if provided
        if (formData.password) {
            if (formData.password.length < 6) {
                setError('Password must be at least 6 characters long');
                return;
            }
            if (formData.password !== formData.confirmPassword) {
                setError('Passwords do not match');
                return;
            }
        }

        // Validate required fields
        if (!formData.name && profile?.member) {
            setError('Name is required');
            return;
        }
        if (!formData.email) {
            setError('Email is required');
            return;
        }

        setSubmitting(true);

        try {
            const updateData = {
                name: formData.name || undefined,
                email: formData.email,
                phone: formData.phone || undefined,
                profile_picture: formData.profile_picture || undefined,
                password: formData.password || undefined,
            };

            // Remove undefined values
            Object.keys(updateData).forEach(key =>
                updateData[key] === undefined && delete updateData[key]
            );

            await authAPI.updateProfile(updateData);
            setSuccess('Profile updated successfully!');
            // Force refresh after update to get latest data
            await loadProfile(true);
            setShowForm(false);
            // Clear password fields
            setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to update profile');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className="profile-loading">Loading profile...</div>;
    }

    if (!profile) {
        return <div className="profile-error">Profile not found</div>;
    }

    return (
        <div className="my-profile-container">
            <div className="profile-header">
                <h2>My Profile</h2>
                <button
                    className="btn-primary"
                    onClick={() => setShowForm(true)}
                >
                    Edit Profile
                </button>
            </div>

            <ErrorMessage message={error} onClose={() => setError('')} />
            {success && (
                <div className="success-message" style={{
                    backgroundColor: '#d4edda',
                    color: '#155724',
                    padding: '0.75rem',
                    borderRadius: '5px',
                    marginBottom: '1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <span>{success}</span>
                    <button onClick={() => setSuccess('')} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>×</button>
                </div>
            )}

            <div className="profile-content">
                <div className="profile-picture-section">
                    <div className="profile-picture-container">
                        {profileImagePreview || (profile.member?.profile_picture) ? (
                            <img
                                src={profileImagePreview || profile.member.profile_picture}
                                alt="Profile"
                                className="profile-picture"
                            />
                        ) : (
                            <div className="profile-picture-placeholder">
                                <span>📷</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="profile-info-section">
                    <div className="profile-info-card">
                        <h3>Personal Information</h3>
                        <div className="info-row">
                            <span className="info-label">Name:</span>
                            <span className="info-value">{profile.member?.name || 'N/A'}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Email:</span>
                            <span className="info-value">{profile.user.email}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Phone:</span>
                            <span className="info-value">{profile.member?.phone || 'N/A'}</span>
                        </div>
                        {/* Only show role to admin users */}
                        {profile.user.role === 'admin' && (
                            <div className="info-row">
                                <span className="info-label">Role:</span>
                                <span className="info-value">{profile.user.role}</span>
                            </div>
                        )}
                        {profile.member && (
                            <div className="info-row">
                                <span className="info-label">Member ID:</span>
                                <span className="info-value">{profile.member.id}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Modal
                isOpen={showForm}
                onClose={() => {
                    setShowForm(false);
                    setError('');
                    setSuccess('');
                    loadProfile(); // Reload to reset form
                }}
                title="Edit Profile"
            >
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                            Profile Picture
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            style={{ marginBottom: '0.5rem' }}
                        />
                        {profileImagePreview && (
                            <div style={{ marginTop: '0.5rem' }}>
                                <img
                                    src={profileImagePreview}
                                    alt="Preview"
                                    style={{ maxWidth: '150px', maxHeight: '150px', borderRadius: '5px' }}
                                />
                            </div>
                        )}
                    </div>

                    {profile.member && (
                        <FormInput
                            type="text"
                            label="Name"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                        />
                    )}

                    <FormInput
                        type="email"
                        label="Email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                    />

                    {profile.member && (
                        <FormInput
                            type="tel"
                            label="Phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                        />
                    )}

                    <FormInput
                        type="password"
                        label="New Password (optional)"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Leave blank to keep current password"
                    />

                    {formData.password && (
                        <FormInput
                            type="password"
                            label="Confirm New Password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                        />
                    )}

                    <FormActions onCancel={() => {
                        setShowForm(false);
                        setError('');
                        setSuccess('');
                        loadProfile();
                    }} disabled={submitting}>
                        <button type="submit" className="btn-primary" disabled={submitting}>
                            {submitting ? 'Saving...' : 'Save Changes'}
                        </button>
                    </FormActions>
                </form>
            </Modal>
        </div>
    );
}

export default MyProfile;




