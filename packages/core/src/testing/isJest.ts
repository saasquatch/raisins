const isJestWorker = process.env.JEST_WORKER_ID !== undefined;

export default () => isJestWorker;
