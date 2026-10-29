import React from 'react';

// Real, official brand marks for the 3rd-party integrations shown across
// the app (Settings > Integrations, the Marketplace, job board syndication,
// calendar sync, LMS integrations). Path data sourced from each provider's
// published brand mark (via the simple-icons project for Xero/QuickBooks/
// Indeed/Glassdoor/Greenhouse/Google, and Font Awesome Free Brands for
// Slack/LinkedIn — both maintain these specifically for third-party
// identification use). Colors are each brand's official/primary color.
//
// A handful of integrations shown in the app (Deel, Checkr, SCORM Cloud,
// and the Nigerian/African HMO providers) have no logo here because no
// general-purpose icon library carries their mark and this environment
// can't fetch arbitrary external image assets — see BRAND_ICON_GAPS below.
// Those fall back to <GenericBrandMark>, a plain neutral placeholder, never
// a fabricated logo.

interface IconProps {
  className?: string;
  size?: number | string;
}

export const SlackIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg viewBox="0 0 448 512" width={size} height={size} className={className} xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Slack">
    <path
      fill="#4A154B"
      d="M94.12 315.1c0 25.9-21.16 47.06-47.06 47.06S0 341 0 315.1c0-25.9 21.16-47.06 47.06-47.06h47.06v47.06zm23.72 0c0-25.9 21.16-47.06 47.06-47.06s47.06 21.16 47.06 47.06v117.84c0 25.9-21.16 47.06-47.06 47.06s-47.06-21.16-47.06-47.06V315.1zm47.06-188.98c-25.9 0-47.06-21.16-47.06-47.06S139 32 164.9 32s47.06 21.16 47.06 47.06v47.06H164.9zm0 23.72c25.9 0 47.06 21.16 47.06 47.06s-21.16 47.06-47.06 47.06H47.06C21.16 243.96 0 222.8 0 196.9s21.16-47.06 47.06-47.06H164.9zm188.98 47.06c0-25.9 21.16-47.06 47.06-47.06 25.9 0 47.06 21.16 47.06 47.06s-21.16 47.06-47.06 47.06h-47.06V196.9zm-23.72 0c0 25.9-21.16 47.06-47.06 47.06-25.9 0-47.06-21.16-47.06-47.06V79.06c0-25.9 21.16-47.06 47.06-47.06 25.9 0 47.06 21.16 47.06 47.06V196.9zM283.1 385.88c25.9 0 47.06 21.16 47.06 47.06 0 25.9-21.16 47.06-47.06 47.06-25.9 0-47.06-21.16-47.06-47.06v-47.06h47.06zm0-23.72c-25.9 0-47.06-21.16-47.06-47.06 0-25.9 21.16-47.06 47.06-47.06h117.84c25.9 0 47.06 21.16 47.06 47.06 0 25.9-21.16 47.06-47.06 47.06H283.1z"
    />
  </svg>
);

export const LinkedInIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg viewBox="0 0 448 512" width={size} height={size} className={className} xmlns="http://www.w3.org/2000/svg" role="img" aria-label="LinkedIn">
    <path
      fill="#0A66C2"
      d="M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3c0-17.8-14.4-32.3-32-32.3zM135.4 416H69V202.2h66.5V416zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5zm282.1 243h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9V416z"
    />
  </svg>
);

export const GoogleIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Google">
    <path
      fill="#4285F4"
      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
    />
  </svg>
);

