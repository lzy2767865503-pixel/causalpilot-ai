# Partner Center properties, declarations, and age-rating answer sheet

**Store product:** CausalPilot AI by LAI ZEYU  
**Public preview application:** CausalPilot AI 0.1.0 for Windows

**Store AppX display name:** CausalPilot AI by LAI ZEYU
**Accountable owner:** LAI ZEYU (来泽宇)  
**Status:** Properties and age-rating questionnaire saved in Partner Center on 2026-09-01; package validated; certification not submitted

## Identity and device family

- Reserved product name: `CausalPilot AI by LAI ZEYU` — verified 2026-09-01
- Microsoft Store ID: `9NXZ3MJFFGFG`
- Package identity name: `LAIZEYU.CausalPilotAIbyLAIZEYU`
- Publisher: `CN=A5F91D0A-30C6-48EE-944F-B767FA872BE8`
- Publisher display name: `LAI ZEYU`
- Package family name: `LAIZEYU.CausalPilotAIbyLAIZEYU_jex0hdpdrk7qw`
- Partner Center product state: `In draft`
- Validated device family: Windows.Desktop
- Validated architecture: x64 only
- Validated minimum OS: Windows 10 version 1809 (`10.0.17763.0`)
- Validated maximum version tested in manifest: `10.0.26100.0`
- Product version: `0.1.0`; validated Microsoft Store package version: `1.0.0.0`. The Store package uses a positive first version segment while the application keeps its public semantic version.

Partner Center accepted the package validation step. This does not establish certification, publication, or compatibility with every Windows build. `MaxVersionTested` remains a manifest compatibility declaration, not test evidence.

## Category — saved

- Primary category: Business
- Subcategory: Data + analytics
- Secondary category: Productivity
- Games/Xbox: No

## Privacy and support

- Does the product access, collect, or transmit personal information? **Yes — access.** Saved in Partner Center. The app can access a user-selected CSV that may contain personal information; the developer does not receive or transmit that file through version 0.1.0.
- Privacy policy: `https://github.com/lzy2767865503-pixel/causalpilot-ai/blob/main/store/windows/PRIVACY_POLICY.md`
- Website: `https://github.com/lzy2767865503-pixel/causalpilot-ai`
- Support: `https://github.com/lzy2767865503-pixel/causalpilot-ai/blob/main/store/windows/SUPPORT.md`

This conservative “Yes” answer avoids confusing “no developer collection” with “no access.”

## Product declarations

| Declaration | Portal state / answer | Evidence boundary |
|---|---|---|
| Product incorporates generative AI features | No — saved | Version 0.1.0 invokes no AI model or generative API at runtime. Reassess if this changes. |
| Product permits purchases outside Microsoft Store commerce | No — saved | No purchases, subscription, add-on, or payment flow exists. |
| Tested to meet accessibility guidelines | Not selected — saved | Semantic controls exist, but no named-standard accessibility audit has been preserved. |
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

## IARC age rating — completed, final identifier pending

The live Partner Center questionnaire was completed on 2026-09-01. Its preview showed low/general-audience regional outcomes including `3+` and `Everyone`. The final Rating ID/certificate remains pending, so the preview is not recorded as a final issued rating.

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

### Current outcome boundary

Questionnaire completion and the preview are verified. Preserve the final IARC Rating ID/GRID, certificate, and regional rating output when Partner Center issues them. Until then, use “preview showed 3+/Everyone and other low/general outcomes,” not “final rating issued.”
