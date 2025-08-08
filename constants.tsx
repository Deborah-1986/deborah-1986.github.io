

import React from 'react';

export const APP_TITLE = "Lady Beer";

export const EditIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-5 h-5"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
  </svg>
);

export const DeleteIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-5 h-5"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12.56 0c1.153 0 2.243.032 3.223.095M15 3.75V2.25A2.25 2.25 0 0 0 12.75 0h-1.5A2.25 2.25 0 0 0 9 2.25v1.5M16.5 3.75h-9" />
  </svg>
);

export const AddIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

export const CloseIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export const ExportIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-5 h-5"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

export const ImportIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-5 h-5"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
  </svg>
);

export const SettingsIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.108 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.11v1.093c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.142.854.108 1.204l.527.738c.32.447.27.96-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.78.93l-.15.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.149-.894c-.07-.424-.384-.764-.78-.93-.398-.164-.854-.142-1.204.108l-.738.527a1.125 1.125 0 0 1-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.272.806.108-1.204-.165-.397-.505.71-.93.78l-.894-.15c-.542-.09-.94-.56-.94-1.11v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.764-.383.93-.78.165-.398.142.854-.108-1.204l-.527-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.93l.15-.894Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
);

export const MenuIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
);

export const HomeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h7.5" />
  </svg>
);

export const BookOpenIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6-2.292m0 0V21M12 6.042A8.967 8.967 0 0 1 18 3.75m-6 2.292V3.75m0 2.292L6 3.75m6 2.292L18 3.75" />
  </svg>
);

export const PriceTagIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
  </svg>
);

