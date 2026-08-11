importScripts("occt-import-js.js");

onmessage = async function (ev) {
  try {
    const occt = await occtimportjs({
      locateFile: () => "occt-import-js.wasm",
    });
    const result = occt.ReadFile(ev.data.format, ev.data.buffer, ev.data.params);
    postMessage({ ok: true, result });
  } catch (err) {
    postMessage({ ok: false, error: String(err) });
  }
};
