import { render, screen, waitFor, act } from '@testing-library/react';
import CPULoadMonitor from '../CPULoadMonitor';
import { fetchData } from '../../utils';

jest.mock('../../utils', () => ({
    fetchData: jest.fn()
}));

const mockFetchData = fetchData as jest.Mock;

jest.useFakeTimers();

describe('CPU Load Monitor', () => {
  beforeEach(() => {
    mockFetchData.mockClear();
  });

  it('should render CPU Load Monitor component', () => {
    render(<CPULoadMonitor />);
    const titleElement = screen.getByText(/CPU Load Average Monitor, Current:/);
    expect(titleElement).toBeInTheDocument();
  }); 

  it('should fetch load data from the mock endpoint correctly', async () => {
    mockFetchData.mockResolvedValue({ loadAverage: 0.8 });
    render(<CPULoadMonitor />);
    act(() => {
        jest.advanceTimersByTime(10000);
    });
    await waitFor(() => expect(mockFetchData).toHaveBeenCalledTimes(1));
    expect(mockFetchData).toHaveBeenCalledWith('/cpu-load');
  });

  it.skip('should go into alert mode during heavy CPU usage, then back to false when recovered', async () => {
    mockFetchData.mockResolvedValue({ loadAverage: 0.5 });

    render(<CPULoadMonitor />);

    mockFetchData.mockResolvedValue({ loadAverage: 1.5 });

    // TODO: Add some sort of 2 minute delay then test positive for alert again

    // Check if alert is displayed
    expect(screen.getByText('Alert')).toBeInTheDocument();

    mockFetchData.mockResolvedValue({ loadAverage: 0.5 });

    // TODO: Add some sort of 2 minute delay then test positive for recovery again

    // Check if all clear is displayed
    expect(screen.getByText('All Clear')).toBeInTheDocument();
  });
});
