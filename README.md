# EKS Cluster cheat sheet

Run

```
npm install
cdk deploy --context resourcesPrefix=myPrefix --context dbLogin=root dbPwd=root
```

Then update the kubectl config using the outputed command, that should be like

```bash
aws eks update-kubeconfig --name xyzxa --region eu-west-3 --role-arn arn:aws:iam::123456:role/EksClusterStack-helloeksMastersRoleABC-123 --profile eks
```

Check that everything is ok using kubectl

```bash
kubectl cluster-info
kubectl describe nodes
```

```bash
kubectl create -f api-rc.yaml
```

```bash
kubectl expose rc api-controller --type=LoadBalancer --name api-endpoint
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

Use vscode as kubectl default yaml editor:

```
set KUBE_EDITOR=code.cmd --wait
```

Deploy / undeploy a public nginx web server using helm

```
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update
helm install mywebserver bitnami/nginx
kubectl get service mywebserver-nginx -o wide
helm uninstall mywebserver
```

listing context and clean them

```
kubectl config get-contexts
kubectl config unset contexts.arn:aws:eks:eu-west-3:123471865432:cluster/customekscluster14B2EE81-fc8b008...
```
