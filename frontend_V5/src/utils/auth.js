
export function saveAuth({ token, userId, role, departmentId, profilePicture, fullName }) {
  
  sessionStorage.setItem('fnf_token', token)
  sessionStorage.setItem('fnf_userId', userId)
  sessionStorage.setItem('fnf_role', role)
  sessionStorage.setItem('fnf_departmentId', departmentId)   // 🔹 added
  if (profilePicture) sessionStorage.setItem('fnf_profile', profilePicture)
  if (fullName) sessionStorage.setItem('fnf_fullName', fullName)
}

export function logout() {
  sessionStorage.removeItem('fnf_token');
  sessionStorage.removeItem('fnf_userId');
  sessionStorage.removeItem('fnf_role');
  sessionStorage.removeItem('fnf_departmentId');
  sessionStorage.removeItem('fnf_profile');
  sessionStorage.removeItem('fnf_fullName');
}


export function getAuth() {
  return {
    token: sessionStorage.getItem('fnf_token'),
    userId: sessionStorage.getItem('fnf_userId'),
    role: sessionStorage.getItem('fnf_role'),
    departmentId: sessionStorage.getItem('fnf_departmentId'),   // 🔹 added
    profile: sessionStorage.getItem('fnf_profile'),
    fullName: sessionStorage.getItem('fnf_fullName')
  }
}

export function isAuthenticated() {
  return !!sessionStorage.getItem('fnf_token')
}