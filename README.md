# OBF Viewer

A modern, accessible web application for viewing and interacting with Open Board Format (OBF) files and OBZ packages. Built with Next.js and shadcn/ui components.

## Features

- 📁 Load and view OBF/OBZ files directly in your browser
- 🎨 Modern, accessible UI with support for both light and dark modes
- ♿ OpenDyslexic font support for improved readability
- 🔍 Interactive board display with customizable settings
- 📱 Responsive design that works on desktop and mobile devices

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

1. Click the "Upload" button or drag and drop an OBF/OBZ file onto the page
2. The board will be displayed with all its symbols and buttons
3. Use the settings panel (gear icon) to customize the display:
   - Toggle OpenDyslexic font
   - Adjust display settings
   - Configure other board-specific options

## Development

The application is built with:

- [Next.js](https://nextjs.org/) - React framework
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [JSZip](https://stuk.github.io/jszip/) - OBZ file handling

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Thanks to the OpenBoard Format specification team
