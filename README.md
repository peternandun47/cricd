# Cricket Field Visualizer

A dynamic, interactive cricket field visualization tool built with Vue 3, TypeScript, and Canvas. This application helps cricket enthusiasts, coaches, and analysts visualize and plan field placements for different game situations.

## Features

### 1. Interactive Field Visualization
- Real-time field position updates
- Drag-and-drop fielder placement
- Automatic boundary enforcement
- Smart label positioning to prevent overlaps
- Visual feedback for selected fielders

### 2. Field Settings
- Pre-configured field settings for different game phases:
  - Test Match (Attacking)
  - ODI Powerplay
  - Death Overs
- Support for all standard cricket fielding positions
- Color-coded fielders based on position type:
  - Mandatory positions (e.g., Wicket-keeper, Bowler)
  - Primary positions
  - Variation positions

### 3. Smart Features
- Polar coordinate system for accurate field positioning
- Automatic label collision prevention
- Connector lines for moved labels
- Realistic cricket field rendering with:
  - 30-yard circle
  - Boundary rope
  - Pitch markings
  - Natural grass effect

## Technical Stack

- **Frontend Framework**: Vue 3
- **Language**: TypeScript
- **Build Tool**: Vite
- **Rendering**: HTML5 Canvas
- **State Management**: Vue Composition API
- **Styling**: CSS3 with Scoped Styles

## Getting Started

### Prerequisites
- Node.js (v14.0 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/cricket-field-visualizer.git
cd cricket-field-visualizer
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
# or
yarn build
```

## Usage

### Basic Controls
- **Drag and Drop**: Click and drag fielders to reposition them
- **Phase Selection**: Use the buttons in the top-right to switch between field settings
- **Auto-Adjustment**: Labels automatically adjust to prevent overlapping

### Field Positions
The application supports all standard cricket fielding positions, including:
- Slip cordon positions (First slip to Fourth slip)
- Close-in fielders (Silly point, Short leg, etc.)
- Inner ring positions (Cover, Mid-off, Mid-on, etc.)
- Boundary positions (Deep cover, Long-off, Deep mid-wicket, etc.)

### Customization
All fielding positions are defined in `src/constants/fieldingPositions.ts` and can be customized for different scenarios.

## Architecture

### Key Components
- `CricketField.vue`: Main field visualization component
- `useCanvas.ts`: Canvas rendering and interaction logic
- `fieldingPositions.ts`: Position definitions and configurations
- `fieldingUtils.ts`: Utility functions for coordinate conversion and position finding

### Coordinate System
The application uses both polar and Cartesian coordinates:
- Polar coordinates for natural cricket field position definitions
- Cartesian coordinates for canvas rendering
- Automatic conversion between the two systems

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Cricket field dimensions and positions based on standard ICC regulations
- Field visualization inspired by professional cricket analysis tools
- Special thanks to the cricket coaching community for feedback and suggestions

## Support

For support, feature requests, or bug reports, please open an issue in the GitHub repository.

---

Made with ❤️ for cricket enthusiasts worldwide
