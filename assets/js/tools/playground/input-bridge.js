let bridgeReady = null;

function timed(promise, message) {
  let timer;
  return Promise.race([
    promise,
    new Promise((_, reject) => { timer = setTimeout(() => reject(new Error(message)), 10000); }),
  ]).finally(() => clearTimeout(timer));
}

export async function openInputBridge(scriptURL) {
  if (!bridgeReady) {
    bridgeReady = (async () => {
      await timed(navigator.serviceWorker.register(scriptURL), 'Local input bridge registration timed out.');
      await timed(navigator.serviceWorker.ready, 'Local input bridge activation timed out.');
      if (navigator.serviceWorker.controller?.scriptURL !== scriptURL) {
        await new Promise((resolve, reject) => {
          const cleanup = () => { clearTimeout(timer); navigator.serviceWorker.removeEventListener('controllerchange', check); };
          const check = () => {
            if (navigator.serviceWorker.controller?.scriptURL === scriptURL) { cleanup(); resolve(); }
          };
          const timer = setTimeout(() => { cleanup(); reject(new Error('Local input bridge could not control this page.')); }, 10000);
          navigator.serviceWorker.addEventListener('controllerchange', check);
          check();
        });
      }
    })().catch((error) => { bridgeReady = null; throw error; });
  }
  await bridgeReady;
  const controller = navigator.serviceWorker.controller;
  if (controller?.scriptURL !== scriptURL) { bridgeReady = null; throw new Error('Local input bridge disconnected.'); }
  const token = crypto.randomUUID();
  const channel = new MessageChannel();
  try {
    await timed(new Promise((resolve, reject) => {
      channel.port1.onmessage = ({ data }) => data.ok ? resolve() : reject(new Error('Local input bridge is busy.'));
      controller.postMessage({ type: 'open', token }, [channel.port2]);
    }), 'Local input session timed out.');
  } catch (error) {
    controller.postMessage({ type: 'close', token });
    throw error;
  } finally {
    channel.port1.close();
    channel.port2.close();
  }
  return { controller, token, url: new URL(`./__playground_input__/${token}/`, scriptURL).href };
}