export const BeerIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="currentColor" className={className || "w-10 h-10"}>
    <path d="M52.6,29.4C52.6,29.4,52.6,29.4,52.6,29.4L52.6,29.4c-0.7-4.2-2.3-8.3-4.6-11.9c-0.3-0.4-0.7-0.8-1.1-1.2 c-1.8-1.9-3.9-3.4-6.1-4.6c-0.2-0.1-0.4-0.2-0.6-0.3c-0.8-0.4-1.6-0.8-2.5-1.1c-0.1,0-0.2-0.1-0.3-0.1c-1.3-0.4-2.6-0.7-4-0.9 c-0.2,0-0.3,0-0.5,0c-0.2,0-0.3,0-0.5,0c-1.4,0.1-2.7,0.4-4,0.9c-0.1,0-0.2,0.1-0.3,0.1c-0.9,0.3-1.7,0.7-2.5,1.1 c-0.2,0.1-0.4,0.2-0.6,0.3c-2.3,1.1-4.3,2.7-6.1,4.6c-0.4,0.4-0.8,0.8-1.1,1.2c-2.3,3.6-3.9,7.6-4.6,11.9 c0,0-0.1,0.1-0.1,0.1c0,0.1-0.1,0.2-0.1,0.4c0,0.3-0.1,0.6-0.1,0.9c0,0.1,0,0.2,0,0.3l0,0c0,0.1,0,0.1,0,0.2v21.6 c0,3.8,3.1,6.9,6.9,6.9h1.6c-0.3-0.6-0.5-1.2-0.5-1.9c0-2.8,2.3-5.1,5.1-5.1h13.8c2.8,0,5.1,2.3,5.1,5.1c0,0.7-0.2,1.3-0.5,1.9 h1.6c3.8,0,6.9-3.1,6.9-6.9V30.9c0-0.1,0-0.1,0-0.2l0,0c0-0.1,0-0.2,0-0.3C52.7,30,52.7,29.7,52.6,29.4 C52.6,29.4,52.6,29.4,52.6,29.4z M39.4,12.3c0.3,0,0.6,0,0.8,0.1c0.1,0,0.2,0,0.3,0.1c0.8,0.2,1.5,0.5,2.2,0.8 c0.2,0.1,0.4,0.2,0.5,0.3c1.7,0.9,3.3,2.1,4.7,3.5c0.3,0.3,0.6,0.6,0.8,1c1.8,2.8,3,6.1,3.6,9.4H11.8c0.6-3.3,1.8-6.5,3.6-9.4 c0.3-0.4,0.6-0.7,0.8-1c1.4-1.4,3-2.6,4.7-3.5c0.2-0.1,0.4-0.2,0.5-0.3c0.7-0.3,1.4-0.6,2.2-0.8c0.1,0,0.2-0.1,0.3-0.1 c0.3-0.1,0.5-0.1,0.8-0.1H39.4z M49.2,50.8L49.2,50.8c0,2-1.6,3.6-3.6,3.6l0,0h-0.7c-0.4-1.4-1.7-2.4-3.2-2.4H18.1 c-1.5,0-2.8,1-3.2,2.4H14l0,0c-2,0-3.6-1.6-3.6-3.6l0,0V31.2h38.8L49.2,50.8z"/>
    <path d="M29.1,23.5c-0.8-1.3-1.5-2.6-2.1-3.9c-0.6-1.2-1-2.5-1.4-3.7c-0.1-0.4-0.2-0.8-0.4-1.2c-0.1-0.5-0.3-0.9-0.5-1.3 c-0.1-0.2-0.2-0.3-0.2-0.5c-0.3-0.6-0.7-1.2-1.1-1.8c-0.1-0.1-0.1-0.2-0.2-0.3c-0.1-0.1-0.2-0.2-0.2-0.4c-0.2-0.3-0.4-0.5-0.6-0.8 c-0.1-0.1-0.2-0.2-0.3-0.3l0,0c-0.1-0.1-0.2-0.1-0.2-0.2c-0.3-0.3-0.6-0.5-0.9-0.7c-0.1-0.1-0.3-0.1-0.4-0.2 c-0.4-0.2-0.8-0.4-1.3-0.5c-0.4-0.1-0.9-0.2-1.3-0.2h-0.1c-0.5,0-1,0.1-1.4,0.2c-0.5,0.1-0.9,0.3-1.3,0.5 c-0.1,0-0.3,0.1-0.4,0.2c-0.3,0.2-0.6,0.4-0.9,0.7c-0.1,0.1-0.1,0.1-0.2,0.2l0,0 c-0.1,0.1-0.2,0.2-0.3,0.3c-0.2,0.3-0.4,0.5-0.6,0.8c-0.1,0.1-0.1,0.2-0.2,0.4c-0.1,0.1-0.1,0.2-0.2,0.3 c-0.4,0.6-0.8,1.2-1.1,1.8c-0.1,0.2-0.1,0.3-0.2,0.5c-0.2,0.4-0.4,0.8-0.5,1.3c-0.1,0.4-0.3,0.8-0.4,1.2 c-0.4,1.2-0.8,2.4-1.4,3.7c-0.6,1.3-1.3,2.6-2.1,3.9c-0.3,0.5-0.6,1-0.8,1.5c-0.1,0.2-0.2,0.3-0.2,0.5 c0,0.1-0.1,0.1-0.1,0.2c-0.1,0.3-0.2,0.6-0.2,0.9c0,0.2,0,0.5,0.1,0.7c0,0.1,0,0.2,0.1,0.3c0.1,0.4,0.2,0.7,0.4,1 c0.1,0.1,0.1,0.2,0.2,0.3L29.1,23.5z"/>
    <path d="M44.6,9.4c-0.1-0.1-0.2-0.1-0.2-0.2l0,0c-0.1-0.1-0.2-0.2-0.3-0.3c-0.2-0.3-0.4-0.5-0.6-0.8c-0.1-0.1-0.1-0.2-0.2-0.4 c-0.1-0.1-0.1,0.2-0.2-0.3c-0.4-0.6-0.8-1.2-1.1-1.8c-0.1-0.2-0.1-0.3-0.2-0.5c-0.2-0.4-0.4-0.8-0.5-1.3c-0.1-0.4-0.3-0.8-0.4-1.2 c-0.4-1.2-0.8-2.4-1.4-3.7c-0.6-1.3-1.3-2.6-2.1-3.9c-0.8-1.3-1.5-2.6-2.1-3.9c-0.6-1.2-1-2.5-1.4-3.7c-0.1-0.4-0.2-0.8-0.4-1.2 c-0.1-0.5-0.3-0.9-0.5-1.3c-0.1-0.2-0.2-0.3-0.2-0.5c-0.3-0.6-0.7-1.2-1.1-1.8c-0.1-0.1-0.1-0.2-0.2-0.3 c-0.1-0.1-0.2-0.2-0.2-0.4c-0.2-0.3-0.4-0.5-0.6-0.8c-0.1-0.1-0.2-0.2-0.3-0.3l0,0c-0.1-0.1-0.2-0.1-0.2-0.2 c-0.3-0.3-0.6-0.5-0.9-0.7c-0.1-0.1-0.3-0.1-0.4-0.2c-0.4-0.2-0.8-0.4-1.3-0.5C27.6,0.1,27.1,0,26.7,0h-0.1 c-0.5,0-1,0.1-1.4,0.2c-0.5,0.1-0.9,0.3-1.3,0.5c-0.1,0-0.3,0.1-0.4,0.2c-0.3,0.2-0.6,0.4-0.9,0.7c-0.1,0.1-0.1,0.1-0.2,0.2l0,0 c-0.1,0.1-0.2,0.2-0.3,0.3c-0.2,0.3-0.4,0.5-0.6,0.8c-0.1,0.1-0.1,0.2-0.2,0.4c-0.1,0.1-0.1,0.2-0.2,0.3 c-0.4,0.6-0.8,1.2-1.1,1.8c-0.1,0.2-0.1,0.3-0.2,0.5c-0.2,0.4-0.4,0.8-0.5,1.3c-0.1,0.4-0.3,0.8-0.4,1.2 c-0.4,1.2-0.8,2.4-1.4,3.7c-0.6,1.3-1.3,2.6-2.1,3.9L44.6,9.4z"/>
  </svg>
);


