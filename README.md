# LaTeX Converter

Natural language to LaTeX converter — type a description, get rendered math and copyable LaTeX source.

## Demo

Type something like *"the quadratic formula"* or *"Maxwell's equations in differential form"* and the app returns the LaTeX code alongside a live-rendered preview.

## Features

- Natural language input → LaTeX output powered by Claude AI
- Live rendering via [KaTeX](https://katex.org/)
- One-click copy of the LaTeX source
- Quick-launch example buttons for common formulas

## Tech Stack

- React (Vite)
- [KaTeX](https://katex.org/) for math rendering
- [Anthropic Claude API](https://docs.anthropic.com/) for natural language understanding

## Getting Started

### Prerequisites

- Node.js 18+
- An [Anthropic API key](https://console.anthropic.com/)

### Installation

```bash
git clone https://github.com/your-username/latex-converter.git
cd latex-converter
npm install
```

### Usage

This app calls the Anthropic API directly from the browser. You'll need to configure your API key — the simplest approach for local development is to use a proxy or set it up via your preferred method (env variable, config file, etc.).

Then run:

```bash
npm run dev
```

## Project Structure

```
src/
└── App.jsx   # Main app component
```

## License

MIT
