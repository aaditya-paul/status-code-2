import {useState} from "react";
import VideoPlayer from "../components/VideoPlayer";

export default function Home() {
  const [apiUrl, setApiUrl] = useState("http://localhost:5001");
  const [isConnected, setIsConnected] = useState(false);

  // Test connection to the API
  const testConnection = async () => {
    try {
      const response = await fetch(`${apiUrl}/health`);
      const data = await response.json();
      setIsConnected(data.success);
      return data.success;
    } catch (error) {
      setIsConnected(false);
      return false;
    }
  };

  return (
    <div className="container">
      <style jsx global>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto",
            "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans",
            "Helvetica Neue", sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          background-color: #f5f5f5;
        }

        .container {
          min-height: 100vh;
          padding: 20px;
        }

        .header {
          text-align: center;
          margin-bottom: 30px;
          padding: 20px;
          background: white;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .connection-status {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin: 15px 0;
        }

        .status-indicator {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        .connected {
          background-color: #28a745;
        }

        .disconnected {
          background-color: #dc3545;
        }

        .api-config {
          margin: 20px 0;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 5px;
        }

        .input-group {
          display: flex;
          gap: 10px;
          align-items: center;
          justify-content: center;
          margin: 10px 0;
        }

        .input-group label {
          font-weight: bold;
          min-width: 80px;
        }

        .input-group input {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
          width: 300px;
        }

        .btn {
          background: #0070f3;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }

        .btn:hover {
          background: #0051cc;
        }

        .btn-test {
          background: #28a745;
        }

        .btn-test:hover {
          background: #218838;
        }

        .main-content {
          background: white;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .instructions {
          background: #e7f3ff;
          padding: 20px;
          margin: 20px 0;
          border-radius: 8px;
          border-left: 4px solid #0070f3;
        }

        .instructions h3 {
          margin-bottom: 10px;
          color: #0070f3;
        }

        .instructions ol {
          margin-left: 20px;
        }

        .instructions li {
          margin: 5px 0;
        }
      `}</style>

      <div className="header">
        <h1>🎬 Video Streaming App</h1>
        <p>Stream videos from your Express.js server to Next.js</p>

        <div className="api-config">
          <div className="input-group">
            <label>API URL:</label>
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="http://localhost:5001"
            />
            <button className="btn btn-test" onClick={testConnection}>
              Test Connection
            </button>
          </div>

          <div className="connection-status">
            <span
              className={`status-indicator ${
                isConnected ? "connected" : "disconnected"
              }`}
            ></span>
            <span>{isConnected ? "Connected to API" : "Not connected"}</span>
          </div>
        </div>
      </div>

      <div className="instructions">
        <h3>How to use:</h3>
        <ol>
          <li>
            Make sure your Express.js server is running on the specified API URL
          </li>
          <li>
            Place video files (mp4, avi, mkv, mov, wmv, flv, webm) in the{" "}
            <code>/video</code> directory of your server
          </li>
          <li>Click "Test Connection" to verify the connection</li>
          <li>Click "Refresh Videos" to load available videos</li>
          <li>Select any video to start streaming</li>
        </ol>
      </div>

      <div className="main-content">
        <VideoPlayer apiUrl={apiUrl} />
      </div>
    </div>
  );
}
