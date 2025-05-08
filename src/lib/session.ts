
// Fonction pour stocker les informations utilisateur
export function setSession(token: string, userId: string, username: string, roles: string[]) {
  localStorage.setItem('token', token);
  localStorage.setItem('userId', userId);
  localStorage.setItem('roles', JSON.stringify(roles));
  console.log(username);
}
// Fonction pour nettoyer la session lors de la déconnexion

export function logout() {
  localStorage.clear();
}
export const getToken = () => {
  return localStorage.getItem('token');
};
export const getUserId = () => {
  const cuurentUserId =localStorage.getItem('userId');
  return cuurentUserId ? cuurentUserId:undefined;
};
