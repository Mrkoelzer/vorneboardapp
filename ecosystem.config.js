module.exports = {
    apps: [
        {
            name: 'frontend',
            script: 'npm',
            args: 'run start:production', // Command to serve the production build
            cwd: 'C:\\vorneboardapp\\vorneboardtracker', // Set the path to your frontend directory
            watch: true,
            env: {
                NODE_ENV: 'production',
            },
        },
        {
            name: 'backend',
            script: 'node',
            args: 'index.js',
            cwd: 'C:\\vorneboardapp\\vorneserver', // Set the path to your backend directory
            watch: true,
            env: {
                NODE_ENV: 'production',
            },
        },
    ],
};
