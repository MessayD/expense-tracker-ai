# Expense Tracker

A modern, professional expense tracking web application built with Next.js 14, TypeScript, and Tailwind CSS. Track your personal finances with ease, view spending analytics, and export your data.

## Features

### Core Functionality
- **Add Expenses**: Easily add new expenses with date, amount, category, and description
- **View & Filter**: Browse all expenses with advanced filtering by date range, category, and search
- **Edit & Delete**: Modify or remove expenses with a user-friendly interface
- **Data Persistence**: All data is stored locally in your browser using localStorage

### Analytics & Insights
- **Dashboard Overview**: View total spending, monthly spending, total expenses, and average expense
- **Category Breakdown**: See spending by category with visual progress bars
- **Top Categories**: Identify your biggest spending categories at a glance
- **Spending Chart**: Visualize your daily spending over the last 7 days

### Categories
- Food
- Transportation
- Entertainment
- Shopping
- Bills
- Other

### Additional Features
- **CSV Export**: Export all your expenses to CSV for further analysis
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Form Validation**: Ensures data integrity with client-side validation
- **Modern UI**: Clean, professional interface with intuitive navigation

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Hooks (useState, useEffect)
- **Data Storage**: localStorage (browser-based)

## Getting Started

### Prerequisites

- Node.js 18+ installed on your machine
- npm or yarn package manager

### Installation

1. Navigate to the project directory:
```bash
cd expense-tracker-ai
```

2. Install dependencies (already done if you're seeing this):
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to:
```
http://localhost:3000
```

## Usage Guide

### Adding an Expense

1. Click the **Add Expense** button in the navigation
2. Fill in the form:
   - **Date**: Select the expense date (defaults to today)
   - **Amount**: Enter the expense amount in dollars
   - **Category**: Choose from the available categories
   - **Description**: Add a brief description (max 100 characters)
3. Click **Add Expense** to save

### Viewing Expenses

1. Click **All Expenses** in the navigation
2. Use the filters to narrow down your view:
   - **Search**: Search by description, category, or amount
   - **Category**: Filter by specific category
   - **Date Range**: Set start and/or end dates
3. View expense details including icon, description, amount, category, and date

### Editing an Expense

1. Navigate to **All Expenses**
2. Find the expense you want to edit
3. Click the **Edit** button
4. Modify the fields in the modal
5. Click **Save Changes**

### Deleting an Expense

1. Navigate to **All Expenses**
2. Find the expense you want to delete
3. Click the **Delete** button
4. Confirm the deletion in the dialog

### Viewing Analytics

1. Click **Dashboard** in the navigation
2. View the summary cards:
   - Total Spending (all time)
   - This Month (current month spending)
   - Total Expenses (count)
   - Average Expense
3. Review the **Top Categories** chart with spending percentages
4. Check the **Category Breakdown** for detailed spending by category
5. Analyze the **Last 7 Days Spending** chart for recent trends

### Exporting Data

1. Click the **Export to CSV** button in the top navigation
2. Your browser will download a CSV file with all expenses
3. Open the file in Excel, Google Sheets, or any spreadsheet application

## Project Structure

```
expense-tracker-ai/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx             # Main application page
│   └── globals.css          # Global styles
├── components/
│   ├── ui/                  # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Card.tsx
│   │   └── Modal.tsx
│   ├── Dashboard.tsx        # Dashboard with analytics
│   ├── ExpenseForm.tsx      # Form for adding expenses
│   ├── ExpenseList.tsx      # List view with filtering
│   ├── EditExpenseModal.tsx # Modal for editing expenses
│   ├── ExportButton.tsx     # CSV export button
│   └── SpendingChart.tsx    # Last 7 days chart
├── lib/
│   ├── storage.ts           # localStorage utilities
│   └── utils.ts             # Helper functions
├── types/
│   └── expense.ts           # TypeScript type definitions
└── public/                  # Static assets
```

## Key Components

### ExpenseForm
Handles expense creation with validation. Automatically redirects to the expenses list after successful submission.

### ExpenseList
Displays all expenses with filtering capabilities. Supports search by description, category filtering, and date range filtering.

### Dashboard
Shows summary statistics and spending analytics including category breakdowns and visualizations.

### SpendingChart
Displays a 7-day spending trend using a bar chart visualization built with pure CSS.

### EditExpenseModal
Modal dialog for editing existing expenses with pre-filled form data.

## Data Persistence

All expense data is stored in the browser's localStorage under the key `expense-tracker-expenses`. This means:

- Data persists across browser sessions
- Data is stored locally on your device
- Clearing browser data will remove your expenses
- Data is not synced across devices

To clear all data, use your browser's developer tools to clear localStorage or clear site data for localhost:3000.

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

### Building for Production

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Future Enhancements

Potential features for future versions:
- User authentication and cloud sync
- Budget setting and alerts
- Recurring expenses
- Multiple currency support
- Advanced analytics and reports
- Data import from bank statements
- Receipt photo uploads
- Dark mode theme

## License

This project is open source and available for personal and commercial use.

## Support

For issues or questions, please refer to the code comments or open an issue in the repository.

---

Built with Next.js 14, TypeScript, and Tailwind CSS
