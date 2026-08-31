# Partner Center properties, declarations, and age-rating answer sheet

**Store product:** CausalPilot AI by LAI ZEYU  
**Installed application:** CausalPilot AI 0.1.0 for Windows  
**Accountable owner:** LAI ZEYU (来泽宇)  
**Status:** Proposed answers based on the current source; re-check against the exact uploaded package and live questionnaire

## Identity and device family

- Product-name candidate: `CausalPilot AI by LAI ZEYU`
- Name reservation state: `PENDING_NAME_RESERVATION` — observed available, not yet reserved
- Package identity name: `PENDING_PARTNER_CENTER_IDENTITY`
- Publisher: `PENDING_PARTNER_CENTER_IDENTITY`
- Publisher display name: `LAI ZEYU` (observed on the current Partner Center account; re-check at submission)
- Device family: Windows.Desktop
- Architecture: x64 only
- Planned minimum OS: Windows 10 version 1809 (`10.0.17763.0`)
- Planned maximum version tested in manifest: `10.0.26100.0`
- Product version: `0.1.0`; planned Microsoft Store package version: `1.0.0.0`, subject to final manifest inspection. The Store package uses a positive first version segment while the application keeps its public semantic version.

The OS/version values are planned until the final AppX manifest and Windows evidence are inspected. `MaxVersionTested` is a manifest compatibility declaration, not proof that the package was tested on every Windows build up to that value.

## Category

- Primary category: Business
- Subcategory: Data + analytics
- Optional secondary category: Productivity
- Games/Xbox: No

## Privacy and support

- Does the product access, collect, or transmit personal information? **Yes — access.** It can access a user-selected CSV that may contain personal information. The developer does not receive or transmit that file through version 0.1.0.
- Privacy policy: `https://github.com/lzy2767865503-pixel/causalpilot-ai/blob/main/store/windows/PRIVACY_POLICY.md`
- Website: `https://github.com/lzy2767865503-pixel/causalpilot-ai`
- Support: `https://github.com/lzy2767865503-pixel/causalpilot-ai/blob/main/store/windows/SUPPORT.md`

This conservative “Yes” answer avoids confusing “no developer collection” with “no access.”

## Product declarations

| Declaration | Proposed answer | Evidence boundary |
|---|---|---|
| Product incorporates generative AI features | No | Version 0.1.0 invokes no AI model or generative API at runtime. Reassess if this changes. |
| Product permits purchases outside Microsoft Store commerce | No | No purchases, subscription, add-on, or payment flow exists. |
| Tested to meet accessibility guidelines | No / leave unchecked | Semantic controls exist, but no named-standard accessibility audit has been preserved. |
| Supports pen and ink | No | No pen/ink-specific feature. |
| Depends on non-Microsoft drivers or NT services | No | The packaged local sidecar is an ordinary child process, not a driver or NT service. |
| Requires login credentials | No | No account or sign-in exists. |
| Advertising | No | No ad SDK or advertising exists. |
| User-generated content shared with other users | No | No online sharing/community surface. |
| App data eligible for OneDrive backup | Keep Partner Center default unless the final package introduces persisted app data | The current app intentionally retains no raw-row database; exported files follow the user’s chosen destination and OS settings. |
| Installation on alternate/removable drives | Do not claim until tested | Leave the optional declaration unchanged unless the exact Store package is tested there. |

## Hardware and software requirements

Do not add hardware checkboxes merely to make the listing appear complete. Microsoft says this section is optional, and the Store may not enforce all entries.

Safe minimum requirements after the final manifest is verified:

- 64-bit x64 processor
- Windows 10 version 1809 or later
- Desktop/laptop environment capable of displaying the application’s minimum 1040 × 720 window
- A local UTF-8 CSV is required only for analysing user-provided data; the built-in synthetic example requires no external file

Proposed recommended requirements, **pending compatibility testing**:

- 1920 × 1080 display
- Keyboard and mouse or trackpad
- 8 GB RAM

Do not publish an untested RAM or processor-performance promise. Internet access is needed to acquire/update the Store package, but the 0.1.0 analysis workflow itself is designed to run locally without an account or analysis service.

## IARC age-rating questionnaire draft

Use the live Partner Center wording. The entries below are a preparation sheet, not a generated rating certificate.

### Product type and content

- Product is an application/tool, not a game.
- Violence: No.
- Fear/horror: No.
- Sexual content or nudity: No.
- Profanity or crude humour: No.
- Controlled substances, alcohol, or tobacco content: No.
- Gambling or simulated gambling: No.
- Criminal instruction or glorification: No.
- User-generated content visible to other users: No.
- Open online communication or social networking: No.
- Location sharing: No.
- Advertising: No.
- Purchases, digital goods, loot boxes, or paid random items: No.
- Live generative-AI content: No.
- Unrestricted web browsing: No.

### Data-oriented considerations

- The app can open a user-selected local CSV, but does not supply downloadable media/content or share it with other users.
- The built-in example is synthetic business-experiment data and contains no personal information.
- HR wording is restricted to aggregate programme/team interventions, and individual employment decisions are rejected.

### Expected outcome boundary

These answers appear consistent with a low/general-audience rating, but only the IARC result generated from the final live questionnaire is authoritative. Save the resulting IARC certificate/GRID and regional rating output as release evidence. Do not state “3+,” “Everyone,” or another rating before that record exists.
