export type GradientPreset = {
  id: string;
  name: string;
  css: string;
};

export const GRADIENT_PRESETS: GradientPreset[] = [
  {
    id: "midnight",
    name: "Midnight",
    css: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
  },
  {
    id: "sunset",
    name: "Sunset",
    css: "linear-gradient(135deg, #ff512f 0%, #f09819 50%, #ff6b6b 100%)",
  },
  {
    id: "ocean",
    name: "Ocean",
    css: "linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)",
  },
  {
    id: "aurora",
    name: "Aurora",
    css: "linear-gradient(135deg, #7f00ff 0%, #e100ff 50%, #00d4ff 100%)",
  },
  {
    id: "forest",
    name: "Forest",
    css: "linear-gradient(135deg, #134e5e 0%, #71b280 100%)",
  },
  {
    id: "slate",
    name: "Slate",
    css: "linear-gradient(135deg, #232526 0%, #414345 100%)",
  },
];

export const DEFAULT_CODE = `function greet(name: string) {
  const message = \`Hello, \${name}!\`;
  console.log(message);
  return message;
}

greet("CodeSnap");`;
