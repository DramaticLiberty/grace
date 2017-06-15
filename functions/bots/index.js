console.log('starting function')
const AWS = require('aws-sdk');
const lexmodelbuildingservice = new AWS.LexModelBuildingService({apiVersion: '2017-04-19'});

const projectName = {
    name: 'ProjectName',
    description: 'The names of all our projects'
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
        "What is the code repository for {Project}?",
        "Where is the code repository for {Project}?",
        "Where is the code for {Project}?",
        "What is the repository for {Project} source code?"
    ],
    slots: [{
        name: "Project",
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
            "Project {Project}.",
            "App {Project}.",
            "Webapp {Project}."
            "{Project}."
        ],
        slotConstraint: "Required",
        slotType: "ProjectName",
        slotTypeVersion: "$LATEST"
    }],
    confirmationPrompt: {
        maxAttempts: 0,
        messages: []
    },
    rejectionStatement: {
        messages: []
    },
    conclusionStatement: {
        messages: [
            {contentType: "PlainText", content: "Anything else?"},
            {contentType: "PlainText", content: "Can I help with anything else?"}
        ],
        responseCard: "foo"
    },
    fulfillmentActivity: {
        type: "ReturnIntent"
    }
};

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
};
