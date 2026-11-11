import { n as create, t as persist } from "../_libs/zustand.mjs";
import { a as setTokenGetter } from "./button-BsqHVsio.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-DdXLipCd.js
var useAuth = create()(persist((set) => ({
	user: null,
	token: null,
	workspaceId: "w1",
	previewRole: null,
	signIn: (user, token) => set({
		user,
		token
	}),
	signOut: () => set({
		user: null,
		token: null,
		previewRole: null
	}),
	setWorkspace: (workspaceId) => set({ workspaceId }),
	setPreviewRole: (previewRole) => set({ previewRole })
}), {
	name: "konvo-auth",
	skipHydration: true
}));
setTokenGetter(() => useAuth.getState().token);
var useEffectiveRole = () => {
	const { user, previewRole } = useAuth();
	return previewRole ?? user?.role ?? "readonly";
};
//#endregion
export { useEffectiveRole as n, useAuth as t };
