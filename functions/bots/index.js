console.log('starting function')
const AWS = require('aws-sdk');
const lexmodelbuildingservice = new AWS.LexModelBuildingService({apiVersion: '2017-04-19'});



exports.handle = function(e, ctx, cb) {
    console.log('processing event: %j', e)
    const params = {
        maxResults: 5, 
        nextToken: ""
    };
    lexmodelbuildingservice.getBots(params, function(err, data) {
        if (err) { // an error occurred
            console.log(err, err.stack);
            cb(null, { status: 'Error: ' + err });
            return;
        }
        cb(null, { the_bots: data.bots });
    });
}
