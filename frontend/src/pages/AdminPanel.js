import React, { useEffect, useState } from 'react';
import { getAllUsers, setUserRole } from '../api/adminApi';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const primaryColor = '#a89d70';
const hoverColor = '#948a65';
const headerBackground = '#eae7dd';
const textColor = '#3c3838';
const lightBackground = '#fdfcf7';
const dangerColor = '#d32f2f';

const AdminPanel = () => {
    const { user, isLoading } = useAuth();
    const [users, setUsers] = useState([]);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    useEffect(() => {
        if (!isLoading && user?.role === 'ADMIN') {
            loadUsers();
        }
    }, [user, isLoading]);

    const loadUsers = async () => {
        try {
            const data = await getAllUsers();
            setUsers(data);
        } catch (err) {
            console.error(err);
            setError('Не удалось загрузить пользователей.');
        }
    };

    const handleRoleChange = async (userId, newRole) => {
      try {
          // важный ключевой момент
          if (userId === user.userId) {
              setError("Нельзя изменить роль самому себе.");
              return;
          }

          await setUserRole(userId, newRole);
          setSuccessMessage(`Роль пользователя успешно обновлена.`);
          setTimeout(() => setSuccessMessage(null), 3000);
          loadUsers(); // refresh list
      } catch (err) {
          console.error(err);
          setError('Ошибка при обновлении роли.');
          setTimeout(() => setError(null), 3000);
      }
    };

    if (isLoading) return <div style={{ padding: 40, textAlign: 'center' }}>Загрузка...</div>;

    // защита только админ может
    if (!user || user.role !== 'ADMIN') {
        return <Navigate to="/" replace />;
    }

    const containerStyle = {
        maxWidth: '1000px',
        margin: '40px auto',
        padding: '30px',
        backgroundColor: lightBackground,
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        color: textColor,
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    };

    const headerStyle = {
        fontSize: '2em',
        fontWeight: 'bold',
        marginBottom: '25px',
        color: primaryColor,
        borderBottom: `2px solid ${headerBackground}`,
        paddingBottom: '10px',
    };

    const tableStyle = {
        width: '100%',
        borderCollapse: 'separate',
        borderSpacing: '0',
        marginTop: '20px',
    };

    const headingRowStyle = {
      backgroundColor: headerBackground,
      color: textColor,
    };

    const thStyle = {
        padding: '15px',
        textAlign: 'left',
        fontWeight: '600',
        borderBottom: `2px solid ${primaryColor}40`,
        fontSize: '0.95em',
    };

    const tdStyle = {
        padding: '15px',
        borderBottom: '1px solid #eee',
        verticalAlign: 'middle',
    };

    const buttonStyle = {
        padding: '8px 16px',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '0.9em',
        fontWeight: '600',
        transition: 'all 0.2s',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
    };

    return (
        <div style={containerStyle}>
            <h1 style={headerStyle}>Панель администратора</h1>

            {successMessage && (
                <div style={{
                    padding: '15px',
                    marginBottom: '20px',
                    borderRadius: '8px',
                    backgroundColor: '#e8f5e9',
                    color: '#2e7d32',
                    border: '1px solid #c8e6c9'
                }}>
                    {successMessage}
                </div>
            )}

            {error && (
                <div style={{
                    padding: '15px',
                    marginBottom: '20px',
                    borderRadius: '8px',
                    backgroundColor: '#ffebee',
                    color: '#c62828',
                    border: '1px solid #ffcdd2'
                }}>
                    {error}
                </div>
            )}

            <div style={{ overflowX: 'auto' }}>
                <table style={tableStyle}>
                    <thead>
                        <tr style={headingRowStyle}>
                            <th style={{ ...thStyle, borderRadius: '8px 0 0 8px' }}>ID</th>
                            <th style={thStyle}>Пользователь</th>
                            <th style={thStyle}>Email</th>
                            <th style={thStyle}>Текущая роль</th>
                            <th style={{ ...thStyle, borderRadius: '0 8px 8px 0', textAlign: 'right' }}>Управление</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u) => {
                            const isCurrentUser = u.id === user.userId;
                            const isUserAdmin = u.role === 'ADMIN';

                            return (
                                <tr key={u.id}>
                                    <td style={tdStyle}>#{u.id}</td>
                                    <td style={{ ...tdStyle, fontWeight: '500' }}>{u.username}</td>
                                    <td style={{ ...tdStyle, color: '#666' }}>{u.email}</td>
                                    <td style={tdStyle}>
                                        <span style={{
                                            padding: '4px 10px',
                                            borderRadius: '20px',
                                            fontSize: '0.85em',
                                            backgroundColor: isUserAdmin ? primaryColor : '#e0e0e0',
                                            color: isUserAdmin ? 'white' : '#555',
                                            fontWeight: 'bold',
                                        }}>
                                            {u.role || 'USER'}
                                        </span>
                                    </td>
                                    <td style={{ ...tdStyle, textAlign: 'right' }}>
                                        {isCurrentUser ? (
                                            <span style={{ color: '#999', fontSize: '0.9em', fontStyle: 'italic', paddingRight: '10px' }}>
                                                (Это вы)
                                            </span>
                                        ) : (
                                            <>
                                                {isUserAdmin ? (
                                                     <button
                                                        onClick={() => handleRoleChange(u.id, 'USER')}
                                                        style={{
                                                            ...buttonStyle,
                                                            backgroundColor: 'transparent',
                                                            border: `1px solid ${dangerColor}`,
                                                            color: dangerColor,
                                                        }}
                                                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#ffebee'; }}
                                                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                                                     >
                                                        ⬇ Сделать USER
                                                     </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleRoleChange(u.id, 'ADMIN')}
                                                        style={{
                                                            ...buttonStyle,
                                                            backgroundColor: primaryColor,
                                                            color: 'white',
                                                        }}
                                                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = hoverColor; }}
                                                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = primaryColor; }}
                                                    >
                                                        ⬆ Сделать ADMIN
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div style={{ marginTop: '30px', fontSize: '0.9em', color: '#888', textAlign: 'center' }}>
                Всего пользователей: {users.length}
            </div>
        </div>
    );
};

export default AdminPanel;

