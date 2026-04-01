## Infrastructure overview

In order to deploy apps and expose them we require all cluster-essential services in the infrastructure folder.  
Here is a brief explanation of each service's role:

### Traefik
* Reverse proxy, handles load balancing and SSL termination.
* Is configured to run in a two service mode, to allow for UDP traffic for port 53 (DNS)

### Cert Manager
* Handles .x509 certificate generation via Let's Encrypt and stores the requested certificates in Kubernetes Secrets.

### MetalLB
* Handles IP address configuration for the LoadBalancer type services on the cluster.
* By configuring the L2Advertisement and IpAddressPool CRD's, the service can request IP addresses from the network DHCP server and allocate them to cluster LoadBalancers
* The service advertises via ARP the allocated IP addresses with the hosts MAC address.

### OpenEBS
* Allows for creation of CSI-compatible volumes.
* Has ZFS integration which allows for native ZFS snapshots via VolumeSnapshots CRD's 
* Has integration with Velero
* Supports declaring multiple StorageClasses for different use cases


### Velero
* Cluster backup tool. Has integration with OpenEBS via a plugin.
* Velero backs up both cluster manifests and PersistentVolumes to a defined BackupStorageLocation.
* I used a local S3-compatible storage server to hold a backup of my cluster every day.
* I used the OpenEBS integration to back up my ZFS volumes by using CSI VolumeSnapshots 

### CNPG - Cloud Native PostgreSQL
* Cloud-Native implementation of running Postgres databases.
* I use a different cluster per application rather than having a single cluster with multiple databases for each app
* Each database cluster has its cluster credentails stored as a Kubernetes Secret for other applications to use.