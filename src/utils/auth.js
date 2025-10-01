
export function saveAuth({ token, userId, role, departmentId, profilePicture, fullName }) {
  localStorage.setItem('fnf_token', token)
  localStorage.setItem('fnf_userId', userId)
  localStorage.setItem('fnf_role', role)
  if(departmentId)localStorage.setItem('fnf_departmentId', departmentId)   // 🔹 added
  if (profilePicture) localStorage.setItem('fnf_profile', profilePicture)
  if (fullName) localStorage.setItem('fnf_fullName', fullName)
}

export function logout() {
  localStorage.removeItem('fnf_token')
  localStorage.removeItem('fnf_userId')
  localStorage.removeItem('fnf_role')
  localStorage.clear()
}

export function getAuth() {
  return {
    token: localStorage.getItem('fnf_token'),
    userId: localStorage.getItem('fnf_userId'),
    role: localStorage.getItem('fnf_role'),
    departmentId: localStorage.getItem('fnf_departmentId'),   // 🔹 added
    profile: localStorage.getItem('fnf_profile'),
    fullName: localStorage.getItem('fnf_fullName')
  }
}

export function isAuthenticated() {
  return !!localStorage.getItem('fnf_token')
}