"use client";

import React, { useState, useRef, useEffect } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import * as themes from "react-syntax-highlighter/dist/esm/styles/prism";
import { 
  Download, 
  Copy, 
  Share2, 
  EyeOff, 
  Eye, 
  Sparkles, 
  Check, 
  Laptop 
} from "lucide-react";
import { toPng, toBlob } from "html-to-image";

// Preset Gradients
const GRADIENTS = [
  { name: "Hyper", class: "from-pink-500 via-red-500 to-yellow-500" },
  { name: "Oceanic", class: "from-green-300 via-blue-500 to-purple-600" },
  { name: "Midnight", class: "from-gray-900 via-purple-900 to-violet-600" },
  { name: "Sunset", class: "from-indigo-200 via-red-200 to-yellow-100" },
  { name: "Subtle Dark", class: "from-zinc-800 to-zinc-950" },
];

const FONTS = [
  { name: "Fira Code", class: "font-mono" },
  { name: "JetBrains Mono", class: "font-mono tracking-tight" },
  { name: "Courier New", class: "font-serif" },
];

const RATIOS = [
  { label: "Auto", value: "auto" },
  { label: "16:9 (X / Twitter)", value: "aspect-video" },
  { label: "1:1 (Square)", value: "aspect-square" },
  { label: "4:5 (Portrait)", value: "aspect-[4/5]" },
];

