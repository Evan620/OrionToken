import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format currency
export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return "$0";
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(amount);
}

// Format percentage
export function formatPercentage(value: number | null | undefined): string {
  if (value === null || value === undefined) return "0%";
  return `${value}%`;
}

// Asset type to icon mapping
export function getAssetTypeIcon(type: string): string {
  switch (type) {
    case 'real_estate':
      return 'apartment';
    case 'invoice':
      return 'receipt';
    case 'equipment':
      return 'precision_manufacturing';
    default:
      return 'token';
  }
}

// Blockchain to icon mapping
export function getBlockchainIcon(blockchain: string): string {
  switch (blockchain) {
    case 'ethereum':
      return 'https://cryptologos.cc/logos/ethereum-eth-logo.png';
    case 'polygon':
      return 'https://cryptologos.cc/logos/polygon-matic-logo.png';
    default:
      return '';
  }
}

// Asset status to badge style mapping
export function getStatusBadgeStyle(status: string): { bg: string; text: string } {
  switch (status) {
    case 'active':
      return { bg: 'bg-success/10', text: 'text-success' };
    case 'pending':
      return { bg: 'bg-warning/10', text: 'text-warning' };
    case 'compliance_issue':
      return { bg: 'bg-error/10', text: 'text-error' };
    case 'draft':
      return { bg: 'bg-gray-200 dark:bg-gray-700', text: 'text-gray-700 dark:text-gray-300' };
    default:
      return { bg: 'bg-gray-200 dark:bg-gray-700', text: 'text-gray-700 dark:text-gray-300' };
  }
}

// Liquidity to badge style mapping
export function getLiquidityBadgeStyle(liquidity: string): { bg: string; text: string } {
  switch (liquidity) {
    case 'high':
      return { bg: 'bg-success/10', text: 'text-success' };
    case 'medium':
      return { bg: 'bg-warning/10', text: 'text-warning' };
    case 'low':
      return { bg: 'bg-error/10', text: 'text-error' };
    default:
      return { bg: 'bg-gray-200 dark:bg-gray-700', text: 'text-gray-700 dark:text-gray-300' };
  }
}

// Truncate text with ellipsis
export function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
}

// Truncate middle of text (e.g. for blockchain addresses)
export function truncateMiddle(text: string, startChars: number = 6, endChars: number = 4): string {
  if (!text) return '';
  return text.length > startChars + endChars
    ? `${text.substring(0, startChars)}...${text.substring(text.length - endChars)}`
    : text;
}

// Format date string
export function formatDate(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// Calculate time ago
export function timeAgo(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + ' years ago';
  
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + ' months ago';
  
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + ' days ago';
  
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + ' hours ago';
  
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + ' minutes ago';
  
  return Math.floor(seconds) + ' seconds ago';
}

// Group assets by type
export function groupAssetsByType(assets: any[]): Record<string, any[]> {
  const grouped: Record<string, any[]> = {
    real_estate: [],
    invoice: [],
    equipment: []
  };
  
  assets.forEach(asset => {
    if (grouped[asset.type]) {
      grouped[asset.type].push(asset);
    }
  });
  
  return grouped;
}

// Calculate total portfolio value
export function calculateTotalValue(assets: any[]): number {
  return assets.reduce((total, asset) => total + (asset.value || 0), 0);
}

// Calculate total tokenized value
export function calculateTokenizedValue(assets: any[]): number {
  return assets.reduce((total, asset) => total + (asset.tokenizedValue || 0), 0);
}
