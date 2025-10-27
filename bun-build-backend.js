await Bun.build({
  entrypoints: ["./backend/index.ts"],
  outdir: "dist-backend",
  target: "node",
  minify: true,
});
