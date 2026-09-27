// ==============================================================
// PLEADING SANITY — ENHANCED ERROR HANDLER v1.0-FINAL
// Cosmic-themed • Accessible • Retry Logic • Fallback UI
// Shields visitors from broken connections & API glitches
// ==============================================================

class PleadingSanityErrorHandler {
  constructor() {
    this.announcer = document.getElementById('announcements');
    this.retryAttempts = new Map();
    this.maxRetries = 3;
    this.baseRetryDelay = 1000;
  }

  // ==============================================
  // MAIN ENTRY POINT — call this from anywhere
  // ==============================================
  handleError(error, context = {}) {
    const errorInfo = this.parseError(error);
    const userMessage = this.getUserMessage(errorInfo, context);

    // Log for debugging
    console.error(`⚠️ PS Error [${context.component || 'Unknown'}]:`, error);

    // Announce to screen readers
    this.announceError(userMessage.screenReader);

    // Return ready-to-insert UI element
    return this.createErrorUI(userMessage, context, errorInfo);
  }

  // ==============================================
  // PARSE ERROR TYPE — figure out what went wrong
  // ==============================================
  parseError(error) {
    // Network / DNS / fetch failures
    if (
      error.name === 'NetworkError' ||
      error.code === 'ENOTFOUND' ||
      error.message?.includes('fetch') ||
      error.message?.includes('network')
    ) {
      return {
        type: 'network',
        message: 'Connection could not be established',
        recoverable: true,
        retryable: true
      };
    }

    // Too many requests
    if (error.status === 429 || error?.response?.status === 429) {
      const retryAfter =
        parseInt(error.headers?.['retry-after'] || error?.response?.headers?.['retry-after']) * 1000 || 60000;
      return {
        type: 'rateLimit',
        message: 'API rate limit reached',
        recoverable: true,
        retryable: true,
        retryAfter
      };
    }

    // Server-side errors
    const status = error.status || error?.response?.status || 0;
    if (status >= 500) {
      return {
        type: 'server',
        message: 'Cosmic server disturbance',
        recoverable: true,
        retryable: true
      };
    }

    // Auth / quota blocked
    if (status === 403 || status === 401) {
      return {
        type: 'authorization',
        message: 'Access limit reached or key invalid',
        recoverable: false,
        retryable: false
      };
    }

    // Not found
    if (status === 404) {
      return {
        type: 'notFound',
        message: 'Content drifted away',
        recoverable: false,
        retryable: false
      };
    }

    // Catch-all
    return {
      type: 'unknown',
      message: error.message || 'Unexpected cosmic disturbance',
      recoverable: true,
      retryable: true
    };
  }

  // ==============================================
  // USER-FRIENDLY MESSAGES — cosmic tone ✨
  // ==============================================
  getUserMessage(errorInfo, context) {
    const messages = {
      network: {
        title: '🌐 Connection Drifted',
        description: 'Your connection to the stars got interrupted. Check your internet and try again.',
        screenReader: 'Network connection lost. Please check your internet connection.',
        action: 'Reconnect'
      },
      rateLimit: {
        title: '⏱️ Cosmic Energy Peak',
        description: 'We\'re getting so much love right now! Take a breath and try again in a moment.',
        screenReader: 'Too many requests. Please wait before trying again.',
        action: 'Wait & Retry'
      },
      server: {
        title: '🛠️ Nebula Maintenance',
        description: 'Our cosmic servers are having a moment. Everything will be back stronger soon.',
        screenReader: 'Server error. Please try again in a few minutes.',
        action: 'Try Again'
      },
      authorization: {
        title: '🔐 Daily Quota Reached',
        description: 'We\'ve reached our view limit for today. Fresh content returns tomorrow — or browse our curated stories now.',
        screenReader: 'API quota exceeded. Curated content available immediately.',
        action: 'View Featured'
      },
      notFound: {
        title: '✨ Content Drifted Away',
        description: 'This piece of the cosmos couldn\'t be found. It may have moved or been updated.',
        screenReader: 'Content not found.',
        action: 'Return Home'
      },
      unknown: {
        title: '🌌 Something Shifted',
        description: 'An unexpected shift happened. Don\'t worry — we\'re watching the stars.',
        screenReader: 'An error occurred. Please try again.',
        action: 'Try Again'
      }
    };

    return messages[errorInfo.type] || messages.unknown;
  }

