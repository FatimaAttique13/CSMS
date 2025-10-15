import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Validate file type
    const fileType = file.name.split('.').pop()?.toLowerCase();
    if (!['xlsx', 'xls', 'csv'].includes(fileType || '')) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload .xlsx, .xls, or .csv file' },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    // Read file buffer
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });

    // Get first sheet
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

    // Parse report data
    const reportData = parseReportData(jsonData);

    return NextResponse.json(reportData);
  } catch (error) {
    console.error('Error processing file:', error);
    return NextResponse.json(
      { error: 'Failed to process file. Please ensure the file format is correct.' },
      { status: 500 }
    );
  }
}

function parseReportData(data: any[][]) {
  // Find the title row (typically first non-empty row)
  let title = 'Annual Report';
  let year = new Date().getFullYear();
  
  // Try to extract title and year from first few rows
  for (let i = 0; i < Math.min(3, data.length); i++) {
    const row = data[i];
    if (row && row[0]) {
      const cellValue = String(row[0]).trim();
      if (cellValue.toLowerCase().includes('cement') || cellValue.toLowerCase().includes('report')) {
        title = cellValue;
        // Try to extract year from title
        const yearMatch = cellValue.match(/\b(20\d{2})\b/);
        if (yearMatch) {
          year = parseInt(yearMatch[1]);
        }
      }
    }
  }

  // Find header row (contains "Months", "Value", etc.)
  let headerRowIndex = -1;
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (row && row.some((cell: any) => 
      cell && String(cell).toLowerCase().includes('month')
    )) {
      headerRowIndex = i;
      break;
    }
  }

  if (headerRowIndex === -1) {
    throw new Error('Could not find header row in the file');
  }

  // Get headers
  const headers = data[headerRowIndex].map((h: any) => String(h).trim().toLowerCase());
  
  // Map column indices
  const columnMap: { [key: string]: number } = {};
  headers.forEach((header: string, index: number) => {
    if (header.includes('month')) columnMap.month = index;
    if (header.includes('value') || header.includes('sales')) columnMap.value = index;
    if (header.includes('ton')) columnMap.tons = index;
    if (header.includes('cost')) columnMap.costOfSales = index;
    if (header.includes('transport')) columnMap.transport = index;
    if (header.includes('margin')) columnMap.margin = index;
    if (header.includes('a/gm') || header.includes('avgm')) columnMap.avgPerTon = index;
    if (header.includes('expense')) columnMap.expenses = index;
    if (header.includes('net') || header.includes('profit')) columnMap.netProfit = index;
  });

  // Parse monthly data
  const months: any[] = [];
  const totals = {
    value: 0,
    tons: 0,
    costOfSales: 0,
    transport: 0,
    margin: 0,
    expenses: 0,
    netProfit: 0,
  };

  for (let i = headerRowIndex + 1; i < data.length; i++) {
    const row = data[i];
    if (!row || !row[columnMap.month]) continue;

    const monthName = String(row[columnMap.month]).trim();
    
    // Skip total rows
    if (monthName.toLowerCase().includes('total')) {
      continue;
    }

    // Skip empty rows
    if (!monthName || monthName === '') continue;

    const monthData = {
      month: monthName,
      value: parseFloat(row[columnMap.value]) || 0,
      tons: parseFloat(row[columnMap.tons]) || 0,
      costOfSales: parseFloat(row[columnMap.costOfSales]) || 0,
      transport: parseFloat(row[columnMap.transport]) || 0,
      margin: parseFloat(row[columnMap.margin]) || 0,
      avgPerTon: parseFloat(row[columnMap.avgPerTon]) || 0,
      expenses: parseFloat(row[columnMap.expenses]) || 0,
      netProfit: parseFloat(row[columnMap.netProfit]) || 0,
    };

    months.push(monthData);

    // Add to totals
    totals.value += monthData.value;
    totals.tons += monthData.tons;
    totals.costOfSales += monthData.costOfSales;
    totals.transport += monthData.transport;
    totals.margin += monthData.margin;
    totals.expenses += monthData.expenses;
    totals.netProfit += monthData.netProfit;
  }

  if (months.length === 0) {
    throw new Error('No valid monthly data found in the file');
  }

  return {
    title,
    year,
    months,
    totals,
  };
}

export const config = {
  api: {
    bodyParser: false,
  },
};
