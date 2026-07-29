const { join } = require('path');
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx,html}', '../../libraries/**/*.{ts,tsx,html}'],
  theme: {
    // ---- Hard overrides (NOT `extend`) ----
    // These four scales replace Tailwind's stock ramps outright, so the stock
    // classes stop compiling and the only way to set type, weight, radius or
    // a control height is to name a Slate token.

    // The type scale. Sixteen tokens, letter-spacing and weight baked in —
    // never set ad hoc. text-lg / text-xs / text-2xl no longer resolve.
    //
    // The five `-emphasis` / `-strong` steps below are not new type: they are
    // the size/weight pairs that were already shipping as `t-body
    // font-semibold`, `t-secondary font-medium` and so on. Eleven tokens were
    // declared "never set ad hoc" while 39 call sites set a bare `font-*`
    // utility next to one, which made the real scale sixteen steps with five
    // of them unnamed and unreviewed. Naming them is the whole fix: the pairs
    // that earned a token got one, the two that had a single call site each
    // (12/400 at caption size, 14/400 at control size) did not and were folded
    // back onto the token's own weight.
    //
    //   -emphasis  one step up from the base token's weight (400 -> 500)
    //   -strong    600, the heaviest weight that ships
    fontSize: {
      display: [
        '40px',
        { lineHeight: '44px', letterSpacing: '-0.024em', fontWeight: '600' },
      ],
      'title-1': [
        '28px',
        { lineHeight: '34px', letterSpacing: '-0.021em', fontWeight: '600' },
      ],
      'title-2': [
        '22px',
        { lineHeight: '28px', letterSpacing: '-0.016em', fontWeight: '600' },
      ],
      'title-3': [
        '17px',
        { lineHeight: '24px', letterSpacing: '-0.011em', fontWeight: '600' },
      ],
      body: [
        '15px',
        { lineHeight: '22px', letterSpacing: '-0.006em', fontWeight: '400' },
      ],
      'body-emphasis': [
        '15px',
        { lineHeight: '22px', letterSpacing: '-0.006em', fontWeight: '500' },
      ],
      'body-strong': [
        '15px',
        { lineHeight: '22px', letterSpacing: '-0.006em', fontWeight: '600' },
      ],
      control: [
        '14px',
        { lineHeight: '20px', letterSpacing: '-0.004em', fontWeight: '500' },
      ],
      'control-strong': [
        '14px',
        { lineHeight: '20px', letterSpacing: '-0.004em', fontWeight: '600' },
      ],
      secondary: [
        '13px',
        { lineHeight: '18px', letterSpacing: '0em', fontWeight: '400' },
      ],
      'secondary-emphasis': [
        '13px',
        { lineHeight: '18px', letterSpacing: '0em', fontWeight: '500' },
      ],
      'secondary-strong': [
        '13px',
        { lineHeight: '18px', letterSpacing: '0em', fontWeight: '600' },
      ],
      caption: [
        '12px',
        { lineHeight: '16px', letterSpacing: '0.004em', fontWeight: '500' },
      ],
      'caption-strong': [
        '12px',
        { lineHeight: '16px', letterSpacing: '0.004em', fontWeight: '600' },
      ],
      overline: [
        '11px',
        { lineHeight: '14px', letterSpacing: '0.06em', fontWeight: '600' },
      ],
      numeric: [
        '13px',
        { lineHeight: '18px', letterSpacing: '0em', fontWeight: '500' },
      ],
    },
    // Three weights exist. font-bold / font-light no longer resolve.
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
    },
    // Radius by role — five values, no others. rounded-lg / rounded-md /
    // rounded-xl / rounded-full no longer resolve.
    borderRadius: {
      none: '0px',
      thumb: '6px', // media thumbnails, tags
      control: '10px', // buttons, inputs, selects, menu items
      card: '14px', // cards, modals, popovers, drawers
      pill: '999px', // status pills, avatars
    },
    // The spacing scale. Thirteen steps, an 8pt rhythm with 4/12/20 for tight
    // work and 1/2 for hairline-scale offsets. Keys are px, which is what the
    // codebase already writes, so `gap-8` and `gap-[8px]` are the same 8px.
    //
    // This kills Tailwind's stock rem ramp: p-3 / gap-1 / mt-4 / px-6 / py-2 /
    // pt-12 no longer mean 12px / 4px / 16px / 24px / 8px / 48px, so every one
    // of those call sites had to be rewritten to an explicit value. Padding,
    // margin, gap, space, inset, width, height, translate and flex-basis all
    // read this scale.
    //
    // Honest limit: Tailwind resolves arbitrary values (`p-[15px]`) without
    // consulting the theme at all, so this override cannot forbid them — it
    // only removes the stock ladder. Keeping the off-scale set empty is a
    // review job, not something the config can enforce.
    spacing: {
      0: '0px',
      1: '1px',
      2: '2px',
      4: '4px',
      8: '8px',
      12: '12px',
      16: '16px',
      20: '20px',
      24: '24px',
      32: '32px',
      48: '48px',
      64: '64px',
      96: '96px',
    },
    // Three durations. This is a hard override, not `extend` — under `extend`
    // Tailwind's stock 75/100/150/200/300/500/700/1000 ramp kept compiling and
    // duration-500 / duration-200 were in live use. DEFAULT is the state
    // duration so a bare `transition-colors` lands on a token rather than on
    // Tailwind's 150ms.
    transitionDuration: {
      DEFAULT: '120ms',
      state: '120ms',
      enter: '180ms',
      surface: '240ms',
    },
    // Every duration below is 120 / 180 / 240ms. The only figure that is
    // not is the 4s on `fadeDown` and the 4s delay on `newMessages`, and
    // neither is a duration of motion: they are dwell time on a
    // self-dismissing toast. The motion inside fadeDown is 180ms in and
    // 180ms out (the 4.5% keyframe stops below).
    //
    // Also a hard override rather than `extend`: under `extend`, Tailwind's
    // animate-spin / animate-pulse / animate-bounce / animate-ping still
    // resolved, and animate-bounce was looping forever in the top bar.
    //
    // Exactly two looping animations ship, and both are indeterminate progress
    // — the only thing a loop is allowed to mean: the 1.2s upload bar, which
    // lives with the uploader, and the busy ring below (`spin` is declared in
    // global.scss and is what the Button already draws while loading).
    animation: {
      none: 'none',
      spin: 'spin 800ms linear infinite',
      fade: 'fadeOut 240ms cubic-bezier(0.32, 0.72, 0, 1)',
      normalFadeIn: 'normalFadeIn 180ms cubic-bezier(0.32, 0.72, 0, 1)',
      fadeIn: 'normalFadeIn 180ms cubic-bezier(0.32, 0.72, 0, 1) forwards',
      normalFadeOut: 'normalFadeOut 180ms linear 5s forwards',
      overflow: 'overFlow 240ms cubic-bezier(0.32, 0.72, 0, 1) forwards',
      overflowReverse:
        'overFlowReverse 240ms cubic-bezier(0.32, 0.72, 0, 1) forwards',
      fadeDown: 'fadeDown 4s cubic-bezier(0.32, 0.72, 0, 1) forwards',
      normalFadeDown:
        'normalFadeDown 240ms cubic-bezier(0.32, 0.72, 0, 1) forwards',
      newMessages: 'newMessages 240ms cubic-bezier(0.4, 0, 0.2, 1) 4s forwards',
    },
    extend: {
      // Control heights are exactly 28 / 36 / 44 — nothing in between, and
      // the token is the only spelling. `h-[36px]` and friends were the real
      // ladder for a while (30 / 34 / 38 / 40 / 42 / 46 / 52 all shipped
      // alongside it) which made this block dead code describing a system
      // that did not exist; every one of those call sites now names a token.
      //
      // Scope: this is a *control* ladder — buttons, inputs, selects, menu
      // rows, tabs, chips, toolbar buttons. It is deliberately not a size
      // scale: a square avatar, a media thumbnail or a 2px connector rule is
      // geometry, sets width and height together, and keeps its own value.
      height: {
        compact: '28px',
        control: '36px',
        large: '44px',
      },
      minHeight: {
        compact: '28px',
        control: '36px',
        large: '44px',
      },
      maxHeight: {
        compact: '28px',
        control: '36px',
        large: '44px',
      },
      colors: {
        // ---- Slate semantic tokens ----
        // Surfaces: at most two levels plus one overlay per screen.
        canvas: 'var(--slate-canvas)',
        surface: 'var(--slate-surface)',
        surfaceSunken: 'var(--slate-surface-sunken)',
        surfaceHover: 'var(--slate-surface-hover)',
        surfaceActive: 'var(--slate-surface-active)',
        surfaceOverlay: 'var(--slate-surface-overlay)',
        scrim: 'var(--slate-scrim)',
        // Separation is 1px hairlines only — never shadow, never a filled box.
        hairline: 'var(--slate-hairline)',
        line: 'var(--slate-line)',
        lineStrong: 'var(--slate-line-strong)',
        // The one boundary that identifies a control rather than separating
        // content: inputs, textareas, selects, secondary buttons. 3:1 against
        // the surface in both themes (SC 1.4.11). Never use it for a rule.
        lineControl: 'var(--slate-line-control)',
        // At most three text colors per screen.
        ink: 'var(--slate-text-primary)',
        inkSecondary: 'var(--slate-text-secondary)',
        inkTertiary: 'var(--slate-text-tertiary)',
        inkInverse: 'var(--slate-text-inverse)',
        // Primary actions are ink, which is what keeps the accent scarce.
        primaryBg: 'var(--slate-primary-bg)',
        primaryBgHover: 'var(--slate-primary-bg-hover)',
        primaryText: 'var(--slate-primary-text)',
        // Signal Amber — status only, and the budget is four uses: focus
        // ring, queued/scheduled dot, active nav marker, calendar "now"
        // line. Nothing else. (`--slate-selection` is a fifth amber *tint*
        // for the ::selection wash; it is a separate token, not this one.)
        //
        // "Upload progress fill" used to be listed here and was never true:
        // .uppy-ProgressBar-inner draws in surfaceActive and
        // media.settings.component.tsx in primaryBg. Indeterminate progress
        // is not a status the accent is spent on.
        accent: 'var(--slate-accent)',
        // Functional only — post lifecycle state.
        critical: 'var(--slate-critical)',
        criticalTint: 'var(--slate-critical-tint)',
        criticalBorder: 'var(--slate-critical-border)',
        success: 'var(--slate-success)',
        successTint: 'var(--slate-success-tint)',
        skeleton: 'var(--slate-skeleton)',
        // Marks that sit on user content rather than on a surface — a tag's
        // colour swatch, a control over a media thumbnail. Constant in both
        // themes; see the note in colors.scss.
        onSwatch: 'var(--slate-on-swatch)',

        primary: 'var(--color-primary)',
        // NOTE: the legacy `secondary` colour alias was removed — it collided
        // with the `secondary` type token in the fontSize scale above, which
        // would have made `text-secondary` set a colour as well as a size.
        // Its value was `--slate-surface`; call sites now say `surface`.
        textColor: 'var(--new-btn-text)',
        third: 'var(--color-third)',
        forth: 'var(--color-forth)',
        fifth: 'var(--color-fifth)',
        sixth: 'var(--color-sixth)',
        seventh: 'var(--color-seventh)',
        gray: 'var(--color-gray)',
        input: 'var(--color-input)',
        tableBorder: 'var(--color-table-border)',
        customColor1: 'var(--color-custom1)',
        customColor2: 'var(--color-custom2)',
        customColor3: 'var(--color-custom3)',
        customColor4: 'var(--color-custom4)',
        customColor5: 'var(--color-custom5)',
        customColor8: 'var(--color-custom8)',
        customColor10: 'var(--color-custom10)',
        customColor11: 'var(--color-custom11)',
        customColor12: 'var(--color-custom12)',
        customColor13: 'var(--color-custom13)',
        customColor14: 'var(--color-custom14)',
        customColor16: 'var(--color-custom16)',
        customColor17: 'var(--color-custom17)',
        customColor21: 'var(--color-custom21)',
        customColor25: 'var(--color-custom25)',
        customColor26: 'var(--color-custom26)',
        customColor27: 'var(--color-custom27)',
        customColor28: 'var(--color-custom28)',
        customColor29: 'var(--color-custom29)',
        customColor30: 'var(--color-custom30)',
        customColor39: 'var(--color-custom39)',
        customColor40: 'var(--color-custom40)',
        customColor45: 'var(--color-custom45)',
        customColor51: 'var(--color-custom51)',
        customColor52: 'var(--color-custom52)',
        customColor53: 'var(--color-custom53)',
        customColor54: 'var(--color-custom54)',
        customColor55: 'var(--color-custom55)',
        modalCustom: 'var(--color-modalCustom)',

        newBgColor: 'var(--new-bgColor)',
        newBackdrop: 'var(--new-back-drop)',
        newSep: 'var(--new-sep)',
        newBorder: 'var(--new-border)',
        newBgColorInner: 'var(--new-bgColorInner)',
        newBgLineColor: 'var(--new-bgLineColor)',
        textItemFocused: 'var(--new-textItemFocused)',
        textItemBlur: 'var(--new-textItemBlur)',
        boxFocused: 'var(--new-boxFocused)',
        newTextColor: 'rgb(var(--new-textColor) / <alpha-value>)',
        blockSeparator: 'var(--new-blockSeparator)',
        btnSimple: 'var(--new-btn-simple)',
        btnText: 'var(--new-btn-text)',
        btnPrimary: 'var(--new-btn-primary)',
        ai: 'var(--new-ai-btn)',
        boxHover: 'var(--new-box-hover)',
        newTableBorder: 'var(--new-table-border)',
        newTableHeader: 'var(--new-table-header)',
        newTableText: 'var(--new-table-text)',
        newTableTextFocused: 'var(--new-table-text-focused)',
        newColColor: 'var(--new-col-color)',
        newSettings: 'var(--new-settings)',
        menuDots: 'var(--new-menu-dots)',
        menuDotsHover: 'var(--new-menu-hover)',
        bigStrip: 'var(--new-big-strips)',
        popup: 'var(--popup-color)',
        bgTiktokItem: 'var(--tiktok-item-bg)',
        bgTiktokItemIcon: 'var(--tiktok-item-icon-bg)',
        borderPreview: 'var(--border-preview)',
      },
      gridTemplateColumns: {
        13: 'repeat(13, minmax(0, 1fr));',
      },
      backgroundImage: {
        loginBox: 'url(/auth/login-box.png)',
        loginBg: 'url(/auth/bg-login.png)',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Text"',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          '"SF Mono"',
          'Menlo',
          'Consolas',
          'monospace',
        ],
      },
      transitionTimingFunction: {
        state: 'cubic-bezier(0.4, 0, 0.2, 1)',
        move: 'cubic-bezier(0.32, 0.72, 0, 1)',
      },
      // Exactly two shadows exist: none, and overlay (popovers, menus,
      // modals, toasts, an actively dragged post). Everything else is flat.
      boxShadow: {
        overlay: 'var(--slate-shadow-overlay)',
        yellow: 'none',
        yellowToast: 'var(--slate-shadow-overlay)',
        greenToast: 'var(--slate-shadow-overlay)',
        menu: 'var(--slate-shadow-overlay)',
        previewShadow: 'none',
      },
      dropShadow: {
        glow: 'none',
      },
      // that is actual animation
      keyframes: (theme) => ({
        fadeOut: {
          '0%': {
            opacity: 0,
            transform: 'translateY(30px)',
          },
          '100%': {
            opacity: 1,
            transform: 'translateY(0)',
          },
        },
        normalFadeOut: {
          '0%': {
            opacity: 1,
          },
          '100%': {
            opacity: 0,
          },
        },
        normalFadeIn: {
          '0%': {
            opacity: 0,
          },
          '100%': {
            opacity: 1,
          },
        },
        overFlow: {
          '0%': {
            overflow: 'hidden',
          },
          '99%': {
            overflow: 'hidden',
          },
          '100%': {
            overflow: 'visible',
          },
        },
        overFlowReverse: {
          '0%': {
            overflow: 'visible',
          },
          '99%': {
            overflow: 'visible',
          },
          '100%': {
            overflow: 'hidden',
          },
        },
        // Only opacity and transform are animated — never margin/top/height.
        // 4.5% of 4s = 180ms in, 180ms out; the rest is dwell.
        fadeDown: {
          '0%': {
            opacity: 0,
            transform: 'translate(-50%, -8px)',
          },
          '4.5%': {
            opacity: 1,
            transform: 'translate(-50%, 0)',
          },
          '95.5%': {
            opacity: 1,
            transform: 'translate(-50%, 0)',
          },
          '100%': {
            opacity: 0,
            transform: 'translate(-50%, -8px)',
          },
        },
        normalFadeDown: {
          '0%': {
            opacity: 0,
            transform: 'translateY(-30px)',
          },
          '100%': {
            opacity: 1,
            transform: 'translateY(0)',
          },
        },
        // Only background-color moves here — font-weight is neither a
        // transitionable property nor a permitted weight.
        newMessages: {
          '0%': {
            backgroundColor: 'var(--color-seventh)',
          },
          '100%': {
            backgroundColor: 'var(--color-third)',
          },
        },
      }),
      screens: {
        mobile: {
          raw: '(max-width: 1025px)',
        },
        tablet: {
          raw: '(max-width: 1300px)',
        },
        iconBreak: {
          raw: '(max-width: 1560px)',
        },
        maxMedia: {
          raw: '(max-width: 1400px)',
        },
        minCustom: {
          raw: '(min-height: 800px)',
        },
        custom: {
          raw: '(max-height: 800px)',
        },
        xs: {
          max: '401px',
        },
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar'),
    require('tailwindcss-rtl'),
    function ({ addVariant }) {
      addVariant('child', '& > *');
      addVariant('child-hover', '& > *:hover');
    },
  ],
};
