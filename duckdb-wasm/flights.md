# FLIGHTS FUN

<!-- malloy-query  
  name="Carriers"
  description="All the carriers." 
  renderer="dashboard"
  model="Flights"
-->
```malloy
query: foo is flights -> { group_by: carrier }
```