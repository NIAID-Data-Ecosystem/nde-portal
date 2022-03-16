import sourceData from 'configs/resource-sources.json';

export const getRepositoryImage = (repoName: string) => {
  if (!repoName) {
    return null;
  }
  const {repositories} = sourceData;
  const sourceRepoIndex = repositories.findIndex(source => {
    return source.name.toLowerCase().includes(repoName.toLowerCase());
  });

  const imageURL =
    sourceRepoIndex >= 0 ? repositories[sourceRepoIndex].imageUrl : null;

  return imageURL;
};
