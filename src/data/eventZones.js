/**
 * PULSE — Event Zones & Hero Media Configuration
 * 
 * SWAPPING IMAGES GUIDE:
 * To replace placeholder illustrations with actual production event photography,
 * simply change the `image` or `src` path below to your image files (JPG, PNG, WebP).
 * Recommended formats:
 * - Landscape zone cards: 16:10 or 16:9 ratio, min 1600px wide.
 * - Portrait zone cards: 3:4 or 2:3 ratio, min 1200px tall.
 * - Hero scattered media: Aspect ratios indicated per item in heroMedia.
 */

// Zone Card Images
import entryGateImg from '../assets/event/entry-gate.svg';
import mainStageImg from '../assets/event/main-stage.svg';
import registrationImg from '../assets/event/registration.svg';
import foodZoneImg from '../assets/event/food-zone.svg';
import backstageImg from '../assets/event/backstage.svg';

// Hero Scattered Media
import heroLeftTop from '../assets/event/hero-left-top.svg';
import heroLeftBot from '../assets/event/hero-left-bot.svg';
import heroCenterCrowd from '../assets/event/hero-center-crowd.svg';
import heroBridgeStage from '../assets/event/hero-bridge-stage.svg';
import heroRightPort1 from '../assets/event/hero-right-portrait1.svg';
import heroRightPort2 from '../assets/event/hero-right-portrait2.svg';
import heroRightTop from '../assets/event/hero-right-top.svg';

/**
 * 5 Event Zones — Asymmetric Width Sequence (§6.3)
 * Exact spec:
 * 1. ENTRY GATE, lead landscape (~58-60vw), 18 / 20 VOLUNTEERS · GAP 2
 * 2. MAIN STAGE, portrait (~35-40vw), 14 / 16 · 2 POSITIONS OPEN
 * 3. REGISTRATION, landscape, 12 / 12 · FULL COVERAGE
 * 4. FOOD ZONE, portrait, 09 / 10 · GAP 1
 * 5. BACKSTAGE, landscape, 08 / 08 · COVERED
 */
export const eventZones = [
  {
    id: 'entry-gate',
    index: '01',
    name: 'ENTRY GATE',
    type: 'landscape',
    widthVw: 59, // Lead landscape ~58-60vw
    aspectRatio: '16/10',
    image: entryGateImg,
    staffed: 18,
    required: 20,
    gap: 2,
    status: '18 / 20 VOLUNTEERS · GAP 2',
    caption: 'Security turnstiles and primary crowd check-in lanes',
    route: '/assignments?zone=entry-gate',
    isLead: true,
  },
  {
    id: 'main-stage',
    index: '02',
    name: 'MAIN STAGE',
    type: 'portrait',
    widthVw: 38, // Portrait ~35-40vw
    aspectRatio: '3/4',
    image: mainStageImg,
    staffed: 14,
    required: 16,
    gap: 2,
    status: '14 / 16 · 2 POSITIONS OPEN',
    caption: 'Front of house audio, lighting towers, and pit coordination',
    route: '/assignments?zone=main-stage',
    isLead: false,
  },
  {
    id: 'registration',
    index: '03',
    name: 'REGISTRATION',
    type: 'landscape',
    widthVw: 52, // Landscape
    aspectRatio: '16/10',
    image: registrationImg,
    staffed: 12,
    required: 12,
    gap: 0,
    status: '12 / 12 · FULL COVERAGE',
    caption: 'Accreditation desks, attendee badge print, and VIP reception',
    route: '/assignments?zone=registration',
    isLead: false,
  },
  {
    id: 'food-zone',
    index: '04',
    name: 'FOOD ZONE',
    type: 'portrait',
    widthVw: 36, // Portrait
    aspectRatio: '3/4',
    image: foodZoneImg,
    staffed: 9,
    required: 10,
    gap: 1,
    status: '09 / 10 · GAP 1',
    caption: 'Vendor queues, water replenishment, and waste sanitation',
    route: '/assignments?zone=food-zone',
    isLead: false,
  },
  {
    id: 'backstage',
    index: '05',
    name: 'BACKSTAGE',
    type: 'landscape',
    widthVw: 50, // Landscape
    aspectRatio: '16/10',
    image: backstageImg,
    staffed: 8,
    required: 8,
    gap: 0,
    status: '08 / 08 · COVERED',
    caption: 'Production comms, road cases, artist lounge, and green room',
    route: '/assignments?zone=backstage',
    isLead: false,
  },
];