export const ScaleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0 0 12 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c.607.072 1.213.15 1.819.227M5.25 4.97c-.607.072-1.213.15-1.819.227m15.338 4.482c.298.055.588.118.87.19m-1.74 0a47.17 47.17 0 0 1-1.74 0m-10.138-3.992c-.298.055-.588.118-.87.19m1.74 0a47.17 47.17 0 0 0 1.74 0M9 13.5h6m-3-3.75V6" />
  </svg>
);

export const CubeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
  </svg>
);

export const ClipboardDocumentListIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

export const UserGroupIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-3.741-5.458M12 12.75a3 3 0 100-6 3 3 0 000 6zm-7.5 3.75c0-1.02.438-1.924 1.175-2.575M12 21a9.094 9.094 0 003.741-.479 3 3 0 00-7.482 0A9.094 9.094 0 0012 21zm-3.741-.479A3 3 0 016 18.72m0 0c-.438.06-.87.113-1.312.15C2.966 19.035 2.25 18.187 2.25 17.25v-.9c0-.938.716-1.785 1.688-1.935a9.167 9.167 0 011.312-.15m0 0a9.019 9.019 0 003.262-3.262m0 0a9.019 9.019 0 013.262 3.262" />
  </svg>
);

export const UserMinusIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-5 h-5"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12.75 0a9 9 0 11-18 0 9 9 0 0118 0zM12 9.75a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5zm-3.28 5.408A5.964 5.964 0 008.25 15a5.964 5.964 0 003.47 1.058M15.75 15a5.965 5.965 0 00-3.47-1.058" />
  </svg>
);


export const ShareIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 4.186 2.25 2.25 0 000-4.186zm0 0c.487-.082 1.004-.138 1.54-.172M7.217 10.907c-.487.082-1.004.138-1.54.172M16.783 4.907a2.25 2.25 0 100 4.186 2.25 2.25 0 000-4.186zm0 0c.487.082 1.004.138 1.54.172M16.783 4.907c-.487.082-1.004.138-1.54.172M16.783 15.093a2.25 2.25 0 100 4.186 2.25 2.25 0 000-4.186zm0 0c.487.082 1.004.138 1.54.172m-1.54-.172c-.487.082-1.004.138-1.54.172M9.75 12.75a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.263 9.375c-.828-.501-1.84-.684-2.828-.528M13.263 14.625c-.828.501-1.84.684-2.828.528" />
  </svg>
);

export const ArchiveBoxIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h6M9 12h6m-6 5.25h6M5.25 21V3m0 18h13.5M3.75 3h16.5" />
     <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5h7.5v9h-7.5z" />
  </svg>
);

export const Cog8ToothIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h3m-3 12h3m-7.5-3.75L5.25 12l3.75-3.75M16.5 18.75L18.75 15l-2.25-2.25M6.75 12H17.25" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 17.25a5.25 5.25 0 100-10.5 5.25 5.25 0 000 10.5z" />
  </svg>
);

export const ShoppingCartIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
  </svg>
);