export default function CodeSnapStudio() {
  const [code, setCode] = useState<string>(
    `// Welcome to CodeSnap Studio!\nconst config = {\n  apiKey: "sk-proj-94829348239482",\n  theme: "Frosted Glass",\n  active: true\n};\n\nfunction launch() {\n  console.log("Ready for deployment!");\n}\nlaunch();`
  );
  const [language, setLanguage] = useState("javascript");
  const [themeName, setThemeName] = useState("vscDarkPlus");
  const [padding, setPadding] = useState(48);
  const [selectedGradient, setSelectedGradient] = useState(GRADIENTS[0].class);
  const [fontFamily, setFontFamily] = useState(FONTS[0].class);
  const [ratio, setRatio] = useState("auto");
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [hideSecrets, setHideSecrets] = useState(false);
  const [frostedGlass, setFrostedGlass] = useState(true);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  const previewRef = useRef<HTMLDivElement>(null);

  // Auto-mask secrets if toggled
  const getProcessedCode = () => {
    if (!hideSecrets) return code;
    return code
      .replace(/(['"`])(sk-[a-zA-Z0-9_\-]{10,}|ghp_[a-zA-Z0-9]{10,}|eyJ[a-zA-Z0-9_\-]{10,})\1/g, '$1••••••••••••••••$1')
      .replace(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, 'user@••••••.com');
  };

  // Sync state to shareable URL hash
  const generateShareLink = () => {
    const payload = {
      code,
      language,
      themeName,
      padding,
      selectedGradient,
      frostedGlass,
    };
    const hash = encodeURIComponent(JSON.stringify(payload));
    window.location.hash = hash;
    navigator.clipboard.writeText(window.location.href);
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  // Read shareable URL on initial mount
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash) {
      try {
        const raw = decodeURIComponent(window.location.hash.substring(1));
        const parsed = JSON.parse(raw);
        if (parsed.code) setCode(parsed.code);
        if (parsed.language) setLanguage(parsed.language);
        if (parsed.themeName) setThemeName(parsed.themeName);
        if (parsed.padding) setPadding(parsed.padding);
        if (parsed.selectedGradient) setSelectedGradient(parsed.selectedGradient);
        if (parsed.frostedGlass !== undefined) setFrostedGlass(parsed.frostedGlass);
      } catch (err) {
        console.error("Could not parse shared link", err);
      }
    }
  }, []);

  // Export as PNG Download
  const handleDownload = async () => {
    if (!previewRef.current) return;
    const dataUrl = await toPng(previewRef.current, { pixelRatio: 2 });
    const link = document.createElement("a");
    link.download = "codesnap.png";
    link.href = dataUrl;
    link.click();
  };

  // Copy Image directly to Clipboard
  const handleCopyImage = async () => {
    if (!previewRef.current) return;
    try {
      const blob = await toBlob(previewRef.current, { pixelRatio: 2 });
      if (blob) {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob })
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (error) {
      console.error("Clipboard copy failed", error);
    }
  };

  const currentTheme = (themes as Record<string, any>)[themeName] || themes.vscDarkPlus;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="border-b border-neutral-800 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-pink-500 to-violet-600 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold tracking-wide text-lg">CodeSnap Studio</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={generateShareLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-neutral-800 hover:bg-neutral-700 text-sm font-medium transition"
          >
            {shared ? <Check className="h-4 w-4 text-emerald-400" /> : <Share2 className="h-4 w-4" />}
            {shared ? "Link Copied!" : "Share Link"}
          </button>
          <button
            onClick={handleCopyImage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-neutral-800 hover:bg-neutral-700 text-sm font-medium transition"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            {copied ? "Image Copied!" : "Copy Image"}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-violet-600 hover:bg-violet-500 text-sm font-semibold transition"
          >
            <Download className="h-4 w-4" />
            Export PNG
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Editor Controls Sidebar */}
        <aside className="w-full lg:w-80 border-r border-neutral-800 p-6 space-y-6 bg-neutral-900/40">
          <div>
            <label className="text-xs uppercase text-neutral-400 font-semibold tracking-wider">Canvas Ratio</label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {RATIOS.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setRatio(r.value)}
                  className={`px-3 py-1.5 text-xs rounded border text-left transition ${
                    ratio === r.value 
                      ? "border-violet-500 bg-violet-500/10 text-violet-300" 
                      : "border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-neutral-700"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs uppercase text-neutral-400 font-semibold tracking-wider">Background Gradient</label>
            <div className="flex gap-2 mt-2">
              {GRADIENTS.map((g) => (
                <button
                  key={g.name}
                  onClick={() => setSelectedGradient(g.class)}
                  className={`h-7 w-7 rounded-full bg-gradient-to-tr ${g.class} ring-offset-2 ring-offset-neutral-950 transition ${
                    selectedGradient === g.class ? "ring-2 ring-white scale-110" : "opacity-80 hover:opacity-100"
                  }`}
                />
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs text-neutral-400 font-semibold">
              <span className="uppercase tracking-wider">Padding</span>
              <span>{padding}px</span>
            </div>
            <input
              type="range"
              min="16"
              max="96"
              value={padding}
              onChange={(e) => setPadding(Number(e.target.value))}
              className="w-full mt-2 accent-violet-500 cursor-pointer"
            />
          </div>

          <div className="space-y-3 pt-3 border-t border-neutral-800">
            <button
              onClick={() => setHideSecrets(!hideSecrets)}
              className="w-full flex items-center justify-between text-sm py-1.5 px-3 rounded bg-neutral-800/60 hover:bg-neutral-800 transition"
            >
              <span className="flex items-center gap-2">
                {hideSecrets ? <EyeOff className="h-4 w-4 text-emerald-400" /> : <Eye className="h-4 w-4 text-neutral-400" />}
                Hide API Secrets
              </span>
              <span className={`text-xs px-1.5 py-0.5 rounded ${hideSecrets ? "bg-emerald-950 text-emerald-300" : "bg-neutral-700 text-neutral-300"}`}>
                {hideSecrets ? "ON" : "OFF"}
              </span>
            </button>

            <button
              onClick={() => setFrostedGlass(!frostedGlass)}
              className="w-full flex items-center justify-between text-sm py-1.5 px-3 rounded bg-neutral-800/60 hover:bg-neutral-800 transition"
            >
              <span className="flex items-center gap-2">
                <Laptop className="h-4 w-4 text-neutral-400" />
                Frosted Glass Window
              </span>
              <span className={`text-xs px-1.5 py-0.5 rounded ${frostedGlass ? "bg-violet-950 text-violet-300" : "bg-neutral-700 text-neutral-300"}`}>
                {frostedGlass ? "ON" : "OFF"}
              </span>
            </button>

            <button
              onClick={() => setShowLineNumbers(!showLineNumbers)}
              className="w-full flex items-center justify-between text-sm py-1.5 px-3 rounded bg-neutral-800/60 hover:bg-neutral-800 transition"
            >
              <span>Line Numbers</span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-neutral-700 text-neutral-300">
                {showLineNumbers ? "ON" : "OFF"}
              </span>
            </button>
          </div>

          <div>
            <label className="text-xs uppercase text-neutral-400 font-semibold tracking-wider">Raw Code Input</label>
            <textarea
              rows={8}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full mt-2 p-3 text-xs font-mono bg-neutral-900 border border-neutral-800 rounded-md focus:outline-none focus:border-violet-500 text-neutral-300 resize-none"
              placeholder="Paste code here..."
            />
          </div>
        </aside>

        {/* Live Canvas Viewport */}
        <main className="flex-1 flex items-center justify-center p-8 bg-[radial-gradient(#262626_1px,transparent_1px)] [background-size:16px_16px] overflow-auto">
          <div
            ref={previewRef}
            style={{ padding: `${padding}px` }}
            className={`bg-gradient-to-tr ${selectedGradient} flex items-center justify-center transition-all ${ratio}`}
          >
            {/* The Code Window Frame */}
            <div
              className={`rounded-xl overflow-hidden shadow-2xl transition-all max-w-2xl w-full border ${
                frostedGlass 
                  ? "bg-neutral-900/60 backdrop-blur-md border-white/20" 
                  : "bg-neutral-950 border-neutral-800"
              }`}
            >
              {/* Window Header Dots */}
              <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-rose-500/80" />
                <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                <span className="text-xs text-neutral-400 font-mono ml-2 opacity-70">index.js</span>
              </div>

              {/* Code Area */}
              <div className={`p-4 text-sm ${fontFamily}`}>
                <SyntaxHighlighter
                  language={language}
                  style={currentTheme}
                  showLineNumbers={showLineNumbers}
                  customStyle={{
                    background: "transparent",
                    margin: 0,
                    padding: 0,
                    fontSize: "0.875rem",
                  }}
                  wrapLines={true}
                >
                  {getProcessedCode()}
                </SyntaxHighlighter>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}