/**
 * TUNING CONFIG: Hero Media (§4.3, §5.1, §5.2, §5.3)
 * Exact reference-measured positions at scroll 0 (top-left corner + width):
 * 1: Red-lit crowd / stage truss: left 23.1vw, top 9.7vh, width 7.8vw, 3:4, main-stage
 * 2: Silhouette DJ purple/orange: left 59.7vw, top 8.4vh, width 9.2vw, 4:3, backstage
 * 3: DJ with raised hands magenta: left 6.4vw, top 37.4vh, width 8.2vw, 3:4, registration
 * 4: Tent / venue exterior: left 7.5vw, top 77.1vh, width 11.9vw, 4:5, entry-gate (cropped bottom)
 * 5: Teal crowd at stage: left 86.4vw, top 50.3vh, width 8.1vw, 3:4, food-zone (behind #6)
 * 6: Hot red/orange stage: left 80.8vw, top 69.8vh, width 10.3vw, 2:3, backstage (cropped bottom, in front of #5)
 * 7 (below fold): Small crowd: left 27.7vw, top 108vh (rises to 25.7vh at 74vh scroll), width 8.9vw, 1.43:1, entry-gate
 * 8 (bridge): Bridge DJ: left 52.4vw, top 105vh (rises to 30.3vh at 74vh scroll), starts 9vw growing to 18.9vw, 4:3, main-stage
 */
export const heroMedia = [
  {
    id: 'hero-1',
    zoneId: 'main-stage',
    subject: 'Red-lit crowd / stage truss',
    src: heroRightTop,
    left: '23.1vw',
    top: '9.7vh',
    width: '7.8vw',
    aspectRatio: '3/4',
    speed: 1.35, // Upper photo exits faster (1.1x–1.5x)
    radius: '6px',
    zIndex: 3,
    caption: 'MAIN STAGE · 14/16',
    isBridge: false,
    initialVisible: true,
  },
  {
    id: 'hero-2',
    zoneId: 'backstage',
    subject: 'Silhouette DJ, purple/orange',
    src: heroRightPort1,
    left: '59.7vw',
    top: '8.4vh',
    width: '9.2vw',
    aspectRatio: '4/3',
    speed: 1.4, // Upper photo exits faster
    radius: '6px',
    zIndex: 3,
    caption: 'BACKSTAGE · 08/08',
    isBridge: false,
    initialVisible: true,
  },
  {
    id: 'hero-3',
    zoneId: 'registration',
    subject: 'DJ with raised hands, magenta',
    src: heroLeftTop,
    left: '6.4vw',
    top: '37.4vh',
    width: '8.2vw',
    aspectRatio: '3/4',
    speed: 1.25, // Upper photo exits faster
    radius: '6px',
    zIndex: 3,
    caption: 'REGISTRATION · 12/12',
    isBridge: false,
    initialVisible: true,
  },
  {
    id: 'hero-4',
    zoneId: 'entry-gate',
    subject: 'Tent / venue exterior',
    src: heroLeftBot,
    left: '7.5vw',
    top: '77.1vh',
    width: '11.9vw',
    aspectRatio: '4/5',
    speed: 1.0, // 1:1 scroll
    radius: '6px',
    zIndex: 3,
    caption: 'ENTRY GATE · 18/20',
    isBridge: false,
    initialVisible: true,
  },
  {
    id: 'hero-5',
    zoneId: 'food-zone',
    subject: 'Teal crowd at stage',
    src: heroRightPort2,
    left: '86.4vw',
    top: '50.3vh',
    width: '8.1vw',
    aspectRatio: '3/4',
    speed: 1.05, // near 1:1
    radius: '6px',
    zIndex: 2, // Behind #6
    caption: 'FOOD ZONE · 09/10',
    isBridge: false,
    initialVisible: true,
  },
  {
    id: 'hero-6',
    zoneId: 'backstage',
    subject: 'Hot red/orange stage',
    src: backstageImg,
    left: '80.8vw',
    top: '69.8vh',
    width: '10.3vw',
    aspectRatio: '2/3',
    speed: 1.0, // 1:1 scroll
    radius: '6px',
    zIndex: 4, // In front of #5
    caption: 'BACKSTAGE · LIVE',
    isBridge: false,
    initialVisible: true,
  },
  {
    id: 'hero-7-small-crowd',
    zoneId: 'entry-gate',
    subject: 'Small crowd shot',
    src: heroCenterCrowd,
    left: '27.7vw',
    top: '106vh', // below fold, rises
    targetTopMid: '25.7vh',
    width: '8.9vw',
    aspectRatio: '1.43/1',
    speed: 1.1,
    radius: '6px',
    zIndex: 3,
    caption: 'ENTRY GATE · FLOW',
    isBridge: false,
    initialVisible: false,
  },
  {
    id: 'hero-8-bridge-dj',
    zoneId: 'main-stage',
    subject: 'Bridge DJ (grows and drifts)',
    src: heroBridgeStage,
    left: '52.4vw',
    top: '104vh', // below fold, rises
    targetTopMid: '30.3vh',
    width: '9vw', // starts ~9vw, expands to 18.9vw+
    expandedWidth: '18.9vw',
    aspectRatio: '4/3',
    speed: 1.0,
    radius: '6px',
    expandedRadius: '12px',
    zIndex: 5,
    caption: 'MAIN STAGE · 14/16',
    isBridge: true,
    initialVisible: false,
  },
];

export default { eventZones, heroMedia };
