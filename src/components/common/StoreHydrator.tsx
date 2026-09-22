'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/lib/store';

export function StoreHydrator() {
  const rehydrate = useAppStore((state) => state.rehydrate);

  useEffect(() => {
    rehydrate();
  }, [rehydrate]);

  return null;
}
