/* @ds-bundle: {"format": 4, "namespace": "Graphite", "components": [{"name": "Button"}, {"name": "IconButton"}, {"name": "Link"}, {"name": "FormField"}, {"name": "TextInput"}, {"name": "Textarea"}, {"name": "SearchInput"}, {"name": "Select"}, {"name": "Checkbox"}, {"name": "Radio"}, {"name": "Toggle"}, {"name": "Tag"}, {"name": "StatusTag"}, {"name": "Tooltip"}, {"name": "Snackbar"}, {"name": "InlineNotification"}, {"name": "Modal"}, {"name": "OverflowMenu"}, {"name": "Tabs"}, {"name": "Breadcrumb"}, {"name": "Accordion"}, {"name": "LanguageSelector"}]} */
(function(){
var React=window.React,h=React.createElement,useState=React.useState,useEffect=React.useEffect,useId=React.useId||function(){var r=React.useRef(null);if(!r.current)r.current='gr'+Math.random().toString(36).slice(2,8);return r.current;};
var ICONS={"checkmark--filled":[["M16,2A14,14,0,1,0,30,16,14,14,0,0,0,16,2ZM14,21.5908l-5-5L10.5906,15,14,18.4092,21.41,11l1.5957,1.5859Z"]],"time--filled":[["m16,2c-7.6001,0-14,6.3999-14,14s6.3999,14,14,14,14-6.3999,14-14S23.6001,2,16,2Zm4.5872,20l-5.5872-5.5898V7h2v8.582l5,5.0044-1.4128,1.4136Z"]],"warning--alt--filled":[["M16,26a1.5,1.5,0,1,1,1.5-1.5A1.5,1.5,0,0,1,16,26Zm-1.125-5h2.25V12h-2.25Z","#161616"],["M16.002,6.1714h-.004L4.6487,27.9966,4.6506,28H27.3494l.0019-.0034ZM14.875,12h2.25v9h-2.25ZM16,26a1.5,1.5,0,1,1,1.5-1.5A1.5,1.5,0,0,1,16,26Z"],["M29,30H3a1,1,0,0,1-.8872-1.4614l13-25a1,1,0,0,1,1.7744,0l13,25A1,1,0,0,1,29,30ZM4.6507,28H27.3493l.002-.0033L16.002,6.1714h-.004L4.6487,27.9967Z"]],"warning--filled":[["M16,2C8.3,2,2,8.3,2,16s6.3,14,14,14s14-6.3,14-14C30,8.3,23.7,2,16,2z M14.9,8h2.2v11h-2.2V8z M16,25 c-0.8,0-1.5-0.7-1.5-1.5S15.2,22,16,22c0.8,0,1.5,0.7,1.5,1.5S16.8,25,16,25z"]],"misuse":[["M16,2C8.3,2,2,8.3,2,16s6.3,14,14,14s14-6.3,14-14S23.7,2,16,2z M21.4,23L16,17.6L10.6,23L9,21.4l5.4-5.4L9,10.6L10.6,9 l5.4,5.4L21.4,9l1.6,1.6L17.6,16l5.4,5.4L21.4,23z"]],"circle-dash":[["M7.7,4.7a14.7,14.7,0,0,0-3,3.1L6.3,9A13.26,13.26,0,0,1,8.9,6.3Z"],["M4.6,12.3l-1.9-.6A12.51,12.51,0,0,0,2,16H4A11.48,11.48,0,0,1,4.6,12.3Z"],["M2.7,20.4a14.4,14.4,0,0,0,2,3.9l1.6-1.2a12.89,12.89,0,0,1-1.7-3.3Z"],["M7.8,27.3a14.4,14.4,0,0,0,3.9,2l.6-1.9A12.89,12.89,0,0,1,9,25.7Z"],["M11.7,2.7l.6,1.9A11.48,11.48,0,0,1,16,4V2A12.51,12.51,0,0,0,11.7,2.7Z"],["M24.2,27.3a15.18,15.18,0,0,0,3.1-3.1L25.7,23A11.53,11.53,0,0,1,23,25.7Z"],["M27.4,19.7l1.9.6A15.47,15.47,0,0,0,30,16H28A11.48,11.48,0,0,1,27.4,19.7Z"],["M29.2,11.6a14.4,14.4,0,0,0-2-3.9L25.6,8.9a12.89,12.89,0,0,1,1.7,3.3Z"],["M24.1,4.6a14.4,14.4,0,0,0-3.9-2l-.6,1.9a12.89,12.89,0,0,1,3.3,1.7Z"],["M20.3,29.3l-.6-1.9A11.48,11.48,0,0,1,16,28v2A21.42,21.42,0,0,0,20.3,29.3Z"]],"information--filled":[["M16,2A14,14,0,1,0,30,16,14,14,0,0,0,16,2Zm0,6a1.5,1.5,0,1,1-1.5,1.5A1.5,1.5,0,0,1,16,8Zm4,16.125H12v-2.25h2.875v-5.75H13v-2.25h4.125v8H20Z"]],"search":[["M29,27.5859l-7.5521-7.5521a11.0177,11.0177,0,1,0-1.4141,1.4141L27.5859,29ZM4,13a9,9,0,1,1,9,9A9.01,9.01,0,0,1,4,13Z"]],"chevron--down":[["M16 22 6 12 7.4 10.6 16 19.2 24.6 10.6 26 12z"]],"close":[["M17.4141 16 24 9.4141 22.5859 8 16 14.5859 9.4143 8 8 9.4141 14.5859 16 8 22.5859 9.4143 24 16 17.4141 22.5859 24 24 22.5859 17.4141 16z"]],"arrow--right":[["M18 6 16.57 7.393 24.15 15 4 15 4 17 24.15 17 16.57 24.573 18 26 28 16 18 6z"]],"add":[["M17 15 17 8 15 8 15 15 8 15 8 17 15 17 15 24 17 24 17 17 24 17 24 15z"]],"view":[["M30.94,15.66A16.69,16.69,0,0,0,16,5,16.69,16.69,0,0,0,1.06,15.66a1,1,0,0,0,0,.68A16.69,16.69,0,0,0,16,27,16.69,16.69,0,0,0,30.94,16.34,1,1,0,0,0,30.94,15.66ZM16,25c-5.3,0-10.9-3.93-12.93-9C5.1,10.93,10.7,7,16,7s10.9,3.93,12.93,9C26.9,21.07,21.3,25,16,25Z"],["M16,10a6,6,0,1,0,6,6A6,6,0,0,0,16,10Zm0,10a4,4,0,1,1,4-4A4,4,0,0,1,16,20Z"]],"view--off":[["M5.24,22.51l1.43-1.42A14.06,14.06,0,0,1,3.07,16C5.1,10.93,10.7,7,16,7a12.38,12.38,0,0,1,4,.72l1.55-1.56A14.72,14.72,0,0,0,16,5,16.69,16.69,0,0,0,1.06,15.66a1,1,0,0,0,0,.68A16,16,0,0,0,5.24,22.51Z"],["M12,15.73a4,4,0,0,1,3.7-3.7l1.81-1.82a6,6,0,0,0-7.33,7.33Z"],["M30.94,15.66A16.4,16.4,0,0,0,25.2,8.22L30,3.41,28.59,2,2,28.59,3.41,30l5.1-5.1A15.29,15.29,0,0,0,16,27,16.69,16.69,0,0,0,30.94,16.34,1,1,0,0,0,30.94,15.66ZM20,16a4,4,0,0,1-6,3.44L19.44,14A4,4,0,0,1,20,16Zm-4,9a13.05,13.05,0,0,1-6-1.58l2.54-2.54a6,6,0,0,0,8.35-8.35l2.87-2.87A14.54,14.54,0,0,1,28.93,16C26.9,21.07,21.3,25,16,25Z"]],"overflow-menu--vertical":[["M14,8a2,2 0 1,0 4,0a2,2 0 1,0 -4,0Z M14,16a2,2 0 1,0 4,0a2,2 0 1,0 -4,0Z M14,24a2,2 0 1,0 4,0a2,2 0 1,0 -4,0Z"]],"earth":[["M16,2A14,14,0,1,0,30,16,14.0158,14.0158,0,0,0,16,2Zm5,3.1055a12.0136,12.0136,0,0,1,2.9158,1.8994L23.5034,8H21ZM13.3784,27.7026A11.9761,11.9761,0,0,1,8.1157,6.9761L9.4648,9h3.3423l-1.5,4H7.2793L5.8967,17.1475,8.4648,21h5l1.4319,2.1475ZM16,28c-.2034,0-.4016-.02-.6025-.03l1.3967-4.19a1.9876,1.9876,0,0,0-.2334-1.7412l-1.4319-2.1475A1.9962,1.9962,0,0,0,13.4648,19h-3.93L8.1033,16.8525,8.7207,15H11v2h2V14.1812l2.9363-7.83-1.8726-.7022L13.5571,7H10.5352L9.728,5.7891A11.7941,11.7941,0,0,1,19,4.395V8a2.0025,2.0025,0,0,0,2,2h2.5857A1.9865,1.9865,0,0,0,25,9.4141l.1406-.1407.2818-.68A11.9813,11.9813,0,0,1,27.3,12H22.5986a1.9927,1.9927,0,0,0-1.9719,1.665L20.03,17.1064a1.99,1.99,0,0,0,.991,2.086l2.1647,1.4638,1.4585,3.646A11.9577,11.9577,0,0,1,16,28Zm8.8145-8.6563L22.1,17.5088l-.1-.06L22.5986,14h5.2207a11.743,11.743,0,0,1-1.7441,8.4951Z"]],"checkmark":[["M13 24 4 15 5.414 13.586 13 21.171 26.586 7.586 28 9 13 24z"]]};
function cx(){var o=[];for(var i=0;i<arguments.length;i++){if(arguments[i])o.push(arguments[i]);}return o.join(' ');}
function omit(p,keys){var o={};for(var k in p){if(keys.indexOf(k)<0)o[k]=p[k];}return o;}
function Icon(p){var d=ICONS[p.name]||[];var s=p.size||16;return h('svg',{width:s,height:s,viewBox:'0 0 32 32',fill:'currentColor','aria-hidden':p.title?undefined:true,role:p.title?'img':undefined,'aria-label':p.title,className:cx('gr-icon',p.className),focusable:'false'},d.map(function(x,i){return h('path',{key:i,d:x[0],fill:x[1]});}));}
function Button(p){var v=p.variant||'primary',sz=p.size||'lg',pos=p.iconPosition||'right';var ic=p.icon?h(Icon,{name:p.icon,size:sz==='sm'?16:20}):null;
 return h('button',Object.assign({type:'button'},omit(p,['variant','size','icon','iconPosition','children','className','fullWidth']),{className:cx('gr-btn','gr-btn--'+v,'gr-btn--'+sz,p.fullWidth&&'gr-btn--full',p.className)}),pos==='left'?ic:null,p.children,pos!=='left'?ic:null);}
function IconButton(p){var v=p.variant||'ghost',sz=p.size||'lg';
 var btn=h('button',Object.assign({type:'button'},omit(p,['variant','size','icon','label','className','tooltip','tooltipPlacement']),{'aria-label':p.label,className:cx('gr-btn','gr-iconbtn','gr-btn--'+v,'gr-btn--'+sz,p.className)}),h(Icon,{name:p.icon,size:20}));
 return p.tooltip===false?btn:h(Tooltip,{label:p.label,placement:p.tooltipPlacement},btn);}
function Link(p){return h('a',Object.assign({href:'#'},omit(p,['inline','weight','className','children']),{className:cx('gr-link',p.inline&&'gr-link--inline',p.weight==='semibold'&&'gr-link--semibold',p.className)}),p.children);}
function FormField(p){var size=p.size||'m',kind=p.kind||'text';var showErr=!!p.error;var msg=showErr?p.error:p.helpText;
 return h('div',{className:cx('gr-field','gr-field--'+kind,'gr-field--'+size,showErr&&'is-error',p.disabled&&'is-disabled',p.className),style:p.width?{width:p.width}:undefined},
  h('div',{className:'gr-field__box'},
   h('div',{className:'gr-field__main'},
    p.label?h('label',{htmlFor:p.id,className:cx('gr-field__label',p.hideLabel&&'gr-sr')},p.label,p.required?h('span',{className:'gr-req','aria-hidden':true},' *'):null):null,
    p.children),
   p.trailing?h('div',{className:'gr-field__trail'},p.trailing):null),
  msg?h('div',{id:p.id+'-msg',className:'gr-field__msg',role:showErr?'alert':undefined},msg):null);}
function useErrorRecovery(error,onChange){var s=useState(false),dirty=s[0],setDirty=s[1];useEffect(function(){setDirty(false);},[error]);
 return {error:dirty?undefined:error,onChange:function(e){if(error)setDirty(true);if(onChange)onChange(e);}};}
var FIELD_KEYS=['id','label','required','helpText','error','size','width','disabled','hideLabel','className','trailing','onChange'];
function TextInput(p){var auto=useId();var id=p.id||auto;var r=useErrorRecovery(p.error,p.onChange);var sv=useState(false),shown=sv[0],setShown=sv[1];
 var isPw=p.type==='password';var trailing=p.trailing;
 if(isPw&&!trailing){trailing=h('button',{type:'button',className:'gr-field__iconbtn','aria-label':shown?'Hide password':'Show password',title:shown?'Hide password':'Show password',onClick:function(){setShown(!shown);}},h(Icon,{name:shown?'view':'view--off',size:20}));}
 var input=h('input',Object.assign({},omit(p,FIELD_KEYS.concat(['type'])),{id:id,type:isPw&&shown?'text':(p.type||'text'),className:'gr-field__input',disabled:p.disabled,required:p.required,'aria-invalid':r.error?true:undefined,'aria-describedby':(r.error||p.helpText)?id+'-msg':undefined,onChange:r.onChange}));
 return h(FormField,{id:id,label:p.label,required:p.required,helpText:p.helpText,error:r.error,size:p.size,width:p.width,disabled:p.disabled,hideLabel:p.hideLabel,className:p.className,trailing:trailing,kind:trailing?'icon':'text'},input);}
function Textarea(p){var auto=useId();var id=p.id||auto;var r=useErrorRecovery(p.error,p.onChange);
 var el=h('textarea',Object.assign({rows:4},omit(p,FIELD_KEYS),{id:id,className:'gr-field__input gr-field__textarea',disabled:p.disabled,required:p.required,'aria-invalid':r.error?true:undefined,'aria-describedby':(r.error||p.helpText)?id+'-msg':undefined,onChange:r.onChange}));
 return h(FormField,{id:id,label:p.label,required:p.required,helpText:p.helpText,error:r.error,size:p.size||'l',width:p.width,disabled:p.disabled,className:p.className,kind:'area'},el);}
function SearchInput(p){return h(TextInput,Object.assign({type:'search',label:'Search',hideLabel:!p.showLabel},omit(p,['showLabel']),{trailing:h('span',{className:'gr-field__deco'},h(Icon,{name:'search',size:20}))}));}
function Select(p){var auto=useId();var id=p.id||auto;var r=useErrorRecovery(p.error,p.onChange);var opts=p.options||[];
 var el=h('select',Object.assign({},omit(p,FIELD_KEYS.concat(['options','placeholder'])),{id:id,className:'gr-field__input gr-field__select',disabled:p.disabled,required:p.required,'aria-invalid':r.error?true:undefined,'aria-describedby':(r.error||p.helpText)?id+'-msg':undefined,onChange:r.onChange,defaultValue:p.value===undefined&&p.defaultValue===undefined&&p.placeholder?'':p.defaultValue}),
  p.placeholder?h('option',{value:'',disabled:true},p.placeholder):null,
  opts.map(function(o){return h('option',{key:o.value,value:o.value},o.label);}));
 return h(FormField,{id:id,label:p.label,required:p.required,helpText:p.helpText,error:r.error,size:p.size,width:p.width,disabled:p.disabled,className:p.className,kind:'select',trailing:h('span',{className:'gr-field__deco'},h(Icon,{name:'chevron--down',size:20}))},el);}
function Choice(type,cls){return function(p){var auto=useId();var id=p.id||auto;
 return h('label',{htmlFor:id,className:cx('gr-choice',p.disabled&&'is-disabled',p.className)},
  h('input',Object.assign({},omit(p,['label','className']),{id:id,type:type==='switch'?'checkbox':type,role:type==='switch'?'switch':undefined,className:cls})),
  p.label?h('span',{className:'gr-choice__label'},p.label):null);};}
var Checkbox=Choice('checkbox','gr-check'),Radio=Choice('radio','gr-radio'),Toggle=Choice('switch','gr-toggle');
function Tag(p){return h('span',{className:cx('gr-tag','gr-tag--'+(p.tone||'neutral'),p.className)},p.children);}
var STATUS={'completed':['Completed','checkmark--filled'],'under-review':['Under Review','time--filled'],'needs-description':['Needs Description','warning--alt--filled'],'missing-info':['Missing Info','warning--filled'],'rejected':['Rejected','misuse'],'draft':['Draft','circle-dash'],'info':['Info','information--filled']};
function StatusTag(p){var st=STATUS[p.status]?p.status:'info';var def=STATUS[st];var label=p.label||def[0];var sz=p.size||'md';
 if(p.compact){return h(Tooltip,{label:label},h('span',{className:cx('gr-status','gr-status--'+st,'gr-status--compact',p.className),role:'img','aria-label':label,tabIndex:0},h(Icon,{name:def[1],size:16})));}
 return h('span',{className:cx('gr-status','gr-status--'+st,'gr-status--'+sz,p.className)},p.showIcon===false?null:h(Icon,{name:def[1],size:16}),h('span',null,label));}

var useRef=React.useRef,useCallback=React.useCallback;
function Tooltip(p){var auto=useId();var s=useState(false),open=s[0],setOpen=s[1];var shown=p.open!==undefined?p.open:open;var id=auto+'-tip';
 var child=React.Children.only(p.children);
 var trig=React.cloneElement(child,{'aria-describedby':shown?id:child.props['aria-describedby']});
 return h('span',{className:cx('gr-tip','gr-tip--'+(p.placement||'top')),onMouseEnter:function(){setOpen(true);},onMouseLeave:function(){setOpen(false);},onFocus:function(){setOpen(true);},onBlur:function(){setOpen(false);},onKeyDown:function(e){if(e.key==='Escape')setOpen(false);}},
  trig,shown?h('span',{id:id,role:'tooltip',className:'gr-tip__bubble'},p.label):null);}
function Snackbar(p){var open=p.open!==false;var dur=p.duration===undefined?5000:p.duration;
 useEffect(function(){if(!open||!dur||!p.onClose)return;var t=setTimeout(p.onClose,dur);return function(){clearTimeout(t);};},[open,dur,p.onClose]);
 if(!open)return null;
 return h('div',{className:cx('gr-snack',p.inline&&'gr-snack--inline',p.className),role:'status','aria-live':'polite'},
  h('span',{className:'gr-snack__msg'},p.message),
  p.action?h('button',{type:'button',className:'gr-snack__action',onClick:p.action.onClick},p.action.label):null,
  p.onClose?h('button',{type:'button',className:'gr-snack__close','aria-label':'Dismiss',onClick:p.onClose},h(Icon,{name:'close',size:20})):null);}
var NOTE_ICON={info:'information--filled',warning:'warning--alt--filled',error:'warning--filled',success:'checkmark--filled'};
function InlineNotification(p){var k=NOTE_ICON[p.kind]?p.kind:'info';
 return h('div',{className:cx('gr-note','gr-note--'+k,p.className),role:p.live?(k==='error'?'alert':'status'):undefined},
  h('span',{className:'gr-note__icon'},h(Icon,{name:NOTE_ICON[k],size:20})),
  h('div',{className:'gr-note__body'},
   p.title?h('div',{className:'gr-note__title'},p.title):null,
   p.children?h('div',{className:'gr-note__text'},p.children):null,
   p.items?h('ul',{className:'gr-note__list'},p.items.map(function(it,i){return h('li',{key:i},h(Icon,{name:NOTE_ICON[k],size:16}),h('span',null,it));})):null,
   p.action?h('div',{className:'gr-note__action'},p.action):null),
  p.onClose?h(IconButton,{icon:'close',label:'Dismiss',size:'md',className:'gr-note__close',onClick:p.onClose}):null);}
var FOCUSABLE='a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
function Modal(p){var ref=useRef(null);var auto=useId();var tid=auto+'-title';
 useEffect(function(){if(!p.open||p.inline)return;var prev=document.activeElement;var el=ref.current;var f=el&&el.querySelectorAll(FOCUSABLE);if(f&&f.length)f[0].focus();var ov=document.body.style.overflow;document.body.style.overflow='hidden';
  return function(){document.body.style.overflow=ov;if(prev&&prev.focus)prev.focus();};},[p.open,p.inline]);
 if(!p.open)return null;
 function onKey(e){if(e.key==='Escape'&&p.onClose){e.stopPropagation();p.onClose();}
  if(e.key==='Tab'){var f=ref.current.querySelectorAll(FOCUSABLE);if(!f.length)return;var a=f[0],z=f[f.length-1];if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus();}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus();}}}
 var pa=p.primaryAction,sa=p.secondaryAction;
 return h('div',{className:cx('gr-modal',p.inline&&'gr-modal--inline'),onMouseDown:function(e){if(e.target===e.currentTarget&&p.onClose&&p.dismissOnOverlay!==false)p.onClose();}},
  h('div',{ref:ref,role:'dialog','aria-modal':true,'aria-labelledby':tid,className:cx('gr-modal__dialog','gr-modal__dialog--'+(p.size||'md')),onKeyDown:onKey},
   h('div',{className:'gr-modal__head'},h('h2',{id:tid,className:'gr-modal__title'},p.title),p.onClose?h(IconButton,{icon:'close',label:'Close',size:'md',tooltip:false,onClick:p.onClose}):null),
   h('div',{className:'gr-modal__body'},p.children),
   (pa||sa)?h('div',{className:'gr-modal__foot'},
    sa?h(Button,{variant:'ghost',onClick:sa.onClick},sa.label):null,
    pa?h(Button,{variant:p.danger?'danger':'primary',onClick:pa.onClick,disabled:pa.disabled},pa.label):null):null));}
