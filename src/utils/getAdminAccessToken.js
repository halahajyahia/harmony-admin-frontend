import { msalInstance, apiRequest, initializeMsal } from "../auth/msal";

export async function getAdminAccessToken() {
  await initializeMsal();
  const account =
    msalInstance.getActiveAccount() ||
    msalInstance.getAllAccounts()[0];

  if (!account) {
    throw new Error("No signed-in account found");
  }

  msalInstance.setActiveAccount(account);

  const tokenResponse = await msalInstance.acquireTokenSilent({
    ...apiRequest,
    account,
  });

  return tokenResponse.accessToken;
}