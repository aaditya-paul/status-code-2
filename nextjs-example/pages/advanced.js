import AdvancedVideoPlayer from "../components/AdvancedVideoPlayer";

export default function AdvancedPlayer() {
  return (
    <div>
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
      `}</style>

      <div className="container">
        <AdvancedVideoPlayer apiUrl="http://localhost:5001" />
      </div>
    </div>
  );
}
