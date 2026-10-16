import { useEffect, useState } from "react";
import Login from "./Login";
import Register from "./Register";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("token")
  );
  const [showRegister, setShowRegister] = useState(false);

  const [websites, setWebsites] = useState([]);
  const [selectedWebsite, setSelectedWebsite] = useState(null);
  const [history, setHistory] = useState([]);
  const [alerts, setAlerts] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [websiteName, setWebsiteName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");

  // Add Website
  const addWebsite = async (event) => {
    event.preventDefault();

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5000/api/websites",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: websiteName,
            url: websiteUrl,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add website");
      }

      setWebsites((currentWebsites) => [
        ...currentWebsites,
        data.website,
      ]);

      setWebsiteName("");
      setWebsiteUrl("");
      setShowForm(false);
    } catch (error) {
      console.error("Add website failed:", error);
      alert("Failed to add website");
    }
  };

  // Check Website
  const checkWebsite = async (websiteId) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/monitor/${websiteId}/check`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to check website");
      }

   setWebsites((currentWebsites) =>
  currentWebsites.map((website) =>
    website._id === websiteId
      ? {
          ...website,
          ...data.website,
          _id: website._id,
        }
      : website
  )
);
    } catch (error) {
      console.error("Website check failed:", error);
      alert("Failed to check website");
    }
  };

  // View Monitoring History
  const viewHistory = async (websiteId) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/monitor/${websiteId}/history`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch history");
      }

      setHistory(data);
      setSelectedWebsite(websiteId);
    } catch (error) {
      console.error("Failed to fetch history:", error);
      alert("Failed to fetch monitoring history");
    }
  };

  // Delete Website
  const deleteWebsite = async (websiteId) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/websites/${websiteId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete website");
      }

      setWebsites((currentWebsites) =>
        currentWebsites.filter(
          (website) => website._id !== websiteId
        )
      );
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete website");
    }
  };

  // Dashboard Data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");

        // Fetch websites
        const websitesResponse = await fetch(
          "http://localhost:5000/api/websites",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          }
        );

        const websitesData = await websitesResponse.json();

        if (websitesResponse.ok) {
          setWebsites(websitesData);
        }

        // Fetch alerts
        const alertsResponse = await fetch(
          "http://localhost:5000/api/alerts",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          }
        );

        const alertsData = await alertsResponse.json();

        if (alertsResponse.ok) {
          setAlerts(alertsData);
        }
      } catch (error) {
        console.error(
          "Failed to fetch dashboard data:",
          error
        );
      }
    };

    // Fetch immediately
    fetchDashboardData();

    // Refresh every 10 seconds
    const interval = setInterval(
      fetchDashboardData,
      10000
    );

    // Cleanup interval
    return () => clearInterval(interval);
  }, []);

  // Show Login page if user is not logged in
  // Show Login/Register page if user is not logged in
