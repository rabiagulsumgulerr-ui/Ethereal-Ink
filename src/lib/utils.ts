import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const STORAGE_KEYS = {
  STORY: 'ethereal_ink_story',
  CHARACTERS: 'ethereal_ink_characters',
  WORLD: 'ethereal_ink_world',
  TIMELINE: 'ethereal_ink_timeline',
  SETTINGS: 'ethereal_ink_settings',
};
