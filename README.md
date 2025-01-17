# OBF Viewer

A modern, accessible web application for viewing and interacting with Open Board Format (OBF) files and OBZ packages. Built with Next.js and shadcn/ui components.

## Features

- 📁 Load and view OBF/OBZ files directly in your browser
- 🎨 Modern, accessible UI with support for both light and dark modes
- ♿ OpenDyslexic font support for improved readability
- 🔍 Interactive board display with customizable settings
- 📱 Responsive design that works on desktop and mobile devices
- 🔄 RESTful API for programmatic access

## Getting Started

### Prerequisites

- Node.js 16.x or later
- npm 7.x or later

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/OBFViewer.git
cd OBFViewer
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

## Usage

### Web Interface

1. Click the "Upload" button or drag and drop an OBF/OBZ file onto the page
2. The board will be displayed with all its symbols and buttons
3. Use the settings panel (gear icon) to customize the display:
   - Toggle OpenDyslexic font
   - Adjust display settings
   - Configure other board-specific options

### API

The application provides a REST API for programmatic access to OBZ file processing and board rendering.

#### Upload and Process OBZ File

```http
POST /api/upload
Content-Type: application/zip
```

Upload an OBZ file to process it and receive board data along with a rendered preview image.

**Example using curl:**
```bash
# Save response to a file
curl -X POST \
  -H "Content-Type: application/zip" \
  --data-binary "@path/to/your/file.obz" \
  http://localhost:3000/api/upload > response.json

# Extract and save the rendered image
cat response.json | jq -r '.renderedImage' | sed 's/^data:image\/png;base64,//' | base64 -d > board.png
```

**Response:**
```json
{
  "manifest": {
    "format": "open-board-0.1",
    "root": "boards/root.obf",
    "paths": {
      "boards": { ... },
      "images": { ... }
    }
  },
  "boards": {
    "board-id": {
      "format": "open-board-0.1",
      "id": "board-id",
      "name": "Board Name",
      "buttons": [ ... ],
      "grid": { ... },
      "images": [ ... ]
    }
  },
  "rootBoard": {
    // Root board data in OBF format
  },
  "renderedImage": "data:image/png;base64,..."
}
```

The `renderedImage` field contains a base64-encoded PNG image of the rendered board, including:
- Grid layout
- Button colors and borders
- Images (both URL-based and embedded)
- Labels and text

**Error Responses:**
- `400 Bad Request`: Invalid file format or missing manifest
- `500 Internal Server Error`: Server-side processing error

## Development

The application is built with:

- [Next.js](https://nextjs.org/) - React framework
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [JSZip](https://stuk.github.io/jszip/) - OBZ file handling
- [Puppeteer](https://pptr.dev/) - Board rendering for API responses

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Thanks to the OpenBoard Format :)
