import { fiveV2PartManifest, requiredFiveV2Filenames } from '../../five-v2/fiveV2RigManifest';
import { FiveV2StaticAssembly } from './FiveV2StaticAssembly';

const sourceImages = import.meta.glob<string>('../../assets/five-v2/source/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
});

const reviewImages = import.meta.glob<string>('../../assets/five-v2/review/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
});

const partUrls = import.meta.glob<string>('../../assets/five-v2/parts/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
});

const sourceCards = [
  ['Master reference', '../../assets/five-v2/source/five_v2_master_reference.png'],
  ['Puppet source sheet', '../../assets/five-v2/source/five_v2_puppet_sheet.png'],
  ['Tread source sheet', '../../assets/five-v2/source/five_v2_tread_frames_sheet.png'],
  ['Final part contact sheet', '../../assets/five-v2/review/five_v2_asset_contact_sheet.png'],
] as const;

function basename(path: string) {
  return path.split('/').pop() ?? path;
}

export function FiveV2AssetReview() {
  const requiredParts = requiredFiveV2Filenames.map((filename) => {
    const manifestPart = fiveV2PartManifest.find((part) => part.filename === filename);
    return {
      filename,
      src: partUrls[`../../assets/five-v2/parts/${filename}`],
      width: manifestPart?.width,
      height: manifestPart?.height,
    };
  });

  return (
    <main className="five-v2-review-page">
      <section className="five-v2-review-band">
        <div>
          <p className="five-v2-kicker">V2 puppet asset kit</p>
          <h1>5 asset review</h1>
        </div>
        <div className="five-v2-status-pill">Validation: run by npm script</div>
      </section>

      <FiveV2StaticAssembly />

      <section className="five-v2-review-grid source-grid" aria-label="Generated source and review sheets">
        {sourceCards.map(([label, key]) => {
          const src = sourceImages[key] ?? reviewImages[key];
          return (
            <article className="five-v2-review-card" key={key}>
              <h2>{label}</h2>
              <img src={src} alt={label} draggable={false} />
              <span>{basename(key)}</span>
            </article>
          );
        })}
      </section>

      <section className="five-v2-review-grid parts-grid" aria-label="Final transparent V2 PNG parts">
        {requiredParts.map((part) => (
          <article className="five-v2-review-card part-card" key={part.filename}>
            <img src={part.src} alt="" draggable={false} />
            <h2>{part.filename}</h2>
            <span>{part.width && part.height ? `${part.width} x ${part.height}` : 'dimension pending'}</span>
          </article>
        ))}
      </section>
    </main>
  );
}
