# Microsoft Store requirements used for this submission kit

**Checked:** 2026-08-31  
**Applies to:** packaged Windows desktop submission (`.appx`, `.msix`, or related bundle/upload format)  
**Product owner:** LAI ZEYU (来泽宇)

This is a working interpretation of current Microsoft documentation, not legal advice. Re-open the linked pages and Partner Center immediately before submission because fields and policies can change.

## Package route and validation

Microsoft currently accepts `.msix`, `.msixbundle`, `.msixupload`, `.appx`, `.appxbundle`, and `.appxupload` on the MSIX/AppX package page. A package targeting Windows 10 or Windows 11 may be up to 25 GB, and its block map must use SHA2-256. Microsoft advises running the Windows App Certification Kit and testing on different hardware before submission.

For this project:

- Target the `Windows.Desktop` device family only.
- Submit x64 only unless independently built and tested architecture-specific packages are added.
- Bind the package `Identity/Name` and `Publisher` to the exact values assigned to the reserved product in Partner Center.
- Use a monotonically increasing four-part package version.
- Preserve the package hash and the exact tested artifact. Do not rebuild after testing and upload a different binary.

Official sources:

- [App package requirements for MSIX apps](https://learn.microsoft.com/en-us/windows/apps/publish/publish-your-app/msix/app-package-requirements)
- [Upload MSIX app packages](https://learn.microsoft.com/en-us/windows/apps/publish/publish-your-app/msix/upload-app-packages)
- [Packaging an Electron app for distribution](https://learn.microsoft.com/en-us/windows/apps/dev-tools/winapp-cli/guides/electron-packaging)

The alternative MSI/EXE route is not the selected route. It requires a stable versioned HTTPS installer URL, a CA-trusted digital signature on the installer and all PE files, a standalone offline installer, and silent installation. MSIX/AppX is preferred here because the Store can host and sign the package after certification.

- [App package requirements for MSI/EXE apps](https://learn.microsoft.com/en-us/windows/apps/publish/publish-your-app/msi/app-package-requirements)

## Submission sections

Partner Center requires completion of pricing and availability, properties, age ratings, packages, at least one Store listing, and any applicable submission options. Category and base price are required. An app name must be reserved before the exact Store identity can be used.

- [Create an app submission for an MSIX app](https://learn.microsoft.com/en-us/windows/apps/publish/publish-your-app/msix/create-app-submission)
- [Set app pricing and availability](https://learn.microsoft.com/en-us/windows/apps/publish/publish-your-app/msix/price-and-availability)

Recommended initial choices for 0.1.0, subject to the owner’s commercial decision:

- Audience: Public.
- Discoverability: Available and discoverable.
- Base price: Free.
- Trial, add-ons, in-app purchases: None.
- Release: Manual publishing hold until the public listing and package evidence have been reviewed.
- Markets: Select only markets the owner is prepared to support; do not silently accept all markets without reviewing legal/contact requirements.

## Store listing fields

The description is required and accepts up to 10,000 plain-text characters. One screenshot is required; Microsoft recommends four or more. Up to 20 product features are allowed, with 200 characters per feature. “What’s new” accepts up to 1,500 characters and should be left blank for the first submission. Keywords allow up to seven entries, 40 characters each, and no more than 21 distinct words in total. Copyright information accepts 200 characters and “Developed by” accepts 255.

- [Add and edit Store listing information](https://learn.microsoft.com/en-us/windows/apps/publish/publish-your-app/msix/add-and-edit-store-listing-info)
- [Add keywords, copyright, licence terms, and developer information](https://learn.microsoft.com/en-us/windows/apps/publish/publish-your-app/msix/add-additional-information)

Do not put HTML, code, or support/privacy URLs in the description. Use the dedicated fields.

## Images

Each screenshot must be PNG, no larger than 50 MB, and at least 1366 × 768 for Desktop. Up to 10 Desktop screenshots are accepted. Captions may be up to 200 characters. Keep critical UI in the top two-thirds, do not add promotional overlays or extra logos, and upload images separately for each listing language.

The recommended 1:1 app tile icon is 300 × 300 PNG. Optional 16:9 “super hero” art must be exactly 1920 × 1080 or 3840 × 2160, contain no text, and should not show the app UI. This kit intentionally omits hero art until a truthful, product-specific asset is created and reviewed.

- [App screenshots, images, and trailers](https://learn.microsoft.com/en-us/windows/apps/publish/publish-your-app/msix/screenshots-and-images)

## Category and hardware

The best-supported primary classification is **Business → Data + analytics**. **Productivity** is a reasonable optional secondary category. Microsoft says the category must accurately describe the app. Hardware requirements are optional; package target OS, architecture, and device family still govern acquisition eligibility.

- [Categories and subcategories](https://learn.microsoft.com/en-us/windows/apps/publish/publish-your-app/msix/categories-and-subcategories)
- [System requirements for MSIX apps](https://learn.microsoft.com/en-us/windows/apps/publish/publish-your-app/msix/system-requirements)

## Privacy and support

Microsoft Store policy requires a privacy policy for Win32/Desktop Bridge products and for products that access, collect, or transmit personal information. CausalPilot accesses user-selected CSV content, so the submission should answer **Yes** and provide a stable, public HTTPS privacy-policy URL even though the developer does not receive the file or its rows. A website and support contact are recommended.

- [Privacy policy and support information](https://learn.microsoft.com/en-us/windows/apps/publish/publish-your-app/msix/support-info)
- [Microsoft Store Policies, section 10.5](https://learn.microsoft.com/en-us/windows/apps/publish/store-policies)

## Age rating and product declarations

The International Age Rating Coalition questionnaire must be answered accurately. The rating concerns content suitability, not the intended professional audience. Partner Center generates the actual regional ratings; this kit must not pre-claim “3+” or “Everyone.”

- [Generate age ratings for an MSIX app](https://learn.microsoft.com/en-us/windows/apps/publish/publish-your-app/msix/age-ratings)

The live-generative-AI declaration applies when a product dynamically creates content with an AI model. CausalPilot AI 0.1.0 does not do this at runtime, so the proposed answer is **No**. If any model/API-generated text, image, audio, video, or code feature is added later, the answer and listing must be reassessed before release.

- [Microsoft Store Policies, live generative AI](https://learn.microsoft.com/en-us/windows/apps/publish/store-policies)

Do not select “tested to meet accessibility guidelines” until a named accessibility standard, test procedure, environment, and results are preserved.

## Certification and publication boundary

Microsoft states that certification can take up to three business days. A successful MSIX/AppX submission is signed by Microsoft during publishing. Certification success is not the same as public availability: public release is established only after the status becomes `In the Store` and the listing/acquisition path is independently verified.

- [Certification process for MSIX apps](https://learn.microsoft.com/en-us/windows/apps/publish/publish-your-app/msix/app-certification-process)

The submission notes should describe the offline test path, built-in synthetic sample, absence of credentials, and absence of live generative AI. Do not provide real personal or client data to reviewers.
