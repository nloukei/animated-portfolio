// ── Scroll distance (px of scroll needed for full zoom) ──────────────────────
// Longer = smoother, more cinematic. Shorter = snappier.
export const SCROLL_ZOOM_DISTANCE = 1000;

// ── Tree (hero layer — zooms the most) ───────────────────────────────────────
export const MAX_SCALE = 300; // Increased slightly for a deeper "feel"
export const ORIGIN_X = '45%';
export const ORIGIN_Y = '55%';

// ── Fade-out (tree + ground dissolve near end of zoom) ───────────────────────
export const FADE_START_PROGRESS = 0.82; // Start fading near the end of the zoom
export const FADE_END_PROGRESS = 1; // Fully faded at max zoom

// ── Heading fade-out (independent timing) ─────────────────────────────────────
export const HEADING_FADE_START_PROGRESS = 0.01; // Lower = heading starts fading earlier
export const HEADING_FADE_END_PROGRESS = 0.1; // Higher = heading stays visible longer

// ── Side nav activation from zoom progress ─────────────────────────────────────
// 0 = start of zoom, 1 = end of zoom
export const ABOUT_ACTIVE_PROGRESS = 0.45;

// ── Wheel gate (rollback on first taps before committing to zoom) ────────────
export const WHEEL_TICKS_TO_UNLOCK = 3;
export const WHEEL_RESET_DELAY_MS = 700;
export const WHEEL_PREVIEW_SCALE = 1.09;
export const WHEEL_PREVIEW_DURATION = 0.3;

// ── Intro handoff (loading tree -> hero scene) ───────────────────────────────
// Delays are measured from the moment `app:flip-start` fires.
export const TREE_HANDOFF_DELAY = 0.5;
export const TREE_HANDOFF_DURATION = 1;

export const GROUND_INTRO_DELAY = 0;
export const GROUND_INTRO_DURATION = 1;

export const FOREST_INTRO_DELAY = 1;
export const FOREST_INTRO_DURATION = 1.2;

export const FOREST2_INTRO_DELAY = 1.2;
export const FOREST2_INTRO_DURATION = 1.2;

// ── Ground (foreground — zooms with tree, drops down for depth) ──────────────
export const GROUND_ORIGIN_X = '50%'; // Horizontal
export const GROUND_ORIGIN_Y = '-40%'; // Vertical
export const GROUND_DROP_Y_PERCENT = 2000; // Positive moves the ground downward while zooming

// ── Signboard (foreground prop — zooms + drops like ground, separately tuned) ─
export const SIGN_ORIGIN_X = '-40%';
export const SIGN_ORIGIN_Y = '-40%';
export const SIGN_SCALE = 300;
export const SIGN_DROP_Y_PERCENT = 5000;

// ── Big sign (bottom-left — on top of scene, own zoom + drop) ────────────────
export const BIG_SIGN_ORIGIN_X = '90%'; // Horizontal
export const BIG_SIGN_ORIGIN_Y = '-30%'; // Vertical
export const BIG_SIGN_SCALE = 280;
export const BIG_SIGN_DROP_Y_PERCENT = 500;
export const BIG_SIGN_SHIFT_X_PERCENT = 2; // Positive drifts right while zooming

// ── Billboard (between Forest2 and Forest — rises up while scrolling) ─────────
export const BILLBOARD_ORIGIN_X = '80%';
export const BILLBOARD_ORIGIN_Y = '100%';
// 110 = 110% of the element height below its natural position, fully off-screen.
export const BILLBOARD_START_Y_PERCENT = 110;
// -20 = 20% above natural position when fully risen (nicely in view).
export const BILLBOARD_END_Y_PERCENT = 0;
// Billboard text can cycle once the scroll animation is nearly complete.
export const BILLBOARD_RISE_END_PROGRESS = 0.98;

// ── Forest (mid-ground — tuned for centered layout after placement fix) ───────
export const FOREST_ORIGIN_X = '30%'; // Horizontal
export const FOREST_ORIGIN_Y = '10%'; // Vertical
export const FOREST_SCALE = 1.35;
export const FOREST_SHIFT_X_PERCENT = -2;

// ── Forest2 (background — tuned for centered layout after placement fix) ──────
export const FOREST2_ORIGIN_X = '50%'; // Horizontal
export const FOREST2_ORIGIN_Y = '100%'; // Vertical
export const FOREST2_SCALE = 1.08;
export const FOREST2_SHIFT_X_PERCENT = 2;
