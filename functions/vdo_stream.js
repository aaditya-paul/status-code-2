import fs from "fs";
import path from "path";
import {fileURLToPath} from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Video streaming function with range support
export function streamVideo(req, res, videoPath) {
  const stat = fs.statSync(videoPath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    // Parse Range header
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = end - start + 1;

    // Create read stream for the specified range
    const file = fs.createReadStream(videoPath, {start, end});

    // Set partial content headers
    const head = {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunksize,
      "Content-Type": "video/mp4",
      "Cache-Control": "no-cache",
    };

    res.writeHead(206, head);
    file.pipe(res);
  } else {
    // No range header - stream entire file
    const head = {
      "Content-Length": fileSize,
      "Content-Type": "video/mp4",
      "Accept-Ranges": "bytes",
      "Cache-Control": "no-cache",
    };

    res.writeHead(200, head);
    fs.createReadStream(videoPath).pipe(res);
  }
}

// Get video metadata
export function getVideoInfo(videoPath) {
  try {
    const stat = fs.statSync(videoPath);
    return {
      exists: true,
      size: stat.size,
      modified: stat.mtime,
      name: path.basename(videoPath),
    };
  } catch (error) {
    return {
      exists: false,
      error: error.message,
    };
  }
}

// List available videos in the video directory
export function listVideos() {
  try {
    const videoDir = path.join(__dirname, "../video");
    const files = fs.readdirSync(videoDir);

    // Filter for video files
    const videoExtensions = [
      ".mp4",
      ".avi",
      ".mkv",
      ".mov",
      ".wmv",
      ".flv",
      ".webm",
    ];
    const videoFiles = files.filter((file) => {
      const ext = path.extname(file).toLowerCase();
      return videoExtensions.includes(ext);
    });

    return videoFiles.map((file) => {
      const filePath = path.join(videoDir, file);
      const stat = fs.statSync(filePath);
      return {
        name: file,
        size: stat.size,
        modified: stat.mtime,
        path: `/stream/${encodeURIComponent(file)}`,
      };
    });
  } catch (error) {
    console.error("Error listing videos:", error);
    return [];
  }
}

// Validate video file exists and is accessible
export function validateVideoFile(filename) {
  try {
    const videoDir = path.join(__dirname, "../video");
    const videoPath = path.join(videoDir, filename);

    // Security check - ensure file is within video directory
    const resolvedPath = path.resolve(videoPath);
    const resolvedVideoDir = path.resolve(videoDir);

    if (!resolvedPath.startsWith(resolvedVideoDir)) {
      return {valid: false, error: "Invalid file path"};
    }

    // Check if file exists
    if (!fs.existsSync(videoPath)) {
      return {valid: false, error: "File not found"};
    }

    return {valid: true, path: videoPath};
  } catch (error) {
    return {valid: false, error: error.message};
  }
}
