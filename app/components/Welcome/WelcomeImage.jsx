import React from 'react'
import './WelcomeImage.css'
const WelcomeImage = () => {
  return (
    <div className="welcome-image">
      <div className="x">
        <div className="y">
          <img
            src="https://cdn.glitch.com/48c3bf36-f420-4677-bb7d-c1924b566f33%2FPatterns_II_sample_pattern_1_from_Jay_Schindler.png?v=1590531423906"
            alt="Sample Pattern"
            className="welcome-image welcome-image-spin welcome-image-x"
          />
        </div>
      </div>
    </div>
  )
}

export { WelcomeImage }
