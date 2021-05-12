import {
  LambdaClient,
  InvokeCommand,
} from "@aws-sdk/client-lambda";
//import { CognitoIdentityClient } from "client-cognito-identity";
//import { fromCognitoIdentityPool } from "credential-provider-cognito-identity";

// Initialize the Amazon Cognito credentials provider
const REGION = "us-east-1"; // e.g., 'us-east-2'
const lambda = new LambdaClient({
  region: REGION,
  // credentials: fromCognitoIdentityPool({
  //   client: new CognitoIdentityClient({ region: REGION }),
  //  identityPoolId: "IDENTITY_POOL_ID", // IDENTITY_POOL_ID e.g., eu-west-1:xxxxxx-xxxx-xxxx-xxxx-xxxxxxxxx
  //  }),
});

export default function fetchLambda(url, options) {
  lambda.send(
    new InvokeCommand({
      FunctionName: "aegis-dev-html",
      InvocationType: "RequestResponse",
      LogType: "None",
      Payload: {
        path: url,
        httpMethod: options.method,
        body: options.body,
        headers: options.headers,
      },
    }),
    function (err, data) {
      if (err) {
        prompt(err);
      } else {
        return JSON.parse(
          //parse Uint8Array payload to string
          new TextDecoder("utf-8").decode(data.Payload)
        );
      }
    }
  );
}
