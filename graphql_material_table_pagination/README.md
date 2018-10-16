# About

Paginate using GraphQL Cursors and Material Table.

![Recording](screenshots/recording.gif)

## External Requirements

In this Exapmle I used [Postgres](https://www.postgresql.org/) and [postgraphile](https://github.com/graphile/postgraphile).

Entrypoint may be found in `src/app/app.module.ts:98` or `http://localhost:5000/graphql`

```bash
postgraphile --connection=postgres://user@host:5432/db_name --cors --dynamic-json --watch
```