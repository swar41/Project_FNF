import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./GuestPage.css"; 

const posts = [
  {
    title: "How to connect to company VPN",
    content:
      "Step-by-step: open VPN client, add server address, use corporate credentials. If MFA enabled, approve on your device. Troubleshoot: check firewall, DNS, and certificates.",
    tags: ["VPN", "IT"],
    dept: "Dept-4",
    updates: 12,
    downvotes: 0,
    datetime: "19-9-2025, 10:51:21 pm",
  },
  {
    title: "How to raise leave request",
    content:
      "Open HR portal → My Requests → New Leave. Select dates, reason and approver. Attach docs if needed. Manager gets a notification.",
    tags: ["HR", "Leave"],
    dept: "Dept-6",
    updates: 8,
    downvotes: 0,
    datetime: "19-9-2025, 10:57:11 pm",
  },
  {
    title: "Setup local SQL Server",
    content:
      "Install SQL Server Express, enable TCP/IP, create SQL auth user and update connection string in appsettings.json.",
    tags: ["SQL", "Server"],
    dept: "Dept-6",
    updates: 10,
    downvotes: 0,
    datetime: "19-9-2025, 11:11:43 pm",
  },
];

function GuestPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/feed", { replace: true });
    }
  }, [navigate]);

  return (
    <div className="guest-page">
      {/* Header Section */}
      <header className="header-container">
        <div className="top-nav">
          <div className="nav-left">
            <div className="logo-container">
              <img src="/public/resouces/Screenshot 2025-09-24 103516.png"></img>
            </div>
          </div>
          <div className="nav-right">
            <button className="nav-btn" onClick={() => navigate("/signup")}>
              Sign Up
            </button>
            <button className="nav-btn" onClick={() => navigate("/login")}>
              Login
            </button>
          </div>
        </div>
      </header>

      {/* Welcome Section */}
      <section className="guest-header">
        <h1>Welcome to FNF Knowledge Hub</h1>
        {/* <p>Please login or sign up to continue.</p> */}
      </section>

      {/* QnAHub Section */}
      <div className="qna-container">
        {/* <h2 className="qna-header">FNF Knowledge Hub</h2>
        <div className="qna-helptext">You may view up to 3 posts. Viewed: 1.</div> */}
        {posts.map((p, idx) => (
          <div className="qna-post" key={idx}>
            <div className="qna-title">{p.title}</div>
            <div className="qna-content">{p.content}</div>
            <div className="qna-meta">
              {p.tags.map((tag) => (
                <span className="qna-tag" key={tag}>{tag}</span>
              ))}
              <span className="qna-dept">{p.dept}</span>
            </div>
            <div className="qna-footer">
              <span className="qna-updates">
                Updates: {p.updates} • Downvotes: {p.downvotes} • {p.datetime}
              </span>
              <button className="qna-btn">Read More</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default GuestPage;
