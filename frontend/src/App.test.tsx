// src/App.test.tsx
import { test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Real-Time Collaborative Note heading', () => {
  render(<App />);
  const headingElement = screen.getByText(/Real-Time Collaborative Note/i);
  expect(headingElement).toBeInTheDocument();
});