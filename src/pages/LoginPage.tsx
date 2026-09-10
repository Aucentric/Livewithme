import React, { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './LoginPage.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedEmail = email.trim()
    const trimmedFirstName = firstName.trim()

    if (!trimmedEmail || !trimmedFirstName) {
      return
    }

    const normalizedUser = {
      email: trimmedEmail,
      firstName: trimmedFirstName
    }

    localStorage.setItem(
      'liveWithMeUser',
      JSON.stringify(normalizedUser)
    )

    try {
      await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(normalizedUser)
      })
    } catch {
      // Ignore backend create failures and continue to the welcome flow.
    }

    navigate('/welcome')
  }

  return (
    <div className="login-page fade-in">
      <div className="login-card">
        <h1>Live with Me</h1>
        <p className="login-subtitle">Enter your details to continue</p>

        <form onSubmit={handleSubmit} className="login-form">
          <label className="input-group">
            <span>Email address</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
            />
          </label>

          <label className="input-group">
            <span>First name</span>
            <input
              type="text"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              placeholder="First name"
              required
            />
          </label>

          <button type="submit" className="login-button">
            Login
          </button>
        </form>
      </div>
    </div>
  )
}

export default LoginPage
