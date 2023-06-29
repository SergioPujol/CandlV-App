# CandlV-App

# Automated Cryptocurrency Trading Desktop Application

## Project Overview

The Automated Cryptocurrency Trading Desktop Application is a tool designed to simplify market analysis and automate cryptocurrency trading using technical strategies. The application allows users to perform real-time automated trading and simulations in cryptocurrency markets.

## Key Features

- User authentication
- Creation of customizable charts with symbol and interval options
- Real-time visualization of multiple charts
- Configuration of automated trading bots with customizable strategies and values
- Support for fixed or percentage-based investments in each bot
- Integration with Binance API for trading operations
- Storage of user-specific data such as charts, bots, and strategies
- Local execution of automated trading
- Technical analysis using predefined strategies or custom scripts
- Simulation of trading strategies using historical data with different symbols and intervals
- Calculation of simulated profit

## Methodology

The project follows an Agile Scrum methodology, which allows the software to be developed iteratively and incrementally in short development cycles called sprints. The Scrum methodology emphasizes collaboration, flexibility, and continuous improvement throughout the development process.

## Technologies Used

- JavaScript
- HTML
- CSS
- Bootstrap
- Electron
- Node.js
- Typescript
- MongoDB
- Mongoose

## Getting Started

To run the desktop application, follow these steps:

1. Install MongoDB and MongoDB Compass (recommended) to set up a local non-relational database. Once installed, start a new connection with `mongodb://localhost:27017`.
2. Create the following databases and collections:
   - Database: `candlv_desktop`
     - Collections: `bots`, `charts`, `settings`, `strategies`, `trades`
   - Database: `candlv_users_desktop`
     - Collections: `users`
3. Add a test user to the `users` collection in the `candlv_desktop` and `candlv_users_desktop` databases. Use an email and key as shown in the user document example.
4. Clone the desktop application repository from GitHub: [GitHub Repository](https://github.com/SergioPujol/CandlV-App)
5. Open a terminal and navigate to the project directory.
6. Run `npm install` to install the required npm packages.
7. Execute the command `npm run start` in the `Server_DB_Users` directory to start the external user database server. 
8. Execute the command `npm run start` in the main directory of the project.
9. The application will launch, and you can now interact with it using the provided interface.