export const DocumentArrowDownIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);

export const TruckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125V14.25m-17.25 4.5h10.5M4.5 14.25L3 10.5m1.5 3.75L4.5 7.5h15l-1.5 3.75m0 0L18 14.25m-3-3.75h.008v.008H15v-.008zm0 0H9.75m5.25 0H15m2.25-3.375l1.5-1.5m-1.5 1.5l-1.5-1.5m0 0L15 3.75M3 10.5h18M3 7.5h18" />
  </svg>
);

export const ClipboardCheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.125 2.25h-4.5c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125v-9M10.125 2.25h.375a9 9 0 0 1 9 9v.375M10.125 2.25A3.375 3.375 0 0 1 13.5 5.625v1.5c0 .621.504 1.125 1.125 1.125h1.5a3.375 3.375 0 0 1 3.375 3.375M9 15l2.25 2.25L15 12" />
  </svg>
);

export const ChartBarIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A2.625 2.625 0 0 1 1.5 18.375V17.25c0-1.03.84-1.875 1.875-1.875h1.5M13.5 13.125C13.5 12.504 14.004 12 14.625 12h2.25c.621 0 1.125.504 1.125 1.125v6.75c0 .621-.504 1.125-1.125 1.125h-2.25a2.625 2.625 0 0 1-2.625-2.625V17.25c0-1.03.84-1.875 1.875-1.875h1.5M21 13.125C21 12.504 21.504 12 22.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75c0 .621-.504 1.125-1.125 1.125h-2.25a2.625 2.625 0 0 1-2.625-2.625V17.25c0-1.03.84-1.875 1.875-1.875h1.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8.625C3 8.004 3.504 7.5 4.125 7.5h2.25c.621 0 1.125.504 1.125 1.125v.75C7.5 10.246 6.996 10.75 6.375 10.75h-2.25A2.625 2.625 0 0 1 1.5 8.125V7.25c0-1.03.84-1.875 1.875-1.875h1.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 8.625C13.5 8.004 14.004 7.5 14.625 7.5h2.25c.621 0 1.125.504 1.125 1.125v.75c0 .621-.504 1.125-1.125 1.125h-2.25a2.625 2.625 0 0 1-2.625-2.625V7.25c0-1.03.84-1.875 1.875-1.875h1.5" />
  </svg>
);

export const TableCellsIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 6.75h17.25M3.375 12h17.25M3.375 17.25h17.25M5.25 3v18m8.25-18v18M18.75 3v18" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h.008v.008H3.75V6.75zm0 5.25h.008v.008H3.75v-.008zm0 5.25h.008v.008H3.75v-.008z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h.008v.008H8.25V6.75zm0 5.25h.008v.008H8.25v-.008zm0 5.25h.008v.008H8.25v-.008z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12.75 6.75h.008v.008H12.75V6.75zm0 5.25h.008v.008H12.75v-.008zm0 5.25h.008v.008H12.75v-.008z" />
  </svg>
);

export const ArrowLeftIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
  </svg>
);

export const DocumentTextIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25V6a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6v12a2.25 2.25 0 002.25 2.25h9.75M14.25 12H18m-3.75 3h3.75m-3.75-6h3.75M9 12H6.75M9 15H6.75M9 18H6.75" />
  </svg>
);


export const SortIcon: React.FC<{ className?: string; direction?: 'ascending' | 'descending' | 'none' }> = ({ className, direction = 'none' }) => {
  const baseClass = className || "w-4 h-4 inline-block ml-1 text-gray-400 dark:text-slate-500";
  if (direction === 'ascending') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`${baseClass} text-gray-700 dark:text-slate-200`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
      </svg>
    );
  }
  if (direction === 'descending') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`${baseClass} text-gray-700 dark:text-slate-200`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
      </svg>
    );
  }
  // Default unsorted icon (both arrows, subtle)
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={baseClass}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
    </svg>
  );
};

export const PowerIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5.636 5.636a9 9 0 1 0 12.728 0M12 3v9" />
  </svg>
);

export const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L1.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.25 12h.008v.008h-.008V12zm0 0h.008v.008h-.008V12zm-7.188-7.188h.008v.008h-.008V4.812zm0 14.376h.008v.008h-.008v-.008z" />
  </svg>
);

export const ArrowUturnLeftIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-5 h-5"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12H9" />
  </svg>
);
