const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/page-admin-DgYsNXAM.js","assets/vendor-react-CsWuKxj5.js","assets/vendor-other-D2N4SXMU.js","assets/vendor-three-WWH58ZbN.js","assets/vendor-i18n-CPrbmvBl.js","assets/vendor-react-CI4oKIB7.css","assets/vendor-supabase-D4rA0elu.js"])))=>i.map(i=>d[i]);
import{_ as F}from"./vendor-supabase-D4rA0elu.js";import{r as o,j as s,X as I,ae as N,af as $}from"./vendor-react-CsWuKxj5.js";import{s as E}from"./page-admin-DgYsNXAM.js";import{a as H}from"./index-DwrExZEh.js";import"./vendor-other-D2N4SXMU.js";import"./vendor-three-WWH58ZbN.js";import"./vendor-i18n-CPrbmvBl.js";const R=(g,f,d=new Date)=>{const i=new Date(g),u=f?new Date(f):d,r=new Date(d);r.setHours(0,0,0,0);const m=new Date(r);m.setHours(23,59,59,999);const x=Math.max(i.getTime(),r.getTime()),w=Math.min(u.getTime(),m.getTime()),y=Math.max(0,w-x);return Math.floor(y/1e3)},U=()=>{const{items:g,loading:f,error:d}=H(),i=o.useRef(),u=o.useRef(null),[r,m]=o.useState({width:600,height:600}),[x,w]=o.useState({}),[y,D]=o.useState(2.5),[p,L]=o.useState(!1),[l,M]=o.useState(!1),[_,S]=o.useState("night");o.useEffect(()=>{const e=()=>{if(p)m({width:window.innerWidth,height:window.innerHeight});else{const t=Math.min(window.innerWidth-40,800),n=Math.min(window.innerHeight*.5,600);m({width:t,height:n})}};return e(),window.addEventListener("resize",e),()=>window.removeEventListener("resize",e)},[p]),o.useEffect(()=>{const e=()=>{L(!!document.fullscreenElement)};return document.addEventListener("fullscreenchange",e),()=>document.removeEventListener("fullscreenchange",e)},[]);const z=async()=>{if(u.current)try{document.fullscreenElement?await document.exitFullscreen():await u.current.requestFullscreen()}catch{}};o.useEffect(()=>{if(i.current){const e=i.current.controls();e.autoRotate=!1,e.enableZoom=l,e.enableRotate=l,e.enablePan=l,e.addEventListener("change",()=>{const t=i.current.camera();if(t&&t.position){const n=t.position.length();D(n)}}),i.current.pointOfView({lat:20,lng:78,altitude:2.5},1e3)}},[l]),o.useEffect(()=>{const e=async()=>{const{supabase:n}=await F(async()=>{const{supabase:c}=await import("./page-admin-DgYsNXAM.js").then(h=>h.a);return{supabase:c}},__vite__mapDeps([0,1,2,3,4,5,6])),{data:b}=await n.from("meditation_sessions").select("id, name, start_time, end_time, is_active");if(b){const c={},h=new Map;b.forEach(a=>{h.set(a.id,a)});const v=new Date;h.forEach(a=>{const j=a.name||"Anonymous",T=R(a.start_time,a.end_time,v);c[j]=(c[j]||0)+T}),w(c)}};e();const t=setInterval(e,3e4);return()=>clearInterval(t)},[g]),o.useEffect(()=>{(async()=>{const{data:n}=await E.from("settings").select("value").eq("key","globe_day_night_mode").maybeSingle();n&&S(n.value)})();const t=E.channel("globe-mode-updates").on("postgres_changes",{event:"*",schema:"public",table:"settings",filter:"key=eq.globe_day_night_mode"},n=>{n.new&&typeof n.new=="object"&&"value"in n.new&&S(n.new.value)}).subscribe();return()=>{E.removeChannel(t)}},[]);const k=g.map(e=>({lat:e.lat,lng:e.lon,name:e.name,location:[e.city,e.country].filter(Boolean).join(", ")||"Unknown",startTime:e.started_at,todayDuration:x[e.name]||0}));return f?s.jsx("div",{className:"flex items-center justify-center",style:{height:r.height},children:s.jsx("div",{className:"text-teal-300 animate-pulse",children:"Loading globe..."})}):d?s.jsx("div",{className:"flex items-center justify-center",style:{height:r.height},children:s.jsxs("div",{className:"text-red-400",children:["Error loading meditators: ",d]})}):s.jsxs("div",{ref:u,className:`relative flex justify-center items-center transition-all duration-300 ${p?"bg-gradient-to-br from-blue-900 via-teal-800 to-emerald-900":""}`,onMouseEnter:()=>M(!0),onMouseLeave:()=>M(!1),onWheel:e=>{l&&e.stopPropagation()},style:{cursor:l?"grab":"default",pointerEvents:l?"auto":"none"},children:[s.jsx("button",{onClick:z,className:"absolute top-4 left-4 z-20 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full p-3 transition-all duration-300 group",title:p?"Exit Fullscreen":"Enter Fullscreen",style:{pointerEvents:"auto"},children:p?s.jsx(I,{className:"w-5 h-5 text-white group-hover:scale-110 transition-transform"}):s.jsx(N,{className:"w-5 h-5 text-white group-hover:scale-110 transition-transform"})}),s.jsx($,{ref:i,width:r.width,height:r.height,backgroundColor:_==="day"?"rgba(160, 216, 239, 0.3)":"rgba(0, 0, 32, 0.3)",globeImageUrl:_==="day"?"https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg":"https://unpkg.com/three-globe/example/img/earth-night.jpg",bumpImageUrl:"https://unpkg.com/three-globe/example/img/earth-topology.png",htmlElementsData:k,htmlElement:e=>{const t=document.createElement("div"),n=Math.floor(e.todayDuration/60),b=e.todayDuration%60,c=`${n}m ${b}s`,v=Math.min(y/2.5,1.5);return t.innerHTML=`
            <div style="
              position: relative;
              width: 32px;
              height: 32px;
              cursor: pointer;
              transform-origin: center center;
              transform: scale(${1/v});
            ">
              <div style="
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 50px;
                height: 50px;
                animation: golden-ripple 2.5s ease-out infinite;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
              ">
                <img
                  src="/yogi1.png"
                  alt="Meditator"
                  style="
                    width: 36px;
                    height: 36px;
                    object-fit: contain;
                    filter: drop-shadow(0 0 12px rgba(251, 191, 36, 1))
                           drop-shadow(0 0 8px rgba(251, 191, 36, 0.8))
                           drop-shadow(0 0 20px rgba(251, 191, 36, 0.6))
                           drop-shadow(0 0 30px rgba(251, 191, 36, 0.4));
                  "
                />
              </div>
              <div style="
                position: absolute;
                top: -65px;
                left: 50%;
                transform: translateX(-50%) scale(${v});
                background: linear-gradient(135deg, rgba(251, 191, 36, 0.95), rgba(245, 158, 11, 0.95));
                padding: 8px 12px;
                border-radius: 8px;
                white-space: nowrap;
                font-size: 12px;
                color: white;
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.3s, transform 0.3s;
                z-index: 1000;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                border: 1px solid rgba(251, 191, 36, 0.5);
              " class="meditator-tooltip">
                <div style="font-weight: bold; margin-bottom: 4px;">${e.name||"Anonymous"}</div>
                <div style="font-size: 11px; opacity: 0.9; margin-bottom: 4px;">${e.location}</div>
                <div style="font-size: 10px; background: rgba(0, 0, 0, 0.3); padding: 3px 6px; border-radius: 4px; text-align: center;">
                  Today: <span style="font-weight: bold;">${c}</span>
                </div>
              </div>
            </div>
          `,t.addEventListener("mouseenter",()=>{const a=t.querySelector(".meditator-tooltip");a&&(a.style.opacity="1",a.style.transform="translateX(-50%) translateY(-5px)")}),t.addEventListener("mouseleave",()=>{const a=t.querySelector(".meditator-tooltip");a&&(a.style.opacity="0",a.style.transform="translateX(-50%) translateY(0)")}),t},atmosphereColor:"#a855f7",atmosphereAltitude:.15,animateIn:!0})]})};export{U as MeditationGlobe};