export const GoogleCalendarIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Google Calendar">
    <path
      fill="#4285F4"
      d="M18.316 5.684H24v12.632h-5.684V5.684zM5.684 24h12.632v-5.684H5.684V24zM18.316 5.684V0H1.895A1.894 1.894 0 0 0 0 1.895v16.421h5.684V5.684h12.632zm-7.207 6.25v-.065c.272-.144.5-.349.687-.617s.279-.595.279-.982c0-.379-.099-.72-.3-1.025a2.05 2.05 0 0 0-.832-.714 2.703 2.703 0 0 0-1.197-.257c-.6 0-1.094.156-1.481.467-.386.311-.65.671-.793 1.078l1.085.452c.086-.249.224-.461.413-.633.189-.172.445-.257.767-.257.33 0 .602.088.816.264a.86.86 0 0 1 .322.703c0 .33-.12.589-.36.778-.24.19-.535.284-.886.284h-.567v1.085h.633c.407 0 .748.109 1.02.327.272.218.407.499.407.843 0 .336-.129.614-.387.832s-.565.327-.924.327c-.351 0-.651-.103-.897-.311-.248-.208-.422-.502-.521-.881l-1.096.452c.178.616.505 1.082.977 1.401.472.319.984.478 1.538.477a2.84 2.84 0 0 0 1.293-.291c.382-.193.684-.458.902-.794.218-.336.327-.72.327-1.149 0-.429-.115-.797-.344-1.105a2.067 2.067 0 0 0-.881-.689zm2.093-1.931l.602.913L15 10.045v5.744h1.187V8.446h-.827l-2.158 1.557zM22.105 0h-3.289v5.184H24V1.895A1.894 1.894 0 0 0 22.105 0zm-3.289 23.5l4.684-4.684h-4.684V23.5zM0 22.105C0 23.152.848 24 1.895 24h3.289v-5.184H0v3.289z"
    />
  </svg>
);

// Microsoft's mark is the four solid squares — reproduced exactly rather
// than via a monochrome silhouette, since it's simple enough to draw
// pixel-accurately. Used for Microsoft 365/Teams contexts alike, since no
// icon set ships a separate Teams-specific mark.
export const MicrosoftIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Microsoft">
    <rect x="1" y="1" width="10.4" height="10.4" fill="#F25022" />
    <rect x="12.6" y="1" width="10.4" height="10.4" fill="#7FBA00" />
    <rect x="1" y="12.6" width="10.4" height="10.4" fill="#00A4EF" />
    <rect x="12.6" y="12.6" width="10.4" height="10.4" fill="#FFB900" />
  </svg>
);

export const XeroIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Xero">
    <path
      fill="#13B5EA"
      d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm6.585 14.655c-1.485 0-2.69-1.206-2.69-2.689 0-1.485 1.207-2.691 2.69-2.691 1.485 0 2.69 1.207 2.69 2.691s-1.207 2.689-2.69 2.689zM7.53 14.644c-.099 0-.192-.041-.267-.116l-2.043-2.04-2.052 2.047c-.069.068-.16.108-.258.108-.202 0-.368-.166-.368-.368 0-.099.04-.191.111-.263l2.04-2.05-2.038-2.047c-.075-.069-.113-.162-.113-.261 0-.203.166-.366.368-.366.098 0 .188.037.258.105l2.055 2.048 2.048-2.045c.069-.071.162-.108.26-.108.211 0 .375.165.375.366 0 .098-.029.188-.104.258l-2.056 2.055 2.055 2.051c.068.069.104.16.104.258 0 .202-.165.368-.365.368h-.01zm8.017-4.591c-.796.101-.882.476-.882 1.404v2.787c0 .202-.165.366-.366.366-.203 0-.367-.165-.368-.366v-4.53c0-.204.16-.366.362-.366.166 0 .316.125.346.289.27-.209.6-.317.93-.317h.105c.195 0 .359.165.359.368 0 .201-.164.352-.375.359 0 0-.09 0-.164.008l.053-.002zm-3.091 2.205H8.625c0 .019.003.037.006.057.02.105.045.211.083.31.194.531.765 1.275 1.829 1.29.33-.003.631-.086.9-.229.21-.12.391-.271.525-.428.045-.058.09-.112.12-.168.18-.229.405-.186.54-.083.164.135.18.391.045.57l-.016.016c-.21.27-.435.495-.689.66-.255.164-.525.284-.811.345-.33.09-.645.104-.975.06-1.095-.135-2.01-.93-2.28-2.01-.06-.21-.09-.42-.09-.645 0-.855.421-1.695 1.125-2.205.885-.615 2.085-.66 3-.075.63.405 1.035 1.021 1.185 1.771.075.419-.21.794-.734.81l.068-.046zm6.129-2.223c-1.064 0-1.931.865-1.931 1.931 0 1.064.866 1.931 1.931 1.931s1.931-.867 1.931-1.931c0-1.065-.866-1.933-1.931-1.933v.002zm0 2.595c-.367 0-.666-.297-.666-.666 0-.367.3-.665.666-.665.367 0 .667.299.667.665 0 .369-.3.667-.667.666zm-8.04-2.603c-.91 0-1.672.623-1.886 1.466v.03h3.776c-.203-.855-.973-1.494-1.891-1.494v-.002z"
    />
  </svg>
);

