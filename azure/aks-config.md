# Kubernetes Cloudflare Tunnel and ExternalDNS Setup

## Azure Account and Kubernetes Configuration
```powershell
az aks get-credentials --resource-group fuse-rg --name fuse-aks --overwrite-existing
```

## Install and Configure Ingress NGINX
```powershell
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update
helm upgrade -i ingress-nginx ingress-nginx/ingress-nginx --namespace kube-system  --set controller.service.type=ClusterIP --set controller.ingressClassResource.default=true --wait
```

## Namespace Setup
```powershell
kubectl create namespace cloudflare
kubectl create namespace services
```

## Cloudflare API Token and Setup
```powershell
# Generate an API token at https://dash.cloudflare.com/profile/api-tokens
# https://itnext.io/exposing-kubernetes-apps-to-the-internet-with-cloudflare-tunnel-ingress-controller-and-e30307c0fcb0
kubectl create secret generic cloudflare-api-key --from-literal=apiKey=EWgBdOubGJGyI3Ualr-jncDwLPDGvtDDrQALL2py --from-literal=email=andreslon1992@gmail.com --namespace=cloudflare
```

## Install Cloudflare Tunnel Binary
```bash
pushd $(mktemp -d)
curl -sSL -o cloudflared https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64
sudo install -m 555 cloudflared /usr/local/bin/cloudflared
rm cloudflared
popd
```

## Cloudflare Tunnel Configuration
```powershell
# \\wsl$\Ubuntu\home\andreslon\.cloudflared
cloudflared tunnel login
cloudflared tunnel create fuse

kubectl create secret generic tunnel-credentials --from-file=credentials.json=4b7da1d9-dbb9-49c4-b145-4063a75747e3.json --namespace=cloudflare
```

### Tunnel Values YAML
```powershell
@"
cloudflare:
  tunnelName: "fuse"
  tunnelId: "4b7da1d9-dbb9-49c4-b145-4063a75747e3"
  secretName: "tunnel-credentials"
  ingress:
    - hostname: "*.neobit.com.co"
      service: "https://ingress-nginx-controller.kube-system.svc.cluster.local:443"
      originRequest:
        noTLSVerify: true

resources:
  limits:
    cpu: "100m"
    memory: "128Mi"
  requests:
    cpu: "100m"
    memory: "128Mi"

replicaCount: 1
"@ | Out-File -FilePath "tunne-values.yaml" -Encoding UTF8
```

## Deploy Cloudflare Tunnel and ExternalDNS
```powershell
helm repo add cloudflare https://cloudflare.github.io/helm-charts
helm repo update
helm upgrade --install cloudflare cloudflare/cloudflare-tunnel --namespace cloudflare --values tunne-values.yaml --wait

helm repo add kubernetes-sigs https://kubernetes-sigs.github.io/external-dns/
helm repo update
helm upgrade --install external-dns kubernetes-sigs/external-dns `
  --namespace cloudflare `
  --set sources[0]=ingress `
  --set policy=upsert-only `
  --set interval=5m `
  --set provider.name=cloudflare `
  --set domain-filter=neobit.com.co `
  --set env[0].name=CF_API_TOKEN `
  --set env[0].valueFrom.secretKeyRef.name=cloudflare-api-key `
  --set env[0].valueFrom.secretKeyRef.key=apiKey `
  --wait
```

## Demo Application Deployment
### Deployment and Service
```powershell
@"
apiVersion: apps/v1
kind: Deployment
metadata:
  name: demo
  namespace: services
spec:
  replicas: 1
  selector:
    matchLabels:
      app: demo
  template:
    metadata:
      labels:
        app: demo
    spec:
      nodeSelector:
        kubernetes.io/os: linux
      containers:
        - name: demo
          image: nginx:latest
          ports:
            - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: demo
  namespace: services
spec:
  type: ClusterIP
  ports:
    - targetPort: 80
      name: port80
      port: 80
      protocol: TCP
  selector:
    app: demo
"@ | kubectl apply -f -
```

### Ingress Configuration
```powershell
@"
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  annotations:
    external-dns.alpha.kubernetes.io/cloudflare-proxied: "true"
    nginx.ingress.kubernetes.io/rewrite-target: /
    external-dns.alpha.kubernetes.io/hostname: fuse.neobit.com.co
    external-dns.alpha.kubernetes.io/target: 4b7da1d9-dbb9-49c4-b145-4063a75747e3.cfargotunnel.com
  name: fuse-ingress
  namespace: services
spec:
  rules:
  - host: fuse.neobit.com.co
    http:
      paths:
      - backend:
          service:
            name: demo
            port:
              number: 80
        path: /demo
        pathType: Prefix
"@ | kubectl apply -f -
```