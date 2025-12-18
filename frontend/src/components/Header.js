import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const primaryColor = '#a89d70';
const hoverColor = '#948a65';
const headerBackground = '#eae7dd';
const textColor = '#3c3838';
const lightBackground = '#fdfcf7';

const logoStyle = {
	color: primaryColor,
	fontSize: '2.1em',
	fontWeight: 900,
	letterSpacing: '1.5px',
	textShadow: '0 2px 8px #eae7dd, 0 1px 0 #fff',
	display: 'inline-block',
	whiteSpace: 'nowrap',
};

const navStyle = {
	display: 'flex',
	gap: '15px',
	alignItems: 'center',
};

const basePillStyle = {
	border: 'none',
	borderRadius: '12px',
	cursor: 'pointer',
	fontSize: '1em',
	fontWeight: 600,
	textDecoration: 'none',
	transition: 'all 0.18s',
	padding: '0 18px',
	height: '42px',
	display: 'inline-flex',
	alignItems: 'center',
	justifyContent: 'center',
	lineHeight: 1,
	whiteSpace: 'nowrap',
};

const navLinkStyle = {
	...basePillStyle,
	backgroundColor: 'transparent',
	boxShadow: 'none',
	color: textColor,
};

const actionButtonStyle = {
	...basePillStyle,
	appearance: 'none',
	backgroundColor: primaryColor,
	color: 'white',
	padding: '0 22px',
};

function InteractiveElement({ to, children, onClick, isAction = false, title }) {
	const [isHovered, setIsHovered] = useState(false);
	const baseStyle = isAction ? actionButtonStyle : navLinkStyle;

	const hoverStyles = isAction
		? {
			backgroundColor: hoverColor,
			transform: 'translateY(-1px) scale(1.02)',
			boxShadow: `0 5px 12px ${primaryColor}60`,
		}
		: {
			color: hoverColor,
			backgroundColor: lightBackground,
			transform: 'translateY(-1px) scale(1.02)',
			boxShadow: '0 3px 8px rgba(0, 0, 0, 0.1)',
		};

	const elementProps = {
		title,
		style: {
			...baseStyle,
			...(isHovered ? hoverStyles : {}),
		},
		onMouseEnter: () => setIsHovered(true),
		onMouseLeave: () => setIsHovered(false),
	};

	if (onClick) {
		return (
			<button type="button" {...elementProps} onClick={onClick}>
				{children}
			</button>
		);
	}

	return (
		<Link to={to} {...elementProps}>
			{children}
		</Link>
	);
}

export default function Header() {
	const { user, logout } = useAuth();
	const isLoggedIn = !!user;

	const handleLogout = async () => {
		await logout();
	};

	return (
		<header
			style={{
				backgroundColor: headerBackground,
				padding: '18px 120px',
				minHeight: '72px',
				boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
				display: 'flex',
				justifyContent: 'space-between',
				alignItems: 'center',
				borderBottom: `1px solid ${primaryColor}30`,
				boxSizing: 'border-box',
			}}
		>
			<span style={logoStyle}>Book Exchange</span>

			<nav style={navStyle}>
				<InteractiveElement to="/">Каталог</InteractiveElement>
				{isLoggedIn ? (
					<>
						<InteractiveElement to="/add-book">Добавить книгу</InteractiveElement>
						<InteractiveElement to="/profile">Профиль</InteractiveElement>
						<InteractiveElement onClick={handleLogout} isAction={true} title="Выйти из аккаунта">
							Выйти
						</InteractiveElement>
					</>
				) : (
					<>
						<InteractiveElement to="/login" isAction={true}>
							Войти
						</InteractiveElement>
						<InteractiveElement to="/register" isAction={true}>
							Регистрация
						</InteractiveElement>
					</>
				)}
			</nav>
		</header>
	);
}