  // ==============================================
  // BUILD THE ERROR UI — ready to drop in
  // ==============================================
  createErrorUI(userMessage, context, errorInfo) {
    const container = document.createElement('div');
    container.className = 'error-container animate-fade-in';
    container.setAttribute('role', 'alert');
    container.setAttribute('aria-live', 'polite');
    container.setAttribute('aria-labelledby', 'error-title');
    container.setAttribute('aria-describedby', 'error-desc');

    container.innerHTML = `
      <div class="error-card">
        <h3 id="error-title" class="error-title">${userMessage.title}</h3>
        <p id="error-desc" class="error-desc">${userMessage.description}</p>
        
        <div class="error-buttons">
          ${errorInfo.retryable ? this.createRetryButton(context) : ''}
          ${this.createFallbackLinks(context, errorInfo)}
        </div>

        ${context.showDetails ? this.createTechDetails(errorInfo) : ''}
      </div>
    `;

    return container;
  }

  // ==============================================
  // RETRY BUTTON — exponential backoff built-in
  // ==============================================
  createRetryButton(context) {
    const component = context.component || 'global';
    const attempts = this.retryAttempts.get(component) || 0;

    if (attempts >= this.maxRetries) {
      return `<button class="btn btn-secondary" disabled>⏱️ Max attempts reached</button>`;
    }

    const delay = this.baseRetryDelay * (2 ** attempts);
    const label = attempts > 0 ? `Retry (${attempts + 1}/${this.maxRetries})` : userMessage?.action || 'Retry';

    return `
      <button class="btn btn-primary" 
              onclick="plsErrorHandler.retry('${component}', ${delay}${context.callback ? `, '${context.callback}'` : ''})">
        🔄 ${label}
      </button>
    `;
  }

  // ==============================================
  // FALLBACK LINKS — always give them somewhere to go
  // ==============================================
  createFallbackLinks(context, errorInfo) {
    const links = [];

    if (context.fallbackUrl) {
      links.push(`<a href="${context.fallbackUrl}" class="btn btn-secondary">📺 Featured Stories</a>`);
    }
    if (errorInfo.type === 'authorization' || errorInfo.type === 'notFound') {
      links.push(`<a href="/" class="btn btn-secondary">🏠 Return Home</a>`);
    }
    links.push(`<button class="btn btn-outline" onclick="location.reload()">🔄 Refresh</button>`);
    if (context.contactEmail) {
      links.push(`<a href="mailto:${context.contactEmail}?subject=Pleading%20Sanity%20Error" class="btn btn-outline">📧 Report</a>`);
    }

    return links.join('');
  }

  // ==============================================
  // TECH DETAILS — expandable for debugging
  // ==============================================
  createTechDetails(errorInfo) {
    return `
      <details class="tech-details">
        <summary>Technical Details</summary>
        <div class="tech-info">
          <p><strong>Type:</strong> ${errorInfo.type}</p>
          <p><strong>Message:</strong> ${errorInfo.message}</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString('en-GB', { timeZone: 'Europe/London' })}</p>
          <p><strong>Agent:</strong> ${navigator.userAgent.slice(0, 80)}…</p>
        </div>
      </details>
    `;
  }

  // ==============================================
  // RETRY EXECUTION — fires event for your code to catch
  // ==============================================
  retry(component, delay = 0, callbackName = null) {
    const attempts = this.retryAttempts.get(component) || 0;
    this.retryAttempts.set(component, attempts + 1);

    const execute = () => {
      // Reset if we succeeded
      document.dispatchEvent(new CustomEvent('ps-retry', {
        detail: { component, callbackName, attempt: attempts + 1 }
      }));
    };

    if (delay > 0) {
      setTimeout(execute, delay);
    } else {
      execute();
    }
  }

  // Reset counters — call when load succeeds
  resetRetries(component = 'global') {
    this.retryAttempts.delete(component);
  }

  // Screen reader announcement
  announceError(message) {
    if (this.announcer) {
      this.announcer.textContent = message;
    }
  }

  // ==============================================
  // GLOBAL CATCHER — catches everything uncaught
  // ==============================================
  setupGlobalHandlers() {
    // Unhandled fetch/promise errors
    window.addEventListener('unhandledrejection', (event) => {
      console.error('⚠️ Unhandled Rejection:', event.reason);
      this.announceError('Something shifted. Please refresh or try again.');
    });

    // Runtime JS errors
    window.addEventListener('error', (event) => {
      console.error('⚠️ Script Error:', event.error);
      this.announceError('A feature had trouble loading.');
    });
  }
}

// ==============================================
// INITIALIZE — ONE GLOBAL INSTANCE
// ==============================================
const plsErrorHandler = new PleadingSanityErrorHandler();
plsErrorHandler.setupGlobalHandlers();

// Export for modules
if (typeof module !== 'undefined') {
  module.exports = PleadingSanityErrorHandler;
}
