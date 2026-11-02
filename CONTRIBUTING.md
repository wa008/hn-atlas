# Contributing

To suggest a new site or update an existing one in HN Atlas, open a Pull Request.

## How to submit a Pull Request

1. Read [CURATION.md](CURATION.md) for inclusion criteria.
2. Add your entry to [`data/sites.json`](data/sites.json).
3. Assign one of the valid categories:
   - `books` (Books)
   - `videos` (Videos)
   - `games` (Games)
   - `knowledge` (Knowledge)
   - `reading` (Blogs & digests)
   - `readers` (HN readers)
   - `products` (Product discovery)
   - `search` (Search & feeds)
   - `jobs` (Jobs)
4. Provide verifiable evidence:
   - **Activity**: Recent launch, commit, release, or article within 180 days.
   - **Popularity**: HN points (>=50), GitHub stars (>=100), or an editorial rationale.
5. Run the repository checks and build:
   ```sh
   npm ci
   npm run check
   ```
   This formats the data, checks schema and constraints, and regenerates the directory in `README.md`.
6. Commit `data/sites.json` and `README.md`, then submit your Pull Request. GitHub Actions will validate the build automatically.

Please do not include tracking parameters, affiliate links, or promotional marketing copy.
