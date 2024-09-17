# CPU Load Monitoring Web Application

This is a CPU Load Monitoring web application built using React, Node.js, and TypeScript. The app renders real-time CPU load data and alerts the user when the CPU is under heavy load or has recovered.

![MainPic](https://res.cloudinary.com/dnj5rmvun/image/upload/v1726586609/cpu_load_monitor_screenshot_ylw0rf.png)

## Features

- Displays the current average CPU load
- Shows the average CPU load change over a 10 minute window
- Alerts when the CPU has been under heavy load for 2 minutes or more
- Alerts when the CPU load has recovered
- Communicates with a local backend service to retrieve CPU load information every 10 seconds

## Project Structure

- `server/`: Contains the Node.js server that fetches CPU load data
- `client/`: Contains the React frontend that renders the data and alerts

## Prerequisites

- Node.js (my version is 22.8.0)
- npm (my version is 10.8.2)

## Getting Started

Follow the instructions below to clone and run the application locally.

### 1. Clone the Repository

```bash
git clone https://github.com/aravi3/cpu-load-monitor.git
cd cpu-load-monitor
```

### 2. Install Packages

From root directory:

```bash
npm install
```

### 3. Start Application

From root directory:

```bash
npm start
```

## How To Test the Application

To test your application, and spike up your CPU load, you can use the following command:

`yes > /dev/null`

Run it multiple times to stress test each CPU core, if you like:

`yes > /dev/null & yes > /dev/null & yes > /dev/null & yes > /dev/null`

When you're done, kill all the processes with this:

`killall -HUP yes`

## How To Run Unit Tests

Run `npm test` from the `client` directory and press `a` to run all tests

## Future Improvements

If this application were to be extended for production use, it could use a few modifications:

- Persistence: Use a database to persist the historical CPU load data so that it's not lost. This info can be used for other purposes later, such as detecting patterns in load over time or during specific times of the day.
- Communication: Use WebSockets instead of polling for real-time updates.
- UI/UX: Use D3 instead of/in conjunction with Highcharts for more advanced and varied data visualizations.
- Security: Implement authentication so that CPU load data is not publicly visible (this information could be useful to hackers looking to overload an entity's server with network traffic as a form of DoS attack). 
- Logging: Log errors/alerts in Datadog for ease of long-term monitoring and searching.

## Contact

For any inquiries or suggestions, feel free to reach out to me at [ar2au@virginia.edu].
