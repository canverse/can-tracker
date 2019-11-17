const mkt = require('can-mktorrent');


mkt({
  announceUrls: ['http://localhost:32323/cantracker/announce'],
}).then(() => {
  console.log('here');
});
;
