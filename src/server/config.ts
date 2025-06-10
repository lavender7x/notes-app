interface Config {
    port: number;
    contenDir: string;
}

let config: Config | undefined = undefined;

export function getConfig(): Config {
    if (!config) {
        try {
            const args = process.argv.slice(2);

            const portIndex = args.indexOf('--port');
            const port = portIndex !== -1 ?
                args[portIndex + 1] :
                9090;

            const contentDirIndex = args.indexOf('--content-dir');
            const contenDir = contentDirIndex !== -1
                ? args[contentDirIndex + 1]
                : './content';

            config = {
                port: Number(port),
                contenDir,
            }
        }
        catch (error) {
            console.error('Error parsing config:', error);
            throw new Error('Invalid configuration. Please provide --port and --content-dir arguments.');
        }

    }


    return config;
}
