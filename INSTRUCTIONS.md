# CPU Load Monitoring Web Application

Show us your software engineering skills by creating a proof-of-concept (POC) for a browser-based CPU load monitoring application. This application will display time-series data - how it looks is up to you.

## User Experience

As a user, I want an application that will allow me to answer the following questions about my computer:

- What is my computer's current average CPU load?
- How did the average CPU load change over a 10 minute window?
- Has my computer been under heavy CPU load for 2 minutes or more? When? How many times?
- Has my computer recovered from heavy CPU load? When? How many times?

## Product requirements:

The application should accomplish the following:

- Communicate with a local back-end service to retrieve CPU load average information from your computer (see below).
- Retrieve CPU load information every 10 seconds.
- Maintain a 10 minute window of historical CPU load information.
- Alert the user to high CPU load.
- Alert the user when CPU load has recovered.

## Engineering notes:

- The alerting logic in your application should have tests.
- The back-end service does not need to persist data.
- Please write up a small explanation of how you would extend or improve your application design if you were building this for production.

## CPU Load Average:

Learn about CPU load here: https://en.wikipedia.org/wiki/Load_%28computing%29

Modern computers often have multiple CPUs, and you will need to normalize the load average to account for this. For example, on macOS or linux using NodeJS you could get the number of CPUs on your computer with:

`const cpus = os.cpus().length`

You could then normalize the CPU load average with:

`const loadAverage = os.loadavg()[0] / cpus`

Thresholds for high load and recovery:

- A CPU is considered under high average load when it has exceeded 1 for 2 minutes or more.
- A CPU is considered recovered from high average load when it drops below 1 for 2 minutes or more.

## Testing your app manually

To test your application, and spike up your CPU load, you can use the following command:

`yes > /dev/null`

Run it multiple times to stress test each CPU core, if you like:

`yes > /dev/null & yes > /dev/null & yes > /dev/null & yes > /dev/null`

When you're done, kill all the processes with this:

`killall -HUP yes`

## Acceptance Criteria

We expect you to write this application using React and TypeScript. You're free to use any other tools/frameworks/libaries you prefer.

What we will look for:

- Does your code successfully fulfill the requirement?
- How clean is your design? How easy is it to understand, maintain, or extend your code?
- How did you verify your software, if by automated tests or by other means?
- What kind of documentation did you ship with your code?

## Submission Instructions

Please submit your completed project as a GitHub repository, within **7 days** of receiving this document. Send us a link to your repo with instructions on how to run the code in the form of a README.md file.
