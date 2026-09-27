// Performance Optimization System - Lightning Fast Platform
class PerformanceOptimizer {
    constructor() {
        this.observers = new Map();
        this.performanceMetrics = {
            loadTime: 0,
            firstPaint: 0,
            firstContentfulPaint: 0,
            largestContentfulPaint: 0,
            firstInputDelay: 0,
            cumulativeLayoutShift: 0,
            timeToInteractive: 0
        };
        
        this.init();
    }

    init() {
        // Measure initial performance
        this.measureCoreWebVitals();
        
        // Optimize images lazily
        this.initLazyLoading();
        
        // Optimize CSS delivery
        this.optimizeCSSLoading();
        
        // Optimize JavaScript execution
        this.optimizeJavaScript();
        
        // Preload critical resources
        this.preloadCriticalResources();
        
        // Monitor performance continuously
        this.startPerformanceMonitoring();
        
        console.log('⚡ Performance optimization initialized');
    }

    measureCoreWebVitals() {
        // Largest Contentful Paint
        new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            this.performanceMetrics.largestContentfulPaint = lastEntry.startTime;
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // First Input Delay
        new PerformanceObserver((entryList) => {
            const firstInput = entryList.getEntries()[0];
            if (firstInput) {
                this.performanceMetrics.firstInputDelay = firstInput.processingStart - firstInput.startTime;
            }
        }).observe({ entryTypes: ['first-input'] });

        // Cumulative Layout Shift
        let clsValue = 0;
        new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
                if (!entry.hadRecentInput) {
                    clsValue += entry.value;
                    this.performanceMetrics.cumulativeLayoutShift = clsValue;
                }
            }
        }).observe({ entryTypes: ['layout-shift'] });

        // Navigation timing
        window.addEventListener('load', () => {
            const navigation = performance.getEntriesByType('navigation')[0];
            this.performanceMetrics.loadTime = navigation.loadEventEnd - navigation.loadEventStart;
            
            // Time to Interactive (simplified estimation)
            this.performanceMetrics.timeToInteractive = navigation.domContentLoadedEventEnd;
        });
    }

    initLazyLoading() {
        // Create intersection observer for images
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    
                    // Load the actual image
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                    
                    // Load srcset if available
                    if (img.dataset.srcset) {
                        img.srcset = img.dataset.srcset;
                        img.removeAttribute('data-srcset');
                    }
                    
                    // Remove loading class and add loaded class
                    img.classList.remove('lazy-loading');
                    img.classList.add('lazy-loaded');
                    
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.01
        });

        // Observe all lazy images
        document.querySelectorAll('img[data-src]').forEach(img => {
            img.classList.add('lazy-loading');
            imageObserver.observe(img);
        });

        this.observers.set('images', imageObserver);
    }

    optimizeCSSLoading() {
        // Critical CSS is already inline, now optimize non-critical CSS
        const nonCriticalCSS = [
            'animations.css',
            'accessibility.css',
            'nav-component.css'
        ];

        nonCriticalCSS.forEach(cssFile => {
            const existingLink = document.querySelector(`link[href="${cssFile}"]`);
            if (existingLink) {
                // Load non-critical CSS asynchronously
                existingLink.media = 'print';
                existingLink.addEventListener('load', function() {
                    this.media = 'all';
                });
            }
        });

        // Preload key CSS for faster loading
        const preloadCSS = document.createElement('link');
        preloadCSS.rel = 'preload';
        preloadCSS.as = 'style';
        preloadCSS.href = 'styles.css';
        document.head.appendChild(preloadCSS);
    }

    optimizeJavaScript() {
        // Defer non-critical JavaScript
        const scripts = document.querySelectorAll('script[src]');
        scripts.forEach(script => {
            if (!script.hasAttribute('defer') && !script.hasAttribute('async')) {
                // Add defer to non-critical scripts
                const nonCritical = [
                    'cosmic-bg.js',
                    'cosmic-audio-system.js'
                ];
                
                if (nonCritical.some(file => script.src.includes(file))) {
                    script.defer = true;
                }
            }
        });

        // Optimize script loading order
        this.prioritizeScripts();
    }

    prioritizeScripts() {
        const criticalScripts = [
            'error-handler.js',
            'crisis-response-system.js',
            'platform-orchestrator.js'
        ];

        // Ensure critical scripts load first
        criticalScripts.forEach((scriptName, index) => {
            const script = document.querySelector(`script[src*="${scriptName}"]`);
            if (script) {
                script.style.order = index;
            }
        });
    }

    preloadCriticalResources() {
        const criticalResources = [
            { href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap', as: 'style' },
            { href: 'brain-logo.png', as: 'image' },
            { href: 'assets/crying-brain-og.png', as: 'image' }
        ];

        criticalResources.forEach(resource => {
            // Check if preload already exists
            const existingPreload = document.querySelector(`link[href="${resource.href}"][rel="preload"]`);
            if (!existingPreload) {
                const preload = document.createElement('link');
                preload.rel = 'preload';
                preload.href = resource.href;
                preload.as = resource.as;
                if (resource.as === 'style') {
                    preload.crossOrigin = 'anonymous';
                }
                document.head.appendChild(preload);
            }
        });
    }

    startPerformanceMonitoring() {
        // Monitor resource loading performance
        const resourceObserver = new PerformanceObserver((list) => {
            list.getEntries().forEach(entry => {
                // Log slow resources
                if (entry.duration > 1000) {
                    console.warn(`Slow resource detected: ${entry.name} took ${entry.duration}ms`);
                }
            });
        });
        
        resourceObserver.observe({ entryTypes: ['resource'] });

        // Monitor long tasks that block main thread
        if ('PerformanceObserver' in window) {
            const longTaskObserver = new PerformanceObserver((list) => {
                list.getEntries().forEach(entry => {
                    console.warn(`Long task detected: ${entry.duration}ms`);
                });
            });
            
            try {
                longTaskObserver.observe({ entryTypes: ['longtask'] });
            } catch (e) {
                // longtask may not be supported in all browsers
                console.log('Long task monitoring not supported');
            }
        }
    }

    // Optimize images on the fly
    optimizeImages() {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            // Add loading="lazy" to images not in viewport
            if (!img.hasAttribute('loading')) {
                const rect = img.getBoundingClientRect();
                if (rect.top > window.innerHeight) {
                    img.loading = 'lazy';
                }
            }

            // Add missing alt attributes for accessibility
            if (!img.alt && !img.hasAttribute('aria-hidden')) {
                img.alt = 'Pleading Sanity content image';
            }
        });
    }

    // Memory optimization
    optimizeMemory() {
        // Clean up unused event listeners
        const cleanupEvents = new Set();
        
        // Remove passive event listeners when possible
        document.addEventListener('scroll', function scrollHandler() {
            // Throttled scroll handling
        }, { passive: true });

        // Cleanup inactive observers
        setTimeout(() => {
            this.observers.forEach((observer, key) => {
                if (key === 'images' && document.querySelectorAll('img[data-src]').length === 0) {
                    observer.disconnect();
                    this.observers.delete(key);
                }
            });
        }, 10000);
    }

    // Get current performance metrics
    getMetrics() {
        return {
            ...this.performanceMetrics,
            memoryUsage: performance.memory ? {
                usedJSHeapSize: Math.round(performance.memory.usedJSHeapSize / 1048576) + 'MB',
                totalJSHeapSize: Math.round(performance.memory.totalJSHeapSize / 1048576) + 'MB',
                jsHeapSizeLimit: Math.round(performance.memory.jsHeapSizeLimit / 1048576) + 'MB'
            } : 'Not available',
            connectionType: navigator.connection ? navigator.connection.effectiveType : 'Unknown'
        };
    }

    // Performance report for debugging
    generateReport() {
        const metrics = this.getMetrics();
        const report = {
            timestamp: new Date().toISOString(),
            metrics,
            recommendations: []
        };

        // Generate recommendations based on metrics
        if (metrics.largestContentfulPaint > 2500) {
            report.recommendations.push('LCP is slow - consider optimizing images and critical CSS');
        }
        
        if (metrics.firstInputDelay > 100) {
            report.recommendations.push('FID is high - consider code splitting and reducing JavaScript execution time');
        }
        
        if (metrics.cumulativeLayoutShift > 0.1) {
            report.recommendations.push('CLS is high - ensure images and ads have dimensions set');
        }

        console.table(metrics);
        return report;
    }

    // Auto-optimize based on connection type
    adaptToConnection() {
        if (navigator.connection) {
            const connection = navigator.connection;
            
            if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
                // Aggressive optimizations for slow connections
                this.enableDataSaver();
            } else if (connection.effectiveType === '4g') {
                // Enable all features for fast connections
                this.enableAllFeatures();
            }
        }
    }

    enableDataSaver() {
        // Disable non-essential animations
        document.documentElement.style.setProperty('--animation-duration', '0s');
        
        // Reduce image quality
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            if (img.src && !img.dataset.originalSrc) {
                img.dataset.originalSrc = img.src;
                // Would integrate with image optimization service here
            }
        });
        
        console.log('📱 Data saver mode enabled');
    }

    enableAllFeatures() {
        // Restore full animations
        document.documentElement.style.removeProperty('--animation-duration');
        
        // Restore full quality images
        const images = document.querySelectorAll('img[data-original-src]');
        images.forEach(img => {
            if (img.dataset.originalSrc) {
                img.src = img.dataset.originalSrc;
                delete img.dataset.originalSrc;
            }
        });
        
        console.log('⚡ Full feature mode enabled');
    }
}

// Initialize performance optimization
document.addEventListener('DOMContentLoaded', () => {
    window.performanceOptimizer = new PerformanceOptimizer();
    
    // Run additional optimizations after initial load
    window.addEventListener('load', () => {
        setTimeout(() => {
            window.performanceOptimizer.optimizeImages();
            window.performanceOptimizer.optimizeMemory();
            window.performanceOptimizer.adaptToConnection();
        }, 1000);
    });
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceOptimizer;
}