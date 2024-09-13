import React, { useEffect, useRef, useState } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { fetchData, getTimeElapsedInMinutes } from '../utils';
import './styles/CPULoadMonitor.css';

const POLL_INTERVAL = 10000;
const LENGTH_OF_HISTORICAL_WINDOW = 60;

const chartOptions = {
    chart: {
        type: 'line'
    },
    title: {
        text: 'CPU Load Every 10s Over the Last 10 min'
    },
    xAxis: {
        title: {
            text: 'Time Elapsed (in min)'
        },
        labels: {
            formatter: function() {
                return (this as any).value.toFixed(2);
            }
        }
    },
    yAxis: {
        title: {
            text: 'Load Avg'
        }
    },
    legend: {
        enabled: false
    },
    tooltip: {
        pointFormatter: function() {
            return (this as any).y.toFixed(4);
        }
    }
};

interface LoadData {
    timestamps: number[];
    loadAverages: number[];
}

const CPULoadMonitor: React.FC = () => {
    const [loadData, setLoadData] = useState<LoadData>({ timestamps: [], loadAverages: [] });
    const [alertMode, setAlertMode] = useState<boolean>(false);

    const startingTimestampOfApplication = useRef<number | null>(null);
    const startingTimestampOfAlert = useRef<number | null>(null);

    const fetchLoadMonitorData = async () => {
        const response = await fetchData('/cpu-load');
        setLoadData((prev) => {
            const loadAverages = [...prev.loadAverages];
            const timestamps = [...prev.timestamps];

            // Ensure chart only covers past 10 minutes
            if (loadAverages.length === LENGTH_OF_HISTORICAL_WINDOW) {
                loadAverages.shift();
                timestamps.shift();
            }

            // Adding the new data point
            loadAverages.push(response.loadAverage);
            const minutes = getTimeElapsedInMinutes(startingTimestampOfApplication.current);
            const roundedMinutes = Math.round(minutes * 10) / 10;
            timestamps.push(roundedMinutes);

            // Timestamp in minutes is the X axis and load average is the Y axis
            return { timestamps, loadAverages };
        });
    };

    const isUnderHighLoad = () => {
        const mostRecentLoad = loadData.loadAverages[loadData.loadAverages.length - 1];

        if (!alertMode) {
            // A CPU is considered under high average load when it has exceeded 1 for 2 minutes or more
            if (mostRecentLoad > 1) {
                if (startingTimestampOfAlert.current) {
                    const timeElapsed = getTimeElapsedInMinutes(startingTimestampOfAlert.current);
                    if (timeElapsed >= 2) {
                        setAlertMode(true);
                        // Show a pop up to the user at the start of the alert window
                        alert('CPU under heavy load');
                    }
                } else {
                    startingTimestampOfAlert.current = Date.now();
                }
            } else {
                startingTimestampOfAlert.current = null;
            }
        } else {
            // A CPU is considered recovered from high average load when it drops below 1 for 2 minutes or more
            if (mostRecentLoad < 1) {
                if (startingTimestampOfAlert.current) {
                    const timeElapsed = getTimeElapsedInMinutes(startingTimestampOfAlert.current);
                    if (timeElapsed >= 2) {
                        setAlertMode(false);
                        // Show a pop up to the user at the start of the recovery window
                        alert('CPU recovered from heavy load');
                    }
                } else {
                    startingTimestampOfAlert.current = Date.now();
                }
            } else {
                startingTimestampOfAlert.current = null;
            }
        }
    }

    // Poll load average every 10 seconds
    useEffect(() => {
        const intervalId = setInterval(fetchLoadMonitorData, POLL_INTERVAL);
        startingTimestampOfApplication.current = Date.now();
        return () => clearInterval(intervalId);
    }, []);

    // Check high load status every time we receive a new data point from the backend
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(isUnderHighLoad, [loadData.loadAverages]);

    const alertBoxLabel = alertMode ? 'Alert' : 'All Clear';
    const alertBoxClass = alertMode ? 'alert-box' : 'all-clear-box';

    const currentLoad = Math.round(loadData.loadAverages[loadData.loadAverages.length - 1] * 1000) / 1000;

    return (
        <>
            <div className={`top-left common-box ${alertBoxClass}`}>
                {alertBoxLabel}
            </div>
            <div className={`top-right common-box ${alertBoxClass}`}>
                {alertBoxLabel}
            </div>

            <h1>CPU Load Average Monitor, Current: {currentLoad}</h1>

            <HighchartsReact 
                highcharts={Highcharts}
                options={{
                    ...chartOptions,
                    xAxis: {
                        ...chartOptions.xAxis,
                        categories: loadData.timestamps,
                    },
                    series: [
                        {
                            name: 'Load',
                            data: loadData.loadAverages,
                        }
                    ]
                }}
            />

            <div className='footer'>
                * A CPU is considered under high average load when it has <b>exceeded 1 for 2 minutes</b> or more
            </div>
            <div className='footer'>
                * A CPU is considered recovered from high average load when it <b>drops below 1 for 2 minutes</b> or more
            </div>
        </>
    );
};

export default CPULoadMonitor;