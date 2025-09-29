import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Feed from './pages/Feed'
import PostDetails from './pages/PostDetails'
import NewPost from './pages/NewPost'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Profile from './pages/Profile'
import ProfileEdit from './pages/profileEdit'
import Commits from './pages/Commits'
import { isAuthenticated } from './utils/auth'

function RequireAuth({ children }) {
  return isAuthenticated() ? children : <Navigate to="/login" replace />
}

function RequireGuest({ children }) {
  return !isAuthenticated() ? children : <Navigate to="/feed" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/feed" element={<RequireAuth><Feed /></RequireAuth>} />

      <Route path="/post/:id" element={<PostDetails />} />
      <Route path="/new" element={<RequireAuth><NewPost /></RequireAuth>} />
      <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
      <Route path="/profile/edit" element={<RequireAuth><ProfileEdit /></RequireAuth>} />
      <Route path="/commits" element={<RequireAuth><Commits /></RequireAuth>} />
      <Route path="/login" element={<RequireGuest><Login /></RequireGuest>} />
      <Route path="/signup" element={<RequireGuest><Signup /></RequireGuest>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}