import type { CurriculumSourceDefinition } from "./types";

export type BookPageImage = NonNullable<CurriculumSourceDefinition["lessonExcerpt"]>["pages"][number];
// Match the reader's padding, sidebar and 900px maximum. Zoom can request the original.
export const bookImageSizes = "(min-width: 1280px) min(900px, calc(100vw - 536px)), (min-width: 768px) calc(100vw - 496px), (min-width: 640px) calc(100vw - 148px), calc(100vw - 84px)";
export function bookImageAttributes(page: BookPageImage, zoom = 100) {
  return {
    src: page.imageUrl,
    srcSet: zoom === 100 ? page.imageSources?.map(source => `${source.url} ${source.width}w`).join(", ") : undefined,
    sizes: page.imageSources?.length && zoom === 100 ? bookImageSizes : undefined,
    width: page.width ?? 1417,
    height: page.height ?? 1826,
  };
}
