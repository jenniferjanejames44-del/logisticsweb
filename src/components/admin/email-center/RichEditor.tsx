import { useEffect, useRef } from "react";
import { Bold, Italic, Underline, List, ListOrdered, Link as LinkIcon, Image as ImageIcon, Heading1, Heading2, Undo, Redo, Type, AlignLeft, AlignCenter, AlignRight } from "lucide-react";

interface Props { value: string; onChange: (v: string) => void; onInsertButton?: () => void; }

export default function RichEditor({ value, onChange }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) ref.current.innerHTML = value || "";
  }, [value]);

  const exec = (cmd: string, arg?: string) => {
    document.execCommand(cmd, false, arg);
    if (ref.current) onChange(ref.current.innerHTML);
  };

  const insertLink = () => {
    const url = prompt("Enter URL", "https://");
    if (url) exec("createLink", url);
  };
  const insertImage = () => {
    const url = prompt("Image URL", "https://");
    if (url) exec("insertImage", url);
  };
  const insertButton = () => {
    const label = prompt("Button text", "Learn more");
    if (!label) return;
    const url = prompt("Button URL", "https://") || "#";
    const html = `<div style="text-align:center;margin:20px 0;"><a href="${url}" style="display:inline-block;background:#DF5101;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;">${label}</a></div>`;
    exec("insertHTML", html);
  };
  const insertTable = () => {
    const rows = parseInt(prompt("Rows", "2") || "2", 10);
    const cols = parseInt(prompt("Cols", "2") || "2", 10);
    let html = '<table style="width:100%;border-collapse:collapse;margin:12px 0;">';
    for (let r = 0; r < rows; r++) {
      html += "<tr>";
      for (let c = 0; c < cols; c++) html += '<td style="border:1px solid #e5e7eb;padding:8px;">&nbsp;</td>';
      html += "</tr>";
    }
    html += "</table>";
    exec("insertHTML", html);
  };

  const Btn = ({ onClick, title, children }: any) => (
    <button type="button" onClick={onClick} title={title} className="h-8 w-8 inline-flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground transition">
      {children}
    </button>
  );

  return (
    <div className="border border-border/60 rounded-lg overflow-hidden bg-white">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border/50 bg-muted/30 px-2 py-1.5">
        <Btn title="Undo" onClick={() => exec("undo")}><Undo className="w-4 h-4"/></Btn>
        <Btn title="Redo" onClick={() => exec("redo")}><Redo className="w-4 h-4"/></Btn>
        <div className="w-px h-5 bg-border mx-1"/>
        <Btn title="H1" onClick={() => exec("formatBlock", "H1")}><Heading1 className="w-4 h-4"/></Btn>
        <Btn title="H2" onClick={() => exec("formatBlock", "H2")}><Heading2 className="w-4 h-4"/></Btn>
        <Btn title="Paragraph" onClick={() => exec("formatBlock", "P")}><Type className="w-4 h-4"/></Btn>
        <div className="w-px h-5 bg-border mx-1"/>
        <Btn title="Bold" onClick={() => exec("bold")}><Bold className="w-4 h-4"/></Btn>
        <Btn title="Italic" onClick={() => exec("italic")}><Italic className="w-4 h-4"/></Btn>
        <Btn title="Underline" onClick={() => exec("underline")}><Underline className="w-4 h-4"/></Btn>
        <div className="w-px h-5 bg-border mx-1"/>
        <Btn title="Bullet list" onClick={() => exec("insertUnorderedList")}><List className="w-4 h-4"/></Btn>
        <Btn title="Numbered" onClick={() => exec("insertOrderedList")}><ListOrdered className="w-4 h-4"/></Btn>
        <div className="w-px h-5 bg-border mx-1"/>
        <Btn title="Align left" onClick={() => exec("justifyLeft")}><AlignLeft className="w-4 h-4"/></Btn>
        <Btn title="Align center" onClick={() => exec("justifyCenter")}><AlignCenter className="w-4 h-4"/></Btn>
        <Btn title="Align right" onClick={() => exec("justifyRight")}><AlignRight className="w-4 h-4"/></Btn>
        <div className="w-px h-5 bg-border mx-1"/>
        <Btn title="Link" onClick={insertLink}><LinkIcon className="w-4 h-4"/></Btn>
        <Btn title="Image" onClick={insertImage}><ImageIcon className="w-4 h-4"/></Btn>
        <button type="button" onClick={insertButton} className="h-8 px-2 text-xs font-semibold rounded hover:bg-muted text-muted-foreground hover:text-foreground">Button</button>
        <button type="button" onClick={insertTable} className="h-8 px-2 text-xs font-semibold rounded hover:bg-muted text-muted-foreground hover:text-foreground">Table</button>
      </div>
      <div
        ref={ref}
        contentEditable
        onInput={(e) => onChange((e.target as HTMLDivElement).innerHTML)}
        className="min-h-[280px] max-h-[520px] overflow-y-auto p-4 text-[15px] leading-relaxed focus:outline-none prose prose-sm max-w-none"
        style={{ wordBreak: "break-word" }}
      />
    </div>
  );
}
