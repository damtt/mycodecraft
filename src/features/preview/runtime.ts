import { evaluateDomCheck } from '../validation/checks';

/**
 * Wraps kid code in a srcdoc document with a bootstrap that:
 * - bridges console.log to the parent (cc-console)
 * - traps runtime errors (cc-error with line number)
 * - answers cc-run-checks by evaluating dom checks INSIDE the frame
 * - pings cc-ready on load (watchdog heartbeat)
 * Bootstrap comes FIRST so console/error capture precede user scripts.
 */
export function buildSrcdoc(code: string): string {
  const bootstrap = `<script id="cc-bootstrap">
(function () {
  var post = function (msg) { parent.postMessage(msg, '*'); };
  var origLog = console.log.bind(console);
  console.log = function () {
    var args = Array.prototype.slice.call(arguments);
    post({ type: 'cc-console', text: args.map(String).join(' ') });
    origLog.apply(null, args);
  };
  window.onerror = function (message, _src, line) {
    post({ type: 'cc-error', message: String(message), line: line || 0 });
    return true;
  };
  var evaluateDomCheck = ${evaluateDomCheck.toString()};
  window.addEventListener('message', function (event) {
    var data = event.data || {};
    if (data.type !== 'cc-run-checks') return;
    var results = (data.checks || []).map(function (c) {
      try { return evaluateDomCheck(c, document); } catch (e) { return false; }
    });
    post({ type: 'cc-check-results', id: data.id, results: results });
  });
  window.addEventListener('load', function () { post({ type: 'cc-ready' }); });
})();
</script>`;
  // Prepend, don't wrap: kid code may be a full document with its own
  // <style>/<script>. The browser parser creates the implied <html>/<body>
  // and merges everything; window 'load' still fires for the ready ping.
  return `${bootstrap}\n${code}`;
}
