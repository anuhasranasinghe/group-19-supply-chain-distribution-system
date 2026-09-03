import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency', currency: 'LKR',
  }).format(amount);
}

export function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export function getStatusBadgeClass(status: string): string {
  const normalized = status.toLowerCase().replace(/\s+/g, '-');
  switch (normalized) {
    case 'pending': return 'badge badge-pending';
    case 'scheduled': return 'badge badge-scheduled';
    case 'delivered': case 'completed': return 'badge badge-delivered';
    case 'failed': case 'returned': return 'badge badge-failed';
    case 'in-progress': return 'badge badge-in-progress';
    default: return 'badge';
  }
}
