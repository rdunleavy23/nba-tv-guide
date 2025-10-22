'use client';

/**
 * Core Web Vitals monitoring for ScreenAssist
 * Tracks LCP, FID, CLS, and other performance metrics
 */

interface PerformanceMemory {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

interface WebVitalMetric {
  name: string;
  value: number;
  delta: number;
  id: string;
  navigationType: string;
}

interface PerformanceEntry {
  name: string;
  value: number;
  delta: number;
  id: string;
  navigationType: string;
}

// Core Web Vitals thresholds
const VITALS_THRESHOLDS = {
  LCP: 2500, // Largest Contentful Paint (ms)
  FID: 100,  // First Input Delay (ms)
  CLS: 0.1,  // Cumulative Layout Shift
  FCP: 1800, // First Contentful Paint (ms)
  TTFB: 800, // Time to First Byte (ms)
};

/**
 * Send performance data to analytics (placeholder for future implementation)
 */
function sendToAnalytics(metric: WebVitalMetric): void {
  // In production, this would send to your analytics service
  console.log('Performance metric:', metric);
  
  // Example: Google Analytics 4
  // gtag('event', metric.name, {
  //   value: Math.round(metric.value),
  //   event_category: 'Web Vitals',
  //   event_label: metric.id,
  //   non_interaction: true,
  // });
}

/**
 * Handle Core Web Vitals metrics
 */
function handleWebVital(metric: WebVitalMetric): void {
  const threshold = VITALS_THRESHOLDS[metric.name as keyof typeof VITALS_THRESHOLDS];
  
  if (threshold && metric.value > threshold) {
    console.warn(`Performance warning: ${metric.name} is ${metric.value}ms (threshold: ${threshold}ms)`);
  }
  
  sendToAnalytics(metric);
}

/**
 * Initialize Core Web Vitals monitoring
 */
export function initWebVitals(): void {
  if (typeof window === 'undefined') return;

  // Load web-vitals library dynamically to avoid bundle bloat
  import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
    getCLS(handleWebVital);
    getFID(handleWebVital);
    getFCP(handleWebVital);
    getLCP(handleWebVital);
    getTTFB(handleWebVital);
  }).catch((error) => {
    console.warn('Failed to load web-vitals:', error);
  });
}

/**
 * Measure custom performance metrics
 */
export function measureCustomMetric(name: string, startTime: number): void {
  const duration = performance.now() - startTime;
  
  const metric: PerformanceEntry = {
    name,
    value: duration,
    delta: duration,
    id: `${name}-${Date.now()}`,
    navigationType: 'navigate',
  };
  
  sendToAnalytics(metric);
}

/**
 * Performance budget checker
 */
export function checkPerformanceBudget(): {
  passed: boolean;
  violations: string[];
  recommendations: string[];
} {
  const violations: string[] = [];
  const recommendations: string[] = [];
  
  // Check bundle size (estimated)
  const scripts = document.querySelectorAll('script[src]');
  let totalScriptSize = 0;
  
  scripts.forEach(script => {
    const src = script.getAttribute('src');
    if (src && !src.includes('web-vitals')) {
      // Estimate size based on URL patterns
      if (src.includes('_next/static')) {
        totalScriptSize += 50000; // ~50KB per chunk
      }
    }
  });
  
  if (totalScriptSize > 200000) { // 200KB budget
    violations.push(`Script bundle size estimated at ${Math.round(totalScriptSize / 1000)}KB (budget: 200KB)`);
    recommendations.push('Consider code splitting and lazy loading');
  }
  
  // Check for render-blocking resources
  const blockingStyles = document.querySelectorAll('link[rel="stylesheet"]:not([media="print"])');
  if (blockingStyles.length > 2) {
    violations.push(`${blockingStyles.length} render-blocking stylesheets detected`);
    recommendations.push('Inline critical CSS and defer non-critical styles');
  }
  
  // Check for large images
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    const naturalWidth = img.naturalWidth;
    const naturalHeight = img.naturalHeight;
    if (naturalWidth > 1920 || naturalHeight > 1080) {
      violations.push(`Large image detected: ${naturalWidth}x${naturalHeight}px`);
      recommendations.push('Optimize images for mobile viewports');
    }
  });
  
  return {
    passed: violations.length === 0,
    violations,
    recommendations,
  };
}

/**
 * Get performance summary for debugging
 */
export function getPerformanceSummary(): {
  navigation: PerformanceNavigationTiming | null;
  memory: PerformanceMemory | null;
  budget: ReturnType<typeof checkPerformanceBudget>;
} {
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  const memory = (performance as Performance & { memory?: PerformanceMemory }).memory || null;
  
  return {
    navigation,
    memory,
    budget: checkPerformanceBudget(),
  };
}
