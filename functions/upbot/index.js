console.log('starting function')
const AWS = require('aws-sdk');
const lexmodelbuildingservice = new AWS.LexModelBuildingService({apiVersion: '2017-04-19'});

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

const intent = {
    name: 'CodeRepositories',
    sampleUtterances: [
        "Where is the source code?",
        "What is the code repository for {project}?",
        "Where is the code repository for {project}?",
        "Where is the code for {project}?",
        "What is the repository for {project} source code?"
    ],
    slots: [{
        name: "project",
        description: "The name of a project.",
        priority: 3,
        valueElicitationPrompt: {
            maxAttempts: 1,
            messages: [
                {contentType: "PlainText", content: "For what project?"},
                {contentType: "PlainText", content: "What project?"}
            ]
        },
        sampleUtterances: [
            "Project {project}",
            "App {project}",
            "Webapp {project}",
            "For {project}"
        ],
        slotConstraint: "Required",
        slotType: "ProjectName",
        slotTypeVersion: "$LATEST"
    }],
    confirmationPrompt: {
        maxAttempts: 1,
        messages: [
            {contentType: "PlainText", content: "pls cnfrm"}
        ]
    },
    rejectionStatement: {
        messages: [
            {contentType: "PlainText", content: "k thnx bye"}
        ]
    },
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
    
    const c1 = lexmodelbuildingservice
        .getSlotType({name: projectName.name, version: "$LATEST"})
        .promise()
        .then((data) => {
            projectName.checksum = data.checksum;
            console.log('XXX', data.name, data.checksum);
            return lexmodelbuildingservice.putSlotType(projectName).promise();
        })
        .catch(() => {});
    const c2 = lexmodelbuildingservice
        .getIntent({name: intent.name, version: "$LATEST"})
        .promise()
        .then((data) => {
            intent.checksum = data.checksum;
            console.log('YYY', data.name, data.checksum);
        })
        .catch(() => {});
    
    Promise
        .all([c1, c2])
        .then(() => {
            return lexmodelbuildingservice.putIntent(intent).promise();
        })
        .then((data) => {
            cb(null, data);
        })
        .catch((err) => {
            console.log(err, err.stack);
            cb(null, { status: 'Error: ' + err });
        });
};
