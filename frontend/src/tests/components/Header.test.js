import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Header from '../../components/Header';

describe('Header Component', () => {
    it('renders login link when not authenticated', () => {
        render(
            <AuthContext.Provider value={{ isAuthenticated: false, userRole: null }}>
                <BrowserRouter>
                    <Header />
                </BrowserRouter>
            </AuthContext.Provider>
        );
        expect(screen.getByText(/Войти/i)).toBeInTheDocument();
    });

    it('renders profile link when authenticated', () => {
        render(
            <AuthContext.Provider value={{ isAuthenticated: true, userRole: 'USER', logout: jest.fn() }}>
                <BrowserRouter>
                    <Header />
                </BrowserRouter>
            </AuthContext.Provider>
        );
        expect(screen.getByText(/Профиль/i)).toBeInTheDocument();
    });
});

