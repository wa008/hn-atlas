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

### Blogs & digests

- [blogs.hn](https://blogs.hn/) — Personal blogs from HN readers, with feeds.
- [Hacker News Daily](https://www.daemonology.net/hn-daily/) — Ten top stories a day, without repeat links.
- [HackerBlogs](https://hackerblogs.app/) — Find the blogs and writers HN keeps sharing.

### HN readers

- [hckr news](https://hckrnews.com/) — A compact, chronological view of Hacker News.
- [Hacki](https://github.com/Livinglist/Hacki) — An open-source HN reader for iOS and Android.
- [Circumflex](https://github.com/bensadeh/circumflex) — Read HN from your terminal, with article previews.

### Product discovery

- [HackerProducts](https://hackerproducts.pages.dev/) — Software HN users recommend, with the comments behind it.
- [trustmebro · HN](https://www.trustmebro.reviews/r/hackernews) — Explore product opinions extracted from HN discussions.

### Search & feeds

- [HN Search](https://hn.algolia.com/) — Full-text search across HN stories and comments.
- [HN RSS](https://hnrss.github.io/) — Custom feeds for keywords, points, and replies.
- [F5Bot](https://f5bot.com/) — Email alerts when your keywords are mentioned on Hacker News.

### Jobs

- [HN Hiring](https://hnhiring.com/) — Search jobs from the monthly Who Is Hiring threads.

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

Cloudflare installs the locked development dependency automatically. Pushes to `main` rebuild the directory. Pull requests are validated by GitHub Actions.

For an authenticated local deployment:

```sh
npx wrangler login
npm run deploy
```

## Suggesting a new site (Pull Request)

We welcome suggestions! If you want to add a new site or update an existing entry, please open a Pull Request:

1. Add your entry to [`data/sites.json`](data/sites.json).
2. Check our [Curation Policy](CURATION.md) for criteria (active within 180 days, verifiable popularity or discussion source).
3. Run `npm run check` to validate data schema and update the directory section in this README.
4. Commit both files and submit your PR. GitHub Actions will test and verify the change automatically.

For more details, see [CONTRIBUTING.md](CONTRIBUTING.md).

## References

- [cheeaun/awesome-hacker-news](https://github.com/cheeaun/awesome-hacker-news) — primary reference for established projects.
- [HackerBooks discussion](https://news.ycombinator.com/item?id=50326821) and [HackerHype](http://epestr.com/hackerhype/) — discovery sources for newer HN collections.

Descriptions are independently written. This directory is not affiliated with Hacker News or Y Combinator. Code and original descriptions: [MIT](LICENSE). Listed projects retain their own licenses.