function OverflowMenu(p){var s=useState(!!p.defaultOpen),open=s[0],setOpen=s[1];var wrap=useRef(null);var auto=useId();var items=p.items||[];
 useEffect(function(){if(!open)return;function out(e){if(wrap.current&&!wrap.current.contains(e.target))setOpen(false);}document.addEventListener('mousedown',out);return function(){document.removeEventListener('mousedown',out);};},[open]);
 function focusItem(d){var els=[].slice.call(wrap.current.querySelectorAll('.gr-menu__item:not([disabled])'));if(!els.length)return;var i=els.indexOf(document.activeElement);var n=d==='first'?0:d==='last'?els.length-1:(i+d+els.length)%els.length;els[n].focus();}
 function onKey(e){if(e.key==='Escape'){setOpen(false);var b=wrap.current.querySelector('.gr-iconbtn');if(b)b.focus();}else if(e.key==='ArrowDown'){e.preventDefault();focusItem(1);}else if(e.key==='ArrowUp'){e.preventDefault();focusItem(-1);}else if(e.key==='Home'){e.preventDefault();focusItem('first');}else if(e.key==='End'){e.preventDefault();focusItem('last');}}
 return h('div',{ref:wrap,className:cx('gr-overflow','gr-overflow--'+(p.align||'end'),p.className),onKeyDown:onKey},
  h(IconButton,{icon:'overflow-menu--vertical',label:p.label||'More actions',size:p.size||'md',tooltip:!open,'aria-haspopup':'menu','aria-expanded':open,'aria-controls':auto+'-menu',onClick:function(){setOpen(!open);}}),
  open?h('ul',{id:auto+'-menu',role:'menu',className:'gr-menu'},items.map(function(it,i){return h('li',{key:i,role:'none'},h('button',{type:'button',role:'menuitem',disabled:it.disabled,className:cx('gr-menu__item',it.danger&&'gr-menu__item--danger'),onClick:function(){setOpen(false);if(it.onClick)it.onClick();}},it.label));})):null);}
