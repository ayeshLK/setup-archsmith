# Setup ArchSmith social preview and launch kit

[`setup-archsmith-social-preview.png`](setup-archsmith-social-preview.png) is the repository's GitHub social preview.
It is an opaque 1280×640 PNG, matching GitHub's recommended size and staying below the 1 MB upload limit.
[`setup-archsmith-social-preview.svg`](setup-archsmith-social-preview.svg) is the editable source.

The composition derives from the canonical
[ArchSmith social-preview source and brief](https://github.com/ayeshLK/archsmith/tree/main/docs/social-preview),
rather than defining another visual identity. It uses the same navy, mint, purple, teal, and amber palette, while the
workflow card distinguishes the GitHub Action from the main renderer project.

## Upload and verify

1. Open the repository **Settings** page.
2. Under **Social preview**, choose **Edit → Upload an image…** and select `setup-archsmith-social-preview.png`.
3. Share the repository URL in a link-preview debugger or a private message and confirm that the full wordmark,
   descriptor, and four workflow stages remain visible.
4. Check both a wide preview and a small mobile card. The background is opaque so the result does not depend on a
   platform's light or dark mode.

GitHub currently accepts PNG, JPG, or GIF previews under 1 MB and recommends 1280×640 for best display. Recheck
[GitHub's social-preview documentation](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/customizing-your-repositorys-social-media-preview)
before replacing the asset.

## Generation brief

The editable source is deliberately vector-based so the product name, commands, and workflow sequence stay exact.
Keep this brief with the asset so future revisions remain coordinated with the main project:

```text
Use case: ads-marketing
Asset type: GitHub repository social preview, exact 2:1 landscape composition designed for 1280×640
Primary request: create a polished social preview for Setup ArchSmith, the GitHub Action that installs the ArchSmith CLI
Scene/backdrop: solid deep navy #182449 backdrop with the canonical subtle technical grid
Subject: the exact “Setup ArchSmith” wordmark and a four-stage GitHub Actions workflow for install, validate, render, and output
Style/medium: crisp flat technical editorial design; vector geometry; established ArchSmith developer-tool branding
Composition/framing: large wordmark and descriptor on the left; workflow card on the right; generous safe margins; readable at small link-card size
Color palette: #182449 navy, white, #D9F2EC mint, #5B3A9E purple, #177F6B teal, #92600E amber
Text (verbatim): “SETUP”, “ArchSmith”, “Install the CLI in GitHub Actions.”, “Validate. Render. Ship.”, “GitHub Actions workflow”, “INSTALL”, “ayeshLK/setup-archsmith@v0”, “VALIDATE”, “archsmith validate”, “RENDER”, “archsmith render”, “OUTPUT”, and “architecture.svg”
Constraints: use the upstream ArchSmith social-preview brief as the canonical branding source; exact text; no invented UI; no people; no photorealism; no watermark; solid opaque background
```

Before committing a replacement, export the source SVG to exactly 1280×640, verify every text string, confirm the
PNG remains below 1 MB, and inspect it at a small card size. Keep brand-level changes in the canonical ArchSmith
source first and derive action-specific changes from it.

## Reusable announcement

> Setup ArchSmith installs a verified version of the ArchSmith CLI in GitHub Actions, ready for later workflow steps.
> Use it to validate a `*.archsmith.json` architecture description, render the corresponding SVG, and preserve the
> result as a workflow artifact.
>
> ```yaml
> - uses: ayeshLK/setup-archsmith@v0
>   with:
>     version: "0.6.0"
> - run: archsmith validate architecture.archsmith.json
> - run: archsmith render architecture.archsmith.json -o architecture.svg
> - uses: actions/upload-artifact@v4
>   with:
>     name: architecture-diagram
>     path: architecture.svg
> ```
>
> Find [Setup ArchSmith on GitHub Marketplace](https://github.com/marketplace/actions/setup-archsmith), browse the
> [action repository](https://github.com/ayeshLK/setup-archsmith), explore the
> [main ArchSmith project](https://github.com/ayeshLK/archsmith), and see a
> [real rendered architecture diagram](https://github.com/ayeshLK/archsmith/blob/main/examples/ticket-booking/diagram.svg).

Attach the generated `architecture.svg` artifact or a screenshot from the completed workflow when publishing the
announcement. For reproducible workflows, keep the exact CLI version and pin the action to a full commit SHA; update
the example version when a newer release is published.
