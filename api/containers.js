const Docker = require('dockerode');
const docker = new Docker({ socketPath: '/var/run/docker.sock' });

exports.handler = async (event, context) => {
  try {
    const containers = await docker.listContainers({ all: true });
    const containerDetails = await Promise.all(
      containers.map(async (container) => {
        let containerObj = docker.getContainer(container.Id);
        let stats = await containerObj.stats({ stream: false });

        return {
          id: container.Id,
          name: container.Names[0].replace('/', ''),
          status: container.State,
          image: container.Image,
          cpu: (
            (stats.cpu_stats.cpu_usage.total_usage / stats.cpu_stats.system_cpu_usage) *
            100
          ).toFixed(2) + '%',
          memory: (stats.memory_stats.usage / (1024 * 1024)).toFixed(2) + ' MB',
        };
      })
    );

    return {
      statusCode: 200,
      body: JSON.stringify(containerDetails),
    };
  } catch (error) {
    console.error('Error fetching containers:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch container data' }),
    };
  }
};
