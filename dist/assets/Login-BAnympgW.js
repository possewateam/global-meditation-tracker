import{u as y,r as n,j as e,a5 as E,a6 as S,a7 as k}from"./vendor-react-CsWuKxj5.js";import{u as C}from"./index-DwrExZEh.js";import{L as I}from"./page-admin-DgYsNXAM.js";import"./vendor-other-D2N4SXMU.js";import"./vendor-three-WWH58ZbN.js";import"./vendor-i18n-CPrbmvBl.js";import"./vendor-supabase-D4rA0elu.js";const H=()=>{const{t:o}=y(),{login:g,signInWithGoogle:D}=C(),[a,x]=n.useState(""),[u,i]=n.useState(!1);n.useState(!1);const[c,p]=n.useState(""),[s,l]=n.useState(""),m=n.useRef(null),b=t=>t?t.replace(/\D/g,"").length<10?"Please enter a valid 10-digit mobile number":"":"Mobile number is required",f=()=>a&&!s,w=t=>{const r=t.startsWith("+")?t:`+${t}`;x(r),l(b(t))},j=async t=>{t.preventDefault(),p(""),i(!0);const r=b(a);if(r){l(r),i(!1);return}const d=a.match(/^(\+\d+)(\d+)$/);if(!d){l("Invalid phone number format"),i(!1);return}const N=d[1],v=d[2],h=await g(v,N);h.success||(p(h.error||o("auth.loginFailed")),i(!1))};return e.jsxs("div",{className:"min-h-screen bg-gradient-to-br from-blue-900 via-teal-800 to-emerald-900 flex items-center justify-center p-4",children:[e.jsx("div",{className:"absolute top-4 right-4",children:e.jsx(I,{})}),e.jsxs("div",{className:"w-full max-w-md",children:[e.jsxs("div",{className:"mb-6 text-center",children:[e.jsxs("p",{className:"text-white/70 text-lg mb-3",children:[o("auth.notRegistered")," "]}),e.jsx("a",{href:"/register",className:"inline-block px-6 py-3 text-2xl font-bold text-amber-400 bg-gradient-to-r from-amber-500/30 to-yellow-500/30 rounded-xl border-2 border-amber-400 animate-register-blink hover:scale-110 transition-transform duration-300",children:o("auth.registerHere")})]}),e.jsxs("div",{className:"bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20",children:[e.jsxs("div",{className:"flex items-center justify-center gap-3 mb-6",children:[e.jsx(E,{className:"w-10 h-10 text-teal-300"}),e.jsx("h1",{className:"text-3xl font-bold text-white",children:o("auth.login")})]}),e.jsx("p",{className:"text-teal-200 text-center mb-8",children:o("auth.loginSubtitle")}),e.jsxs("form",{ref:m,onSubmit:j,className:"space-y-6",children:[e.jsxs("div",{children:[e.jsxs("label",{className:"flex items-center gap-2 text-white mb-2 font-medium",children:[e.jsx(S,{className:"w-4 h-4"}),o("auth.mobileNumber")]}),e.jsx("div",{className:"phone-input-wrapper",children:e.jsx(k,{country:"in",value:a,onChange:w,inputClass:s?"phone-input-error":"",containerClass:"phone-input-container",buttonClass:"phone-input-button",dropdownClass:"phone-input-dropdown",inputProps:{required:!0,autoFocus:!1,onKeyDown:t=>{if(t.key==="Enter"){t.preventDefault();const r=m.current;r&&(typeof r.requestSubmit=="function"?r.requestSubmit():r.dispatchEvent(new Event("submit",{bubbles:!0,cancelable:!0})))}}},countryCodeEditable:!1,disableDropdown:!1,enableSearch:!0,searchPlaceholder:"Search country"})}),s&&e.jsx("p",{className:"text-red-400 text-sm mt-1",children:s})]}),c&&e.jsx("div",{className:"p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm",children:c}),e.jsx("button",{type:"submit",disabled:u||!f(),className:"w-full py-3 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-teal-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed",children:o(u?"common.loading":"auth.loginButton")})]}),!!0]})]}),e.jsx("style",{children:`
        .phone-input-container {
          width: 100%;
        }

        .phone-input-container input {
          width: 100% !important;
          height: 48px;
          background: rgba(255, 255, 255, 0.1) !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
          border-radius: 0.5rem !important;
          color: white !important;
          font-size: 1rem;
          padding-left: 48px !important;
        }

        .phone-input-container input::placeholder {
          color: rgba(255, 255, 255, 0.5) !important;
        }

        .phone-input-container input:focus {
          outline: none !important;
          border-color: rgb(45, 212, 191) !important;
        }

        .phone-input-error {
          border-color: rgb(239, 68, 68) !important;
        }

        .phone-input-button {
          background: rgba(255, 255, 255, 0.1) !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
          border-right: none !important;
          border-radius: 0.5rem 0 0 0.5rem !important;
        }

        .phone-input-button:hover {
          background: rgba(255, 255, 255, 0.15) !important;
        }

        .phone-input-dropdown {
          background: rgb(17, 94, 89) !important;
          color: white !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
        }

        .phone-input-dropdown .search {
          background: rgba(255, 255, 255, 0.1) !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
        }

        .phone-input-dropdown .search input {
          background: transparent !important;
          color: white !important;
        }

        .phone-input-dropdown .country:hover {
          background: rgba(255, 255, 255, 0.1) !important;
        }

        .phone-input-dropdown .country.highlight {
          background: rgba(45, 212, 191, 0.2) !important;
        }
      `})]})};export{H as Login};
