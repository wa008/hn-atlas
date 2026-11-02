# Contributing

Suggest a site without an account using the form on [HN Atlas](https://hn-atlas.pages.dev). Maintainers review suggestions in GitHub Issues. You can also contribute through a pull request.

1. Read [CURATION.md](CURATION.md).
2. Add or update an entry in [`data/sites.json`](data/sites.json), including activity and popularity evidence.
3. Reuse an existing category when possible. A category belongs to one primary group.
4. Run `npm ci` and `npm run check`.
5. Commit the data and regenerated README. Explain the change and link to the evidence in your pull request.

Please do not add tracking parameters, affiliate links, unverifiable metrics, or promotional copy. Small directories work best when each entry has a clear use.

For Issue moderation: inspect the URL and evidence, edit the JSON proposal as needed, then add `approved` to publish or `rejected` to close. Only maintainers with write access may publish. Approval records an editorial review; it does not invent a popularity or Domain Rating score.