export const QuickBooksIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} xmlns="http://www.w3.org/2000/svg" role="img" aria-label="QuickBooks">
    <path
      fill="#2CA01C"
      d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm.642 4.1335c.9554 0 1.7296.776 1.7296 1.7332v9.0667h1.6c1.614 0 2.9275-1.3156 2.9275-2.933 0-1.6173-1.3136-2.9333-2.9276-2.9333h-.6654V7.3334h.6654c2.5722 0 4.6577 2.0897 4.6577 4.667 0 2.5774-2.0855 4.6666-4.6577 4.6666H12.642zM7.9837 7.333h3.3291v12.533c-.9555 0-1.73-.7759-1.73-1.7332V9.0662H7.9837c-1.6146 0-2.9277 1.316-2.9277 2.9334 0 1.6175 1.3131 2.9333 2.9277 2.9333h.6654v1.7332h-.6654c-2.5725 0-4.6577-2.0892-4.6577-4.6665 0-2.5771 2.0852-4.6666 4.6577-4.6666Z"
    />
  </svg>
);

export const IndeedIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Indeed">
    <path
      fill="#003A9B"
      d="M11.566 21.5633v-8.762c.2553.0231.5009.0346.758.0346 1.2225 0 2.3739-.3206 3.3506-.8928v9.6182c0 .8219-.1957 1.4287-.5757 1.8338-.378.4033-.8808.6049-1.491.6049-.6007 0-1.0766-.2016-1.468-.6183-.3781-.4032-.5739-1.01-.5739-1.8184zM11.589.5659c2.5447-.8929 5.4424-.8449 7.6186.987.405.3687.8673.8334 1.0515 1.3806.2207.6913-.7695-.073-.9057-.167-.71-.4532-1.4182-.8334-2.2127-1.0946C12.8614.3873 8.8122 2.709 6.2945 6.315c-1.0516 1.5939-1.7367 3.2721-2.299 5.1174-.0614.2017-.1094.4647-.2207.6413-.1113.2036-.048-.5453-.048-.5702.0845-.7623.2438-1.4997.4414-2.237C5.3292 5.3375 7.897 2.0655 11.5891.5658zm4.9281 7.0587c0 1.6686-1.353 3.0224-3.0205 3.0224-1.6677 0-3.0186-1.3538-3.0186-3.0224 0-1.6687 1.351-3.0224 3.0186-3.0224 1.6676 0 3.0205 1.3518 3.0205 3.0224Z"
    />
  </svg>
);

export const GlassdoorIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Glassdoor">
    <path
      fill="#00A162"
      d="M14.1093.0006c-.0749-.0074-.1348.0522-.1348.127v3.451c0 .0673.0537.1194.121.127 2.619.172 4.6092.9501 4.6092 3.6814H13.086a.1343.1343 0 0 0-.1348.1347v8.9644c0 .0748.06.1347.1348.1347h10.0034c.0748 0 .1347-.0599.1347-.1347V7.342c0-2.2374-.7996-4.0558-2.4159-5.3279C19.3191.8469 17.0874.1428 14.1093.0006ZM.9107 7.387a.1342.1342 0 0 0-.1347.1347v8.9566c0 .0748.06.1347.1347.1347h5.6189c0 2.7313-1.9902 3.5094-4.6091 3.6815-.0674.0075-.1192.0596-.1192.127v3.451c0 .0747.06.1343.1348.1269 2.9781-.1422 5.2078-.8463 6.6969-2.0136 1.6163-1.272 2.4159-3.0905 2.4159-5.3278V7.5217a.1343.1343 0 0 0-.1348-.1347z"
    />
  </svg>
);

