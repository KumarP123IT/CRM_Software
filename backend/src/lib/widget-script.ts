/**
 * Embeddable web-chat widget, served at GET /widget.js.
 *
 * Install snippet (from Settings → Website Widget):
 *   <script src="https://api.example.com/widget.js"
 *           data-account="CHANNEL_ACCOUNT_ID"
 *           data-widget-token="WIDGET_TOKEN" async></script>
 *
 * Behaviour: requests a signed visitor token from
 * POST /api/webhooks/web/:accountId/token, stores it in localStorage, sends it
 * on every call, and re-issues it once on a 401 (expired/forged).
 */
export const WIDGET_SCRIPT = `(function () {
  "use strict";
  var script = document.currentScript;
  if (!script) return;
  var accountId = script.getAttribute("data-account");
  var widgetToken = script.getAttribute("data-widget-token");
  if (!accountId || !widgetToken) return;
  var apiBase =
    script.getAttribute("data-api") ||
    script.src.replace(/\\/widget\\.js.*$/, "");
  var storeKey = "konvo.widget." + accountId;
  var POLL_MS = 4000;

  function loadSession() {
    try {
      return JSON.parse(localStorage.getItem(storeKey));
    } catch (e) {
      return null;
    }
  }
  function saveSession(s) {
    try {
      localStorage.setItem(storeKey, JSON.stringify(s));
    } catch (e) {}
  }
  function clearSession() {
    try {
      localStorage.removeItem(storeKey);
    } catch (e) {}
  }
  function tokenValid(s) {
    return !!(s && s.token && s.exp && s.exp > Date.now() + 30000);
  }

  function post(path, body) {
    return fetch(apiBase + "/api/webhooks/web/" + accountId + path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (d) {
        return { status: r.status, data: d };
      });
    });
  }

  function issueToken(force) {
    var s = loadSession();
    if (!force && tokenValid(s)) return Promise.resolve(s.token);
    return post("/token", {}).then(function (res) {
      if (res.status !== 200 || !res.data || !res.data.visitorToken) {
        return Promise.reject(new Error("token_failed"));
      }
      var ns = {
        token: res.data.visitorToken,
        exp: res.data.visitorTokenExpiresAt || Date.now() + 30 * 86400000,
      };
      saveSession(ns);
      return ns.token;
    });
  }

  function sendMessage(text) {
    function doSend(tok) {
      return post("", {
        widgetToken: widgetToken,
        visitorToken: tok,
        text: text,
        kind: "text",
      }).then(function (res) {
        if (res.status === 401) {
          clearSession();
          return issueToken(true).then(doSend);
        }
        return res;
      });
    }
    return issueToken().then(doSend);
  }

  /* ---------- UI ---------- */
  function el(tag, css, text) {
    var e = document.createElement(tag);
    e.style.cssText = css;
    if (text != null) e.textContent = text;
    return e;
  }

  var root = el("div", "position:fixed;bottom:20px;right:20px;z-index:2147483000;font-family:system-ui,sans-serif;");
  var btn = el(
    "button",
    "width:56px;height:56px;border-radius:50%;border:0;background:#4f46e5;color:#fff;font-size:24px;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,.25);"
  );
  btn.textContent = "💬";
  var panel = el(
    "div",
    "display:none;width:340px;height:460px;max-height:70vh;background:#fff;border-radius:12px;box-shadow:0 8px 30px rgba(0,0,0,.2);flex-direction:column;overflow:hidden;margin-bottom:10px;"
  );
  var header = el(
    "div",
    "background:#4f46e5;color:#fff;padding:12px 14px;font-weight:600;font-size:14px;"
  );
  header.textContent = "Chat with us";
  var msgs = el("div", "flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:8px;background:#f8fafc;");
  var form = el("form", "display:flex;border-top:1px solid #e2e8f0;");
  var input = el(
    "input",
    "flex:1;border:0;padding:12px;font-size:14px;outline:none;min-width:0;"
  );
  input.placeholder = "Type a message…";
  input.maxLength = 2000;
  var sendBtn = el(
    "button",
    "border:0;background:#4f46e5;color:#fff;padding:0 16px;font-size:14px;cursor:pointer;"
  );
  sendBtn.textContent = "Send";
  form.appendChild(input);
  form.appendChild(sendBtn);
  panel.appendChild(header);
  panel.appendChild(msgs);
  panel.appendChild(form);
  root.appendChild(panel);
  root.appendChild(btn);
  document.body.appendChild(root);

  var open = false;
  btn.addEventListener("click", function () {
    open = !open;
    panel.style.display = open ? "flex" : "none";
    if (open) poll();
  });

  function bubble(text, outgoing, kind) {
    var b = el(
      "div",
      "max-width:80%;padding:8px 12px;border-radius:12px;font-size:14px;line-height:1.4;white-space:pre-wrap;word-break:break-word;" +
        (outgoing
          ? "align-self:flex-end;background:#4f46e5;color:#fff;border-bottom-right-radius:4px;"
          : "align-self:flex-start;background:#fff;border:1px solid #e2e8f0;border-bottom-left-radius:4px;")
    );
    b.textContent = kind && kind !== "text" ? "[" + kind + "] " + text : text;
    return b;
  }

  var seen = {};
  function render(list) {
    var added = false;
    for (var i = 0; i < list.length; i++) {
      var m = list[i];
      if (!m || !m.id || seen[m.id]) continue;
      seen[m.id] = true;
      added = true;
      msgs.appendChild(bubble(m.body || "", m.direction === "out", m.kind));
    }
    if (added) msgs.scrollTop = msgs.scrollHeight;
  }

  function poll() {
    var s = loadSession();
    if (!tokenValid(s)) {
      issueToken()
        .then(function () {
          poll();
        })
        .catch(function () {});
      return;
    }
    fetch(
      apiBase +
        "/api/webhooks/web/" +
        accountId +
        "/thread?visitorToken=" +
        encodeURIComponent(s.token) +
        "&limit=50"
    )
      .then(function (r) {
        if (r.status === 401) {
          clearSession();
          return;
        }
        return r.json().then(function (d) {
          render((d && d.messages) || []);
          if (d && d.visitorToken) saveSession({ token: d.visitorToken, exp: d.visitorTokenExpiresAt || Date.now() + 30 * 86400000 });
        });
      })
      .catch(function () {});
  }

  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var text = input.value.trim();
    if (!text) return;
    input.value = "";
    sendMessage(text)
      .then(function () {
        poll();
      })
      .catch(function () {
        input.value = text;
      });
  });

  setInterval(poll, POLL_MS);
})();
`;
