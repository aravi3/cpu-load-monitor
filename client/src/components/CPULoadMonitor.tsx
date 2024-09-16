import React, { useCallback, useEffect, useRef, useState } from 'react';
import Highcharts, { Options } from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import AccessibilityModule from 'highcharts/modules/accessibility';
import { fetchData, getTimeElapsedInMinutes } from '../utils';
import './styles/CPULoadMonitor.css';

export const CHART_TITLE = 'Load Every 10s Over the Last 10 min';
const POLL_INTERVAL = 10000;
const LENGTH_OF_HISTORICAL_WINDOW = 60;
const LOAD_ALERT_THRESHOLD = 1;

AccessibilityModule(Highcharts);

const chartOptions: Options = {
    chart: {
        type: 'line'
    },
    title: {
        text: CHART_TITLE
    },
    xAxis: {
        title: {
            text: 'Time Elapsed (in min)'
        },
        labels: {
            formatter: function() {
                return (this.value as number).toFixed(2);
            }
        }
    },
    yAxis: {
        title: {
            text: 'Load Avg'
        },
        labels: {
            formatter: function() {
                return (this.value as number).toFixed(3);
            }
        }
    },
    legend: {
        enabled: false
    },
    tooltip: {
        pointFormatter: function() {
            return (this.y as number).toFixed(4);
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
    const [dateTimesOfAlerts, setDateTimesOfAlerts] = useState<string[]>([]);
    const [dateTimesOfRecoveries, setDateTimesOfRecoveries] = useState<string[]>([]);

    const startingTimestampOfApplication = useRef<number | null>(null);
    const startingTimestampOfAlertOrRecovery = useRef<number | null>(null);

    const fetchLoadMonitorData = async () => {
        const { loadAverage } = await fetchData('/cpu-load');

        setLoadData(prev => {
            // Retain existing loadAverages and timestamps
            const loadAverages = [...prev.loadAverages];
            const timestamps = [...prev.timestamps];

            // Ensure chart only covers past 10 minutes
            if (loadAverages.length === LENGTH_OF_HISTORICAL_WINDOW) {
                loadAverages.shift();
                timestamps.shift();
            }

            // Adding the new data point
            loadAverages.push(loadAverage);
            const minutes = getTimeElapsedInMinutes(startingTimestampOfApplication.current);
            const roundedMinutes = Math.round(minutes * 1000) / 1000;
            timestamps.push(roundedMinutes);

            // Timestamp in minutes is the X axis and load average is the Y axis
            return { timestamps, loadAverages };
        });

        return loadAverage;
    };

    const checkIfUnderHighLoad = useCallback((mostRecentLoad: number) => {
        if (!alertMode) {
            // A CPU is considered under high average load when >= 1 for 2 minutes or more
            if (mostRecentLoad >= LOAD_ALERT_THRESHOLD) {
                if (startingTimestampOfAlertOrRecovery.current) {
                    const timeElapsed = getTimeElapsedInMinutes(startingTimestampOfAlertOrRecovery.current);

                    if (timeElapsed >= 2) {
                        startingTimestampOfAlertOrRecovery.current = null;
                        const todaysDate = new Date(); 
                        const todaysDateStr = todaysDate.toLocaleString();
                        setDateTimesOfAlerts(prev => [...prev, todaysDateStr]);
                        setAlertMode(true);
                    }
                } else {
                    startingTimestampOfAlertOrRecovery.current = Date.now();
                }
            } else {
                startingTimestampOfAlertOrRecovery.current = null;
            }
        } else {
            // A CPU is considered recovered from high average load when < 1 for 2 minutes or more
            if (mostRecentLoad < LOAD_ALERT_THRESHOLD) {
                if (startingTimestampOfAlertOrRecovery.current) {
                    const timeElapsed = getTimeElapsedInMinutes(startingTimestampOfAlertOrRecovery.current);

                    if (timeElapsed >= 2) {
                        startingTimestampOfAlertOrRecovery.current = null;
                        const todaysDate = new Date(); 
                        const todaysDateStr = todaysDate.toLocaleString();
                        setDateTimesOfRecoveries(prev => [...prev, todaysDateStr]);
                        setAlertMode(false);
                    }
                } else {
                    startingTimestampOfAlertOrRecovery.current = Date.now();
                }
            } else {
                startingTimestampOfAlertOrRecovery.current = null;
            }
        }
    }, [alertMode]);

    useEffect(() => {
        // Record application start time on component mount
        startingTimestampOfApplication.current = Date.now();
    }, []);

    // Poll load average every 10 seconds
    useEffect(() => {
        const intervalId = setInterval(async () => {
            const newLoadAverage = await fetchLoadMonitorData();
            checkIfUnderHighLoad(newLoadAverage);
        }, POLL_INTERVAL);
        return () => clearInterval(intervalId);
    }, [checkIfUnderHighLoad]);

    const alertBoxLabel = alertMode ? 'Alert' : 'All Clear';
    const alertBoxClass = alertMode ? 'alert-box' : 'all-clear-box';

    const currentLoad = Math.round(loadData.loadAverages[loadData.loadAverages.length - 1] * 1000) / 1000;

    const rowsOfAlerts = dateTimesOfAlerts.map((dateTime, idx) => (
            <tr key={`alert-times-${idx}`}><td>{dateTime}</td></tr>
        )
    );
    const rowsOfRecoveries = dateTimesOfRecoveries.map((dateTime, idx) => (
            <tr key={`recovery-times-${idx}`}><td>{dateTime}</td></tr>
        )
    );

    return (
        <>
            <div className={`top-left common-box ${alertBoxClass}`}>
                {alertBoxLabel}
            </div>
            <div className={`top-right common-box ${alertBoxClass}`}>
                {alertBoxLabel}
            </div>

            <h1>CPU Load Avg Monitor</h1>
            <h3 className={currentLoad < LOAD_ALERT_THRESHOLD ? 'normal-load-text' : 'warning-load-text'}>
                Current: {currentLoad}
            </h3>

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

            <div className='table-container'>
                <table>
                    <thead><tr><th>Alerts: {rowsOfAlerts.length} total</th></tr></thead>
                    <tbody>{rowsOfAlerts}</tbody>
                </table>
                <table>
                    <thead><tr><th>Recoveries: {rowsOfRecoveries.length} total</th></tr></thead>
                    <tbody>{rowsOfRecoveries}</tbody>
                </table>
            </div>

            <div className='footer'>
                * A CPU is considered under high average load when &gt;= 1 for 2 minutes or more
            </div>
            <div className='footer'>
                * A CPU is considered recovered from high average load when &lt; 1 for 2 minutes or more
            </div>
        </>
    );
};

export default CPULoadMonitor;