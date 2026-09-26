# DTP – Implementation Support

Live design (claude.ai): https://claude.ai/artifact/Uk1yVWh152i3ZN2VV8oUcB

Each screen: `*.dc.html` = design source (Graphite components + inline layout), `screenshots/*.png` = rendered reference at the board size. `canvas.json` = board layout/order on the canvas. `ds/` = the Graphite DS version this design was drawn with.

| Screen | Title | Size | Screenshot |
|---|---|---|---|
| `Main.dc.html` | List | 1440×900 | ![](screenshots/Main.png) |
| `IsListEmpty.dc.html` | List – empty | 1440×900 | ![](screenshots/IsListEmpty.png) |
| `IsWizard1.dc.html` | Wizard 1 · Framework & scope | 1440×900 | ![](screenshots/IsWizard1.png) |
| `IsWizard2.dc.html` | Wizard 2 · Support & submit | 1440×900 | ![](screenshots/IsWizard2.png) |
| `IsDetailSubmitted.dc.html` | Detail · Submitted | 1440×900 | ![](screenshots/IsDetailSubmitted.png) |
| `IsDetailProgress.dc.html` | Detail · In progress | 1440×900 | ![](screenshots/IsDetailProgress.png) |
| `IsDetailCompleted.dc.html` | Detail · Completed | 1440×900 | ![](screenshots/IsDetailCompleted.png) |
| `IsDetailRejected.dc.html` | Detail · Rejected | 1440×900 | ![](screenshots/IsDetailRejected.png) |
| `IsAdminQueue.dc.html` | Queue | 1440×900 | ![](screenshots/IsAdminQueue.png) |
| `IsAdminReview.dc.html` | Review request | 1440×900 | ![](screenshots/IsAdminReview.png) |
| `IsAdminApprove.dc.html` | Approve & assign | 1440×900 | ![](screenshots/IsAdminApprove.png) |
| `IsAdminReject.dc.html` | Reject | 1440×900 | ![](screenshots/IsAdminReject.png) |
| `IsConsAssignments.dc.html` | My assignments | 1440×900 | ![](screenshots/IsConsAssignments.png) |
| `IsConsDetail.dc.html` | Request detail | 1440×900 | ![](screenshots/IsConsDetail.png) |
| `IsConsDeliverable.dc.html` | Share a deliverable | 1440×900 | ![](screenshots/IsConsDeliverable.png) |
| `IsConsComplete.dc.html` | Complete request | 1440×900 | ![](screenshots/IsConsComplete.png) |
| `IsConsWorkspace.dc.html` | Workspace (read only) | 1440×900 | ![](screenshots/IsConsWorkspace.png) |
| `IsConsWorkspaceEnded.dc.html` | Workspace – access ended | 1440×900 | ![](screenshots/IsConsWorkspaceEnded.png) |

## Notes on the canvas

- \[MVP\] Customer
- \[MVP\] SGS Admin
- \[MVP\] SGS Consultant
