import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useParams,
  useNavigate,
  Link,
} from 'react-router-dom';
import './App.css';

function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : initialValue;
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(storedValue));
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}

function RegistrationFlow({ onRegistrationSuccess }) {
  const [formData, setFormData] = useState({
    name: 'Ram Krishna',
    email: 'ramkrishna@abc.edu',
    rollNo: 'aa1bb',
    mobileNo: '9999999999',
    githubUsername: 'github',
    accessCode: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const attemptRegistration = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');

    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      const mockResponse = {
        status: "success",
        clientId: `mock-client-${Math.random().toString(36).substring(2, 10)}`,
        clientSecret: `mock-secret-${Math.random().toString(36).substring(2, 10)}`,
        name: formData.name,
        email: formData.email,
        rollNo: formData.rollNo,
      };
      onRegistrationSuccess(mockResponse);
    } catch (err) {
      setError('Registration API error.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card registration-card">
      <h2>Service Registration</h2>
      <p>Please enter your details as provided in the instructions.</p>
      <form onSubmit={attemptRegistration} className="form">
        <div className="form__group">
          <label htmlFor="name">Name</label>
          <input id="name" name="name" type="text" value={formData.name} onChange={handleInputChange} required />
        </div>
        <div className="form__group">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} required />
        </div>
        <div className="form__group">
          <label htmlFor="rollNo">Roll Number</label>
          <input id="rollNo" name="rollNo" type="text" value={formData.rollNo} onChange={handleInputChange} required />
        </div>
        <div className="form__group">
          <label htmlFor="mobileNo">Mobile Number</label>
          <input id="mobileNo" name="mobileNo" type="tel" value={formData.mobileNo} onChange={handleInputChange} required />
        </div>
        <div className="form__group">
          <label htmlFor="githubUsername">GitHub Username</label>
          <input id="githubUsername" name="githubUsername" type="text" value={formData.githubUsername} onChange={handleInputChange} required />
        </div>
        <div className="form__group">
          <label htmlFor="accessCode">Access Code</label>
          <input id="accessCode" name="accessCode" type="text" value={formData.accessCode} onChange={handleInputChange} placeholder="Enter code from your email" required />
        </div>
        <button type="submit" className="button button--primary" disabled={isLoading}>
          {isLoading ? 'Registering...' : 'Register'}
        </button>
        {error && <div className="message message--error">{error}</div>}
      </form>
    </div>
  );
}

const DEFAULT_VALIDITY_MINUTES = 30;

function ShortenerForm({ existingUrls, onNewUrlCreated }) {
  const [longUrl, setLongUrl] = useState('');
  const [customShortcode, setCustomShortcode] = useState('');
  const [validity, setValidity] = useState(DEFAULT_VALIDITY_MINUTES);
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');

    try {
      new URL(longUrl);
    } catch {
      return setError('Please enter a valid destination URL.');
    }

    let finalShortcode = customShortcode.trim();
    if (finalShortcode) {
      if (!/^[a-zA-Z0-9_-]+$/.test(finalShortcode)) {
        return setError('Custom shortcode is not valid.');
      }
      if (existingUrls.some(url => url.shortcode === finalShortcode)) {
        return setError('This custom shortcode is already in use.');
      }
    } else {
      let newShortcode;
      do {
        newShortcode = Math.random().toString(36).substring(2, 8);
      } while (existingUrls.some(url => url.shortcode === newShortcode));
      finalShortcode = newShortcode;
    }

    onNewUrlCreated({
      longUrl,
      shortcode: finalShortcode,
      createdAt: new Date().toISOString(),
      validity: parseInt(validity, 10) || DEFAULT_VALIDITY_MINUTES,
      clicks: 0,
    });

    setLongUrl('');
    setCustomShortcode('');
    setValidity(DEFAULT_VALIDITY_MINUTES);
  };

  return (
    <div className="card">
      <form onSubmit={handleSubmit} className="form">
        <div className="form__group">
          <input type="url" value={longUrl} onChange={e => setLongUrl(e.target.value)} placeholder="Enter long URL to shorten" required />
        </div>
        <div className="form__group-row">
          <div className="form__group">
            <input type="text" value={customShortcode} onChange={e => setCustomShortcode(e.target.value)} placeholder="Custom shortcode (optional)" />
          </div>
          <div className="form__group">
            <input type="number" value={validity} onChange={e => setValidity(e.target.value)} min="1" required />
            <span>mins</span>
          </div>
        </div>
        <button type="submit" className="button button--primary">Shorten URL</button>
        {error && <div className="message message--error">{error}</div>}
      </form>
    </div>
  );
}