function Tabs(p){var tabs=p.tabs||[];var auto=useId();var s=useState(p.defaultTab||(tabs[0]&&tabs[0].id)),cur=s[0],setCur=s[1];var active=p.value!==undefined?p.value:cur;var listRef=useRef(null);
 function pick(id){if(p.value===undefined)setCur(id);if(p.onChange)p.onChange(id);}
 function onKey(e){var en=tabs.filter(function(t){return !t.disabled;});var i=en.findIndex(function(t){return t.id===active;});var n=null;
  if(e.key==='ArrowRight')n=en[(i+1)%en.length];else if(e.key==='ArrowLeft')n=en[(i-1+en.length)%en.length];else if(e.key==='Home')n=en[0];else if(e.key==='End')n=en[en.length-1];
  if(n){e.preventDefault();pick(n.id);var b=listRef.current.querySelector('[data-tab="'+n.id+'"]');if(b)b.focus();}}
 var at=tabs.filter(function(t){return t.id===active;})[0];
 return h('div',{className:cx('gr-tabs','gr-tabs--'+(p.variant||'line'),p.className)},
  h('div',{ref:listRef,role:'tablist','aria-label':p.label,className:'gr-tabs__list',onKeyDown:onKey},tabs.map(function(t){var sel=t.id===active;
   return h('button',{key:t.id,type:'button',role:'tab',id:auto+'-t-'+t.id,'data-tab':t.id,'aria-selected':sel,'aria-controls':auto+'-p-'+t.id,tabIndex:sel?0:-1,disabled:t.disabled,className:cx('gr-tabs__tab',sel&&'is-selected'),onClick:function(){pick(t.id);}},t.label,t.badge!==undefined?h('span',{className:'gr-tabs__badge'},t.badge):null);})),
  at&&at.content!==undefined?h('div',{role:'tabpanel',id:auto+'-p-'+at.id,'aria-labelledby':auto+'-t-'+at.id,tabIndex:0,className:'gr-tabs__panel'},at.content):null);}
