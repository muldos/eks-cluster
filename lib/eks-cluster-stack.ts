import { Construct } from "constructs";
import { Stack, StackProps, Tags, CfnParameter, CfnOutput } from "aws-cdk-lib";
import { aws_eks as eks } from "aws-cdk-lib";
import { aws_s3 as s3 } from "aws-cdk-lib";
import { aws_iam as iam } from "aws-cdk-lib";
import { aws_ec2 as ec2 } from "aws-cdk-lib";
import * as rds from 'aws-cdk-lib/aws-rds';

export class EksClusterStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    const prefix = this.node.tryGetContext("resourcesPrefix");
    const dbLogin = this.node.tryGetContext("dbLogin");
    const dbPwd = this.node.tryGetContext("dbPwd");

    // provisionning an EKS cluster and setup the alb ingress controller
    const cluster = new eks.Cluster(this, `${prefix}-cluster`, {
      version: eks.KubernetesVersion.V1_21,
      defaultCapacity: 0,
      albController: {
        version: eks.AlbControllerVersion.V2_4_1,
      }, 
    });

    // create a managed node group for the cluster
    const nodeGroup = cluster.addNodegroupCapacity(`${prefix}-nodegroup`, {
      desiredSize: 2,
      minSize: 0,
      maxSize: 3,
      instanceTypes: [
        ec2.InstanceType.of(ec2.InstanceClass.M5, ec2.InstanceSize.LARGE),
      ],
    });
    // create a filestore bucket
    const filestoreBucket = new s3.Bucket(this, `${prefix}-filestore`, {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });
    // create an IAM role with read / write permissions on this bucket and add the cluster's OIDC provider as trusted entity to this role
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
    // now let's create an RDS database in one of the private subnets of the cluster's VPC
    //First create a security group that will allow postgresql traffic coming from eks nodes
    // 👇 Create a SG for a web server
    const dbSG = new ec2.SecurityGroup(this, `${prefix}-eks-db-secgrp`, {
      vpc: cluster.vpc,
      allowAllOutbound: true,
      description: 'security group to allow PGSQL traffic from eks nodes',
    });

    dbSG.addIngressRule(cluster.clusterSecurityGroup,  ec2.Port.tcp(5432), 'allow postgres from cluster nodes');
    const dbInstance = new rds.DatabaseInstance(this, `${prefix}-db`, {
      engine: rds.DatabaseInstanceEngine.postgres({ version: rds.PostgresEngineVersion.VER_13_4 }),
      // T3.medium
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE3, ec2.InstanceSize.MEDIUM),
      securityGroups: [dbSG],
      credentials: rds.Credentials.fromPassword(dbLogin, dbPwd),
      vpc: cluster.vpc,
      vpcSubnets: {
        
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      }
    });

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
