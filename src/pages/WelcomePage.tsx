import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import './WelcomePage.css'

function WelcomePage() {
  const [firstName, setFirstName] = useState('Friend')

  useEffect(() => {
    const storedUser = localStorage.getItem('liveWithMeUser')

    if (storedUser) {
      const parsedUser = JSON.parse(storedUser)
      if (parsedUser.firstName) {
        setFirstName(parsedUser.firstName)
      }
    }
  }, [])

  return (
    <div className="welcome-page fade-in">
      <div className="welcome-card">
        <p className="welcome-eyebrow">Welcome</p>
        <h1>Welcome {firstName},</h1>
        <p className="welcome-message">
          this is your special place to the creator's heart
        </p>
        <Link to="/home" className="welcome-button">
          Open Live with Me
        </Link>
      </div>

      <footer className="welcome-footer">
        <p>Powered by Purba</p>
      </footer>
    </div>
  )
}

export default WelcomePage
