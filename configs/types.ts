interface RepositoryTypes {
  label: string;
  type: 'generalist' | 'iid';
}

interface RepositoryProps {
  id: string;
  label: string;
  abstract?: string;
  genre?: string[];
  icon: string;
  imageURL: string;
  isNIAID?: boolean;
  type: RepositoryTypes['type'];
}

export interface Repositories {
  repositoryTypes: RepositoryTypes[];
  repositories: RepositoryProps[];
}
