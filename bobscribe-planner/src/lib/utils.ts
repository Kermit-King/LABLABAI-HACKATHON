import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

export function getRiskColor(risk: 'low' | 'medium' | 'high'): string {
  switch (risk) {
    case 'low':
      return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'medium':
      return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    case 'high':
      return 'bg-red-500/20 text-red-400 border-red-500/30';
  }
}

export function getPriorityColor(priority: 'low' | 'medium' | 'high'): string {
  switch (priority) {
    case 'low':
      return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    case 'medium':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'high':
      return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
  }
}

// Made with Bob
