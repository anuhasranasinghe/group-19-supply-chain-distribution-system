// ============================================================
// Report Utility Functions & Chart Themes
// ============================================================

export function exportToCsv(filename: string, rows: Record<string, any>[]) {
  if (!rows || rows.length === 0) return;

  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      headers
        .map((header) => {
          let val = row[header];
          if (val === null || val === undefined) val = '';
          const str = String(val).replace(/"/g, '""');
          return `"${str}"`;
        })
        .join(',')
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToPdf(reportName: string) {
  const originalTitle = document.title;
  document.title = `Kandypack_${reportName.replace(/\s+/g, '_')}_Report`;
  window.print();
  document.title = originalTitle;
}

// Chart theme configurations matching the dark UI
export const chartTooltipStyle = {
  backgroundColor: '#1e293b',
  borderColor: '#334155',
  borderRadius: '0.5rem',
  color: '#f1f5f9',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.4)',
};

export const CHART_COLORS = [
  '#6366f1', // Brand Indigo
  '#22c55e', // Emerald
  '#3b82f6', // Sky Blue
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#8b5cf6', // Purple
  '#14b8a6', // Teal
  '#f97316', // Orange
];
