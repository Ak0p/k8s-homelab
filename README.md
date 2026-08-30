# Self-Hosted Cloud

A GitOps-driven self-hosted cloud running on bare-metal Kubernetes. This repository is the single source of truth — every commit is automatically reconciled by FluxCD.

> **📚 Full documentation** — Architecture deep-dives, deployment guides, and operational runbooks are available at **[http://ak0p.github.io/k8s-homelab/](http://ak0p.github.io/k8s-homelab/)** (built with Docusaurus from [`docs/`](./docs/)). The README below is a condensed overview; refer to the docs site for complete details.

## Motivation

Learn Kubernetes, Kustomize, GitOps, and Helm hands-on by building a practical self-hosted alternative to cloud services — while keeping the configuration reproducible, backed up, and easy to extend.

**Goals:**
- Maximise reproducibility — minimise RTO with daily automated backups.
- Support multiple clusters without duplicating configuration.
- Keep future modifications simple through layered configs.

## Repository Structure

The base/overlay pattern is used alongside a separation of apps and infrastructure. This keeps core definitions independent from environment-specific configuration.

```
.
├── clusters/         # Flux bootstrap config & Kustomizations
├── apps/
│   ├── base/         # Canonical app definitions (HelmRelease, routes, etc.)
│   └── overlays/     # Per-cluster composition
├── infrastructure/
│   ├── base/         # Canonical infra definitions
│   └── overlays/     # Per-cluster patches
├── secrets/          # SOPS-encrypted Kubernetes Secrets
├── talos/            # TalOS machine configuration
└── docs/             # Docusaurus documentation site
```

The **base/overlay pattern** keeps core definitions independent from environment-specific configuration. See [repository structure docs](http://ak0p.github.io/k8s-homelab/docs/overview/repo-structure) for more detail.

---

## Stack Overview

| Layer | Technology | Purpose |
|---|---|---|
| **OS** | [Talos Linux](https://www.talos.dev/) | Immutable, API-driven OS — no SSH, no shell |
| **Orchestration** | [Kubernetes](https://kubernetes.io/) + Flannel CNI | Container platform, control-plane scheduling enabled |
| **GitOps** | [FluxCD](https://fluxcd.io/) | Watches Git, reconciles cluster state (secrets → infra → apps) |
| **Packaging** | [Helm](https://helm.sh/) + [Kustomize](https://kustomize.io/) | HelmReleases for chart deploys; Kustomize overlays for cluster-specific values |
| **Secrets** | [SOPS](https://github.com/getsops/sops) + [age](https://age-encryption.org/) | Encrypted-at-rest Secrets committed to Git, decrypted by Flux at deploy time |
| **TLS** | [cert-manager](https://cert-manager.io/) | ACME DNS-01 via Cloudflare → Let's Encrypt wildcard certs |
| **Ingress** | [Traefik](https://traefik.io/) | Reverse proxy, IngressRoute CRDs, TCP entrypoints for non-HTTP protocols |
| **LoadBalancer** | [MetalLB](https://metallb.universe.tf/) (L2/ARP) | Static IPs for LoadBalancer services on bare-metal |
| **Storage** | [OpenEBS](https://openebs.io/) ZFS Local PV | `host-zfs-standard` (128k, databases) & `host-zfs-files` (1M, media) |
| **Backups** | [Velero](https://velero.io/) | Daily backups with 30-day retention, ZFS snapshots → S3 (RustFS) |
| **Database** | [CloudNative-PG](https://cloudnative-pg.io/) | Dedicated PostgreSQL clusters per application |
| **DNS** | [AdGuard Home](https://adguard.com/en/adguard-home/overview.html) + [ExternalDNS](https://github.com/kubernetes-sigs/external-dns) | Network-wide ad blocking; automatic DNS record creation |
| **Auth** | [Pocket ID](https://pocket-id.org/) | Central SSO across applications |
| **GPU** | [AMD GPU Operator](https://github.com/ROCm/ROCm-operator) | GPU acceleration for Ollama LLM inference |
| **Cache** | [Redis](https://redis.io/) | In-memory cache (Bitnami chart) |
| **Backup Storage** | [RustFS](https://rustfs.com/) | S3-compatible object storage on the backup cluster |

Charts sourced from official repos and [TrueCharts](https://truecharts.org/).

---

## Clusters

| Cluster | Role |
|---|---|
| **`main`** | Primary — full infrastructure stack + all applications |
| **`backup`** | Minimal — RustFS only, provides S3 storage for Velero backups |

See [cluster docs](http://ak0p.github.io/k8s-homelab/docs/overview/repo-structure) for details.

---

## Applications

| App | Purpose | Status |
|---|---|---|
| [Immich](https://immich.app/) | Photo/video library (Google Photos alt.) — CNPG + VectorChord | Active |
| [SFTPGo](https://github.com/drakkan/sftpgo) | SFTP/FTP/WebDAV file server | Active |
| [Radicale](https://radicale.org/) | CalDAV/CardDAV calendars & contacts | Active |
| [Home Assistant](https://www.home-assistant.io/) | Home automation | Active |
| [Homepage](https://gethomepage.dev/) | Dashboard / start page | WIP |
| [Actual](https://actualbudget.org/) | Personal finance & budgeting | Active |
| [Linkwarden](https://linkwarden.app/) | Collaborative bookmark manager | Active |
| [Ollama](https://ollama.ai/) | LLM inference (AMD GPU accelerated) | Active |
| [Gitea](https://about.gitea.com/) | Self-hosted Git service | WIP |
| [Monitoring](https://prometheus.io/) | Prometheus + Grafana (`kube-prometheus-stack`) | Active |

See [application docs](http://ak0p.github.io/k8s-homelab/docs//category/applications) for detailed configuration of each.

---

## Deployment

1. **Prerequisites** — Hardware, network, CLI tools (`talosctl`, `flux`, `kubectl`, `sops`, `age`). See [prerequisites docs](http://ak0p.github.io/k8s-homelab/docs//getting-started/prerequisites).
2. **Install Talos** — Bootstrap nodes using machine config from [`talos/`](./talos/).
3. **Deploy SOPS key** — Deploy the `age` private key as a Kubernetes Secret manually.
4. **Bootstrap Flux** — `flux bootstrap` targeting `clusters/<name>/`. Creates two top-level Kustomizations: **Infrastructure Sync** and **Apps Sync**.
5. **Reconcile** — Flux deploys in order: secrets → infrastructure → apps.

See the [deployment guide](http://ak0p.github.io/k8s-homelab/docs//getting-started/deployment) for a detailed walkthrough.

## Recovery

1. Reinstall Talos (if needed).
2. Install OpenEBS + ZFS StorageClasses.
3. Deploy Velero with `BackupStorageLocation` / `VolumeSnapshotLocation` pointing to RustFS.
4. Restore from the latest backup.
5. Re-bootstrap Flux.

See [adding a new app](http://ak0p.github.io/k8s-homelab/docs/operations/adding-a-new-app) and [backup & restore](http://ak0p.github.io/k8s-homelab/docs/operations/backup-restore) docs for details.

