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

// Zone Card Images (Photographic)
import entryGateImg from '../assets/event/entry-gate.jpg';
import mainStageImg from '../assets/event/main-stage.jpg';
import registrationImg from '../assets/event/registration.jpg';
import foodZoneImg from '../assets/event/food-zone.jpg';
import backstageImg from '../assets/event/backstage.jpg';

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
    widthVw: 62, // Prominent lead landscape
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
    widthVw: 42, // Prominent portrait
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
    widthVw: 54, // Landscape
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
    widthVw: 40, // Portrait
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
    widthVw: 52, // Landscape
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
 * TUNING CONFIG: Hero Media
 * Significantly enlarged dimensions (larger, wider, longer) with warm cream background.
 * Adjusted coordinates so they float prominently on the black canvas without overlapping the center globe/headline.
 */
export const heroMedia = [
  {
    id: 'hero-1',
    zoneId: 'main-stage',
    subject: 'Red-lit crowd / stage truss',
    src: heroRightTop,
    left: '18vw',
    top: '7vh',
    width: '15.5vw', // Enlarged from 7.8vw
    minWidth: '220px',
    aspectRatio: '3/4',
    speed: 1.35,
    radius: '10px',
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
    left: '64vw',
    top: '6vh',
    width: '17.5vw', // Enlarged from 9.2vw
    minWidth: '240px',
    aspectRatio: '4/3',
    speed: 1.4,
    radius: '10px',
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
    left: '3vw',
    top: '32vh',
    width: '16.5vw', // Enlarged from 8.2vw
    minWidth: '220px',
    aspectRatio: '3/4',
    speed: 1.25,
    radius: '10px',
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
    left: '4vw',
    top: '72vh',
    width: '21vw', // Enlarged from 11.9vw
    minWidth: '280px',
    aspectRatio: '4/5',
    speed: 1.0,
    radius: '10px',
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
    left: '81vw',
    top: '44vh',
    width: '16.5vw', // Enlarged from 8.1vw
    minWidth: '220px',
    aspectRatio: '3/4',
    speed: 1.05,
    radius: '10px',
    zIndex: 2,
    caption: 'FOOD ZONE · 09/10',
    isBridge: false,
    initialVisible: true,
  },
  {
    id: 'hero-6',
    zoneId: 'backstage',
    subject: 'Hot red/orange stage',
    src: backstageImg,
    left: '76vw',
    top: '67vh',
    width: '19.5vw', // Enlarged from 10.3vw
    minWidth: '260px',
    aspectRatio: '2/3',
    speed: 1.0,
    radius: '10px',
    zIndex: 4,
    caption: 'BACKSTAGE · LIVE',
    isBridge: false,
    initialVisible: true,
  },
  {
    id: 'hero-7-small-crowd',
    zoneId: 'entry-gate',
    subject: 'Small crowd shot',
    src: heroCenterCrowd,
    left: '24vw',
    top: '110vh',
    targetTopMid: '24vh',
    width: '17vw', // Enlarged from 8.9vw
    minWidth: '230px',
    aspectRatio: '1.43/1',
    speed: 1.1,
    radius: '10px',
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
    left: '52vw',
    top: '108vh',
    targetTopMid: '28vh',
    width: '16vw', // Starts at 16vw, expands to 28vw+
    expandedWidth: '28vw',
    aspectRatio: '4/3',
    speed: 1.0,
    radius: '10px',
    expandedRadius: '16px',
    zIndex: 5,
    caption: 'MAIN STAGE · 14/16',
    isBridge: true,
    initialVisible: false,
  },
];

export default { eventZones, heroMedia };
