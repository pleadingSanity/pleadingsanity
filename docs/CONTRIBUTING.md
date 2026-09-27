# Pleading Sanity - Contributing Guide

Thank you for your interest in contributing to Pleading Sanity! This project aims to provide accessible mental health support through technology, and we welcome contributions that align with this mission.

## 🧠 Code of Conduct

### Our Commitment
We are committed to creating a safe, inclusive environment for everyone, especially those dealing with mental health challenges.

### Guidelines
- **Be respectful and empathetic** in all interactions
- **Consider mental health sensitivities** in discussions and code
- **Use inclusive language** that doesn't stigmatize mental health
- **Respect privacy** and confidentiality in all contexts
- **Avoid triggering content** without appropriate warnings

### Unacceptable Behavior
- Stigmatizing language about mental health
- Sharing personal mental health information without consent
- Dismissing or minimizing mental health experiences
- Any form of harassment or discrimination

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm
- Git knowledge
- Understanding of mental health considerations
- Familiarity with accessibility guidelines

### Development Setup

```bash
# Fork and clone the repository
git clone https://github.com/yourusername/pleadingsanity.git
cd pleadingsanity

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```

## 🛠️ Types of Contributions

### 🐛 Bug Reports
- Use the bug report template
- Include steps to reproduce
- Consider mental health impact of bugs
- Test in accessibility tools

### ✨ Feature Requests
- Use the feature request template
- Explain mental health benefits
- Consider accessibility implications
- Provide user stories

### 🔧 Code Contributions
- Follow coding standards
- Include comprehensive tests
- Ensure accessibility compliance
- Document mental health considerations

### 📚 Documentation
- Improve existing docs
- Add accessibility guides
- Create mental health resources
- Update API documentation

## 📋 Pull Request Process

### Before Submitting

1. **Check existing issues** for duplicates
2. **Run tests**: `npm test`
3. **Check accessibility**: Use screen readers, keyboard navigation
4. **Test mental health features** carefully and sensitively
5. **Update documentation** as needed

### Pull Request Template

```markdown
## Description
Brief description of changes

## Mental Health Impact
How does this change affect user mental health experience?

## Accessibility
- [ ] Tested with screen reader
- [ ] Keyboard navigation works
- [ ] Color contrast verified
- [ ] Focus management correct

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No sensitive data exposed
```

### Review Process

1. **Automated checks** must pass
2. **Accessibility review** by maintainers
3. **Mental health sensitivity** review
4. **Code quality** assessment
5. **Community feedback** period

## 🎨 Design Guidelines

### Visual Design
- **Calming color palette**: Cyan (#00fff0) and Magenta (#ff00ff)
- **High contrast** for accessibility
- **Smooth animations** with reduced motion options
- **Clean, uncluttered** layouts

### UX Principles
- **Trauma-informed design**
- **Crisis-aware interactions**
- **Privacy by design**
- **Inclusive accessibility**
- **Clear mental health pathways**

## ♿ Accessibility Standards

### WCAG 2.1 AA Compliance
- **Perceivable**: Alt text, captions, color contrast
- **Operable**: Keyboard navigation, seizure safety
- **Understandable**: Clear language, consistent navigation
- **Robust**: Screen reader compatibility, semantic HTML

### Testing Requirements
- **Screen readers**: NVDA, JAWS, VoiceOver
- **Keyboard only** navigation
- **High contrast mode** compatibility
- **Zoom up to 200%** without horizontal scrolling

## 🧪 Testing Guidelines

### Test Categories

#### Unit Tests
```bash
npm run test:unit
```
- Component functionality
- Utility functions
- Data processing

#### Integration Tests
```bash
npm run test:integration
```
- API interactions
- Service integrations
- User workflows

#### Accessibility Tests
```bash
npm run test:a11y
```
- Screen reader compatibility
- Keyboard navigation
- Color contrast
- Focus management

#### Mental Health Feature Tests
- Crisis intervention pathways
- Privacy protection
- Sensitive content handling
- Emergency contact systems

## 🔒 Security & Privacy

### Data Handling
- **Local storage first** - minimize external data transfer
- **Encryption** for sensitive data
- **No tracking** without explicit consent
- **GDPR compliance** for EU users

### Mental Health Data
- **Extra protection** for mental health information
- **Clear consent** for any data collection
- **Easy deletion** of personal data
- **Crisis data** handled with special care

## 📚 Resources for Contributors

### Mental Health Resources
- [Mental Health First Aid](https://www.mentalhealthfirstaid.org/)
- [Trauma-Informed Design Principles](https://traumainformeddesign.org/)
- [Crisis Text Line](https://www.crisistextline.org/)

### Accessibility Resources
- [WebAIM](https://webaim.org/)
- [WAVE Web Accessibility Evaluator](https://wave.webaim.org/)
- [axe DevTools](https://www.deque.com/axe/devtools/)

### Development Resources
- [MDN Web Docs](https://developer.mozilla.org/)
- [React Accessibility Guide](https://reactjs.org/docs/accessibility.html)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)

## 🏷️ Issue and PR Labels

### Priority
- `critical` - Security, crisis features, accessibility blockers
- `high` - Major features, significant bugs
- `medium` - Enhancements, minor bugs
- `low` - Nice-to-have improvements

### Type
- `bug` - Something is broken
- `feature` - New functionality
- `accessibility` - A11y improvements
- `mental-health` - Mental health specific features
- `security` - Security improvements
- `documentation` - Docs updates

### Status
- `needs-review` - Ready for review
- `in-progress` - Being worked on
- `blocked` - Waiting for something
- `ready-to-merge` - Approved and ready

## 💝 Recognition

### Contributors
All contributors will be recognized in our README and release notes.

### Special Recognition
- **Mental health advocates** who provide guidance
- **Accessibility experts** who ensure inclusive design
- **Crisis counselors** who review sensitive features
- **Community members** who provide feedback

## 📞 Getting Help

### Community Support
- **GitHub Discussions** for general questions
- **Issue tracker** for bugs and features
- **Discord server** for real-time chat (coming soon)

### Mental Health Support
If contributing to this project affects your mental health:
- Take breaks as needed
- Reach out for support
- Contact crisis resources if needed
- Your wellbeing comes first

### Technical Support
- Check existing issues and discussions
- Provide detailed information
- Include system details
- Test in multiple environments

## 🌟 Our Values

1. **Mental health comes first** - always
2. **Accessibility is not optional** - it's essential
3. **Privacy and security** - by design, not afterthought
4. **Inclusive community** - everyone belongs here
5. **Quality over speed** - we build it right
6. **Transparency and openness** - in everything we do

---

Thank you for helping us build a platform that truly supports mental health and wellness. Together, we can help people rise from madness and find their path to healing. 💜