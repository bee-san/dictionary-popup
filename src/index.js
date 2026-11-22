// dictionary-popup: LFG's dictionary popup for any web page (see core.js).
// This entry carries the popup's page inside it, so it works with no files to
// serve; "dictionary-popup/core" is the same without that copy.
// SPDX-License-Identifier: GPL-3.0-or-later
import { createDictionaryPopup as create } from "./core.js";
import { POPUP_HTML } from "./inline.js";

export { normalizeResult } from "./core.js";

/** Puts a dictionary popup in `container` and returns its handle (core.js has the options). */
export function createDictionaryPopup(container, options = {}) {
  return create(container, options.src || options.html ? options : { ...options, html: POPUP_HTML });
}
