import React, { useState, useEffect } from 'react'
import io from 'socket.io-client'
import { Helmet } from 'react-helmet'

const { endpoints: initialEndpoints, name, port } = window.__EXPRESS_ENDPOINTS_DATA__

const App = () => {
  const [endpoints, setEndPoints] = useState(initialEndpoints)

  useEffect(() => {
    const socket = io('http://localhost:7070')

    socket.on('change-endpoints', (data) => {
      setEndPoints(data)
      console.log(data)
    })
  }, [])

  return (
    <div>
      <Helmet>
        <title>{name}</title>
      </Helmet>
      <h1>{name} {port} Count: {endpoints.length}</h1>
      <ul>
        {endpoints.map(endpoint => (
          <li key={endpoint.path}>
            <span>
              {endpoint.path}
            </span>
            {endpoint.methods.map(method => (
              <button key={method}>
                {method}
              </button>
            ))}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App
