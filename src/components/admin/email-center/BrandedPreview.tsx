interface Props { html: string; height?: number }
export default function BrandedPreview({ html, height = 600 }: Props) {
  return (
    <iframe title="preview" srcDoc={html} className="w-full rounded-lg border border-border/50 bg-white" style={{ height }} />
  );
}
