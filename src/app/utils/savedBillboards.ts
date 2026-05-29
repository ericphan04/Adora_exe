import { BillboardDto } from "../../types/billboard";

const STORAGE_KEY = "adora_saved_billboards";

function readSavedBillboards(): BillboardDto[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as BillboardDto[];
  } catch {
    return [];
  }
}

function writeSavedBillboards(billboards: BillboardDto[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(billboards));
  } catch {
    // ignore localStorage errors
  }
}

export function getSavedBillboards(): BillboardDto[] {
  return readSavedBillboards();
}

export function isBillboardSaved(id: number): boolean {
  return readSavedBillboards().some((b) => b.id === id);
}

export function addSavedBillboard(billboard: BillboardDto) {
  const saved = readSavedBillboards();
  const exists = saved.some((item) => item.id === billboard.id);
  if (exists) return saved;
  const next = [...saved, billboard];
  writeSavedBillboards(next);
  return next;
}

export function removeSavedBillboard(id: number) {
  const saved = readSavedBillboards();
  const next = saved.filter((item) => item.id !== id);
  writeSavedBillboards(next);
  return next;
}

export function mergeSavedBillboards(serverSaved: BillboardDto[] = []) {
  const local = readSavedBillboards();
  const localIds = new Set(local.map((item) => item.id));
  return [...local, ...serverSaved.filter((item) => !localIds.has(item.id))];
}
