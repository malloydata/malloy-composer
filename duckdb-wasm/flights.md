# FLIGHTS FUN

<!-- malloy-query  
  name="Carriers"
  description="All the carriers." 
  renderer="bar_chart"
  model="Flights"
-->
```malloy
query: foo is flights -> { group_by: carrier; aggregate: flight_count is count() }
```