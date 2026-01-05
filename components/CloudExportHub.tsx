'use client';

import React, { useState } from 'react';
import { Expense } from '@/types/expense';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { formatCurrency } from '@/lib/utils';

interface CloudExportHubProps {
  isOpen: boolean;
  onClose: () => void;
  expenses: Expense[];
}

type Tab = 'export' | 'email' | 'cloud' | 'schedule' | 'history' | 'share';

interface ExportHistory {
  id: string;
  date: string;
  method: string;
  format: string;
  records: number;
  status: 'completed' | 'processing' | 'failed';
}

interface CloudService {
  id: string;
  name: string;
  icon: string;
  connected: boolean;
  lastSync?: string;
}

const EXPORT_TEMPLATES = [
  {
    id: 'tax-report',
    name: 'Tax Report',
    icon: '📋',
    description: 'IRS-ready expense report with categories',
    format: 'PDF',
  },
  {
    id: 'monthly-summary',
    name: 'Monthly Summary',
    icon: '📊',
    description: 'Month-by-month breakdown with charts',
    format: 'Excel',
  },
  {
    id: 'category-analysis',
    name: 'Category Analysis',
    icon: '🎯',
    description: 'Deep dive into spending by category',
    format: 'PDF',
  },
  {
    id: 'expense-list',
    name: 'Simple List',
    icon: '📝',
    description: 'Clean itemized list of all expenses',
    format: 'CSV',
  },
  {
    id: 'business-report',
    name: 'Business Report',
    icon: '💼',
    description: 'Professional report for reimbursements',
    format: 'PDF',
  },
  {
    id: 'budget-tracker',
    name: 'Budget Tracker',
    icon: '💰',
    description: 'Track spending against budgets',
    format: 'Excel',
  },
];

const CLOUD_SERVICES: CloudService[] = [
  {
    id: 'google-sheets',
    name: 'Google Sheets',
    icon: '📊',
    connected: true,
    lastSync: '2 minutes ago',
  },
  {
    id: 'dropbox',
    name: 'Dropbox',
    icon: '📦',
    connected: true,
    lastSync: '1 hour ago',
  },
  {
    id: 'onedrive',
    name: 'OneDrive',
    icon: '☁️',
    connected: false,
  },
  {
    id: 'google-drive',
    name: 'Google Drive',
    icon: '🗂️',
    connected: true,
    lastSync: '5 minutes ago',
  },
];

const EXPORT_HISTORY: ExportHistory[] = [
  {
    id: '1',
    date: '2026-01-05 14:30',
    method: 'Email',
    format: 'PDF',
    records: 45,
    status: 'completed',
  },
  {
    id: '2',
    date: '2026-01-04 09:15',
    method: 'Google Sheets',
    format: 'Spreadsheet',
    records: 42,
    status: 'completed',
  },
  {
    id: '3',
    date: '2026-01-03 16:45',
    method: 'Dropbox',
    format: 'CSV',
    records: 38,
    status: 'completed',
  },
  {
    id: '4',
    date: '2026-01-02 11:20',
    method: 'Download',
    format: 'JSON',
    records: 35,
    status: 'completed',
  },
];

