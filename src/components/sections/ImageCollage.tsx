export default function ImageCollage() {
  return (
    <section style={{ paddingBottom: 'clamp(40px, 6vw, 80px)' }}>
      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 var(--gutter)' }}>
        <div
          className="collage-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1.2fr 0.9fr',
            gridTemplateRows: '280px 200px',
            gap: 16,
          }}
        >
          {/* Top left — tall */}
          <div style={{ gridRow: '1 / 3', overflow: 'hidden', borderRadius: 16 }}>
            <img src="/images/workshop.jpg" alt="Strategy workshop" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
          {/* Top centre */}
          <div style={{ overflow: 'hidden', borderRadius: 16 }}>
            <img src="/images/strategy.jpg" alt="Team collaboration" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
          {/* Top right */}
          <div style={{ overflow: 'hidden', borderRadius: 16 }}>
            <img src="/images/office.jpg" alt="Modern office" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
          {/* Bottom — wide */}
          <div style={{ gridColumn: '2 / 4', overflow: 'hidden', borderRadius: 16 }}>
            <img src="/images/technology.jpg" alt="Technology and data" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .collage-grid {
            grid-template-columns: 1fr 1fr !important;
            grid-template-rows: 200px 200px 200px !important;
          }
          .collage-grid > div:first-child { grid-row: auto !important; }
          .collage-grid > div:last-child { grid-column: 1 / -1 !important; }
        }
      `}</style>
    </section>
  )
}
