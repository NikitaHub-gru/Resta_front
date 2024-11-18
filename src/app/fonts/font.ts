import localFont from "next/font/local";

const header_font = localFont({ 
    src: '../../app/fonts/HelveticaNeue-Bold.otf',
    variable: '--font-header'
  })

  export { header_font }

  const main_text_font = localFont({ 
    src: '../../app/fonts/HelveticaNeue-Light.otf',
    variable: '--font-main'
  })
  export { main_text_font }

