import { useEffect, useState } from 'react';
import { ReceiptHeader } from './sections/ReceiptHeader';
import { HorizontalScrollSection } from './components/HorizontalScrollSection';
import { PortfolioCard } from './components/PortfolioCard';
import { PortfolioSection } from './components/PortfolioSection';
import './App.css';

import { API_BASE, SESSION_CACHE_BUSTER } from './config';

// ── Section config ──────────────────────────────────────────────────────────
const SECTIONS = [
  {
    id: 'about',
    backgroundSrc: `${API_BASE}/backgrounds/about.png${SESSION_CACHE_BUSTER}`,
    accentColor: '#f4a7c3',
    accentColorDeep: '#e07fa8',
  },
  {
    id: 'videos',
    backgroundSrc: `${API_BASE}/backgrounds/videos.png${SESSION_CACHE_BUSTER}`,
    accentColor: '#9bc4e8',
    accentColorDeep: '#6aa5d4',
  },
  {
    id: 'art',
    backgroundSrc: `${API_BASE}/backgrounds/art.png${SESSION_CACHE_BUSTER}`,
    accentColor: '#f9e4b7',
    accentColorDeep: '#e8c97a',
  },
  {
    id: 'experiments',
    backgroundSrc: `${API_BASE}/backgrounds/experiments.png${SESSION_CACHE_BUSTER}`,
    accentColor: '#c4b5e8',
    accentColorDeep: '#9c88d4',
  },
  {
    id: 'ideas',
    backgroundSrc: `${API_BASE}/backgrounds/ideas.png${SESSION_CACHE_BUSTER}`,
    accentColor: '#b5e8c4',
    accentColorDeep: '#7acc96',
  },
];

// ── Types ────────────────────────────────────────────────────────────────────
interface ContentItem {
  id: string;
  title: string;
  description: string;
  mediaPath?: string;
  mediaType?: 'image' | 'video';
}

interface AboutContent {
  title: string;
  content: string;
  accentColor?: string;
}

interface SectionContent {
  about?: AboutContent;
  videos?: { items: ContentItem[], accentColor?: string };
  art?: { items: ContentItem[], accentColor?: string };
  experiments?: { items: ContentItem[], accentColor?: string };
  ideas?: { items: ContentItem[], accentColor?: string };
}

// ── Loading screen ───────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6"
      style={{ background: '#fef6fb' }}
    >
      <p className="font-display text-base" style={{ color: 'var(--pink-deep)' }}>
        JOSIE TAIT
      </p>
      <div
        className="w-48 h-4 rounded-full overflow-hidden border-2"
        style={{ borderColor: 'var(--pink-deep)', background: '#f9e4b7' }}
      >
        <div
          className="loading-bar h-full animate-pulse"
          style={{ background: 'var(--pink)', width: '70%' }}
        />
      </div>
    </div>
  );
}

// ── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [content, setContent] = useState<SectionContent>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for CMS admin route
    if (window.location.pathname.startsWith('/admin')) {
      window.location.href = '/admin/index.html';
      return;
    }

    const sections = ['about', 'videos', 'art', 'experiments', 'ideas'];
    Promise.all(
      sections.map((s) =>
        fetch(`${API_BASE}/api/content/${s}`)
          .then((r) => {
            if (!r.ok) throw new Error(`${r.status}`);
            return r.json();
          })
          .then((data) => [s, data] as [string, unknown])
          .catch(() => [s, null] as [string, null])
      )
    ).then((results) => {
      const merged: SectionContent = {};
      results.forEach(([key, val]) => {
        if (val) (merged as Record<string, unknown>)[key] = val;
      });
      setContent(merged);
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingScreen />;

  const about = content.about;

  const sectionCfg = Object.fromEntries(SECTIONS.map((s) => [s.id, s]));

  // Helper to calculate a deep variant of a hex color for borders/shadows
  const getDeepColor = (hex?: string, fallback = '#000000') => {
    if (!hex || !hex.startsWith('#') || hex.length !== 7) return fallback;
    const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - 40);
    const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - 40);
    const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - 40);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  const headerSections = [
    {
      id: 'about', label: 'ABOUT',
      color: about?.accentColor || sectionCfg['about'].accentColor,
      colorDeep: about?.accentColor ? getDeepColor(about.accentColor) : sectionCfg['about'].accentColorDeep
    },
    {
      id: 'videos', label: 'VIDEOS',
      color: content.videos?.accentColor || sectionCfg['videos'].accentColor,
      colorDeep: content.videos?.accentColor ? getDeepColor(content.videos.accentColor) : sectionCfg['videos'].accentColorDeep
    },
    {
      id: 'art', label: 'ART',
      color: content.art?.accentColor || sectionCfg['art'].accentColor,
      colorDeep: content.art?.accentColor ? getDeepColor(content.art.accentColor) : sectionCfg['art'].accentColorDeep
    },
    {
      id: 'experiments', label: 'EXPERIMENTS',
      color: content.experiments?.accentColor || sectionCfg['experiments'].accentColor,
      colorDeep: content.experiments?.accentColor ? getDeepColor(content.experiments.accentColor) : sectionCfg['experiments'].accentColorDeep
    },
    {
      id: 'ideas', label: 'IDEAS',
      color: content.ideas?.accentColor || sectionCfg['ideas'].accentColor,
      colorDeep: content.ideas?.accentColor ? getDeepColor(content.ideas.accentColor) : sectionCfg['ideas'].accentColorDeep
    },
  ];

  return (
    <>
      <ReceiptHeader sections={headerSections} />

      {/* ABOUT */}
      <HorizontalScrollSection
        {...sectionCfg['about']}
        accentColor={about?.accentColor || sectionCfg['about'].accentColor}
        accentColorDeep={about?.accentColor ? getDeepColor(about.accentColor) : sectionCfg['about'].accentColorDeep}
      >
        <PortfolioCard
          id="ABT"
          title={about?.title ?? 'About'}
          accentColor={about?.accentColor || sectionCfg['about'].accentColor}
          accentColorDeep={about?.accentColor ? getDeepColor(about.accentColor) : sectionCfg['about'].accentColorDeep}
        >
          <div className="whitespace-pre-wrap">{about?.content}</div>
        </PortfolioCard>
      </HorizontalScrollSection>

      {/* Dynamic Portfolio Sections */}
      {SECTIONS.filter(s => s.id !== 'about').map(section => {
        const sectionData = (content as Record<string, any>)[section.id];
        return (
          <PortfolioSection
            key={section.id}
            config={Object.assign({}, section, {
              accentColor: sectionData?.accentColor || section.accentColor,
              accentColorDeep: sectionData?.accentColor ? getDeepColor(sectionData.accentColor) : section.accentColorDeep,
            })}
            data={sectionData}
          />
        );
      })}
    </>
  );
}
