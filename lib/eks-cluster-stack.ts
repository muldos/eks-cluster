import { Construct } from "constructs";
import { Stack, StackProps, Tags, CfnParameter, CfnOutput } from "aws-cdk-lib";
import { aws_eks as eks } from "aws-cdk-lib";
import { aws_s3 as s3 } from "aws-cdk-lib";
import { aws_iam as iam } from "aws-cdk-lib";
import { aws_ec2 as ec2 } from "aws-cdk-lib";

export class EksClusterStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    const prefix = this.node.tryGetContext("resourcesPrefix");
    // provisionning a cluster
    const cluster = new eks.Cluster(this, `${prefix}-cluster`, {
      version: eks.KubernetesVersion.V1_21,
      defaultCapacity: 0,
    });

    // create a managed node group for the cluster
    cluster.addNodegroupCapacity(`${prefix}-nodegroup`, {
      desiredSize: 2,
      minSize: 0,
      maxSize: 3,
      instanceTypes: [
        ec2.InstanceType.of(ec2.InstanceClass.M5, ec2.InstanceSize.LARGE),
      ],
    });
    // create a file store bucket
    const filestoreBucket = new s3.Bucket(this, `${prefix}-filestore`, {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });
    const roleName = `${prefix}-s3filestore-rw-role`;
    const serviceAccRole = new iam.Role(this, roleName, {
      assumedBy: new iam.WebIdentityPrincipal(
        //using this property will auto create the eks oidc provider (lazy init)
        cluster.openIdConnectProvider.openIdConnectProviderArn
      ),
      managedPolicies: [],
      roleName: roleName,
      description:
        "This role is used via artifactory pods service accounts to use the filestore bucket",
    });
    filestoreBucket.grantReadWrite(serviceAccRole);
    // create Cloudformation output for convenience
    new CfnOutput(this, "ArtifactoryServiceAccountRoleArn", {
      value: serviceAccRole.roleArn,
    });
    new CfnOutput(this, "ArtifactoryFilestoreBucketName", {
      value: filestoreBucket.bucketName,
    });
    Tags.of(cluster).add("jfrog:owner", prefix);
    Tags.of(cluster).add("jfrog:env", "soleng-demo");
  }
}
