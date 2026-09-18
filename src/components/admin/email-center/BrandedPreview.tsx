interface Props { html: string; height?: number }
export default function BrandedPreview({ html, height = 600 }: Props) {
  return (
    <iframe title="Email preview" srcDoc={html} className="w-full rounded-md border border-border bg-card shadow-sm" style={{ height }} />
  );
}
