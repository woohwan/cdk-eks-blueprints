import { CoreAddOn, CoreAddOnProps } from "../core-addon";
import { ClusterInfo } from "../../spi";
import { getAdotCollectorPolicyDocument } from "./iam-policy";
import { dependable, loadYaml, readYamlDocument } from "../../utils";
import { KubernetesManifest } from "aws-cdk-lib/aws-eks";
import { Construct } from "constructs";
import { CertManagerAddOn } from "../cert-manager";
import { string } from "zod";
import { type } from "os";

/**
 * Configuration options for the Adot add-on.
 */
type AdotCollectorAddOnProps = CoreAddOnProps;

// v0.66.0-eksbuild.1, v0.58.0-eksbuild.1
const defaultProps = {
  addOnName: "adot",
  version: "v0.58.0-eksbuild.1",
  saName: "adot-collector",
  policyDocumentProvider: getAdotCollectorPolicyDocument,
  namespace: "default",
};

// aws-otel-collector 버전 수정하기 위해 생성
export type otelProps = {
  version: string;
};
/**
 * Implementation of Adot Collector EKS add-on.
 */
export class AdotCollectorAddOn extends CoreAddOn {
  constructor(props?: AdotCollectorAddOnProps, addProps?: otelProps) {
    super({ ...defaultProps, ...addProps, ...props });
  }
  @dependable(CertManagerAddOn.name)
  deploy(clusterInfo: ClusterInfo): Promise<Construct> {
    const cluster = clusterInfo.cluster;
    // Applying ADOT Permission manifest
    const otelPermissionsDoc = readYamlDocument(
      __dirname + "/otel-permissions.yaml"
    );
    const otelPermissionsManifest = otelPermissionsDoc
      .split("---")
      .map((e) => loadYaml(e));
    const otelPermissionsStatement = new KubernetesManifest(
      cluster.stack,
      "adot-addon-otelPermissions",
      {
        cluster,
        manifest: otelPermissionsManifest,
        overwrite: true,
      }
    );

    const addOnPromise = super.deploy(clusterInfo);
    addOnPromise.then((addOn) =>
      addOn.node.addDependency(otelPermissionsStatement)
    );
    return addOnPromise;
  }
}
