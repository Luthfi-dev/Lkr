import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';

interface SEOHeadProps {
  customTitle?: string;
  customDescription?: string;
  pageUrl?: string;
}

const TAB_SEO_META: Record<string, { title: string; desc: string; urlPath: string }> = {
  home: {
    title: 'Lingkar - Ekosistem Digital Tim & Kebaikan Bersama',
    desc: 'Pantau agenda tim harian, checklist prioritas, grup aktif, dan perkembangan poin kebaikan dalam satu dashboard terpadu.',
    urlPath: '',
  },
  groups: {
    title: 'Ruang Grup & Circle Kolaborasi | Lingkar',
    desc: 'Ruang kolaborasi tim & grup: koordinasi anggota, target checklist bersama, agenda rapat tim, kas transparan, dan evaluasi performa.',
    urlPath: 'groups',
  },
  tasks: {
    title: 'Manajemen Target & Shared Checklist Tim | Lingkar',
    desc: 'Kelola target tim dengan verifikasi multi-tahap, pelacakan progres terstruktur, delegasi tugas, dan filter tenggat waktu.',
    urlPath: 'tasks',
  },
  finance: {
    title: 'Transparansi Kas & Anggaran Tim | Lingkar',
    desc: 'Pencatatan arus kas masuk/keluar tim secara transparan, target tabungan divisi, dan monitoring iuran anggota akurat.',
    urlPath: 'finance',
  },
  sharing: {
    title: 'Circle Sharing & Berbagi Inspirasi Tim | Lingkar',
    desc: 'Ruang berbagi insight, update proyek, dokumentasi materi, dan interaksi diskusi positif antar anggota tim.',
    urlPath: 'sharing',
  },
  leaderboard: {
    title: 'Peringkat & Gamifikasi Poin Kebaikan | Lingkar',
    desc: 'Pantau perolehan poin kebaikan, lencana pencapaian tim, dan peringkat anggota teraktif dengan sistem gamifikasi transparan.',
    urlPath: 'leaderboard',
  },
};

export const SEOHead: React.FC<SEOHeadProps> = ({ customTitle, customDescription, pageUrl }) => {
  const { activeTab, selectedGroupForRoom, circles } = useApp();

  useEffect(() => {
    let title = '';
    let description = '';
    let canonical = 'https://lingkar.app/';

    if (customTitle) {
      title = customTitle;
      description = customDescription || '';
      canonical = pageUrl || 'https://lingkar.app/';
    } else if (selectedGroupForRoom) {
      const circle = circles.find((c) => c.id === selectedGroupForRoom);
      const groupName = circle ? circle.name : 'Grup';
      title = `${groupName} - Ruang Kerja Kolaborasi | Lingkar`;
      description = circle?.description || `Ruang kerja dan koordinasi tim ${groupName} di Lingkar.`;
      canonical = `https://lingkar.app/#group/${selectedGroupForRoom}`;
    } else {
      const meta = TAB_SEO_META[activeTab] || TAB_SEO_META.home;
      title = meta.title;
      description = meta.desc;
      canonical = meta.urlPath ? `https://lingkar.app/#${meta.urlPath}` : 'https://lingkar.app/';
    }

    // 1. Update Document Title
    document.title = title;

    // 2. Update Primary Meta Tags
    const updateMetaTag = (name: string, content: string) => {
      let element = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute('name', name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    const updateOgTag = (property: string, content: string) => {
      let element = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute('property', property);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    updateMetaTag('title', title);
    updateMetaTag('description', description);
    updateOgTag('og:title', title);
    updateOgTag('og:description', description);
    updateOgTag('og:url', canonical);
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:url', canonical);

    // 3. Update Canonical Link
    let canonicalTag = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalTag) {
      canonicalTag = document.createElement('link');
      canonicalTag.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalTag);
    }
    canonicalTag.setAttribute('href', canonical);
  }, [activeTab, selectedGroupForRoom, circles, customTitle, customDescription, pageUrl]);

  return null;
};
