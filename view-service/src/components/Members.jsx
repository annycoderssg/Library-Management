import { useState, useEffect, useCallback, useRef } from 'react';
import { membersAPI, authAPI } from '../api';
import '../styles/Members.css';
import Pagination from './Pagination';
import {
    ErrorMessage,
    Modal,
    FormInput,
    FormActions,
    SectionHeader,
    ActionButtons,
} from './common';

function Members() {
    const [members, setMembers] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [deleting, setDeleting] = useState(null);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingMember, setEditingMember] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const itemsPerPage = parseInt(import.meta.env.VITE_ITEMS_PER_PAGE);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        create_user_account: false,
        role: 'member',
        password: '',
    });
    const [searchTerm, setSearchTerm] = useState('');
    const loadingRef = useRef(false);
    const mountedRef = useRef(true);

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    const loadMembers = useCallback(async () => {
        if (loadingRef.current) return;

        loadingRef.current = true;
        try {
            const skip = (currentPage - 1) * itemsPerPage;
            const response = await membersAPI.getAll(skip, itemsPerPage);
            if (mountedRef.current) {
                let allMembers = [];
                let total = 0;

                if (response.data && response.data.items) {
                    // New paginated response format
                    allMembers = response.data.items;
                    total = response.data.total || 0;
                } else {
                    // Fallback for old format
                    allMembers = Array.isArray(response.data) ? response.data : [];
                    total = allMembers.length;
                }

                // Filter out the logged-in user from the list (only if they have a member_id)
                // Get user info from localStorage first to avoid API call
                const userData = localStorage.getItem('user');
                if (userData) {
                    try {
                        const parsedUser = JSON.parse(userData);
                        // Only make API call if we need member_id
                        if (parsedUser.user_id) {
                            const userInfoResponse = await authAPI.getCurrentUser();
                            const currentUser = userInfoResponse?.data;

                            // Only filter if the logged-in user has a member_id
                            if (currentUser?.member_id) {
                                // Filter out the logged-in user's member record
                                allMembers = allMembers.filter(
                                    member => member && member.id !== currentUser.member_id
                                );
                                // Adjust total count if we filtered out a member
                                if (allMembers.length < response.data?.items?.length) {
                                    total = Math.max(0, total - 1);
                                }
                            }
                        }
                    } catch {
                        // If we can't get user info, show all members (fallback)
                    }
                }

                setMembers(allMembers);
                setTotalItems(total);
                setError(null);
            }
        } catch (err) {
            if (mountedRef.current) {
                setError(err.response?.data?.detail || 'Failed to load members');
                setMembers([]); // Clear members on error
                setTotalItems(0);
            }
        } finally {
            loadingRef.current = false;
        }
    }, [currentPage, itemsPerPage]);

    useEffect(() => {
        // Load data when component mounts
        loadMembers();
    }, [loadMembers]);

    useEffect(() => {
        // Reset to page 1 when component mounts
        setCurrentPage(1);
    }, []);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        // Scroll to top when page changes
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (submitting) return;

        setSubmitting(true);
        setError(null);

        try {
            // Prepare data for API
            const apiData = { ...formData };

            if (editingMember) {
                // For edit: if not updating user account, remove user-related fields
                if (!formData.update_user_account) {
                    delete apiData.update_user_account;
                    delete apiData.role;
                    delete apiData.password;
                } else {
                    // If updating user account but password is empty, don't send password (keep existing)
                    if (!formData.password) {
                        delete apiData.password;
                    }
                }
            } else {
                // For create: if not creating user account, remove user-related fields
                if (!formData.create_user_account) {
                    delete apiData.create_user_account;
                    delete apiData.role;
                    delete apiData.password;
                }
            }

            if (editingMember) {
                await membersAPI.update(editingMember.id, apiData);
            } else {
                await membersAPI.create(apiData);
            }
            setShowForm(false);
            setEditingMember(null);
            resetForm();
            await loadMembers();
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to save member');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = async (member) => {
        setEditingMember(member);

        // Check if member has a user account
        let userRole = 'member';
        let hasUserAccount = false;
        try {
            const userInfo = await membersAPI.getUserInfo(member.id);
            if (userInfo.data.has_user_account) {
                hasUserAccount = true;
                userRole = userInfo.data.role;
            }
        } catch {
            // User account doesn't exist or error fetching
            hasUserAccount = false;
        }

        setFormData({
            name: member.name,
            email: member.email,
            phone: member.phone || '',
            address: member.address || '',
            create_user_account: false,
            update_user_account: hasUserAccount,
            role: userRole,
            password: '',
        });
        setShowForm(true);
    };

    const handleDelete = useCallback(async (id) => {
        if (deleting === id) return;

        if (window.confirm('Are you sure you want to delete this member?')) {
            setDeleting(id);
            setError(null);
            try {
                await membersAPI.delete(id);
                await loadMembers();
            } catch (err) {
                setError(err.response?.data?.detail || 'Failed to delete member');
            } finally {
                setDeleting(null);
            }
        }
    }, [deleting, loadMembers]);

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            phone: '',
            address: '',
            create_user_account: false,
            role: 'member',
            password: '',
        });
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setEditingMember(null);
        resetForm();
    };

    // Filter members based on search term
    const filteredMembers = members.filter(member => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return (
            member.name?.toLowerCase().includes(search) ||
            member.email?.toLowerCase().includes(search) ||
            member.phone?.toLowerCase().includes(search)
        );
    });

    return (
        <div className="members">
            <SectionHeader
                title="Members Management"
                actions={
                    <>
                        <input
                            type="text"
                            placeholder="Search members..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                        <button className="btn-primary" onClick={() => { setShowForm(true); setEditingMember(null); resetForm(); }}>
                            + Add Member
                        </button>
                    </>
                }
            />

            <ErrorMessage message={error} onClose={() => setError(null)} />

            <Modal
                isOpen={showForm}
                onClose={handleCloseForm}
                title={editingMember ? 'Edit Member' : 'Add New Member'}
            >
                <form onSubmit={handleSubmit}>
                    <FormInput
                        type="text"
                        label="Name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                    <FormInput
                        type="email"
                        label="Email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                    <FormInput
                        type="tel"
                        label="Phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                    <FormInput
                        type="textarea"
                        label="Address"
                        rows={3}
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />

                    <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '5px', border: '1px solid #dee2e6' }}>
                        <label style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={formData.create_user_account || formData.update_user_account}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    create_user_account: e.target.checked,
                                    update_user_account: editingMember ? e.target.checked : false
                                })}
                                style={{ marginRight: '0.5rem', width: '18px', height: '18px' }}
                            />
                            <span style={{ fontWeight: '500' }}>
                                {editingMember ? 'Update/Create User Account' : 'Create User Account'}
                            </span>
                        </label>

                        {(formData.create_user_account || formData.update_user_account) && (
                            <>
                                <FormInput
                                    type="select"
                                    label="User Role"
                                    required={formData.create_user_account || formData.update_user_account}
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    options={[
                                        { value: 'member', label: 'Member' },
                                        { value: 'admin', label: 'Admin' }
                                    ]}
                                />
                                <FormInput
                                    type="password"
                                    label="Password"
                                    required={formData.create_user_account}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder={editingMember ? "Leave empty to keep current password" : "Enter password (min 6 characters)"}
                                />
                                {editingMember && (
                                    <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
                                        ℹ️ Leave password empty to keep current password. Enter new password to change it.
                                    </p>
                                )}
                            </>
                        )}
                    </div>

                    <FormActions onCancel={handleCloseForm} disabled={submitting}>
                        <button type="submit" className="btn-primary" disabled={submitting}>
                            {submitting ? 'Saving...' : 'Save'}
                        </button>
                    </FormActions>
                </form>
            </Modal>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>User Role</th>
                            <th>Membership Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredMembers.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="empty-state">
                                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
                                        <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>No record found</div>
                                        <div style={{ marginBottom: '1rem', color: '#666' }}>Get started by adding your first member to the library</div>
                                        <button
                                            className="btn-primary"
                                            onClick={() => { setShowForm(true); setEditingMember(null); resetForm(); }}
                                        >
                                            + Add Your First Member
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredMembers.map((member) => (
                                <tr key={member.id}>
                                    <td>{member.id}</td>
                                    <td>{member.name}</td>
                                    <td>{member.email}</td>
                                    <td>{member.phone || '-'}</td>
                                    <td>
                                        {member.user_role ? (
                                            <span style={{
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '12px',
                                                fontSize: '0.85rem',
                                                fontWeight: '500',
                                                backgroundColor: member.user_role === 'admin' ? '#dc3545' : '#28a745',
                                                color: 'white'
                                            }}>
                                                {member.user_role === 'admin' ? '👑 Admin' : '👤 Member'}
                                            </span>
                                        ) : (
                                            <span style={{ color: '#999', fontStyle: 'italic' }}>No account</span>
                                        )}
                                    </td>
                                    <td>{new Date(member.membership_date).toLocaleDateString()}</td>
                                    <td>
                                        <ActionButtons
                                            onEdit={() => handleEdit(member)}
                                            onDelete={() => handleDelete(member.id)}
                                            disabled={deleting === member.id || submitting}
                                        />
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalItems > 0 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(totalItems / itemsPerPage)}
                    onPageChange={handlePageChange}
                    itemsPerPage={itemsPerPage}
                    totalItems={totalItems}
                />
            )}
        </div>
    );
}

export default Members;
