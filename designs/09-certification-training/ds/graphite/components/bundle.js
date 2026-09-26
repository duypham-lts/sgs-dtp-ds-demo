/* @ds-bundle: {"format": 4, "namespace": "Graphite", "components": [{"name": "Button"}, {"name": "IconButton"}, {"name": "Link"}, {"name": "FormField"}, {"name": "TextInput"}, {"name": "Textarea"}, {"name": "SearchInput"}, {"name": "Select"}, {"name": "Checkbox"}, {"name": "Radio"}, {"name": "Toggle"}, {"name": "Tag"}, {"name": "StatusTag"}, {"name": "Tooltip"}, {"name": "Snackbar"}, {"name": "InlineNotification"}, {"name": "Modal"}, {"name": "OverflowMenu"}, {"name": "Tabs"}, {"name": "Breadcrumb"}, {"name": "Accordion"}, {"name": "LanguageSelector"}, {"name": "Table"}, {"name": "DataTable"}, {"name": "Pagination"}, {"name": "Popover"}, {"name": "Combobox"}, {"name": "MultiSelect"}, {"name": "DatePicker"}, {"name": "FileUpload"}, {"name": "ProgressBar"}, {"name": "ReadinessRing"}, {"name": "Drawer"}, {"name": "Avatar"}, {"name": "NotificationBadge"}, {"name": "Separator"}, {"name": "Skeleton"}, {"name": "EmptyState"}, {"name": "TreeView"}, {"name": "SectionNav"}, {"name": "TopBar"}, {"name": "PageHeader"}, {"name": "Card"}, {"name": "DocumentItem"}, {"name": "CommentThread"}, {"name": "AppSidebar"}, {"name": "RequirementNavigator"}]} */
(function(){
var React=window.React,h=React.createElement,useState=React.useState,useEffect=React.useEffect,useRef=React.useRef,useId=React.useId||function(){var r=React.useRef(null);if(!r.current)r.current='gr'+Math.random().toString(36).slice(2,8);return r.current;};
var ICONS={"checkmark--filled":[["M16,2A14,14,0,1,0,30,16,14,14,0,0,0,16,2ZM14,21.5908l-5-5L10.5906,15,14,18.4092,21.41,11l1.5957,1.5859Z"]],"time--filled":[["m16,2c-7.6001,0-14,6.3999-14,14s6.3999,14,14,14,14-6.3999,14-14S23.6001,2,16,2Zm4.5872,20l-5.5872-5.5898V7h2v8.582l5,5.0044-1.4128,1.4136Z"]],"warning--alt--filled":[["M16,26a1.5,1.5,0,1,1,1.5-1.5A1.5,1.5,0,0,1,16,26Zm-1.125-5h2.25V12h-2.25Z","#161616"],["M16.002,6.1714h-.004L4.6487,27.9966,4.6506,28H27.3494l.0019-.0034ZM14.875,12h2.25v9h-2.25ZM16,26a1.5,1.5,0,1,1,1.5-1.5A1.5,1.5,0,0,1,16,26Z"],["M29,30H3a1,1,0,0,1-.8872-1.4614l13-25a1,1,0,0,1,1.7744,0l13,25A1,1,0,0,1,29,30ZM4.6507,28H27.3493l.002-.0033L16.002,6.1714h-.004L4.6487,27.9967Z"]],"warning--filled":[["M16,2C8.3,2,2,8.3,2,16s6.3,14,14,14s14-6.3,14-14C30,8.3,23.7,2,16,2z M14.9,8h2.2v11h-2.2V8z M16,25 c-0.8,0-1.5-0.7-1.5-1.5S15.2,22,16,22c0.8,0,1.5,0.7,1.5,1.5S16.8,25,16,25z"]],"misuse":[["M16,2C8.3,2,2,8.3,2,16s6.3,14,14,14s14-6.3,14-14S23.7,2,16,2z M21.4,23L16,17.6L10.6,23L9,21.4l5.4-5.4L9,10.6L10.6,9 l5.4,5.4L21.4,9l1.6,1.6L17.6,16l5.4,5.4L21.4,23z"]],"circle-dash":[["M7.7,4.7a14.7,14.7,0,0,0-3,3.1L6.3,9A13.26,13.26,0,0,1,8.9,6.3Z"],["M4.6,12.3l-1.9-.6A12.51,12.51,0,0,0,2,16H4A11.48,11.48,0,0,1,4.6,12.3Z"],["M2.7,20.4a14.4,14.4,0,0,0,2,3.9l1.6-1.2a12.89,12.89,0,0,1-1.7-3.3Z"],["M7.8,27.3a14.4,14.4,0,0,0,3.9,2l.6-1.9A12.89,12.89,0,0,1,9,25.7Z"],["M11.7,2.7l.6,1.9A11.48,11.48,0,0,1,16,4V2A12.51,12.51,0,0,0,11.7,2.7Z"],["M24.2,27.3a15.18,15.18,0,0,0,3.1-3.1L25.7,23A11.53,11.53,0,0,1,23,25.7Z"],["M27.4,19.7l1.9.6A15.47,15.47,0,0,0,30,16H28A11.48,11.48,0,0,1,27.4,19.7Z"],["M29.2,11.6a14.4,14.4,0,0,0-2-3.9L25.6,8.9a12.89,12.89,0,0,1,1.7,3.3Z"],["M24.1,4.6a14.4,14.4,0,0,0-3.9-2l-.6,1.9a12.89,12.89,0,0,1,3.3,1.7Z"],["M20.3,29.3l-.6-1.9A11.48,11.48,0,0,1,16,28v2A21.42,21.42,0,0,0,20.3,29.3Z"]],"information--filled":[["M16,2A14,14,0,1,0,30,16,14,14,0,0,0,16,2Zm0,6a1.5,1.5,0,1,1-1.5,1.5A1.5,1.5,0,0,1,16,8Zm4,16.125H12v-2.25h2.875v-5.75H13v-2.25h4.125v8H20Z"]],"search":[["M29,27.5859l-7.5521-7.5521a11.0177,11.0177,0,1,0-1.4141,1.4141L27.5859,29ZM4,13a9,9,0,1,1,9,9A9.01,9.01,0,0,1,4,13Z"]],"chevron--down":[["M16 22 6 12 7.4 10.6 16 19.2 24.6 10.6 26 12z"]],"close":[["M17.4141 16 24 9.4141 22.5859 8 16 14.5859 9.4143 8 8 9.4141 14.5859 16 8 22.5859 9.4143 24 16 17.4141 22.5859 24 24 22.5859 17.4141 16z"]],"arrow--right":[["M18 6 16.57 7.393 24.15 15 4 15 4 17 24.15 17 16.57 24.573 18 26 28 16 18 6z"]],"add":[["M17 15 17 8 15 8 15 15 8 15 8 17 15 17 15 24 17 24 17 17 24 17 24 15z"]],"view":[["M30.94,15.66A16.69,16.69,0,0,0,16,5,16.69,16.69,0,0,0,1.06,15.66a1,1,0,0,0,0,.68A16.69,16.69,0,0,0,16,27,16.69,16.69,0,0,0,30.94,16.34,1,1,0,0,0,30.94,15.66ZM16,25c-5.3,0-10.9-3.93-12.93-9C5.1,10.93,10.7,7,16,7s10.9,3.93,12.93,9C26.9,21.07,21.3,25,16,25Z"],["M16,10a6,6,0,1,0,6,6A6,6,0,0,0,16,10Zm0,10a4,4,0,1,1,4-4A4,4,0,0,1,16,20Z"]],"view--off":[["M5.24,22.51l1.43-1.42A14.06,14.06,0,0,1,3.07,16C5.1,10.93,10.7,7,16,7a12.38,12.38,0,0,1,4,.72l1.55-1.56A14.72,14.72,0,0,0,16,5,16.69,16.69,0,0,0,1.06,15.66a1,1,0,0,0,0,.68A16,16,0,0,0,5.24,22.51Z"],["M12,15.73a4,4,0,0,1,3.7-3.7l1.81-1.82a6,6,0,0,0-7.33,7.33Z"],["M30.94,15.66A16.4,16.4,0,0,0,25.2,8.22L30,3.41,28.59,2,2,28.59,3.41,30l5.1-5.1A15.29,15.29,0,0,0,16,27,16.69,16.69,0,0,0,30.94,16.34,1,1,0,0,0,30.94,15.66ZM20,16a4,4,0,0,1-6,3.44L19.44,14A4,4,0,0,1,20,16Zm-4,9a13.05,13.05,0,0,1-6-1.58l2.54-2.54a6,6,0,0,0,8.35-8.35l2.87-2.87A14.54,14.54,0,0,1,28.93,16C26.9,21.07,21.3,25,16,25Z"]],"overflow-menu--vertical":[["M14,8a2,2 0 1,0 4,0a2,2 0 1,0 -4,0Z M14,16a2,2 0 1,0 4,0a2,2 0 1,0 -4,0Z M14,24a2,2 0 1,0 4,0a2,2 0 1,0 -4,0Z"]],"earth":[["M16,2A14,14,0,1,0,30,16,14.0158,14.0158,0,0,0,16,2Zm5,3.1055a12.0136,12.0136,0,0,1,2.9158,1.8994L23.5034,8H21ZM13.3784,27.7026A11.9761,11.9761,0,0,1,8.1157,6.9761L9.4648,9h3.3423l-1.5,4H7.2793L5.8967,17.1475,8.4648,21h5l1.4319,2.1475ZM16,28c-.2034,0-.4016-.02-.6025-.03l1.3967-4.19a1.9876,1.9876,0,0,0-.2334-1.7412l-1.4319-2.1475A1.9962,1.9962,0,0,0,13.4648,19h-3.93L8.1033,16.8525,8.7207,15H11v2h2V14.1812l2.9363-7.83-1.8726-.7022L13.5571,7H10.5352L9.728,5.7891A11.7941,11.7941,0,0,1,19,4.395V8a2.0025,2.0025,0,0,0,2,2h2.5857A1.9865,1.9865,0,0,0,25,9.4141l.1406-.1407.2818-.68A11.9813,11.9813,0,0,1,27.3,12H22.5986a1.9927,1.9927,0,0,0-1.9719,1.665L20.03,17.1064a1.99,1.99,0,0,0,.991,2.086l2.1647,1.4638,1.4585,3.646A11.9577,11.9577,0,0,1,16,28Zm8.8145-8.6563L22.1,17.5088l-.1-.06L22.5986,14h5.2207a11.743,11.743,0,0,1-1.7441,8.4951Z"]],"checkmark":[["M13 24 4 15 5.414 13.586 13 21.171 26.586 7.586 28 9 13 24z"]],"arrow--up":[["M16 4 6 14 7.41 15.41 15 7.83 15 28 17 28 17 7.83 24.59 15.41 26 14 16 4z"]],"arrow--down":[["M24.59 16.59 17 24.17 17 4 15 4 15 24.17 7.41 16.59 6 18 16 28 26 18 24.59 16.59z"]],"arrows--vertical":[["M27.6 20.6 24 24.2 24 4 22 4 22 24.2 18.4 20.6 17 22 23 28 29 22z"],["M9 4 3 10 4.4 11.4 8 7.8 8 28 10 28 10 7.8 13.6 11.4 15 10z"]],"chevron--left":[["M10 16 20 6 21.4 7.4 12.8 16 21.4 24.6 20 26z"]],"chevron--right":[["M22 16 12 26 10.6 24.6 19.2 16 10.6 7.4 12 6z"]],"calendar":[["M26,4h-4V2h-2v2h-8V2h-2v2H6C4.9,4,4,4.9,4,6v20c0,1.1,0.9,2,2,2h20c1.1,0,2-0.9,2-2V6C28,4.9,27.1,4,26,4z M26,26H6V12h20\tV26z M26,10H6V6h4v2h2V6h8v2h2V6h4V10z"]],"upload":[["M6 18 7.41 19.41 15 11.83 15 30 17 30 17 11.83 24.59 19.41 26 18 16 8 6 18z"],["M6,8V4H26V8h2V4a2,2,0,0,0-2-2H6A2,2,0,0,0,4,4V8Z"]],"document":[["M25.7,9.3l-7-7C18.5,2.1,18.3,2,18,2H8C6.9,2,6,2.9,6,4v24c0,1.1,0.9,2,2,2h16c1.1,0,2-0.9,2-2V10C26,9.7,25.9,9.5,25.7,9.3\tz M18,4.4l5.6,5.6H18V4.4z M24,28H8V4h8v6c0,1.1,0.9,2,2,2h6V28z"],["M10 22H22V24H10z"],["M10 16H22V18H10z"]],"information":[["M17 22 17 14 13 14 13 16 15 16 15 22 12 22 12 24 20 24 20 22 17 22z"],["M16,8a1.5,1.5,0,1,0,1.5,1.5A1.5,1.5,0,0,0,16,8Z"],["M16,30A14,14,0,1,1,30,16,14,14,0,0,1,16,30ZM16,4A12,12,0,1,0,28,16,12,12,0,0,0,16,4Z"]],"folder":[["M11.17,6l3.42,3.41.58.59H28V26H4V6h7.17m0-2H4A2,2,0,0,0,2,6V26a2,2,0,0,0,2,2H28a2,2,0,0,0,2-2V10a2,2,0,0,0-2-2H16L12.59,4.59A2,2,0,0,0,11.17,4Z"]],"events":[["M26,14H24v2h2a3.0033,3.0033,0,0,1,3,3v4h2V19A5.0058,5.0058,0,0,0,26,14Z"],["M24,4a3,3,0,1,1-3,3,3,3,0,0,1,3-3m0-2a5,5,0,1,0,5,5A5,5,0,0,0,24,2Z"],["M23,30H21V28a3.0033,3.0033,0,0,0-3-3H14a3.0033,3.0033,0,0,0-3,3v2H9V28a5.0059,5.0059,0,0,1,5-5h4a5.0059,5.0059,0,0,1,5,5Z"],["M16,13a3,3,0,1,1-3,3,3,3,0,0,1,3-3m0-2a5,5,0,1,0,5,5A5,5,0,0,0,16,11Z"],["M8,14H6a5.0059,5.0059,0,0,0-5,5v4H3V19a3.0033,3.0033,0,0,1,3-3H8Z"],["M8,4A3,3,0,1,1,5,7,3,3,0,0,1,8,4M8,2a5,5,0,1,0,5,5A5,5,0,0,0,8,2Z"]],"box":[["M20,21H12a2,2,0,0,1-2-2V17a2,2,0,0,1,2-2h8a2,2,0,0,1,2,2v2A2,2,0,0,1,20,21Zm-8-4v2h8V17Z"],["M28,4H4A2,2,0,0,0,2,6v4a2,2,0,0,0,2,2V28a2,2,0,0,0,2,2H26a2,2,0,0,0,2-2V12a2,2,0,0,0,2-2V6A2,2,0,0,0,28,4ZM26,28H6V12H26Zm2-18H4V6H28v4Z"]],"delivery":[["M4 16H16V18H4z"],["M2 11H12V13H2z"],["M29.9189,16.6064l-3-7A.9985.9985,0,0,0,26,9H23V7a1,1,0,0,0-1-1H6V8H21V20.5562A3.9924,3.9924,0,0,0,19.1421,23H12.8579a4,4,0,1,0,0,2h6.2842a3.9806,3.9806,0,0,0,7.7158,0H29a1,1,0,0,0,1-1V17A.9965.9965,0,0,0,29.9189,16.6064ZM9,26a2,2,0,1,1,2-2A2.0023,2.0023,0,0,1,9,26ZM23,11h2.3408l2.1431,5H23Zm0,15a2,2,0,1,1,2-2A2.0023,2.0023,0,0,1,23,26Zm5-3H26.8579A3.9954,3.9954,0,0,0,23,20V18h5Z"]],"notification":[["M28.7071,19.293,26,16.5859V13a10.0136,10.0136,0,0,0-9-9.9492V1H15V3.0508A10.0136,10.0136,0,0,0,6,13v3.5859L3.2929,19.293A1,1,0,0,0,3,20v3a1,1,0,0,0,1,1h7v.7768a5.152,5.152,0,0,0,4.5,5.1987A5.0057,5.0057,0,0,0,21,25V24h7a1,1,0,0,0,1-1V20A1,1,0,0,0,28.7071,19.293ZM19,25a3,3,0,0,1-6,0V24h6Zm8-3H5V20.4141L7.707,17.707A1,1,0,0,0,8,17V13a8,8,0,0,1,16,0v4a1,1,0,0,0,.293.707L27,20.4141Z"]],"user--avatar":[["M16,8a5,5,0,1,0,5,5A5,5,0,0,0,16,8Zm0,8a3,3,0,1,1,3-3A3.0034,3.0034,0,0,1,16,16Z"],["M16,2A14,14,0,1,0,30,16,14.0158,14.0158,0,0,0,16,2ZM10,26.3765V25a3.0033,3.0033,0,0,1,3-3h6a3.0033,3.0033,0,0,1,3,3v1.3765a11.8989,11.8989,0,0,1-12,0Zm13.9925-1.4507A5.0016,5.0016,0,0,0,19,20H13a5.0016,5.0016,0,0,0-4.9925,4.9258,12,12,0,1,1,15.985,0Z"]],"edit":[["M2 26H30V28H2z"],["M25.4,9c0.8-0.8,0.8-2,0-2.8c0,0,0,0,0,0l-3.6-3.6c-0.8-0.8-2-0.8-2.8,0c0,0,0,0,0,0l-15,15V24h6.4L25.4,9z M20.4,4L24,7.6\tl-3,3L17.4,7L20.4,4z M6,22v-3.6l10-10l3.6,3.6l-10,10H6z"]],"launch":[["M26,28H6a2.0027,2.0027,0,0,1-2-2V6A2.0027,2.0027,0,0,1,6,4H16V6H6V26H26V16h2V26A2.0027,2.0027,0,0,1,26,28Z"],["M20 2 20 4 26.586 4 18 12.586 19.414 14 28 5.414 28 12 30 12 30 2 20 2z"]],"trash-can":[["M12 12H14V24H12z"],["M18 12H20V24H18z"],["M4,6V8H6V28a2,2,0,0,0,2,2H24a2,2,0,0,0,2-2V8h2V6ZM8,28V8H24V28Z"],["M12 2H20V4H12z"]],"download":[["M26,24v4H6V24H4v4H4a2,2,0,0,0,2,2H26a2,2,0,0,0,2-2h0V24Z"],["M26 14 24.59 12.59 17 20.17 17 2 15 2 15 20.17 7.41 12.59 6 14 16 24 26 14z"]],"save":[["M27.71,9.29l-5-5A1,1,0,0,0,22,4H6A2,2,0,0,0,4,6V26a2,2,0,0,0,2,2H26a2,2,0,0,0,2-2V10A1,1,0,0,0,27.71,9.29ZM12,6h8v4H12Zm8,20H12V18h8Zm2,0V18a2,2,0,0,0-2-2H12a2,2,0,0,0-2,2v8H6V6h4v4a2,2,0,0,0,2,2h8a2,2,0,0,0,2-2V6.41l4,4V26Z"]],"arrow--left":[["M14 26 15.41 24.59 7.83 17 28 17 28 15 7.83 15 15.41 7.41 14 6 4 16 14 26z"]],"send":[["M27.45,15.11l-22-11a1,1,0,0,0-1.08.12,1,1,0,0,0-.33,1L7,16,4,26.74A1,1,0,0,0,5,28a1,1,0,0,0,.45-.11l22-11a1,1,0,0,0,0-1.78Zm-20.9,10L8.76,17H18V15H8.76L6.55,6.89,24.76,16Z"]],"document--pdf":[["M30 18 30 16 24 16 24 26 26 26 26 22 29 22 29 20 26 20 26 18 30 18z"],["M19,26H15V16h4a3.0033,3.0033,0,0,1,3,3v4A3.0033,3.0033,0,0,1,19,26Zm-2-2h2a1.0011,1.0011,0,0,0,1-1V19a1.0011,1.0011,0,0,0-1-1H17Z"],["M11,16H6V26H8V23h3a2.0027,2.0027,0,0,0,2-2V18A2.0023,2.0023,0,0,0,11,16ZM8,21V18h3l.001,3Z"],["M22,14V10a.9092.9092,0,0,0-.3-.7l-7-7A.9087.9087,0,0,0,14,2H4A2.0059,2.0059,0,0,0,2,4V28a2,2,0,0,0,2,2H20V28H4V4h8v6a2.0059,2.0059,0,0,0,2,2h6v2Zm-8-4V4.4L19.6,10Z"]],"dashboard":[["M24 21H26V26H24z"],["M20 16H22V26H20z"],["M11,26a5.0059,5.0059,0,0,1-5-5H8a3,3,0,1,0,3-3V16a5,5,0,0,1,0,10Z"],["M28,2H4A2.002,2.002,0,0,0,2,4V28a2.0023,2.0023,0,0,0,2,2H28a2.0027,2.0027,0,0,0,2-2V4A2.0023,2.0023,0,0,0,28,2Zm0,9H14V4H28ZM12,4v7H4V4ZM4,28V13H28.0007l.0013,15Z"]],"category":[["M27,22.1414V18a2,2,0,0,0-2-2H17V12h2a2.0023,2.0023,0,0,0,2-2V4a2.0023,2.0023,0,0,0-2-2H13a2.002,2.002,0,0,0-2,2v6a2.002,2.002,0,0,0,2,2h2v4H7a2,2,0,0,0-2,2v4.1421a4,4,0,1,0,2,0V18h8v4.142a4,4,0,1,0,2,0V18h8v4.1414a4,4,0,1,0,2,0ZM13,4h6l.001,6H13ZM8,26a2,2,0,1,1-2-2A2.0023,2.0023,0,0,1,8,26Zm10,0a2,2,0,1,1-2-2A2.0027,2.0027,0,0,1,18,26Zm8,2a2,2,0,1,1,2-2A2.0023,2.0023,0,0,1,26,28Z"]],"folders":[["M26,28H6a2.0021,2.0021,0,0,1-2-2V11A2.0021,2.0021,0,0,1,6,9h5.6665a2.0119,2.0119,0,0,1,1.2007.4L16.3335,12H26a2.0021,2.0021,0,0,1,2,2V26A2.0021,2.0021,0,0,1,26,28ZM11.6665,11H5.9985L6,26H26V14H15.6665Z"],["M28,9H17.6665l-4-3H6V4h7.6665a2.0119,2.0119,0,0,1,1.2007.4L18.3335,7H28Z"]],"document--multiple-01":[["M2 6H4V26H2z"],["M6 4H8V28H6z"],["M14 22H26V24H14z"],["M14 16H26V18H14z"],["M29.7,9.3l-7-7C22.5,2.1,22.3,2,22,2H12c-1.1,0-2,0.9-2,2v24c0,1.1,0.9,2,2,2h16c1.1,0,2-0.9,2-2V10\tC30,9.7,29.9,9.5,29.7,9.3z M22,4.4l5.6,5.6H22V4.4z M28,28H12V4h8v6c0,1.1,0.9,2,2,2h6V28z"]],"task":[["M14 20.18 10.41 16.59 9 18 14 23 23 14 21.59 12.58 14 20.18z"],["M25,5H22V4a2,2,0,0,0-2-2H12a2,2,0,0,0-2,2V5H7A2,2,0,0,0,5,7V28a2,2,0,0,0,2,2H25a2,2,0,0,0,2-2V7A2,2,0,0,0,25,5ZM12,4h8V8H12ZM25,28H7V7h3v3H22V7h3Z"]],"education":[["M26,30H24V27a5.0059,5.0059,0,0,0-5-5H13a5.0059,5.0059,0,0,0-5,5v3H6V27a7.0082,7.0082,0,0,1,7-7h6a7.0082,7.0082,0,0,1,7,7Z"],["M5,6A1,1,0,0,0,4,7v9H6V7A1,1,0,0,0,5,6Z"],["M4,2V4H9v7a7,7,0,0,0,14,0V4h5V2Zm7,2H21V7H11Zm5,12a5,5,0,0,1-5-5V9H21v2A5,5,0,0,1,16,16Z"]],"catalog":[["M26,2H8A2,2,0,0,0,6,4V8H4v2H6v5H4v2H6v5H4v2H6v4a2,2,0,0,0,2,2H26a2,2,0,0,0,2-2V4A2,2,0,0,0,26,2Zm0,26H8V24h2V22H8V17h2V15H8V10h2V8H8V4H26Z"],["M14 8H22V10H14z"],["M14 15H22V17H14z"],["M14 22H22V24H14z"]],"settings":[["M27,16.76c0-.25,0-.5,0-.76s0-.51,0-.77l1.92-1.68A2,2,0,0,0,29.3,11L26.94,7a2,2,0,0,0-1.73-1,2,2,0,0,0-.64.1l-2.43.82a11.35,11.35,0,0,0-1.31-.75l-.51-2.52a2,2,0,0,0-2-1.61H13.64a2,2,0,0,0-2,1.61l-.51,2.52a11.48,11.48,0,0,0-1.32.75L7.43,6.06A2,2,0,0,0,6.79,6,2,2,0,0,0,5.06,7L2.7,11a2,2,0,0,0,.41,2.51L5,15.24c0,.25,0,.5,0,.76s0,.51,0,.77L3.11,18.45A2,2,0,0,0,2.7,21L5.06,25a2,2,0,0,0,1.73,1,2,2,0,0,0,.64-.1l2.43-.82a11.35,11.35,0,0,0,1.31.75l.51,2.52a2,2,0,0,0,2,1.61h4.72a2,2,0,0,0,2-1.61l.51-2.52a11.48,11.48,0,0,0,1.32-.75l2.42.82a2,2,0,0,0,.64.1,2,2,0,0,0,1.73-1L29.3,21a2,2,0,0,0-.41-2.51ZM25.21,24l-3.43-1.16a8.86,8.86,0,0,1-2.71,1.57L18.36,28H13.64l-.71-3.55a9.36,9.36,0,0,1-2.7-1.57L6.79,24,4.43,20l2.72-2.4a8.9,8.9,0,0,1,0-3.13L4.43,12,6.79,8l3.43,1.16a8.86,8.86,0,0,1,2.71-1.57L13.64,4h4.72l.71,3.55a9.36,9.36,0,0,1,2.7,1.57L25.21,8,27.57,12l-2.72,2.4a8.9,8.9,0,0,1,0,3.13L27.57,20Z"],["M16,22a6,6,0,1,1,6-6A5.94,5.94,0,0,1,16,22Zm0-10a3.91,3.91,0,0,0-4,4,3.91,3.91,0,0,0,4,4,3.91,3.91,0,0,0,4-4A3.91,3.91,0,0,0,16,12Z"]],"user--multiple":[["M30,30H28V25a5.0057,5.0057,0,0,0-5-5V18a7.0078,7.0078,0,0,1,7,7Z"],["M22,30H20V25a5.0059,5.0059,0,0,0-5-5H9a5.0059,5.0059,0,0,0-5,5v5H2V25a7.0082,7.0082,0,0,1,7-7h6a7.0082,7.0082,0,0,1,7,7Z"],["M20,2V4a5,5,0,0,1,0,10v2A7,7,0,0,0,20,2Z"],["M12,4A5,5,0,1,1,7,9a5,5,0,0,1,5-5m0-2a7,7,0,1,0,7,7A7,7,0,0,0,12,2Z"]],"user--access":[["M16,30H14V25a3.0033,3.0033,0,0,0-3-3H7a3.0033,3.0033,0,0,0-3,3v5H2V25a5.0059,5.0059,0,0,1,5-5h4a5.0059,5.0059,0,0,1,5,5Z"],["M9,10a3,3,0,1,1-3,3,3,3,0,0,1,3-3M9,8a5,5,0,1,0,5,5A5,5,0,0,0,9,8Z"],["M30,12a1.9922,1.9922,0,0,0-.5117.0742L28.4331,11.019a3.8788,3.8788,0,0,0,0-4.038l1.0552-1.0552a2.0339,2.0339,0,1,0-1.4141-1.4141L27.019,5.5669a3.8788,3.8788,0,0,0-4.038,0L21.9258,4.5117a2.0339,2.0339,0,1,0-1.4141,1.4141L21.5669,6.981a3.8788,3.8788,0,0,0,0,4.038l-1.0552,1.0552a2.0339,2.0339,0,1,0,1.4141,1.4141l1.0552-1.0552a3.8788,3.8788,0,0,0,4.038,0l1.0552,1.0552A1.9957,1.9957,0,1,0,30,12ZM23,9a2,2,0,1,1,2,2A2.0025,2.0025,0,0,1,23,9Z"]],"side-panel--close":[["M28,4H4C2.9,4,2,4.9,2,6v20c0,1.1,0.9,2,2,2h24c1.1,0,2-0.9,2-2V6C30,4.9,29.1,4,28,4z M10,26H4V6h6V26z M28,15H17.8\tl3.6-3.6L20,10l-6,6l6,6l1.4-1.4L17.8,17H28v9H12V6h16V15z"]],"side-panel--open":[["M28,4H4C2.9,4,2,4.9,2,6v20c0,1.1,0.9,2,2,2h24c1.1,0,2-0.9,2-2V6C30,4.9,29.1,4,28,4z M10,26H4V6h6V26z M28,26H12v-9h10.2\tl-3.6,3.6L20,22l6-6l-6-6l-1.4,1.4l3.6,3.6H12V6h16V26z"]]};
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
 return h(FormField,{id:id,label:p.label,required:p.required,helpText:p.helpText,error:r.error,size:p.size||'l',width:p.width,disabled:p.disabled,hideLabel:p.hideLabel,className:p.className,kind:'area'},el);}
function SearchInput(p){return h(TextInput,Object.assign({type:'search',label:'Search',hideLabel:!p.showLabel},omit(p,['showLabel']),{trailing:h('span',{className:'gr-field__deco'},h(Icon,{name:'search',size:20}))}));}
function Select(p){var auto=useId();var id=p.id||auto;var opts=p.options||[];var sv=useState(p.defaultValue!==undefined?p.defaultValue:''),cur=sv[0],setCur=sv[1];var val=p.value!==undefined?p.value:cur;
 var r=useErrorRecovery(p.error,null);var so=useState(!!p.defaultOpen),open=so[0],setOpen=so[1];var sa=useState(0),act=sa[0],setAct=sa[1];var ref=useRef(null);
 useOutside(ref,open,function(){setOpen(false);});
 var sel=opts.filter(function(o){return o.value===val;})[0];
 function choose(o){if(p.value===undefined)setCur(o.value);setOpen(false);if(p.error)r.onChange({});if(p.onChange)p.onChange({target:{value:o.value}},o.value);var b=ref.current&&ref.current.querySelector('.gr-sel__btn');if(b)b.focus();}
 function openAt(){var k=opts.findIndex(function(o){return o.value===val;});setAct(k<0?0:k);setOpen(true);}
 function onKey(e){if(e.key==='ArrowDown'){e.preventDefault();if(!open)openAt();else setAct(Math.min(act+1,opts.length-1));}else if(e.key==='ArrowUp'){e.preventDefault();if(open)setAct(Math.max(act-1,0));}else if((e.key==='Enter'||e.key===' ')&&open&&opts[act]){e.preventDefault();choose(opts[act]);}else if(e.key==='Escape'){setOpen(false);}else if(e.key==='Home'&&open){e.preventDefault();setAct(0);}else if(e.key==='End'&&open){e.preventDefault();setAct(opts.length-1);}}
 var btn=h('button',{type:'button',id:id,className:'gr-sel__btn','aria-haspopup':'listbox','aria-expanded':open,'aria-controls':id+'-list','aria-activedescendant':open&&opts[act]?id+'-o-'+act:undefined,'aria-invalid':r.error?true:undefined,'aria-describedby':(r.error||p.helpText)?id+'-msg':undefined,disabled:p.disabled,onClick:function(){open?setOpen(false):openAt();},onKeyDown:onKey},
  sel?sel.label:h('span',{className:'gr-ms__ph'},p.placeholder||'Select...'));
 return h('div',{ref:ref,className:'gr-pickwrap'},
  h(FormField,{id:id,label:p.label,required:p.required,helpText:p.helpText,error:r.error,size:p.size,width:p.width,disabled:p.disabled,className:p.className,kind:'select',trailing:h('span',{className:'gr-field__deco'},h(Icon,{name:'chevron--down',size:20,className:cx('gr-sel__chev',open&&'is-open')}))},btn),
  open?h('ul',{id:id+'-list',role:'listbox','aria-labelledby':id,className:'gr-list'},opts.map(function(o,i){var on=o.value===val;
   return h('li',{key:o.value,id:id+'-o-'+i,role:'option','aria-selected':on,className:cx('gr-list__opt',i===act&&'is-active',on&&'is-selected'),onMouseDown:function(e){e.preventDefault();choose(o);},onMouseEnter:function(){setAct(i);}},
    h('span',{className:'gr-list__label'},o.label,o.description?h('span',{className:'gr-list__desc'},o.description):null),on?h(Icon,{name:'checkmark',size:16,className:'gr-list__check'}):null);})):null);}
function Choice(type,cls){return function(p){var auto=useId();var id=p.id||auto;var ref=useRef(null);
 useEffect(function(){if(ref.current)ref.current.indeterminate=!!p.indeterminate;},[p.indeterminate]);
 return h('label',{htmlFor:id,className:cx('gr-choice',p.disabled&&'is-disabled',p.className)},
  h('input',Object.assign({},omit(p,['label','className','indeterminate']),{id:id,ref:ref,type:type==='switch'?'checkbox':type,role:type==='switch'?'switch':undefined,className:cls})),
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

function cellValue(col,row){return col.render?col.render(row):row[col.key];}
function Table(p){var cols=p.columns||[],rows=p.rows||[];var dens=p.density||'default';
 return h('div',{className:cx('gr-tbl',p.className),'data-density':dens},
  h('div',{className:'gr-tbl__scroll',style:p.maxHeight?{maxHeight:p.maxHeight}:undefined},
   h('table',{className:'gr-tbl__table'},
    p.caption?h('caption',{className:'gr-sr'},p.caption):null,
    h('thead',{className:'gr-tbl__head'},h('tr',null,cols.map(function(c){return h('th',{key:c.key,scope:'col',className:'gr-tbl__th','data-align':c.align||'start',style:c.width?{width:c.width}:undefined},c.header);}))),
    h('tbody',null,rows.map(function(r,i){return h('tr',{key:p.getRowId?p.getRowId(r):i,className:'gr-tbl__row'},cols.map(function(c){return h('td',{key:c.key,className:'gr-tbl__td','data-align':c.align||'start'},cellValue(c,r));}));})))));}
function Pagination(p){var total=p.totalItems||0,size=p.pageSize||10;var pages=Math.max(1,Math.ceil(total/size));var page=Math.min(Math.max(1,p.page||1),pages);
 var from=total?(page-1)*size+1:0,to=Math.min(total,page*size);var sizes=p.pageSizeOptions||[10,25,50,100];var auto=useId();
 var pageOpts=[];for(var i=1;i<=pages;i++)pageOpts.push(i);
 return h('nav',{className:cx('gr-pg',p.className),'aria-label':p.label||'Pagination'},
  h('div',{className:'gr-pg__left'},
   p.onPageSizeChange?h('label',{className:'gr-pg__group',htmlFor:auto+'-size'},h('span',{className:'gr-pg__text'},'Items per page'),
    h('span',{className:'gr-pg__selwrap'},h('select',{id:auto+'-size',className:'gr-pg__select',value:size,onChange:function(e){p.onPageSizeChange(Number(e.target.value));}},sizes.map(function(s){return h('option',{key:s,value:s},s);})),h(Icon,{name:'chevron--down',size:16}))):null,
   h('span',{className:'gr-pg__text','aria-live':'polite'},from+'–'+to+' of '+total+' items')),
  h('div',{className:'gr-pg__right'},
   h('span',{className:'gr-pg__selwrap'},h('select',{className:'gr-pg__select','aria-label':'Page',value:page,onChange:function(e){if(p.onPageChange)p.onPageChange(Number(e.target.value));}},pageOpts.map(function(n){return h('option',{key:n,value:n},n);})),h(Icon,{name:'chevron--down',size:16})),
   h('span',{className:'gr-pg__text'},'of '+pages+(pages===1?' page':' pages')),
   h(IconButton,{icon:'chevron--left',label:'Previous page',size:'md',disabled:page<=1,onClick:function(){if(p.onPageChange)p.onPageChange(page-1);}}),
   h(IconButton,{icon:'chevron--right',label:'Next page',size:'md',disabled:page>=pages,onClick:function(){if(p.onPageChange)p.onPageChange(page+1);}})));}
function sortRows(rows,cols,sort){if(!sort||!sort.key||sort.dir==='none')return rows;var col=cols.filter(function(c){return c.key===sort.key;})[0];if(!col)return rows;
 var get=col.sortValue||function(r){return r[col.key];};var out=rows.slice();out.sort(function(a,b){var x=get(a),y=get(b);if(x==null)return 1;if(y==null)return -1;var r=typeof x==='number'&&typeof y==='number'?x-y:String(x).localeCompare(String(y),undefined,{numeric:true});return sort.dir==='desc'?-r:r;});return out;}
function DataTable(p){var cols=p.columns||[],all=p.rows||[];var getId=p.getRowId||function(r,i){return r.id!==undefined?r.id:i;};
 var ss=useState(p.defaultSort||null),sort=ss[0],setSort=ss[1];var sq=useState(''),q=sq[0],setQ=sq[1];var sp=useState(1),page=sp[0],setPage=sp[1];var sz=useState(p.pageSize||10),size=sz[0],setSize=sz[1];
 var sel=useState({}),selected=sel[0],setSelected=sel[1];var wrap=useRef(null);var sw=useState(p.layout==='cards'),cards=sw[0],setCards=sw[1];
 useEffect(function(){if(p.layout&&p.layout!=='auto'){setCards(p.layout==='cards');return;}if(!wrap.current||typeof ResizeObserver==='undefined')return;var bp=p.cardBreakpoint||640;var ro=new ResizeObserver(function(en){setCards(en[0].contentRect.width<bp);});ro.observe(wrap.current);return function(){ro.disconnect();};},[p.layout,p.cardBreakpoint]);
 var filtered=q?all.filter(function(r){var s=q.toLowerCase();return cols.some(function(c){var v=c.searchValue?c.searchValue(r):r[c.key];return v!=null&&String(v).toLowerCase().indexOf(s)>=0;});}):all;
 var sorted=sortRows(filtered,cols,sort);var paged=p.paginate===false?sorted:sorted.slice((page-1)*size,page*size);
 var ids=paged.map(function(r,i){return getId(r,i);});var selIds=Object.keys(selected).filter(function(k){return selected[k];});
 var allOnPage=ids.length>0&&ids.every(function(id){return selected[id];});var someOnPage=ids.some(function(id){return selected[id];});
 function toggleAll(){var n=Object.assign({},selected);ids.forEach(function(id){n[id]=!allOnPage;});setSelected(n);}
 function toggle(id){var n=Object.assign({},selected);n[id]=!n[id];setSelected(n);}
 function sortBy(c){var dir=!sort||sort.key!==c.key?'asc':sort.dir==='asc'?'desc':sort.dir==='desc'?'none':'asc';setSort({key:c.key,dir:dir});}
 var selectedRows=all.filter(function(r,i){return selected[getId(r,i)];});
 var hasHead=!!(p.title||p.description||p.searchable||p.toolbarActions||(selIds.length&&p.bulkActions));
 var head=!hasHead?null:h('div',{className:'gr-dt__toolbar'},
   selIds.length&&p.bulkActions?h('div',{className:'gr-dt__batch',role:'region','aria-label':'Bulk actions'},
     h('span',{className:'gr-dt__batch-count'},selIds.length+' selected'),
     h('div',{className:'gr-dt__batch-actions'},p.bulkActions.map(function(a,i){return h('button',{key:i,type:'button',className:'gr-dt__batch-btn',onClick:function(){if(a.onClick)a.onClick(selectedRows);}},a.label);}),
      h('button',{type:'button',className:'gr-dt__batch-btn',onClick:function(){setSelected({});}},'Cancel'))):
   h(React.Fragment,null,
    (p.title||p.description)?h('div',{className:'gr-dt__heading'},p.title?h('h3',{className:'gr-dt__title'},p.title):null,p.description?h('p',{className:'gr-dt__desc'},p.description):null):null,
    h('div',{className:'gr-dt__tools'},
     p.searchable?h(SearchInput,{size:'s',placeholder:p.searchPlaceholder||'Search',label:'Search '+(p.title||'table'),value:q,onChange:function(e){setQ(e.target.value);setPage(1);}}):null,
     p.toolbarActions||null)));
 var body;
 if(p.error){body=h('div',{className:'gr-dt__state'},h(InlineNotification,{kind:'error',title:p.error.title||'Couldn’t load data',live:true},p.error.message||null));}
 else if(!p.loading&&!sorted.length){var es=p.emptyState||{};body=h('div',{className:'gr-dt__state gr-dt__empty'},h('div',{className:'gr-dt__empty-title'},q?'No results for “'+q+'”':(es.title||'Nothing here yet')),h('div',{className:'gr-dt__empty-body'},q?'Try a different search term.':(es.body||'')),(!q&&es.action)?h('div',{className:'gr-dt__empty-action'},es.action):null);}
 else if(cards){body=h('ul',{className:'gr-dt__cards'},(p.loading?[0,1,2]:paged).map(function(r,i){if(p.loading)return h('li',{key:'sk'+i,className:'gr-dt__card'},h('span',{className:'gr-skel',style:{width:'60%'}}),h('span',{className:'gr-skel',style:{width:'40%'}}),h('span',{className:'gr-skel'}));
   var id=getId(r,i);var tcol=cols.filter(function(c){return c.key===p.cardTitleKey;})[0]||cols[0];var scol=cols.filter(function(c){return c.key===p.cardStatusKey;})[0];
   return h('li',{key:id,className:'gr-dt__card','data-state':selected[id]?'selected':undefined},
    h('div',{className:'gr-dt__card-head'},p.selectable?h(Checkbox,{'aria-label':'Select row',checked:!!selected[id],onChange:function(){toggle(id);}}):null,h('div',{className:'gr-dt__card-title'},cellValue(tcol,r)),p.rowActions?h(OverflowMenu,{items:p.rowActions(r),label:'Row actions'}):null),
    scol?h('div',null,cellValue(scol,r)):null,
    h('dl',{className:'gr-dt__card-grid'},cols.filter(function(c){return c!==tcol&&c!==scol&&!c.hideOnCard;}).map(function(c){return h('div',{key:c.key},h('dt',null,c.header),h('dd',null,cellValue(c,r)));})));}));}
 else{body=h('div',{className:'gr-tbl__scroll',style:p.maxHeight?{maxHeight:p.maxHeight}:undefined},
   h('table',{className:'gr-tbl__table','aria-busy':p.loading?true:undefined},
    h('caption',{className:'gr-sr'},p.title||'Table'),
    h('thead',{className:'gr-tbl__head'},h('tr',null,
     p.selectable?h('th',{scope:'col',className:'gr-tbl__th gr-tbl__check'},h(Checkbox,{'aria-label':'Select all rows on this page',checked:allOnPage,indeterminate:someOnPage&&!allOnPage,onChange:toggleAll})):null,
     cols.map(function(c){var dir=sort&&sort.key===c.key?sort.dir:'none';
      return h('th',{key:c.key,scope:'col',className:'gr-tbl__th','data-align':c.align||'start','aria-sort':c.sortable?(dir==='asc'?'ascending':dir==='desc'?'descending':'none'):undefined,style:c.width?{width:c.width}:undefined},
       c.sortable?h('button',{type:'button',className:'gr-tbl__sort','data-sort':dir,onClick:function(){sortBy(c);}},c.header,h(Icon,{name:dir==='asc'?'arrow--up':dir==='desc'?'arrow--down':'arrows--vertical',size:16})):c.header);}),
     p.rowActions?h('th',{scope:'col',className:'gr-tbl__th gr-tbl__actions'},h('span',{className:'gr-sr'},'Actions')):null)),
    h('tbody',null,p.loading?[0,1,2,3,4].map(function(i){return h('tr',{key:'sk'+i,className:'gr-tbl__row'},p.selectable?h('td',{className:'gr-tbl__td gr-tbl__check'}):null,cols.map(function(c){return h('td',{key:c.key,className:'gr-tbl__td'},h('span',{className:'gr-skel'}));}),p.rowActions?h('td',{className:'gr-tbl__td'}):null);}):
     paged.map(function(r,i){var id=getId(r,i);return h('tr',{key:id,className:'gr-tbl__row','data-state':selected[id]?'selected':undefined,'aria-selected':p.selectable?!!selected[id]:undefined},
      p.selectable?h('td',{className:'gr-tbl__td gr-tbl__check'},h(Checkbox,{'aria-label':'Select row',checked:!!selected[id],onChange:function(){toggle(id);}})):null,
      cols.map(function(c){return h('td',{key:c.key,className:'gr-tbl__td','data-align':c.align||'start'},cellValue(c,r));}),
      p.rowActions?h('td',{className:'gr-tbl__td gr-tbl__actions'},h(OverflowMenu,{items:p.rowActions(r),label:'Row actions',size:'sm'})):null);}))));}
 return h('div',{ref:wrap,className:cx('gr-dt','gr-tbl',p.className),'data-density':p.density||'default','data-layout':cards?'cards':'table'},head,body,
  (p.paginate!==false&&!p.error&&sorted.length>0)?h(Pagination,{totalItems:sorted.length,page:page,pageSize:size,onPageChange:setPage,onPageSizeChange:function(n){setSize(n);setPage(1);},pageSizeOptions:p.pageSizeOptions}):null);}

function useOutside(ref,open,close){useEffect(function(){if(!open)return;function f(e){if(ref.current&&!ref.current.contains(e.target))close();}document.addEventListener('mousedown',f);return function(){document.removeEventListener('mousedown',f);};},[open]);}
function Popover(p){var s=useState(!!p.defaultOpen),o=s[0],setO=s[1];var open=p.open!==undefined?p.open:o;var ref=useRef(null);var auto=useId();
 function set(v){if(p.open===undefined)setO(v);if(p.onOpenChange)p.onOpenChange(v);}
 useOutside(ref,open,function(){set(false);});
 var trig=React.cloneElement(React.Children.only(p.trigger),{'aria-expanded':open,'aria-haspopup':'dialog','aria-controls':auto,onClick:function(){set(!open);}});
 return h('span',{ref:ref,className:cx('gr-pop','gr-pop--'+(p.align||'start')),onKeyDown:function(e){if(e.key==='Escape'&&open){set(false);}}},trig,
  open?h('div',{id:auto,role:'dialog','aria-label':p.label||(typeof p.title==='string'?p.title:undefined),className:'gr-pop__panel',style:p.width?{width:p.width}:undefined},p.title?h('div',{className:'gr-pop__title'},p.title):null,p.children):null);}
function Combobox(p){var auto=useId();var id=p.id||auto;var opts=p.options||[];var sv=useState(p.defaultValue||''),cur=sv[0],setCur=sv[1];var val=p.value!==undefined?p.value:cur;
 var sel=opts.filter(function(o){return o.value===val;})[0];var sq=useState(sel?sel.label:''),q=sq[0],setQ=sq[1];var so=useState(!!p.defaultOpen),open=so[0],setOpen=so[1];var sa=useState(0),act=sa[0],setAct=sa[1];var ref=useRef(null);
 useOutside(ref,open,function(){setOpen(false);});
 var ql=q.toLowerCase();var list=(sel&&q===sel.label)||!q?opts:opts.filter(function(o){return (o.label+' '+(o.description||'')).toLowerCase().indexOf(ql)>=0;});
 function choose(o){if(p.value===undefined)setCur(o.value);setQ(o.label);setOpen(false);if(p.onChange)p.onChange(o.value,o);}
 function onKey(e){if(e.key==='ArrowDown'){e.preventDefault();if(!open)setOpen(true);else setAct(Math.min(act+1,list.length-1));}else if(e.key==='ArrowUp'){e.preventDefault();setAct(Math.max(act-1,0));}else if(e.key==='Enter'&&open&&list[act]){e.preventDefault();choose(list[act]);}else if(e.key==='Escape'){setOpen(false);}}
 var input=h('input',{id:id,className:'gr-field__input',role:'combobox','aria-expanded':open,'aria-controls':id+'-list','aria-autocomplete':'list','aria-activedescendant':open&&list[act]?id+'-o-'+act:undefined,'aria-invalid':p.error?true:undefined,'aria-describedby':(p.error||p.helpText)?id+'-msg':undefined,placeholder:p.placeholder,value:q,disabled:p.disabled,required:p.required,autoComplete:'off',
  onChange:function(e){setQ(e.target.value);setOpen(true);setAct(0);},onFocus:function(){setOpen(true);},onKeyDown:onKey});
 return h('div',{ref:ref,className:'gr-pickwrap'},
  h(FormField,{id:id,label:p.label,required:p.required,helpText:p.helpText,error:p.error,size:p.size,width:p.width,disabled:p.disabled,kind:'icon',trailing:h('span',{className:'gr-field__deco'},h(Icon,{name:'search',size:20}))},input),
  open?h('ul',{id:id+'-list',role:'listbox',className:'gr-list'},list.length?list.map(function(o,i){return h('li',{key:o.value,id:id+'-o-'+i,role:'option','aria-selected':o.value===val,className:cx('gr-list__opt',i===act&&'is-active',o.value===val&&'is-selected'),onMouseDown:function(e){e.preventDefault();choose(o);},onMouseEnter:function(){setAct(i);}},h('span',{className:'gr-list__label'},o.label,o.description?h('span',{className:'gr-list__desc'},o.description):null),o.value===val?h(Icon,{name:'checkmark',size:16,className:'gr-list__check'}):null);}):h('li',{className:'gr-list__empty',role:'presentation'},p.emptyText||'No matches')):null);}
function MultiSelect(p){var auto=useId();var id=p.id||auto;var opts=p.options||[];var sv=useState(p.defaultValue||[]),cur=sv[0],setCur=sv[1];var val=p.value!==undefined?p.value:cur;var so=useState(!!p.defaultOpen),open=so[0],setOpen=so[1];var ref=useRef(null);
 useOutside(ref,open,function(){setOpen(false);});
 function set(v){if(p.value===undefined)setCur(v);if(p.onChange)p.onChange(v);}
 function toggle(v){set(val.indexOf(v)>=0?val.filter(function(x){return x!==v;}):val.concat([v]));}
 var chosen=opts.filter(function(o){return val.indexOf(o.value)>=0;});
 var trigger=h('div',{className:'gr-ms__value'},
  h('button',{type:'button',id:id,className:'gr-ms__trigger','aria-haspopup':'listbox','aria-expanded':open,'aria-controls':id+'-list','aria-describedby':(p.error||p.helpText)?id+'-msg':undefined,disabled:p.disabled,onClick:function(){setOpen(!open);},onKeyDown:function(e){if(e.key==='Escape')setOpen(false);if(e.key==='ArrowDown'){e.preventDefault();setOpen(true);}}},
   chosen.length?h('span',{className:'gr-sr'},chosen.map(function(c){return c.label;}).join(', ')):h('span',{className:'gr-ms__ph'},p.placeholder||'Select...')),
  chosen.length?h('span',{className:'gr-ms__chips'},chosen.map(function(c){return h('span',{key:c.value,className:'gr-chip'},c.label,h('button',{type:'button',className:'gr-chip__x','aria-label':'Remove '+c.label,onClick:function(){toggle(c.value);}},h(Icon,{name:'close',size:16})));})):null);
 return h('div',{ref:ref,className:'gr-pickwrap',onKeyDown:function(e){if(e.key==='Escape')setOpen(false);}},
  h(FormField,{id:id,label:p.label,required:p.required,helpText:p.helpText,error:p.error,size:p.size,width:p.width,disabled:p.disabled,kind:'select',className:'gr-ms',trailing:h('span',{className:'gr-field__deco'},h(Icon,{name:'chevron--down',size:20}))},trigger),
  open?h('ul',{id:id+'-list',role:'listbox','aria-multiselectable':true,'aria-labelledby':id,className:'gr-list'},opts.map(function(o){var on=val.indexOf(o.value)>=0;
   return h('li',{key:o.value,role:'option','aria-selected':on,className:cx('gr-list__opt',on&&'is-selected')},h(Checkbox,{label:o.label,checked:on,onChange:function(){toggle(o.value);}}));})):null);}
var MON=['January','February','March','April','May','June','July','August','September','October','November','December'];
function pad(n){return (n<10?'0':'')+n;}
function iso(d){return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());}
function parseIso(s){if(!s)return null;var a=s.split('-');return new Date(+a[0],+a[1]-1,+a[2]);}
function fmt(s){var d=parseIso(s);return d?pad(d.getDate())+' '+MON[d.getMonth()].slice(0,3)+' '+d.getFullYear():'';}
function DatePicker(p){var auto=useId();var id=p.id||auto;var sv=useState(p.defaultValue||''),cur=sv[0],setCur=sv[1];var val=p.value!==undefined?p.value:cur;var so=useState(!!p.defaultOpen),open=so[0],setOpen=so[1];var ref=useRef(null);
 var base=parseIso(val)||parseIso(p.today)||new Date();var sm=useState(new Date(base.getFullYear(),base.getMonth(),1)),month=sm[0],setMonth=sm[1];var today=p.today||iso(new Date());
 useOutside(ref,open,function(){setOpen(false);});
 function pick(d){var v=iso(d);if(p.value===undefined)setCur(v);setOpen(false);if(p.onChange)p.onChange(v);var b=ref.current&&ref.current.querySelector('.gr-date__btn');if(b)b.focus();}
 var first=(month.getDay()+6)%7;var days=new Date(month.getFullYear(),month.getMonth()+1,0).getDate();var cells=[];for(var i=0;i<first;i++)cells.push(null);for(var d=1;d<=days;d++)cells.push(new Date(month.getFullYear(),month.getMonth(),d));
 var weeks=[];for(var w=0;w<cells.length;w+=7)weeks.push(cells.slice(w,w+7));
 function out(dd){var v=iso(dd);return (p.min&&v<p.min)||(p.max&&v>p.max);}
 function gridKey(e){var t=e.target;if(!t.dataset||!t.dataset.day)return;var dd=parseIso(t.dataset.day);var step={ArrowLeft:-1,ArrowRight:1,ArrowUp:-7,ArrowDown:7}[e.key];if(!step)return;e.preventDefault();dd.setDate(dd.getDate()+step);if(dd.getMonth()!==month.getMonth())setMonth(new Date(dd.getFullYear(),dd.getMonth(),1));setTimeout(function(){var n=ref.current&&ref.current.querySelector('[data-day="'+iso(dd)+'"]');if(n)n.focus();},0);}
 var btn=h('button',{type:'button',id:id,className:'gr-date__btn','aria-haspopup':'dialog','aria-expanded':open,'aria-describedby':(p.error||p.helpText)?id+'-msg':undefined,disabled:p.disabled,onClick:function(){setOpen(!open);}},val?fmt(val):h('span',{className:'gr-ms__ph'},p.placeholder||'DD MMM YYYY'));
 return h('div',{ref:ref,className:'gr-pickwrap',onKeyDown:function(e){if(e.key==='Escape')setOpen(false);}},
  h(FormField,{id:id,label:p.label,required:p.required,helpText:p.helpText,error:p.error,size:p.size||'s',width:p.width,disabled:p.disabled,kind:'select',trailing:h('span',{className:'gr-field__deco'},h(Icon,{name:'calendar',size:20}))},btn),
  open?h('div',{role:'dialog','aria-label':'Choose date',className:'gr-cal'},
   h('div',{className:'gr-cal__head'},h(IconButton,{icon:'chevron--left',label:'Previous month',size:'sm',tooltip:false,onClick:function(){setMonth(new Date(month.getFullYear(),month.getMonth()-1,1));}}),h('span',{className:'gr-cal__month','aria-live':'polite'},MON[month.getMonth()]+' '+month.getFullYear()),h(IconButton,{icon:'chevron--right',label:'Next month',size:'sm',tooltip:false,onClick:function(){setMonth(new Date(month.getFullYear(),month.getMonth()+1,1));}})),
   h('table',{className:'gr-cal__grid',role:'grid',onKeyDown:gridKey},h('thead',null,h('tr',null,['Mo','Tu','We','Th','Fr','Sa','Su'].map(function(x){return h('th',{key:x,scope:'col',className:'gr-cal__dow'},x);}))),
    h('tbody',null,weeks.map(function(wk,wi){return h('tr',{key:wi},[0,1,2,3,4,5,6].map(function(k){var dd=wk[k];if(!dd)return h('td',{key:k});var v=iso(dd);var isSel=v===val;
     return h('td',{key:k},h('button',{type:'button','data-day':v,tabIndex:isSel||(!val&&v===today)?0:-1,disabled:out(dd),'aria-pressed':isSel,'aria-label':fmt(v),className:cx('gr-cal__day',isSel&&'is-selected',v===today&&'is-today'),onClick:function(){pick(dd);}},dd.getDate()));}));})))):null);}
function fsize(b){return b>=1048576?(b/1048576).toFixed(1)+' MB':Math.max(1,Math.round(b/1024))+' KB';}
function FileUpload(p){var auto=useId();var id=p.id||auto;var sf=useState(p.defaultFiles||[]),files=sf[0],setFiles=sf[1];var sd=useState(false),drag=sd[0],setDrag=sd[1];var inp=useRef(null);var max=(p.maxSizeMB||20)*1048576;
 function add(list){var arr=[].slice.call(list).map(function(f){var ok=f.size<=max;return {name:f.name,size:f.size,status:ok?'complete':'error',error:ok?null:'File is larger than '+(p.maxSizeMB||20)+' MB.'};});var next=p.multiple===false?arr.slice(0,1):files.concat(arr);setFiles(next);if(p.onFilesAdded)p.onFilesAdded(list);}
 function remove(i){var n=files.slice();var r=n.splice(i,1);setFiles(n);if(p.onRemove)p.onRemove(r[0]);}
 var ST={uploading:'Uploading…',scanning:'Scanning for viruses…',complete:null,error:null};
 return h('div',{className:cx('gr-upload',p.className)},
  p.label?h('div',{className:'gr-upload__label',id:id+'-label'},p.label,p.required?h('span',{className:'gr-req','aria-hidden':true},' *'):null):null,
  h('div',{className:'gr-upload__zone','data-state':drag?'dragover':undefined,onDragOver:function(e){e.preventDefault();setDrag(true);},onDragLeave:function(){setDrag(false);},onDrop:function(e){e.preventDefault();setDrag(false);add(e.dataTransfer.files);}},
   h(Icon,{name:'upload',size:24,className:'gr-upload__icon'}),
   h('div',{className:'gr-upload__text'},'Drag files here or ',h('button',{type:'button',className:'gr-upload__browse','aria-describedby':id+'-hint',onClick:function(){inp.current&&inp.current.click();}},'browse'),'.'),
   h('div',{className:'gr-upload__hint',id:id+'-hint'},p.hint||('PDF, DOC, XLS, JPG or PNG · up to '+(p.maxSizeMB||20)+' MB each')),
   h('input',{ref:inp,type:'file',className:'gr-sr',tabIndex:-1,multiple:p.multiple!==false,accept:p.accept,'aria-labelledby':id+'-label',onChange:function(e){add(e.target.files);e.target.value='';}})),
  files.length?h('ul',{className:'gr-upload__list','aria-label':'Files'},files.map(function(f,i){
   return h('li',{key:f.name+i,className:'gr-upload__file','data-status':f.status},
    h(Icon,{name:'document',size:20,className:'gr-upload__ficon'}),
    h('div',{className:'gr-upload__meta'},h('span',{className:'gr-upload__name'},f.name),
     f.status==='error'?h('span',{className:'gr-upload__err',role:'alert'},f.error||'Upload failed.'):h('span',{className:'gr-upload__sub'},(ST[f.status]?ST[f.status]+' · ':'')+(f.size!=null?fsize(f.size):'')),
     f.status==='uploading'?h(ProgressBar,{value:f.progress||0,size:'sm',label:'Uploading '+f.name,hideLabel:true}):null),
    f.status==='complete'?h(Icon,{name:'checkmark--filled',size:20,className:'gr-upload__ok',title:'Uploaded'}):f.status==='error'?h(Icon,{name:'warning--filled',size:20,className:'gr-upload__bad',title:'Error'}):null,
    h(IconButton,{icon:'close',label:'Remove '+f.name,size:'sm',onClick:function(){remove(i);}}));})):null);}
function ProgressBar(p){var v=Math.max(0,Math.min(100,p.value||0));var st=p.status||(v>=100?'success':'active');var auto=useId();
 return h('div',{className:cx('gr-prog','gr-prog--'+(p.size||'md'),p.className),'data-status':st},
  (p.label&&!p.hideLabel)?h('div',{className:'gr-prog__top'},h('span',{id:auto,className:'gr-prog__label'},p.label),h('span',{className:'gr-prog__val'},Math.round(v)+'%')):null,
  h('div',{className:'gr-prog__track',role:'progressbar','aria-valuemin':0,'aria-valuemax':100,'aria-valuenow':Math.round(v),'aria-labelledby':p.label&&!p.hideLabel?auto:undefined,'aria-label':p.hideLabel?p.label:undefined},h('div',{className:'gr-prog__fill',style:{width:v+'%'}})),
  p.helperText?h('div',{className:'gr-prog__help'},p.helperText):null);}
function ReadinessRing(p){var v=Math.max(0,Math.min(100,p.value||0));var big=p.size==='lg';var S=big?120:80,W=big?10:8,R=(S-W)/2,C=2*Math.PI*R;
 return h('div',{className:cx('gr-ring',big&&'gr-ring--lg',p.className),role:'img','aria-label':(p.label||'Readiness')+': '+Math.round(v)+'%'},
  h('span',{className:'gr-ring__viz'},h('svg',{width:S,height:S,viewBox:'0 0 '+S+' '+S,'aria-hidden':true},h('circle',{cx:S/2,cy:S/2,r:R,fill:'none',className:'gr-ring__track',strokeWidth:W}),h('circle',{cx:S/2,cy:S/2,r:R,fill:'none',className:'gr-ring__fill',strokeWidth:W,strokeLinecap:'round',strokeDasharray:(C*v/100)+' '+C,transform:'rotate(-90 '+S/2+' '+S/2+')'})),
   h('span',{className:'gr-ring__num'},Math.round(v)+'%')),
  (p.label||p.caption)?h('span',{className:'gr-ring__text'},p.label?h('span',{className:'gr-ring__label'},p.label):null,p.caption?h('span',{className:'gr-ring__cap'},p.caption):null):null);}
function Drawer(p){var ref=useRef(null);var auto=useId();
 useEffect(function(){if(!p.open||p.inline)return;var prev=document.activeElement;var f=ref.current&&ref.current.querySelectorAll(FOCUSABLE);if(f&&f.length)f[0].focus();var ov=document.body.style.overflow;document.body.style.overflow='hidden';return function(){document.body.style.overflow=ov;if(prev&&prev.focus)prev.focus();};},[p.open,p.inline]);
 if(!p.open)return null;
 function onKey(e){if(e.key==='Escape'&&p.onClose){e.stopPropagation();p.onClose();}if(e.key==='Tab'){var f=ref.current.querySelectorAll(FOCUSABLE);if(!f.length)return;var a=f[0],z=f[f.length-1];if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus();}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus();}}}
 return h('div',{className:cx('gr-drawer',p.inline&&'gr-drawer--inline'),onMouseDown:function(e){if(e.target===e.currentTarget&&p.onClose)p.onClose();}},
  h('div',{ref:ref,role:'dialog','aria-modal':true,'aria-labelledby':auto,className:cx('gr-drawer__panel','gr-drawer__panel--'+(p.size||'md')),onKeyDown:onKey},
   h('div',{className:'gr-drawer__head'},h('div',null,h('h2',{id:auto,className:'gr-drawer__title'},p.title),p.subtitle?h('div',{className:'gr-drawer__sub'},p.subtitle):null),p.onClose?h(IconButton,{icon:'close',label:'Close',size:'md',tooltip:false,onClick:p.onClose}):null),
   h('div',{className:'gr-drawer__body'},p.children),
   p.footer?h('div',{className:'gr-drawer__foot'},p.footer):null));}
function Avatar(p){var n=(p.name||'').trim().split(/\s+/);var ini=((n[0]||'')[0]||'')+(n.length>1?(n[n.length-1][0]||''):'');
 return h('span',{className:cx('gr-avatar','gr-avatar--'+(p.size||'md'),p.className),role:'img','aria-label':p.name||'User'},p.src?h('img',{src:p.src,alt:''}):ini.toUpperCase()||h(Icon,{name:'user--avatar',size:20}));}
function NotificationBadge(p){var c=p.count||0;var txt=c>(p.max||99)?(p.max||99)+'+':String(c);var show=p.dot||c>0;
 return h('span',{className:'gr-badge-wrap'},p.children,show?h('span',{className:cx('gr-badge',p.dot&&'gr-badge--dot'),'aria-hidden':true},p.dot?null:txt):null,show?h('span',{className:'gr-sr'},p.label||(c+' unread notifications')):null);}
function Separator(p){var v=p.orientation==='vertical';return h('div',{role:p.decorative?'none':'separator','aria-orientation':v?'vertical':undefined,className:cx('gr-sep',v&&'gr-sep--v',p.className),style:p.spacing!==undefined?(v?{marginLeft:p.spacing,marginRight:p.spacing}:{marginTop:p.spacing,marginBottom:p.spacing}):undefined});}
function Skeleton(p){var v=p.variant||'text';if(v==='text'&&p.lines>1){var a=[];for(var i=0;i<p.lines;i++)a.push(h('span',{key:i,className:'gr-skel',style:{width:i===p.lines-1?'60%':'100%'}}));return h('span',{className:'gr-skel-stack','aria-hidden':true},a);}
 return h('span',{className:cx('gr-skel','gr-skel--'+v),'aria-hidden':true,style:{width:p.width,height:p.height}});}
function EmptyState(p){return h('div',{className:cx('gr-empty','gr-empty--'+(p.size||'md'),p.className)},p.icon?h('span',{className:'gr-empty__icon'},h(Icon,{name:p.icon,size:24})):null,h('div',{className:'gr-empty__title'},p.title),p.body?h('div',{className:'gr-empty__body'},p.body):null,p.action?h('div',{className:'gr-empty__action'},p.action):null);}
function TreeView(p){var items=p.items||[];var init={};(p.defaultExpanded||[]).forEach(function(k){init[k]=true;});var se=useState(init),exp=se[0],setExp=se[1];var ss=useState(p.defaultSelected||null),sel=ss[0],setSel=ss[1];var selected=p.selected!==undefined?p.selected:sel;var ref=useRef(null);
 var flat=[];(function walk(list,lvl,parent){list.forEach(function(it){flat.push({it:it,lvl:lvl,parent:parent});if(it.children&&exp[it.id])walk(it.children,lvl+1,it.id);});})(items,1,null);
 var sf=useState(flat.length?flat[0].it.id:null),foc=sf[0],setFoc=sf[1];
 function choose(it){if(p.selected===undefined)setSel(it.id);if(p.onSelect)p.onSelect(it.id,it);}
 function focusId(idv){setFoc(idv);setTimeout(function(){var n=ref.current&&ref.current.querySelector('[data-id="'+idv+'"]');if(n)n.focus();},0);}
 function onKey(e){var i=flat.findIndex(function(f){return f.it.id===foc;});if(i<0)return;var f=flat[i];var hasKids=f.it.children&&f.it.children.length;
  if(e.key==='ArrowDown'&&i<flat.length-1){e.preventDefault();focusId(flat[i+1].it.id);}
  else if(e.key==='ArrowUp'&&i>0){e.preventDefault();focusId(flat[i-1].it.id);}
  else if(e.key==='ArrowRight'){e.preventDefault();if(hasKids&&!exp[f.it.id]){var n=Object.assign({},exp);n[f.it.id]=true;setExp(n);}else if(hasKids&&flat[i+1])focusId(flat[i+1].it.id);}
  else if(e.key==='ArrowLeft'){e.preventDefault();if(hasKids&&exp[f.it.id]){var n2=Object.assign({},exp);n2[f.it.id]=false;setExp(n2);}else if(f.parent)focusId(f.parent);}
  else if(e.key==='Enter'||e.key===' '){e.preventDefault();choose(f.it);}}
 function toggle(idv){var n=Object.assign({},exp);n[idv]=!exp[idv];setExp(n);}
 function render(list,lvl){return list.map(function(it,idx){var kids=it.children&&it.children.length;var open=!!exp[it.id];
  return h('li',{key:it.id,role:'treeitem','aria-level':lvl,'aria-setsize':list.length,'aria-posinset':idx+1,'aria-expanded':kids?open:undefined,'aria-selected':selected===it.id,className:'gr-tree__item'},
   h('div',{'data-id':it.id,tabIndex:foc===it.id?0:-1,className:cx('gr-tree__row',selected===it.id&&'is-selected'),style:{paddingLeft:8+(lvl-1)*24},onClick:function(){setFoc(it.id);choose(it);},onFocus:function(){setFoc(it.id);}},
    kids?h('span',{className:cx('gr-tree__chev',open&&'is-open'),onClick:function(e){e.stopPropagation();toggle(it.id);}},h(Icon,{name:'chevron--right',size:16})):h('span',{className:'gr-tree__chev gr-tree__chev--leaf'}),
    it.icon?h(Icon,{name:it.icon,size:16,className:'gr-tree__icon'}):null,
    h('span',{className:'gr-tree__label'},it.label),it.meta?h('span',{className:'gr-tree__meta'},it.meta):null),
   kids&&open?h('ul',{role:'group',className:'gr-tree__group'},render(it.children,lvl+1)):null);});}
 return h('ul',{ref:ref,role:'tree','aria-label':p.label||'Tree',className:cx('gr-tree',p.className),onKeyDown:onKey},render(items,1));}
var NAV_ST={complete:['checkmark--filled','Complete'],incomplete:[null,'Required information missing'],error:['warning--filled','Has errors'],optional:[null,'']};
function SectionNav(p){var items=p.items||[];var sa=useState(p.defaultActive||(items[0]&&items[0].id)),a=sa[0],setA=sa[1];var act=p.active!==undefined?p.active:a;var mode=p.variant||'text';
 return h('nav',{'aria-label':p.label||'Sections',className:cx('gr-snav','gr-snav--'+mode,p.className)},h('ul',{className:'gr-snav__list'},items.map(function(it){var cur=it.id===act;var st=NAV_ST[it.status]||NAV_ST.optional;
  var dot=it.status==='complete'?h(Icon,{name:'checkmark--filled',size:16,className:'gr-snav__ok'}):it.status==='error'?h(Icon,{name:'warning--filled',size:16,className:'gr-snav__bad'}):it.status==='incomplete'?h('span',{className:'gr-snav__dot'}):null;
  return h('li',{key:it.id},h('a',{href:it.href||'#'+it.id,className:cx('gr-snav__item',cur&&'is-current'),'aria-current':cur?'step':undefined,onClick:function(e){if(!it.href)e.preventDefault();if(p.active===undefined)setA(it.id);if(p.onSelect)p.onSelect(it.id);}},
   mode==='icon'&&it.icon?h(Icon,{name:it.icon,size:20,className:'gr-snav__icon'}):null,
   h('span',{className:'gr-snav__label'},it.label),
   dot?h('span',{className:'gr-snav__st'},dot):null,
   st[1]?h('span',{className:'gr-sr'},' – '+st[1]):null));})));}

function Logo(p){return h('a',{href:p.href||'#',className:'gr-logo','aria-label':(p.siteName||'SGS')+' – home'},h('span',{className:'gr-logo__mark'},'SGS'),p.siteName?h('span',{className:'gr-logo__div','aria-hidden':true}):null,p.siteName?h('span',{className:'gr-logo__site'},h('span',{className:'gr-logo__name'},p.siteName),p.siteSub?h('span',{className:'gr-logo__sub'},p.siteSub):null):null);}
function TopBar(p){var v=p.variant||'home';var compact=!!p.compact;
 var right=null;
 if(v==='landing'){right=h('div',{className:'gr-top__right'},h('nav',{'aria-label':'Main',className:'gr-top__nav'},(p.links||['Services','Contact Us','How It Works']).map(function(l,i){return h('a',{key:i,href:'#',className:'gr-top__link'},l);})),h(Button,{size:'md',variant:'primary'},p.loginLabel||'Log In'),h(LanguageSelector,{compact:true}));}
 else if(v==='login'){right=p.showLanguage===false?null:h('div',{className:'gr-top__right'},h(LanguageSelector,{compact:compact}));}
 else{var n=p.notifications||0;right=h('div',{className:'gr-top__right'},
   (p.homeLinks||[{label:'Request Applications',icon:'folder',brand:true},{label:'Communications',icon:'events'}]).map(function(l,i){return compact?h(IconButton,{key:i,icon:l.icon||'folder',label:l.label,size:'md'}):h('a',{key:i,href:l.href||'#',className:cx('gr-top__link',l.brand&&'gr-top__link--brand')},l.label);}),
   h(NotificationBadge,{count:n,label:n+' unread notifications'},h(IconButton,{icon:'notification',label:'Notifications',size:'md'})),
   h(Popover,{align:'end',label:'Account',width:240,trigger:h('button',{type:'button',className:'gr-top__user','aria-label':'Account: '+(p.userName||'User')},h(Avatar,{name:p.userName,size:'md'}))},
    h('div',{className:'gr-top__acct'},h('div',{className:'gr-top__acct-name'},p.userName||'User'),p.userEmail?h('div',{className:'gr-top__acct-mail'},p.userEmail):null),
    h(Separator,{spacing:8}),h('div',{className:'gr-top__acct-links'},h(Link,{href:'#'},'Profile'),h(Link,{href:'#'},'Settings'),h(Link,{href:'#'},'Sign out'))));}
 return h('header',{'data-theme':p.tone==='dark'?'inverse':undefined,className:cx('gr-top','gr-top--'+v,compact&&'gr-top--compact',p.tone==='dark'&&'gr-top--dark',p.className)},h('div',{className:'gr-top__left'},h(Logo,{siteName:p.siteName,siteSub:p.siteSub}),p.badge?h(Tag,{tone:'neutral'},p.badge):null),right);}
var SAVE={saved:['checkmark','All changes saved'],saving:['save','Saving…'],error:['warning--filled','Changes not saved']};
function PageHeader(p){var compact=!!p.compact;var sv=p.autosave&&SAVE[p.autosave];
 return h('div',{className:cx('gr-ph',compact&&'gr-ph--compact',p.className)},
  h('div',{className:'gr-ph__left'},
   p.onBack?h(IconButton,{icon:'arrow--left',label:p.backLabel||'Back',variant:'ghost',size:'md',className:'gr-ph__back',onClick:p.onBack}):null,
   h('div',{className:'gr-ph__titles'},h('h1',{className:'gr-ph__title'},p.title),p.subtitle?h('p',{className:'gr-ph__sub'},p.subtitle):null),
   p.status?h(StatusTag,{status:p.status.status,label:compact&&p.status.shortLabel?p.status.shortLabel:p.status.label,showIcon:!compact,size:'sm'}):null,
   sv?h('span',{className:cx('gr-ph__save','gr-ph__save--'+p.autosave),role:'status'},compact?h('span',{className:'gr-ph__save-ic'},h(Icon,{name:'save',size:16}),h(Icon,{name:sv[0],size:16,title:sv[1]})):h(React.Fragment,null,h(Icon,{name:sv[0],size:16}),sv[1])):null),
  p.actions?h('div',{className:'gr-ph__actions'},compact&&p.compactActions?p.compactActions:p.actions):null);}
function Card(p){return h('section',{className:cx('gr-card',p.compact&&'gr-card--compact',p.extend&&'gr-card--extend',p.className),'aria-labelledby':p.title?undefined:undefined},
  (p.title||p.actions)?h('div',{className:'gr-card__head'},h('div',{className:'gr-card__heading'},p.number!=null?h('span',{className:'gr-card__num','aria-hidden':true},p.number):null,h('div',null,h('h2',{className:'gr-card__title'},p.number!=null?h('span',{className:'gr-sr'},'Step '+p.number+': '):null,p.title),p.subtitle?h('p',{className:'gr-card__sub'},p.subtitle):null)),p.actions?h('div',{className:'gr-card__actions'},p.actions):null):null,
  h('div',{className:'gr-card__body'},p.children),
  p.footer?h('div',{className:'gr-card__foot'},p.footer):null);}
var DOC_ACT={edit:['edit','Edit document description'],view:['view','View document description'],open:['launch','Open document'],delete:['trash-can','Delete document'],upload:['upload','Upload document'],download:['download','Download document']};
function DocumentItem(p){var v=p.variant||'standard';var compact=!!p.compact;var so=useState(!!p.defaultExpanded),open=so[0],setOpen=so[1];var auto=useId();
 var acts=(p.actions||[]).map(function(a){var d=DOC_ACT[a.type]||[a.icon,a.label];return {icon:a.icon||d[0],label:a.label||d[1],onClick:a.onClick};});
 var showIcon=!compact&&v==='standard'||(!compact&&v==='under-review');
 var line2=v==='actions-required'?h('button',{type:'button',className:'gr-doc__acc','aria-expanded':open,'aria-controls':auto+'-p',onClick:function(){setOpen(!open);}},p.accordionLabel||'Affected Products',h(Icon,{name:'chevron--down',size:16,className:'gr-doc__chev'})):
  h(Tooltip,{label:[p.fileName,p.dateLabel,p.size].filter(Boolean).join(' • ')},h('span',{className:'gr-doc__meta',tabIndex:compact?0:undefined},[p.fileName,p.dateLabel,p.size].filter(Boolean).join(' • ')));
 var status=p.status?h(StatusTag,{status:p.status,label:p.statusLabel,compact:compact,size:'md',className:'gr-doc__status'}):null;
 var actions=acts.length?(compact||acts.length>3?h(OverflowMenu,{size:'sm',label:'Document actions',items:acts.map(function(a){return {label:a.label,onClick:a.onClick};})}):h('div',{className:'gr-doc__actions'},acts.map(function(a,i){return h(IconButton,{key:i,icon:a.icon,label:a.label,size:'md',onClick:a.onClick});}))):null;
 return h('div',{className:cx('gr-doc','gr-doc--'+v,compact&&'gr-doc--compact',open&&'is-open',p.className)},
  h('div',{className:'gr-doc__row'},
   showIcon?h(Icon,{name:'document--pdf',size:24,className:'gr-doc__icon'}):null,
   h('div',{className:'gr-doc__info'},h('span',{className:'gr-doc__type'},p.docType),line2),
   status,actions),
  v==='actions-required'&&open?h('div',{id:auto+'-p',className:'gr-doc__panel'},p.children):null);}
function CommentThread(p){var ms=useState(p.messages||[]),msgs=ms[0],setMsgs=ms[1];var dv=useState(''),draft=dv[0],setDraft=dv[1];var list=useRef(null);
 function send(){var t=draft.trim();if(!t)return;var m={id:'m'+Date.now(),author:p.currentUser||'You',role:p.currentRole||'customer',time:'Just now',body:t};setMsgs(msgs.concat([m]));setDraft('');if(p.onSend)p.onSend(t);setTimeout(function(){if(list.current)list.current.scrollTop=list.current.scrollHeight;},0);}
 return h('section',{className:cx('gr-thread',p.className),'aria-label':p.title||'Messages'},
  p.title?h('div',{className:'gr-thread__head'},h('h2',{className:'gr-thread__title'},p.title),p.count!=null?h('span',{className:'gr-tabs__badge'},p.count):null):null,
  h('div',{ref:list,className:'gr-thread__list',style:p.maxHeight?{maxHeight:p.maxHeight}:undefined,role:'log','aria-live':'polite'},
   msgs.length?msgs.map(function(m){return h('article',{key:m.id,className:cx('gr-msg','gr-msg--'+(m.role||'customer'),m.internal&&'gr-msg--internal')},
     h('div',{className:'gr-msg__head'},h(Avatar,{name:m.author,size:'sm'}),h('span',{className:'gr-msg__author'},m.author),m.role==='sgs'?h(Tag,{tone:'info'},m.roleLabel||'SGS'):null,m.internal?h(Tag,{tone:'required'},'Internal note'):null,h('time',{className:'gr-msg__time'},m.time)),
     h('div',{className:'gr-msg__body'},m.body));}):h(EmptyState,{size:'sm',title:p.emptyTitle||'No messages yet',body:p.emptyBody||'Messages with your SGS reviewer appear here.'})),
  p.readOnly?null:h('div',{className:'gr-thread__composer'},
   h(Textarea,{label:p.composerLabel||'Write a message',hideLabel:true,rows:2,width:'100%',value:draft,placeholder:p.placeholder||'Write a message…',onChange:function(e){setDraft(e.target.value);},onKeyDown:function(e){if(e.key==='Enter'&&(e.metaKey||e.ctrlKey)){e.preventDefault();send();}}}),
   h('div',{className:'gr-thread__send'},h('span',{className:'gr-thread__hint'},'Ctrl + Enter to send'),h(Button,{size:'md',icon:'send',disabled:!draft.trim(),onClick:send},'Send'))));}

function sideContains(it,id){return it.id===id||(it.children||[]).some(function(c){return c.id===id;});}
function AppSidebar(p){var sections=p.sections||[{items:p.items||[]}];var sa=useState(p.defaultActive||null),a=sa[0],setA=sa[1];var act=p.active!==undefined?p.active:a;
 var sc=useState(!!p.defaultCollapsed),c=sc[0],setC=sc[1];var collapsed=p.collapsed!==undefined?p.collapsed:c;
 var init={};sections.forEach(function(s){(s.items||[]).forEach(function(it){if(it.children&&(it.defaultOpen||sideContains(it,act)))init[it.id]=true;});});var so=useState(init),open=so[0],setOpen=so[1];
 function go(it,e){if(!it.href&&e)e.preventDefault();if(p.active===undefined)setA(it.id);if(p.onSelect)p.onSelect(it.id,it);}
 function toggleCollapse(){var n=!collapsed;if(p.collapsed===undefined)setC(n);if(p.onCollapsedChange)p.onCollapsedChange(n);}
 function badge(it){return it.badge!=null?h('span',{className:cx('gr-side__badge',it.badgeTone==='attention'&&'gr-side__badge--attn')},it.badge,h('span',{className:'gr-sr'},' '+(it.badgeLabel||'items'))):null;}
 function leaf(it,child){var cur=it.id===act;
  var link=h('a',{href:it.href||'#',className:cx('gr-side__item',child&&'gr-side__item--child',cur&&'is-current'),'aria-current':cur?'page':undefined,onClick:function(e){go(it,e);}},
   !child&&it.icon?h(Icon,{name:it.icon,size:20,className:'gr-side__icon'}):null,
   h('span',{className:'gr-side__label'},it.label),badge(it));
  return collapsed&&!child?h(Tooltip,{label:it.label},link):link;}
 function group(it){var isOpen=!!open[it.id];var inside=sideContains(it,act);var gid='side-'+it.id;
  if(collapsed){return h(Popover,{label:it.label,title:it.label,width:240,trigger:h('button',{type:'button',className:cx('gr-side__item',inside&&'is-current'),'aria-label':it.label},h(Icon,{name:it.icon,size:20,className:'gr-side__icon'}),it.badge!=null?h('span',{className:'gr-side__dot','aria-hidden':true}):null)},
    h('ul',{className:'gr-side__flyout'},it.children.map(function(ch,i){return ch.type==='label'?h('li',{key:'l'+i,className:'gr-side__glabel'},ch.label):h('li',{key:ch.id},leaf(ch,true));})));}
  return h(React.Fragment,null,
   h('button',{type:'button',className:cx('gr-side__item',inside&&!isOpen&&'is-current',inside&&'is-within'),'aria-expanded':isOpen,'aria-controls':gid,onClick:function(){var n=Object.assign({},open);n[it.id]=!isOpen;setOpen(n);}},
    h(Icon,{name:it.icon,size:20,className:'gr-side__icon'}),h('span',{className:'gr-side__label'},it.label),badge(it),h(Icon,{name:'chevron--down',size:16,className:cx('gr-side__chev',isOpen&&'is-open')})),
   isOpen?h('ul',{id:gid,className:'gr-side__sub'},it.children.map(function(ch,i){return ch.type==='label'?h('li',{key:'l'+i,className:'gr-side__glabel gr-side__glabel--sub','aria-hidden':false},ch.label):h('li',{key:ch.id},leaf(ch,true));})):null);}
 return h('nav',{'aria-label':p.label||'Main','data-theme':p.tone==='dark'?'inverse':undefined,className:cx('gr-side',collapsed&&'gr-side--collapsed',p.tone==='dark'&&'gr-side--dark',p.className)},
  p.header?h('div',{className:'gr-side__header'},p.header):null,
  h('div',{className:'gr-side__scroll'},sections.map(function(s,si){return h('div',{key:si,className:'gr-side__section'},
   s.label?(collapsed?h(Separator,{spacing:8,decorative:true}):h('div',{className:'gr-side__slabel',id:'side-s'+si},s.label)):null,
   h('ul',{className:'gr-side__list','aria-labelledby':s.label&&!collapsed?'side-s'+si:undefined},(s.items||[]).map(function(it){return h('li',{key:it.id},it.children?group(it):leaf(it,false));})));})),
  p.collapsible===false?null:h('div',{className:'gr-side__foot'},h(IconButton,{icon:collapsed?'side-panel--open':'side-panel--close',label:collapsed?'Expand sidebar':'Collapse sidebar',size:'md',tooltipPlacement:'top',onClick:toggleCollapse})));}

var RQ_ST={met:['completed','Met'],partial:['needs-description','Partially met'],notmet:['missing-info','Not met'],na:['draft','N/A'],fulfilled:['completed','Fulfilled'],review:['under-review','Under review'],missing:['missing-info','Missing evidence']};
function RequirementNavigator(p){var groups=p.groups||[];var init={};(p.defaultExpanded||[]).forEach(function(k){init[k]=true;});var se=useState(init),exp=se[0],setExp=se[1];
 var ss=useState(p.defaultSelected||null),sel=ss[0],setSel=ss[1];var selected=p.selected!==undefined?p.selected:sel;
 var sq=useState(''),q=sq[0],setQ=sq[1];var sf=useState(p.defaultFilter||'all'),flt=sf[0],setF=sf[1];var labels=p.statusLabels||RQ_ST;
 function match(c){var okF=flt==='all'||(flt==='none'?!c.status:c.status===flt);var s=q.toLowerCase();var okQ=!s||(c.code+' '+c.title).toLowerCase().indexOf(s)>=0;return okF&&okQ;}
 function pick(c){if(p.selected===undefined)setSel(c.id);if(p.onSelect)p.onSelect(c.id,c);}
 var filterOpts=p.filterOptions||[{value:'all',label:'All'},{value:'none',label:'Not assessed'},{value:'notmet',label:'Not met'},{value:'partial',label:'Partially met'},{value:'met',label:'Met'},{value:'na',label:'N/A'}];
 var active=!!q||flt!=='all';
 return h('nav',{className:cx('gr-rnav',p.className),'aria-label':p.label||'Requirements'},
  p.framework?h('div',{className:'gr-rnav__fw'},
   h('div',{className:'gr-rnav__fw-top'},h('span',{className:'gr-rnav__fw-name'},p.framework.name),p.framework.progress!=null?h('span',{className:'gr-rnav__pct'},Math.round(p.framework.progress)+'%'):null),
   p.framework.progress!=null?h(ProgressBar,{value:p.framework.progress,size:'sm',label:p.framework.name+' progress',hideLabel:true}):null,
   p.framework.caption?h('span',{className:'gr-rnav__cap'},p.framework.caption):null):null,
  p.searchable===false?null:h('div',{className:'gr-dt__tools gr-rnav__tools'},
   h(SearchInput,{size:'s',width:'100%',placeholder:p.searchPlaceholder||'Search',label:'Search requirements',value:q,onChange:function(e){setQ(e.target.value);}}),
   p.filterable===false?null:h(Select,{label:'Filter by status',size:'s',width:120,value:flt,options:filterOpts,onChange:function(e,v){setF(v);}})),
  h('ul',{className:'gr-rnav__list'},groups.map(function(g){var kids=(g.children||[]).filter(match);var open=active?kids.length>0:!!exp[g.id];var inside=(g.children||[]).some(function(c){return c.id===selected;});
   if(active&&!kids.length)return null;var gid='rnav-'+g.id;
   return h('li',{key:g.id,className:'gr-rnav__group'},
    h('button',{type:'button',className:cx('gr-rnav__gbtn',inside&&'is-within'),'aria-expanded':open,'aria-controls':gid,onClick:function(){var n=Object.assign({},exp);n[g.id]=!exp[g.id];setExp(n);}},
     h(Icon,{name:'chevron--down',size:16,className:cx('gr-rnav__chev',open&&'is-open')}),
     g.code?h('span',{className:'gr-rnav__code'},g.code):null,
     h('span',{className:'gr-rnav__gtitle'},g.title),
     g.progress!=null?h('span',{className:'gr-rnav__pct'},Math.round(g.progress)+'%'):(g.count?h('span',{className:'gr-rnav__pct'},g.count):null),
     g.progress!=null?h('span',{className:'gr-rnav__gbar','aria-hidden':true},h('span',{style:{width:Math.max(0,Math.min(100,g.progress))+'%'}})):null),
    open?h('ul',{id:gid,className:'gr-rnav__items'},kids.map(function(c){var cur=c.id===selected;var st=c.status&&labels[c.status];
     return h('li',{key:c.id},h('button',{type:'button',className:cx('gr-rnav__item',cur&&'is-current'),'aria-current':cur?'true':undefined,onClick:function(){pick(c);}},
      h('span',{className:'gr-rnav__ititle'},h('span',{className:'gr-rnav__icode'},c.code),c.title),
      st?h(StatusTag,{status:st[0],label:st[1],size:'sm',className:'gr-rnav__tag'}):h('span',{className:'gr-rnav__none'},p.emptyStatusLabel||'Not assessed')));})):null);})),
  active&&!groups.some(function(g){return (g.children||[]).some(match);})?h(EmptyState,{size:'sm',title:'No matching requirements',body:'Try another search or filter.'}):null);}
window.Graphite=Object.assign(window.Graphite||{},{Button:Button,IconButton:IconButton,Link:Link,FormField:FormField,TextInput:TextInput,Textarea:Textarea,SearchInput:SearchInput,Select:Select,Checkbox:Checkbox,Radio:Radio,Toggle:Toggle,Tag:Tag,StatusTag:StatusTag,Icon:Icon,Tooltip:Tooltip,Snackbar:Snackbar,InlineNotification:InlineNotification,Modal:Modal,OverflowMenu:OverflowMenu,Tabs:Tabs,Breadcrumb:Breadcrumb,Accordion:Accordion,LanguageSelector:LanguageSelector,Table:Table,DataTable:DataTable,Pagination:Pagination,Popover:Popover,Combobox:Combobox,MultiSelect:MultiSelect,DatePicker:DatePicker,FileUpload:FileUpload,ProgressBar:ProgressBar,ReadinessRing:ReadinessRing,Drawer:Drawer,Avatar:Avatar,NotificationBadge:NotificationBadge,Separator:Separator,Skeleton:Skeleton,EmptyState:EmptyState,TreeView:TreeView,SectionNav:SectionNav,TopBar:TopBar,PageHeader:PageHeader,Card:Card,DocumentItem:DocumentItem,CommentThread:CommentThread,Logo:Logo,AppSidebar:AppSidebar,RequirementNavigator:RequirementNavigator});
})();
