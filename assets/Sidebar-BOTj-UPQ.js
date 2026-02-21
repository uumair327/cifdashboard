import{j as e,t as o,V as d,n as x,p as c,q as u,s as m,v as p,a as b,w as h,W as f}from"./vendor-VhFNdCEW.js";const l=({name:t,path:a,icon:n,badge:r})=>{const s=b().pathname===a,i=e.jsxs(e.Fragment,{children:[e.jsx("span",{className:`
        flex-shrink-0 w-5 h-5 transition-colors duration-200
        ${s?"text-blue-600 dark:text-blue-400":"text-slate-500 dark:text-slate-400"}
      `,children:n}),e.jsx("span",{className:`
        flex-1 text-sm font-medium transition-colors duration-200
        ${s?"text-slate-900 dark:text-white":"text-slate-700 dark:text-slate-300"}
      `,children:t}),r&&e.jsx("span",{className:"flex-shrink-0 px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300",children:r}),s?e.jsx("span",{className:"flex-shrink-0 w-1 h-6 bg-blue-600 dark:bg-blue-400 rounded-full"}):e.jsx(f,{className:"flex-shrink-0 w-4 h-4 text-slate-400 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200"})]});return e.jsx(h,{to:a,className:`
        group
        w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
        transition-all duration-200 ease-in-out
        ${s?"bg-blue-50 dark:bg-blue-950/30 border-l-2 border-blue-600 dark:border-blue-400":"hover:bg-slate-100 dark:hover:bg-slate-800/50 border-l-2 border-transparent"}
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900
        active:scale-[0.98]
      `,"aria-current":s?"page":void 0,children:i})},k=()=>{const t=[{name:"Overview",path:"/",icon:e.jsx(d,{})},{name:"Carousel Items",path:"/carousel-items",icon:e.jsx(x,{})},{name:"Home Images",path:"/home-images",icon:e.jsx(c,{})},{name:"Forum",path:"/forum",icon:e.jsx(u,{})},{name:"Learn",path:"/learn",icon:e.jsx(m,{})},{name:"Quizzes",path:"/quizes",icon:e.jsx(o,{})},{name:"Videos",path:"/videos",icon:e.jsx(p,{})}];return e.jsxs("nav",{className:"flex flex-col h-full","aria-label":"Main navigation",children:[e.jsx("div",{className:"px-3 py-4 border-b border-slate-200 dark:border-slate-800",children:e.jsx("h2",{className:"text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider",children:"Navigation"})}),e.jsxs("div",{className:"flex-1 overflow-y-auto py-4 px-2 space-y-1",children:[t.map(a=>e.jsx(l,{...a},a.path)),e.jsx("div",{className:"my-4 border-t border-slate-200 dark:border-slate-800"}),e.jsx(l,{name:"Quiz Manager",path:"/quiz-manager",icon:e.jsx(o,{})})]}),e.jsx("div",{className:"px-3 py-4 border-t border-slate-200 dark:border-slate-800",children:e.jsx("p",{className:"text-xs text-slate-500 dark:text-slate-400 text-center",children:"CIF Guardian Care v1.0"})})]})};export{k as default};
