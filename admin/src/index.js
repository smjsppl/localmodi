# Create src/index.js
@"
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
"@ | Out-File -FilePath "m:\localmodi\admin\src\index.js" -Encoding utf8

# Create a basic App.js
@"
import React from 'react';

function App() {
  return (
    <div className="app">
      <h1>LocalModi Admin</h1>
      <p>Admin panel is being set up...</p>
    </div>
  );
}

export default App;
"@ | Out-File -FilePath "m:\localmodi\admin\src\App.js" -Encoding utf8

# Create basic index.css
@"
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
"@ | Out-File -FilePath "m:\localmodi\admin\src\index.css" -Encoding utf8