# Test

## Queries in `imdb.malloy`

<!-- ### <!--malloy-query model="Airports" source="airports" query="by_state"--> `by_state` -->

Quisque pretium eu libero sed volutpat. Mauris sed luctus ante. Maecenas sit amet quam id massa finibus mollis nec et mi. Vivamus eget consequat justo. Maecenas ut justo urna. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; In blandit turpis vel diam convallis pretium.

<!-- malloy-query  
  name="By State"
  description="Show number of airports by state." 
  renderer="bar_chart"
  model="Airports"
-->
```malloy
query: foo is airports -> by_state { where: 1 = 1 }
```

<!-- malloy-set-model model="Airports" -->
Lorem ipsum dolor sit amet, consectetur adipiscing elit. In dapibus ultricies magna, at ultrices urna viverra vitae. Etiam ante tortor, elementum ut vulputate vel, rhoncus sed lectus. Aenean sit amet neque at lectus lacinia sagittis. Nullam fermentum pellentesque orci ut hendrerit. Nulla facilisi. Nullam blandit justo ac libero sagittis hendrerit. Vivamus purus magna, dapibus eget velit id, tincidunt mattis nisi. Etiam a lorem lectus. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. 

Quisque pretium eu libero sed volutpat. Mauris sed luctus ante. Maecenas sit amet quam id massa finibus mollis nec et mi. Vivamus eget consequat justo. Maecenas ut justo urna. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; In blandit turpis vel diam convallis pretium.

<!-- malloy-query  
  name="All States"
  description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. In dapibus ultricies magna, at ultrices urna viverra vitae. Etiam ante tortor, elementum ut vulputate vel, rhoncus sed lectus. Aenean sit amet neque at lectus lacinia sagittis. Nullam fermentum pellentesque orci ut hendrerit. Nulla facilisi. Nullam blandit justo ac libero sagittis hendrerit. Vivamus purus magna, dapibus eget velit id, tincidunt mattis nisi. Etiam a lorem lectus. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Quisque pretium eu libero sed volutpat. Mauris sed luctus ante. Maecenas sit amet quam id massa finibus mollis nec et mi. Vivamus eget consequat justo. Maecenas ut justo urna. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; In blandit turpis vel diam convallis pretium." 
  renderer="list"
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