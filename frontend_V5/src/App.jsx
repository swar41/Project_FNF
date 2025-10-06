import React from 'react'
import { startSignalR,stopSignalR } from "./utils/signalr";
import { useEffect } from 'react'
import { getAuth } from './utils/auth'
import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Feed from './pages/Feed'
import PostDetails from './pages/PostDetails'
import NewPost from './pages/NewPost'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Profile from './pages/Profile'
import EditPost from './pages/EditPost'
import ProfileEdit from './pages/profileEdit'
import Commits from './pages/Commits'
import { isAuthenticated } from './utils/auth'
// import Home from './pages/Home'
import GuestPage from './pages/GuestPage'
import Notifications from './pages/Notifications'
import { ToastContainer, toast } from 'react-toastify' // ✅ Added toastify
import 'react-toastify/dist/ReactToastify.css'         // ✅ toastify styles
function RequireAuth({ children }) {
  return isAuthenticated() ? children : <Navigate to="/login" replace />
}

function RequireGuest({ children }) {
  return !isAuthenticated() ? children : <Navigate to="/feed" replace />
}

export default function App() {
  useEffect(() => {
      const auth = getAuth();
    if (!auth?.token) return;

    const connection = startSignalR(auth.token);

    // connection.on("ReceiveNotification", (data) => {
    //   console.log("📢 Notification received:", data);
    connection.on("ReceiveNotification", (rawData) => {
  // normalize keys in case backend sends lowercase
  const data = {
    Type: rawData.Type || rawData.type,
    CommitMessage: rawData.CommitMessage || rawData.commitMessage,
    Manager: rawData.Manager || rawData.manager || "Unknown Manager",
    Timestamp: rawData.Timestamp || rawData.timestamp || new Date().toISOString(),
  };

  console.log("📢 Notification received:", data);

      let action = "";
      switch (data.Type) {
        case "PostUpdate":
          action = "updated a post";
          break;
        case "PostDeletion":
          action = "deleted a post";
          break;
        case "CommentUpdate":
          action = "updated a comment";
          break;
        case "CommentDeletion":
          action = "deleted a comment";
          break;
        default:
          action = "made a change";
      }

      const message = (
        <div>
          <strong>{data.Manager}</strong> {action}<br />
          <em>📝 {data.CommitMessage}</em><br />
          <small>{new Date(data.Timestamp).toLocaleString()}</small>
        </div>
      );

      toast.info(message, {
        position: "top-right",
        autoClose: 10000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
    });

    // ✅ Cleanup on unmount
    return () => {
      stopSignalR();
    };
  }, []); // Run once on mount
  return (
    <>
      <ToastContainer position="top-right" autoClose={10000} /> {/* ✅ Toast container */}

      <Routes>
        <Route path="/" element={<Home />} /> {/* ✅ show guest page by default */}
        <Route path="/feed" element={<RequireAuth><Feed /></RequireAuth>} />
        <Route path="/notifications" element={<RequireAuth><Notifications /></RequireAuth>} />

        <Route path="/post/:id" element={<PostDetails />} />
        <Route path="/edit/:id" element={<EditPost />} />
        <Route path="/new" element={<RequireAuth><NewPost /></RequireAuth>} />
        <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
        <Route path="/profile/edit" element={<RequireAuth><ProfileEdit /></RequireAuth>} />
        <Route path="/commits" element={<RequireAuth><Commits /></RequireAuth>} />
        <Route path="/login" element={<RequireGuest><Login /></RequireGuest>} />
        <Route path="/signup" element={<RequireGuest><Signup /></RequireGuest>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}