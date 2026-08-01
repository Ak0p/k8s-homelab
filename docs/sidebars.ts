import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  docs: [
    {
      type: 'category',
      label: 'Overview',
      items: [
        'overview/intro',
        'overview/repo-structure',
      ],
    },
    {
      type: 'category',
      label: 'Getting Started',
      items: [
        'getting-started/prerequisites',
        'getting-started/deployment',
        'getting-started/recovery',
      ],
    },
    {
      type: 'category',
      label: 'Architecture',
      items: [
        'architecture/gitops-flow',
        'architecture/network',
        'architecture/storage',
        'architecture/secrets-management',
      ],
    },
    {
      type: 'category',
      label: 'Infrastructure',
      items: [
        'infrastructure/traefik',
        'infrastructure/cert-manager',
        'infrastructure/metallb',
        'infrastructure/openebs',
        'infrastructure/cnpg',
        'infrastructure/velero',
        'infrastructure/adguard-home',
        'infrastructure/external-dns',
        'infrastructure/pocket-id',
        'infrastructure/amd-gpu-operator',
        'infrastructure/redis',
        'infrastructure/rustfs',
      ],
    },
    {
      type: 'category',
      label: 'Applications',
      items: [
        'applications/immich',
        'applications/sftpgo',
        'applications/radicale',
        'applications/home-assistant',
        'applications/homepage',
        'applications/actual',
        'applications/linkwarden',
        'applications/ollama',
        'applications/gitea',
        'applications/monitoring',
      ],
    },
    {
      type: 'category',
      label: 'Clusters',
      items: [
        'clusters/main',
        'clusters/backup',
      ],
    },
    {
      type: 'category',
      label: 'Talos',
      items: [
        'talos/configuration',
        'talos/upgrades',
      ],
    },
    {
      type: 'category',
      label: 'Operations',
      items: [
        'operations/backup-restore',
        'operations/troubleshooting',
        'operations/adding-a-new-app',
      ],
    },
  ],
};

export default sidebars;
