var run = require('gen-run');

run(function* () {
  for (var i = 0; i < 10; i++) {
    console.log(i);
    yield sleep(400);
  }
  console.log(i);
});

function sleep(ms) {
  return function (callback) {
    setTimeout(callback, ms);
  };
}
