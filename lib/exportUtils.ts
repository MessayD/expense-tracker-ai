'use client';

import { Expense } from '@/types/expense';

export type ExportFormat = 'csv' | 'json' | 'pdf';

export interface ExportOptions {
  format: ExportFormat;
  startDate?: string;
  endDate?: string;
  categories?: string[];
  includeHeaders?: boolean;
  filename?: string;
}

// Filter expenses based on options
export const filterExpenses = (expenses: Expense[], options: ExportOptions): Expense[] => {
  let filtered = [...expenses];

  if (options.startDate) {
    filtered = filtered.filter(exp => exp.date >= options.startDate!);
  }

  if (options.endDate) {
    filtered = filtered.filter(exp => exp.date <= options.endDate!);
  }

  if (options.categories && options.categories.length > 0) {
    filtered = filtered.filter(exp => options.categories!.includes(exp.category));
  }

  return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

// CSV Export
export const exportToCSV = (expenses: Expense[], includeHeaders = true): string => {
  const headers = ['Date', 'Category', 'Amount', 'Description', 'Created At'];

  const rows = expenses.map(exp => [
    exp.date,
    exp.category,
    exp.amount.toFixed(2),
    `"${exp.description.replace(/"/g, '""')}"`,
    exp.createdAt.split('T')[0],
  ]);

  const lines: string[] = [];
  if (includeHeaders) {
    lines.push(headers.join(','));
  }
  lines.push(...rows.map(row => row.join(',')));

  return lines.join('\n');
};

// JSON Export
export const exportToJSON = (expenses: Expense[], pretty = true): string => {
  const exportData = {
    exportDate: new Date().toISOString(),
    totalExpenses: expenses.length,
    totalAmount: expenses.reduce((sum, exp) => sum + exp.amount, 0),
    expenses: expenses.map(exp => ({
      date: exp.date,
      category: exp.category,
      amount: exp.amount,
      description: exp.description,
      createdAt: exp.createdAt,
    })),
  };

  return pretty ? JSON.stringify(exportData, null, 2) : JSON.stringify(exportData);
};

// PDF Export (generates HTML that can be printed as PDF)
export const exportToPDF = (expenses: Expense[]): void => {
  const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const categoryTotals: Record<string, number> = {};

  expenses.forEach(exp => {
    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
  });

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Expense Report</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          padding: 40px;
          color: #1f2937;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #e5e7eb;
        }
        .header h1 { color: #1f2937; font-size: 28px; margin-bottom: 8px; }
        .header p { color: #6b7280; font-size: 14px; }
        .summary {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
          padding: 20px;
          background: #f9fafb;
          border-radius: 8px;
        }
        .summary-item { text-align: center; }
        .summary-item .label { font-size: 12px; color: #6b7280; text-transform: uppercase; }
        .summary-item .value { font-size: 24px; font-weight: bold; color: #1f2937; }
        .section-title { font-size: 18px; font-weight: 600; margin: 24px 0 16px; color: #374151; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        th {
          background: #f3f4f6;
          padding: 12px;
          text-align: left;
          font-size: 12px;
          text-transform: uppercase;
          color: #6b7280;
          border-bottom: 2px solid #e5e7eb;
        }
        td {
          padding: 12px;
          border-bottom: 1px solid #e5e7eb;
          font-size: 14px;
        }
        tr:hover { background: #f9fafb; }
        .amount { text-align: right; font-weight: 500; }
        .category-badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
          background: #e5e7eb;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          font-size: 12px;
          color: #9ca3af;
        }
        @media print {
          body { padding: 20px; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Expense Report</h1>
        <p>Generated on ${new Date().toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}</p>
      </div>

      <div class="summary">
        <div class="summary-item">
          <div class="label">Total Expenses</div>
          <div class="value">${expenses.length}</div>
        </div>
        <div class="summary-item">
          <div class="label">Total Amount</div>
          <div class="value">$${totalAmount.toFixed(2)}</div>
        </div>
        <div class="summary-item">
          <div class="label">Categories</div>
          <div class="value">${Object.keys(categoryTotals).length}</div>
        </div>
        <div class="summary-item">
          <div class="label">Avg per Expense</div>
          <div class="value">$${expenses.length > 0 ? (totalAmount / expenses.length).toFixed(2) : '0.00'}</div>
        </div>
      </div>

      <div class="section-title">Category Breakdown</div>
      <table>
        <thead>
          <tr>
            <th>Category</th>
            <th>Transactions</th>
            <th style="text-align: right">Amount</th>
            <th style="text-align: right">% of Total</th>
          </tr>
        </thead>
        <tbody>
          ${Object.entries(categoryTotals)
            .sort((a, b) => b[1] - a[1])
            .map(([cat, amount]) => `
              <tr>
                <td><span class="category-badge">${cat}</span></td>
                <td>${expenses.filter(e => e.category === cat).length}</td>
                <td class="amount">$${amount.toFixed(2)}</td>
                <td class="amount">${((amount / totalAmount) * 100).toFixed(1)}%</td>
              </tr>
            `).join('')}
        </tbody>
      </table>

      <div class="section-title">All Transactions</div>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Category</th>
            <th>Description</th>
            <th style="text-align: right">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${expenses.map(exp => `
            <tr>
              <td>${new Date(exp.date).toLocaleDateString()}</td>
              <td><span class="category-badge">${exp.category}</span></td>
              <td>${exp.description}</td>
              <td class="amount">$${exp.amount.toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="footer">
        <p>Expense Tracker AI - Intelligent Financial Management</p>
      </div>

      <script>
        window.onload = function() { window.print(); }
      </script>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
  }
};

// Download file helper
export const downloadFile = (content: string, filename: string, mimeType: string): void => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};

// Main export function
export const exportExpenses = (expenses: Expense[], options: ExportOptions): void => {
  const filtered = filterExpenses(expenses, options);

  if (filtered.length === 0) {
    alert('No expenses to export with the selected filters');
    return;
  }

  const timestamp = new Date().toISOString().split('T')[0];
  const baseFilename = options.filename || `expenses-${timestamp}`;

  switch (options.format) {
    case 'csv':
      const csv = exportToCSV(filtered, options.includeHeaders ?? true);
      downloadFile(csv, `${baseFilename}.csv`, 'text/csv;charset=utf-8');
      break;

    case 'json':
      const json = exportToJSON(filtered);
      downloadFile(json, `${baseFilename}.json`, 'application/json');
      break;

    case 'pdf':
      exportToPDF(filtered);
      break;
  }
};

// Get export preview
export const getExportPreview = (expenses: Expense[], options: ExportOptions): string => {
  const filtered = filterExpenses(expenses, options);

  switch (options.format) {
    case 'csv':
      return exportToCSV(filtered.slice(0, 5), options.includeHeaders ?? true) +
        (filtered.length > 5 ? `\n... and ${filtered.length - 5} more rows` : '');

    case 'json':
      const preview = {
        ...JSON.parse(exportToJSON(filtered)),
        expenses: filtered.slice(0, 3).map(e => ({ ...e })),
      };
      if (filtered.length > 3) {
        preview._note = `Showing 3 of ${filtered.length} expenses`;
      }
      return JSON.stringify(preview, null, 2);

    case 'pdf':
      return `PDF Report Preview\n${'─'.repeat(40)}\nTotal Expenses: ${filtered.length}\nTotal Amount: $${filtered.reduce((s, e) => s + e.amount, 0).toFixed(2)}\n\nThe PDF will open in a new window for printing.`;

    default:
      return '';
  }
};
