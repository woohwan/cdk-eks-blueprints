#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";

// import BlueprintConstruct from '../examples/blueprint-construct';
import ClusterConstruct from "../examples/blueprint-construct/eks-blueprints-stack";

const app = new cdk.App();

const account = process.env.CDK_DEFAULT_ACCOUNT;
const region = process.env.CDK_DEFAULT_REGION;
// const region = "us-east-1";
const env = { account, region };

new ClusterConstruct(app, "cluster", { env });
// new BlueprintConstruct(app, props);
