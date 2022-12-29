import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";

import { HelmAddOn, HelmAddOnUserProps } from "../../../lib/addons";
import { ClusterInfo } from "../../../lib/spi/types";
import { createNamespace } from "../../../lib/utils/namespace-utils";

/**
 * Configuration options for the FluentBit add-on.
 */
export interface GrafanaAddOnProps extends HelmAddOnUserProps {
  /**
   * Iam policies for the add-on.
   */
  iamPolicies?: PolicyStatement[];
}
/**
 * Default props for the add-on.
 */
const defaultProps: GrafanaAddOnProps = {
  name: "grafana",
  chart: "grafana",
  release: "blueprints-addon-aws-for-fluent-bit",
  version: "6.48.2",
  repository: "https://grafana.github.io/helm-charts",
  namespace: "grafana",
  values: {
    "persistence.enabled": true,
    "persistence.storageClassName": "gp2",
    "service.type": "LoadBalancer",
  },
};

export class GrafanaAddOn extends HelmAddOn {
  readonly options: GrafanaAddOnProps;

  constructor(props?: GrafanaAddOnProps) {
    super({ ...(defaultProps as any), ...props });
    this.options = this.props;
  }

  deploy(clusterInfo: ClusterInfo): Promise<Construct> {
    const cluster = clusterInfo.cluster;

    // Create the Grafana namespace.
    const namespace = this.options.namespace;
    createNamespace(this.options.namespace!, cluster, true);

    // Create the Grafana service account.
    const serviceAccountName = "grafana-sa";
    const sa = cluster.addServiceAccount(serviceAccountName, {
      name: serviceAccountName,
      namespace: namespace,
    });

    // Apply additional IAM policies to the service account.
    const policies = this.options.iamPolicies || [];
    policies.forEach((policy: PolicyStatement) => sa.addToPrincipalPolicy(policy));

    // Configure values.
    const values = {
      serviceAccount: {
        name: serviceAccountName,
        create: false,
      },
      ...this.options.values,
    };

    const helmChart = this.addHelmChart(clusterInfo, values);
    return Promise.resolve(helmChart);
  }
}
