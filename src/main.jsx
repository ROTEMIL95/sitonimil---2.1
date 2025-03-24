import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

// Using createRoot for concurrent mode rendering
const root = ReactDOM.createRoot(document.getElementById('root'));

// Measure LCP performance
const reportLCP = (metric) => {
  // You can send this to your analytics service
  console.log("LCP:", metric.value);
};

// Create performance observer to measure LCP
if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
  const lcpObserver = new PerformanceObserver((entryList) => {
    const entries = entryList.getEntries();
    const lcpEntry = entries[entries.length - 1];
    reportLCP(lcpEntry);
  });
  
  lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
}

// Immediate render for faster LCP
root.render(<App />); 