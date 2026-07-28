## MODIFIED Requirements

### Requirement: POESESSID Session Injection
The app SHALL allow the user to supply a POESESSID value — either by manually entering it or via the automatic login flow (see `poesessid-auto-login` capability) — and SHALL attach it as a `Cookie` header (`POESESSID=<value>`) on requests that require authentication.

#### Scenario: Authenticated request with configured session
- **WHEN** the user has entered a POESESSID in settings and the app makes a request requiring authentication
- **THEN** the request includes a `Cookie: POESESSID=<value>` header.

#### Scenario: Authenticated request with auto-captured session
- **WHEN** the user has obtained a POESESSID via the automatic login flow and the app makes a request requiring authentication
- **THEN** the request includes a `Cookie: POESESSID=<value>` header, using the same injection path as a manually-entered value.
