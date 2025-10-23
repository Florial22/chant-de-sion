export type Melody = {
  id: string;
  title: string;
  category: string;
  url: string;
  durationSec?: number;
  cover?: string;
};
export type MelodyCatalog = {
  version: number;
  updatedAt?: string;
  melodies: Melody[];
  categories?: string[];
};
