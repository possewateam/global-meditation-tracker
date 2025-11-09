// Minimal Kapsule shim to avoid reliance on __name helper.
// Matches the public surface used by globe.gl / three-globe without name-mangling.

export default function kapsule({
  stateInit = () => ({}),
  props = {},
  methods = {},
  aliases = {},
  init = () => {},
  update = () => {},
} = {}) {
  const propDescs = Object.keys(props).map((name) => {
    const cfg = props[name] || {};
    return {
      name,
      defaultVal: cfg.default === undefined ? null : cfg.default,
      triggerUpdate: cfg.triggerUpdate === undefined ? true : !!cfg.triggerUpdate,
      onChange: typeof cfg.onChange === 'function' ? cfg.onChange : () => {},
    };
  });

  function KapsuleComp(...args) {
    // Support optional new-call style used by some consumers
    const calledAsConstructor = this instanceof KapsuleComp ? this.constructor : undefined;
    const el = calledAsConstructor ? args.shift() : undefined;
    const initProps = args[0] === undefined ? {} : args[0];

    const baseState = typeof stateInit === 'function' ? stateInit(initProps) : stateInit;
    const state = { ...baseState, initialised: false };
    let pendingProps = {};

    function comp(elArg) {
      initStatic(elArg, initProps);
      scheduleUpdate();
      return comp;
    }

    function initStatic(elArg, propsArg) {
      // If a ticker exists, leave it untouched to avoid mutating read-only getters.
      // Upstream libs (three-globe/globe.gl) manage the ticker instance lifecycle.
      try {
        init.call(comp, elArg, state, propsArg);
      } finally {
        state.initialised = true;
      }
    }

    const scheduleUpdate = debounce(() => {
      if (state.initialised) {
        try {
          update.call(comp, state, pendingProps);
        } finally {
          pendingProps = {};
        }
      }
    }, 1);

    // Define prop get/setters
    propDescs.forEach(({ name, defaultVal, triggerUpdate, onChange }) => {
      comp[name] = function (val) {
        const prev = state[name];
        if (!arguments.length) return prev;
        const next = val === undefined ? defaultVal : val;
        state[name] = next;
        try { onChange.call(comp, next, state, prev); } catch {}
        if (!Object.prototype.hasOwnProperty.call(pendingProps, name)) {
          pendingProps[name] = prev;
        }
        if (triggerUpdate) scheduleUpdate();
        return comp;
      };
    });

    // Bind methods to state
    Object.keys(methods).forEach((m) => {
      comp[m] = function (...args2) {
        return methods[m].call(comp, state, ...args2);
      };
    });

    // Add method aliases
    Object.entries(aliases).forEach(([alias, target]) => {
      comp[alias] = comp[target];
    });

    // Utility to reset all props to defaults
    comp.resetProps = function () {
      propDescs.forEach((d) => comp[d.name](d.defaultVal));
      return comp;
    };

    // Initialise with defaults
    comp.resetProps();

    // expose rerender hook similar to upstream
    state._rerender = scheduleUpdate;

    // If called via new, run init immediately
    if (calledAsConstructor && el) comp(el);
    return comp;
  }

  return KapsuleComp;
}

function debounce(fn, wait = 0) {
  let tId = null;
  return function (..._args) {
    if (tId) clearTimeout(tId);
    const now = Date.now();
    tId = setTimeout(() => {
      tId = null;
      fn(now);
    }, wait);
  };
}