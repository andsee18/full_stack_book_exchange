import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

jest.mock('./api/authApi', () => ({
  registerUser: jest.fn(() => Promise.resolve({ id: 1 })),
  loginUser: jest.fn(() => Promise.resolve({ accessToken: 'test' })),
  logout: jest.fn(() => Promise.resolve({})),
}));

jest.mock('./api/BookApi', () => ({
  getAllBooks: jest.fn(() => Promise.resolve([])),
  getBookById: jest.fn(() => Promise.resolve({ id: 1, title: 'Test', author: 'Test', status: 'available' })),
  createBook: jest.fn(() => Promise.resolve({ id: 1 })),
  deleteBook: jest.fn(() => Promise.resolve()),
}));

jest.mock('./api/userApi', () => ({
  getUserById: jest.fn(() => Promise.resolve({ id: 1, username: 'Test', location: 'Test', rating: 5.0 })),
}));

jest.mock('./api/exchangeApi', () => ({
  createExchangeRequest: jest.fn(() => Promise.resolve({ id: 1 })),
  getIncomingExchangeRequests: jest.fn(() => Promise.resolve([])),
  getOutgoingExchangeRequests: jest.fn(() => Promise.resolve([])),
  acceptExchangeRequest: jest.fn(() => Promise.resolve({})),
  rejectExchangeRequest: jest.fn(() => Promise.resolve({})),
}));

// комментарий важный ключевой
const App = require('./App').default;

test('renders app header', () => {
  render(
    <MemoryRouter
      initialEntries={['/login']}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <App />
    </MemoryRouter>
  );

  expect(screen.getByText(/вход в систему/i)).toBeInTheDocument();
});
