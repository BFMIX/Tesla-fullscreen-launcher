# Contributing

Help make Tesla Fullscreen Launcher better for Tesla owners. Feedback from real vehicles, clear bug reports and small improvements are all welcome.

## Report a Problem

Use the [bug report form](https://github.com/BFMIX/Tesla-fullscreen-launcher/issues/new?template=bug_report.yml). Describe what you tried, what happened and what you expected. Include your Tesla software version and screen or MCU information if known.

Never include passwords, cookies, account details, vehicle identification numbers or private website links. Screenshots are optional; remove personal information before sharing.

## Suggest an Improvement

Use the [idea form](https://github.com/BFMIX/Tesla-fullscreen-launcher/issues/new?template=idea.yml). Explain the user problem first. The project favors a simple, one-screen, touch-first experience and performance on MCU2.

Feature additions and changes to the approved interface need discussion before implementation.

## Contribute Code

1. Discuss the change in an issue and keep the scope small.
2. Fork the repository and create a branch for your change.
3. Test both themes, touch interactions and shorter screen heights. If you have access to a Tesla, test there too.
4. Open a pull request describing the problem, the change and what you actually tested. State clearly when testing was browser-only.

Use English for code, identifiers, filenames and commit messages. Follow the existing HTML, CSS and vanilla JavaScript patterns. Avoid new frameworks, build tooling or dependencies unless agreed in advance. Do not add tracking, user accounts or an application backend.

## Before Opening a Pull Request

- Check that `index.html` opens and relative asset paths work on GitHub Pages.
- Verify that controls remain usable without hover, a keyboard or clipboard access.
- Run `node --check app.js` if JavaScript changed, and `git diff --check`.
- Keep test screenshots, local exports and obsolete artwork out of the repository. Attach useful, sanitized screenshots to the pull request instead.

By submitting a contribution, you agree to license it under the project's [MIT License](LICENSE). Only submit code and assets you have the right to contribute. Third-party names, trademarks and assets retain their respective rights.

