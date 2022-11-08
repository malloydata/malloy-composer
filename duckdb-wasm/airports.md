# Test

## Queries in `imdb.malloy`

<!-- ### <!--malloy-query model="Airports" source="airports" query="by_state"--> `by_state` -->


<!-- malloy-query  
  name="By State"
  description="Show number of airports by state." 
  renderer="dashboard"
  model="Airports"
-->
```malloy
query: foo is airports -> by_state { where: 1 = 1 }
```

<!-- malloy-set-model model="Airports" -->


<!-- malloy-query  
  name="All States"
  description="Show all the states." 
  renderer="dashboard"
-->
```malloy
query: foo is airports -> { group_by: state }
```

<!-- malloy-query  
  name="Broken Query"
  description="This should break." 
  renderer="dashboard"
-->
```malloy
query: foo is table('airports.parquet') -> { group_by: state }
```