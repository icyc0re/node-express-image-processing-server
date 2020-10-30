const path = require('path');
const { Worker, isMainThread } = require('worker_threads');

const pathToResizeWorker = path.resolve(__dirname, 'resizeWorker.js');
const pathToMonochromeWorker = path.resolve(__dirname, 'monochromeWorker.js');

function uploadPathResolver(filename) {
    return path.resolve(__dirname, '../uploads', filename);
}

function imageProcessor(filename) {
    const sourcePath = uploadPathResolver(filename);
    const resizedDestination = uploadPathResolver('resized-' + filename);
    const monochromeDestination = uploadPathResolver('monochrome-' + filename);

    let resizeWorkerFinished = false;
    let monochromeWorkerFinished = false;

    return new Promise((resolve, reject) => {
        if (!isMainThread) {
            reject(new Error('not on main thread'));
        }

        try {
            const resizeWorker = new Worker(pathToResizeWorker, {
                workerData: {
                    source: sourcePath,
                    destination: resizedDestination
                }
            });

            const monochromeWorker = new Worker(pathToMonochromeWorker, {
                workerData: {
                    source: sourcePath,
                    destination: monochromeDestination
                }
            });

            resizeWorker.on('message', message => {
                resizeWorkerFinished = true;
                if (monochromeWorkerFinished) {
                    resolve('resizeWorker finished processing');
                }
            });
            resizeWorker.on('error', err => {
                reject(new Error(err.message));
            });
            resizeWorker.on('exit', code => {
                if (code !== 0) {
                    reject(new Error('Exited with status code ' + code));
                }
            });

            monochromeWorker.on('message', message => {
                monochromeWorkerFinished = true;
                if (resizeWorkerFinished) {
                    resolve('monochromeWorker finished processing');
                }
            });
            monochromeWorker.on('error', err => {
                reject(new Error(err.message));
            });
            monochromeWorker.on('exit', code => {
                if (code !== 0) {
                    reject(new Error('Exited with status code ' + code));
                }
            });
        } catch (err) {
            reject(err);
        }
    })
}

module.exports = imageProcessor;
