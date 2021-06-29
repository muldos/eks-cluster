import * as cdk from '@aws-cdk/core';
import * as eks from '@aws-cdk/aws-eks';
import * as ec2 from '@aws-cdk/aws-ec2';
export class EksClusterStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // provisiong a cluster
const cluster = new eks.Cluster(this, 'custom-eks-cluster', {
  version: eks.KubernetesVersion.V1_20,
  defaultCapacity:0
});
cluster.addNodegroupCapacity('custom-node-group', {
  desiredSize: 1,
  minSize: 1,
  instanceTypes: [ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MEDIUM)],
  remoteAccess: {sshKeyName: "eks-nodes"}
});
  }
}