export const GreenhouseIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Greenhouse">
    <path
      fill="#24A47F"
      d="M16.279 7.13c0 1.16-.49 2.185-1.293 2.987-.891.891-2.184 1.114-2.184 1.872 0 1.025 1.65.713 3.231 2.295 1.048 1.047 1.694 2.43 1.694 4.034C17.727 21.482 15.187 24 12 24c-3.187 0-5.727-2.518-5.727-5.68 0-1.607.646-2.989 1.694-4.036 1.582-1.582 3.23-1.27 3.23-2.295 0-.758-1.292-.98-2.183-1.872-.802-.802-1.293-1.827-1.293-3.03 0-2.318 1.895-4.19 4.212-4.19.446 0 .847.067 1.181.067.602 0 .914-.268.914-.691 0-.245-.112-.557-.112-.891 0-.758.647-1.382 1.427-1.382s1.404.646 1.404 1.426c0 .825-.647 1.204-1.137 1.382-.401.134-.713.312-.713.713 0 .758 1.382 1.493 1.382 3.61zm-.446 11.19c0-2.206-1.627-3.99-3.833-3.99-2.206 0-3.833 1.784-3.833 3.99 0 2.184 1.627 3.989 3.833 3.989 2.206 0 3.833-1.808 3.833-3.99zM14.518 7.086c0-1.404-1.136-2.562-2.518-2.562S9.482 5.682 9.482 7.086 10.618 9.65 12 9.65s2.518-1.159 2.518-2.563z"
    />
  </svg>
);

export const ZipRecruiterIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg viewBox="0 0 100 100" width={size} height={size} className={className} xmlns="http://www.w3.org/2000/svg" role="img" aria-label="ZipRecruiter">
    <rect width="100" height="100" rx="22" fill="#5BA647" />
    <g transform="translate(23, 7) scale(0.9)">
      <path
        fill="#FFFFFF"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M52.9 26.5c-.6-.2-1.3-.1-2 .1l-2.7.9V2.4c0-1.3-1.1-2.4-2.4-2.4H10.3C9 0 7.9 1.1 7.9 2.4v25.2l-2.7-.9c-.7-.2-1.4-.3-2-.1-1 .2-3.2 1.2-3.2 5.1v21c.3 1.8 1.5 3.9 4.2 3.9h9c.9 1.1 3.1 2.9 7.3 3.2.1 3.1 1.9 5.7 4.6 6.8v5.9c0 .1-.1.2-.2.2-12.6.4-20.6 4.4-22.9 5.7C.6 79.2.3 80.9.3 82v4.6c.1 1.6 1.4 2.9 3.1 2.9 1.5 0 2.8-1.3 2.9-2.8.1-1.5-.9-2.7-2.3-3.1-.1 0-.2-.1-.2-.2v-1.7c0-.4.2-.8.6-1 3.4-1.9 12.1-2.8 18.7-3.2H25c.1 0 .2.1.2.2.3 5.3.9 9.8 1.1 12.6h-.2c-1.1 0-2.1 1.3-2.1 3s1 3 2.1 3h4c1.1 0 2.1-1.3 2.1-3s-1-3-2.1-3h-.2s.7-7.3 1.1-12.6c0-.1.1-.2.2-.2h1.9c6.6.3 15.3 1.3 18.7 3.2.4.2.6.6.6 1v1.7c0 .1-.1.2-.2.2-1.4.3-2.4 1.6-2.3 3.1.1 1.5 1.4 2.8 2.9 2.8 1.6 0 3-1.2 3.1-2.9V82c0-1.1-.3-2.7-1.7-3.6-2.3-1.3-10.4-5.3-22.9-5.8-.1 0-.2-.1-.2-.2v-5.9c2.7-1.1 4.5-3.7 4.6-6.8 4.1-.3 6.3-2.2 7.3-3.2h9c2.7 0 3.9-2.1 4.2-3.9v-21c-.1-3.9-2.3-4.8-3.3-5.1zm-45 21.8l-4.1 3.1c-.1.1-.2 0-.2-.1V31.6c0-.8.1-1.8.5-1.7l3.6 1.2c.1 0 .2.2.2.3v16.9zm44.5 3.1l-4.1-3.1V31.5c0-.1.1-.2.2-.3l3.6-1.2c.5-.1.5.9.5 1.7v19.7s-.1.1-.2 0z"
      />
    </g>
  </svg>
);

