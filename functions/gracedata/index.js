console.log('starting function');
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

const projectsTable = {
    TableName: 'projects',
    AttributeDefinitions: [
        {AttributeType: 'S', AttributeName: 'name'},
        {AttributeType: 'S', AttributeName: 'url'}
    ],
    KeySchema: [
        {AttributeName: 'name', KeyType: 'HASH'},
        {AttributeName: 'url', KeyType: 'RANGE'}
    ],
    ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1
    }
};

const projectMap = {
    'Entry': 'https://bitbucket.org/cmedtechnology/icewebedc',
    'eSource': 'https://bitbucket.org/cmedtechnology/iceipadapp',
    'Conduct': 'https://bitbucket.org/cmedtechnology/icewebconduct',
    'Loader': 'https://bitbucket.org/cmedtechnology/icewebedcloader',
    'Review': 'https://bitbucket.org/cmedtechnology/icewebreview',
    'Coding': 'https://bitbucket.org/cmedtechnology/icewebmedicalcoding',
    'Manager': 'https://bitbucket.org/cmedtechnology/icewebmanager'
};

function createTable(tableDef) {
    const maybeDelete = dynamodb.deleteTable(
        {'TableName': tableDef['TableName']})
        .promise()
        .catch(() => {
            // do nothing
        })
    return Promise.all([
        maybeDelete,
        dynamodb.createTable(tableDef).promise()]);
};

function populateTable(tableDef, content) {
    const keyField = tableDef['AttributeDefinitions'][0]['AttributeName'];
    
    return Promise.all([
        dynamodb.putItem({
            'TableName': tableDef['TableName']}
            'Item': {
                keyfield: {S: }
            }
        }).promise()
    ]);
};

exports.handle = function(e, ctx, cb) {
    Promise.all([
        createTable(projectsTable)
        populateTable(projectsTable, projectMap)
    ])
    .then((data) => {
        cb(null, {status: 'OK'});
    })
    .catch((err) => {
        console.log(err, err.stack);
        cb(null, { status: 'Error: ' + err });
    });

};
