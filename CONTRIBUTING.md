# Contributing to RootCause Performance Detective

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone <your-fork-url>`
3. Create a feature branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test your changes thoroughly
6. Commit with clear messages: `git commit -m "Add: description of your changes"`
7. Push to your fork: `git push origin feature/your-feature-name`
8. Open a Pull Request

## Development Setup

```bash
# Clone the repository
git clone <repo-url>
cd Extenction

# Install the extension (if needed)
./scripts/install.sh

# Load in Chrome
# 1. Go to chrome://extensions/
# 2. Enable Developer mode
# 3. Click "Load unpacked"
# 4. Select this directory
```

## Code Style

- Use clear, descriptive variable and function names
- Add comments for complex logic
- Keep functions focused and modular
- Follow existing code patterns in the project

## Testing

Before submitting a PR:

1. Test the extension on multiple websites
2. Verify all features work as expected
3. Check browser console for errors
4. Test with different performance scenarios

See [docs/TESTING.md](docs/TESTING.md) for detailed testing guidelines.

## Commit Messages

Use clear commit messages:
- `Add: [feature description]` - for new features
- `Fix: [bug description]` - for bug fixes
- `Update: [what was updated]` - for updates
- `Refactor: [what was refactored]` - for refactoring
- `Docs: [documentation changes]` - for documentation

## Pull Request Process

1. Ensure your code follows the project style
2. Update documentation if needed
3. Add a clear description of your changes
4. Reference any related issues
5. Wait for review and address feedback

## Areas for Contribution

- **New Analysis Features**: Add new performance metrics or insights
- **UI Improvements**: Enhance the DevTools panel interface
- **Browser Support**: Improve cross-browser compatibility
- **Documentation**: Improve guides, tutorials, or code comments
- **Bug Fixes**: Fix reported issues
- **Performance**: Optimize the extension itself

## Questions?

Feel free to open an issue for:
- Bug reports
- Feature requests
- Questions about the codebase
- Discussion of major changes

## Code of Conduct

Be respectful, constructive, and professional in all interactions.