export const JobbermanIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg viewBox="0 0 66 66" width={size} height={size} className={className} xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Jobberman">
    <rect width="66" height="66" rx="15" fill="#1A4D98" />
    <g transform="translate(17.25 3.42)" fill="#FFFFFF" fillRule="nonzero">
      <path d="M3.368 0h14.31v.46c-3.593.661-3.822 2.241-3.822 2.241-.26.949-.172 2.989-.172 2.989v36.432C13.08 53.328.38 59.016.38 59.016c-.69 0-.23-.575-.23-.575 7.815-7.872 7.586-13.074 7.586-13.074V3.792c0-2.758-2.932-2.758-2.932-2.758C3.541.804 3.368 0 3.368 0" />
      <path d="M17.074 10.315c.604-.259 1.407-.488 1.407-.488.777-.489.46-1.12.46-1.12-.517-2.357-.057-4.972-.057-4.972.402-2.011 3.19-1.896 3.19-1.896 2.987.431 3.246 3.477 3.246 3.477.03 1.35-.632 2.183-.632 2.183-1.207 2.212-.748 3.592-.748 3.592 2.788.575 3.277.69 3.277.69 0 2.671.488 7.096.488 7.126.143 4.396.46 6.406.46 6.406.574 2.76 2.327 4.713 2.327 4.713 1.523 1.523.862 2.873.862 2.873-1.84 1.034-3.39.69-3.39.69-1.179 0-1.064.373-1.064.373 0 3.908.144 4.885.144 4.885.23 2.24.316 3.534.316 3.534.402 2.04.948 2.987.948 2.987 0 2.903-.2 6.696-.2 6.696s0 .603-.058 1.15a99.313 99.313 0 0 0-.172 2.356c0 .114.23.374.286.46a63.747 63.747 0 0 1 2.213 2.47c-.603.517-2.93.517-2.93.517-1.552.316-2.702 0-2.702 0-1.09-.632-1.264-2.154-1.264-2.154s-.028.287-.028-.145c0-2.068.114-3.188.114-3.188.373-4.34-.114-8.851-.114-8.851l-.26-1.925c-.344-3.017-1.838-5.89-1.838-5.89-.317-.315-.517.086-.517.086-2.27 4.31-3.505 7.96-3.505 7.96-2.443 6.58-2.012 11.98-2.012 11.98.201.921.287 1.15.287 1.15-.89.23-3.189-.977-3.189-1.062-2.299-1.524-1.236-6.954-1.236-6.954l.748-2.529-4.425-1.839 1.695-11.55 2.586-.23-.575-11.033c.03-1.15.66-1.581.66-1.581-.172-7.441.576-7.93.576-7.93.718-1.35 2.097-2.04 2.097-2.04 1.523-.603 2.53-.977 2.53-.977" />
    </g>
  </svg>
);

export const JoobleIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg viewBox="0 0 100 100" width={size} height={size} className={className} xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Jooble">
    <rect width="100" height="100" rx="22" fill="#FA5A00" />
    <image href="/images/integrations/jooble.png" x="8" y="12" width="84" height="76" preserveAspectRatio="xMidYMid meet" />
  </svg>
);

export const MyJobMagIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg viewBox="0 0 100 100" width={size} height={size} className={className} xmlns="http://www.w3.org/2000/svg" role="img" aria-label="MyJobMag">
    <rect width="100" height="100" rx="22" fill="#1E1B4B" />
    <image href="/images/integrations/myjobmag.png" x="6" y="16" width="88" height="68" preserveAspectRatio="xMidYMid meet" />
  </svg>
);

