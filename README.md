# Self Hosted Cloud Config

## Motivation
*The aim of this project was to perfect my understanding of Kubernetes, Kustomize,GitOps and Helm. I also learned a lot about the cluster-essential services such as CertManager, Velero or Traefik as well as various other applications.*  

## Host Environment

I have a bare metal cluster of a single node running [Talos Linux](https://www.talos.dev/).
I chose Talos because of its immutability, API-driven design and minimal resource utilisation.

## Repository Structure
Following the FluxCD best practices, this project utilizes a Base/Overlay pattern. This modular approach separates core definitions from environment-specific configurations.

### Directory Hierarchy
The repository is organized into three primary top-level directories:

* `clusters/`: Contains the unique bootstrap configuration for each cluster.

* `apps/base/`: Defines the core application manifests Deployments, Services.

* `infrastructure/base/`: Defines foundational resources (Ingress controllers, Databases, SealedSecrets).

## Deployment Logic
To sync the cluster with the repository, Flux is bootstrapped via the CLI into the specific `clusters/<cluster-name>/` directory. From there, two Flux Kustomizations are utilized to bridge the gap:

1. Infrastructure Sync: Reconciles all manifests within infrastructure/base.

2. Apps Sync: Reconciles all manifests within apps/base.

Key Benefit: This design supports scalability. By adding environment directories (`apps/prod` or `apps/staging`), you can easily apply Kustomize overlays to modify the base manifests for specific cluster requirements without duplicating code.

## Helm Charts

All services that are running on the cluster are deployed by Flux via `HelmRelease` CRDs. The configuration for each Helm Chart is written as code into this CRD, along with the helm registry configuration stored in the `HelmRepository` CRD.  
Most of the charts used are either official or part of the [Truecharts](https://truecharts.org/truetech/truecharts/) repository.