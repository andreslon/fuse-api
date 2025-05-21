# Create the resource group for BNPL resources
az group create --name fuse-rg --location eastus2

# Create the Virtual Network (VNet) with a unique CIDR range
az network vnet create --resource-group fuse-rg --name fuse-vnet --address-prefixes 10.1.0.0/16 --location eastus2

# Add a subnet for Virtual Machines or Private Links with a CIDR range of 10.1.1.0/24
az network vnet subnet create --resource-group fuse-rg --vnet-name fuse-vnet --name fuse-subnet --address-prefixes 10.1.1.0/24

# Add a dedicated subnet for AKS with a CIDR range of 10.1.2.0/23 (512 IPs)
az network vnet subnet create --resource-group fuse-rg --vnet-name fuse-vnet --name fuse-aks-subnet --address-prefixes 10.1.2.0/23

# Create a public IP address for the AKS Load Balancer
az network public-ip create --resource-group fuse-rg --name fuse-aks-ip --sku Standard --allocation-method Static --location eastus2

# Create an Azure Container Registry (ACR) to store container images
az acr create --resource-group fuse-rg --name fuseacr --sku Basic --location eastus2

# Create the AKS cluster using the updated VNet and subnets
az aks create --resource-group fuse-rg --name fuse-aks --node-count 1 --node-vm-size Standard_B2s --location eastus2 --vnet-subnet-id $(az network vnet subnet show --resource-group fuse-rg --vnet-name fuse-vnet --name fuse-aks-subnet --query id -o tsv) --load-balancer-outbound-ips $(az network public-ip show --resource-group fuse-rg --name fuse-aks-ip --query id -o tsv) --generate-ssh-keys

# Attach the AKS cluster to the Container Registry for image pulls
az aks update --resource-group fuse-rg --name fuse-aks --attach-acr $(az acr show --resource-group fuse-rg --name fuseacr --query id -o tsv)

