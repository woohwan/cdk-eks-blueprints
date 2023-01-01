import { CertificateStack } from "./../patterns/acm/indext";
import * as cdk from "aws-cdk-lib";

// import BlueprintConstruct from '../examples/blueprint-construct';
import ClusterConstruct from "../patterns/blueprint-construct/eks-blueprints-stack";

const app = new cdk.App();

const account = process.env.CDK_DEFAULT_ACCOUNT;
const region = process.env.CDK_DEFAULT_REGION;
// const region = "us-east-1";
const env = { account, region };

const certiStack = new CertificateStack(app, "acm-stack", {
  env: env,
  zoneName: "steve-aws.com",
  domainName: "steve-aws.com",
  certificateName: "keycloack",
});
// 생성한 인증서를 cluster로 넘겨 줌: optional
new ClusterConstruct(app, "cluster", { env, certificate: certiStack.certificate });
