import * as cdk from "aws-cdk-lib";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";
// import merge from "ts-deepmerge";

import { HelmAddOn, HelmAddOnUserProps } from "../../../lib/addons";
import { ClusterInfo } from "../../../lib/spi/types";
import { createNamespace } from "../../../lib/utils/namespace-utils";

// import { keycloakConfigCli } from "./keycloakcli-config";
const { interpolation } = require("interpolate-json");
/**
 * Configuration options for the keycloak add-on.
 */
export interface KeyCloakAddOnProps extends HelmAddOnUserProps {
  /**
   * Iam policies for the add-on.
   */
  iamPolicies?: PolicyStatement[];
  amgWorkspaceId?: {};
}
/**
 * Default props for the add-on.
 */

const defaultProps: KeyCloakAddOnProps = {
  name: "keycloak",
  chart: "keycloak",
  release: "keyclaok",
  version: "13.0.0",
  repository: "https://charts.bitnami.com/bitnami",
  namespace: "keycloak",
  values: {
    global: {
      storageClass: "gp2",
    },
    auth: {
      adminUser: "admin",
      adminPassword: "keycloak",
    },
    service: {
      type: "ClusterIP",
    },
    ingress: {
      enabled: true,
      ingressClassName: "alb",
      pathType: "Prefix",
      annotations: {
        "alb.ingress.kubernetes.io/scheme": "internet-facing",
        "alb.ingress.kubernetes.io/target-type": "ip",
        "alb.ingress.kubernetes.io/listen-ports": '[{"HTTPS":443}]',
        // ACM Certificate을 받아 옴
        "alb.ingress.kubernetes.io/certificate-arn":
          cdk.Fn.importValue("certificateArn"),
      },
      hostname: "keycloak.steve-aws.com",
    },
    keycloakConfigCli: {
      enabled: true,
      image: {
        tag: "5.5.0-debian-11-r16",
      },
      backoffLimit: 6,
      configuration: {
        "realm.json": {
          realm: "keycloak-blog",
          enabled: true,
        },
      },
    },
  },
};

export class KeycloakAddOn extends HelmAddOn {
  readonly options: KeyCloakAddOnProps;

  constructor(props?: KeyCloakAddOnProps) {
    super({ ...(defaultProps as any), ...props });
    this.options = this.props;
  }

  deploy(clusterInfo: ClusterInfo): Promise<Construct> {
    const cluster = clusterInfo.cluster;

    // Create the Keycloak namespace.
    const namespace = this.options.namespace;
    createNamespace(this.options.namespace!, cluster, true);

    // Create the keycloak service account.
    const serviceAccountName = "keycloak-sa";
    const sa = cluster.addServiceAccount(serviceAccountName, {
      name: serviceAccountName,
      namespace: namespace,
    });

    // Apply additional IAM policies to the service account.
    const policies = this.options.iamPolicies || [];
    policies.forEach((policy: PolicyStatement) =>
      sa.addToPrincipalPolicy(policy)
    );

    // keycloakConfigCli configuration
    // let params = {
    //   WORKSPACE_ENDPOINT: this.options.amgWorkspaceId,
    // };
    // const configCli = interpolation.expand(keycloakConfigCli, params);

    // Configure values.
    const values = {
      serviceAccount: {
        name: serviceAccountName,
        create: false,
      },
      ...this.options.values,
      //Add keycloakConfigCli configuration
      // ...configCli,
    };

    const helmChart = this.addHelmChart(clusterInfo, values);
    return Promise.resolve(helmChart);
  }
}
