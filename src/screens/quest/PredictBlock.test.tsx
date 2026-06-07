import { render, screen, fireEvent } from '@testing-library/react';
import PredictBlock from './PredictBlock';
import type { Predict } from '../../lib/types';

const L = (en: string) => ({ en, vi: en });
const predict: Predict = {
  question: L('What changes?'),
  options: [
    { text: L('The letters turn blue'), correct: true },
    { text: L('Nothing happens'), correct: false },
  ],
  explain: L('color paints the text itself'),
};

test('hides the explanation until a choice is committed', () => {
  render(<PredictBlock predict={predict} />);
  expect(screen.queryByText(/color paints the text itself/i)).not.toBeInTheDocument();
});

test('a correct pick reveals the explanation with the "right" lead-in', () => {
  render(<PredictBlock predict={predict} />);
  fireEvent.click(screen.getByRole('button', { name: /the letters turn blue/i }));
  expect(screen.getByText(/that's right/i)).toBeInTheDocument();
  expect(screen.getByText(/color paints the text itself/i)).toBeInTheDocument();
});

test('a wrong pick reveals the explanation with the "not quite" lead-in and locks options', () => {
  render(<PredictBlock predict={predict} />);
  fireEvent.click(screen.getByRole('button', { name: /nothing happens/i }));
  expect(screen.getByText(/not quite/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /the letters turn blue/i })).toBeDisabled();
  expect(screen.getByRole('button', { name: /nothing happens/i })).toBeDisabled();
  // second click cannot change the locked-in choice
  fireEvent.click(screen.getByRole('button', { name: /the letters turn blue/i }));
  expect(screen.getByText(/not quite/i)).toBeInTheDocument();
});