function AnalyticsTable({ urls }) {
  if (urls.length === 0) {
    return <p className='text-center'>You haven't created any links yet.</p>;
  }

  return (
    <div className="card">
      <h2>Link Analytics</h2>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Short Link</th>
              <th>Destination</th>
              <th>Clicks</th>
              <th>Expires At</th>
            </tr>
          </thead>
          <tbody>
            {urls.map(url => {
              const expiryDate = new Date(new Date(url.createdAt).getTime() + url.validity * 60 * 1000);
              return (
                <tr key={url.shortcode}>
                  <td>
                    <Link to={`/${url.shortcode}`} target="_blank">{`${window.location.host}/${url.shortcode}`}</Link>
                  </td>
                  <td className="cell--long-text" title={url.longUrl}>{url.longUrl}</td>
                  <td>{url.clicks}</td>
                  <td>{expiryDate.toLocaleString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DashboardPage({ onLogout }) {
  const [urls, setUrls] = useLocalStorage('shortenedUrls', []);
  const [successMessage, setSuccessMessage] = useState('');

  const handleNewUrl = (newUrlData) => {
    setUrls(prevUrls => [newUrlData, ...prevUrls]);
    const shortUrl = `${window.location.origin}/${newUrlData.shortcode}`;
    setSuccessMessage(`Link created successfully: ${shortUrl}`);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  return (
    <>
      <header>
        <h1>URL Shortener</h1>
        <button onClick={onLogout} className="button button--secondary">Reset Registration</button>
      </header>
      {successMessage && <div className="message message--success">{successMessage}</div>}
      <ShortenerForm existingUrls={urls} onNewUrlCreated={handleNewUrl} />
      <AnalyticsTable urls={urls} />
    </>
  );
}

function RedirectHandler() {
  const { shortcode } = useParams();
  const navigate = useNavigate();
  const [urls, setUrls] = useLocalStorage('shortenedUrls', []);

  useEffect(() => {
    const urlData = urls.find(u => u.shortcode === shortcode);

    if (!urlData) {
      alert('URL not found.');
      return navigate('/');
    }

    const hasExpired = new Date() > new Date(new Date(urlData.createdAt).getTime() + urlData.validity * 60 * 1000);
    if (hasExpired) {
      alert('This link has expired.');
      return navigate('/');
    }
    
    setUrls(currentUrls => currentUrls.map(u => u.shortcode === shortcode ? { ...u, clicks: u.clicks + 1 } : u));
    window.location.href = urlData.longUrl;
    
  }, [shortcode, navigate, urls, setUrls]);

  return <div className="container"><h2>Redirecting...</h2></div>;
}

function App() {
  const [auth, setAuth] = useLocalStorage('authDetails', null);
  const handleLogout = () => setAuth(null);

  return (
    <div className="container">
      {auth ? (
        <Router>
          <Routes>
            <Route path="/" element={<DashboardPage onLogout={handleLogout} />} />
            <Route path="/:shortcode" element={<RedirectHandler />} />
          </Routes>
        </Router>
      ) : (
        <RegistrationFlow onRegistrationSuccess={setAuth} />
      )}
    </div>
  );
}

export default App;