export function useAuth() {
  const getToken = () => localStorage.getItem("token");
  const saveToken = (token: string) => localStorage.setItem("token", token);
  const clearToken = () => localStorage.removeItem("token");
  const isLoggedIn = () => !!getToken();

  return { getToken, saveToken, clearToken, isLoggedIn };
}
