console.log('starting function')
const AWS = require('aws-sdk');
const lexmodelbuildingservice = new AWS.LexModelBuildingService({apiVersion: '2017-04-19'});
const dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

/*
  Intent slot types
*/
const projectName = {
    name: 'ProjectName',
    description: 'The names of all our projects',
    enumerationValues: [
        {value: 'Entry'},
        {value: 'eSource'},
        {value: 'Conduct'},
        {value: 'Loader'},
        {value: 'Review'},
        {value: 'Coding'},
        {value: 'Manager'}
    ]
};
const projectRepository = {
    name: 'ProjectRepository',
    description: 'The url of the project source code repository',
    priority: 4
};


function readSlotType(tableName, tableAttr, slotType) {
    return Promise.all([
        lexmodelbuildingservice
            .getSlotType({name: slotType.name, version: "$LATEST"})
            .promise(),
        dynamodb
            .scan({TableName: tablename})
            .promise()
    ]).then((data) => {
        slotType.checksum = data[0].checksum;
        
        const values = new Array();
        for(item in data[1]['Items']) {
            values.push({value: item[tableAttr]['S']});
        }
        slotType['enumerationValues'] = values;
        
        return lexmodelbuildingservice.putSlotType(slotType).promise();
    }).catch(() => {});
};


/** 
 * Intent slots
 */
const projectNameSlot = {
    name: "project",
    description: "The name of the project.",
    priority: 3,
    valueElicitationPrompt: {
        maxAttempts: 2,
        messages: [
            {contentType: "PlainText", content: "What is the name of the project?"},
            {contentType: "PlainText", content: "Project name please?"},
            {contentType: "PlainText", content: "Project name?"},
            {contentType: "PlainText", content: "What project?"}
        ]
    },
    sampleUtterances: [
        "Project {project} ",
        "App {project} ",
        "Webapp {project} ",
        "For {project} "
    ],
    slotConstraint: "Required",
    slotType: "ProjectName",
    slotTypeVersion: "$LATEST"
};
const projectRepositorySlot = {
    name: 'repository',
    description: 'The url of the project source code repository.',
    priority: 4,
    valueElicitationPrompt: {
        maxAttempts: 2,
        messages: [
            {contentType: "PlainText", content: "What is the repository for {project}?"},
            {contentType: "PlainText", content: "What is bitbucket url for {project}?"}
        ]
    },
    sampleUtterances: [
        "In bitbucket {repository} ",
        "At {repository} ",
        "Webapp {repository} ",
        "For {repository} "
    ],
    slotConstraint: "Required",
    slotType: "ProjectRepository",
    slotTypeVersion: "$LATEST"
};

const rejections = {
    messages: [
        {contentType: "PlainText", content: "k thnx bye"},
        {contentType: "PlainText", content: "I have so many stories"},
        {contentType: "PlainText", content: "I'm just a bot and I don't understand everything"},
        {contentType: "PlainText", content: "I didn't understand that. How about a pug?"}
    ]
};


/**
 * The Intents
 */
const addProject = {
    name: 'AddCodeRepositories',
    sampleUtterances: [
        'I have created a new project',
        'We have a new project',
        'A new project has been created',
        'Project {project} is new and its repository is {repository} '
    ],
    slots: [projectNameSlot, projectRepositorySlot],
    confirmationPrompt: {
        maxAttempts: 1,
        messages: [
            {contentType: "PlainText", content: "Please confirm that {project} is here {repository}"},
            {contentType: "PlainText", content: "Should I learn that {project} is here {repository}?"}
        ]
    },
    rejectionStatement: rejections,
    fulfillmentActivity: {
        type: "ReturnIntent"
    }
};

const getRepository = {
    name: 'CodeRepositories',
    sampleUtterances: [
        "Where is the source code",
        "What is the code repository for {project} ",
        "Where is the code repository for {project} ",
        "Where is the code for {project} ",
        "What is the repository for {project} source code "
    ],
    slots: [projectNameSlot],
    confirmationPrompt: {
        maxAttempts: 1,
        messages: [
            {contentType: "PlainText", content: "pls cnfrm"}
        ]
    },
    rejectionStatement: rejections,
    /*
       For some reason lex does not like this
       conclusionStatement: {
       messages: [
       {contentType: "PlainText", content: "Anything else?"},
       {contentType: "PlainText", content: "Can I help with anything else?"}
       ],
        responseCard: "string"
    },
    */
    fulfillmentActivity: {
        type: "ReturnIntent"
    }
};


exports.handle = function(e, ctx, cb) {
    console.log('processing event: %j', e);
    
    const c1 = readSlotType('projects', 'name', projectName);
    
    const c2 = lexmodelbuildingservice
        .getIntent({name: getRepository.name, version: "$LATEST"})
        .promise()
        .then((data) => {
            getRepository.checksum = data.checksum;
            console.log('YYY', data.name, data.checksum);
        })
        .catch(() => {});
    
    Promise
        .all([c1, c2])
        .then(() => {
            return lexmodelbuildingservice.putIntent(getRepository).promise();
        })
        .then((data) => {
            cb(null, data);
        })
        .catch((err) => {
            console.log(err, err.stack);
            cb(null, { status: 'Error: ' + err });
        });
};
