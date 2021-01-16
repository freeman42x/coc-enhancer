type GM_callback = (this: Window) => void;

declare const GM_info: {
  uuid: string;
  script: {
    name: string;
    namespace: string;
    description: string;
    version: string;
    excludes: string[];
    includes: string[];
    matches: string[];
    resources: string[];
    runAt: "" | "document-end" | "document-start" | "document-idle";
    unwrap: boolean;
  };
  scriptHandler: "Violentmonkey";
  version: string;
  scriptMetaStr: string;
  scriptWillUpdate: boolean;
  injectInto: "page" | "content" | "auto";
};

declare function GM_getValue<T>(key: string, defaultValue: T): T | undefined;
declare function GM_setValue(key: string, value: unknown): void;
declare function GM_deleteValue(key: string): void;
declare function GM_listValues(): string[];

declare function GM_getResourceText(name: string): string | undefined;
declare function GM_getResourceURL(name: string): string;

declare function GM_addStyle(
  css: string
): { then(style: HTMLStyleElement): void };

interface GM_tab {
  close: () => void;
  closed: boolean;
  onclose: null | GM_callback;
}
declare function GM_openInTab(
  url: string,
  options?: { active?: boolean }
): GM_tab;
declare function GM_openInTab(url: string, openInBackground?: boolean): GM_tab;

declare function GM_registerMenuCommand(
  caption: string,
  func: GM_callback
): void;
declare function GM_unregisterMenuCommand(caption: string): void;

declare function GM_notification(options: {
  text: string;
  title?: string;
  image?: string;
  onclick?: GM_callback;
  ondone?: GM_callback;
}): void;
declare function GM_notification(
  text: string,
  title?: string,
  image?: string,
  onclick?: GM_callback
): void;

declare type GM_clipboardDataType =
  | "text/plain"
  | "text/uri-list"
  | "text/csv"
  | "text/css"
  | "text/html"
  | "application/xhtml+xml"
  | "image/png"
  | "image/jpg, image/jpeg"
  | "image/gif"
  | "image/svg+xml"
  | "application/xml, text/xml"
  | "application/javascript"
  | "application/json"
  | "application/octet-stream";
declare function GM_setClipboard(
  data: unknown,
  type?: GM_clipboardDataType
): void;

declare type GM_httpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "OPTION"
  | "HEAD";
declare interface GM_httpResponseType {
  text: string;
  json: object;
  blob: Blob;
  arraybuffer: ArrayBuffer;
}
declare interface GM_progressEvent<
  K extends keyof GM_httpResponseType,
  C = unknown
> {
  context?: C;
  finalUrl: string;
  readyState: 0 | 1 | 2 | 3 | 4;
  response: GM_httpResponseType[K] | null;
  responseHeaders: string;
  status: number;
  statusText: string;
}
declare interface GM_httpRequestOptions<
  K extends keyof GM_httpResponseType,
  C = unknown
> {
  headers?: { [key: string]: string };
  timeout?: number;
  onerror?: (this: Window, event: GM_progressEvent<K, C>) => void;
  onprogress?: (
    this: Window,
    event: {
      lengthComputable: boolean;
      loaded: number;
      total: number;
    } & GM_progressEvent<K>
  ) => void;
  ontimeout?: (this: Window, event: GM_progressEvent<K, C>) => void;
}
declare interface GM_httpResponse {
  abort: () => void;
}
declare function GM_xmlhttpRequest<
  K extends keyof GM_httpResponseType,
  C = unknown
>(
  details: {
    url: string;
    method?: GM_httpMethod;
    user?: string;
    password?: string;
    overrideMimetype?: string;
    responseType?: K;
    data?: string | FormData | Blob;
    context?: C;
    anonymous?: boolean;
    synchronous?: boolean;
    onabort?: (this: Window, event: GM_progressEvent<K, C>) => void;
    onload?: (this: Window, event: GM_progressEvent<K, C>) => void;
    onloadend?: (this: Window, event: GM_progressEvent<K, C>) => void;
    onreadystatechange?: (this: Window, event: GM_progressEvent<K, C>) => void;
  } & GM_httpRequestOptions<K, C>
): GM_httpResponse;
declare function GM_download(
  options: {
    url: string;
    name?: string;
    onload?: GM_callback;
  } & GM_httpRequestOptions<"arraybuffer">
): GM_httpResponse;
declare function GM_download(url: string, name?: string): GM_httpResponse;
