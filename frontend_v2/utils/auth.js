export function saveAuth({ token, userId, role, profilePicture, fullName }) {
  localStorage.setItem('fnf_token', token)
  localStorage.setItem('fnf_userId', userId)
  localStorage.setItem('fnf_role', role)
  if (profilePicture) localStorage.setItem('fnf_profile', profilePicture)
  if (fullName) localStorage.setItem('fnf_fullName', fullName)
}

export function logout() { 
  localStorage.clear()
}

export function getAuth() { 
  return { 
    token: localStorage.getItem('fnf_token'), 
    userId: localStorage.getItem('fnf_userId'), 
    role: localStorage.getItem('fnf_role'), 
    profile: localStorage.getItem('fnf_profile'),
    fullName: localStorage.getItem('fnf_fullName')
  } 
}

export function isAuthenticated() {
  return !!localStorage.getItem('fnf_token')
}