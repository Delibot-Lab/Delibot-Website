import { ko, en } from "@blocknote/core/locales";
import type { Dictionary } from "@blocknote/core";

/**
 * BlockNote 슬래시 메뉴는 사전(dictionary) 하나만 쓸 수 있어서, 한국어 사전을 기본으로 쓰되
 * 영어 별칭(aliases)도 합쳐서 "/image", "/table"처럼 영어로 입력해도 매칭되게 한다.
 * 라벨/설명은 한국어 그대로 유지된다.
 */
function mergeSlashMenuAliases(): Dictionary["slash_menu"] {
  const merged = {} as Dictionary["slash_menu"];
  for (const key of Object.keys(ko.slash_menu) as Array<keyof Dictionary["slash_menu"]>) {
    const koEntry = ko.slash_menu[key];
    const enEntry = en.slash_menu[key];
    const aliases = Array.from(
      new Set([...(koEntry.aliases ?? []), ...(enEntry?.aliases ?? [])])
    );
    merged[key] = { ...koEntry, aliases } as (typeof ko.slash_menu)[typeof key];
  }
  return merged;
}

export const koEn: Dictionary = {
  ...ko,
  slash_menu: mergeSlashMenuAliases(),
};
