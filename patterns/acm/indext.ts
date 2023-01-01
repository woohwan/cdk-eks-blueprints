import { Construct } from "constructs";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as cdk from "aws-cdk-lib";
import * as route53 from "aws-cdk-lib/aws-route53";

export interface CertificateProps extends cdk.StackProps {
  zoneName: string;
  domainName: string;
  certificateName?: string;
}

export class CertificateStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: CertificateProps) {
    super(scope, id, props);
    const domainName = props.domainName;
    const hostedZone = route53.HostedZone.fromLookup(this, "Zone", { domainName });
    const certificate = new acm.DnsValidatedCertificate(this, "Certificate", {
      region: props?.env?.region!,
      hostedZone: hostedZone,
      domainName: domainName,
      subjectAlternativeNames: [`*.${domainName}`],
      validation: {
        method: acm.ValidationMethod.DNS,
        props: {
          validationDomains: {
            [domainName]: domainName,
            [`*.${domainName}`]: `*:${domainName}`,
          },
        },
      },
    });
    // const certificate = new acm.Certificate(this, "Certificate", {
    //   domainName: domainName,
    //   certificateName: props.certificateName || id + "-certificate", // Optionally provide an certificate name
    //   validation: acm.CertificateValidation.fromDns(hostedZone),
    // });
  }
}
