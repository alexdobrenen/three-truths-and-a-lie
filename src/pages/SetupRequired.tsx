import './SetupRequired.css';

function SetupRequired() {
  return (
    <div className="setup-required-container">
      <div className="setup-card">
        <h1>🔧 Setup Required</h1>
        <p className="subtitle">Your Supabase credentials are not configured yet.</p>

        <div className="setup-steps">
          <h2>Quick Setup Guide:</h2>

          <div className="step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>Create a Supabase Project</h3>
              <p>Go to <a href="https://supabase.com" target="_blank" rel="noopener noreferrer">supabase.com</a> and create a free project</p>
            </div>
          </div>

          <div className="step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>Set Up Database</h3>
              <p>In your Supabase dashboard, go to SQL Editor and run the contents of <code>supabase/schema.sql</code></p>
              <p className="step-note">Optionally, also run <code>supabase/seed.sql</code> for sample teams</p>
            </div>
          </div>

          <div className="step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>Get Your Credentials</h3>
              <p>In Supabase dashboard, go to <strong>Project Settings</strong> → <strong>API</strong></p>
              <ul>
                <li>Copy your <strong>Project URL</strong></li>
                <li>Copy your <strong>anon/public key</strong></li>
              </ul>
            </div>
          </div>

          <div className="step">
            <div className="step-number">4</div>
            <div className="step-content">
              <h3>Update Environment Variables</h3>
              <p>Edit your <code>.env</code> file and replace the placeholder values:</p>
              <pre>
{`VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_actual_key_here`}
              </pre>
              <p className="step-note">Note: Headlines are loaded from <code>public/headlines.json</code></p>
            </div>
          </div>

          <div className="step">
            <div className="step-number">5</div>
            <div className="step-content">
              <h3>Restart Dev Server</h3>
              <p>Stop the dev server (Ctrl+C) and run <code>npm run dev</code> again</p>
            </div>
          </div>
        </div>

        <div className="help-section">
          <h3>Need More Help?</h3>
          <p>Check out the detailed <code>SETUP.md</code> file in the project root for complete instructions and troubleshooting.</p>
        </div>
      </div>
    </div>
  );
}

export default SetupRequired;
