#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import * as codebuild from '@aws-cdk/aws-codebuild';
import * as logs from '@aws-cdk/aws-logs';
import { PolicyStatement } from '@aws-cdk/aws-iam';

const app = new cdk.App();

export class CiStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Setup the CodeBuild project for our GitHub repo
    const source = codebuild.Source.gitHub({
      owner: 'askulkarni2',
      repo: 'quickstart-ssp-amazon-eks',
      reportBuildStatus: true,
      webhook: true,
      webhookFilters: [
        codebuild.FilterGroup
          .inEventOf(codebuild.EventAction.PULL_REQUEST_MERGED)
      ],
    });

    const project = new codebuild.Project(this, 'QuickstartSspAmazonEksBuild', {
      source,
      projectName: 'QuickstartSspAmazonEksBuild', // to uniquely identify our project
      badge: true, // copy the URL from CLI and update the top level README.md
      buildSpec: codebuild.BuildSpec.fromSourceFilename('ci/buildspec.yml'),
      concurrentBuildLimit: 1, // so that we don't exceed any account limits
      logging: {
        cloudWatch: {
          logGroup: new logs.LogGroup(this, `QuickstartSspAmazonEksBuildLogGroup`),
        }
      }, 
    });
    project.addToRolePolicy(new PolicyStatement({
      resources: [`arn:${cdk.Aws.PARTITION}:iam::${cdk.Aws.ACCOUNT_ID}:role/cdk-${cdk.DefaultStackSynthesizer.DEFAULT_QUALIFIER}-deploy-role-${cdk.Aws.ACCOUNT_ID}-${cdk.Aws.REGION}`],
      actions: ['sts:AssumeRole']
    }))
  }
}

new CiStack(app, 'CiStack');