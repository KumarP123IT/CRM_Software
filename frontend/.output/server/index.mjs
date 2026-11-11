globalThis.__nitro_main__ = import.meta.url;
import { i as HTTPError, n as defineLazyEventHandler, t as H3Core } from "./_libs/h3+rou3+srvx.mjs";
import { t as HookableCore } from "./_libs/hookable.mjs";
import { r as FastResponse } from "./_libs/h3-v2+rou3+srvx.mjs";
//#region #nitro-vite-setup
function lazyService(loader) {
	let promise, mod;
	return { fetch(req) {
		if (mod) return mod.fetch(req);
		if (!promise) promise = loader().then((_mod) => mod = _mod.default || _mod);
		return promise.then((mod) => mod.fetch(req));
	} };
}
var services = { ["ssr"]: lazyService(() => import("./_ssr/ssr.mjs")) };
globalThis.__nitro_vite_envs__ = services;
//#endregion
//#region #nitro/virtual/public-assets-data
var public_assets_data_default = {
	"/assets/ComingSoon-D0W3N7oy.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"21d-CKDc8pcuurE54l2rMtkzYeiXmyw\"",
		"mtime": "2026-11-04T06:17:07.655Z",
		"size": 541,
		"path": "../public/assets/ComingSoon-D0W3N7oy.js"
	},
	"/assets/Match-CN8CKDrb.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1347-dj0d6h2sCQroXL95ECHPJqNDBmo\"",
		"mtime": "2026-11-04T06:17:07.655Z",
		"size": 4935,
		"path": "../public/assets/Match-CN8CKDrb.js"
	},
	"/assets/_authenticated-CN4Ed9Fo.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a570-NZzwRqW+Fo+Hy/EojlkDndw7FSw\"",
		"mtime": "2026-11-04T06:17:07.655Z",
		"size": 42352,
		"path": "../public/assets/_authenticated-CN4Ed9Fo.js"
	},
	"/assets/_authenticated.ads-DYmYyoJO.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"157-wS7RX+qmJiX3EcBEwgP0/0fjPX4\"",
		"mtime": "2026-11-04T06:17:07.655Z",
		"size": 343,
		"path": "../public/assets/_authenticated.ads-DYmYyoJO.js"
	},
	"/assets/_authenticated.ai-agents-BHqIyoNu.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"163-gaKnSPnzxtKQTfUKai0kp6EP5nw\"",
		"mtime": "2026-11-04T06:17:07.655Z",
		"size": 355,
		"path": "../public/assets/_authenticated.ai-agents-BHqIyoNu.js"
	},
	"/assets/_authenticated.analytics-PeXVMkDQ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"165-0G7Os2r9n/2j7PbKh45ToQiBDoE\"",
		"mtime": "2026-11-04T06:17:07.655Z",
		"size": 357,
		"path": "../public/assets/_authenticated.analytics-PeXVMkDQ.js"
	},
	"/assets/_authenticated.bots-CE6xR2DM.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"160-O2/zmpqlTRy+Zx0lhX+sPezzRQE\"",
		"mtime": "2026-11-04T06:17:07.655Z",
		"size": 352,
		"path": "../public/assets/_authenticated.bots-CE6xR2DM.js"
	},
	"/assets/_authenticated.calls-Cv1BV9fw.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"14b-jzqhBDISzHgTFOO8VMS7PJRGO7s\"",
		"mtime": "2026-11-04T06:17:07.655Z",
		"size": 331,
		"path": "../public/assets/_authenticated.calls-Cv1BV9fw.js"
	},
	"/assets/_authenticated.campaigns-BEwCmRuy.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"15d-NLsGoWh7749LWi4gWniWvuwgzhg\"",
		"mtime": "2026-11-04T06:17:07.655Z",
		"size": 349,
		"path": "../public/assets/_authenticated.campaigns-BEwCmRuy.js"
	},
	"/assets/_authenticated.broadcasts-B9KngVbd.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4532-q1rNLN2qlxUPav3BEEXVN1WMPoU\"",
		"mtime": "2026-11-04T06:17:07.655Z",
		"size": 17714,
		"path": "../public/assets/_authenticated.broadcasts-B9KngVbd.js"
	},
	"/assets/_authenticated.comment-automation-D3-iwN3C.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"17c-+6rfL+TbYs0iDSYMj7x+BajO2/w\"",
		"mtime": "2026-11-04T06:17:07.655Z",
		"size": 380,
		"path": "../public/assets/_authenticated.comment-automation-D3-iwN3C.js"
	},
	"/assets/_authenticated.conversations-Cpe8y86c.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"172-tC4EMkue44X04WL+BxbrgzrL2TQ\"",
		"mtime": "2026-11-04T06:17:07.655Z",
		"size": 370,
		"path": "../public/assets/_authenticated.conversations-Cpe8y86c.js"
	},
	"/assets/_authenticated.dashboard-_03Yfeq8.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"24f5-UB0OmoSBy07EDBW2hB1ZzM+vLqc\"",
		"mtime": "2026-11-04T06:17:07.655Z",
		"size": 9461,
		"path": "../public/assets/_authenticated.dashboard-_03Yfeq8.js"
	},
	"/assets/_authenticated.contacts-CcXnj5ki.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b829-Bqa5nRKqT6Ia8cpS2NwjKrg/udc\"",
		"mtime": "2026-11-04T06:17:07.655Z",
		"size": 47145,
		"path": "../public/assets/_authenticated.contacts-CcXnj5ki.js"
	},
	"/assets/_authenticated.groups-bUuA7tF6.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"26f1-J2b00ps9gasci2C7qnWzhQwmegA\"",
		"mtime": "2026-11-04T06:17:07.655Z",
		"size": 9969,
		"path": "../public/assets/_authenticated.groups-bUuA7tF6.js"
	},
	"/assets/_authenticated.leads-CR5K_QWt.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"15b-37lnRHvQP80eDBFEaOr8tUV70Bc\"",
		"mtime": "2026-11-04T06:17:07.655Z",
		"size": 347,
		"path": "../public/assets/_authenticated.leads-CR5K_QWt.js"
	},
	"/assets/_authenticated.settings-Duw3-qIK.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"14e-swYSgFahqwIT6MjqD2otVewPjJc\"",
		"mtime": "2026-11-04T06:17:07.656Z",
		"size": 334,
		"path": "../public/assets/_authenticated.settings-Duw3-qIK.js"
	},
	"/assets/_authenticated.design-BirMW3fS.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"11835-AaDgepeXxDC+2CIq6I7ayJB32dA\"",
		"mtime": "2026-11-04T06:17:07.655Z",
		"size": 71733,
		"path": "../public/assets/_authenticated.design-BirMW3fS.js"
	},
	"/assets/_authenticated.templates-DdygW8uu.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2607-srLwhBbZwAUNENSE43VhWXUP6/I\"",
		"mtime": "2026-11-04T06:17:07.656Z",
		"size": 9735,
		"path": "../public/assets/_authenticated.templates-DdygW8uu.js"
	},
	"/assets/api-BfcghTgd.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2b49-ZfstW8hOzn4VTDzv3Rh87ORoTS8\"",
		"mtime": "2026-11-04T06:17:07.656Z",
		"size": 11081,
		"path": "../public/assets/api-BfcghTgd.js"
	},
	"/assets/auth-BFr6F-M8.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b6b-fdHm27CuSgD2D7ntdtxM6GRGgIo\"",
		"mtime": "2026-11-04T06:17:07.656Z",
		"size": 2923,
		"path": "../public/assets/auth-BFr6F-M8.js"
	},
	"/assets/badge-indian-rupee-8ysxbxkE.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"18d-xzS8ojqXwOXkEJbdB8cnMLPNkJc\"",
		"mtime": "2026-11-04T06:17:07.656Z",
		"size": 397,
		"path": "../public/assets/badge-indian-rupee-8ysxbxkE.js"
	},
	"/assets/badge-neuz-jY1.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"311-XkxTQFSN6H74wq/rMxzSYopsBi4\"",
		"mtime": "2026-11-04T06:17:07.656Z",
		"size": 785,
		"path": "../public/assets/badge-neuz-jY1.js"
	},
	"/assets/chart-column-jbwwhB_A.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f1-w+JygjKKiTUEr+DYCRtWcWdfLmY\"",
		"mtime": "2026-11-04T06:17:07.656Z",
		"size": 241,
		"path": "../public/assets/chart-column-jbwwhB_A.js"
	},
	"/assets/button-CEbCQwcK.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c09b-xp5NANb1ERN3ToXiN3E0K+E3ay8\"",
		"mtime": "2026-11-04T06:17:07.656Z",
		"size": 49307,
		"path": "../public/assets/button-CEbCQwcK.js"
	},
	"/assets/check-Cg0baX2A.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"72-Je1xzsplfVrOqnaOOZwMFMEn6KA\"",
		"mtime": "2026-11-04T06:17:07.656Z",
		"size": 114,
		"path": "../public/assets/check-Cg0baX2A.js"
	},
	"/assets/checkbox-mDWEbCuO.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"11c2-LlvAUakvmQoIrmDB+vNW9kvNre0\"",
		"mtime": "2026-11-04T06:17:07.656Z",
		"size": 4546,
		"path": "../public/assets/checkbox-mDWEbCuO.js"
	},
	"/assets/circle-alert-auGeGdZU.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f0-nDm5q63wvk5lkgHv1B1SkAmtx/o\"",
		"mtime": "2026-11-04T06:17:07.656Z",
		"size": 240,
		"path": "../public/assets/circle-alert-auGeGdZU.js"
	},
	"/assets/circle-x-BIls2LiM.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"214-RUL0n48sCBio5gPOr+Z1eupPpGk\"",
		"mtime": "2026-11-04T06:17:07.656Z",
		"size": 532,
		"path": "../public/assets/circle-x-BIls2LiM.js"
	},
	"/assets/dialog-DxfzupTf.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"d148-0JmE/eKPvw/DZnTPWAPVMt6aAa8\"",
		"mtime": "2026-11-04T06:17:07.656Z",
		"size": 53576,
		"path": "../public/assets/dialog-DxfzupTf.js"
	},
	"/assets/clock-BIxJlpGC.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"9f-/Nt1rSToZce8eKL+tIgJvH4osak\"",
		"mtime": "2026-11-04T06:17:07.656Z",
		"size": 159,
		"path": "../public/assets/clock-BIxJlpGC.js"
	},
	"/assets/dist-BRbRhqKs.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1db7-yfb7Iuf8JOV9aJOO/fhBdNNqKXU\"",
		"mtime": "2026-11-04T06:17:07.656Z",
		"size": 7607,
		"path": "../public/assets/dist-BRbRhqKs.js"
	},
	"/assets/dist-CV8VtFbu.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"82e7-+I4VyKCmKwxQGrAVa+1flmsrHF0\"",
		"mtime": "2026-11-04T06:17:07.656Z",
		"size": 33511,
		"path": "../public/assets/dist-CV8VtFbu.js"
	},
	"/assets/ellipsis-DmCOC82a.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"d8-81kiqwxh5oqmY7jJMM3Y2adc2uI\"",
		"mtime": "2026-11-04T06:17:07.656Z",
		"size": 216,
		"path": "../public/assets/ellipsis-DmCOC82a.js"
	},
	"/assets/eye-BBMiLYH1.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f6-t5FGQQE2w19uh+EjEDlpguGCjhs\"",
		"mtime": "2026-11-04T06:17:07.656Z",
		"size": 246,
		"path": "../public/assets/eye-BBMiLYH1.js"
	},
	"/assets/forgot-password-Yb1xhz0q.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"bf6-V9lExNJ+nzbBLeiNUvsFGWy35oI\"",
		"mtime": "2026-11-04T06:17:07.656Z",
		"size": 3062,
		"path": "../public/assets/forgot-password-Yb1xhz0q.js"
	},
	"/assets/funnel-pL6Pjzl9.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f6-J4Yk/dUKtS66XoWEWdaFsCJ6bpM\"",
		"mtime": "2026-11-04T06:17:07.656Z",
		"size": 246,
		"path": "../public/assets/funnel-pL6Pjzl9.js"
	},
	"/assets/index-CxzJHOaN.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"52442-+wErHqtFOM4tVHt4XMNbFWmzLoU\"",
		"mtime": "2026-11-04T06:17:07.652Z",
		"size": 336962,
		"path": "../public/assets/index-CxzJHOaN.js"
	},
	"/assets/label-CxmAGS9Q.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"457-WEiXK0fIIDVACV4vHmf1LXGCKs0\"",
		"mtime": "2026-11-04T06:17:07.656Z",
		"size": 1111,
		"path": "../public/assets/label-CxmAGS9Q.js"
	},
	"/assets/link-CtpTqTCx.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2931-wbajpIHaIpsPKtgRL9FsKfVLyr4\"",
		"mtime": "2026-11-04T06:17:07.657Z",
		"size": 10545,
		"path": "../public/assets/link-CtpTqTCx.js"
	},
	"/assets/login-Bq4_nfNV.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"716-m5xqO2Locgz7AR322B6zfqNCjTw\"",
		"mtime": "2026-11-04T06:17:07.657Z",
		"size": 1814,
		"path": "../public/assets/login-Bq4_nfNV.js"
	},
	"/assets/megaphone-DJ-A6YAF.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"150-Zks/uXEj65I9s+OKMEH2SCyOfME\"",
		"mtime": "2026-11-04T06:17:07.657Z",
		"size": 336,
		"path": "../public/assets/megaphone-DJ-A6YAF.js"
	},
	"/assets/message-circle-reply-CZYkN8_p.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"14c-wQQnAraO/zqtPl7Bl+QsyzTDBY4\"",
		"mtime": "2026-11-04T06:17:07.657Z",
		"size": 332,
		"path": "../public/assets/message-circle-reply-CZYkN8_p.js"
	},
	"/assets/message-square-BLDZF4Vw.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"22b-i49YNNh3c0xHK/eKQ7y2SOk7wu4\"",
		"mtime": "2026-11-04T06:17:07.657Z",
		"size": 555,
		"path": "../public/assets/message-square-BLDZF4Vw.js"
	},
	"/assets/messages-square-DLlDeX5w.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"163-UkD3q7q2AgeCi3zNUyjVVDbjiRc\"",
		"mtime": "2026-11-04T06:17:07.657Z",
		"size": 355,
		"path": "../public/assets/messages-square-DLlDeX5w.js"
	},
	"/assets/mutation-i5Kfuf-8.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"d71-DLtKGDIv2B87vUZEXJCCPyNCbOI\"",
		"mtime": "2026-11-04T06:17:07.657Z",
		"size": 3441,
		"path": "../public/assets/mutation-i5Kfuf-8.js"
	},
	"/assets/pause-CzdaY8Ir.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c9-+AAriH4YdPlw4V3ohOus1Zly6IE\"",
		"mtime": "2026-11-04T06:17:07.657Z",
		"size": 201,
		"path": "../public/assets/pause-CzdaY8Ir.js"
	},
	"/assets/phone-Bkt_a2U6.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"138-050XdZos+HS3fJYMaw95Poy1AeQ\"",
		"mtime": "2026-11-04T06:17:07.657Z",
		"size": 312,
		"path": "../public/assets/phone-Bkt_a2U6.js"
	},
	"/assets/phone-call-BAVemy_y.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"19d-LauGGvrI9KVZ0yRb5PjNE4UcRMA\"",
		"mtime": "2026-11-04T06:17:07.657Z",
		"size": 413,
		"path": "../public/assets/phone-call-BAVemy_y.js"
	},
	"/assets/progress-DFfmL_PY.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"89d-/UsholXRBWAu8rjNnkwazxfydV0\"",
		"mtime": "2026-11-04T06:17:07.657Z",
		"size": 2205,
		"path": "../public/assets/progress-DFfmL_PY.js"
	},
	"/assets/query-D40Fio0Z.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3d7c-et/mK13IvEnbJTA2AkuSQuSfACY\"",
		"mtime": "2026-11-04T06:17:07.657Z",
		"size": 15740,
		"path": "../public/assets/query-D40Fio0Z.js"
	},
	"/assets/register-1giLML9b.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"12f1-jUz8mkL86NUwQaQb9uplrtxxym4\"",
		"mtime": "2026-11-04T06:17:07.657Z",
		"size": 4849,
		"path": "../public/assets/register-1giLML9b.js"
	},
	"/assets/send-CDkXKXwz.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"118-MbgZ150TNwLQz1Z0TDZGpUCh6M8\"",
		"mtime": "2026-11-04T06:17:07.657Z",
		"size": 280,
		"path": "../public/assets/send-CDkXKXwz.js"
	},
	"/assets/settings-C53sATO2.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1dd-ZQABek3iDf90/tTLigxIv6sFyZI\"",
		"mtime": "2026-11-04T06:17:07.657Z",
		"size": 477,
		"path": "../public/assets/settings-C53sATO2.js"
	},
	"/assets/shared-5u3-_MfE.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"61d74-LrnflwWFrMO0EaxZ9CsIu6vCnkE\"",
		"mtime": "2026-11-04T06:17:07.657Z",
		"size": 400756,
		"path": "../public/assets/shared-5u3-_MfE.js"
	},
	"/assets/sparkles-CAe25n0M.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1e4-/0M/q9ezrT1/42o/WZg44fkvqtc\"",
		"mtime": "2026-11-04T06:17:07.657Z",
		"size": 484,
		"path": "../public/assets/sparkles-CAe25n0M.js"
	},
	"/assets/square-pen-C4Ajt9ci.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"136-kzqZUm1kRlUL4QBFYTRJFPktRpU\"",
		"mtime": "2026-11-04T06:17:07.658Z",
		"size": 310,
		"path": "../public/assets/square-pen-C4Ajt9ci.js"
	},
	"/assets/startOfDay-BT3eKvIJ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1b7-/d4nskvL9tPAbjdyCD/0s6md+1c\"",
		"mtime": "2026-11-04T06:17:07.658Z",
		"size": 439,
		"path": "../public/assets/startOfDay-BT3eKvIJ.js"
	},
	"/assets/styles-CIFAitB4.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"1568c-tUYJqceFzfUhty1xnMBXQ/ZjIEU\"",
		"mtime": "2026-11-04T06:17:07.658Z",
		"size": 87692,
		"path": "../public/assets/styles-CIFAitB4.css"
	},
	"/assets/sun-BYhW74V8.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"60b-SQ2080wn8OMFpnjtw+j9ABf8/Nc\"",
		"mtime": "2026-11-04T06:17:07.658Z",
		"size": 1547,
		"path": "../public/assets/sun-BYhW74V8.js"
	},
	"/assets/table-CskKJAx5.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"646-OpunFzD5DwTPQtw6Etx7Yt7fXPE\"",
		"mtime": "2026-11-04T06:17:07.658Z",
		"size": 1606,
		"path": "../public/assets/table-CskKJAx5.js"
	},
	"/assets/target-CY9tWgTw.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"d8-Qf0OTNXjpQhX1TQ/I4nQCe1BFWk\"",
		"mtime": "2026-11-04T06:17:07.658Z",
		"size": 216,
		"path": "../public/assets/target-CY9tWgTw.js"
	},
	"/assets/textarea-Bmk6BS5u.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"29a-wu26sRS7zYIKl1cjGusVmuOdzkQ\"",
		"mtime": "2026-11-04T06:17:07.658Z",
		"size": 666,
		"path": "../public/assets/textarea-Bmk6BS5u.js"
	},
	"/assets/rocket-C19IDSGL.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1ba-PkTQwvUM3vhn5rkdRgnWUfgaFrs\"",
		"mtime": "2026-11-04T06:17:07.657Z",
		"size": 442,
		"path": "../public/assets/rocket-C19IDSGL.js"
	},
	"/assets/select-Bu0tLRIE.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"5965-dqEMMBWJb44/ACUy/tvXCqTlupc\"",
		"mtime": "2026-11-04T06:17:07.657Z",
		"size": 22885,
		"path": "../public/assets/select-Bu0tLRIE.js"
	},
	"/assets/tooltip-BTjOayjK.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"aff4-PG4rP9UGNR6+/z60SvUf9wO0I6I\"",
		"mtime": "2026-11-04T06:17:07.658Z",
		"size": 45044,
		"path": "../public/assets/tooltip-BTjOayjK.js"
	},
	"/assets/trash-2-SNdRW0cz.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"13e-83m+Mi8tjHvWsG9bQk47nVhPrl0\"",
		"mtime": "2026-11-04T06:17:07.658Z",
		"size": 318,
		"path": "../public/assets/trash-2-SNdRW0cz.js"
	},
	"/assets/triangle-alert-zCYKbARq.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"179-KiFYr1+H7mVmj2d1yb2N/mHRofI\"",
		"mtime": "2026-11-04T06:17:07.658Z",
		"size": 377,
		"path": "../public/assets/triangle-alert-zCYKbARq.js"
	},
	"/assets/ui-4nw_B8cQ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1a4-Nhf6tsM3Jh72U6OwoMUvS69kn+c\"",
		"mtime": "2026-11-04T06:17:07.658Z",
		"size": 420,
		"path": "../public/assets/ui-4nw_B8cQ.js"
	},
	"/assets/upload-BI0V7fjS.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"336-ICskRDu6JizztEgNGApqSNVcQjY\"",
		"mtime": "2026-11-04T06:17:07.658Z",
		"size": 822,
		"path": "../public/assets/upload-BI0V7fjS.js"
	},
	"/assets/useNavigate-DvpT5-6O.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f9-DFFAgkiMZoSaZSHM7Cn/lx/7mFs\"",
		"mtime": "2026-11-04T06:17:07.658Z",
		"size": 249,
		"path": "../public/assets/useNavigate-DvpT5-6O.js"
	},
	"/assets/useTranslation-DjNj9Eay.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"dd71-F/IDHPnZsnLs+p2OqQDLNgvm9QU\"",
		"mtime": "2026-11-04T06:17:07.658Z",
		"size": 56689,
		"path": "../public/assets/useTranslation-DjNj9Eay.js"
	},
	"/assets/user-plus-D6rELRhy.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"12c-DQ4en96cqdz7DzWiWhShD2QmAI8\"",
		"mtime": "2026-11-04T06:17:07.658Z",
		"size": 300,
		"path": "../public/assets/user-plus-D6rELRhy.js"
	},
	"/assets/theme-CHyC9KjH.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"28f-tMP/rTXa5mIYOMA2rfokvENX7IM\"",
		"mtime": "2026-11-04T06:17:07.658Z",
		"size": 655,
		"path": "../public/assets/theme-CHyC9KjH.js"
	},
	"/assets/useMutation-GqHHAKlp.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"936-ub6cz2jpohQx7bmoBuq2cZ3u0T4\"",
		"mtime": "2026-11-04T06:17:07.658Z",
		"size": 2358,
		"path": "../public/assets/useMutation-GqHHAKlp.js"
	},
	"/assets/users-BR19U1TG.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"128-Liw19qFcDXFYT1mZyWNyhLwd6pQ\"",
		"mtime": "2026-11-04T06:17:07.658Z",
		"size": 296,
		"path": "../public/assets/users-BR19U1TG.js"
	},
	"/assets/workflow-hUkIR3fR.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ff-4+mWYKY9z6Z5JeSNaf3XzHW4KpY\"",
		"mtime": "2026-11-04T06:17:07.658Z",
		"size": 255,
		"path": "../public/assets/workflow-hUkIR3fR.js"
	},
	"/assets/x-C2QBxVOd.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"90-P3L8GPIf+y8nNdlNGoA4sYhhi90\"",
		"mtime": "2026-11-04T06:17:07.658Z",
		"size": 144,
		"path": "../public/assets/x-C2QBxVOd.js"
	},
	"/assets/zap-YTtuWuUJ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1ab-59i4RkwQEkcmfJls2NRpCqo9UBw\"",
		"mtime": "2026-11-04T06:17:07.658Z",
		"size": 427,
		"path": "../public/assets/zap-YTtuWuUJ.js"
	}
};
//#endregion
//#region #nitro/virtual/public-assets
var publicAssetBases = {};
function isPublicAssetURL(id = "") {
	if (public_assets_data_default[id]) return true;
	for (const base in publicAssetBases) if (id.startsWith(base)) return true;
	return false;
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/route-rules.mjs
var headers = ((m) => function headersRouteRule(event) {
	for (const [key, value] of Object.entries(m.options || {})) event.res.headers.set(key, value);
});
//#endregion
//#region #nitro/virtual/routing
var findRouteRules = /* @__PURE__ */ (() => {
	const $0 = [{
		name: "headers",
		route: "/assets/**",
		handler: headers,
		options: { "cache-control": "public, max-age=31536000, immutable" }
	}];
	return (m, p) => {
		let r = [];
		if (p.charCodeAt(p.length - 1) === 47) p = p.slice(0, -1) || "/";
		let s = p.split("/");
		if (s.length > 1) {
			if (s[1] === "assets") r.unshift({
				data: $0,
				params: { "_": s.slice(2).join("/") }
			});
		}
		return r;
	};
})();
var _lazy_q9uKMu = defineLazyEventHandler(() => import("./_chunks/ssr-renderer.mjs"));
var findRoute = /* @__PURE__ */ (() => {
	const data = {
		route: "/**",
		handler: _lazy_q9uKMu
	};
	return ((_m, p) => {
		return {
			data,
			params: { "_": p.slice(1) }
		};
	});
})();
[].filter(Boolean);
//#endregion
//#region node_modules/nitro/dist/runtime/internal/error/prod.mjs
var errorHandler = (error, event) => {
	const res = defaultHandler(error, event);
	return new FastResponse(typeof res.body === "string" ? res.body : JSON.stringify(res.body, null, 2), res);
};
function defaultHandler(error, event) {
	const unhandled = error.unhandled ?? !HTTPError.isError(error);
	const { status = 500, statusText = "" } = unhandled ? {} : error;
	if (status === 404) {
		const url = event.url || new URL(event.req.url);
		const baseURL = "/";
		if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) return {
			status: 302,
			headers: new Headers({ location: `${baseURL}${url.pathname.slice(1)}${url.search}` })
		};
	}
	const headers = new Headers(unhandled ? {} : error.headers);
	headers.set("content-type", "application/json; charset=utf-8");
	return {
		status,
		statusText,
		headers,
		body: {
			error: true,
			...unhandled ? {
				status,
				unhandled: true
			} : typeof error.toJSON === "function" ? error.toJSON() : {
				status,
				statusText,
				message: error.message
			}
		}
	};
}
//#endregion
//#region #nitro/virtual/error-handler
var errorHandlers = [errorHandler];
async function error_handler_default(error, event) {
	for (const handler of errorHandlers) try {
		const response = await handler(error, event, { defaultHandler });
		if (response) return response;
	} catch (error) {
		console.error(error);
	}
}
//#endregion
//#region #nitro/virtual/app
function createNitroApp() {
	const captureError = (error, errorCtx) => {
		if (errorCtx?.event) {
			const errors = errorCtx.event.req.context?.nitro?.errors;
			if (errors) errors.push({
				error,
				context: errorCtx
			});
		}
	};
	const h3App = createH3App({ onError(error, event) {
		return error_handler_default(error, event);
	} });
	let appHandler = (req) => {
		req.context ||= {};
		req.context.nitro = req.context.nitro || { errors: [] };
		return h3App.fetch(req);
	};
	return {
		fetch: appHandler,
		h3: h3App,
		hooks: void 0,
		captureError
	};
}
function createH3App(config) {
	const h3App = new H3Core(config);
	h3App["~findRoute"] = (event) => findRoute(event.req.method, event.url.pathname);
	h3App["~getMiddleware"] = (event, route) => {
		const pathname = event.url.pathname;
		const method = event.req.method;
		const middleware = [];
		const routeRules = getRouteRules(method, pathname);
		event.context.routeRules = routeRules?.routeRules;
		if (routeRules?.routeRuleMiddleware.length) middleware.push(...routeRules.routeRuleMiddleware);
		if (route?.data?.middleware?.length) middleware.push(...route.data.middleware);
		return middleware;
	};
	return h3App;
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/app.mjs
var APP_ID = "default";
function useNitroApp() {
	let instance = useNitroApp._instance;
	if (instance) return instance;
	instance = useNitroApp._instance = createNitroApp();
	globalThis.__nitro__ = globalThis.__nitro__ || {};
	globalThis.__nitro__[APP_ID] = instance;
	return instance;
}
function useNitroHooks() {
	const nitroApp = useNitroApp();
	const hooks = nitroApp.hooks;
	if (hooks) return hooks;
	return nitroApp.hooks = new HookableCore();
}
function getRouteRules(method, pathname) {
	const m = findRouteRules(method, pathname);
	if (!m?.length) return { routeRuleMiddleware: [] };
	const routeRules = {};
	for (const layer of m) for (const rule of layer.data) {
		const currentRule = routeRules[rule.name];
		if (currentRule) {
			if (rule.options === false) {
				delete routeRules[rule.name];
				continue;
			}
			if (typeof currentRule.options === "object" && typeof rule.options === "object") currentRule.options = {
				...currentRule.options,
				...rule.options
			};
			else currentRule.options = rule.options;
			currentRule.route = rule.route;
			currentRule.params = {
				...currentRule.params,
				...layer.params
			};
		} else if (rule.options !== false) routeRules[rule.name] = {
			...rule,
			params: layer.params
		};
	}
	const middleware = [];
	const orderedRules = Object.values(routeRules).sort((a, b) => (a.handler?.order || 0) - (b.handler?.order || 0));
	for (const rule of orderedRules) {
		if (rule.options === false || !rule.handler) continue;
		middleware.push(rule.handler(rule));
	}
	return {
		routeRules,
		routeRuleMiddleware: middleware
	};
}
//#endregion
//#region node_modules/nitro/dist/presets/cloudflare/runtime/_module-handler.mjs
function createHandler(hooks) {
	const nitroApp = useNitroApp();
	const nitroHooks = useNitroHooks();
	return {
		async fetch(request, env, context) {
			globalThis.__env__ = env;
			augmentReq(request, {
				env,
				context
			});
			const ctxExt = {};
			const url = new URL(request.url);
			if (hooks.fetch) {
				const res = await hooks.fetch(request, env, context, url, ctxExt);
				if (res) return res;
			}
			return await nitroApp.fetch(request);
		},
		scheduled(controller, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:scheduled", {
				controller,
				env,
				context
			}) || Promise.resolve());
		},
		email(message, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:email", {
				message,
				event: message,
				env,
				context
			}) || Promise.resolve());
		},
		queue(batch, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:queue", {
				batch,
				event: batch,
				env,
				context
			}) || Promise.resolve());
		},
		tail(traces, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:tail", {
				traces,
				env,
				context
			}) || Promise.resolve());
		},
		trace(traces, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:trace", {
				traces,
				env,
				context
			}) || Promise.resolve());
		}
	};
}
function augmentReq(cfReq, ctx) {
	const req = cfReq;
	req.ip = cfReq.headers.get("cf-connecting-ip") || void 0;
	req.runtime ??= { name: "cloudflare" };
	req.runtime.cloudflare = {
		...req.runtime.cloudflare,
		...ctx
	};
	req.waitUntil = ctx.context?.waitUntil.bind(ctx.context);
}
//#endregion
//#region node_modules/nitro/dist/presets/cloudflare/runtime/cloudflare-module.mjs
var cloudflare_module_default = createHandler({ fetch(cfRequest, env, context, url) {
	if (env.ASSETS && isPublicAssetURL(url.pathname)) return env.ASSETS.fetch(cfRequest);
} });
//#endregion
export { cloudflare_module_default as default };
