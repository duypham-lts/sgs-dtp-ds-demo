'use client';
// Files are not part of the prototype: download buttons say what would be downloaded.
import { useSnackbar } from './snackbar';

export function useFakeDownload() {
  const snack = useSnackbar();
  return (name: string) => snack(`${name} would download here. The prototype has no real files.`);
}
