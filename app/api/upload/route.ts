import { NextResponse } from 'next/server'
import JSZip from 'jszip'
import puppeteer from 'puppeteer'
import type { OBFBoard, OBZManifest } from '@/types/obz'

async function renderBoardToImage(board: OBFBoard, manifest: OBZManifest) {
  console.log('Starting browser...')
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })
  
  try {
    console.log('Creating page...')
    const page = await browser.newPage()
    
    // Set viewport size
    await page.setViewport({
      width: 1024,
      height: 768,
      deviceScaleFactor: 1,
    })

    console.log('Setting up page content...')
    // Create a data URL from the board and manifest data
    const boardData = {
      board,
      manifest,
      timestamp: Date.now()
    }
    
    // Create a minimal HTML page that includes your app's styles and renders the board
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { margin: 0; padding: 0; }
            .board { width: 100%; height: 100%; }
            .grid { display: grid; gap: 8px; padding: 8px; height: 100%; }
            .button { 
              border: 2px solid #ccc;
              border-radius: 8px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              padding: 8px;
              text-align: center;
            }
            .button img {
              max-width: 100%;
              max-height: 100%;
              object-fit: contain;
            }
          </style>
        </head>
        <body>
          <div id="root"></div>
          <script>
            const boardData = ${JSON.stringify(boardData)};
            
            function renderBoard() {
              const root = document.getElementById('root');
              const board = boardData.board;
              
              const boardElement = document.createElement('div');
              boardElement.className = 'board';
              
              const grid = document.createElement('div');
              grid.className = 'grid';
              grid.style.gridTemplateColumns = \`repeat(\${board.grid.columns}, 1fr)\`;
              grid.style.gridTemplateRows = \`repeat(\${board.grid.rows}, 1fr)\`;
              
              board.grid.order.flat().forEach((buttonId) => {
                if (!buttonId) {
                  const emptyCell = document.createElement('div');
                  grid.appendChild(emptyCell);
                  return;
                }
                
                const button = board.buttons.find(b => b.id === buttonId);
                if (!button) return;
                
                const buttonElement = document.createElement('div');
                buttonElement.className = 'button';
                buttonElement.style.backgroundColor = button.background_color || '#ffffff';
                buttonElement.style.borderColor = button.border_color || '#cccccc';
                
                if (button.image_id) {
                  const image = board.images.find(img => img.id === button.image_id);
                  if (image && (image.url || image.data)) {
                    const img = document.createElement('img');
                    img.src = image.url || image.data;
                    img.alt = button.label;
                    buttonElement.appendChild(img);
                  }
                }
                
                const label = document.createElement('div');
                label.textContent = button.label;
                buttonElement.appendChild(label);
                
                grid.appendChild(buttonElement);
              });
              
              boardElement.appendChild(grid);
              root.appendChild(boardElement);
              
              // Signal that rendering is complete
              const event = new CustomEvent('renderComplete');
              document.dispatchEvent(event);
            }
            
            renderBoard();
          </script>
        </body>
      </html>
    `)

    console.log('Waiting for render...')
    // Wait for the content to be rendered
    await page.waitForSelector('.board')
    // Wait for custom event signaling render completion
    await page.evaluate(() => {
      return new Promise((resolve) => {
        if (document.querySelector('.board')) {
          resolve(true);
          return;
        }
        document.addEventListener('renderComplete', () => resolve(true), { once: true });
      });
    });
    
    // Wait a bit for images to load
    console.log('Waiting for images...')
    await new Promise(resolve => setTimeout(resolve, 2000))

    console.log('Taking screenshot...')
    // Take a screenshot
    const screenshot = await page.screenshot({
      type: 'png',
      encoding: 'base64',
      fullPage: true
    })

    console.log('Screenshot taken, length:', screenshot.length)
    return screenshot
  } catch (error) {
    console.error('Error in renderBoardToImage:', error)
    throw error
  } finally {
    await browser.close()
  }
}

export async function POST(request: Request) {
  try {
    console.log('Received upload request')
    // Check content type
    const contentType = request.headers.get('content-type')
    if (!contentType?.includes('application/zip') && !contentType?.includes('application/octet-stream')) {
      return NextResponse.json(
        { error: 'Invalid content type. Expected application/zip or application/octet-stream' },
        { status: 400 }
      )
    }

    // Get the file buffer
    const fileBuffer = await request.arrayBuffer()
    console.log('Received file buffer, size:', fileBuffer.byteLength)
    
    // Load the OBZ file
    const zip = new JSZip()
    const zipContents = await zip.loadAsync(fileBuffer)
    console.log('Loaded zip file')
    
    // Parse manifest
    const manifestFile = zipContents.file('manifest.json')
    if (!manifestFile) {
      return NextResponse.json(
        { error: 'Invalid OBZ file: manifest.json not found' },
        { status: 400 }
      )
    }
    
    const manifest: OBZManifest = JSON.parse(await manifestFile.async('text'))
    console.log('Parsed manifest')
    const boards: { [key: string]: OBFBoard } = {}
    
    // Load boards and handle embedded images
    for (const [boardId, path] of Object.entries(manifest.paths.boards)) {
      const boardFile = zipContents.file(path)
      if (boardFile) {
        const boardContent = await boardFile.async("text")
        const board: OBFBoard = JSON.parse(boardContent)
        
        // Handle embedded images
        for (const image of board.images) {
          if (image.path) {
            const imageFile = zipContents.file(image.path)
            if (imageFile) {
              const imageData = await imageFile.async("base64")
              image.data = `data:${image.content_type};base64,${imageData}`
            }
          }
        }
        
        boards[boardId] = board
      }
    }
    console.log('Loaded boards:', Object.keys(boards))
    
    // Load root board directly from the manifest root path
    const rootBoardFile = zipContents.file(manifest.root)
    if (!rootBoardFile) {
      return NextResponse.json(
        { error: 'Root board not found in OBZ file' },
        { status: 400 }
      )
    }
    const rootBoardJson = await rootBoardFile.async("text")
    const rootBoard: OBFBoard = JSON.parse(rootBoardJson)
    
    // Handle embedded images for root board
    for (const image of rootBoard.images) {
      if (image.path) {
        const imageFile = zipContents.file(image.path)
        if (imageFile) {
          const imageData = await imageFile.async("base64")
          image.data = `data:${image.content_type};base64,${imageData}`
        }
      }
    }
    
    console.log('Found root board:', rootBoard.name)

    // Generate rendered image
    console.log('Generating rendered image...')
    const renderedImage = await renderBoardToImage(rootBoard, manifest)
    console.log('Generated image, length:', renderedImage.length)

    const response = {
      manifest,
      boards,
      rootBoard,
      renderedImage: `data:image/png;base64,${renderedImage}`
    }

    console.log('Sending response...')
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('Error processing OBZ file:', error)
    return NextResponse.json(
      { error: 'Failed to process OBZ file', details: error.message },
      { status: 500 }
    )
  }
}
