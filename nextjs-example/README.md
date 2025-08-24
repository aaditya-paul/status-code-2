# Video Streaming with Next.js and Express.js

This example shows how to stream videos from your Express.js server to a Next.js frontend application.

## Project Structure

```
status-code-2/
├── functions/
│   └── vdo_stream.js          # Video streaming functions
├── video/
│   └── sample.mp4             # Your video files go here
├── index.js                   # Express.js server with streaming endpoints
└── nextjs-example/
    ├── components/
    │   ├── VideoPlayer.js     # Basic video player component
    │   └── AdvancedVideoPlayer.js  # Advanced player with custom controls
    ├── pages/
    │   ├── index.js          # Basic video streaming page
    │   └── advanced.js       # Advanced video player page
    └── package.json
```

## Setup Instructions

### 1. Backend Setup (Express.js Server)

The Express.js server is already configured with video streaming endpoints. Make sure you have:

- Your Express.js server running on `http://localhost:5001`
- Video files placed in the `/video` directory
- CORS enabled for frontend access

**Available API Endpoints:**

- `GET /videos` - List all available videos
- `GET /stream/:filename` - Stream video with range support
- `GET /download/:filename` - Download video file
- `GET /video-info/:filename` - Get video metadata

### 2. Frontend Setup (Next.js)

Navigate to the Next.js example directory and install dependencies:

```bash
cd nextjs-example
npm install
```

Start the development server:

```bash
npm run dev
```

The Next.js app will be available at `http://localhost:3000`

## Features

### Basic Video Player (`/`)

- List available videos from the server
- Stream videos with HTML5 video controls
- Download videos
- Responsive design
- Connection status indicator

### Advanced Video Player (`/advanced`)

- Custom video controls
- Progress bar with seeking
- Volume control
- Playback speed control
- Playlist functionality
- Video metadata display
- Enhanced UI/UX

## Key Features of the Streaming Implementation

### Backend (Express.js)

1. **Range Request Support**: Enables video seeking and progressive loading
2. **Security**: Validates file paths to prevent directory traversal
3. **Multiple Formats**: Supports various video formats (mp4, avi, mkv, mov, etc.)
4. **Error Handling**: Comprehensive error handling for missing files

### Frontend (Next.js)

1. **Responsive Design**: Works on desktop and mobile devices
2. **Real-time Updates**: Fetches video list dynamically
3. **Progressive Loading**: Videos load progressively with range requests
4. **Custom Controls**: Advanced player has custom video controls
5. **Playlist Management**: Easy video selection and management

## Usage Examples

### Basic Implementation

```jsx
import VideoPlayer from "../components/VideoPlayer";

export default function MyPage() {
  return <VideoPlayer apiUrl="http://localhost:5001" />;
}
```

### Advanced Implementation

```jsx
import AdvancedVideoPlayer from "../components/AdvancedVideoPlayer";

export default function MyPage() {
  return <AdvancedVideoPlayer apiUrl="http://localhost:5001" />;
}
```

## API Integration

The components automatically handle:

- Fetching video list from `/videos` endpoint
- Streaming videos from `/stream/:filename` endpoint
- Downloading videos from `/download/:filename` endpoint
- Getting video metadata from `/video-info/:filename` endpoint

## Browser Compatibility

- Modern browsers with HTML5 video support
- Range request support for video seeking
- Progressive video loading

## Customization

You can customize:

- API URL (default: `http://localhost:5001`)
- Video player appearance (CSS styles)
- Control functionality
- Video formats supported
- Player behavior

## Troubleshooting

1. **Videos not loading**:

   - Check if Express.js server is running
   - Verify video files are in `/video` directory
   - Check browser console for errors

2. **CORS errors**:

   - Ensure CORS is enabled on Express.js server
   - Check if API URL is correct

3. **Video seeking not working**:
   - Verify range request support is enabled
   - Check video file format compatibility

## Next Steps

You can extend this implementation by:

- Adding user authentication
- Implementing video upload functionality
- Adding video thumbnails
- Creating video playlists
- Adding video transcoding
- Implementing live streaming
- Adding subtitle support
