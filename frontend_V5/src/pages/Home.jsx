
import React, { useState, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';

import Logo from '../assets/Logo.jpeg';

import '../styles/global.css';

const fallbackAvatars = [

  'https://ui-avatars.com/api/?name=John+Smith',

  'https://ui-avatars.com/api/?name=Sarah+Johnson',

  'https://ui-avatars.com/api/?name=Mike+Chen',

  'https://ui-avatars.com/api/?name=Emily+Davis'

];

const samplePosts = [

  {

    id: '1',

    title: 'How to connect to company VPN',

    content: 'Step-by-step: open VPN client, add server address, use corporate credentials. If MFA enabled, approve on your device. Troubleshoot: check firewall, DNS, and certificates.',

    tags: ['VPN', 'IT', 'Security'],

    dept: 'IT Department',

    authorName: 'John Smith',

    upvotes: 12,

    downvotes: 0,

    comments: 3,

    createdAt: '2025-09-19T22:51:21Z'

  },

  {

    id: '2',

    title: 'How to raise leave request',

    content: 'Open HR portal → My Requests → New Leave. Select dates, reason and approver. Attach docs if needed. Manager gets a notification.',

    tags: ['HR', 'Leave', 'Process'],

    dept: 'HR Department',

    authorName: 'Sarah Johnson',

    upvotes: 8,

    downvotes: 0,

    comments: 5,

    createdAt: '2025-09-19T22:57:11Z'

  },

  {

    id: '3',

    title: 'Setup local SQL Server',

    content: 'Install SQL Server Express, enable TCP/IP, create SQL auth user and update connection string in appsettings.json. Remember to configure firewall rules.',

    tags: ['SQL', 'Server', 'Development'],

    dept: 'Development',

    authorName: 'Mike Chen',

    upvotes: 10,

    downvotes: 1,

    comments: 7,

    createdAt: '2025-09-19T23:11:43Z'

  },

  {

    id: '4',

    title: 'Best practices for code reviews',

    content: 'Always review for functionality, security, and maintainability. Use automated tools, focus on logic and potential bugs, provide constructive feedback.',

    tags: ['Code Review', 'Best Practices', 'Development'],

    dept: 'Development',

    authorName: 'Emily Davis',

    upvotes: 15,

    downvotes: 0,

    comments: 12,

    createdAt: '2025-09-20T09:30:00Z'

  }

];

function Header() {

  const navigate = useNavigate();

  return (

    <header className="header"

      style={{

        background: 'linear-gradient(90deg,#667eea 0%,#764ba2 100%)',

        boxShadow: '0 4px 18px rgba(102,126,234,0.12), 0 2px 8px rgba(83,60,179,0.09)',

        position: 'sticky', top: 0, zIndex: 100, padding: 0, width: '100vw', left: 0, right: 0

      }}>

      <div className="header-content" style={{

        display: 'flex', alignItems: 'center', height: 74,

        padding: '0 2rem'

      }}>

        <div className="logo" style={{

          background: 'white', color: '#764ba2', borderRadius: '50%',

          width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center',

          fontWeight: 800, fontSize: '1.3rem',

          marginRight: 20, letterSpacing: '1.5px',

          boxShadow: '0 3px 12px rgba(102,126,234,.10)'

        }}>

          <img src={Logo} alt="Logo" style={{ width: 32, height: 32, objectFit: 'contain', display: 'block', borderRadius: '50%' }} />

        </div>

        <h1 style={{

          margin: 0, fontSize: '1.75rem', fontWeight: 800,

          background: 'linear-gradient(90deg,#fff 10%,#b9aefd 90%)',

          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '0.5px'

        }}>FNF Knowledge Hub</h1>

        <div style={{ flex: 1 }} />

        <div className="nav-buttons" style={{ gap: '1rem', display: 'flex' }}>

          <button className="btn btn-outline" onClick={() => navigate('/signup')}

            style={{

              background: 'rgba(255,255,255,0.18)', color: '#fff', fontWeight: 700,

              border: '2px solid #fff', borderRadius: '7px'

            }}>Sign Up</button>

          <button className="btn btn-outline" onClick={() => navigate('/login')}

            style={{

              background: 'rgba(255,255,255,0.18)', color: '#fff', fontWeight: 700,

              border: '2px solid #fff', borderRadius: '7px'

            }}>Login</button>

        </div>

      </div>

    </header>

  );

}

function PostCard({ post, avatarUrl, onClick }) {

  return (

    <div className="post-card" style={{

        display: 'flex', gap: '1.1rem', alignItems: 'flex-start', padding: '1.55rem 1rem',

        background: 'linear-gradient(110deg, #e0e7ff 68%, #f5f3ff 100%)',

        border: '2px solid #b4baf0', borderRadius: '13px',

        boxShadow: '0 8px 18px rgba(118,75,162,0.11), 0 4px 8px rgba(102,126,234,.13)',

        marginBottom: '1.2rem', cursor: 'pointer'

      }} onClick={onClick}

    >

      <img src={avatarUrl} alt={post.authorName} style={{

        width: 48, height: 48, borderRadius: '50%', objectFit: 'cover',

        border: '2px solid #667eea', background: '#fff', boxShadow: '0 0 0 4px #ebe9f9', flexShrink: 0

      }} />

      <div style={{ flex: 1 }}>

        <span style={{ fontSize: '0.92rem', color: '#764ba2', fontWeight: 700 }}>{post.dept}</span>

        <h3 className="post-title" style={{ margin: '0.14rem 0 0.20rem 0', fontWeight: 700, color: '#4539a6' }}>{post.title}</h3>

        <div className="post-preview" style={{ marginBottom: '.6rem', color: '#394d6d' }}>{post.content.slice(0,120)}…</div>

        <div style={{ marginBottom: '.6rem', marginTop: '.34rem', display: 'flex', gap: '0.33rem', flexWrap: 'wrap' }}>

          {post.tags.map(tag => (

            <span className="tag" key={tag} style={{

                background: 'linear-gradient(90deg,#667eea 74%, #536895 100%)',

                color: '#fff', fontWeight: 600, padding: '0.33rem 0.80rem',

                borderRadius: '12px', fontSize: '0.82rem', border: 'none',

                marginBottom: '0.13rem', letterSpacing: '0.03em'

              }}>{tag}</span>

          ))}

        </div>

        <div className="post-meta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

          <div style={{ fontWeight: 600, color: '#5549d9' }}>

            by {post.authorName} · {new Date(post.createdAt).toLocaleDateString()}

          </div>

          <div className="post-stats" style={{ color: '#667eea', gap: '1.1rem', display: 'flex', fontSize: '1.02rem', fontWeight: 600 }}>

            <span title="Upvotes "> 👍{post.upvotes}</span>

            <span title="Comments">💬 {post.comments}</span>

            <span title="Downvotes" style={{ color: '#cd2c55' }}>👎 {post.downvotes}</span>

          </div>

        </div>

      </div>

    </div>

  );

}

export default function Home() {

  const navigate = useNavigate();

  const [viewedCount, setViewedCount] = useState(0);

  const maxViewsForGuest = 3;

  // Modal state
  const [showSignupModal, setShowSignupModal] = useState(false);

  // Show signup modal after scrolling 250px
  useEffect(() => {
    const onScroll = () => {
      // Show modal only once
      if (!showSignupModal && window.scrollY > 250) {
        setShowSignupModal(true);
      }
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [showSignupModal]);

  const handlePostClick = (postId) => {

    if (viewedCount >= maxViewsForGuest) {

      navigate('/login');

      return;

    }

    setViewedCount(prev => prev + 1);

    navigate(`/post/${postId}`);

  };

  // Basic modal component

  const SignupModal = () => (

    <div style={{

        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',

        background: 'rgba(0,0,0,0.35)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center'

      }}>

      <div style={{

        background: '#fff', borderRadius: 12, padding: '2.5rem 2rem', minWidth: 340,

        boxShadow: '0 6px 32px rgba(30,30,40,0.23)'

      }}>

        <h2 style={{ margin: '0 0 1rem 0' }}>Join FNF Knowledge Hub</h2>

        <p style={{ marginBottom: '1.5rem' }}>Sign up to unlock unlimited posts, get notified of new answers, and collaborate better!</p>

        <button

          className="btn"

          style={{ background: '#536895', color: 'white', marginRight: 16, padding: '0.7rem 2rem', fontWeight: 700 }}

          onClick={() => navigate('/signup')}

        >

          Sign Up

        </button>

        <button

          className="btn btn-outline"

          style={{ color: '#536895', border: '2px solid #536895', background: 'white', padding: '0.7rem 2rem', fontWeight: 700 }}

          onClick={() => setShowSignupModal(false)}

        >

          Maybe Later

        </button>

      </div>

    </div>

  );

  return (

    <div>

      <Header />

      {showSignupModal && <SignupModal />}

      <section className="guest-hero" style={{ marginBottom: 0, position: 'relative', minHeight: 340, overflow: 'hidden' }}>

        <div

          style={{

            background: `linear-gradient(90deg,rgba(40,40,80,0.40),rgba(20,20,50,0.22)), url("/hero.jpg") center/cover no-repeat`,

            position: 'absolute', inset: 0, zIndex: 1, width: '100%', height: '100%'

          }}

        />

        <div className="container"

          style={{

            position: 'relative', zIndex: 2, minHeight: 340,

            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start',

            padding: '2.5rem 2rem'

          }}>

          <h1 style={{

            color: "#fff", fontWeight: 800, fontSize: "2.5rem",

            textShadow: "0 2px 12px rgba(0,0,0,0.20)"

          }}>Welcome to FNF Knowledge Hub</h1>

          <p style={{

            color: "#e6eaf4", fontWeight: 600, fontSize: "1.15rem",

            marginTop: 12, textShadow: "0 1px 7px rgba(0,0,0,0.16)"

          }}>

            Discover solutions, share knowledge, and collaborate with your team

          </p>

          <button style={{

              marginTop: 30, background: "linear-gradient(90deg,#667eea 0%, #536895 100%)",

              color: "white", padding: "0.74rem 2.12rem", borderRadius: "7px",

              fontWeight: 700, fontSize: "1.09rem", boxShadow: "0 2px 8px rgba(60,60,120,0.07)",

              textDecoration: "none", border: 'none', cursor: 'pointer'

            }} onClick={() => navigate('/signup')}>Get Started</button>

        </div>

      </section>

      <main className="container" style={{ maxWidth: 850 }}>

        <div style={{ margin: '2rem 0' }}>

          <h2 style={{

            background: 'linear-gradient(90deg, #667eea 7%, #764ba2 93%)',

            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 800

          }}>Recent Knowledge Posts</h2>

          {viewedCount < maxViewsForGuest ? (

            <p style={{ color: '#6c757d', fontSize: '0.98rem', marginBottom: 0 }}>

              You can view <b>{maxViewsForGuest - viewedCount}</b> more post{maxViewsForGuest - viewedCount !== 1 ? 's' : ''} as a guest.

              <button

                style={{

                  marginLeft: '0.75rem', fontWeight: 500, fontSize: '1rem', color: '#764ba2', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline'

                }}

                onClick={() => navigate('/signup')}

              >Sign up</button> for unlimited access.

            </p>

          ) : (

            <div className="card" style={{ textAlign: 'center', background: '#f8f9fa', margin: '2rem 0' }}>

              <h3>Guest View Limit Reached</h3>

              <p>You've reached the maximum number of posts you can view as a guest.</p>

              <div className="flex gap-2" style={{ justifyContent: 'center', marginTop: '1rem' }}>

                <button className="btn btn-outline" onClick={() => navigate('/signup')}>

                  Sign Up for Free

                </button>

                <button className="btn btn-outline" onClick={() => navigate('/login')}>

                  Login

                </button>

              </div>

            </div>

          )}

        </div>

        <div>

          {samplePosts.map((post, ix) => (

            <PostCard

              key={post.id}

              post={post}

              avatarUrl={fallbackAvatars[ix % fallbackAvatars.length]}

              onClick={() => handlePostClick(post.id)}

            />

          ))}

        </div>

      </main>

      <footer className="footer">

        <h3>Join FNF Knowledge Hub Today</h3>

        <p>Access unlimited posts, create your own content, and collaborate with your team.</p>

        <button className="btn" style={{ background: 'white', color: '#333', marginTop: '1rem' }}

          onClick={() => navigate('/signup')}>Get Started</button>

      </footer>

    </div>

  );

}