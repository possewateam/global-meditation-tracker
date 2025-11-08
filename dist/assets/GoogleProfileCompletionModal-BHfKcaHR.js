import{u as A,r as i,j as e,a1 as C,N as B,a6 as I,a7 as T,G as $,a9 as z,c as K,aa as S}from"./vendor-react-CsWuKxj5.js";import{r as R}from"./location-C0cwv-Fe.js";import{r as Y,f as U}from"./geocoding-CM-iX_7u.js";import"./vendor-other-D2N4SXMU.js";import"./vendor-three-WWH58ZbN.js";import"./vendor-i18n-CPrbmvBl.js";const X=({isOpen:p,userName:b,userEmail:E,onComplete:P})=>{const{t:d}=A(),[a,m]=i.useState({name:b,bk_centre_name:"",mobile_e164:""}),[o,D]=i.useState({}),[u,c]=i.useState("idle"),[q,h]=i.useState(""),[f,x]=i.useState(!1),[j,N]=i.useState(""),[n,l]=i.useState({name:"",mobile_e164:"",bk_centre_name:""});i.useEffect(()=>{p&&(m(t=>({...t,name:b})),_())},[p,b]);const _=async()=>{c("requesting"),h("");try{const t=await R(),r=await Y(t.latitude,t.longitude);if(r.success){const s={...r,latitude:t.latitude,longitude:t.longitude,location_source:"gps",address_source:"gps_geocoded",location_accuracy:t.accuracy};D(s),c("success")}else h(r.error||"Failed to get address from location"),c("error")}catch(t){t.code==="PERMISSION_DENIED"?(c("denied"),h("Location permission denied. You can enter your location manually.")):(c("error"),h("Unable to get location. You can enter it manually."))}},g=t=>t?/^[A-Za-z ]+$/.test(t)?"":"Name should only contain letters and spaces":"Name is required",w=t=>t?"":"BK Centre Name is required",y=t=>t?t.replace(/\D/g,"").length<10?"Please enter a valid 10-digit mobile number":"":"Mobile number is required",L=()=>a.name&&a.bk_centre_name&&a.mobile_e164&&!n.name&&!n.mobile_e164&&!n.bk_centre_name,F=t=>{const r=t.startsWith("+")?t:`+${t}`;m(s=>({...s,mobile_e164:r})),l(s=>({...s,mobile_e164:y(t)}))},G=async t=>{t.preventDefault(),N(""),x(!0);const r=g(a.name),s=w(a.bk_centre_name),v=y(a.mobile_e164);if(r||s||v){l({name:r,bk_centre_name:s,mobile_e164:v}),x(!1);return}const M={name:a.name,bk_centre_name:a.bk_centre_name,mobile_e164:a.mobile_e164,...o},k=await P(M);k.success||(N(k.error||"Failed to complete profile. Please try again."),x(!1))};return p?e.jsxs("div",{className:"fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50",children:[e.jsxs("div",{className:"bg-gradient-to-br from-blue-900 via-teal-800 to-emerald-900 rounded-2xl p-8 shadow-2xl border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto",children:[e.jsxs("div",{className:"flex items-center justify-center gap-3 mb-6",children:[e.jsx(C,{className:"w-10 h-10 text-teal-300"}),e.jsx("h2",{className:"text-3xl font-bold text-white",children:"Complete Your Profile"})]}),e.jsx("p",{className:"text-teal-200 text-center mb-6",children:"Welcome! Please complete your profile to continue"}),e.jsxs("div",{className:"bg-white/10 backdrop-blur-lg rounded-xl p-4 mb-6 border border-white/20",children:[e.jsx("p",{className:"text-white/70 text-sm mb-1",children:"Signed in with Google"}),e.jsx("p",{className:"text-white font-semibold",children:E})]}),e.jsxs("form",{onSubmit:G,className:"space-y-6",children:[e.jsxs("div",{children:[e.jsxs("label",{className:"flex items-center gap-2 text-white mb-2 font-medium",children:[e.jsx(C,{className:"w-4 h-4"}),d("auth.name")]}),e.jsx("input",{type:"text",value:a.name,onChange:t=>{const r=t.target.value;m({...a,name:r}),l(s=>({...s,name:g(r)}))},onBlur:t=>l(r=>({...r,name:g(t.target.value)})),className:`w-full px-4 py-3 bg-white/10 border ${n.name?"border-red-500":"border-white/20"} rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-teal-400 transition-colors`,placeholder:d("auth.namePlaceholder"),required:!0}),n.name&&e.jsx("p",{className:"text-red-400 text-sm mt-1",children:n.name})]}),e.jsxs("div",{children:[e.jsxs("label",{className:"flex items-center gap-2 text-white mb-2 font-medium",children:[e.jsx(B,{className:"w-4 h-4"}),"BK Centre Name"]}),e.jsx("input",{type:"text",value:a.bk_centre_name,onChange:t=>{const r=t.target.value;m({...a,bk_centre_name:r}),l(s=>({...s,bk_centre_name:w(r)}))},onBlur:t=>l(r=>({...r,bk_centre_name:w(t.target.value)})),className:`w-full px-4 py-3 bg-white/10 border ${n.bk_centre_name?"border-red-500":"border-white/20"} rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-teal-400 transition-colors`,placeholder:"Enter your BK Centre name",required:!0}),n.bk_centre_name&&e.jsx("p",{className:"text-red-400 text-sm mt-1",children:n.bk_centre_name})]}),e.jsxs("div",{children:[e.jsxs("label",{className:"flex items-center gap-2 text-white mb-2 font-medium",children:[e.jsx(I,{className:"w-4 h-4"}),d("auth.mobileNumber")]}),e.jsx("div",{className:"phone-input-wrapper",children:e.jsx(T,{country:"in",value:a.mobile_e164,onChange:F,inputClass:n.mobile_e164?"phone-input-error":"",containerClass:"phone-input-container",buttonClass:"phone-input-button",dropdownClass:"phone-input-dropdown",inputProps:{required:!0,autoFocus:!1},countryCodeEditable:!1,disableDropdown:!1,enableSearch:!0,searchPlaceholder:"Search country"})}),n.mobile_e164&&e.jsx("p",{className:"text-red-400 text-sm mt-1",children:n.mobile_e164})]}),e.jsxs("div",{className:"bg-white/5 border border-white/10 rounded-lg p-4",children:[e.jsxs("div",{className:"flex items-center gap-2 mb-3",children:[e.jsx($,{className:"w-5 h-5 text-teal-400"}),e.jsx("h3",{className:"text-white font-semibold",children:"Location Information"})]}),u==="requesting"&&e.jsxs("div",{className:"flex items-center gap-3 text-teal-300",children:[e.jsx(z,{className:"w-5 h-5 animate-spin"}),e.jsx("span",{children:"Detecting your location..."})]}),u==="success"&&o&&e.jsxs("div",{className:"space-y-3",children:[e.jsxs("div",{className:"flex items-start gap-2 text-green-400 mb-2",children:[e.jsx(K,{className:"w-5 h-5 flex-shrink-0 mt-0.5"}),e.jsxs("div",{children:[e.jsx("p",{className:"font-medium",children:"Location detected successfully!"}),e.jsx("p",{className:"text-sm text-teal-300 mt-1",children:U(o)})]})]}),e.jsxs("div",{className:"grid grid-cols-2 gap-3 text-sm",children:[o.country&&e.jsxs("div",{children:[e.jsx("label",{className:"text-white/70 block mb-1",children:"Country"}),e.jsx("div",{className:"bg-white/5 px-3 py-2 rounded text-white border border-white/10",children:o.country})]}),o.state&&e.jsxs("div",{children:[e.jsx("label",{className:"text-white/70 block mb-1",children:"State"}),e.jsx("div",{className:"bg-white/5 px-3 py-2 rounded text-white border border-white/10",children:o.state})]}),o.district&&e.jsxs("div",{children:[e.jsx("label",{className:"text-white/70 block mb-1",children:"District"}),e.jsx("div",{className:"bg-white/5 px-3 py-2 rounded text-white border border-white/10",children:o.district})]}),o.city_town&&e.jsxs("div",{children:[e.jsx("label",{className:"text-white/70 block mb-1",children:"City/Town"}),e.jsx("div",{className:"bg-white/5 px-3 py-2 rounded text-white border border-white/10",children:o.city_town})]})]}),o.location_accuracy&&e.jsxs("p",{className:"text-xs text-teal-400 flex items-center gap-1 mt-2",children:[e.jsx(S,{className:"w-3 h-3"}),"GPS Accuracy: ±",Math.round(o.location_accuracy),"m"]})]}),(u==="error"||u==="denied")&&e.jsxs("div",{className:"space-y-3",children:[e.jsx("div",{className:"p-3 bg-orange-500/10 border border-orange-500/30 rounded text-orange-300 text-sm",children:q}),e.jsxs("button",{type:"button",onClick:_,className:"w-full py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-colors flex items-center justify-center gap-2",children:[e.jsx(S,{className:"w-4 h-4"}),"Try Again"]})]})]}),j&&e.jsx("div",{className:"p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm",children:j}),e.jsx("button",{type:"submit",disabled:f||!L(),className:"w-full py-3 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-teal-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed",children:f?d("common.loading"):"Complete Profile"})]})]}),e.jsx("style",{children:`
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
      `})]}):null};export{X as GoogleProfileCompletionModal};
