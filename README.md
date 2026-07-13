# Self-Hosted Cloud

A GitOps-driven self-hosted cloud running on bare-metal Kubernetes. This repository is the single source of truth — every commit is automatically reconciled by FluxCD.

## Motivation

The aim of this project was to deepen my understanding of Kubernetes, Kustomize, GitOps, and Helm, while building a practical self-hosted alternative to cloud services. Along the way I learned a lot about cluster-essential services such as cert-manager, Velero, and Traefik, as well as various self-hosted applications.

## Goals

- Make the configuration as reproducible as possible.
- Minimise RTO by having daily automated backups.
- Make future modifications easy to implement.
- Support multiple clusters without duplicating configuration by hand.

## Repository Structure

The base/overlay pattern is used alongside a separation of apps and infrastructure. This keeps core definitions independent from environment-specific configuration.

```
.
├── clusters/        # Bootstrap config and Flux Kustomizations (main + backup)
├── apps/            # User-facing applications
│   ├── base/        # Canonical app definitions (HelmRelease, routes, etc.)
│   └── overlays/    # Per-cluster composition
├── infrastructure/  # Cluster-essential services
│   ├── base/        # Canonical infra definitions
│   ├── overlays/    # Per-cluster composition and patches
│   └── patches/     # JSON patches applied per cluster
├── secrets/         # SOPS-encrypted Kubernetes Secrets
├── manifests/       # One-off manifests (e.g. debug pods)
└── talos/           # Talos machine configuration
```

---

## Tools & Technologies

### [Talos Linux](https://www.talos.dev/)
The OS running on every Kubernetes node. Talos is immutable and API-driven — there is no SSH, no package manager, and no shell on the nodes. All configuration is applied via the `talosctl` CLI or machine config files. This makes nodes reproducible and reduces the attack surface significantly.

### [Kubernetes](https://kubernetes.io/)
The container orchestration platform. Flannel is used as the CNI. The `allowSchedulingOnControlPlanes` flag is enabled, allowing workloads to run on control-plane nodes in this small-cluster setup.

### [FluxCD](https://fluxcd.io/)
The GitOps operator. Flux watches this repository and reconciles the cluster state to match what is declared in Git. It handles:
- Deploying Helm charts via `HelmRelease` and `HelmRepository` CRDs
- Layering configuration via `Kustomization` CRDs
- Decrypting SOPS-encrypted secrets at deploy time
- Pruning resources that are removed from Git

The reconciliation order is enforced via `dependsOn`:
```
cluster-secrets → infrastructure → apps
```

### [Helm](https://helm.sh/)
Package manager for Kubernetes. All applications and infrastructure components are deployed as Helm charts, defined via `HelmRelease` manifests. This avoids writing raw Kubernetes YAML for every resource.

### [Kustomize](https://kustomize.io/)
Used for configuration layering. The base/overlay pattern allows a single canonical definition to be reused across clusters, with cluster-specific values applied as JSON patches in the overlay. Built into `kubectl` and used natively by Flux.

### [SOPS](https://github.com/getsops/sops) + [age](https://age-encryption.org/)
All Kubernetes `Secret` manifests in this repository are encrypted at rest using SOPS with an `age` key. The private key is deployed to the cluster manually before bootstrapping Flux, which then decrypts secrets automatically during reconciliation. This allows secrets to be safely committed to Git.

### [cert-manager](https://cert-manager.io/)
Automates the provisioning and renewal of TLS certificates. Configured with a `ClusterIssuer` that uses the ACME DNS-01 challenge via the Cloudflare API to issue Let's Encrypt wildcard certificates (e.g. `*.domain.tld`). Certificates are stored as Kubernetes Secrets and consumed by Traefik.

### [Traefik](https://traefik.io/)
The ingress controller and reverse proxy. All external traffic enters through a single Traefik `LoadBalancer` Service (IP assigned by MetalLB). Each application defines a `IngressRoute` CRD that routes traffic by hostname and terminates TLS using the wildcard certificate from cert-manager. Custom TCP entrypoints are added for non-HTTP protocols (SFTP, FTP).

### [MetalLB](https://metallb.universe.tf/)
Provides `LoadBalancer`-type Services on bare-metal clusters where a cloud provider is not available. Uses L2 (ARP) advertisement to assign static IPs from a configured pool to Services like Traefik and AdGuard Home.

