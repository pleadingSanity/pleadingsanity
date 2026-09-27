# Security Policy

## Supported Versions

We take security seriously at Pleading Sanity, especially given the sensitive nature of mental health data.

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Mental Health Data Security

Given the sensitive nature of mental health information, we implement additional security measures:

- **Local-first storage**: Chat histories and journal entries stored locally by default
- **Encryption**: All sensitive data encrypted before storage
- **No tracking**: No user tracking without explicit consent
- **Crisis protocols**: Special handling for crisis-related communications

## Reporting a Vulnerability

### Security Issues
If you discover a security vulnerability, please report it responsibly:

1. **Email**: security@pleadingsanity.co.uk
2. **Subject**: "Security Vulnerability Report"
3. **Include**: 
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact (especially on mental health data)
   - Suggested fix (if any)

### Response Timeline
- **Initial response**: Within 24 hours
- **Triage**: Within 48 hours
- **Fix deployment**: Within 7 days for critical issues
- **Public disclosure**: After fix is deployed and users have time to update

### Mental Health Crisis Issues
If you discover issues that could impact users in crisis:

1. **Immediate report**: Contact us immediately via multiple channels
2. **Priority handling**: These issues receive highest priority
3. **Emergency fixes**: Deployed within hours if necessary

## Security Measures

### Technical Security
- HTTPS everywhere
- Content Security Policy (CSP)
- Secure headers
- Input sanitization
- XSS protection
- CSRF protection

### Data Protection
- **GDPR compliance** for EU users
- **HIPAA considerations** for US users
- **Local storage preferred** over cloud storage
- **Easy data deletion** mechanisms
- **Minimal data collection**

### Crisis Safety
- **Crisis detection** algorithms
- **Emergency contact** systems
- **Professional resource** integration
- **Safe communication** channels

## Responsible Disclosure

### What We Commit To
- Acknowledge receipt within 24 hours
- Provide regular updates on progress
- Credit researchers (if desired)
- No legal action for good-faith research
- Rapid response for mental health-related issues

### What We Ask
- Report vulnerabilities privately first
- Allow reasonable time for fixes
- Consider mental health impact in testing
- Avoid accessing user data unnecessarily

## Security Best Practices for Contributors

### Code Security
- Use secure coding practices
- Validate all inputs
- Sanitize outputs
- Use parameterized queries
- Implement proper error handling

### Mental Health Data
- **Minimize collection**: Only collect what's absolutely necessary
- **Secure transmission**: Always use HTTPS
- **Local storage**: Prefer client-side storage
- **User control**: Users should own their data
- **Crisis handling**: Special protocols for crisis situations

### Testing Security
- Regular security audits
- Penetration testing
- Dependency scanning
- Code analysis
- Mental health scenario testing

## Incident Response

### Detection
- Automated monitoring
- User reports
- Security audits
- Community reports

### Response
1. **Immediate containment**
2. **Impact assessment**
3. **User notification** (if required)
4. **Fix implementation**
5. **Post-incident review**

### Communication
- Clear, honest communication
- Regular updates
- Post-mortem sharing
- Lessons learned

## Contact Information

### Primary Contact
- **Email**: security@pleadingsanity.co.uk
- **Response time**: 24 hours

### Emergency Contact
For critical vulnerabilities affecting user safety:
- **Priority email**: emergency@pleadingsanity.co.uk
- **Response time**: 4 hours

### Community
- **GitHub Issues**: For non-sensitive security discussions
- **Discussions**: For security best practices

---

**Remember**: Mental health data security isn't just about compliance - it's about protecting vulnerable people during their most difficult moments. Every security measure we implement could be protecting someone's life.

Thank you for helping us keep our community safe. 🛡️💜