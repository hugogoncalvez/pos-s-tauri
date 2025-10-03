import{E as Y,z as Z,r as m,F as ee,_ as se,H as P,j as e,J as ae,K as re,N as oe,d as te,a as ne,a1 as ie,D as B,B as E,T as w,I as F,g as U,C as O,s as H,P as M,G as y,a0 as N,k as L,l as k,w as le,e as ce,S as de,q as pe,h as R,i as me,p as xe,a4 as C,x as T}from"./index-C4A7YWMW.js";import{d as he}from"./Close-C6Pm4Hrr.js";import{T as z,a as V,c as v,d as l}from"./TableRow-BsCYnncP.js";import{T as q}from"./TableBody-Bv-WiDt9.js";import{D as ue}from"./Divider-DlgemNlS.js";import{M as W}from"./EnhancedTable-BX9li6wm.js";function ge(s){return Y("MuiCardActions",s)}Z("MuiCardActions",["root","spacing"]);const fe=["disableSpacing","className"],je=s=>{const{classes:r,disableSpacing:o}=s;return oe({root:["root",!o&&"spacing"]},ge,r)},be=ae("div",{name:"MuiCardActions",slot:"Root",overridesResolver:(s,r)=>{const{ownerState:o}=s;return[r.root,!o.disableSpacing&&r.spacing]}})(({ownerState:s})=>P({display:"flex",alignItems:"center",padding:8},!s.disableSpacing&&{"& > :not(style) ~ :not(style)":{marginLeft:8}})),$e=m.forwardRef(function(r,o){const d=ee({props:r,name:"MuiCardActions"}),{disableSpacing:g=!1,className:p}=d,t=se(d,fe),a=P({},d,{disableSpacing:g}),n=je(a);return e.jsx(be,P({className:re(n.root,p),ownerState:a,ref:o},t))}),Ee=te(e.jsx("path",{d:"M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2zm-9-2h10V8H12zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5"}),"AccountBalanceWallet"),ke=({open:s,onClose:r,selectedSession:o,handleInitiateClosure:d,getUserName:g})=>{const p=ne(),[t,a]=m.useState(null),[n,c]=m.useState(!1),[u,x]=m.useState(""),[h,j]=m.useState(""),[S,A]=m.useState("");m.useEffect(()=>{s&&o&&(async()=>{var b,_;c(!0),x(""),a(null);try{const{data:$}=await le.get(`/cash-sessions/${o.id}/summary-for-close`);a($)}catch($){x(((_=(b=$.response)==null?void 0:b.data)==null?void 0:_.message)||"Error al cargar el resumen de la caja.")}c(!1)})()},[s,o]);const{expectedCash:I,cashSales:G,totalIncome:J,totalExpense:K}=m.useMemo(()=>{if(!t)return{expectedCash:0,cashSales:0,totalIncome:0,totalExpense:0};const i=t.sales_by_method.Efectivo||0,b=t.totalIncome||0,_=t.totalExpense||0;return{expectedCash:(t.opening_amount||0)+i+b-_,cashSales:i,totalIncome:b,totalExpense:_}},[t]),D=m.useMemo(()=>h===""||isNaN(parseFloat(h))?null:parseFloat(h)-I,[h,I]),Q=()=>{d(h,S,()=>{j(""),A(""),a(null)})},f=i=>new Intl.NumberFormat("es-AR",{style:"currency",currency:"ARS"}).format(i),X=i=>i===null||i===0?"text.primary":i>0?"success.main":"error.main";return e.jsxs(ie,{open:s,onClose:r,PaperProps:{sx:{width:"clamp(400px, 80vw, 600px)",margin:"auto"}},children:[e.jsxs(B,{sx:{display:"flex",justifyContent:"space-between",alignItems:"center",backgroundColor:"background.dialog",color:"text.primary"},children:[e.jsxs(E,{children:["Arqueo y Cierre de Caja",o&&e.jsxs(w,{variant:"caption",display:"block",children:["Usuario: ",g(o)]})]}),e.jsx(F,{onClick:r,children:e.jsx(he,{color:"error"})})]}),e.jsxs(U,{sx:{bgcolor:"background.default",p:{xs:1,sm:2}},children:[n&&e.jsx(E,{sx:{display:"flex",justifyContent:"center",my:3},children:e.jsx(O,{})}),u&&e.jsx(H,{severity:"error",sx:{my:2},children:u}),t&&e.jsxs(E,{sx:{mt:2},children:[e.jsx(w,{variant:"h6",gutterBottom:!0,children:"Resumen del Sistema"}),e.jsx(z,{component:M,sx:{mb:3},children:e.jsx(V,{size:"small",children:e.jsxs(q,{children:[e.jsxs(v,{children:[e.jsx(l,{children:"Monto Inicial"}),e.jsx(l,{align:"right",children:f(t.opening_amount)})]}),e.jsxs(v,{children:[e.jsx(l,{children:"Ventas en Efectivo"}),e.jsx(l,{align:"right",children:f(G)})]}),e.jsxs(v,{children:[e.jsx(l,{children:"Total Ingresos"}),e.jsx(l,{align:"right",children:f(J)})]}),e.jsxs(v,{children:[e.jsx(l,{children:"Total Egresos"}),e.jsx(l,{align:"right",children:f(K)})]}),e.jsxs(v,{sx:{bgcolor:p.palette.action.hover},children:[e.jsx(l,{children:e.jsx("b",{children:"Monto Esperado en Caja"})}),e.jsx(l,{align:"right",children:e.jsx("b",{children:f(I)})})]})]})})}),e.jsx(w,{variant:"h6",gutterBottom:!0,children:"Desglose de Pagos Registrados"}),e.jsx(z,{component:M,sx:{mb:3},children:e.jsx(V,{size:"small",children:e.jsxs(q,{children:[Object.entries(t.sales_by_method).map(([i,b])=>e.jsxs(v,{children:[e.jsx(l,{children:i}),e.jsx(l,{align:"right",children:f(b)})]},i)),e.jsxs(v,{sx:{bgcolor:p.palette.action.hover},children:[e.jsx(l,{children:e.jsx("b",{children:"Total de Ventas"})}),e.jsx(l,{align:"right",children:e.jsx("b",{children:f(t.total_sales)})})]})]})})}),e.jsx(ue,{sx:{my:2}}),e.jsxs(y,{container:!0,spacing:2,alignItems:"center",justifyContent:"center",children:[e.jsx(y,{item:!0,xs:12,sm:6,children:e.jsx(N,{fullWidth:!0,label:"Dinero Contado en Caja",type:"number",value:h,onChange:i=>j(i.target.value),required:!0,autoFocus:!0,InputProps:{sx:{fontSize:"1.2rem"}}})}),e.jsx(y,{item:!0,xs:12,sm:6,children:e.jsxs(M,{elevation:2,sx:{p:2,textAlign:"center"},children:[e.jsx(w,{variant:"body1",children:"Diferencia (Sobrante/Faltante)"}),e.jsx(w,{variant:"h5",sx:{color:X(D),fontWeight:"bold"},children:D!==null?f(D):"-"})]})})]}),e.jsx(N,{fullWidth:!0,label:"Notas (opcional)",multiline:!0,rows:2,value:S,onChange:i=>A(i.target.value),placeholder:"Observaciones sobre el cierre...",sx:{mt:3}})]})]}),e.jsxs(L,{sx:{p:2,justifyContent:"center",gap:2},children:[e.jsx(k,{color:"secondary",onClick:r,variant:"outlined",sx:{padding:"2px 12px"},children:"Cancelar"}),e.jsx(k,{onClick:Q,variant:"contained",color:"primary",disabled:n||!t||h==="",children:"Enviar para Revisión"})]})]})},ve=({open:s,onClose:r,onSave:o,activeSessionId:d,userName:g,isSaving:p})=>{const[t,a,n]=ce({amount:"",type:"ingreso",description:""}),{amount:c,type:u,description:x}=t,[h,j]=m.useState("");m.useEffect(()=>{s&&(n(),j(""))},[s,n]);const S=()=>{if(!p){if(!c||isNaN(parseFloat(c))||parseFloat(c)<=0){j("Por favor, ingrese un monto válido y mayor que cero.");return}if(!x.trim()){j("Por favor, ingrese una descripción para el movimiento.");return}j(""),o({cash_session_id:d,amount:parseFloat(c),type:u,description:x.trim()})}};return e.jsxs(de,{open:s,onClose:r,PaperProps:{sx:{width:"clamp(400px, 70vw, 550px)",margin:"auto"}},children:[e.jsxs(B,{sx:{display:"flex",justifyContent:"space-between",alignItems:"center",backgroundColor:"background.dialog"},children:["Registrar Movimiento de Caja",e.jsx(F,{onClick:r,sx:{color:"error.main"},children:e.jsx(pe,{})})]}),e.jsx(U,{sx:{backgroundColor:"background.dialog"},children:e.jsxs(E,{sx:{p:2},children:[h&&e.jsx(H,{severity:"error",sx:{mb:2},children:h}),e.jsxs(w,{variant:"body2",color:"textSecondary",sx:{mb:2,textAlign:"center"},children:["Usuario: ",e.jsx("strong",{children:g})," | ID de Sesión: ",e.jsx("strong",{children:d})]}),e.jsxs(y,{container:!0,spacing:2,justifyContent:"center",children:[e.jsx(y,{item:!0,xs:12,sm:6,children:e.jsx(R,{label:"Monto",type:"number",name:"amount",fullWidth:!0,value:c,onChange:a,variant:"outlined",inputProps:{step:"0.01"},sx:{width:"clamp(150px, 100%, 300px)"},InputProps:{startAdornment:e.jsx(me,{position:"start",children:e.jsx(F,{onClick:()=>n("amount"),size:"small",children:e.jsx(xe,{color:"error"})})})}})}),e.jsx(y,{item:!0,xs:12,sm:6,children:e.jsxs(R,{select:!0,label:"Tipo de Movimiento",name:"type",value:u,onChange:a,fullWidth:!0,variant:"outlined",sx:{width:"clamp(150px, 100%, 300px)"},children:[e.jsx(W,{value:"ingreso",children:"Ingreso"}),e.jsx(W,{value:"egreso",children:"Egreso"})]})}),e.jsx(y,{item:!0,xs:12,children:e.jsx(R,{label:"Descripción",name:"description",fullWidth:!0,multiline:!0,rows:3,value:x,onChange:a,variant:"outlined",sx:{width:"clamp(300px, 100%, 600px)"}})})]})]})}),e.jsxs(L,{sx:{p:2,borderTop:A=>`1px solid ${A.palette.divider}`,backgroundColor:"background.dialog"},children:[e.jsx(k,{variant:"outlined",onClick:r,disabled:p,children:"Cancelar"}),e.jsx(k,{onClick:S,color:"primary",variant:"contained",disabled:p,children:p?e.jsx(O,{size:24,color:"inherit"}):"Guardar Movimiento"})]})]})};ve.propTypes={open:C.bool.isRequired,onClose:C.func.isRequired,onSave:C.func.isRequired,activeSessionId:C.number,userName:C.string,isSaving:C.bool};const Ie=(s,{formatCurrency:r,formatDate:o,getUserName:d})=>{const g=(n,c)=>{const u=parseFloat(c);if(isNaN(u))return"";let x="#333";return u>0&&(x="#27ae60"),u<0&&(x="#c0392b"),`
            <div class="info-row total">
                <span>${n}:</span>
                <span style="color: ${x}; font-weight: bold;">${r(c)}</span>
            </div>
        `},p=s.payment_methods&&Object.keys(s.payment_methods).length>0?`
    <div class="section">
        <h2>Desglose de Ventas por Método de Pago</h2>
        <div class="info-grid">
        ${Object.entries(s.payment_methods).map(([n,c])=>`
            <div class="info-row">
                <span>${n}:</span>
                <span>${r(c)}</span>
            </div>
        `).join("")}
        </div>
    </div>
    `:"",t=`
        <html>
        <head>
            <title>Reporte de Cierre de Caja - Sesión #${s.id}</title>
            <style>
                @page {
                    size: A4;
                    margin: 0;
                }
                @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
                body { 
                    font-family: 'Roboto', sans-serif;
                    margin: 0;
                    padding: 15px;
                    background-color: #fff; /* Fondo blanco para impresión */
                    color: #333;
                    -webkit-print-color-adjust: exact; /* Para que los colores se impriman en Chrome */
                    color-adjust: exact; /* Estándar */
                }
                .container {
                    max-width: 800px;
                    margin: auto;
                    padding: 25px;
                    border: 1px solid #dee2e6;
                    background-color: #fff;
                    box-shadow: none; /* Quitar sombra para impresión */
                }
                .header { 
                    text-align: center; 
                    margin-bottom: 25px;
                    border-bottom: 2px solid #e9ecef;
                    padding-bottom: 20px;
                }
                .header h1 {
                    margin: 0;
                    color: #212529;
                    font-size: 2em;
                    font-weight: 700;
                }
                .header p {
                    margin: 5px 0;
                    color: #6c757d;
                    font-size: 0.9em;
                }
                .section { 
                    margin-bottom: 25px;
                }
                .section h2 {
                    border-bottom: 1px solid #ced4da;
                    padding-bottom: 10px;
                    margin-bottom: 15px;
                    color: #495057;
                    font-size: 1.4em;
                    font-weight: 500;
                }
                .info-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px 24px;
                }
                .info-row { 
                    display: flex; 
                    justify-content: space-between; 
                    align-items: center;
                    padding: 10px 0;
                    border-bottom: 1px solid #f1f3f5;
                    font-size: 0.95em;
                }
                .info-row:last-child {
                    border-bottom: none;
                }
                .info-row span:first-child {
                    color: #495057;
                }
                .info-row span:last-child {
                    font-weight: 500;
                    color: #212529;
                }
                .total { 
                    font-size: 1.05em;
                }
                .notes-section {
                    background-color: #fffbe6;
                    border-left: 5px solid #fcc419;
                    padding: 15px 20px;
                    margin-top: 25px;
                    border-radius: 4px;
                }
                .notes-section h3 {
                    margin-top: 0;
                    color: #fab005;
                    font-size: 1.2em;
                }
                .notes-section p {
                    margin: 8px 0;
                }
                hr.solid {
                    border: none;
                    border-top: 1px solid #dee2e6;
                    margin: 15px 0;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Reporte de Cierre de Caja</h1>
                    <p>ID de Sesión: #${s.id}</p>
                    <p>Fecha de Impresión: ${new Date().toLocaleString("es-AR")}</p>
                </div>
                
                <div class="section">
                    <h2>Detalles de la Sesión</h2>
                    <div class="info-grid">
                        <div class="info-row"><span>Cajero:</span> <span>${d(s)}</span></div>
                        <div class="info-row"><span>Estado:</span> <span>${s.status.replace(/_/g," ")}</span></div>
                        <div class="info-row"><span>Apertura:</span> <span>${o(s.opened_at)}</span></div>
                        <div class="info-row"><span>Cierre:</span> <span>${s.verified_at?o(s.verified_at):s.closed_at?o(s.closed_at):"N/A"}</span></div>
                    </div>
                </div>

                ${p}

                <div class="section">
                    <h2>Resumen Financiero</h2>
                    <div class="info-row"><span>Monto de Apertura:</span> <span>${r(s.opening_amount)}</span></div>
                    <div class="info-row"><span>Ventas del Sistema (al cierre):</span> <span>${r(s.total_sales_at_close)}</span></div>
                    <div class="info-row total"><span>Monto Esperado (Sistema):</span> <span>${r(s.expected_cash)}</span></div>
                    <hr class="solid">
                    <div class="info-row"><span>Monto Declarado (Cajero):</span> <span>${r(s.cashier_declared_amount)}</span></div>
                    ${g("Diferencia Preliminar",s.preliminary_discrepancy)}
                    <hr class="solid">
                    <div class="info-row"><span>Monto Verificado (Admin):</span> <span>${r(s.admin_verified_amount)}</span></div>
                    ${g("Diferencia Final",s.final_discrepancy)}
                </div>

                ${s.notes||s.admin_notes?`
                <div class="section notes-section">
                    <h3>Observaciones</h3>
                    ${s.notes?`<p><strong>Cajero:</strong> ${s.notes.replace(/\n\nVerificación Admin:.*$/,"").trim()}</p>`:""}
                    ${s.admin_notes?`<p><strong>Administrador:</strong> ${s.admin_notes}</p>`:""}
                </div>
                `:""}
            </div>
        </body>
        </html>
    `,a=window.open("","_blank","width=800,height=600,scrollbars=yes,resizable=yes");a?(a.document.write(t),a.document.close(),a.focus(),a.onload=()=>{setTimeout(()=>{try{a.focus(),a.print(),a.close()}catch(n){console.error("Error al imprimir:",n),T.fire("Error","No se pudo completar la impresión.","error"),a.close()}},50)},setTimeout(()=>{if(!a.closed)try{a.print(),a.close()}catch(n){console.error("Error al imprimir (fallback):",n),T.fire("Error","No se pudo completar la impresión (fallback).","error"),a.close()}},1e3)):T.fire("Error de Pop-up","El navegador bloqueó la ventana de impresión. Por favor, habilita los pop-ups para este sitio.","error")};export{Ee as C,$e as a,ke as b,ve as c,Ie as p};