### [OpenEBS](https://openebs.io/)
The CSI storage provider. Uses the ZFS local PV engine to provision persistent volumes backed by ZFS datasets on the node. Two `StorageClass` definitions are provided:
- `host-zfs-standard` — 128k record size, `fast` ZFS pool, for databases and small files
- `host-zfs-files` — 1M record size, `slow` ZFS pool, for large media and file storage (default)

### [Velero](https://velero.io/)
Handles scheduled cluster backups. Configured to run daily at midnight with a 30-day retention. Backs up all namespace resources and ZFS volume snapshots (via the OpenEBS Velero plugin) to an S3-compatible endpoint hosted on the backup cluster.

### [CloudNative-PG (CNPG)](https://cloudnative-pg.io/)
A Kubernetes operator for managing PostgreSQL clusters. Each application that requires a database gets its own dedicated CNPG `Cluster`, keeping databases isolated and independently manageable.

### [AdGuard Home](https://adguard.com/en/adguard-home/overview.html)
Network-wide DNS server with ad and tracker blocking. Runs in the cluster with a dedicated LoadBalancer IP for DNS traffic (TCP + UDP port 53). Acts as the internal DNS resolver for the home network.

### [ExternalDNS](https://github.com/kubernetes-sigs/external-dns)
Automatically creates and updates DNS records in AdGuard Home based on `IngressRoute` annotations. When a new application is deployed, its DNS record is created without any manual intervention, using the [AdGuard Home webhook provider](https://github.com/muhlba91/external-dns-provider-adguard).

### [RustFS](https://rustfs.com/)
An S3-compatible object storage server deployed on the backup cluster. Serves as the Velero backup target. Chosen for its simplicity and low resource footprint compared to MinIO.

### [TrueCharts](https://truecharts.org/)
A large community Helm chart library (`oci.trueforge.org`) used as the source for several application charts (SFTPGo, Radicale, Homepage, Home Assistant, AdGuard Home).

---

## Clusters

### `main`
The primary cluster. Runs the full infrastructure stack and all user-facing applications.

### `backup`
A minimal second cluster. Runs only RustFS to provide S3-compatible object storage for Velero backups. Uses a patched overlay of the infrastructure base with a different LoadBalancer IP and node configuration.

---

## Applications

| Application | Purpose |
|---|---|
| [Immich](https://immich.app/) | Self-hosted photo and video library (Google Photos alternative). Uses CNPG with the VectorChord extension for ML-based search. |
| [SFTPGo](https://github.com/drakkan/sftpgo) | Full-featured file server supporting SFTP, FTP, and WebDAV. |
| [Radicale](https://radicale.org/) | CalDAV/CardDAV server for calendars and contacts. |
| [Home Assistant](https://www.home-assistant.io/) | Home automation platform. |
| [Homepage](https://gethomepage.dev/) | Self-hosted dashboard and start page. |
| [Gitea](https://about.gitea.com/) | Self-hosted Git service *(work in progress)*. |

---

## Deployment

1. Deploy the **SOPS** private key manually. It will be used by Flux to decrypt all encrypted fields in from the Secrets present in the repo.

2.  Bootstrap Flux via the CLI into the specific `clusters/<cluster-name>/` directory. From there, two Flux Kustomizations are utilized to bridge the gap:

3. Infrastructure Sync: Reconciles all manifests within infrastructure/base.

4. Apps Sync: Reconciles all manifests within apps/base.

Key Benefit: This design supports scalability. By adding environment directories (`apps/prod` or `apps/staging`), you can easily apply Kustomize overlays to modify the base manifests for specific cluster requirements without duplicating code.

## Recovery

1. Install Talos (optional)
2. Install OpenEBS with the associated StorageClasses
3. Deploy Velero with the BackupStorageLocation and VolumeSnapshotLocation pointing to the backup object storage location
4. Follow the steps in Deployment ## TODO Reference

## Helm Charts

All services that are running on the cluster are deployed by Flux via `HelmRelease` CRDs. The configuration for each Helm Chart is written as code into this CRD, along with the helm registry configuration stored in the `HelmRepository` CRD.  
Most of the charts used are either official or part of the [Truecharts](https://truecharts.org/truetech/truecharts/) repository.
