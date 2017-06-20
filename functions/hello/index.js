console.log('starting function')
const AWS = require('aws-sdk');
const lexruntime = new AWS.LexRuntime({apiVersion: '2016-11-28'});


exports.handle = function(e, ctx, cb) {
    console.log('processing event: %j', e);
    const text = 'Hi there!';
    lexruntime
        .postText({botName: 'grace', botAlias: 'grace', userId: 'Jane', inputText: text})
        .promise()
        .then((data) => {
            cb(null, data);
        })
        .catch((err) => {
            console.log(err, err.stack);
            cb(null, { status: 'Error: ' + err });
        });
};
