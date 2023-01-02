import { CertificateProps } from "./../acm/indext";
import { KeyCloakAddOnProps } from "./../addons/keycloak/index";
import { ICertificate } from "aws-cdk-lib/aws-certificatemanager";
// lib/eks-blueprints-stack.ts
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as blueprints from "../../lib";
import { DeploymentMode } from "../../lib";
import { otelProps } from "../../lib";
import { GrafanaAddOn } from "../addons/grafana";
import { KeycloakAddOn } from "../addons/keycloak";
import { GlobalResources, ImportHostedZoneProvider } from "../../lib";

export interface ClusterProps extends cdk.StackProps {
  certificate?: ICertificate;
}

export default class ClusterConstruct extends Construct {
  readonly certificate: ICertificate;
  constructor(scope: Construct, id: string, props?: ClusterProps) {
    super(scope, id);

    const account = props?.env?.account!;
    const region = props?.env?.region!;

    // ACM Certificate for '*.steve-aws.com' : Optional
    const certificateArn = props?.certificate?.certificateArn;
    // ADOT
    const versionProps: otelProps = {
      version: "v0.66.0-eksbuild.1",
    };

    const addOns: Array<blueprints.ClusterAddOn> = [
      // EKS Managed Addon
      new blueprints.VpcCniAddOn(),
      new blueprints.CoreDnsAddOn(),
      new blueprints.KubeProxyAddOn(),

      // Addons...
      new blueprints.EfsCsiDriverAddOn(),
      new blueprints.addons.EbsCsiDriverAddOn(),
      new blueprints.addons.CertManagerAddOn({
        installCRDs: true,
        createNamespace: true,
      }),

      new blueprints.ExternalDnsAddOn({
        hostedZoneResources: [blueprints.GlobalResources.HostedZone],
      }),

      new blueprints.addons.AwsLoadBalancerControllerAddOn(),
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
      new GrafanaAddOn(),
      new KeycloakAddOn({
        amgWorkspaceId: "g-ed244f2cad.grafana-workspace.ap-northeast-2.amazonaws.com",
      }),
    ];

    const blueprint = blueprints.EksBlueprint.builder()
      .account(account)
      .region(region)
      // for external DNS, register resource provider
      .resourceProvider(GlobalResources.HostedZone, new ImportHostedZoneProvider("Z0582530BV26P4AI9BGR", "steve-aws.com"))
      .addOns(...addOns)
      .teams()
      .build(scope, id + "-stack");
  }
}
