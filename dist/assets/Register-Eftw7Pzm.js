import{u as q,r as l,j as e,a8 as I,a1 as G,N as A,a6 as O,a7 as F,G as T,a9 as B,c as M,aa as y}from"./vendor-react-CsWuKxj5.js";import{u as R}from"./index-DwrExZEh.js";import{L as H}from"./page-admin-DgYsNXAM.js";import{r as $}from"./location-C0cwv-Fe.js";import{r as K,f as U}from"./geocoding-CM-iX_7u.js";import"./vendor-other-D2N4SXMU.js";import"./vendor-three-WWH58ZbN.js";import"./vendor-i18n-CPrbmvBl.js";import"./vendor-supabase-D4rA0elu.js";const ae=()=>{const{t:i}=q(),{register:k,signInWithGoogle:z}=R(),[a,h]=l.useState({name:"",bk_centre_name:"",mobile_e164:""}),[s,S]=l.useState({}),[m,d]=l.useState("idle"),[E,u]=l.useState(""),[g,p]=l.useState(!1);l.useState(!1);const[w,f]=l.useState(""),[n,c]=l.useState({name:"",mobile_e164:"",bk_centre_name:""});l.useEffect(()=>{j()},[]);const j=async()=>{d("requesting"),u("");try{const t=await $(),r=await K(t.latitude,t.longitude);if(r.success){const o={...r,latitude:t.latitude,longitude:t.longitude,location_source:"gps",address_source:"gps_geocoded",location_accuracy:t.accuracy};S(o),d("success")}else u(r.error||"Failed to get address from location"),d("error")}catch(t){t.code==="PERMISSION_DENIED"?(d("denied"),u("Location permission denied. You can enter your location manually.")):(d("error"),u("Unable to get location. You can enter it manually."))}},b=t=>t?/^[A-Za-z ]+$/.test(t)?"":"Name should only contain letters and spaces":"Name is required",x=t=>t?"":"BK Centre Name is required",N=t=>t?t.replace(/\D/g,"").length<10?"Please enter a valid 10-digit mobile number":"":"Mobile number is required",C=()=>a.name&&a.bk_centre_name&&a.mobile_e164&&!n.name&&!n.mobile_e164&&!n.bk_centre_name,D=t=>{const r=t.startsWith("+")?t:`+${t}`;h(o=>({...o,mobile_e164:r})),c(o=>({...o,mobile_e164:N(t)}))},L=async t=>{t.preventDefault(),f(""),p(!0);const r=b(a.name),o=x(a.bk_centre_name),_=N(a.mobile_e164);if(r||o||_){c({name:r,bk_centre_name:o,mobile_e164:_}),p(!1);return}const P={name:a.name,bk_centre_name:a.bk_centre_name,mobile_e164:a.mobile_e164,...s},v=await k(P);v.success||(f(v.error||i("auth.registrationFailed")),p(!1))};return e.jsxs("div",{className:"min-h-screen bg-gradient-to-br from-blue-900 via-teal-800 to-emerald-900 flex items-center justify-center p-4",children:[e.jsx("div",{className:"absolute top-4 right-4",children:e.jsx(H,{})}),e.jsx("div",{className:"w-full max-w-md",children:e.jsxs("div",{className:"bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20",children:[e.jsxs("div",{className:"flex items-center justify-center gap-3 mb-6",children:[e.jsx(I,{className:"w-10 h-10 text-teal-300"}),e.jsx("h1",{className:"text-3xl font-bold text-white",children:i("auth.register")})]}),e.jsx("p",{className:"text-teal-200 text-center mb-8",children:i("auth.registerSubtitle")}),e.jsxs("form",{onSubmit:L,className:"space-y-6",children:[e.jsxs("div",{children:[e.jsxs("label",{className:"flex items-center gap-2 text-white mb-2 font-medium",children:[e.jsx(G,{className:"w-4 h-4"}),i("auth.name")]}),e.jsx("input",{type:"text",value:a.name,onChange:t=>{const r=t.target.value;h({...a,name:r}),c(o=>({...o,name:b(r)}))},onBlur:t=>c(r=>({...r,name:b(t.target.value)})),className:`w-full px-4 py-3 bg-white/10 border ${n.name?"border-red-500":"border-white/20"} rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-teal-400 transition-colors`,placeholder:i("auth.namePlaceholder"),required:!0}),n.name&&e.jsx("p",{className:"text-red-400 text-sm mt-1",children:n.name})]}),e.jsxs("div",{children:[e.jsxs("label",{className:"flex items-center gap-2 text-white mb-2 font-medium",children:[e.jsx(A,{className:"w-4 h-4"}),"BK Centre Name"]}),e.jsx("input",{type:"text",value:a.bk_centre_name,onChange:t=>{const r=t.target.value;h({...a,bk_centre_name:r}),c(o=>({...o,bk_centre_name:x(r)}))},onBlur:t=>c(r=>({...r,bk_centre_name:x(t.target.value)})),className:`w-full px-4 py-3 bg-white/10 border ${n.bk_centre_name?"border-red-500":"border-white/20"} rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-teal-400 transition-colors`,placeholder:"Enter your BK Centre name",required:!0}),n.bk_centre_name&&e.jsx("p",{className:"text-red-400 text-sm mt-1",children:n.bk_centre_name})]}),e.jsxs("div",{children:[e.jsxs("label",{className:"flex items-center gap-2 text-white mb-2 font-medium",children:[e.jsx(O,{className:"w-4 h-4"}),i("auth.mobileNumber")]}),e.jsx("div",{className:"phone-input-wrapper",children:e.jsx(F,{country:"in",value:a.mobile_e164,onChange:D,inputClass:n.mobile_e164?"phone-input-error":"",containerClass:"phone-input-container",buttonClass:"phone-input-button",dropdownClass:"phone-input-dropdown",inputProps:{required:!0,autoFocus:!1},countryCodeEditable:!1,disableDropdown:!1,enableSearch:!0,searchPlaceholder:"Search country"})}),n.mobile_e164&&e.jsx("p",{className:"text-red-400 text-sm mt-1",children:n.mobile_e164})]}),e.jsx("div",{className:"hidden",children:e.jsxs("div",{className:"bg-white/5 border border-white/10 rounded-lg p-4",children:[e.jsxs("div",{className:"flex items-center gap-2 mb-3",children:[e.jsx(T,{className:"w-5 h-5 text-teal-400"}),e.jsx("h3",{className:"text-white font-semibold",children:"Location Information"})]}),m==="requesting"&&e.jsxs("div",{className:"flex items-center gap-3 text-teal-300",children:[e.jsx(B,{className:"w-5 h-5 animate-spin"}),e.jsx("span",{children:"Detecting your location..."})]}),m==="success"&&s&&e.jsxs("div",{className:"space-y-3",children:[e.jsxs("div",{className:"flex items-start gap-2 text-green-400 mb-2",children:[e.jsx(M,{className:"w-5 h-5 flex-shrink-0 mt-0.5"}),e.jsxs("div",{children:[e.jsx("p",{className:"font-medium",children:"Location detected successfully!"}),e.jsx("p",{className:"text-sm text-teal-300 mt-1",children:U(s)})]})]}),e.jsxs("div",{className:"grid grid-cols-2 gap-3 text-sm",children:[s.country&&e.jsxs("div",{children:[e.jsx("label",{className:"text-white/70 block mb-1",children:"Country"}),e.jsx("div",{className:"bg-white/5 px-3 py-2 rounded text-white border border-white/10",children:s.country})]}),s.state&&e.jsxs("div",{children:[e.jsx("label",{className:"text-white/70 block mb-1",children:"State"}),e.jsx("div",{className:"bg-white/5 px-3 py-2 rounded text-white border border-white/10",children:s.state})]}),s.district&&e.jsxs("div",{children:[e.jsx("label",{className:"text-white/70 block mb-1",children:"District"}),e.jsx("div",{className:"bg-white/5 px-3 py-2 rounded text-white border border-white/10",children:s.district})]}),s.city_town&&e.jsxs("div",{children:[e.jsx("label",{className:"text-white/70 block mb-1",children:"City/Town"}),e.jsx("div",{className:"bg-white/5 px-3 py-2 rounded text-white border border-white/10",children:s.city_town})]})]}),s.location_accuracy&&e.jsxs("p",{className:"text-xs text-teal-400 flex items-center gap-1 mt-2",children:[e.jsx(y,{className:"w-3 h-3"}),"GPS Accuracy: ±",Math.round(s.location_accuracy),"m"]})]}),(m==="error"||m==="denied")&&e.jsxs("div",{className:"space-y-3",children:[e.jsx("div",{className:"p-3 bg-orange-500/10 border border-orange-500/30 rounded text-orange-300 text-sm",children:E}),e.jsxs("button",{type:"button",onClick:j,className:"w-full py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-colors flex items-center justify-center gap-2",children:[e.jsx(y,{className:"w-4 h-4"}),"Try Again"]})]})]})}),w&&e.jsx("div",{className:"p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm",children:w}),e.jsx("button",{type:"submit",disabled:g||!C(),className:"w-full py-3 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-teal-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed",children:g?i("common.loading"):"Create Account"})]}),!!0,e.jsx("div",{className:"mt-6 text-center",children:e.jsxs("p",{className:"text-white/70",children:[i("auth.alreadyRegistered")," ",e.jsx("a",{href:"/login",className:"text-teal-300 hover:text-teal-200 font-semibold transition-colors",children:i("auth.loginHere")})]})})]})}),e.jsx("style",{children:`
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
      `})]})};export{ae as Register};
