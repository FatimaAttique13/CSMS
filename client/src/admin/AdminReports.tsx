'use client';

import React, { useState } from 'react';
import { 
  Upload, 
  FileSpreadsheet, 
  TrendingUp, 
  DollarSign, 
  Package, 
  Truck,
  Calendar,
  Download,
  X,
  CheckCircle,
  AlertCircle,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';

interface MonthData {
  month: string;
  value: number;
  tons: number;
  costOfSales: number;
  transport: number;
  margin: number;
  marginPercent: number;
  expenses: number;
  netProfit: number;
  avgPerTon?: number;
}

interface ReportTotals {
  value: number;
  tons: number;
  costOfSales: number;
  transport: number;
  margin: number;
  expenses: number;
  netProfit: number;
}

interface ReportData {
  title: string;
  year: number;
  months: MonthData[];
  totals: ReportTotals;
}

export default function AdminReports() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (selectedFile: File) => {
    const fileType = selectedFile.name.split('.').pop()?.toLowerCase();
    
    if (!fileType || !['xlsx', 'xls', 'csv'].includes(fileType)) {
      setError('Please upload a valid Excel file (.xlsx, .xls) or CSV file');
      return;
    }

    setFile(selectedFile);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/reports/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();
      setReportData(data);
      setFile(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload and process the file. Please try again.';
      setError(errorMessage);
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const loadSampleData = async () => {
    try {
      const response = await fetch('/api/reports/sample');
      const data = await response.json();
      setReportData(data);
      setFile(null);
    } catch (err) {
      setError('Failed to load sample data');
      console.error(err);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-SA', { 
      style: 'currency', 
      currency: 'SAR',
      minimumFractionDigits: 2 
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US', { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2 
    }).format(value);
  };

  const getMonthPerformance = (month: MonthData) => {
    if (!reportData) return 'neutral';
    const avgMargin = reportData.totals.margin / reportData.months.length;
    return month.margin > avgMargin ? 'good' : month.margin < avgMargin * 0.8 ? 'poor' : 'neutral';
  };

  const exportToExcel = () => {
    if (!reportData) return;
    
    // Create CSV content
    const headers = ['Month', 'Sales Value', 'Tons', 'Cost of Sales', 'Transport', 'Margin', 'A/GM/Ton', 'Expenses', 'Net Profit'];
    const rows = reportData.months.map(m => [
      m.month,
      m.value.toFixed(2),
      m.tons.toFixed(2),
      m.costOfSales.toFixed(2),
      m.transport.toFixed(2),
      m.margin.toFixed(2),
      (m.avgPerTon || 0).toFixed(2),
      m.expenses.toFixed(2),
      m.netProfit.toFixed(2)
    ]);
    
    const totalsRow = [
      'TOTAL',
      reportData.totals.value.toFixed(2),
      reportData.totals.tons.toFixed(2),
      reportData.totals.costOfSales.toFixed(2),
      reportData.totals.transport.toFixed(2),
      reportData.totals.margin.toFixed(2),
      '-',
      reportData.totals.expenses.toFixed(2),
      reportData.totals.netProfit.toFixed(2)
    ];

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
      totalsRow.join(',')
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cement-report-${reportData.year}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-3 rounded-2xl shadow-lg">
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
            Annual Reports
          </h1>
          <p className="text-gray-600 text-lg">Upload and analyze your cement sales reports</p>
        </div>

        {/* Upload Section */}
        {!reportData && (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-6 sm:p-8 mb-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Report</h2>
              <p className="text-gray-600">Upload your Excel file containing monthly sales data</p>
            </div>

            {/* Drag & Drop Zone */}
            <div
              className={`relative border-2 border-dashed rounded-2xl p-12 transition-all duration-300 ${
                dragActive 
                  ? 'border-blue-500 bg-blue-50/50' 
                  : 'border-gray-300 bg-gray-50/50 hover:border-blue-400 hover:bg-blue-50/30'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileInput}
              />

              <div className="text-center">
                <div className="mb-4 flex justify-center">
                  <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-6 rounded-full">
                    <FileSpreadsheet className="h-16 w-16 text-blue-600" />
                  </div>
                </div>

                {file ? (
                  <div className="mb-4">
                    <div className="inline-flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-6 py-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-semibold text-green-900">{file.name}</span>
                      <button
                        onClick={() => setFile(null)}
                        className="ml-2 text-green-600 hover:text-green-800"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-xl font-semibold text-gray-700 mb-2">
                      Drag and drop your Excel file here
                    </p>
                    <p className="text-gray-500 mb-6">or</p>
                  </>
                )}

                <label
                  htmlFor="file-upload"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer"
                >
                  <Upload className="h-5 w-5" />
                  Choose File
                </label>

                <p className="text-sm text-gray-500 mt-4">
                  Supported formats: .xlsx, .xls, .csv
                </p>
              </div>
            </div>

            {error && (
              <div className="mt-4 flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-6 flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold shadow-lg transition-all duration-300 ${
                  file && !uploading
                    ? 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:shadow-xl transform hover:scale-105'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5" />
                    Upload & Process
                  </>
                )}
              </button>

              <button
                onClick={loadSampleData}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-blue-600 text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Activity className="h-5 w-5" />
                Load Sample Data
              </button>
            </div>
          </div>
        )}

        {/* Report Display */}
        {reportData && (
          <div className="space-y-6">
            {/* Header with Actions */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">{reportData.title}</h2>
                  <p className="text-gray-600 mt-1">Year: {reportData.year}</p>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={exportToExcel}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all shadow-lg hover:shadow-xl"
                  >
                    <Download className="h-5 w-5" />
                    Export
                  </button>
                  <button
                    onClick={() => setReportData(null)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all shadow-lg hover:shadow-xl"
                  >
                    <X className="h-5 w-5" />
                    Clear
                  </button>
                </div>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <DollarSign className="h-10 w-10 opacity-80" />
                  <TrendingUp className="h-6 w-6" />
                </div>
                <p className="text-blue-100 font-medium mb-1">Total Sales</p>
                <p className="text-3xl font-bold">{formatCurrency(reportData.totals.value)}</p>
              </div>

              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <Package className="h-10 w-10 opacity-80" />
                  <TrendingUp className="h-6 w-6" />
                </div>
                <p className="text-emerald-100 font-medium mb-1">Total Tons Sold</p>
                <p className="text-3xl font-bold">{formatNumber(reportData.totals.tons)}</p>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <PieChart className="h-10 w-10 opacity-80" />
                  <TrendingUp className="h-6 w-6" />
                </div>
                <p className="text-purple-100 font-medium mb-1">Total Margin</p>
                <p className="text-3xl font-bold">{formatCurrency(reportData.totals.margin)}</p>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <Activity className="h-10 w-10 opacity-80" />
                  <TrendingUp className="h-6 w-6" />
                </div>
                <p className="text-orange-100 font-medium mb-1">Net Profit</p>
                <p className="text-3xl font-bold">{formatCurrency(reportData.totals.netProfit)}</p>
              </div>
            </div>

            {/* Monthly Data Table */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Calendar className="h-6 w-6 text-blue-600" />
                  Monthly Breakdown
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Month</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Sales Value</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Tons</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Cost of Sales</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Transport</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Margin</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">A/GM/Ton</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Expenses</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Net Profit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {reportData.months.map((month, index) => {
                      const performance = getMonthPerformance(month);
                      return (
                        <tr 
                          key={index} 
                          className={`hover:bg-blue-50/50 transition-colors ${
                            performance === 'good' ? 'bg-green-50/30' : 
                            performance === 'poor' ? 'bg-red-50/30' : ''
                          }`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="font-semibold text-gray-900">{month.month}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right font-medium text-gray-900">
                            {formatCurrency(month.value)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-gray-700">
                            {formatNumber(month.tons)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-gray-700">
                            {formatCurrency(month.costOfSales)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-gray-700">
                            {formatCurrency(month.transport)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <span className={`font-semibold ${
                              performance === 'good' ? 'text-green-600' :
                              performance === 'poor' ? 'text-red-600' :
                              'text-gray-900'
                            }`}>
                              {formatCurrency(month.margin)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-gray-700">
                            {formatNumber(month.avgPerTon || 0)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-gray-700">
                            {formatCurrency(month.expenses)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <span className="font-bold text-blue-600">
                              {formatCurrency(month.netProfit)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                    {/* Totals Row */}
                    <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold">
                      <td className="px-6 py-4 whitespace-nowrap text-lg">TOTAL</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-lg">
                        {formatCurrency(reportData.totals.value)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        {formatNumber(reportData.totals.tons)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        {formatCurrency(reportData.totals.costOfSales)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        {formatCurrency(reportData.totals.transport)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        {formatCurrency(reportData.totals.margin)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">-</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        {formatCurrency(reportData.totals.expenses)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-lg">
                        {formatCurrency(reportData.totals.netProfit)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Performance Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                  Best Month
                </h3>
                {(() => {
                  const bestMonth = reportData.months.reduce((max, month) => 
                    month.netProfit > max.netProfit ? month : max
                  );
                  return (
                    <div>
                      <p className="text-3xl font-bold text-green-600 mb-2">{bestMonth.month}</p>
                      <p className="text-gray-600">Net Profit: {formatCurrency(bestMonth.netProfit)}</p>
                      <p className="text-gray-600">Sales: {formatCurrency(bestMonth.value)}</p>
                    </div>
                  );
                })()}
              </div>

              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Package className="h-6 w-6 text-blue-600" />
                  Average per Month
                </h3>
                <div>
                  <p className="text-3xl font-bold text-blue-600 mb-2">
                    {formatCurrency(reportData.totals.value / reportData.months.length)}
                  </p>
                  <p className="text-gray-600">
                    Avg Tons: {formatNumber(reportData.totals.tons / reportData.months.length)}
                  </p>
                  <p className="text-gray-600">
                    Avg Profit: {formatCurrency(reportData.totals.netProfit / reportData.months.length)}
                  </p>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <PieChart className="h-6 w-6 text-purple-600" />
                  Profit Margin
                </h3>
                <div>
                  <p className="text-3xl font-bold text-purple-600 mb-2">
                    {((reportData.totals.netProfit / reportData.totals.value) * 100).toFixed(2)}%
                  </p>
                  <p className="text-gray-600">
                    Margin: {formatCurrency(reportData.totals.margin)}
                  </p>
                  <p className="text-gray-600">
                    Total Expenses: {formatCurrency(reportData.totals.expenses)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
