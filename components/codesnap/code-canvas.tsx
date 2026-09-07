"use client";

import { forwardRef } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  vscDarkPlus, dracula, atomDark, nord, oneDark,
  materialDark, materialLight, nightOwl, a11yDark, tomorrow,
  okaidia, coy, darcula, duotoneDark, duotoneLight,
  hopscotch, synthwave84, vs, xonokai, shadesOfPurple,
  twilight, pojoaque, prism
} from "react-syntax-highlighter/dist/esm/styles/prism";

type CodeCanvasProps = {
  code: string;
  filename: string;
  paddingX: number;
  paddingY: number;
  backgroundCss: string;
  bgImage: string | null;
  bgPattern: string;
  language: string;
  showLineNumbers: boolean;
  wrapLines: boolean;
  theme: string;
  fontFamily: string;
  fontSize: string;
  windowStyle: string;
  windowOpacity: number;
  glassmorphism: boolean;
  shadow: string;
  aspectRatio: string;
  highlightLines: string;
  badgeText: string;
  qrUrl: string;
};

const themeMap: Record<string, any> = {
  vscDarkPlus, dracula, atomDark, nord, oneDark,
  materialDark, materialLight, nightOwl, a11yDark, tomorrow,
  okaidia, coy, darcula, duotoneDark, duotoneLight,
  hopscotch, synthwave84, vs, xonokai, shadesOfPurple,
  twilight, pojoaque, prism
};

export const CodeCanvas = forwardRef<HTMLDivElement, CodeCanvasProps>(
  function CodeCanvas(props, ref) {
    const {
      code, filename, paddingX, paddingY, backgroundCss, bgImage, bgPattern,
      language, showLineNumbers, wrapLines, theme, fontFamily, fontSize, windowStyle,
      windowOpacity, glassmorphism, shadow, aspectRatio, highlightLines, badgeText, qrUrl
    } = props;

    const selectedTheme = themeMap[theme] || vscDarkPlus;

    const containerStyle: React.CSSProperties = {
      background: bgImage ? `url(${bgImage}) center/cover no-repeat` : backgroundCss,
      padding: aspectRatio === "auto" ? `${paddingY}px ${paddingX}px` : "2rem",
    };

    let aspectClass = "inline-block";
    if (aspectRatio === "square") {
      aspectClass = "aspect-square flex items-center justify-center mx-auto";
      containerStyle.width = "600px";
    } else if (aspectRatio === "video") {
      aspectClass = "aspect-video flex items-center justify-center mx-auto";
      containerStyle.width = "800px";
    }

    let patternStyle: React.CSSProperties = {};
    if (bgPattern === "dots") patternStyle = { backgroundImage: "radial-gradient(rgba(255,255,255,0.2) 1px, transparent 1px)", backgroundSize: "20px 20px" };
    if (bgPattern === "stripes") patternStyle = { backgroundImage: "repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 10px, transparent 10px, transparent 20px)" };

    const linesToHighlight = highlightLines.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));

    // Frosted Glass Logic
    const windowBgClass = glassmorphism ? "bg-[#1e1e2e]/40 backdrop-blur-xl" : "bg-[#1e1e2e]";
    const headerBgClass = glassmorphism ? "bg-white/5 border-b border-white/10" : "bg-[#181825] border-b border-white/5";

    return (
      <div
        ref={ref}
        className={`relative rounded-none sm:rounded-2xl overflow-hidden ${aspectClass}`}
        style={containerStyle}
      >
        {bgPattern !== "none" && <div className="absolute inset-0 z-0 pointer-events-none" style={patternStyle} />}

        <div 
          className={`relative z-10 w-full overflow-hidden rounded-xl ring-1 ring-white/10 ${windowBgClass} ${shadow} flex flex-col`}
          style={{ 
            opacity: glassmorphism ? 1 : windowOpacity / 100, 
            maxWidth: aspectRatio !== "auto" ? "90%" : "none",
            maxHeight: aspectRatio !== "auto" ? "90%" : "none"
          }}
        >
          {windowStyle !== "none" && (
            <div className={`flex items-center justify-between px-4 py-3 ${headerBgClass}`}>
              <div className="flex w-20 items-center gap-1.5">
                {windowStyle === "macos" && (
                  <>
                    <span className="size-3 rounded-full bg-[#ff5f57]" />
                    <span className="size-3 rounded-full bg-[#febc2e]" />
                    <span className="size-3 rounded-full bg-[#28c840]" />
                  </>
                )}
              </div>
              <div className="flex flex-1 items-center justify-center gap-2">
                <span className="text-xs font-medium text-white/60 drop-shadow-sm">{filename}</span>
                {badgeText && (
                  <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary ring-1 ring-primary/30">
                    {badgeText}
                  </span>
                )}
              </div>
              <div className="flex w-20 justify-end">
                {windowStyle === "windows" && (
                  <div className="flex gap-3 text-white/40 text-xs">
                    <span>—</span><span>□</span><span>×</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className={`${fontSize} flex-1 overflow-auto`} style={{ fontFamily }}>
            <SyntaxHighlighter
              language={language}
              style={selectedTheme}
              showLineNumbers={showLineNumbers}
              wrapLines={true}
              wrapLongLines={wrapLines}
              lineProps={(lineNumber) => {
                let style: React.CSSProperties = { display: "block", padding: "0 10px" };
                
                if (linesToHighlight.includes(lineNumber)) {
                  style.backgroundColor = "rgba(255, 255, 255, 0.1)";
                  style.borderLeft = "3px solid #6366f1"; 
                }
                
                if (wrapLines) {
                  style.wordBreak = "break-all";
                  style.whiteSpace = "pre-wrap";
                }
                
                return { style };
              }}
              customStyle={{
                margin: 0,
                padding: "1.25rem",
                background: "transparent",
                lineHeight: "1.6",
                overflowX: "hidden", 
              }}
            >
              {code || " "}
            </SyntaxHighlighter>
          </div>
        </div>

        <div className="relative z-10 mt-6 flex w-full items-end justify-between px-2" style={{ maxWidth: aspectRatio !== "auto" ? "90%" : "none" }}>
           <div className="text-xs font-semibold tracking-wider text-white/70 drop-shadow-md flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-full backdrop-blur-sm">
             <span>⚡ Built with CodeSnap</span>
           </div>
           
           {qrUrl && (
             <div className="rounded-md bg-white/90 p-1.5 shadow-xl backdrop-blur-md">
               <svg viewBox="0 0 24 24" fill="black" className="size-10">
                 <path d="M3 3h8v8H3zM5 5v4h4V5zM13 3h8v8h-8zM15 5v4h4V5zM3 13h8v8H3zM5 15v4h4v-4zM13 13h2v2h-2zM15 13h2v2h-2zM17 13h2v2h-2zM19 13h2v2h-2zM13 15h2v2h-2zM17 15h2v2h-2zM19 17h2v2h-2zM15 17h2v2h-2zM13 19h2v2h-2zM17 19h2v2h-2zM15 21h2v2h-2zM19 21h2v2h-2z" />
               </svg>
             </div>
           )}
        </div>
      </div>
    );
  }
);