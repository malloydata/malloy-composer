## What is this?

[Malloy Composer](https://github.com/malloydata/malloy-composer) is an open source tool for viewing and exploring data sets. Data models are created in the [Malloy](https://github.com/malloydata/malloy/) language. Data can be served from a simple webserver or from a SQL database.

See the [Malloy source code](https://github.com/malloydata/malloy-samples/tree/main/bigquery/hackernews) for this data set.

## Queries

<!-- malloy-query
  name="Carriers"
  description="All the carriers."
  renderer="bar_chart"
  model="./flights.malloy"
-->

```malloy
query: foo is flights -> { group_by: carrier; aggregate: flight_count is count() }
```

<!-- malloy-source
  title="Flights"
  description="All the flights."
  source="flights"
  model="./flights.malloy"
-->

<!-- malloy-query
  name="New Query"
  description="Add a description here."
  model="/flights.malloy"
-->

```malloy
query: new_query is carriers -> {
  group_by:
    code
    name
    nickname
}
```
