import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { routes } from './app/router';

test('renders title screen at /', async () => {
  const router = createMemoryRouter(routes, { initialEntries: ['/'] });
  render(<RouterProvider router={router} />);
  expect(await screen.findByTestId('title-screen')).toBeInTheDocument();
});

test('game routes redirect to /players when no profile is active', async () => {
  const router = createMemoryRouter(routes, { initialEntries: ['/map'] });
  render(<RouterProvider router={router} />);
  expect(await screen.findByTestId('players-screen')).toBeInTheDocument();
});
