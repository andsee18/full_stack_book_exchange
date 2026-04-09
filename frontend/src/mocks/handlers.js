import { setupWorker } from 'msw/browser'
import { http, HttpResponse } from 'msw'

export const handlers = [
  http.post('http://localhost:5000/api/auth/login', () => {
    return HttpResponse.json({
      accessToken: 'mocked-access-token',
      userId: 1,
      role: 'USER'
    })
  }),

  http.get('http://localhost:5000/api/books', () => {
    return HttpResponse.json({
      books: [
        { id: 1, title: 'Mocked Book 1', author: 'Author 1', status: 'available' },
        { id: 2, title: 'Mocked Book 2', author: 'Author 2', status: 'available' }
      ],
      totalItems: 2,
      totalPages: 1
    })
  })
]

export const worker = setupWorker(...handlers)

