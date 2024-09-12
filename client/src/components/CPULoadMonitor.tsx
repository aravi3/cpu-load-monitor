import React, { useEffect, useState } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { fetchData } from '../utils';

const CPULoadMonitor: React.FC = () => {
    const [data, setData] = useState({ loadAverage: null });
    const [alert, setAlert] = useState('');

    const isUnderHighLoad = () => {
        // TODO: Fill out function
        // A CPU is considered under high average load when it has exceeded 1 for 2 minutes or more.
        // A CPU is considered recovered from high average load when it drops below 1 for 2 minutes or more.
    }

    useEffect(() => {
        const fetchLoadMonitorData = async () => {
            const data = await fetchData('/cpu-load');
            setData(data);
        };
        fetchLoadMonitorData();
    }, []);

    const options = {
        chart: {
            type: 'line'
        },
        title: {
            text: 'Daily Temperatures'
        },
        xAxis: {
            categories: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        },
        yAxis: {
            title: {
                text: 'Temperature (°C)'
            }
        },
        series: [
            {
                name: 'High',
                data: [5, 4, 6, 8, 7, 9, 10]
            },
            {
                name: 'Low',
                data: [2, 1, 3, 5, 4, 6, 7]
            }
        ]
    };
      
    return (
        <>
            <h1>CPU Load Monitor</h1>
            {alert && <div>{alert}</div>}
            <HighchartsReact highcharts={Highcharts} options={options} />
            {data.loadAverage}
        </>
    );
};

export default CPULoadMonitor;