// lib/eks-blueprints-stack.ts
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as blueprints from "../../lib";
import { DeploymentMode } from "../../lib";
import { otelProps } from "../../lib";

export default class ClusterConstruct extends Construct {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id);

    const account = props?.env?.account!;
    const region = props?.env?.region!;
    const versionProps: otelProps = {
      version: "v0.66.0-eksbuild.1",
    };

    const addOns: Array<blueprints.ClusterAddOn> = [
      new blueprints.addons.CertManagerAddOn({
        installCRDs: true,
        createNamespace: true,
      }),
      new blueprints.addons.AdotCollectorAddOn(undefined, versionProps),
      new blueprints.addons.MetricsServerAddOn(),
      new blueprints.addons.PrometheusNodeExporterAddOn({
        version: "4.8.1",
      }),
      new blueprints.addons.KubeStateMetricsAddOn(),
      new blueprints.addons.AmpAddOn({
        prometheusRemoteWriteURL:
          "https://aps-workspaces.us-east-1.amazonaws.com/workspaces/ws-9953dc48-606f-4a85-ac53-4b7dec289572/api/v1/remote_write",
        deploymentMode: DeploymentMode.DEPLOYMENT,
        namespace: "default",
        name: "adot-collector-amp",
        // lib/amp 수정: 다른 region의 amp에 접속 가능
        region: "us-east-1",
      }),
    ];

    const blueprint = blueprints.EksBlueprint.builder()
      .account(account)
      .region(region)
      .addOns(...addOns)
      .teams()
      .build(scope, id + "-stack");
  }
}
