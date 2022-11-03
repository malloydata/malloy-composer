# About the IMDb Dataset

IMDb makes data available for download via [their website](https://www.imdb.com/interfaces/). 
Used with permission. 
For personal / educational use only.


## Tables

**People** - All of the people who worked on a title, ranging from actors and directors to composers and crew.

**Movies** - The `titles` table (aliased to `movies` in the model) has been filtered only to titles with > 10,000 ratings. Note: This model frequently uses `ratings.numVotes`, the number of votes the title has received. Where `ratings.averageRating` of course indicates how much people _liked_ a movie, `numVotes` is a better proxy for overall popularity of a title. 

**Principals** A mapping table between people and titles, principals links the cast/crew to the titles they worked on.


## Queries in `imdb.malloy`

### <!--malloy-query model="airports.malloy" source="airports" query="by_state"--> `by_state`