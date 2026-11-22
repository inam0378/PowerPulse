/* RestoPulse Tablet: stands in for supabase-js so the same app talks to the core inside this browser (rp-core.js). */
(function () {
  var TK = "rp-offline-token";
  function E(e) { return { message: (e && e.message) || String(e), code: e && e.code }; }
  function createClient(url, key, opts) {
    var store = (opts && opts.auth && opts.auth.storage) || window.localStorage;
    var tok = function () { try { return store.getItem(TK); } catch (e) { return null; } };
    var setTok = function (t) { try { t ? store.setItem(TK, t) : store.removeItem(TK); } catch (e) {} };
    var auth = {
      signInWithPassword: function (c) {
        return RPT.login(String(c.email || "").split("@")[0], c.password).then(function (r) { setTok(r.token); return { data: { session: { user: r.user } }, error: null }; },
          function (e) { return { data: {}, error: E(e) }; });
      },
      getSession: function () {
        return RPT.needsSetup().then(function (need) {
          if (need) { setupScreen(); return { data: { session: null } }; }
          if (!tok()) return { data: { session: null } };
          return RPT.session(tok()).then(function (r) { return { data: { session: { user: r.user } } }; }, function () { setTok(null); return { data: { session: null } }; });
        }, function (e) { storageError(e); return new Promise(function () {}); });
      },
      signOut: function () { var t = tok(); setTok(null); return RPT.logout(t).catch(function () {}).then(function () { return { error: null }; }); },
      updateUser: function (u) { return RPT.password(tok(), u.password).then(function () { return { data: {}, error: null }; }, function (e) { return { data: {}, error: E(e) }; }); }
    };
    function rpc(fn, args) {
      return RPT.rpc(fn, args || {}, tok()).then(function (d) { return { data: d === undefined ? null : d, error: null }; }, function (e) {
        var m = e.message; if (e.code === 401) m = "JWT expired: " + m; return { data: null, error: { message: m } }; });
    }
    function channel() {
      var cbs = [], ch = {
        on: function (type, f, cb) { if (type !== "presence") cbs.push(cb); return ch; },
        subscribe: function (cb) { setTimeout(function () { cb && cb("SUBSCRIBED"); }, 0); return ch; },
        presenceState: function () { return { d0: [{}] }; },
        track: function () { return Promise.resolve(); },
        _close: function () {}
      };
      return ch;
    }
    return { auth: auth, rpc: rpc, channel: channel, removeChannel: function () {}, functions: { invoke: function () { return Promise.resolve({ data: null, error: { message: "This is not available in the tablet version." } }); } } };
  }
  window.supabase = { createClient: createClient };

  /* the app asks for a few files directly (report PDF, backup download/restore): answer them here, never over the network */
  var realFetch = window.fetch.bind(window);
  function bearer(init) { var h = (init && init.headers) || {}; var a = h.Authorization || h.authorization || (h.get && h.get("Authorization")) || ""; return String(a).replace(/^Bearer\s+/i, ""); }
  function json(code, obj, extra) { return new Response(JSON.stringify(obj), { status: code, headers: Object.assign({ "Content-Type": "application/json" }, extra || {}) }); }
  window.fetch = function (input, init) {
    var u; try { u = new URL(typeof input === "string" ? input : input.url, location.href); } catch (e) { return realFetch(input, init); }
    var m = u.origin === location.origin && u.pathname.match(/\/api\/(report\.pdf|export|import|ocr)$/);
    if (!m) return realFetch(input, init);
    var t = bearer(init), err = function (e) { return json(e.code && e.code < 500 ? e.code : 400, { error: e.message }); };
    if (m[1] === "ocr") return Promise.resolve(json(200, { ok: false }));
    if (m[1] === "report.pdf") return RPT.reportPdf(t, Object.fromEntries(u.searchParams)).then(function (r) {
      return new Response(new Blob([r.bytes], { type: "application/pdf" }), { status: 200, headers: { "Content-Type": "application/pdf", "X-Filename": r.file } }); }, err);
    if (m[1] === "export") return RPT.exportJson(t).then(function (d) { return new Response(new Blob([JSON.stringify(d)], { type: "application/json" }), { status: 200 }); }, err);
    if (m[1] === "import") return RPT.importJson(t, init && init.body).then(function (r) { window.__rpRestore = r; return json(200, { ok: true }); }, err);
  };

  /* ---------- first start on this device: owner password + responsibility ---------- */
  var CSS = "#rpov{position:fixed;inset:0;z-index:99999;background:#0c0b09;color:#f5f1e3;font:15px/1.5 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;overflow:auto;padding:max(16px,env(safe-area-inset-top)) max(16px,env(safe-area-inset-right)) 24px max(16px,env(safe-area-inset-left))}" +
    "#rpov .bx{max-width:460px;margin:4vh auto;background:#16140f;border:1px solid #2c281e;border-radius:16px;padding:22px}" +
    "#rpov h1{margin:0 0 4px;font-size:22px;color:#ffc800}#rpov .tag{display:inline-block;font-size:11px;font-weight:800;letter-spacing:.08em;background:#ffc800;color:#0c0b09;border-radius:6px;padding:3px 8px;margin:0 6px 10px 0}" +
    "#rpov label{display:block;font-size:13px;font-weight:600;margin:12px 0 4px;color:#cfc8b2}#rpov input[type=text],#rpov input[type=password]{width:100%;box-sizing:border-box;background:#0c0b09;color:#f5f1e3;border:1px solid #3a3528;border-radius:10px;padding:12px;font-size:16px}" +
    "#rpov .warn{background:#2a1d08;border:1px solid #6b4b0c;border-radius:10px;padding:12px;font-size:13px;line-height:1.6;margin-top:14px}#rpov .chk{display:flex;gap:10px;align-items:flex-start;font-weight:600;color:#f5f1e3}" +
    "#rpov .chk input{width:22px;height:22px;flex:none;margin-top:1px;accent-color:#ffc800}#rpov button{width:100%;margin-top:16px;background:#ffc800;color:#0c0b09;border:0;border-radius:10px;padding:14px;font-size:16px;font-weight:800}" +
    "#rpov button.sec{background:transparent;color:#f5f1e3;border:1px solid #3a3528}#rpov .err{color:#ff6b5e;min-height:20px;font-size:13px;margin-top:8px}#rpov .code{font:700 26px/1.3 ui-monospace,Menlo,Consolas,monospace;color:#ffc800;letter-spacing:2px;text-align:center;background:#0c0b09;border:1px dashed #ffc800;border-radius:10px;padding:14px;margin:12px 0;user-select:all}" +
    "#rpov p{margin:8px 0}#rpov .mut{color:#a59f8a;font-size:13px}";
  var DISCLAIMER = "All data (menu, orders, sales, staff, settings) is saved only inside this tablet/phone. Power Pulse does not keep any copy and cannot recover it. " +
    "The shopkeeper alone is responsible for this data and for taking regular backups. If the app or browser data is cleared, or the device is reset, lost or damaged, the data is gone unless you have a backup file.";
  function overlay(html) {
    var o = document.getElementById("rpov"); if (!o) { var st = document.createElement("style"); st.textContent = CSS; document.head.appendChild(st); o = document.createElement("div"); o.id = "rpov"; document.body.appendChild(o); }
    o.innerHTML = '<div class="bx">' + html + "</div>"; return o;
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function setupScreen() {
    var o = overlay('<span class="tag">TABLET VERSION</span><span class="tag">OFFLINE</span><h1>Set up RestoPulse</h1><p class="mut">First start on this device. No internet is needed after this.</p>' +
      '<form id="rps"><label>Restaurant name</label><input type="text" id="rp_n" maxlength="60" placeholder="e.g. Shawarma Point" required>' +
      '<label>Owner username</label><input type="text" value="owner" disabled>' +
      '<label>Owner password (at least 8 characters)</label><input type="password" id="rp_p" minlength="8" autocomplete="new-password" required>' +
      '<label>Type the password again</label><input type="password" id="rp_p2" minlength="8" autocomplete="new-password" required>' +
      '<div class="warn"><b>Your data, your responsibility</b><br>' + DISCLAIMER + '</div>' +
      '<label class="chk"><input type="checkbox" id="rp_ok"> I understand. The data on this device is only my (the shopkeeper\'s) responsibility.</label>' +
      '<div class="err" id="rp_e"></div><button id="rp_b">Start RestoPulse</button></form>');
    o.querySelector("#rps").onsubmit = function (e) {
      e.preventDefault(); var er = o.querySelector("#rp_e"), p = o.querySelector("#rp_p").value; er.textContent = "";
      if (p !== o.querySelector("#rp_p2").value) { er.textContent = "The two passwords are not the same."; return; }
      if (!o.querySelector("#rp_ok").checked) { er.textContent = "Please tick the box to accept responsibility for the data."; return; }
      var b = o.querySelector("#rp_b"); b.disabled = true; b.textContent = "Setting up…";
      RPT.setup({ name: o.querySelector("#rp_n").value, password: p }).then(function (r) {
        try { localStorage.setItem("rp.remember", "1"); localStorage.setItem(TK, r.token); } catch (x) {}
        var o2 = overlay('<span class="tag">IMPORTANT</span><h1>Write down your recovery code</h1><p>If the owner password is ever forgotten, this code is the only way to set a new one on this device.</p>' +
          '<div class="code">' + esc(r.recovery) + '</div><p class="mut">Keep it on paper, away from the tablet. Power Pulse cannot see or reset it.</p>' +
          '<label class="chk"><input type="checkbox" id="rp_w"> I have written the recovery code down.</label><div class="err" id="rp_e2"></div><button id="rp_go">Open RestoPulse</button>');
        o2.querySelector("#rp_go").onclick = function () { if (!o2.querySelector("#rp_w").checked) { o2.querySelector("#rp_e2").textContent = "Please write the code down first."; return; } location.reload(); };
      }, function (x) { er.textContent = x.message; b.disabled = false; b.textContent = "Start RestoPulse"; });
    };
  }
  window.rpRecover = function () {
    var o = overlay('<h1>Forgot owner password</h1><p class="mut">Enter the recovery code you wrote down when RestoPulse was set up on this device.</p>' +
      '<form id="rpr"><label>Recovery code</label><input type="text" id="rr_c" placeholder="XXXXXX-XXXXXX-XXXXXX" autocomplete="off" autocapitalize="characters" required>' +
      '<label>New owner password (at least 8 characters)</label><input type="password" id="rr_p" minlength="8" autocomplete="new-password" required>' +
      '<div class="err" id="rr_e"></div><button>Set new password</button><button type="button" class="sec" id="rr_x">Back to login</button></form>');
    o.querySelector("#rr_x").onclick = function () { o.remove(); };
    o.querySelector("#rpr").onsubmit = function (e) {
      e.preventDefault(); var er = o.querySelector("#rr_e"); er.textContent = "";
      RPT.recover({ code: o.querySelector("#rr_c").value, password: o.querySelector("#rr_p").value }).then(function () {
        overlay('<h1>Password changed</h1><p>Log in with username <b>owner</b> and your new password.</p><button id="rr_ok">Back to login</button>').querySelector("#rr_ok").onclick = function () { location.reload(); };
      }, function (x) { er.textContent = x.message; });
    };
  };
  window.rpRestoreNote = function () {
    var r = window.__rpRestore; window.__rpRestore = null; if (!r || !r.password) return false;
    overlay('<h1>Backup restored</h1><p>This backup came from the PC version, so the owner gets a new password on this device:</p><div class="code">' + esc(r.password) + '</div>' +
      '<p>Username: <b>' + esc(r.owner) + '</b>. You will make your own password after logging in. Staff passwords must be set again by the owner in Settings → Staff.</p><button id="rn_ok">Log in</button>').querySelector("#rn_ok").onclick = function () { location.reload(); };
    return true;
  };
  function storageError(e) {
    overlay('<h1>Storage is not available</h1><p>RestoPulse could not open its storage on this device.</p><p class="mut">' + esc(e && e.message || e) + '</p><p>Open RestoPulse in normal Chrome (not Incognito) and make sure the device has free space.</p><button onclick="location.reload()">Try again</button>');
  }
})();
