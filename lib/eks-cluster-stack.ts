import { Construct } from "constructs";
import { Stack, StackProps } from "aws-cdk-lib";
import { aws_eks as eks } from "aws-cdk-lib";
import { aws_ec2 as ec2 } from "aws-cdk-lib";

export class EksClusterStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // provisiong a cluster
    const cluster = new eks.Cluster(this, "custom-eks-cluster", {
      version: eks.KubernetesVersion.V1_20,
      defaultCapacity: 0,
    });
    cluster.addNodegroupCapacity("custom-node-group", {
      desiredSize: 2,
      minSize: 1,
      maxSize: 2,
      instanceTypes: [
        ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MEDIUM),
      ],
      //for testing purpose to be able to
      //ssh directly to the node using a public IP
      remoteAccess: { sshKeyName: "eks-nodes" },
      subnets: { subnetType: ec2.SubnetType.PUBLIC },
    });
  }
}
