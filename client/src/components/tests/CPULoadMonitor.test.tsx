import { render, screen, waitFor, act } from '@testing-library/react';
import Highcharts from 'highcharts';
import CPULoadMonitor, { CHART_TITLE } from '../CPULoadMonitor';
import { fetchData } from '../../utils';

jest.mock('../../utils', () => ({
  ...jest.requireActual('../../utils'),
  fetchData: jest.fn() 
}));

const mockFetchData = fetchData as jest.Mock;

describe('CPU Load Monitor', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('should render CPU Load Monitor component', () => {
    render(<CPULoadMonitor />);
    const titleElement = screen.getByText(/CPU Load Avg Monitor/);
    expect(titleElement).toBeInTheDocument();
  }); 

  it('should fetch load data from the mock endpoint correctly', async () => {
    mockFetchData.mockResolvedValue({ loadAverage: 0.5 });

    render(<CPULoadMonitor />);

    await act(() => {
        jest.advanceTimersByTime(10000);
    });

    await waitFor(() => expect(mockFetchData).toHaveBeenCalledTimes(1));
    expect(mockFetchData).toHaveBeenCalledWith('/cpu-load');
  });

  it('should not contain more than 60 data points at any given time (i.e. 10 min window)', async () => {
    mockFetchData.mockResolvedValue({ loadAverage: 0.5 });

    render(<CPULoadMonitor />);

    // Process 100 data points
    await act(async () => {
      for (let i = 0; i < 100; i++) {
        jest.advanceTimersByTime(10000);
        await Promise.resolve(); // Ensure state updates are processed
      }
    });

    const chart = Highcharts.charts.find(chart =>
      chart && chart.options.title && chart.options.title.text === CHART_TITLE
    );
    if (!chart) {
      throw new Error('Chart is undefined');
    }

    const loadAverageData = chart.series[0].data;
    const timestampData = chart.xAxis[0].categories;

    // Assert that despite 100 incoming data points, the window only holds 60
    expect(loadAverageData.length).toStrictEqual(60);
    expect(timestampData.length).toStrictEqual(60);
  });

  it('should alert when under heavy load for >= 2min, then recover when under normal load for >= 2min', async () => {
      mockFetchData.mockResolvedValue({ loadAverage: 0.5 });
  
      render(<CPULoadMonitor />);

      // Mock endpoint to return high load
      mockFetchData.mockResolvedValue({ loadAverage: 1.5 });
  
      await act(async () => {
        for (let i = 0; i < 20; i++) {
          jest.advanceTimersByTime(10000);
          await Promise.resolve(); // Ensure state updates are processed
        }
      });

      // Assert that component is now in alert mode
      const alertElements = await screen.findAllByText('Alert');
      expect(alertElements.length).toBeGreaterThan(0); 

      // Mock endpoint to return normal load
      mockFetchData.mockResolvedValue({ loadAverage: 0.5 });

      await act(async () => {
        for (let i = 0; i < 20; i++) {
          jest.advanceTimersByTime(10000);
          await Promise.resolve();
        }
      });

      // Assert that component has now recovered
      const allClearElements = await screen.findAllByText('All Clear');
      expect(allClearElements.length).toBeGreaterThan(0);

      // Assert that the alerts and recoveries tables contain an entry in each
      const tables = screen.getAllByRole('table');
      expect(tables).toHaveLength(2);
      tables.forEach(table => {
          // eslint-disable-next-line testing-library/no-node-access
          const rows = table.querySelectorAll('tbody tr');
          expect(rows).toHaveLength(1);
      });
  });
});
