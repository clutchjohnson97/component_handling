// PCI Design Handbook: Precast and Prestressed Concrete, 8th ed.
// Chapter 8 — Design for Handling and Erection
//
// Formulas below reproduce the flat-panel stripping method of Section 8.3
// (four-point and eight-point equal-load pickup on a rectangular panel),
// generalized so `a` is the panel's long plan dimension and `b` the short
// plan dimension, matching the moment-coefficient tables in that section.

/** Panel self-weight, kip. a, b in ft; t in inches; gamma in pcf. */
export function panelWeight(a, b, t, gamma) {
  return (a * b * (t / 12) * gamma) / 1000
}

/** Uniform self-weight pressure, psf. t in inches; gamma in pcf. */
export function selfWeightPressure(t, gamma) {
  return (t / 12) * gamma
}

/** Rated lifter tension adjusted for actual concrete strength, kip.
 *  TN is the manufacturer-rated capacity at 3500 psi. */
export function adjustedLifterCapacity(TN, fc) {
  return TN * Math.sqrt(fc / 3500)
}

/** Cracking (modulus of rupture) stress limit, psi. fc in psi. */
export function crackingStress(fc) {
  return 5 * Math.sqrt(fc)
}

// Moment coefficients per PCI 8.3, equal-load pickup.
const COEFF = {
  4: { Mx: 0.0107, My: 0.0214, bEff: (b) => b / 2 },
  8: { Mx: 0.0054, My: 0.00054, bEff: (b) => b / 4 },
}

// Lift-point inset fractions per PCI 8.3 (equal-load, symmetric layout).
// Values are fractions of the respective panel dimension, measured from
// each edge.
export const LIFT_POINT_FRACTIONS = {
  4: {
    aInset: 0.207, // inset along the long (a) dimension, both ends
    bInset: 0.207, // inset along the short (b) dimension, both ends
  },
  8: {
    aInset: 0.207, // two rows, same inset along a as the 4-point case
    bFractions: [0.104, 0.396, 0.604, 0.896], // four columns along b
  },
}

/**
 * Flat-panel stripping analysis per PCI 8.3.
 * a, b: plan dimensions, ft (a = long side, b = short side)
 * t: thickness, in
 * rt: reveal/blockout depth reducing the effective section, in
 * gamma: unit weight, pcf
 * fc: concrete strength at stripping, psi
 * N: 4 or 8 pick points
 * TN: rated lifter capacity at 3500 psi, kip (per lifter)
 */
export function stripAnalysis({ a, b, t, rt, gamma, fc, N, TN }) {
  const w = selfWeightPressure(t, gamma) // psf
  const wp = panelWeight(a, b, t, gamma) // kip
  const coeff = COEFF[N]

  const aIn = a * 12
  const bIn = b * 12
  const dEff = t - rt // effective depth, in

  // w is psf and a, b are ft, so w*a^2*b (or w*a*b^2) comes out in lb-ft;
  // divide by 1000 to get the kip-ft units PCI's tables are stated in.
  const Mx = (coeff.Mx * w * a * a * b) / 1000 // kip-ft
  const My = (coeff.My * w * a * b * b) / 1000 // kip-ft

  const bEffIn = Math.min(coeff.bEff(b) * 12, 15 * t)
  const Sx = (bEffIn * dEff * dEff) / 6 // in^3
  const Sy = (aIn * dEff * dEff) / 6 // in^3

  // Mx (kip-ft) * 12 -> kip-in, * 1000 -> lb-in, / Sx (in^3) -> psi
  const fx = (Mx * 12 * 1000) / Sx // psi
  const fy = (My * 12 * 1000) / Sy // psi
  const fTot = fx + fy

  const fcr = crackingStress(fc)
  const stressDCR = fTot / fcr

  const TNR = adjustedLifterCapacity(TN, fc)
  const anchorLoad = wp / N
  const anchorDCR = anchorLoad / TNR

  return {
    w,
    wp,
    Mx,
    My,
    fx,
    fy,
    fTot,
    fcr,
    stressDCR,
    stressOK: fTot <= fcr,
    TNR,
    anchorLoad,
    anchorDCR,
    anchorOK: anchorLoad <= TNR,
    dEff,
    bEffIn,
  }
}

/**
 * Tilt-up erection check — rotation of a flat-cast panel from horizontal
 * to vertical.
 *
 * PCI Chapter 8 recommends amplifying static handling loads to account for
 * dynamic/impact effects during lifting and tilting; commonly used default
 * multipliers (verify against the specific crane/rigging plan and the full
 * handbook tables for a signed calc) are ~1.2x for concrete flexural
 * stresses and ~1.5x for embedded hardware/insert design forces.
 *
 * This module treats the governing flexural condition as the same
 * break-free-from-form geometry used in the stripping check (worst case,
 * since the perpendicular self-weight component is largest at theta = 0),
 * amplified by the concrete dynamic factor, and checks insert capacity
 * including an optional rigging (sling) angle from vertical.
 */
export function tiltUpAnalysis({
  strip, // result of stripAnalysis, reused for the flexural geometry
  fc,
  N,
  TN,
  dfConcrete,
  dfHardware,
  slingAngleDeg,
}) {
  const fTot = strip.fTot * dfConcrete
  const fcr = strip.fcr
  const stressDCR = fTot / fcr

  const TNR = adjustedLifterCapacity(TN, fc)
  const theta = (slingAngleDeg * Math.PI) / 180
  const staticLoad = (strip.wp / N) * dfHardware
  const requiredTension = staticLoad / Math.cos(theta)
  const anchorDCR = requiredTension / TNR

  return {
    fTot,
    fcr,
    stressDCR,
    stressOK: fTot <= fcr,
    TNR,
    requiredTension,
    anchorDCR,
    anchorOK: requiredTension <= TNR,
  }
}

/**
 * Lifting insert capacity check for an inclined (angled) pick.
 * P: applied vertical load carried by the insert, kip
 * TN: manufacturer-rated capacity at 3500 psi, vertical pick, kip
 * fc: actual concrete strength at time of lift, psi
 * angleDeg: rigging angle measured from vertical, degrees
 */
export function liftingInsertAnalysis({ P, TN, fc, angleDeg }) {
  const TNR = adjustedLifterCapacity(TN, fc)
  const theta = (angleDeg * Math.PI) / 180
  const requiredTension = P / Math.cos(theta)
  const DCR = requiredTension / TNR
  return {
    TNR,
    requiredTension,
    DCR,
    OK: requiredTension <= TNR,
  }
}
