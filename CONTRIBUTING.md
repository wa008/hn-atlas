# Contributing

Suggest a site without an account using the form on [HN Atlas](https://hn-atlas.pages.dev). Maintainers review suggestions in GitHub Issues. You can also contribute through a pull request.

1. Read [CURATION.md](CURATION.md).
2. Add or update an entry in [`data/sites.json`](data/sites.json), including activity and popularity evidence.
3. Reuse an existing flat category when possible. There are no primary category groups.
4. Run `npm ci` and `npm run check`.
5. Commit the data and regenerated README. Explain the change and link to the evidence in your pull request.

Please do not add tracking parameters, affiliate links, unverifiable metrics, or promotional copy. Small directories work best when each entry has a clear use.

For Issue moderation: inspect the URL and any auto-filled text. **Set `category` to an allowed category ID before approving.** Name and description can be edited or filled from metadata. Add `approved` to publish or `rejected` to close. Only maintainers with write access may publish. Approval records an editorial review; it does not invent a popularity or Domain Rating score.

Anonymous submissions return a receipt immediately. The receipt links to the review queue until GitHub Actions creates the Issue; scheduled runs may be delayed by GitHub. Repeating the same URL on the same day returns the original receipt.

When adding a new category, update both `data/sites.json` and `lib/submission.js`. The build checks that the public form and directory use the same categories.
