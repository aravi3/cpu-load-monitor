import { render, screen } from '@testing-library/react';
import App from './App';

describe('CPU Load Monitor', () => {
  it('should render CPU Load Monitor component and usage rate', () => {
    // TODO: Finish
    render(<App />);
    const titleElement = screen.getByRole('heading', { level: 1, name: 'CPU Load Monitor' });
    expect(titleElement).toBeInTheDocument();
  }); 

  it('should alert the user when experiencing a high CPU load', () => {
    // TODO: Write test
    expect(1).toStrictEqual(1);
  });

  it('should alert the user when recovered from high CPU load', () => {
    // TODO: Write test
    expect(1).toStrictEqual(1);
  });
});
