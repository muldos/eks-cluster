# EKS Cluster cheat sheet

```bash
aws2 eks update-kubeconfig --name xyzxa --region eu-west-3 --role-arn arn:aws:iam::123456:role/EksClusterStack-helloeksMastersRoleABC-123 --profile eks
```
```bash
kubectl cluster-info
```
```bash
kubectl create -f api-rc.yaml
```
```bash
kubectl expose rc api-controller --type=LoadBalancer --name graphql-http
```
```bash
kubectl get svc
```
<pre>
 +-----------------------------------------------+               +-----------------+
 |                 EKS Cluster                   |    kubectl    |                 |
 |-----------------------------------------------|<-------------+| Kubectl Handler |
 |                                               |               |                 |
 |                                               |               +-----------------+
 | +--------------------+    +-----------------+ |
 | |                    |    |                 | |
 | | Managed Node Group |    | Fargate Profile | |               +-----------------+
 | |                    |    |                 | |               |                 |
 | +--------------------+    +-----------------+ |               | Cluster Handler |
 |                                               |               |                 |
 +-----------------------------------------------+               +-----------------+
    ^                                   ^                          +
    |                                   |                          |
    | connect self managed capacity     |                          | aws-sdk
    |                                   | create/update/delete     |
    +                                   |                          v
 +--------------------+                 +              +-------------------+
 |                    |                 --------------+| eks.amazonaws.com |
 | Auto Scaling Group |                                +-------------------+
 |                    |
 +--------------------+
 </pre>