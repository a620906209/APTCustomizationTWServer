# poesessid-auto-login Specification

## Purpose
TBD - created by archiving change auto-poesessid-login. Update Purpose after archive.
## Requirements
### Requirement: Embedded Login Window
The app SHALL provide a way for the user to start a `pathofexile.tw` login flow from the settings screen, opening an embedded browser window navigated to the `pathofexile.tw` login page.

#### Scenario: User starts login flow
- **WHEN** the user clicks the login action in settings
- **THEN** a new embedded browser window opens and navigates to the `pathofexile.tw` login page.

#### Scenario: Only one login window at a time
- **WHEN** the user clicks the login action while a login window from a previous attempt is still open
- **THEN** the existing login window is focused instead of opening a second one.

### Requirement: Automatic POESESSID Capture
The app SHALL detect when the `POESESSID` cookie becomes available for the `pathofexile.tw` domain in the login window's session, extract its value, and close the login window automatically.

#### Scenario: Successful login
- **WHEN** the user completes login in the embedded window and the `pathofexile.tw` domain's `POESESSID` cookie is set
- **THEN** the app reads the cookie value, closes the login window, and reports a successful result containing that value.

### Requirement: POESESSID Applied to Existing Config Field
The value captured by the automatic login flow SHALL populate the same `poesessid` config field used by manual entry, so it is injected into `pathofexile.tw` requests exactly as a manually-entered value would be.

#### Scenario: Captured value used for trade requests
- **WHEN** a login flow completes successfully and the user has not separately edited the manual field afterward
- **THEN** subsequent authenticated requests to `pathofexile.tw` include a `Cookie: POESESSID=<captured value>` header, identical to the manual-entry behavior.

### Requirement: Login Outcome Feedback
The app SHALL report the outcome of a login attempt to the user as one of: success, cancelled, or timeout/error, and SHALL NOT leave the user without feedback after the login window closes.

#### Scenario: User closes the window without logging in
- **WHEN** the user closes the embedded login window before a `POESESSID` cookie is captured
- **THEN** the app reports the attempt as cancelled and does not change the existing `poesessid` config value.

#### Scenario: Login window open too long without success
- **WHEN** no `POESESSID` cookie is captured within the app's configured timeout for the login flow
- **THEN** the app closes the login window and reports the attempt as timed out, without changing the existing `poesessid` config value.

### Requirement: Manual Entry Remains Available
The app SHALL continue to allow the user to manually paste a `POESESSID` value in settings regardless of whether the automatic login flow is available or was used.

#### Scenario: User pastes a value manually after automatic capture exists
- **WHEN** the user edits the manual `POESESSID` field
- **THEN** the manually-entered value overrides any value previously captured by the login flow.
