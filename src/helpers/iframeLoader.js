HTMLIFrameElement.prototype.load = function iframeLoad(url, callback) {
  const iframe = this;

  try {
    iframe.src = `${url}?rnd=${Math.random().toString().substring(2)}`;
  } catch (error) {
    if (!callback) {
      return new Promise((resolve, reject) => {
        reject(error);
      });
    }

    callback(error);
  }

  const maxTime = 60000;
  const interval = 200;

  let timerCount = 0;

  if (!callback) {
    return new Promise((resolve, reject) => {
      const timer = setInterval(() => {
        if (!iframe) {
          clearInterval(timer);
          return;
        }

        timerCount += 1;

        if (iframe.contentDocument && iframe.contentDocument.readyState === 'complete') {
          clearInterval(timer);
          resolve();
        } else if (timerCount * interval > maxTime) {
          reject(new Error('Iframe load fail!'));
        }
      }, interval);
    });
  }

  const timer = setInterval(() => {
    if (!iframe) {
      clearInterval(timer);
      return;
    }

    timerCount += 1;

    if (iframe.contentDocument && iframe.contentDocument.readyState === 'complete') {
      clearInterval(timer);
      callback();
    } else if (timerCount * interval > maxTime) {
      callback(new Error('Iframe load fail!'));
    }
  }, interval);

  return undefined;
};
