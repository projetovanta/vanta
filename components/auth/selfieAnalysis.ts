// YCbCr skin-tone detection — funciona para todos os tons (Fitzpatrick I–VI)
export const isSkinPixel = (r: number, g: number, b: number): boolean => {
  const y = 0.299 * r + 0.587 * g + 0.114 * b;
  const cb = -0.169 * r - 0.331 * g + 0.5 * b + 128;
  const cr = 0.5 * r - 0.419 * g - 0.081 * b + 128;
  return y > 80 && cb >= 85 && cb <= 135 && cr >= 135 && cr <= 180;
};

// Oval guide em viewBox 300×400 → mapeado para canvas W×H
// cx=150 cy=175 rx=105 ry=130 (viewBox 300×400)
export const OVAL_VB = { cx: 150, cy: 175, rx: 105, ry: 130, vw: 300, vh: 400 };

// Análise de pele DENTRO do oval, dividida em 4 zonas (topo, base, esq, dir)
interface OvalAnalysis {
  brightness: number; // luminosidade média dentro do oval
  skinTotal: number; // % pele total dentro do oval
  skinTop: number; // % pele na metade superior do oval (testa)
  skinBottom: number; // % pele na metade inferior do oval (queixo)
  skinLeft: number; // % pele no lado esquerdo do oval
  skinRight: number; // % pele no lado direito do oval
  skinCenterX: number; // centroide X da pele (0-1, 0.5 = centrado)
  skinCenterY: number; // centroide Y da pele (0-1, 0.5 = centrado)
  skinOutside: number; // % pele FORA do oval (rosto grande demais)
}

export const analyzeOvalRegion = (ctx: CanvasRenderingContext2D, W: number, H: number): OvalAnalysis => {
  const ocx = (OVAL_VB.cx / OVAL_VB.vw) * W;
  const ocy = (OVAL_VB.cy / OVAL_VB.vh) * H;
  const orx = (OVAL_VB.rx / OVAL_VB.vw) * W;
  const ory = (OVAL_VB.ry / OVAL_VB.vh) * H;

  const imgData = ctx.getImageData(0, 0, W, H);
  const d = imgData.data;

  let totalInside = 0,
    skinInside = 0,
    brightnessSum = 0;
  let skinTop = 0,
    skinBot = 0,
    skinLft = 0,
    skinRgt = 0;
  let topTotal = 0,
    botTotal = 0,
    lftTotal = 0,
    rgtTotal = 0;
  let skinSumX = 0,
    skinSumY = 0;
  let totalOutsideRing = 0,
    skinOutsideRing = 0;

  // Margem exterior: 15% maior que o oval para detectar rosto sangrando fora
  const marginRx = orx * 1.15,
    marginRy = ory * 1.15;

  for (let py = 0; py < H; py++) {
    for (let px = 0; px < W; px++) {
      const dx = (px - ocx) / orx;
      const dy = (py - ocy) / ory;
      const dist = dx * dx + dy * dy;
      const i = (py * W + px) * 4;
      const r = d[i],
        g = d[i + 1],
        b = d[i + 2];
      const isSkin = isSkinPixel(r, g, b);

      if (dist <= 1.0) {
        // Dentro do oval
        totalInside++;
        brightnessSum += 0.299 * r + 0.587 * g + 0.114 * b;
        if (isSkin) {
          skinInside++;
          skinSumX += px;
          skinSumY += py;
          if (py < ocy) {
            skinTop++;
          } else {
            skinBot++;
          }
          if (px < ocx) {
            skinLft++;
          } else {
            skinRgt++;
          }
        }
        if (py < ocy) topTotal++;
        else botTotal++;
        if (px < ocx) lftTotal++;
        else rgtTotal++;
      } else {
        // Anel exterior (entre oval e margem) — detectar rosto que sai do oval
        const dxM = (px - ocx) / marginRx;
        const dyM = (py - ocy) / marginRy;
        if (dxM * dxM + dyM * dyM <= 1.0) {
          totalOutsideRing++;
          if (isSkin) skinOutsideRing++;
        }
      }
    }
  }

  return {
    brightness: totalInside > 0 ? brightnessSum / totalInside : 0,
    skinTotal: totalInside > 0 ? skinInside / totalInside : 0,
    skinTop: topTotal > 0 ? skinTop / topTotal : 0,
    skinBottom: botTotal > 0 ? skinBot / botTotal : 0,
    skinLeft: lftTotal > 0 ? skinLft / lftTotal : 0,
    skinRight: rgtTotal > 0 ? skinRgt / rgtTotal : 0,
    skinCenterX: skinInside > 0 ? (skinSumX / skinInside - (ocx - orx)) / (2 * orx) : 0.5,
    skinCenterY: skinInside > 0 ? (skinSumY / skinInside - (ocy - ory)) / (2 * ory) : 0.5,
    skinOutside: totalOutsideRing > 0 ? skinOutsideRing / totalOutsideRing : 0,
  };
};

export const classifyOval = (a: OvalAnalysis): 'FACE' | 'DARK' | 'NO_FACE' | 'PARTIAL' => {
  if (a.brightness < 55) return 'DARK';
  if (a.skinTotal < 0.22) return 'NO_FACE';
  // Rosto grande demais — muita pele sangrando fora do oval
  if (a.skinOutside > 0.35) return 'PARTIAL';
  // Rosto pequeno demais — pouca pele dentro do oval
  if (a.skinTotal < 0.3) return 'NO_FACE';
  // Cobertura por zona — todas devem ter pele significativa (rosto inteiro no oval)
  const minZone = Math.min(a.skinTop, a.skinBottom, a.skinLeft, a.skinRight);
  if (minZone < 0.1) return 'PARTIAL';
  // Centralização — centroide deve estar perto do centro do oval (0.3–0.7)
  if (a.skinCenterX < 0.3 || a.skinCenterX > 0.7) return 'PARTIAL';
  if (a.skinCenterY < 0.25 || a.skinCenterY > 0.75) return 'PARTIAL';
  return 'FACE';
};

export const analyzeSelfie = (img: HTMLImageElement): 'APPROVED' | 'DARK' | 'NO_FACE' | 'PARTIAL' => {
  const canvas = document.createElement('canvas');
  // Canvas 3:4 para mapear o oval corretamente
  const W = 240,
    H = 320;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0, W, H);
  const result = classifyOval(analyzeOvalRegion(ctx, W, H));
  return result === 'FACE' ? 'APPROVED' : result;
};
