import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'GitOps-Driven',
    description: (
      <>
        Everything is declared in Git and automatically reconciled by FluxCD. No
        manual SSH, no drift — the cluster always matches the repository.
      </>
    ),
  },
  {
    title: 'Bare-Metal Kubernetes',
    description: (
      <>
        Runs on Talos Linux — an immutable, API-driven OS. No SSH, no package
        manager, minimal attack surface.
      </>
    ),
  },
  {
    title: 'Resilient by Design',
    description: (
      <>
        Daily automated incremental backups via Velero with ZFS snapshots to an S3-compatible
        backup cluster.
      </>
    ),
  },
  {
    title: 'Self-Hosted Services',
    description: (
      <>
        A growing collection of self-hosted alternatives: Immich,
        SFTPGo, Actual, Home Assistant, and more.
      </>
    ),
  },
  {
    title: 'Automated DNS & TLS',
    description: (
      <>
        AdGuard Home handles internal DNS with ad blocking. ExternalDNS auto-creates
        records. Cert-manager issues Let's Encrypt wildcard certificates.
      </>
    ),
  },
  {
    title: 'Multi-Cluster Ready',
    description: (
      <>
        Kustomize base/overlay pattern supports multiple clusters without
        duplicating configuration. A main cluster and a backup cluster share
        the same base definitions.
      </>
    ),
  },
];

function Feature({title, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
