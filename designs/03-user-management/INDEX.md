# DTP – User Management

Live design (claude.ai): https://claude.ai/artifact/YWigd2nG3dDGS63QBqtHFZ

Each screen: `*.dc.html` = design source (Graphite components + inline layout), `screenshots/*.png` = rendered reference at the board size. `canvas.json` = board layout/order on the canvas. `ds/` = the Graphite DS version this design was drawn with.

| Screen | Title | Size | Screenshot |
|---|---|---|---|
| `Main.dc.html` | Users | 1440×900 | ![](screenshots/Main.png) |
| `CaInvite.dc.html` | Invite a user | 1440×900 | ![](screenshots/CaInvite.png) |
| `CaUserPending.dc.html` | User · invitation pending | 1440×900 | ![](screenshots/CaUserPending.png) |
| `CaRevoke.dc.html` | Revoke invitation | 1440×900 | ![](screenshots/CaRevoke.png) |
| `CaUserDetail.dc.html` | User detail | 1440×900 | ![](screenshots/CaUserDetail.png) |
| `CaChangeRole.dc.html` | Change role | 1440×900 | ![](screenshots/CaChangeRole.png) |
| `CaAssignScopes.dc.html` | Assign scope access | 1440×900 | ![](screenshots/CaAssignScopes.png) |
| `SgsUsers.dc.html` | Users | 1440×900 | ![](screenshots/SgsUsers.png) |
| `SgsInviteSgs.dc.html` | Invite an SGS user | 1440×900 | ![](screenshots/SgsInviteSgs.png) |
| `SgsInviteCustomer.dc.html` | Invite a customer user | 1440×900 | ![](screenshots/SgsInviteCustomer.png) |
| `SgsUserDetail.dc.html` | User detail | 1440×900 | ![](screenshots/SgsUserDetail.png) |
| `CaUsersEmpty.dc.html` | Users · only you (empty) | 1440×900 | ![](screenshots/CaUsersEmpty.png) |
| `TenantList.dc.html` | Customers | 1440×900 | ![](screenshots/TenantList.png) |
| `TenantCreate.dc.html` | Create customer | 1440×900 | ![](screenshots/TenantCreate.png) |
| `TenantNew.dc.html` | Customer · no admin yet | 1440×900 | ![](screenshots/TenantNew.png) |
| `TenantCreateAdmin.dc.html` | Create Customer Admin | 1440×900 | ![](screenshots/TenantCreateAdmin.png) |
| `TenantDetail.dc.html` | Customer detail | 1440×900 | ![](screenshots/TenantDetail.png) |
| `TenantEdit.dc.html` | Edit customer | 1440×900 | ![](screenshots/TenantEdit.png) |
| `TenantScopes.dc.html` | Customer · Scopes | 1440×900 | ![](screenshots/TenantScopes.png) |

## Notes on the canvas

- Customer Admin · own organisation
- SGS Admin · affiliate
- SGS Admin · Customers (tenants)
