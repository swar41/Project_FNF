
// ✅ Save auth in sessionStorage or localStorage depending on "Remember me"
export function saveAuth({ token, userId, role, departmentId, profilePicture, fullName }, remember = false) {
  const storage = remember ? localStorage : sessionStorage

  storage.setItem('fnf_token', token)
  storage.setItem('fnf_userId', userId)
  storage.setItem('fnf_role', role)
  storage.setItem('fnf_departmentId', departmentId)

  if (profilePicture) storage.setItem('fnf_profile', profilePicture)
  if (fullName) storage.setItem('fnf_fullName', fullName)
}

// ✅ Clear both to fully log out
export function logout() {
  sessionStorage.removeItem('fnf_token')
  sessionStorage.removeItem('fnf_userId')
  sessionStorage.removeItem('fnf_role')
  sessionStorage.removeItem('fnf_departmentId')
  sessionStorage.removeItem('fnf_profile')
  sessionStorage.removeItem('fnf_fullName')

  localStorage.removeItem('fnf_token')
  localStorage.removeItem('fnf_userId')
  localStorage.removeItem('fnf_role')
  localStorage.removeItem('fnf_departmentId')
  localStorage.removeItem('fnf_profile')
  localStorage.removeItem('fnf_fullName')
}

// ✅ Get from session first, then fallback to local
export function getAuth() {
  return {
    token:
      sessionStorage.getItem('fnf_token') ||
      localStorage.getItem('fnf_token'),
    userId:
      sessionStorage.getItem('fnf_userId') ||
      localStorage.getItem('fnf_userId'),
    role:
      sessionStorage.getItem('fnf_role') ||
      localStorage.getItem('fnf_role'),
    departmentId:
      sessionStorage.getItem('fnf_departmentId') ||
      localStorage.getItem('fnf_departmentId'),
    profile:
      sessionStorage.getItem('fnf_profile') ||
      localStorage.getItem('fnf_profile'),
    fullName:
      sessionStorage.getItem('fnf_fullName') ||
      localStorage.getItem('fnf_fullName'),
  }
}

// ✅ Check auth presence
export function isAuthenticated() {
  return !!(
    sessionStorage.getItem('fnf_token') ||
    localStorage.getItem('fnf_token')
  )
}
// 