import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserById, updateUser, changePassword } from '../api/userApi';
import { getUserIdFromJwt } from '../utils/jwt';

const primaryColor = '#a89d70';
const darkBeigeColor = '#eae7dd';
const textColor = '#3c3838';
const lightBackground = '#fdfcf7';

export default function Settings() {
  const { user } = useAuth();

  const token = user?.token || window.__ACCESS_TOKEN || localStorage.getItem('jwtToken');
  const currentUserId = useMemo(() => getUserIdFromJwt(token), [token]);
  const isLoggedIn = currentUserId != null;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [profileImage, setProfileImage] = useState('');

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPassword2, setNewPassword2] = useState('');
  const [pwMessage, setPwMessage] = useState(null);
  const [isBackHovered, setIsBackHovered] = useState(false);

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      if (!isLoggedIn) {
        if (isActive) {
          setLoading(false);
          setError('Вы не вошли в аккаунт.');
        }
        return;
      }

      setLoading(true);
      setError(null);
      setSaved(false);

      try {
        const u = await getUserById(currentUserId);
        if (!isActive) return;

        setUsername(u?.username || '');
        setEmail(u?.email || '');
        setLocation(u?.location || '');
        setProfileImage(u?.profileImage || '');
      } catch (e) {
        if (!isActive) return;
        setError('Не удалось загрузить профиль.');
      } finally {
        if (isActive) setLoading(false);
      }
    };

    load();
    return () => {
      isActive = false;
    };
  }, [isLoggedIn, currentUserId]);

  const onPickAvatarFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || '');
      setProfileImage(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) return;

    setError(null);
    setSaved(false);

    try {
      await updateUser(currentUserId, {
        username,
        email,
        location,
        profileImage,
      });
      setSaved(true);
    } catch (err) {
      const msg = err?.response?.status === 400
        ? 'Проверьте данные (возможно, имя уже занято).'
        : 'Не удалось сохранить изменения.';
      setError(msg);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwMessage(null);

    if (!isLoggedIn) return;
    if (!oldPassword || !newPassword) {
      setPwMessage('Введите старый и новый пароль.');
      return;
    }
    if (newPassword !== newPassword2) {
      setPwMessage('Новый пароль и подтверждение не совпадают.');
      return;
    }

    try {
      await changePassword(currentUserId, oldPassword, newPassword);
      setOldPassword('');
      setNewPassword('');
      setNewPassword2('');
      setPwMessage('Пароль успешно изменён.');
    } catch (err) {
      const apiMsg = err?.response?.data?.message;
      const status = err?.response?.status;
      if (typeof apiMsg === 'string' && apiMsg.trim()) {
        setPwMessage(apiMsg);
      } else if (status === 400) {
        setPwMessage('Не удалось сменить пароль: проверь данные.');
      } else if (status === 401) {
        setPwMessage('Вы не авторизованы. Перезайдите в аккаунт.');
      } else if (status === 403) {
        setPwMessage('Нет прав на смену пароля.');
      } else {
        setPwMessage('Не удалось сменить пароль. Попробуйте снова.');
      }
    }
  };

  if (loading) {
    return (
      <div style={pageStyle}>
        <h1 style={titleStyle}>Настройки</h1>
        <p style={{ color: '#666' }}>Загрузка...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div style={pageStyle}>
        <h1 style={titleStyle}>Настройки</h1>
        <p style={{ color: '#666' }}>{error || 'Вы не вошли в аккаунт.'}</p>
        <Link to="/login" style={linkStyle}>Войти</Link>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={headerRowStyle}>
        <Link
          to="/profile"
          style={{
            ...backButtonStyle,
            backgroundColor: isBackHovered ? primaryColor : 'white',
            color: isBackHovered ? 'white' : primaryColor,
            borderColor: isBackHovered ? primaryColor : 'rgba(168, 157, 112, 0.55)',
            transform: isBackHovered ? 'translateY(-1px)' : 'translateY(0)',
            boxShadow: isBackHovered ? `0 5px 12px ${primaryColor}40` : 'none',
            marginLeft: -8,
            justifySelf: 'start',
            width: 'fit-content',
          }}
          onMouseEnter={() => setIsBackHovered(true)}
          onMouseLeave={() => setIsBackHovered(false)}
        >
          ← Вернуться в профиль
        </Link>
        <h1 style={{ ...titleStyle, margin: 0, textAlign: 'center', justifySelf: 'center' }}>Настройки</h1>
        <div aria-hidden="true" style={{ justifySelf: 'end' }} />
      </div>

      {error ? (
        <div style={errorBoxStyle}>{error}</div>
      ) : null}

      {saved ? (
        <div style={successBoxStyle}>Изменения сохранены.</div>
      ) : null}

      <div style={gridStyle}>
        <form onSubmit={handleSaveProfile} style={cardStyle}>
          <h2 style={sectionTitleStyle}>Профиль</h2>

          <div style={fieldStyle}>
            <label style={labelStyle}>Имя</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} style={inputStyle} />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Почта</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Город</label>
            <input value={location} onChange={(e) => setLocation(e.target.value)} style={inputStyle} />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Аватар</label>

            <label style={chooseFileButtonStyle}>
              Загрузить фото
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files && e.target.files[0];
                  if (!file) return;
                  onPickAvatarFile(file);
                }}
                style={hiddenFileInputStyle}
              />
            </label>

            {profileImage ? (
              <div style={previewWrapStyle}>
                <img src={profileImage} alt="Аватар" style={previewImgStyle} />
              </div>
            ) : (
              <p style={{ margin: '6px 0 0 0', color: '#666' }}>Фото не выбрано.</p>
            )}
          </div>

          <button type="submit" style={primaryButtonStyle}>Сохранить профиль</button>
        </form>

        <form onSubmit={handleChangePassword} style={cardStyle}>
          <h2 style={sectionTitleStyle}>Смена пароля</h2>

          <div style={fieldStyle}>
            <label style={labelStyle}>Старый пароль</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Новый пароль</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Повторите новый пароль</label>
            <input
              type="password"
              value={newPassword2}
              onChange={(e) => setNewPassword2(e.target.value)}
              style={inputStyle}
            />
          </div>

          {pwMessage ? (
            <div style={{ marginBottom: 12, color: pwMessage.includes('успеш') ? '#2f7a3e' : '#a33' }}>
              {pwMessage}
            </div>
          ) : null}

          <button type="submit" style={primaryButtonStyle}>Сменить пароль</button>

        </form>
      </div>
    </div>
  );
}

