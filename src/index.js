var http = require('superagent');
var apiURL = 'https://api.ripple.com/v1/accounts/';
var data = require(__dirname+'/../data/data');
var Promise = require('bluebird');
var promiseWhile = require('promise-while')(Promise);
var numTotalAccts = data.length;

var count = 0;

// Parse through and save each result
var acctsWithTrusts = [];
var acctsAffected = [];

promiseWhile(
  function() {
    console.log('Progress:', count, 'out of', numTotalAccts, " = ", (count / numTotalAccts)*100, "%");
    return count < data.length;
},
  function() {
    return new Promise(function(resolve, reject) {
    	http
        .get(apiURL + data[count] + '/trustlines')
        .end(function(err, res) {
          if (err) {
            // console.error('Error:', err);
          }
          else {
            if (res.body.trustlines.length === 0) {
            }
            else {
              acctsWithTrusts.push(data[count-1]);

              var tempData = {};
              for (var i = 0; i < res.body.trustlines.length; i++) {
                var line = res.body.trustlines[i];
                if (tempData[line.currency]) {
                  acctsAffected.push(data[count-1]);
                  break;
                } else {
                  tempData[line.currency] = line.currency;
                }
              }
            }
          }
          resolve();
        })
      count++;
    })
  }
)
.then(function() {
  console.log('SUMMARY');
  console.log('Total number of accounts with trustlines:', acctsWithTrusts.length);
  console.log('Total number of affected accounts:', acctsAffected.length);

  for (var i = 0; i < acctsAffected.length; i++) {
    console.log(acctsAffected[i]);
  }
})
