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
    const ensureCreate = dynamodb.createTable(tableDef).promise();
    return dynamodb.deleteTable(
        {'TableName': tableDef['TableName']})
        .promise()
        .then(ensureCreate)
        .catch(ensureCreate);
};

function populateTable(tableDef, content) {
    const keyField = tableDef['AttributeDefinitions'][0]['AttributeName'];
    const valueField = tableDef['AttributeDefinitions'][1]['AttributeName'];
    const items = new Array();
    for(item in content) {
        const kvItem = {};
        kvItem[keyField] = {S: item};
        kvItem[valueField] = {S: content[item]} 
        items.push({PutRequest: {Item: kvItem}});
    };
    const requests = {};
    requests[tableDef['TableName']] = items;
    return dynamodb.batchWriteItem({'RequestItems': requests}).promise();
};

exports.handle = function(e, ctx, cb) {
    createTable(projectsTable)
    .then(populateTable(projectsTable, projectMap))
    .then((data) => {
        cb(null, {status: 'OK'});
    })
    .catch((err) => {
        console.log(err, err.stack);
        cb(null, { status: 'Error: ' + err });
    });
};
