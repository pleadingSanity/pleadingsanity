// Pleading Sanity - Enhanced Error Handler
// Provides user-friendly error messages and recovery options

class PleasdingSanityErrorHandler {
  constructor() {
    this.announcer = document.getElementById('announcements');
    this.retryAttempts = new Map();
    this.maxRetries = 3;
    this.baseRetryDelay = 1000;
  }

  // Main error handling method
  handleError(error, context = {}) {
    const errorInfo = this.parseError(error);
    const userMessage = this.getUserMessage(errorInfo, context);
    
    // Log for debugging
    console.error(`PS Error [${context.component || 'Unknown'}]:`, error);
    
    // Announce to screen readers
    this.announceError(userMessage.screenReader);
    
    // Return formatted error UI
    return this.createErrorUI(userMessage, context, errorInfo);
  }

  // Parse different error types
  parseError(error) {
    if (error.name === 'NetworkError' || error.code === 'ENOTFOUND') {
      return {
        type: 'network',
        message: 'Network connection issue',
        recoverable: true,
        retryable: true
      };
    }
    
    if (error.status === 429) {
      return {
        type: 'rateLimit',
        message: 'Rate limit exceeded',
        recoverable: true,
        retryable: true,
        retryAfter: parseInt(error.headers?.['retry-after']) * 1000 || 60000
      };
    }
    
    if (error.status >= 500) {
      return {
        type: 'server',
        message: 'Server error',
        recoverable: true,
        retryable: true
      };
    }
    
    if (error.status === 403) {
      return {
        type: 'authorization',
        message: 'API quota exceeded or unauthorized',
        recoverable: false,
        retryable: false
      };
    }
    
    return {
      type: 'unknown',
      message: error.message || 'Unknown error occurred',
      recoverable: true,
      retryable: true
    };
  }

  // Get user-friendly messages
  getUserMessage(errorInfo, context) {
    const messages = {
      network: {
        title: '🌐 Connection Lost',
        description: 'Check your internet connection and try again.',
        screenReader: 'Network connection error. Please check your internet connection.',
        action: 'Retry Connection'
      },
      rateLimit: {
        title: '⏱️ Too Many Requests',
        description: 'We\'re getting lots of cosmic energy right now. Please wait a moment.',
        screenReader: 'Rate limit exceeded. Please wait before trying again.',
        action: 'Wait & Retry'
      },
      server: {
        title: '🛠️ Server Issues',
        description: 'Our cosmic servers are having a moment. We\'ll be back online soon.',
        screenReader: 'Server error. Please try again in a few minutes.',
        action: 'Try Again'
      },
      authorization: {
        title: '🔐 Access Limited',
        description: 'We\'ve hit our daily cosmic quota. Check back tomorrow for fresh content.',
        screenReader: 'API quota exceeded. New content will be available tomorrow.',
        action: 'Browse Offline Content'
      },
      unknown: {
        title: '❓ Something Went Wrong',
        description: 'An unexpected error occurred, but we\'re on it.',
        screenReader: 'An error occurred. Please try again or contact support.',
        action: 'Try Again'
      }
    };

    return messages[errorInfo.type] || messages.unknown;
  }

  // Create error UI component
  createErrorUI(userMessage, context, errorInfo) {
    const container = document.createElement('div');
    container.className = 'error-container animate-fade-in';
    container.setAttribute('role', 'alert');
    container.setAttribute('aria-labelledby', 'error-title');
    container.setAttribute('aria-describedby', 'error-description');
    
    container.innerHTML = `
      <div class="error-content">
        <h3 id="error-title" class="error-title">${userMessage.title}</h3>
        <p id="error-description" class="error-description">${userMessage.description}</p>
        
        <div class="error-actions">
          ${errorInfo.retryable ? this.createRetryButton(context) : ''}
          ${this.createFallbackActions(context)}
        </div>
        
        ${context.showDetails ? this.createErrorDetails(errorInfo) : ''}
      </div>
    `;

    return container;
  }

  // Create retry button with exponential backoff
  createRetryButton(context) {
    const retryKey = context.component || 'default';
    const attempts = this.retryAttempts.get(retryKey) || 0;
    
    if (attempts >= this.maxRetries) {
      return `
        <button class="btn btn-disabled" disabled>
          ⏱️ Max retries reached
        </button>
      `;
    }

    const delay = this.baseRetryDelay * Math.pow(2, attempts);
    
    return `
      <button class="btn btn-primary focus-ring" onclick="plsErrorHandler.retry('${retryKey}', ${delay})">
        🔄 Try Again ${attempts > 0 ? `(${attempts + 1}/${this.maxRetries})` : ''}
      </button>
    `;
  }

  // Create fallback action buttons
  createFallbackActions(context) {
    const actions = [];
    
    if (context.fallbackUrl) {
      actions.push(`
        <a href="${context.fallbackUrl}" class="btn btn-secondary">
          📺 Browse Offline Content
        </a>
      `);
    }
    
    if (context.contactEmail) {
      actions.push(`
        <a href="mailto:${context.contactEmail}?subject=Error Report" class="btn btn-outline">
          📧 Report Issue
        </a>
      `);
    }
    
    actions.push(`
      <button class="btn btn-outline" onclick="location.reload()">
        🔄 Refresh Page
      </button>
    `);

    return actions.join('');
  }

  // Create expandable error details
  createErrorDetails(errorInfo) {
    return `
      <details class="error-details">
        <summary>Technical Details</summary>
        <div class="error-tech-info">
          <p><strong>Error Type:</strong> ${errorInfo.type}</p>
          <p><strong>Message:</strong> ${errorInfo.message}</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <p><strong>User Agent:</strong> ${navigator.userAgent}</p>
        </div>
      </details>
    `;
  }

  // Handle retry with exponential backoff
  retry(component, delay = 0) {
    const attempts = this.retryAttempts.get(component) || 0;
    this.retryAttempts.set(component, attempts + 1);

    if (delay > 0) {
      setTimeout(() => {
        this.executeRetry(component);
      }, delay);
    } else {
      this.executeRetry(component);
    }
  }

  executeRetry(component) {
    // Emit retry event for components to listen to
    document.dispatchEvent(new CustomEvent('ps-retry', {
      detail: { component }
    }));
  }

  // Announce errors to screen readers
  announceError(message) {
    if (this.announcer) {
      this.announcer.textContent = message;
    }
  }

  // Reset retry counter for a component
  resetRetries(component) {
    this.retryAttempts.delete(component);
  }

  // Global error catcher
  setupGlobalHandlers() {
    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      this.announceError('An unexpected error occurred. The page may not function correctly.');
    });

    // Catch JavaScript errors
    window.addEventListener('error', (event) => {
      console.error('JavaScript error:', event.error);
      this.announceError('A script error occurred. Some features may not work correctly.');
    });
  }
}

// Initialize global error handler
const plsErrorHandler = new PleasdingSanityErrorHandler();
plsErrorHandler.setupGlobalHandlers();

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PleasdingSanityErrorHandler;
}