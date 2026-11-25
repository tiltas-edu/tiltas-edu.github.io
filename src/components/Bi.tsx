// A Lithuanian line with the reader's language under it. The translation hides with the "Hide translation"
// button (NativeToggle), which sets data-native="hidden" on <html>.
export default function Bi({ lt, native, as: Tag = 'span' }: { lt: string; native: string; as?: 'span' | 'p' | 'div' }) {
  return (
    <Tag className="bi">
      <span className="bi__lt" lang="lt">{lt}</span>
      <span className="bi__native native">{native}</span>
    </Tag>
  );
}
