/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { HARDWARE_COMPONENTS } from './data/hardwareData';
import { HardwareComponent } from './types/hardware';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { HardwareOverview } from './components/hardware/HardwareOverview';
import { HardwareDetail } from './components/hardware/HardwareDetail';

export default function App() {
  const [selectedComponent, setSelectedComponent] = useState<HardwareComponent | null>(null);

  // Synchronize with URL hash on mount and hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (!hash) {
        setSelectedComponent(null);
        return;
      }

      if (hash.startsWith('hardware/')) {
        const compId = hash.replace('hardware/', '');
        const found = HARDWARE_COMPONENTS.find(c => c.id === compId);
        if (found) {
          setSelectedComponent(found);
        }
      } else {
        setSelectedComponent(null);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Keyboard shortcut: Escape to close detail view
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedComponent) {
        handleBackToOverview();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedComponent]);

  const handleSelectComponent = (comp: HardwareComponent) => {
    setSelectedComponent(comp);
    window.location.hash = `hardware/${comp.id}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToOverview = () => {
    setSelectedComponent(null);
    window.location.hash = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0A0B0E] text-[#E2E8F0] flex flex-col justify-between selection:bg-[#FF5A36] selection:text-white font-sans antialiased">
      {/* Primary Clean Header */}
      <Navbar
        selectedComponent={selectedComponent}
        onBackToOverview={handleBackToOverview}
      />

      {/* Main Single Page: 25 in one page, or Big 3D Detail Page when INFO clicked */}
      <main className="flex-1 w-full">
        {selectedComponent ? (
          <HardwareDetail
            component={selectedComponent}
            onBack={handleBackToOverview}
            onSelectComponent={handleSelectComponent}
            allComponents={HARDWARE_COMPONENTS}
          />
        ) : (
          <HardwareOverview
            onSelectComponent={handleSelectComponent}
          />
        )}
      </main>

      {/* Technical Footer */}
      <Footer onGoToOverview={handleBackToOverview} />
    </div>
  );
}
