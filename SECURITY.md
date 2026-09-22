# Security Policy

## Scope

This project is a statically rendered site. It has no accounts, no server-side data store and
no analytics on reading behaviour. Research progress is written to `localStorage` in the
visitor's own browser and never leaves the device.

That said, the following are in scope and worth reporting:

- Cross-site scripting through content rendering
- Dependency vulnerabilities that reach the shipped bundle
- Anything that causes the site to execute untrusted input
- A bench that can be driven into a state that harms the visitor's browser

The Security Lab content is educational and deliberately sandboxed. It models the browser
security model and never provides working exploitation instructions; issues arguing the
opposite are welcome.

## Reporting a vulnerability

Do not open a public issue for a security problem.

Use GitHub's private vulnerability reporting on the repository, under **Security → Report a
vulnerability**. Include the affected route or component, reproduction steps and the impact
you expect.

You can expect an acknowledgement within a few days and a fix or an explanation of why it is
not a vulnerability before any public disclosure.

## Supported versions

The deployed `main` branch is the only supported version.
