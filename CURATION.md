# Curation

Last reviewed: **November 2, 2026**.

This is a small selection, not an exhaustive copy of the reference list.

## Inclusion rules

1. A direct relationship to Hacker News, with a clear purpose.
2. A working destination checked during review. HTTP 200 alone does not establish activity.
3. Dated activity evidence within 180 days of the review: a launch, source update, release, or genuinely fresh live content.
4. At least **50 HN points on a relevant submission**, or **100 GitHub stars**. HN's linked search service is an explicitly recorded service exception.

These are initial editorial thresholds, not an objective quality score. Historical HN points show past attention, not current traffic. Code maintenance and content updates are recorded separately: a live RSS service can deliver fresh posts while its source code has not changed recently. Every included item has a dated explanation and source in `data/sites.json`.

Popularity values are snapshots from the review date, using the HN Firebase API and public GitHub repository API. They are not fetched in visitors' browsers and do not update automatically. New reviews should update both the signals and `reviewedOn`.

## Domain Rating

Ahrefs Domain Rating measures backlink-profile strength, not whether a product is actively maintained or popular with HN users. See [Ahrefs' definition](https://ahrefs.com/seo/glossary/domain-rating).

No authenticated Ahrefs data was available for this review. All `domainRating` values are therefore `null`, and no DR-based filtering is claimed. Do not infer project authority from a shared host such as `github.io`, `pages.dev`, or `netlify.app`.

If verified DR data is added, record an object with `value` (0–100), `url` (evidence source), and `date` (measurement date). Never substitute GitHub stars or HN points for DR.

## Examples excluded from this edition

| Candidate | Reason |
| --- | --- |
| HackerBlogs | Recent and accessible, but its launch had 4 HN points at review; no qualifying popularity signal verified. |
| HackerTools | Source recently updated, but had 0 GitHub stars; the referenced HN item is a comment, not a scored launch submission. |
| HN Showcase | Live project, but 2 GitHub stars and 3 launch points at review. |
| HN Games (`hn-games.marcolabarile.me`) | Source active, but 3 GitHub stars; a commonly linked HN submission actually points to a different game site. |
| HackerFilms / HackerProducts | Accessible, but insufficient verified popularity evidence for this edition. |
| Hacker Newsletter | Established audience claimed on the site, but a dated recent issue was not verified during this review. |
| HN Theater / HN Books / HN Academy | Available, but a current-year navigation label does not establish fresh catalog updates; not retained without dated evidence. |
| HackerWeb | Popular source repository, but last source push was in April 2024; a recent release or maintained deployment was not established. |
| `hn.lindylearn.io` | Redirects to a broader personal project site, rather than the former HN directory. |
| `hackernewsbooks.com` | Destination could not be reached during review. |

Excluded is not the same as abandoned or low quality. A later review can restore any project with sufficient evidence.

## Review checklist

- Visit the destination and inspect its purpose.
- Confirm dated activity; avoid counting footer years, navigation years, or redirects as evidence.
- Verify a relevant HN submission or the project's own GitHub repository.
- Record evidence URLs and dates. Avoid using another product's popularity.
- Keep descriptions factual and under 100 characters.
- Run `npm run check`, then commit the data and regenerated README.