function Breadcrumb(p){var items=p.items||[];
 return h('nav',{'aria-label':p.label||'Breadcrumb',className:cx('gr-crumb',p.className)},h('ol',{className:'gr-crumb__list'},items.map(function(it,i){var last=i===items.length-1;
  return h('li',{key:i,className:'gr-crumb__item'},last?h('span',{'aria-current':'page',className:'gr-crumb__current'},it.label):h(Link,{href:it.href||'#'},it.label),last?null:h('span',{className:'gr-crumb__sep','aria-hidden':true},'/'));})));}
function Accordion(p){var items=p.items||[];var auto=useId();var init={};items.forEach(function(it){if(it.defaultOpen)init[it.id]=true;});var s=useState(init),open=s[0],setOpen=s[1];
 function toggle(id){var n=p.allowMultiple===false?{}:Object.assign({},open);n[id]=!open[id];setOpen(n);}
 return h('div',{className:cx('gr-acc',p.className)},items.map(function(it){var o=!!open[it.id];var hid=auto+'-h-'+it.id,pid=auto+'-p-'+it.id;
  return h('div',{key:it.id,className:cx('gr-acc__item',o&&'is-open')},
   h('h3',{className:'gr-acc__heading'},h('button',{type:'button',id:hid,className:'gr-acc__trigger','aria-expanded':o,'aria-controls':pid,onClick:function(){toggle(it.id);}},
    h('span',{className:'gr-acc__title'},it.title,it.meta?h('span',{className:'gr-acc__meta'},it.meta):null),
    h('span',{className:'gr-acc__action'},p.showActionLabel===false?null:h('span',null,o?(p.collapseLabel||'Collapse'):(p.expandLabel||'Expand')),h(Icon,{name:'chevron--down',size:20,className:'gr-acc__chev'})))),
   o?h('div',{id:pid,role:'region','aria-labelledby':hid,className:'gr-acc__panel'},it.content):null);}));}