const pageStyle = {
  maxWidth: 1000,
  margin: '0 auto',
  padding: '12px 10px',
};

const headerRowStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr auto 1fr',
  alignItems: 'center',
  gap: 12,
  marginBottom: 12,
};

const titleStyle = {
  margin: '0 0 16px 0',
  color: textColor,
  fontWeight: 800,
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 20,
};

const cardStyle = {
  backgroundColor: darkBeigeColor,
  borderRadius: 12,
  padding: 18,
  boxShadow: '0 8px 18px rgba(0,0,0,0.08)',
};

const sectionTitleStyle = {
  margin: '0 0 14px 0',
  color: primaryColor,
};

const fieldStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  marginBottom: 14,
};

const labelStyle = {
  fontWeight: 'bold',
  color: textColor,
  fontSize: 14,
};

const inputStyle = {
  padding: '10px 12px',
  borderRadius: 10,
  border: '1px solid rgba(0,0,0,0.15)',
  backgroundColor: lightBackground,
  outline: 'none',
};

const hiddenFileInputStyle = {
  display: 'none',
};

const chooseFileButtonStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  width: 'fit-content',
  padding: '10px 12px',
  borderRadius: 10,
  border: '1px solid rgba(168, 157, 112, 0.55)',
  backgroundColor: lightBackground,
  color: textColor,
  fontWeight: 700,
  cursor: 'pointer',
};

const previewWrapStyle = {
  marginTop: 12,
  width: 96,
  height: 96,
  borderRadius: '50%',
  border: `2px solid ${primaryColor}`,
  overflow: 'hidden',
  backgroundColor: lightBackground,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const previewImgStyle = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block',
};

const primaryButtonStyle = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: 10,
  border: 'none',
  backgroundColor: primaryColor,
  color: 'white',
  fontWeight: 'bold',
  cursor: 'pointer',
};

const linkStyle = {
  color: primaryColor,
  fontWeight: 'bold',
  textDecoration: 'none',
};

const backButtonStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 0,
  textDecoration: 'none',
  transition: 'all 0.2s ease-out',
  padding: '10px 14px',
  borderRadius: 10,
  fontWeight: 'bold',
  fontSize: '1.02em',
  marginLeft: 0,
  border: '1px solid rgba(168, 157, 112, 0.55)',
};

const errorBoxStyle = {
  backgroundColor: 'rgba(232, 168, 168, 0.25)',
  border: '1px solid rgba(232, 168, 168, 0.8)',
  color: '#7a2a2a',
  borderRadius: 10,
  padding: '10px 12px',
  marginBottom: 12,
};

const successBoxStyle = {
  backgroundColor: 'rgba(152, 193, 157, 0.25)',
  border: '1px solid rgba(152, 193, 157, 0.8)',
  color: '#2f7a3e',
  borderRadius: 10,
  padding: '10px 12px',
  marginBottom: 12,
};

