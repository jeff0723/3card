export type AmplifyDependentResourcesAttributes = {
    "api": {
        "3card": {
            "GraphQLAPIKeyOutput": "string",
            "GraphQLAPIIdOutput": "string",
            "GraphQLAPIEndpointOutput": "string"
        }
    },
    "auth": {
        "3card": {
            "IdentityPoolId": "string",
            "IdentityPoolName": "string"
        }
    },
    "analytics": {
        "3cardKinesis": {
            "kinesisStreamArn": "string",
            "kinesisStreamId": "string",
            "kinesisStreamShardCount": "string"
        }
    }
}