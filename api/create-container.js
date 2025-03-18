const Docker = require('dockerode');
const docker = new Docker({ socketPath: '/var/run/docker.sock' });

exports.handler = async (event, context) => {
  try {
    const { containerName, imageName, command } = JSON.parse(event.body);

    const container = await docker.createContainer({
      Image: imageName,
      name: containerName,
      Cmd: command,
      Tty: true,
      Detach: true,
    });

    await container.start();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Container started', id: container.id }),
    };
  } catch (error) {
    console.error('Error creating container:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