var LANGS=[{code:'en',label:'English',short:'EN'},{code:'zh-Hant',label:'繁體中文',short:'中',hint:'Traditional Chinese'}];
function LanguageSelector(p){var langs=p.languages||LANGS;var auto=useId();var so=useState(!!p.defaultOpen),open=so[0],setOpen=so[1];var sv=useState(p.defaultValue||langs[0].code),cur=sv[0],setCur=sv[1];var val=p.value!==undefined?p.value:cur;var wrap=useRef(null);
 var active=langs.filter(function(l){return l.code===val;})[0]||langs[0];
 useEffect(function(){if(!open)return;function out(e){if(wrap.current&&!wrap.current.contains(e.target))setOpen(false);}document.addEventListener('mousedown',out);return function(){document.removeEventListener('mousedown',out);};},[open]);
 function pick(code){if(p.value===undefined)setCur(code);setOpen(false);if(p.onChange)p.onChange(code);var b=wrap.current&&wrap.current.querySelector('.gr-lang__trigger');if(b)b.focus();}
 function move(d){var els=[].slice.call(wrap.current.querySelectorAll('.gr-lang__item'));if(!els.length)return;var i=els.indexOf(document.activeElement);els[(i+d+els.length)%els.length].focus();}
 function onKey(e){if(e.key==='Escape'&&open){setOpen(false);var b=wrap.current.querySelector('.gr-lang__trigger');if(b)b.focus();}else if(e.key==='ArrowDown'){e.preventDefault();if(!open)setOpen(true);else move(1);}else if(e.key==='ArrowUp'){e.preventDefault();if(open)move(-1);}}
 return h('div',{ref:wrap,className:cx('gr-lang','gr-lang--'+(p.align||'end'),p.className),onKeyDown:onKey},
  h('button',{type:'button',className:cx('gr-lang__trigger',p.compact&&'gr-lang__trigger--compact'),'aria-haspopup':'menu','aria-expanded':open,'aria-controls':auto+'-menu','aria-label':'Language: '+active.label,onClick:function(){setOpen(!open);}},
   h(Icon,{name:'earth',size:20}),
   h('span',{className:'gr-lang__chip',lang:active.code,'aria-hidden':true},active.short),
   p.compact?null:h('span',{className:'gr-lang__label',lang:active.code},active.label),
   h(Icon,{name:'chevron--down',size:16,className:'gr-lang__chev'})),
  open?h('ul',{id:auto+'-menu',role:'menu','aria-label':'Choose language',className:'gr-menu gr-lang__menu'},langs.map(function(l){var sel=l.code===val;
   return h('li',{key:l.code,role:'none'},h('button',{type:'button',role:'menuitemradio','aria-checked':sel,lang:l.code,className:cx('gr-menu__item','gr-lang__item',sel&&'is-selected'),onClick:function(){pick(l.code);}},
    h('span',{className:'gr-lang__chip','aria-hidden':true},l.short),
    h('span',{className:'gr-lang__name'},h('span',null,l.label),l.hint?h('span',{className:'gr-lang__hint',lang:'en'},l.hint):null),
    sel?h(Icon,{name:'checkmark',size:16,className:'gr-lang__check'}):h('span',{className:'gr-lang__check'})));})):null);}
window.Graphite=Object.assign(window.Graphite||{},{Button:Button,IconButton:IconButton,Link:Link,FormField:FormField,TextInput:TextInput,Textarea:Textarea,SearchInput:SearchInput,Select:Select,Checkbox:Checkbox,Radio:Radio,Toggle:Toggle,Tag:Tag,StatusTag:StatusTag,Icon:Icon,Tooltip:Tooltip,Snackbar:Snackbar,InlineNotification:InlineNotification,Modal:Modal,OverflowMenu:OverflowMenu,Tabs:Tabs,Breadcrumb:Breadcrumb,Accordion:Accordion,LanguageSelector:LanguageSelector});
})();
