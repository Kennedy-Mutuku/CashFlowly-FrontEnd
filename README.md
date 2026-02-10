# CashFlowly - Personal Finance Management System (Frontend)

CashFlowly is a sleek, modern, and intuitive web application for personal finance management. Built with React and designed with a premium dark-themed UI.

## Features

- **Dynamic Dashboard**: Visual charts for expense breakdown and income vs. expenses.
- **Protected Routes**: Only authorized users can access financial data.
- **Real-time Calculations**: Instant feedback on budget progress and savings.
- **Responsive Design**: Fully functional on mobile and desktop.

## Tech Stack

- **React.js**: Frontend library.
- **Vite**: Build tool.
- **Chart.js**: Data visualization.
- **Lucide React**: Icon library.
- **Axios**: API communication.
- **Vanilla CSS**: Custom premium styling with glassmorphism.

## Setup Instructions

1. Clone the repository.
2. Navigate to the `frontend` folder.
3. Install dependencies: `npm install`.
4. Run the development server: `npm run dev`.
5. Ensure the backend is running at `http://localhost:5000`.

## Architecture

- `src/context/AuthContext.jsx`: Manages global authentication state.
- `src/services/api.js`: Handles API requests with interceptors.
- `src/pages/`: Contains all functional modules (Income, Expenses, Budget, Savings, Dashboard).
- `src/index.css`: Defines the global design system and theme.
