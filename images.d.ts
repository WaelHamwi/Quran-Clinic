// Ambient declarations for static image assets imported via ES `import`.
// Metro resolves these to an opaque asset reference at bundle time; here we
// type the default export so `import logo from './logo.png'` compiles. SVGs are
// handled separately by react-native-svg-transformer's own types.
declare module '*.png' {
  const value: number;
  export default value;
}

declare module '*.jpg' {
  const value: number;
  export default value;
}
