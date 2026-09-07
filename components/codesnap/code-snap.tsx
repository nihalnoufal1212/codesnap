"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import Link from "next/link";
import { toPng, toJpeg, toSvg } from "html-to-image";
import {
  Download, ImageIcon, LogIn, Sparkles, ShieldAlert, Copy, Upload, Save,
} from "lucide-react";
import { CodeCanvas } from "./code-canvas";
import { DEFAULT_CODE, GRADIENT_PRESETS } from "./gradients";

const EXTENSION_MAP: Record<string, string> = {
  typescript: "ts", javascript: "js", python: "py", html: "html", css: "css",
  json: "json", rust: "rs", go: "go", java: "java", cpp: "cpp", c: "c",
  sql: "sql", bash: "sh", markdown: "md", php: "php", ruby: "rb", swift: "swift",
  kotlin: "kt", csharp: "cs", yaml: "yml", perl: "pl", scala: "scala", r: "r", dart: "dart"
};

export function CodeSnap() {
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // Base State
  const [code, setCode] = useState(DEFAULT_CODE);
  const [filename, setFilename] = useState("snippet.ts");
  const [language, setLanguage] = useState("typescript");
  const [theme, setTheme] = useState("vscDarkPlus");
  const [fontFamily, setFontFamily] = useState("'Fira Code', monospace");
  const [fontSize, setFontSize] = useState("text-sm");
  const [isAnonymized, setIsAnonymized] = useState(false);
  
  useEffect(() => {
    const ext = EXTENSION_MAP[language] || "txt";
    setFilename((prev) => {
      const baseName = prev.includes(".") ? prev.substring(0, prev.lastIndexOf(".")) : prev;
      return `${baseName || "snippet"}.${ext}`;
    });
  }, [language]);

  // Export & Layout State
  const [exportFormat, setExportFormat] = useState<"png" | "jpeg" | "svg">("png");
  const [isExporting, setIsExporting] = useState(false);
  const [aspectRatio, setAspectRatio] = useState("auto");
  
  // Design State
  const [paddingX, setPaddingX] = useState(48);
  const [paddingY, setPaddingY] = useState(48);
  const [selectedBackground, setSelectedBackground] = useState(GRADIENT_PRESETS[0].css);
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [bgPattern, setBgPattern] = useState("none");
  
  // Window State
  const [windowStyle, setWindowStyle] = useState("macos");
  const [windowOpacity, setWindowOpacity] = useState(100);
  const [glassmorphism, setGlassmorphism] = useState(false);
  const [shadow, setShadow] = useState("shadow-2xl shadow-black/40");
  
  // Details State
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [wrapLines, setWrapLines] = useState(true);
  const [highlightLines, setHighlightLines] = useState("");
  const [badgeText, setBadgeText] = useState("");
  const [qrUrl, setQrUrl] = useState("");

  const processedCode = isAnonymized
    ? code
        .replace(/api[_-]?key['"]?\s*[:=]\s*['"][^'"]+['"]/gi, 'api_key: "YOUR_SECRET_KEY"')
        .replace(/password['"]?\s*[:=]\s*['"][^'"]+['"]/gi, 'password: "••••••••"')
        .replace(/Bearer\s+[a-zA-Z0-9_\-\.]+/g, 'Bearer SECRET_TOKEN')
    : code;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setBgImage(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleExport = useCallback(async () => {
    if (!canvasRef.current) return;
    setIsExporting(true);
    try {
      const options = { cacheBust: true, pixelRatio: 2 };
      let dataUrl = "";
      if (exportFormat === "png") dataUrl = await toPng(canvasRef.current, options);
      else if (exportFormat === "jpeg") dataUrl = await toJpeg(canvasRef.current, { ...options, quality: 0.95 });
      else if (exportFormat === "svg") dataUrl = await toSvg(canvasRef.current, options);

      const link = document.createElement("a");
      const dlName = filename ? filename.split('.')[0] : "codesnap";
      link.download = `${dlName}-snap.${exportFormat}`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  }, [exportFormat, filename]);

  const handleCopy = useCallback(async () => {
    if (!canvasRef.current) return;
    try {
      const dataUrl = await toPng(canvasRef.current, { cacheBust: true, pixelRatio: 2 });
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      alert("Copied to clipboard!");
    } catch (error) {
      console.error("Copy failed:", error);
    }
  }, []);

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <header className="flex shrink-0 items-center justify-between border-b border-border px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <ImageIcon className="size-5" />
          </div>
          <div><h1 className="text-lg font-semibold tracking-tight">CodeSnap Pro</h1></div>
        </div>
        <div className="flex items-center gap-3">
          <button className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-1.5">
            <Save className="size-4" /> Save Preset
          </button>
          <div className="h-4 w-px bg-border mx-1" />
          <select value={exportFormat} onChange={(e) => setExportFormat(e.target.value as any)} className="bg-secondary text-sm rounded-md px-2 py-1.5 outline-none border border-border">
            <option value="png">PNG</option>
            <option value="jpeg">JPEG</option>
            <option value="svg">SVG</option>
          </select>
          <button onClick={handleCopy} className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-secondary">
            <Copy className="size-4" /> Copy
          </button>
          <button onClick={handleExport} disabled={isExporting} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50">
            <Download className="size-4" /> Export
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <aside className="flex w-full md:w-[380px] shrink-0 flex-col gap-6 overflow-y-auto border-r border-border p-5 scrollbar-thin">
          
          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm font-bold"><Sparkles className="size-4 text-primary" /> Source Code</label>
              <button
                onClick={() => setIsAnonymized(!isAnonymized)}
                className={`flex items-center gap-1.5 rounded px-2 py-1 text-[11px] font-bold uppercase tracking-wider transition-colors ${
                  isAnonymized ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-secondary text-muted-foreground"
                }`}
              >
                <ShieldAlert className="size-3" /> {isAnonymized ? "Secrets Hidden" : "Hide Secrets"}
              </button>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              className="h-32 w-full resize-none rounded-lg border border-input bg-background p-3 font-mono text-xs focus:ring-1 focus:ring-primary"
            />
          </section>

          <hr className="border-border" />

          <section className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Filename</label>
              <input type="text" value={filename} onChange={(e) => setFilename(e.target.value)} className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Language</label>
              <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm">
                {Object.keys(EXTENSION_MAP).map(lang => (
                  <option key={lang} value={lang}>{lang.charAt(0).toUpperCase() + lang.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Theme (20+)</label>
              <select value={theme} onChange={(e) => setTheme(e.target.value)} className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm">
                <option value="vscDarkPlus">VS Code Dark</option>
                <option value="dracula">Dracula</option>
                <option value="atomDark">Atom Dark</option>
                <option value="nord">Nord</option>
                <option value="oneDark">One Dark</option>
                <option value="nightOwl">Night Owl</option>
                <option value="materialDark">Material Dark</option>
                <option value="materialLight">Material Light</option>
                <option value="a11yDark">A11y Dark</option>
                <option value="tomorrow">Tomorrow</option>
                <option value="okaidia">Okaidia</option>
                <option value="coy">Coy</option>
                <option value="darcula">Darcula</option>
                <option value="duotoneDark">Duotone Dark</option>
                <option value="duotoneLight">Duotone Light</option>
                <option value="hopscotch">Hopscotch</option>
                <option value="synthwave84">Synthwave 84</option>
                <option value="vs">VS Light</option>
                <option value="xonokai">Xonokai</option>
                <option value="shadesOfPurple">Shades of Purple</option>
                <option value="twilight">Twilight</option>
                <option value="pojoaque">Pojoaque</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Font (20+)</label>
              <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)} className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm">
                <optgroup label="Coding Fonts">
                  <option value="'Fira Code', monospace">Fira Code</option>
                  <option value="'JetBrains Mono', monospace">JetBrains Mono</option>
                  <option value="'Source Code Pro', monospace">Source Code Pro</option>
                  <option value="'Consolas', monospace">Consolas</option>
                  <option value="'Monaco', monospace">Monaco</option>
                  <option value="'Menlo', monospace">Menlo</option>
                  <option value="'Courier New', monospace">Courier New</option>
                  <option value="'Cascadia Code', monospace">Cascadia Code</option>
                  <option value="'Inconsolata', monospace">Inconsolata</option>
                  <option value="'Ubuntu Mono', monospace">Ubuntu Mono</option>
                  <option value="'Space Mono', monospace">Space Mono</option>
                  <option value="'IBM Plex Mono', monospace">IBM Plex Mono</option>
                  <option value="'SF Mono', monospace">SF Mono</option>
                </optgroup>
                <optgroup label="Standard Fonts">
                  <option value="'Inter', sans-serif">Inter</option>
                  <option value="'Roboto', sans-serif">Roboto</option>
                  <option value="'Open Sans', sans-serif">Open Sans</option>
                  <option value="'Lato', sans-serif">Lato</option>
                  <option value="'Montserrat', sans-serif">Montserrat</option>
                  <option value="'Georgia', serif">Georgia</option>
                  <option value="'Times New Roman', serif">Times New Roman</option>
                </optgroup>
              </select>
            </div>
          </section>

          <hr className="border-border" />

          <section className="space-y-4">
            <h3 className="text-sm font-bold">Window & Canvas</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Controls Style</label>
                <select value={windowStyle} onChange={(e) => setWindowStyle(e.target.value)} className="w-full rounded-md border bg-background px-2 py-1.5 text-sm">
                  <option value="macos">macOS</option>
                  <option value="windows">Windows</option>
                  <option value="none">None</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Aspect Ratio</label>
                <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)} className="w-full rounded-md border bg-background px-2 py-1.5 text-sm">
                  <option value="auto">Auto Fit</option>
                  <option value="square">1:1 (Square)</option>
                  <option value="video">16:9 (Video)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Font Size</label>
                <select value={fontSize} onChange={(e) => setFontSize(e.target.value)} className="w-full rounded-md border bg-background px-2 py-1.5 text-sm">
                  <option value="text-xs">Small</option>
                  <option value="text-sm">Medium</option>
                  <option value="text-base">Large</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Drop Shadow</label>
                <select value={shadow} onChange={(e) => setShadow(e.target.value)} className="w-full rounded-md border bg-background px-2 py-1.5 text-sm">
                  <option value="shadow-none">None</option>
                  <option value="shadow-lg shadow-black/30">Medium</option>
                  <option value="shadow-2xl shadow-black/40">Heavy</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Padding X: {paddingX}px</label>
                <input type="range" min={16} max={128} value={paddingX} onChange={(e) => setPaddingX(Number(e.target.value))} className="w-full accent-primary" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Padding Y: {paddingY}px</label>
                <input type="range" min={16} max={128} value={paddingY} onChange={(e) => setPaddingY(Number(e.target.value))} className="w-full accent-primary" />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-xs text-muted-foreground">Frosted Glass Effect</label>
              <input type="checkbox" checked={glassmorphism} onChange={(e) => setGlassmorphism(e.target.checked)} className="size-4 accent-primary rounded" />
            </div>

            {!glassmorphism && (
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Window Opacity: {windowOpacity}%</label>
                <input type="range" min={30} max={100} value={windowOpacity} onChange={(e) => setWindowOpacity(Number(e.target.value))} className="w-full accent-primary" />
              </div>
            )}
          </section>

          <hr className="border-border" />

          <section className="space-y-4">
            <h3 className="text-sm font-bold">Details & Branding</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between bg-secondary/30 p-2 rounded-md">
                <label className="text-xs text-muted-foreground">Line Numbers</label>
                <input type="checkbox" checked={showLineNumbers} onChange={(e) => setShowLineNumbers(e.target.checked)} className="size-4 accent-primary rounded" />
              </div>
              <div className="flex items-center justify-between bg-secondary/30 p-2 rounded-md">
                <label className="text-xs text-muted-foreground">Wrap Lines</label>
                <input type="checkbox" checked={wrapLines} onChange={(e) => setWrapLines(e.target.checked)} className="size-4 accent-primary rounded" />
              </div>
            </div>
            
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Highlight Lines (e.g., 2,4,5)</label>
              <input type="text" value={highlightLines} onChange={(e) => setHighlightLines(e.target.value)} placeholder="Comma separated lines..." className="w-full rounded-md border bg-background px-2 py-1.5 text-sm" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Custom Badge</label>
                <input type="text" value={badgeText} onChange={(e) => setBadgeText(e.target.value)} placeholder="e.g., NEW, v2.0" className="w-full rounded-md border bg-background px-2 py-1.5 text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">QR Code URL</label>
                <input type="text" value={qrUrl} onChange={(e) => setQrUrl(e.target.value)} placeholder="https://..." className="w-full rounded-md border bg-background px-2 py-1.5 text-sm" />
              </div>
            </div>
          </section>

          <hr className="border-border" />

          <section className="space-y-4 pb-10">
            <h3 className="text-sm font-bold">Background Canvas</h3>
            
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Texture Overlay</label>
              <select value={bgPattern} onChange={(e) => setBgPattern(e.target.value)} className="w-full rounded-md border bg-background px-2 py-1.5 text-sm">
                <option value="none">Smooth (None)</option>
                <option value="dots">Dot Grid</option>
                <option value="stripes">Diagonal Stripes</option>
              </select>
            </div>

            <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border py-3 text-sm font-medium hover:bg-secondary/50">
              <Upload className="size-4" /> Upload Custom Background Image
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
            
            {bgImage && (
              <button onClick={() => setBgImage(null)} className="w-full text-xs text-red-400 text-center">Remove Custom Image</button>
            )}

            <div className="grid grid-cols-3 gap-2">
              {GRADIENT_PRESETS.slice(0, 9).map((gradient) => (
                <button
                  key={gradient.id}
                  onClick={() => { setSelectedBackground(gradient.css); setBgImage(null); }}
                  className={`h-10 rounded-md border transition-all ${
                    selectedBackground === gradient.css && !bgImage ? "border-primary ring-2 ring-primary/30" : "border-border"
                  }`}
                  style={{ background: gradient.css }}
                />
              ))}
            </div>
          </section>
        </aside>

        <main className="flex flex-1 items-center justify-center overflow-auto bg-[#0b0d12] p-10 pattern-dots">
          <CodeCanvas
            ref={canvasRef}
            code={processedCode}
            filename={filename}
            paddingX={paddingX}
            paddingY={paddingY}
            backgroundCss={selectedBackground}
            bgImage={bgImage}
            bgPattern={bgPattern}
            language={language}
            showLineNumbers={showLineNumbers}
            wrapLines={wrapLines}
            theme={theme}
            fontFamily={fontFamily}
            fontSize={fontSize}
            windowStyle={windowStyle}
            windowOpacity={windowOpacity}
            glassmorphism={glassmorphism}
            shadow={shadow}
            aspectRatio={aspectRatio}
            highlightLines={highlightLines}
            badgeText={badgeText}
            qrUrl={qrUrl}
          />
        </main>
      </div>
    </div>
  );
}