# Awesome HN

A compact, English-language directory of active Hacker News projects.

Three columns, two levels of categories, short descriptions, and search. No accounts, submission form, analytics, or runtime dependencies. All links work without JavaScript.

## Directory

<!-- DIRECTORY:START -->
### Explore

#### Books

- [HackerBooks](https://hackerbooks.org/) — Books mentioned on HN, with the original discussions.

#### Videos

- [HackerTube](https://hackertube.org/) — YouTube videos discovered in HN recommendations.

#### Games

- [HN Arcade](https://hnarcade.com/games/category/games) — Independent games shared by the HN community.

#### Knowledge

- [WikiHack](https://wikihack.netlify.app/) — Wikipedia rabbit holes linked in HN comments.

### Read

#### Blogs

- [blogs.hn](https://blogs.hn/) — Personal blogs from HN readers, with feeds.

#### Readers

- [hckr news](https://hckrnews.com/) — A compact, chronological view of Hacker News.
- [Hacki](https://github.com/Livinglist/Hacki) — An open-source HN reader for iOS and Android.

#### Daily digests

- [Hacker News Daily](https://www.daemonology.net/hn-daily/) — Ten top stories a day, without repeat links.

### Tools

#### Search

- [HN Search](https://hn.algolia.com/) — Full-text search across HN stories and comments.

#### RSS

- [HN RSS](https://hnrss.github.io/) — Custom feeds for keywords, points, and replies.

#### Jobs

- [HN Hiring](https://hnhiring.com/) — Search jobs from the monthly Who Is Hiring threads.

#### Terminal

- [Circumflex](https://github.com/bensadeh/circumflex) — Read HN from your terminal, with article previews.

<!-- DIRECTORY:END -->

## Manage the directory

Edit [`data/sites.json`](data/sites.json), then run:

```sh
npm ci
npm run check
```

The build validates the data, renders a static website into `dist/`, and regenerates the directory section above. Commit the source data and generated README together. `dist/` is intentionally ignored. The data is also published as `/data.json`.

Each site needs a name, URL, short English description, category, dated activity evidence, and a sourced popularity signal. See [curation policy](CURATION.md) and [contributing](CONTRIBUTING.md).

## Local preview

```sh
npm run dev
```

The preview URL is printed by Wrangler. `/` focuses search; Escape clears it. Search and the selected primary group are reflected in the URL.

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

Cloudflare installs the locked development dependency automatically. Pushes to `main` rebuild the directory. Pull requests are validated by GitHub Actions; there is no automatic site-submission feature.

For an authenticated local deployment:

```sh
npx wrangler login
npm run deploy
```

No Cloudflare credentials belong in this repository.

## References

- [cheeaun/awesome-hacker-news](https://github.com/cheeaun/awesome-hacker-news) — primary reference for established projects.
- [HackerBooks discussion](https://news.ycombinator.com/item?id=50326821) and [HackerHype](http://epestr.com/hackerhype/) — discovery sources for newer HN collections.

Descriptions are independently written. This directory is not affiliated with Hacker News or Y Combinator. Code and original descriptions: [MIT](LICENSE). Listed projects retain their own licenses.
