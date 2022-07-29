# EKS Cluster cheat sheet

Then upadte the kubectl config using the output command like

```bash
aws2 eks update-kubeconfig --name xyzxa --region eu-west-3 --role-arn arn:aws:iam::123456:role/EksClusterStack-helloeksMastersRoleABC-123 --profile eks
```

Check that everything is ok using

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