// Neutral fallback for integrations with no available real logo asset
// (currently: Deel, Checkr, SCORM Cloud, and the smaller HMO providers).
// Deliberately generic — never a fabricated approximation of a real logo.
export const GenericBrandMark: React.FC<IconProps & { label?: string }> = ({ className, size = 24, label }) => (
  <div
    className={`flex items-center justify-center rounded-lg bg-slate-200 dark:bg-[#232D42] text-slate-500 dark:text-[#94A3B8] font-bold ${className || ''}`}
    style={{ width: size, height: size, fontSize: typeof size === 'number' ? size * 0.45 : undefined }}
    role="img"
    aria-label={label || 'Integration'}
  >
    {label ? label.charAt(0).toUpperCase() : '?'}
  </div>
);

export type BrandKey =
  | 'slack'
  | 'linkedin'
  | 'google'
  | 'google-calendar'
  | 'microsoft'
  | 'xero'
  | 'quickbooks'
  | 'indeed'
  | 'glassdoor'
  | 'greenhouse'
  | 'ziprecruiter'
  | 'jobberman'
  | 'jooble'
  | 'myjobmag';

const BRAND_ICON_MAP: Record<BrandKey, React.FC<IconProps>> = {
  slack: SlackIcon,
  linkedin: LinkedInIcon,
  google: GoogleIcon,
  'google-calendar': GoogleCalendarIcon,
  microsoft: MicrosoftIcon,
  xero: XeroIcon,
  quickbooks: QuickBooksIcon,
  indeed: IndeedIcon,
  glassdoor: GlassdoorIcon,
  greenhouse: GreenhouseIcon,
  ziprecruiter: ZipRecruiterIcon,
  jobberman: JobbermanIcon,
  jooble: JoobleIcon,
  myjobmag: MyJobMagIcon,
};

// Integrations known to have no real logo sourced yet — see the file header.
export const BRAND_ICON_GAPS = ['deel', 'checkr', 'scorm', 'hmo-hygeia', 'hmo-leadway', 'hmo-axamansard'] as const;

/**
 * Resolves a real brand mark from a free-form integration/app name (used by
 * the Marketplace, whose catalog is admin-registered and not a fixed enum).
 * Falls back to null when no real logo is available for that name — callers
 * should render GenericBrandMark (or their own fallback) in that case.
 */
export function resolveBrandKeyFromName(name: string): BrandKey | null {
  const n = (name || '').toLowerCase();
  if (n.includes('slack')) return 'slack';
  if (n.includes('linkedin')) return 'linkedin';
  if (n.includes('google calendar') || n.includes('gcal')) return 'google-calendar';
  if (n.includes('google')) return 'google';
  if (n.includes('microsoft') || n.includes('teams') || n.includes('office 365') || n.includes('outlook')) return 'microsoft';
  if (n.includes('xero')) return 'xero';
  if (n.includes('quickbooks')) return 'quickbooks';
  if (n.includes('indeed')) return 'indeed';
  if (n.includes('glassdoor')) return 'glassdoor';
  if (n.includes('greenhouse')) return 'greenhouse';
  if (n.includes('ziprecruiter') || n.includes('zip recruiter') || n === 'zr') return 'ziprecruiter';
  if (n.includes('jobberman') || n === 'jm') return 'jobberman';
  if (n.includes('jooble') || n === 'jb') return 'jooble';
  if (n.includes('myjobmag') || n.includes('myjob mag') || n === 'mjm') return 'myjobmag';
  return null;
}

interface IntegrationLogoProps extends IconProps {
  brand: BrandKey | null | undefined;
  /** Used for the GenericBrandMark fallback's initial + aria-label. */
  name?: string;
}

/** Renders the real brand mark for `brand`, or an honest neutral fallback. */
export const IntegrationLogo: React.FC<IntegrationLogoProps> = ({ brand, name, className, size = 24 }) => {
  if (brand && BRAND_ICON_MAP[brand]) {
    const Icon = BRAND_ICON_MAP[brand];
    return <Icon className={className} size={size} />;
  }
  return <GenericBrandMark className={className} size={size} label={name} />;
};
