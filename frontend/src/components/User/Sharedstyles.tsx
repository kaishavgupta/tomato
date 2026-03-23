// src/components/SharedStyles.tsx
// Used by: Home, Menu
// ─────────────────────────────────────────────────────────────────────────────

export const SharedStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');

    *, *::before, *::after { box-sizing: border-box; }

    .scroll-hide::-webkit-scrollbar { display: none; }
    .scroll-hide { -ms-overflow-style: none; scrollbar-width: none; }

    @keyframes s-fadeUp  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
    @keyframes s-shimmer { from{background-position:-200% 0} to{background-position:200% 0} }
    @keyframes s-popIn   { 0%{transform:scale(0.85);opacity:0} 60%{transform:scale(1.06)} 100%{transform:scale(1);opacity:1} }
    @keyframes s-pulse   { 0%,100%{opacity:1} 50%{opacity:0.4} }
    @keyframes s-spin    { to{transform:rotate(360deg)} }

    /* ── item card (grid) ─────────────────────────────────────────────── */
    .s-item-card {
      background: white; border: 1.5px solid rgba(226,55,116,0.08); border-radius: 20px;
      overflow: hidden; transition: box-shadow 0.22s, transform 0.22s, filter 0.22s;
      display: flex; flex-direction: column;
    }
    .s-item-card:hover { box-shadow: 0 10px 36px rgba(226,55,116,0.13); transform: translateY(-2px); }

    /* When restaurant is closed — card greyed out but Add button stays vivid pink */
    .s-item-card.closed {
      filter: grayscale(85%) brightness(0.88);
      border-color: rgba(150,150,150,0.18);
    }
    .s-item-card.closed:hover {
      filter: grayscale(60%) brightness(0.92);
      box-shadow: 0 8px 28px rgba(0,0,0,0.10);
    }

    /* ── item row (list) ──────────────────────────────────────────────── */
    .s-item-row {
      background: white; border: 1.5px solid rgba(226,55,116,0.08); border-radius: 16px;
      display: flex; align-items: center; gap: 14px; padding: 14px 16px;
      transition: border-color 0.2s, box-shadow 0.2s, filter 0.2s;
    }
    .s-item-row:hover { border-color: rgba(226,55,116,0.22); box-shadow: 0 6px 24px rgba(226,55,116,0.09); }

    .s-item-row.closed {
      filter: grayscale(85%) brightness(0.88);
      border-color: rgba(150,150,150,0.18);
    }
    .s-item-row.closed:hover {
      filter: grayscale(60%) brightness(0.92);
      box-shadow: 0 4px 16px rgba(0,0,0,0.08);
    }

    /* ── restaurant strip card ── */
    .s-rest-card {
      flex-shrink: 0; width: 260px; border-radius: 24px; overflow: hidden; cursor: pointer;
      border: 1.5px solid rgba(226,55,116,0.08); background: white;
      box-shadow: 0 4px 20px rgba(226,55,116,0.06); transition: transform 0.28s ease, box-shadow 0.28s ease;
    }
    .s-rest-card:hover      { transform: translateY(-5px) scale(1.02); box-shadow: 0 20px 52px rgba(226,55,116,0.18); }
    .s-rest-card.s-rc-active { border-color: #E23774; box-shadow: 0 0 0 2.5px rgba(226,55,116,0.28), 0 16px 40px rgba(226,55,116,0.18); }

    /* ── section card (explore) ── */
    .s-section-card {
      background: white; border: 1.5px solid rgba(226,55,116,0.08); border-radius: 24px;
      overflow: hidden; margin-bottom: 12px; transition: box-shadow 0.25s, transform 0.25s;
    }
    .s-section-card:hover { box-shadow: 0 12px 40px rgba(226,55,116,0.13); transform: translateY(-2px); }

    /* ── category accordion button ── */
    .s-cat-btn {
      display: flex; align-items: center; justify-content: space-between;
      width: 100%; padding: 14px 18px; border-radius: 18px;
      background: white; border: 1.5px solid rgba(226,55,116,0.08);
      cursor: pointer; transition: box-shadow 0.2s; font-family: 'DM Sans',sans-serif;
    }
    .s-cat-btn.open { box-shadow: 0 4px 20px rgba(226,55,116,0.09); border-color: rgba(226,55,116,0.18); }

    /* ── filter pill ── */
    .s-pill {
      flex-shrink: 0; padding: 6px 16px; border-radius: 99px; font-size: 12px;
      font-weight: 600; cursor: pointer; border: 1.5px solid rgba(226,55,116,0.15);
      color: #888; background: transparent; font-family: 'DM Sans',sans-serif;
      transition: all 0.18s; white-space: nowrap;
    }
    .s-pill.on { background: linear-gradient(135deg,#E23774,#FF6B35); color: white; border-color: transparent; box-shadow: 0 4px 14px rgba(226,55,116,0.3); }
    .s-pill:not(.on):hover { border-color: rgba(226,55,116,0.35); color: #E23774; }

    /* ── Add / qty buttons ─────────────────────────────────────────────
       filter:none !important ensures these stay vivid pink even when
       the parent .s-item-card.closed or .s-item-row.closed applies grayscale.
    ─────────────────────────────────────────────────────────────────── */
    .s-add-btn {
      background: linear-gradient(135deg,#E23774,#FF6B35); color: white; border: none;
      border-radius: 12px; font-family: 'DM Sans',sans-serif; font-size: 11px;
      font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; cursor: pointer;
      padding: 7px 14px; white-space: nowrap; flex-shrink: 0;
      transition: opacity 0.15s, transform 0.15s;
      box-shadow: 0 3px 12px rgba(226,55,116,0.3);
      filter: none !important;
    }
    .s-add-btn:hover { opacity: 0.9; transform: scale(1.04); }
    .s-add-btn.added { background: rgba(34,197,94,0.1) !important; color: #16a34a !important; box-shadow: none !important; }

    .s-qty-btn {
      width: 28px; height: 28px; border-radius: 10px;
      background: linear-gradient(135deg,#E23774,#FF6B35);
      border: none; color: white; font-size: 16px; font-weight: 700; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: transform 0.15s; flex-shrink: 0;
      box-shadow: 0 2px 8px rgba(226,55,116,0.25);
      filter: none !important;
    }
    .s-qty-btn:hover { transform: scale(1.12); }

    /* ── veg indicator ── */
    .s-veg { width: 14px; height: 14px; border-radius: 3px; border: 2px solid; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

    /* ── skeleton ── */
    .s-skel {
      background: linear-gradient(90deg,#f5e9f0 25%,#fdf0f5 50%,#f5e9f0 75%);
      background-size: 200% 100%; animation: s-shimmer 1.4s infinite; border-radius: 12px;
    }

    /* ── floating cart ── */
    .s-cart-fab { position: fixed; bottom: 28px; right: 28px; z-index: 999; animation: s-popIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both; }
    .s-cart-fab-btn {
      display: flex; align-items: center; gap: 12px; padding: 14px 22px; border-radius: 99px;
      background: linear-gradient(135deg,#E23774,#FF6B35); border: none; color: white;
      font-family: 'DM Sans',sans-serif; font-size: 14px; font-weight: 700; cursor: pointer;
      box-shadow: 0 8px 32px rgba(226,55,116,0.5); transition: transform 0.2s;
    }
    .s-cart-fab-btn:hover { transform: scale(1.05); }
  `}</style>
);