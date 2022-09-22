import { Construct } from "constructs";
import { Stack, StackProps, Tags } from "aws-cdk-lib";
import { aws_eks as eks } from "aws-cdk-lib";
import { aws_ec2 as ec2 } from "aws-cdk-lib";

export class EksClusterStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // provisionning a cluster
    const cluster = new eks.Cluster(this, "davidro-emea-demo-cluster", {
      version: eks.KubernetesVersion.V1_21,
      defaultCapacity: 0,
    });
    cluster.addNodegroupCapacity("davidro-emea-demo-nodegroup", {
      desiredSize: 3,
      minSize: 0,
      maxSize: 3,
      instanceTypes: [
        ec2.InstanceType.of(ec2.InstanceClass.M5, ec2.InstanceSize.LARGE),
      ]
      //for testing purpose to be able to
      //ssh directly to the node using a public IP
     /*
     
      remoteAccess: { sshKeyName: "davidro-emea-laptop" },
      subnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },*/
    });
    Tags.of(cluster).add('jfrog:owner', 'davidro-emea');
    Tags.of(cluster).add('jfrog:env', 'soleng-demo');
 
  }
}
