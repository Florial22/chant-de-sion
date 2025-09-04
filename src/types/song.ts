export type LangCode = 'fr' | 'en' | 'ht';
export type StanzaKind = 'verse' | 'chorus' | 'bridge';

export interface Stanza {
  id: string;           // e.g., "v1", "c1"
  kind: StanzaKind;     // verse/chorus/bridge
  lang: LangCode;       // language of this stanza
  n?: number;           // verse number, optional
  text: string;         // raw text with line breaks
}

export interface Song {
  id: string;
  titles: Partial<Record<LangCode, string>> & { aliases?: string[] };
  tags?: string[];
  hasLanguages: LangCode[];
  stanzas: Stanza[];
}