export const CloudExportHub: React.FC<CloudExportHubProps> = ({
  isOpen,
  onClose,
  expenses,
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('export');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('Expense Report');
  const [emailMessage, setEmailMessage] = useState('Please find attached my expense report.');
  const [scheduleFrequency, setScheduleFrequency] = useState('weekly');
  const [shareableLink, setShareableLink] = useState('');
  const [showQRCode, setShowQRCode] = useState(false);

  const handleGenerateLink = () => {
    const randomId = Math.random().toString(36).substring(7);
    setShareableLink(`https://expenses.app/share/${randomId}`);
  };

  const handleGenerateQR = () => {
    setShowQRCode(true);
    handleGenerateLink();
  };

  const handleSendEmail = () => {
    alert(`Email sent to ${emailTo}\n\nSubject: ${emailSubject}\n\nExpenses: ${expenses.length} records`);
  };

  const handleCloudSync = (serviceId: string) => {
    alert(`Syncing ${expenses.length} expenses to ${serviceId}...\n\nThis would connect to the real API in production.`);
  };

  const handleExportTemplate = (templateId: string) => {
    const template = EXPORT_TEMPLATES.find(t => t.id === templateId);
    alert(`Exporting using "${template?.name}" template\n\nFormat: ${template?.format}\nRecords: ${expenses.length}`);
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'export', label: 'Export', icon: '📥' },
    { id: 'email', label: 'Email', icon: '📧' },
    { id: 'cloud', label: 'Cloud Sync', icon: '☁️' },
    { id: 'schedule', label: 'Schedule', icon: '⏰' },
    { id: 'history', label: 'History', icon: '📜' },
    { id: 'share', label: 'Share', icon: '🔗' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black bg-opacity-60 transition-opacity backdrop-blur-sm"
          onClick={onClose}
        />

        <div className="relative bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden z-10">
          {/* Header with Gradient */}
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold flex items-center">
                  <span className="mr-3">☁️</span>
                  Cloud Export Hub
                </h2>
                <p className="text-indigo-100 text-sm mt-1">
                  Export, share, and sync your expenses anywhere
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={onClose}
                className="!bg-white/20 !text-white hover:!bg-white/30"
              >
                ✕
              </Button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b bg-gray-50">
            <div className="flex overflow-x-auto">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Tab)}
                  className={`flex items-center space-x-2 px-6 py-4 font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-xl">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-8 overflow-y-auto max-h-[calc(90vh-240px)]">
            {/* EXPORT TAB */}
            {activeTab === 'export' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Choose Export Template
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Select a pre-configured template optimized for different use cases
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {EXPORT_TEMPLATES.map(template => (
                    <button
                      key={template.id}
                      onClick={() => handleExportTemplate(template.id)}
                      className="text-left p-6 border-2 border-gray-200 rounded-xl hover:border-indigo-500 hover:shadow-lg transition-all group"
                    >
                      <div className="text-4xl mb-3">{template.icon}</div>
                      <h4 className="font-bold text-gray-900 mb-2 group-hover:text-indigo-600">
                        {template.name}
                      </h4>
                      <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                          {template.format}
                        </span>
                        <span className="text-xs text-gray-500">{expenses.length} records</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* EMAIL TAB */}
            {activeTab === 'email' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Email Export</h3>
                  <p className="text-gray-600 mb-6">
                    Send your expense report directly via email
                  </p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
                  <div className="space-y-4">
                    <Input
                      label="To"
                      type="email"
                      placeholder="recipient@example.com"
                      value={emailTo}
                      onChange={e => setEmailTo(e.target.value)}
                    />
                    <Input
                      label="Subject"
                      placeholder="Expense Report"
                      value={emailSubject}
                      onChange={e => setEmailSubject(e.target.value)}
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Message
                      </label>
                      <textarea
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        rows={4}
                        placeholder="Add a message..."
                        value={emailMessage}
                        onChange={e => setEmailMessage(e.target.value)}
                      />
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Attachment</span>
                        <span className="text-xs text-gray-500">PDF Format</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">📎</span>
                        <div>
                          <div className="text-sm font-medium text-gray-900">expense-report.pdf</div>
                          <div className="text-xs text-gray-500">
                            {expenses.length} expenses • {formatCurrency(
                              expenses.reduce((sum, e) => sum + e.amount, 0)
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={handleSendEmail}
                      disabled={!emailTo}
                      className="w-full !bg-gradient-to-r !from-blue-600 !to-indigo-600"
                    >
                      📧 Send Email
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* CLOUD SYNC TAB */}
            {activeTab === 'cloud' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Cloud Integrations</h3>
                  <p className="text-gray-600 mb-6">
                    Connect and sync with your favorite cloud services
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {CLOUD_SERVICES.map(service => (
                    <div
                      key={service.id}
                      className="border-2 border-gray-200 rounded-xl p-6 hover:border-indigo-400 transition-all"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <span className="text-4xl">{service.icon}</span>
                          <div>
                            <h4 className="font-bold text-gray-900">{service.name}</h4>
                            {service.connected && service.lastSync && (
                              <p className="text-xs text-gray-500">
                                Last sync: {service.lastSync}
                              </p>
                            )}
                          </div>
                        </div>
                        {service.connected && (
                          <span className="flex items-center space-x-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                            <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
                            <span>Connected</span>
                          </span>
                        )}
                      </div>

                      {service.connected ? (
                        <div className="space-y-2">
                          <Button
                            onClick={() => handleCloudSync(service.id)}
                            variant="primary"
                            size="sm"
                            className="w-full"
                          >
                            🔄 Sync Now
                          </Button>
                          <Button variant="secondary" size="sm" className="w-full">
                            ⚙️ Settings
                          </Button>
                        </div>
                      ) : (
                        <Button variant="primary" size="sm" className="w-full">
                          🔗 Connect {service.name}
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="bg-indigo-50 border-2 border-indigo-200 rounded-xl p-6">
                  <h4 className="font-bold text-indigo-900 mb-2">💡 Pro Tip</h4>
                  <p className="text-sm text-indigo-700">
                    Connect Google Sheets for real-time expense tracking. Your data syncs
                    automatically every time you add an expense!
                  </p>
                </div>
              </div>
            )}

            {/* SCHEDULE TAB */}
            {activeTab === 'schedule' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Automatic Backups
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Set up recurring exports for peace of mind
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3">
                        Backup Frequency
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {['Daily', 'Weekly', 'Monthly', 'Quarterly'].map(freq => (
                          <button
                            key={freq}
                            onClick={() => setScheduleFrequency(freq.toLowerCase())}
                            className={`p-4 border-2 rounded-lg font-medium transition-all ${
                              scheduleFrequency === freq.toLowerCase()
                                ? 'border-purple-600 bg-purple-100 text-purple-900'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            {freq}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3">
                        Backup Destination
                      </label>
                      <select className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
                        <option>Google Drive</option>
                        <option>Dropbox</option>
                        <option>OneDrive</option>
                        <option>Email (send to me)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3">
                        Export Format
                      </label>
                      <select className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
                        <option>CSV (Spreadsheet)</option>
                        <option>JSON (Data Format)</option>
                        <option>PDF (Document)</option>
                        <option>Excel (Workbook)</option>
                      </select>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-purple-200">
                      <div className="flex items-center space-x-3 mb-2">
                        <input
                          type="checkbox"
                          id="notify"
                          className="w-5 h-5 text-purple-600 rounded"
                        />
                        <label htmlFor="notify" className="text-sm font-medium text-gray-900">
                          Notify me after each backup
                        </label>
                      </div>
                      <p className="text-xs text-gray-600 ml-8">
                        Receive an email confirmation when automatic backups complete
                      </p>
                    </div>

                    <Button className="w-full !bg-gradient-to-r !from-purple-600 !to-pink-600">
                      ⏰ Enable Automatic Backups
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* HISTORY TAB */}
            {activeTab === 'history' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Export History</h3>
                  <p className="text-gray-600 mb-6">
                    Track all your exports and re-download previous files
                  </p>
                </div>

                <div className="space-y-3">
                  {EXPORT_HISTORY.map(item => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-all"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                          <span className="text-2xl">
                            {item.method === 'Email' && '📧'}
                            {item.method === 'Google Sheets' && '📊'}
                            {item.method === 'Dropbox' && '📦'}
                            {item.method === 'Download' && '📥'}
                          </span>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            {item.method} • {item.format}
                          </div>
                          <div className="text-sm text-gray-600">
                            {item.date} • {item.records} records
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {item.status === 'completed' && (
                          <span className="text-green-600 font-medium text-sm">✓ Completed</span>
                        )}
                        <Button variant="secondary" size="sm">
                          Re-export
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SHARE TAB */}
            {activeTab === 'share' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Share & Collaborate</h3>
                  <p className="text-gray-600 mb-6">
                    Generate secure links or QR codes to share your expense data
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-6 border-2 border-teal-200">
                    <h4 className="font-bold text-gray-900 mb-4">Shareable Link</h4>
                    {shareableLink ? (
                      <div className="space-y-3">
                        <div className="bg-white rounded-lg p-3 border border-teal-300">
                          <div className="text-xs text-gray-600 mb-1">Your secure link:</div>
                          <div className="text-sm font-mono text-teal-700 break-all">
                            {shareableLink}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => navigator.clipboard.writeText(shareableLink)}
                            variant="secondary"
                            size="sm"
                            className="flex-1"
                          >
                            📋 Copy Link
                          </Button>
                          <Button variant="secondary" size="sm" className="flex-1">
                            🔒 Set Password
                          </Button>
                        </div>
                        <p className="text-xs text-gray-600">
                          Link expires in 7 days • Read-only access
                        </p>
                      </div>
                    ) : (
                      <Button
                        onClick={handleGenerateLink}
                        className="w-full !bg-gradient-to-r !from-teal-600 !to-cyan-600"
                      >
                        🔗 Generate Secure Link
                      </Button>
                    )}
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-6 border-2 border-orange-200">
                    <h4 className="font-bold text-gray-900 mb-4">QR Code</h4>
                    {showQRCode ? (
                      <div className="space-y-3">
                        <div className="bg-white rounded-lg p-4 border border-orange-300 flex justify-center">
                          <div className="w-48 h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                            <div className="text-center">
                              <div className="text-6xl mb-2">📱</div>
                              <div className="text-xs text-gray-600">QR Code</div>
                              <div className="text-xs text-gray-500">Scan to view</div>
                            </div>
                          </div>
                        </div>
                        <Button variant="secondary" size="sm" className="w-full">
                          💾 Download QR Code
                        </Button>
                      </div>
                    ) : (
                      <Button
                        onClick={handleGenerateQR}
                        className="w-full !bg-gradient-to-r !from-orange-600 !to-yellow-600"
                      >
                        📱 Generate QR Code
                      </Button>
                    )}
                  </div>
                </div>

                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
                  <h4 className="font-bold text-yellow-900 mb-2">🔒 Security & Privacy</h4>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    <li>• Shared links are encrypted and expire after 7 days</li>
                    <li>• Recipients can only view data, not edit</li>
                    <li>• You can revoke access at any time</li>
                    <li>• No personal information is included in shared data</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t bg-gray-50 px-8 py-4 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              <span className="font-medium">{expenses.length}</span> total expenses
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">Powered by Cloud Infrastructure</span>
              <div className="flex space-x-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-xs font-medium text-green-600">Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
