# DTP – Authentication

Live design (claude.ai): https://claude.ai/artifact/3yrLoqbXXfeXzXq92dp9fT

Each screen: `*.dc.html` = design source (Graphite components + inline layout), `screenshots/*.png` = rendered reference at the board size. `canvas.json` = board layout/order on the canvas. `ds/` = the Graphite DS version this design was drawn with.

| Screen | Title | Size | Screenshot |
|---|---|---|---|
| `Main.dc.html` | Default | 1440×900 | ![](screenshots/Main.png) |
| `CustomerLoginWrongPassword.dc.html` | Wrong email or password | 1440×900 | ![](screenshots/CustomerLoginWrongPassword.png) |
| `CustomerLoginLocked.dc.html` | Locked after failed attempts | 1440×900 | ![](screenshots/CustomerLoginLocked.png) |
| `CustomerLoginInactive.dc.html` | Account deactivated | 1440×900 | ![](screenshots/CustomerLoginInactive.png) |
| `SgsLogin.dc.html` | Default | 1440×900 | ![](screenshots/SgsLogin.png) |
| `SgsLoginWrongPassword.dc.html` | Wrong email or password | 1440×900 | ![](screenshots/SgsLoginWrongPassword.png) |
| `SgsLoginLocked.dc.html` | Locked after failed attempts | 1440×900 | ![](screenshots/SgsLoginLocked.png) |
| `SgsLoginInactive.dc.html` | Account deactivated | 1440×900 | ![](screenshots/SgsLoginInactive.png) |
| `InviteEmail.dc.html` | Invitation email | 720×900 | ![](screenshots/InviteEmail.png) |
| `Activate.dc.html` | Activate · empty | 1440×900 | ![](screenshots/Activate.png) |
| `ActivatePassword.dc.html` | Activate · password rules | 1440×900 | ![](screenshots/ActivatePassword.png) |
| `ActivateMismatch.dc.html` | Activate · passwords don’t match | 1440×900 | ![](screenshots/ActivateMismatch.png) |
| `ActivateSuccess.dc.html` | Activated | 1440×900 | ![](screenshots/ActivateSuccess.png) |
| `ActivateExpired.dc.html` | Link expired | 1440×900 | ![](screenshots/ActivateExpired.png) |
| `ActivateUsed.dc.html` | Already activated | 1440×900 | ![](screenshots/ActivateUsed.png) |
| `SgsActivate.dc.html` | SGS account · activate | 1440×900 | ![](screenshots/SgsActivate.png) |

## Notes on the canvas

- UC-AUTH-001 · Log in · Customer Portal
- UC-AUTH-001 · Log in · SGS Operations
- Activate account from invitation
