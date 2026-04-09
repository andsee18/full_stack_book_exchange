import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Login from '../../pages/Login';
import { AuthProvider } from '../../context/AuthContext';

const renderLogin = () => {
  return render(
    <HelmetProvider>
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
};

describe('Login Page', () => {
  it('renders login form', () => {
    renderLogin();
    expect(screen.getByPlaceholderText(/Имя пользователя/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Пароль/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Войти/i })).toBeInTheDocument();
  });

  it('shows error message on invalid input', async () => {
    // Note: this test assumes we haven't mocked authApi yet,
    // so it might fail due to network error, which is also a type of error message.
    renderLogin();

    const usernameInput = screen.getByPlaceholderText(/Имя пользователя/i);
    const passwordInput = screen.getByPlaceholderText(/Пароль/i);
    const submitButton = screen.getByRole('button', { name: /Войти/i });

    fireEvent.change(usernameInput, { target: { value: 'wronguser' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Ошибка входа/i)).toBeInTheDocument();
    });
  });
});