if (!isLoggedIn) {
  if (showRegister) {
    return (
      <Register
        onRegister={() => setShowRegister(false)}
      />
    );
  }

  return (
    <Login
      onLogin={() => setIsLoggedIn(true)}
      onRegister={() => setShowRegister(true)}
    />
  );
}

  return (
    <div className="dashboard">

      {/* Header */}
      <header className="header">
        <div>
          <h1>WebSentinel</h1>
          <p>
            Autonomous Website Monitoring & Alert System
          </p>
        </div>
    
        <div>
  <button
    className="add-btn"
    onClick={() => setShowForm(true)}
  >
    + Add Website
  </button>

  <button
    className="logout-btn"
    onClick={() => {
      localStorage.removeItem("token");
      setIsLoggedIn(false);
    }}
  >
    Logout
  </button>
</div>

      </header>

      {/* Summary Cards */}
      <section className="stats">

        <div className="stat-card">
          <h3>Total Websites</h3>
          <p>{websites.length}</p>
        </div>

        <div className="stat-card">
          <h3>Websites Up</h3>
          <p className="up">
            {
              websites.filter(
                (website) => website.status === "up"
              ).length
            }
          </p>
        </div>

        <div className="stat-card">
          <h3>Websites Down</h3>
          <p className="down">
            {
              websites.filter(
                (website) => website.status === "down"
              ).length
            }
          </p>
        </div>

      </section>

      {/* Add Website Form */}
      {showForm && (
        <div className="add-form">
          <h2>Add Website</h2>

          <form onSubmit={addWebsite}>

            <input
              type="text"
              placeholder="Website Name"
              value={websiteName}
              onChange={(event) =>
                setWebsiteName(event.target.value)
              }
              required
            />

            <input
              type="url"
              placeholder="Website URL"
              value={websiteUrl}
              onChange={(event) =>
                setWebsiteUrl(event.target.value)
              }
              required
            />

            <div>
              <button
                type="submit"
                className="check-btn"
              >
                Add Website
              </button>

              <button
                type="button"
                className="delete-btn"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            </div>

          </form>
        </div>
      )}

      {/* Websites */}
      <section className="websites-section">

        <div className="section-header">
          <h2>Monitored Websites</h2>
        </div>

        {websites.map((website) => (
          <div
            className="website-card"
            key={website._id}
          >

            <div className="website-info">
              <h3>{website.name}</h3>
              <p>{website.url}</p>
            </div>

            <div className="website-status">
              <span className="status-badge">
                ●{" "}
                {website.status?.toUpperCase() ||
                  "UNKNOWN"}
              </span>
            </div>

            <div className="website-details">

              <div>
                <span>Response Time</span>

                <strong>
                  {website.responseTime !== null
                    ? `${website.responseTime} ms`
                    : "--"}
                </strong>
              </div>

              <div>
                <span>Last Checked</span>

                <strong>
                  {website.lastChecked
                    ? new Date(
                        website.lastChecked
                      ).toLocaleString()
                    : "--"}
                </strong>
              </div>

            </div>

            <div className="website-actions">

              <button
                className="check-btn"
                onClick={() =>
                  checkWebsite(website._id)
                }
              >
                Check Now
              </button>

              <button
                className="history-btn"
                onClick={() =>
                  viewHistory(website._id)
                }
              >
                View History
              </button>

              <button
                className="delete-btn"
                onClick={() =>
                  deleteWebsite(website._id)
                }
              >
                Delete
              </button>

            </div>

          </div>
        ))}

      </section>

      {/* Alerts */}
      <section className="alerts-section">

        <div className="section-header">
          <h2>Alerts</h2>
        </div>

        {alerts.length === 0 ? (
          <p>No alerts available.</p>
        ) : (
          <div className="alerts-list">

            {alerts.map((alert) => (
              <div
                className="alert-card"
                key={alert._id}
              >

                <div>
  <strong>
    {alert.website?.name}
  </strong>

  <p>{alert.message}</p>

  {alert.aiExplanation && (
    <div className="ai-explanation">
      <strong>🤖 Gemini Analysis</strong>
      <p>{alert.aiExplanation}</p>
    </div>
  )}
</div>

                <div>
                  <span
                    className={`alert-status ${alert.status}`}
                  >
                    {alert.status.toUpperCase()}
                  </span>
                </div>

                <div>
                  <span>Created At</span>

                  <strong>
                    {new Date(
                      alert.createdAt
                    ).toLocaleString()}
                  </strong>
                </div>

              </div>
            ))}

          </div>
        )}

      </section>

      {/* Monitoring History */}
      {selectedWebsite && (
        <section className="history-section">

          <div className="section-header">
            <h2>Monitoring History</h2>
          </div>

          {history.length === 0 ? (
            <p>No monitoring history available.</p>
          ) : (
            <div className="history-list">

              {history.map((record) => (
                <div
                  className="history-card"
                  key={record._id}
                >

                  <div>
                    <span>Checked At</span>

                    <strong>
                      {new Date(
                        record.checkedAt
                      ).toLocaleString()}
                    </strong>
                  </div>

                  <div>
                    <span>Status</span>

                    <strong>
                      {record.status.toUpperCase()}
                    </strong>
                  </div>

                  <div>
                    <span>Response Time</span>

                    <strong>
                      {record.responseTime !== null
                        ? `${record.responseTime} ms`
                        : "--"}
                    </strong>
                  </div>

                  <div>
                    <span>HTTP Status</span>

                    <strong>
                      {record.httpStatus || "--"}
                    </strong>
                  </div>

                </div>
              ))}

            </div>
          )}

        </section>
      )}

    </div>
  );
}

export default App;






