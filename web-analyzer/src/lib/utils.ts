import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatUrl(url: string): string {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return 'https://' + url
  }
  return url
}

export function validateUrl(url: string): boolean {
  try {
    const urlPattern = /^(https?:\/\/)?(([\da-z\.-]+)\.([a-z\.]{2,6})|localhost)(:[0-9]{1,5})?([\/?#].*)?$/i
    return urlPattern.test(url)
  } catch {
    return false
  }
}

export function getDomainFromUrl(url: string): string {
  try {
    const urlObj = new URL(formatUrl(url))
    return urlObj.hostname
  } catch {
    return url
  }
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function formatDuration(seconds: number): string {
  if (seconds < 1) {
    return `${Math.round(seconds * 1000)}ms`
  }
  return `${seconds.toFixed(2)}s`
}

export function getPerformanceColor(score: number): string {
  if (score >= 90) return 'green'
  if (score >= 70) return 'yellow'
  if (score >= 50) return 'orange'
  return 'red'
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}