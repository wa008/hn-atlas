# HN Atlas

A compact, English-language directory of active Hacker News projects.

**[Browse the directory →](https://hn-atlas.pages.dev)**

A flat category index, editorial typography, clear descriptions, and search. Visitors can suggest a site without an account. Moderation happens in GitHub; approved changes deploy automatically. Directory links work without JavaScript.

## Directory

<!-- DIRECTORY:START -->
### Books

- [HackerBooks](https://hackerbooks.org/) — Books mentioned on HN, with the original discussions.

### Videos

- [HackerTube](https://hackertube.org/) — YouTube videos discovered in HN recommendations.
- [HackerFilms](https://hackerfilms.pages.dev/) — Movies discussed on HN, linked to their conversations.

### Games

- [HN Arcade](https://hnarcade.com/games/category/games) — Independent games shared by the HN community.

### Knowledge

- [WikiHack](https://wikihack.netlify.app/) — Wikipedia rabbit holes linked in HN comments.
- [OrangeCrumbs](https://www.orangecrumbs.com/) — HN link history, Wikipedia discoveries, and a hall of fame.

### Blogs

- [blogs.hn](https://blogs.hn/) — Personal blogs from HN readers, with feeds.
- [HackerBlogs](https://hackerblogs.app/) — Find the blogs and writers HN keeps sharing.

### Readers

- [hckr news](https://hckrnews.com/) — A compact, chronological view of Hacker News.
- [Hacki](https://github.com/Livinglist/Hacki) — An open-source HN reader for iOS and Android.

### Daily digests

- [Hacker News Daily](https://www.daemonology.net/hn-daily/) — Ten top stories a day, without repeat links.

### Product discovery

- [HackerProducts](https://hackerproducts.pages.dev/) — Software HN users recommend, with the comments behind it.
- [HackerTools](https://shouvik12.github.io/hackertools/) — Developer tools recommended by distinct HN commenters.
- [trustmebro · HN](https://www.trustmebro.reviews/r/hackernews) — Explore product opinions extracted from HN discussions.

### Search

- [HN Search](https://hn.algolia.com/) — Full-text search across HN stories and comments.

### RSS

- [HN RSS](https://hnrss.github.io/) — Custom feeds for keywords, points, and replies.

### Jobs

- [HN Hiring](https://hnhiring.com/) — Search jobs from the monthly Who Is Hiring threads.

### Terminal

- [Circumflex](https://github.com/bensadeh/circumflex) — Read HN from your terminal, with article previews.

<!-- DIRECTORY:END -->

## Manage the directory

Edit [`data/sites.json`](data/sites.json), then run:

```sh
npm ci
npm run check
```

The build validates the data, renders a static website into `dist/`, and regenerates the directory section above. Commit the source data and generated README together. `dist/` is intentionally ignored. The data is also published as `/data.json`.

Each site needs a name, URL, short English description, category, dated activity evidence, and a sourced popularity signal or an explicit editorial rationale. See [curation policy](CURATION.md) and [contributing](CONTRIBUTING.md).

## Local preview

```sh
npm run dev
```

The preview URL is printed by Wrangler. `/` focuses search; Escape clears it. Search and the selected category are reflected in the URL.

## Cloudflare Pages

Production repository: [`wa008/awesome-hn`](https://github.com/wa008/awesome-hn), branch `main`.

For a Git-integrated Pages project:

| Setting | Value |
| --- | --- |
| Framework | None |
| Build command | `npm run build` |
| Output directory | `dist` |
| Root directory | `/` |
| Node.js | `22` or newer |

Cloudflare installs the locked development dependency automatically. Pushes to `main` rebuild the directory. Pull requests are validated by GitHub Actions. Anonymous suggestions are reviewed through GitHub Issues; approved suggestions are committed automatically.

For an authenticated local deployment:

```sh
npx wrangler login
npm run deploy
```

No Cloudflare credentials belong in this repository. The Pages project binds `DB` to the `hn-atlas-submissions` D1 database declared in `wrangler.jsonc`. Apply migrations with `npx wrangler d1 migrations apply hn-atlas-submissions --remote`. For local testing, apply them with `--local` before `npm run dev`.

## References

- [cheeaun/awesome-hacker-news](https://github.com/cheeaun/awesome-hacker-news) — primary reference for established projects.
- [HackerBooks discussion](https://news.ycombinator.com/item?id=50326821) and [HackerHype](http://epestr.com/hackerhype/) — discovery sources for newer HN collections.

Descriptions are independently written. This directory is not affiliated with Hacker News or Y Combinator. Code and original descriptions: [MIT](LICENSE). Listed projects retain their own licenses.

## Anonymous suggestions and review

1. A visitor submits only a **website URL**, without a login or email address. Site name and description are optional, behind an expandable field. Category is assigned during moderation.
2. The Pages Function validates the suggestion and stores a receipt in D1. Same-day duplicate URLs are deduplicated; a hashed-IP limit and a honeypot reduce spam. The public endpoint does not fetch the URL. A background GitHub job reads bounded HTML metadata using validated, pinned public IP addresses and checks redirects.
3. [`Review site submissions`](.github/workflows/submissions.yml) checks the queue on pushes, manual runs, and a five-minute schedule. GitHub may delay scheduled jobs. The workflow fills missing name and description from Open Graph metadata, the page title, or a hostname fallback. It creates an Issue labeled `submission` with an editable JSON draft and identifies generated fields.
4. A maintainer checks the generated text and URL, **sets a category** in the Issue JSON, and then applies **approved**. Missing category blocks publication. This is an explicit editorial sign-off on availability and relevance.
5. The workflow validates the proposal, runs the repository checks, commits `data/sites.json` and the generated README to `main`, marks the Issue `published`, and closes it. Cloudflare's Git integration automatically builds and publishes the commit.
6. Apply **rejected** to close a suggestion without publishing. If publication fails, the workflow leaves the Issue open with a retry instruction.

Only repository administrators or users with write/maintain permission can approve. A closed Issue is not imported again. Suggestions cannot change source files, workflow files, or deployment settings.

The queue is private to the trusted GitHub workflow: short-lived GitHub OIDC tokens are verified against GitHub's signing keys and the exact repository ID, main branch, audience, and workflow path. No long-lived GitHub or Cloudflare token is stored for this flow. Only the submission form is anonymous; repository moderation still uses GitHub permissions.

The repository name remains `wa008/awesome-hn` so existing repository links remain valid. The product and production domain are **HN Atlas** and **hn-atlas.pages.dev**. The old Pages domain redirects to the new domain.
